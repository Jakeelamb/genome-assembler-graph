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

PIPELINE_COMPONENT_FIELDS = {
    "goal_ids": "goal",
    "property_ids": "property",
    "primary_input_ids": "primary",
    "support_data_ids": "support",
    "algorithm_ids": "algorithm",
    "concept_ids": "concept",
    "module_ids": "module",
    "tool_ids": "tool",
    "stage_ids": "stage",
    "output_ids": "output",
    "metric_ids": "metric",
    "case_ids": "case",
}

TOOL_PROFILE_COMPONENT_FIELDS = {
    field: kind for field, kind in PIPELINE_COMPONENT_FIELDS.items() if field != "tool_ids"
}

TOOL_PROFILE_FIELDS = {
    **TOOL_PROFILE_COMPONENT_FIELDS,
    "related_tool_ids": "tool",
}

TOOL_PROFILE_REQUIRED_KEYS = (
    "linked_pipeline_ids",
    "step_pipeline_ids",
    *TOOL_PROFILE_FIELDS.keys(),
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


def append_unique(values: list[str], seen: set[str], item: str) -> None:
    if item in seen:
        return
    seen.add(item)
    values.append(item)


def compute_expected_tool_profiles(pipelines: list[dict], node_map: dict[str, dict]) -> dict[str, dict[str, list[str]]]:
    tool_ids = [node_id for node_id, node in node_map.items() if node.get("kind") == "tool"]
    expected = {
        tool_id: {
            "linked_pipeline_ids": [],
            "step_pipeline_ids": [],
            **{field: [] for field in TOOL_PROFILE_FIELDS},
        }
        for tool_id in tool_ids
    }
    seen = {
        tool_id: {field: set() for field in profile}
        for tool_id, profile in expected.items()
    }

    for pipeline in pipelines:
        if not isinstance(pipeline, dict):
            continue
        pipeline_id = pipeline.get("id")
        node_ids = pipeline.get("node_ids")
        step_ids = pipeline.get("step_ids")
        components = pipeline.get("components")
        if not pipeline_id or not isinstance(node_ids, list) or not isinstance(components, dict):
            continue

        node_tool_ids = [node_id for node_id in node_ids if node_id in expected]
        step_tool_ids = [step_id for step_id in step_ids if step_id in expected] if isinstance(step_ids, list) else []
        related_tool_ids = [tool_id for tool_id in components.get("tool_ids", []) if tool_id in expected]

        for tool_id in node_tool_ids:
            append_unique(expected[tool_id]["linked_pipeline_ids"], seen[tool_id]["linked_pipeline_ids"], pipeline_id)
        for tool_id in step_tool_ids:
            append_unique(expected[tool_id]["step_pipeline_ids"], seen[tool_id]["step_pipeline_ids"], pipeline_id)

        for tool_id in node_tool_ids:
            for field in TOOL_PROFILE_COMPONENT_FIELDS:
                component_ids = components.get(field, [])
                if not isinstance(component_ids, list):
                    continue
                for component_id in component_ids:
                    append_unique(expected[tool_id][field], seen[tool_id][field], component_id)

            for related_tool_id in related_tool_ids:
                if related_tool_id == tool_id:
                    continue
                append_unique(
                    expected[tool_id]["related_tool_ids"],
                    seen[tool_id]["related_tool_ids"],
                    related_tool_id,
                )

    return expected


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
    pipeline_map = {
        pipeline["id"]: pipeline for pipeline in graph["pipelines"] if isinstance(pipeline, dict) and "id" in pipeline
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

        for key in ("id", "label", "tagline", "description", "focus", "step_ids", "node_ids", "edge_ids", "source_ids", "components"):
            ensure(key in pipeline, f"Pipeline is missing required key: {key}", errors)
        if not all(key in pipeline for key in ("id", "step_ids", "node_ids", "edge_ids", "source_ids", "components")):
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

        components = pipeline["components"]
        ensure(isinstance(components, dict), f"Pipeline {pipeline['id']} components must be an object", errors)
        if not isinstance(components, dict):
            continue

        partition_ids: set[str] = set()
        for field, expected_kind in PIPELINE_COMPONENT_FIELDS.items():
            ensure(field in components, f"Pipeline {pipeline['id']} components missing {field}", errors)
            values = components.get(field, [])
            ensure(isinstance(values, list), f"Pipeline {pipeline['id']} components.{field} must be an array", errors)
            if not isinstance(values, list):
                continue
            ensure(len(values) == len(set(values)), f"Pipeline {pipeline['id']} components.{field} has duplicate ids", errors)
            for component_id in values:
                ensure(component_id in node_map, f"Pipeline {pipeline['id']} components.{field} references unknown node {component_id}", errors)
                if component_id not in node_map:
                    continue
                ensure(component_id in node_id_set, f"Pipeline {pipeline['id']} components.{field} references node outside node_ids: {component_id}", errors)
                ensure(
                    node_map[component_id]["kind"] == expected_kind,
                    f"Pipeline {pipeline['id']} components.{field} node {component_id} must have kind {expected_kind}",
                    errors,
                )
                ensure(
                    component_id not in partition_ids,
                    f"Pipeline {pipeline['id']} components reuse node {component_id} across categories",
                    errors,
                )
                partition_ids.add(component_id)

        ensure(
            partition_ids == node_id_set,
            f"Pipeline {pipeline['id']} components must partition node_ids exactly",
            errors,
        )

    expected_tool_profiles = compute_expected_tool_profiles(graph["pipelines"], node_map)

    for node in graph["nodes"]:
        if not isinstance(node, dict) or "id" not in node or "kind" not in node:
            continue

        if node["kind"] != "tool":
            ensure("tool_profile" not in node, f"Non-tool node {node['id']} must not define tool_profile", errors)
            continue

        ensure("tool_profile" in node, f"Tool node {node['id']} is missing tool_profile", errors)
        profile = node.get("tool_profile")
        ensure(isinstance(profile, dict), f"Tool node {node['id']} tool_profile must be an object", errors)
        if not isinstance(profile, dict):
            continue

        for key in TOOL_PROFILE_REQUIRED_KEYS:
            ensure(key in profile, f"Tool node {node['id']} tool_profile missing {key}", errors)

        expected_profile = expected_tool_profiles.get(node["id"])
        if expected_profile is None:
            errors.append(f"Tool node {node['id']} is missing from expected tool profile index")
            continue

        for field in TOOL_PROFILE_REQUIRED_KEYS:
            values = profile.get(field, [])
            ensure(isinstance(values, list), f"Tool node {node['id']} tool_profile.{field} must be an array", errors)
            if not isinstance(values, list):
                continue
            ensure(len(values) == len(set(values)), f"Tool node {node['id']} tool_profile.{field} has duplicate ids", errors)

        linked_pipeline_ids = profile.get("linked_pipeline_ids", [])
        step_pipeline_ids = profile.get("step_pipeline_ids", [])

        for pipeline_id in linked_pipeline_ids:
            ensure(pipeline_id in pipeline_map, f"Tool node {node['id']} tool_profile.linked_pipeline_ids references unknown pipeline {pipeline_id}", errors)
            if pipeline_id in pipeline_map:
                ensure(
                    node["id"] in pipeline_map[pipeline_id].get("node_ids", []),
                    f"Tool node {node['id']} tool_profile.linked_pipeline_ids pipeline {pipeline_id} does not include the tool in node_ids",
                    errors,
                )

        for pipeline_id in step_pipeline_ids:
            ensure(pipeline_id in pipeline_map, f"Tool node {node['id']} tool_profile.step_pipeline_ids references unknown pipeline {pipeline_id}", errors)
            if pipeline_id in pipeline_map:
                ensure(
                    node["id"] in pipeline_map[pipeline_id].get("step_ids", []),
                    f"Tool node {node['id']} tool_profile.step_pipeline_ids pipeline {pipeline_id} does not include the tool in step_ids",
                    errors,
                )

        ensure(
            set(step_pipeline_ids).issubset(set(linked_pipeline_ids)),
            f"Tool node {node['id']} tool_profile.step_pipeline_ids must be a subset of linked_pipeline_ids",
            errors,
        )

        ensure(
            linked_pipeline_ids == expected_profile["linked_pipeline_ids"],
            f"Tool node {node['id']} tool_profile.linked_pipeline_ids must match workflow-derived linked pipelines",
            errors,
        )
        ensure(
            step_pipeline_ids == expected_profile["step_pipeline_ids"],
            f"Tool node {node['id']} tool_profile.step_pipeline_ids must match workflow-derived step pipelines",
            errors,
        )

        for field, expected_kind in TOOL_PROFILE_FIELDS.items():
            values = profile.get(field, [])
            if not isinstance(values, list):
                continue
            for component_id in values:
                ensure(component_id in node_map, f"Tool node {node['id']} tool_profile.{field} references unknown node {component_id}", errors)
                if component_id not in node_map:
                    continue
                ensure(
                    node_map[component_id]["kind"] == expected_kind,
                    f"Tool node {node['id']} tool_profile.{field} node {component_id} must have kind {expected_kind}",
                    errors,
                )
                if field == "related_tool_ids":
                    ensure(component_id != node["id"], f"Tool node {node['id']} tool_profile.related_tool_ids must not include itself", errors)

            ensure(
                values == expected_profile[field],
                f"Tool node {node['id']} tool_profile.{field} must match workflow-derived {field}",
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
