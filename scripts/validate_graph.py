#!/usr/bin/env python3
"""Validate the curated graph JSON for shape and referential integrity."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Iterable


REQUIRED_TOP_LEVEL_KEYS = (
    "title",
    "description",
    "lanes",
    "nodes",
    "edges",
    "pipelines",
    "sources",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate genome assembler graph JSON."
    )
    parser.add_argument(
        "--input",
        default="data/genome_assembler_graph.json",
        help="Path to the graph JSON file relative to the repository root.",
    )
    return parser.parse_args()


def read_graph(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def ensure(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def duplicate_ids(records: Iterable[dict], label: str) -> list[str]:
    counts = Counter(record.get("id") for record in records)
    return [f"Duplicate {label} id: {record_id}" for record_id, count in counts.items() if record_id and count > 1]


def validate_graph(graph: dict) -> list[str]:
    errors: list[str] = []

    for key in REQUIRED_TOP_LEVEL_KEYS:
        ensure(key in graph, f"Missing top-level key: {key}", errors)

    if errors:
        return errors

    ensure(isinstance(graph["title"], str) and graph["title"], "title must be a non-empty string", errors)
    ensure(isinstance(graph["description"], str) and graph["description"], "description must be a non-empty string", errors)

    for key in ("lanes", "nodes", "edges", "pipelines", "sources"):
        ensure(isinstance(graph[key], list), f"{key} must be an array", errors)

    if errors:
        return errors

    errors.extend(duplicate_ids(graph["lanes"], "lane"))
    errors.extend(duplicate_ids(graph["nodes"], "node"))
    errors.extend(duplicate_ids(graph["edges"], "edge"))
    errors.extend(duplicate_ids(graph["pipelines"], "pipeline"))
    errors.extend(duplicate_ids(graph["sources"], "source"))

    lane_ids = {lane["id"] for lane in graph["lanes"] if isinstance(lane, dict) and "id" in lane}
    source_ids = {source["id"] for source in graph["sources"] if isinstance(source, dict) and "id" in source}
    node_map = {
        node["id"]: node for node in graph["nodes"] if isinstance(node, dict) and "id" in node
    }
    edge_map = {
        edge["id"]: edge for edge in graph["edges"] if isinstance(edge, dict) and "id" in edge
    }

    lane_rows: dict[str, set[int]] = {}
    for node in graph["nodes"]:
        ensure(isinstance(node, dict), "Each node must be an object", errors)
        if not isinstance(node, dict):
            continue
        for key in ("id", "label", "kind", "lane", "row"):
            ensure(key in node, f"Node is missing required key: {key}", errors)
        if not all(key in node for key in ("id", "kind", "lane", "row")):
            continue

        ensure(node["lane"] in lane_ids, f"Node {node['id']} references unknown lane {node['lane']}", errors)
        ensure(node["kind"] == node["lane"], f"Node {node['id']} kind {node['kind']} must match lane {node['lane']}", errors)
        ensure(isinstance(node["row"], int) and node["row"] >= 0, f"Node {node['id']} row must be a non-negative integer", errors)

        lane_row_set = lane_rows.setdefault(node["lane"], set())
        ensure(node["row"] not in lane_row_set, f"Lane {node['lane']} reuses row {node['row']}", errors)
        lane_row_set.add(node["row"])

        for source_id in node.get("source_ids", []):
            ensure(source_id in source_ids, f"Node {node['id']} references unknown source {source_id}", errors)

    for edge in graph["edges"]:
        ensure(isinstance(edge, dict), "Each edge must be an object", errors)
        if not isinstance(edge, dict):
            continue
        for key in ("id", "source", "target", "kind"):
            ensure(key in edge, f"Edge is missing required key: {key}", errors)
        if not all(key in edge for key in ("id", "source", "target")):
            continue

        ensure(edge["source"] in node_map, f"Edge {edge['id']} references unknown source node {edge['source']}", errors)
        ensure(edge["target"] in node_map, f"Edge {edge['id']} references unknown target node {edge['target']}", errors)
        for source_id in edge.get("source_ids", []):
            ensure(source_id in source_ids, f"Edge {edge['id']} references unknown source {source_id}", errors)

    lane_order = {lane["id"]: index for index, lane in enumerate(graph["lanes"]) if isinstance(lane, dict) and "id" in lane}

    for pipeline in graph["pipelines"]:
        ensure(isinstance(pipeline, dict), "Each pipeline must be an object", errors)
        if not isinstance(pipeline, dict):
            continue

        for key in ("id", "label", "tagline", "description", "focus", "step_ids", "node_ids", "edge_ids", "source_ids"):
            ensure(key in pipeline, f"Pipeline is missing required key: {key}", errors)
        if not all(key in pipeline for key in ("id", "step_ids", "node_ids", "edge_ids", "source_ids")):
            continue

        ensure(bool(pipeline["source_ids"]), f"Pipeline {pipeline['id']} must cite at least one source", errors)

        node_ids = pipeline["node_ids"]
        step_ids = pipeline["step_ids"]
        edge_ids = pipeline["edge_ids"]

        ensure(len(node_ids) == len(set(node_ids)), f"Pipeline {pipeline['id']} has duplicate node_ids", errors)
        ensure(len(step_ids) == len(set(step_ids)), f"Pipeline {pipeline['id']} has duplicate step_ids", errors)
        ensure(len(edge_ids) == len(set(edge_ids)), f"Pipeline {pipeline['id']} has duplicate edge_ids", errors)

        for source_id in pipeline["source_ids"]:
            ensure(source_id in source_ids, f"Pipeline {pipeline['id']} references unknown source {source_id}", errors)

        for node_id in node_ids:
            ensure(node_id in node_map, f"Pipeline {pipeline['id']} references unknown node {node_id}", errors)
        for step_id in step_ids:
            ensure(step_id in node_map, f"Pipeline {pipeline['id']} references unknown step node {step_id}", errors)
            ensure(step_id in node_ids, f"Pipeline {pipeline['id']} step {step_id} is missing from node_ids", errors)
        for edge_id in edge_ids:
            ensure(edge_id in edge_map, f"Pipeline {pipeline['id']} references unknown edge {edge_id}", errors)

        node_id_set = set(node_ids)
        step_lane_positions = [
            lane_order[node_map[step_id]["lane"]]
            for step_id in step_ids
            if step_id in node_map and node_map[step_id]["lane"] in lane_order
        ]
        ensure(
            step_lane_positions == sorted(step_lane_positions),
            f"Pipeline {pipeline['id']} step_ids must move monotonically through lanes",
            errors,
        )
        for edge_id in edge_ids:
            edge = edge_map.get(edge_id)
            if edge is None:
                continue
            ensure(
                edge["source"] in node_id_set and edge["target"] in node_id_set,
                f"Pipeline {pipeline['id']} edge {edge_id} connects nodes outside node_ids",
                errors,
            )
            ensure(
                bool(edge.get("source_ids")),
                f"Pipeline {pipeline['id']} edge {edge_id} must carry source_ids",
                errors,
            )

    return errors


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parent.parent
    input_path = (root / args.input).resolve()
    graph = read_graph(input_path)

    errors = validate_graph(graph)
    if errors:
        print(f"Validation failed for {input_path}", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        raise SystemExit(1)

    print(
        "Validation passed: "
        f"{len(graph['nodes'])} nodes, "
        f"{len(graph['edges'])} edges, "
        f"{len(graph['pipelines'])} pipelines, "
        f"{len(graph['sources'])} sources"
    )


if __name__ == "__main__":
    main()
