# Genome Assembler Knowledge Graph

A standalone, ontology-first map of modern genome assemblers.

This repository starts with a lightweight static web app and a curated graph dataset so you can:

- see how assembly tools decompose into data types, algorithmic primitives, functional modules, and stages
- highlight individual pipelines such as `hifiasm`, `Verkko`, `Flye`, `LJA`, `HiCanu`, and `Shasta`
- inspect how auxiliary data like `ONT ultra-long`, `Hi-C`, and `trio` plug into specific modules
- share a specific pipeline or node view with a deep link
- extend the graph into Neo4j, Memgraph, ArangoDB, or a backend API later

## Project Shape

- `data/genome_assembler_graph.json`: curated graph data, ontology metadata, pipeline paths, and paper links
- `schema/genome_assembler_graph.schema.json`: JSON schema for the graph contract
- `index.html`: single-page interface
- `styles.css`: layout and visual system
- `app.js`: graph rendering, selection state, and highlighting logic
- `scripts/validate_graph.py`: structural and referential-integrity checks

## Running It

The app is dependency-free. You can either open `index.html` directly or serve the repo locally:

```bash
cd /home/jake/Projects/genome-assembler-graph
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Deep links are supported:

- `http://localhost:8000/?pipeline=pipeline_verkko_hifi_ul`
- `http://localhost:8000/?node=tool_hifiasm`

Before changing the dataset, validate it:

```bash
cd /home/jake/Projects/genome-assembler-graph
python3 scripts/validate_graph.py
```

## Current Ontology

The graph is organized into these lanes:

1. `Assembly Goal`
2. `Primary Reads`
3. `Support Data`
4. `Algorithmic Primitive`
5. `Functional Module`
6. `Assembler`
7. `Pipeline Stage`
8. `Output`

The initial dataset is intentionally curated rather than exhaustive. The priority is interpretability:

- the graph is small enough to read
- every highlighted path corresponds to a coherent algorithm/module story
- tools are broken into modular pieces rather than treated as black boxes
- nodes, pipelines, and pipeline-defining edges carry source citations
- the graph can be validated before export or UI work

## Pipeline Coverage

The first version includes curated paths for:

- `hifiasm` on PacBio HiFi
- `hifiasm` with Hi-C/trio support
- `Verkko` on HiFi + ONT ultra-long
- `hifiasm-UL` on HiFi + ONT ultra-long
- `hifiasm-ONT` on ONT simplex reads
- `Flye` on noisy long reads
- `LJA` on HiFi reads
- `HiCanu` on HiFi reads
- `Shasta` on ONT reads

It now focuses on algorithmic primitives and functional modules such as haplotype partitioning, ultra-long bridging, repeat disambiguation, variable-k refinement, marker compression, homopolymer compression, ONT-specific graph cleaning, seeding/indexing, graph cleanup, consensus refinement, and scaffolding.

## Next Good Steps

- add organisms, ploidy classes, and chemistry/basecaller versions as first-class nodes
- add timeline mode to show method evolution
- add richer Neo4j labels and typed module families for overlap, graph, and finishing subroutines
- add full edge coverage for source provenance beyond the current pipeline-defining relations
- add comparison mode for two pipelines at once

## Source Notes

The current dataset uses selected primary papers plus a recent review as the seed knowledge base. Those URLs are embedded in the graph data and surfaced in the UI.

## Exporting The Graph

The repository ships with a small export script for graph-database ingestion:

```bash
cd /home/jake/Projects/genome-assembler-graph
python3 scripts/export_graph_csv.py --out export/csv
```

It writes:

- `nodes.csv`
- `edges.csv`
- `sources.csv`
- `pipelines.csv`
- `pipeline_nodes.csv`
- `pipeline_edges.csv`

Those tables are generic on purpose so they can be loaded into Neo4j, DuckDB, SQLite, or a notebook without rewriting the ontology first.
