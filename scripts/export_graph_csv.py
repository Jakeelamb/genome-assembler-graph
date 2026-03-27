#!/usr/bin/env python3
"""Export the curated graph JSON into flat CSV tables."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export genome assembler graph JSON into CSV tables."
    )
    parser.add_argument(
        "--input",
        default="data/genome_assembler_graph.json",
        help="Path to the source graph JSON file.",
    )
    parser.add_argument(
        "--out",
        default="export/csv",
        help="Directory where CSV files will be written.",
    )
    return parser.parse_args()


def read_graph(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parent.parent
    input_path = (root / args.input).resolve()
    output_dir = (root / args.out).resolve()

    graph = read_graph(input_path)

    node_rows = []
    for node in graph["nodes"]:
        node_rows.append(
            {
                "id": node["id"],
                "label": node["label"],
                "kind": node["kind"],
                "lane": node["lane"],
                "row": node["row"],
                "summary": node.get("summary", ""),
                "source_ids": "|".join(node.get("source_ids", [])),
            }
        )

    edge_rows = []
    for edge in graph["edges"]:
        edge_rows.append(
            {
                "id": edge["id"],
                "source": edge["source"],
                "target": edge["target"],
                "kind": edge["kind"],
                "source_ids": "|".join(edge.get("source_ids", [])),
            }
        )

    source_rows = []
    for source in graph["sources"]:
        source_rows.append(
            {
                "id": source["id"],
                "label": source["label"],
                "url": source["url"],
            }
        )

    pipeline_rows = []
    pipeline_node_rows = []
    pipeline_edge_rows = []
    for pipeline in graph["pipelines"]:
        pipeline_rows.append(
            {
                "id": pipeline["id"],
                "label": pipeline["label"],
                "tagline": pipeline["tagline"],
                "focus": pipeline["focus"],
                "description": pipeline["description"],
                "source_ids": "|".join(pipeline.get("source_ids", [])),
            }
        )

        for order, node_id in enumerate(pipeline.get("node_ids", []), start=1):
            pipeline_node_rows.append(
                {
                    "pipeline_id": pipeline["id"],
                    "node_id": node_id,
                    "order_hint": order,
                }
            )

        for order, edge_id in enumerate(pipeline.get("edge_ids", []), start=1):
            pipeline_edge_rows.append(
                {
                    "pipeline_id": pipeline["id"],
                    "edge_id": edge_id,
                    "order_hint": order,
                }
            )

    write_csv(
        output_dir / "nodes.csv",
        ["id", "label", "kind", "lane", "row", "summary", "source_ids"],
        node_rows,
    )
    write_csv(
        output_dir / "edges.csv",
        ["id", "source", "target", "kind", "source_ids"],
        edge_rows,
    )
    write_csv(
        output_dir / "sources.csv",
        ["id", "label", "url"],
        source_rows,
    )
    write_csv(
        output_dir / "pipelines.csv",
        ["id", "label", "tagline", "focus", "description", "source_ids"],
        pipeline_rows,
    )
    write_csv(
        output_dir / "pipeline_nodes.csv",
        ["pipeline_id", "node_id", "order_hint"],
        pipeline_node_rows,
    )
    write_csv(
        output_dir / "pipeline_edges.csv",
        ["pipeline_id", "edge_id", "order_hint"],
        pipeline_edge_rows,
    )

    print(f"Wrote CSV exports to {output_dir}")


if __name__ == "__main__":
    main()
