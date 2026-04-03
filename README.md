# Genome Assembler Knowledge Graph

A standalone, ontology-first map of modern genome assemblers.

This repository ships as a lightweight static web app plus a curated graph dataset so you can:

- see how assembly tools decompose into data types, algorithmic primitives, functional modules, and stages
- inspect how curated assemblers and workflows such as `hifiasm`, `Verkko`, `Flye`, `LJA`, `HiCanu`, and `Shasta` are represented in the graph
- inspect how auxiliary data like `ONT ultra-long`, `Hi-C`, and `trio` plug into specific modules
- share a node or multi-node selection with a deep link
- extend the graph into Neo4j, Memgraph, ArangoDB, or a backend API later

## Project Shape

- `data/genome_assembler_graph.json`: curated graph data, ontology metadata, pipeline paths, and paper links
- `schema/genome_assembler_graph.schema.json`: JSON schema for the graph contract
- `index.html`: single-page interface
- `styles.css`: layout and visual system
- `app.js`: graph rendering, selection state, and highlighting logic
- `scripts/validate_graph.py`: structural and referential-integrity checks

## Running It Locally

The app is dependency-free, but it needs to be served over HTTP so the browser can load `data/genome_assembler_graph.json`:

```bash
cd /home/jake/Projects/genome-assembler-graph
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Deep links are supported:

- `http://localhost:8000/?node=tool_hifiasm`
- `http://localhost:8000/?nodes=tool_hifiasm,tool_verkko`
- `http://localhost:8000/#node=tool_hifiasm` (legacy hash format)

## Publishing On GitHub Pages

This repo is a plain static site, so GitHub Pages can publish it directly from the `main` branch root.

1. Push the repo to GitHub and make the repository public.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Set the branch to `main` and the folder to `/ (root)`.
5. Save the settings.

For the current remote, the published site URL will be:

- `https://jakeelamb.github.io/genome-assembler-graph/`

Before changing the dataset, validate it:

```bash
cd /home/jake/Projects/genome-assembler-graph
python3 scripts/validate_graph.py
```

## Current Ontology

The graph is organized into these lanes:

1. `Assembly Goal`
2. `Genome Property`
3. `Primary Reads`
4. `Support Data`
5. `Algorithmic Primitive`
6. `Assembly Concept`
7. `Functional Module`
8. `Tool`
9. `Pipeline Stage`
10. `Output`
11. `Evaluation Metric`
12. `Case Study`

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
