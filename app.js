const METRIC_KEYS = [
  "_pagerank",
  "_degree_centrality",
  "_betweenness_centrality",
  "_descendant_ratio",
  "_prerequisite_ratio",
  "_reachability_ratio",
];

const BACKBONE_SCOPE_OPTIONS = [
  {
    id: "all",
    label: "All Assembly",
    description: "Cross-cutting bridge nodes across the whole curated dependency graph.",
  },
  {
    id: "long_read_de_novo",
    label: "Long-Read Overview",
    description: "Umbrella view across long-read assembly core, finishing, and scaffolding families.",
    includeScopeIds: ["long_read_core", "long_read_finishing", "long_read_scaffolding"],
  },
  {
    id: "long_read_core",
    label: "Long-Read Core",
    description: "Graph construction, repeat resolution, phasing, heterozygosity cleanup, and draft assembly from long reads.",
  },
  {
    id: "long_read_finishing",
    label: "Long-Read Finishing",
    description: "Polishing, gap closing, and read-correction paths that refine or repair long-read assemblies.",
  },
  {
    id: "long_read_scaffolding",
    label: "Long-Read Scaffolding",
    description: "Draft scaffolding, long-range anchoring, and bridge-heavy long-read upgrade workflows.",
  },
  {
    id: "short_read_hybrid",
    label: "Short-Read Overview",
    description: "Curated bridge map from short-read graph assembly through finishing, scaffolding, and hybrid upgrade.",
    includeScopeIds: ["short_read_core", "short_read_finishing", "short_read_scaffolding", "hybrid_upgrade"],
  },
  {
    id: "assembly_universe",
    label: "Assembly Universe",
    description: "Shared assembly spine with short-read bridges on the left and long-read bridges on the right.",
    includeScopeIds: ["short_read_hybrid", "long_read_de_novo"],
  },
  {
    id: "short_read_core",
    label: "Short-Read Core",
    description: "De Bruijn graph, single-cell, and short-read-first assembly primitives built around graph construction.",
  },
  {
    id: "short_read_finishing",
    label: "Short-Read Finishing",
    description: "Short-read polishing and gap-closing paths that refine assemblies without changing the core assembly strategy.",
  },
  {
    id: "short_read_scaffolding",
    label: "Short-Read Scaffolding",
    description: "Paired-end and mate-pair scaffolding workflows that extend fragmented draft assemblies.",
  },
  {
    id: "hybrid_upgrade",
    label: "Hybrid Upgrade",
    description: "Short-read plus long-read or special-support upgrade paths that bridge into hybrid assembly and polishing.",
  },
  {
    id: "chromosome_scale",
    label: "Chromosome Scale",
    description: "Hi-C, linkage-map, and long-range anchoring workflows.",
  },
  {
    id: "metagenome",
    label: "Metagenome + MAG",
    description: "Metagenome assembly, binning, viral recovery, and MAG curation.",
  },
  {
    id: "pangenome",
    label: "Pangenome",
    description: "Graph induction, pangenome construction, and graph analytics.",
  },
  {
    id: "organelle",
    label: "Organelle",
    description: "Organelle and plastome assembly paths.",
  },
  {
    id: "qc_annotation",
    label: "QC + Validation",
    description: "Validation, contamination screening, benchmarking, basecalling, and variant-calling QC.",
  },
  {
    id: "annotation",
    label: "Annotation",
    description: "Transcript-backed annotation and eukaryotic gene-model recovery.",
  },
];

const DEFAULT_BACKBONE_SCOPE_ID = "all";
const BACKBONE_BASE_CATEGORY_IDS = new Set([
  "goal",
  "primary",
  "support",
  "algorithm",
  "concept",
  "module",
  "stage",
]);
const BACKBONE_PROJECTION_CATEGORY_IDS = new Set([
  ...BACKBONE_BASE_CATEGORY_IDS,
  "tool",
  "output",
]);
const BACKBONE_INTERIOR_KIND_BONUS = {
  algorithm: 0.12,
  concept: 0.1,
  module: 0.12,
  stage: 0.08,
  support: 0.04,
  primary: 0.03,
  goal: 0.02,
};
const BACKBONE_CORE_KIND_CAPS = {
  goal: 3,
  primary: 3,
  support: 3,
  algorithm: 6,
  concept: 2,
  module: 8,
  stage: 6,
};
const BACKBONE_OVERVIEW_KIND_CAPS = {
  primary: 2,
  support: 2,
  algorithm: 3,
  concept: 1,
  module: 4,
  stage: 4,
};
const BACKBONE_KEY_KIND_CAPS = {
  algorithm: 4,
  module: 3,
  stage: 2,
  concept: 2,
  support: 1,
  primary: 1,
  goal: 0,
};
const BACKBONE_LANE_ORDER = [
  "goal",
  "property",
  "primary",
  "support",
  "algorithm",
  "concept",
  "module",
  "tool",
  "stage",
  "output",
  "metric",
];
const BACKBONE_AGGREGATE_SCOPE_CONFIG = {
  assembly_universe: {
    layoutMode: "branch_universe",
    overviewCoreLimit: 14,
    rootSeedLimit: 0,
    leafSeedLimit: 0,
    minSharedChildScopes: 1,
    keyNodeLimit: 12,
    recurringNodeLimit: 10,
    focusKeyLimit: 5,
    focusRecurringLimit: 5,
    promotedConnectorLimit: 5,
    branchScopeIds: {
      short: "short_read_hybrid",
      long: "long_read_de_novo",
    },
    branchCenters: {
      short: -360,
      shared: 0,
      long: 360,
    },
    branchLaneSpacing: 18,
    forcedNodeIds: [
      "read_paired_end",
      "algorithm_variable_coverage_dbg",
      "stage_graph",
      "module_graph_cleanup",
      "stage_consensus",
      "module_consensus_refinement",
      "stage_polish",
      "module_gap_closing",
      "module_scaffolding",
      "module_paired_read_scaffolding",
      "module_hybrid_graph_bridging",
      "read_hifi",
      "read_ont_simplex",
      "algorithm_olc",
      "module_long_range_phasing",
      "algorithm_anchor_scaffold",
    ],
    keyNodeIds: [
      "read_paired_end",
      "algorithm_variable_coverage_dbg",
      "stage_graph",
      "module_graph_cleanup",
      "stage_consensus",
      "module_consensus_refinement",
      "stage_polish",
      "module_gap_closing",
      "module_scaffolding",
      "read_hifi",
      "algorithm_olc",
      "module_hybrid_graph_bridging",
    ],
    recurringNodeIds: [
      "stage_graph",
      "module_graph_cleanup",
      "stage_consensus",
      "module_consensus_refinement",
      "stage_polish",
      "module_gap_closing",
      "module_scaffolding",
      "module_paired_read_scaffolding",
      "module_hybrid_graph_bridging",
      "algorithm_anchor_scaffold",
    ],
    branchOverrides: {
      read_paired_end: "short",
      algorithm_variable_coverage_dbg: "short",
      module_paired_read_scaffolding: "short",
      module_hybrid_graph_bridging: "shared",
      stage_graph: "shared",
      module_graph_cleanup: "shared",
      stage_consensus: "shared",
      module_consensus_refinement: "shared",
      stage_polish: "shared",
      module_gap_closing: "shared",
      module_scaffolding: "shared",
      read_hifi: "long",
      read_ont_simplex: "long",
      algorithm_olc: "long",
      module_long_range_phasing: "long",
      algorithm_anchor_scaffold: "long",
    },
    childPriorityByScopeId: {
      short_read_hybrid: [
        "read_paired_end",
        "algorithm_variable_coverage_dbg",
        "stage_graph",
        "module_graph_cleanup",
        "stage_consensus",
        "module_consensus_refinement",
        "module_paired_read_scaffolding",
        "module_hybrid_graph_bridging",
      ],
      long_read_de_novo: [
        "read_hifi",
        "read_ont_simplex",
        "algorithm_olc",
        "stage_graph",
        "module_graph_cleanup",
        "stage_consensus",
        "module_consensus_refinement",
        "module_long_range_phasing",
        "algorithm_anchor_scaffold",
      ],
    },
  },
  short_read_hybrid: {
    overviewCoreLimit: 12,
    rootSeedLimit: 0,
    leafSeedLimit: 0,
    minSharedChildScopes: 2,
    keyNodeLimit: 10,
    recurringNodeLimit: 8,
    focusKeyLimit: 4,
    focusRecurringLimit: 4,
    promotedConnectorLimit: 4,
    forcedNodeIds: [
      "read_paired_end",
      "stage_graph",
      "module_graph_cleanup",
      "algorithm_variable_coverage_dbg",
      "stage_consensus",
      "module_consensus_refinement",
      "stage_polish",
      "module_short_read_polishing",
      "module_gap_closing",
      "support_fragmented_draft",
      "stage_anchor",
      "module_paired_read_scaffolding",
      "module_hybrid_graph_bridging",
      "algorithm_hybrid_dbg_olc",
    ],
    keyNodeIds: [
      "read_paired_end",
      "stage_graph",
      "algorithm_variable_coverage_dbg",
      "module_graph_cleanup",
      "stage_consensus",
      "module_consensus_refinement",
      "stage_polish",
      "module_gap_closing",
      "module_paired_read_scaffolding",
      "module_hybrid_graph_bridging",
    ],
    recurringNodeIds: [
      "read_paired_end",
      "stage_graph",
      "module_graph_cleanup",
      "stage_polish",
      "module_short_read_polishing",
      "module_gap_closing",
      "module_paired_read_scaffolding",
      "module_hybrid_graph_bridging",
    ],
    childPriorityByScopeId: {
      short_read_core: [
        "algorithm_variable_coverage_dbg",
        "stage_graph",
        "module_graph_cleanup",
        "module_memory_partitioning",
        "module_consensus_refinement",
      ],
      short_read_finishing: [
        "stage_polish",
        "module_short_read_polishing",
        "module_gap_closing",
        "stage_consensus",
        "module_consensus_refinement",
      ],
      short_read_scaffolding: [
        "support_fragmented_draft",
        "stage_anchor",
        "module_paired_read_scaffolding",
        "algorithm_paired_link_scaffolding",
        "module_scaffolding",
      ],
      hybrid_upgrade: [
        "module_hybrid_graph_bridging",
        "algorithm_hybrid_dbg_olc",
        "module_hybrid_backbone_construction",
        "module_short_read_polishing",
        "stage_consensus",
      ],
    },
  },
};
const BACKBONE_SCOPE_OPTION_MAP = new Map(BACKBONE_SCOPE_OPTIONS.map((scope) => [scope.id, scope]));

const DEFAULT_NODE_ID = "tool_hifiasm";
const START_HERE_ITEMS = [
  {
    id: "tool_hifiasm",
    title: "hifiasm workflow",
    description: "View the curated HiFi phased-assembly path.",
  },
  {
    id: "tool_verkko",
    title: "Verkko workflow",
    description: "View the curated HiFi plus ONT ultra-long path.",
  },
  {
    id: "support_hic",
    title: "Hi-C support-data view",
    description: "View paths that include long-range contact data.",
  },
  {
    id: "output_chr_anchor",
    title: "Chromosome-scale output view",
    description: "View the output node and linked workflow components.",
  },
];

const PIPELINE_COMPONENT_GROUPS = [
  { title: "Assembly goals and properties", fields: ["goal_ids", "property_ids"] },
  { title: "Primary inputs", fields: ["primary_input_ids"] },
  { title: "Support data", fields: ["support_data_ids"] },
  { title: "Algorithms", fields: ["algorithm_ids"] },
  { title: "Concepts", fields: ["concept_ids"] },
  { title: "Modules", fields: ["module_ids"] },
  { title: "Tools", fields: ["tool_ids"] },
  { title: "Stages", fields: ["stage_ids"] },
  { title: "Outputs", fields: ["output_ids"] },
  { title: "Metrics", fields: ["metric_ids", "case_ids"] },
];

const TOOL_PROFILE_GROUPS = [
  { title: "Assembly goals and properties", fields: ["goal_ids", "property_ids"] },
  { title: "Primary inputs", fields: ["primary_input_ids"] },
  { title: "Support data", fields: ["support_data_ids"] },
  { title: "Algorithms and concepts", fields: ["algorithm_ids", "concept_ids"] },
  { title: "Modules and stages", fields: ["module_ids", "stage_ids"] },
  { title: "Outputs", fields: ["output_ids"] },
  { title: "Metrics", fields: ["metric_ids", "case_ids"] },
  { title: "Other linked tools", fields: ["related_tool_ids"] },
];

const TOOL_TRAIT_FILTER_GROUPS = [
  { field: "primary_input_ids", title: "Primary Inputs" },
  { field: "support_data_ids", title: "Support Data" },
  { field: "property_ids", title: "Genome Properties" },
  { field: "goal_ids", title: "Assembly Goals" },
  { field: "output_ids", title: "Outputs" },
];
const TOOL_PROFILE_COMPONENT_FIELDS = [
  "goal_ids",
  "property_ids",
  "primary_input_ids",
  "support_data_ids",
  "algorithm_ids",
  "concept_ids",
  "module_ids",
  "stage_ids",
  "output_ids",
  "metric_ids",
  "case_ids",
];
const TOOL_PROFILE_FIELDS = [...TOOL_PROFILE_COMPONENT_FIELDS, "related_tool_ids"];

function traitFilterKey(field, nodeId) {
  return `${field}::${nodeId}`;
}

function parseTraitFilterKey(key) {
  const separatorIndex = key.indexOf("::");
  if (separatorIndex === -1) {
    return { field: "", nodeId: "" };
  }
  return {
    field: key.slice(0, separatorIndex),
    nodeId: key.slice(separatorIndex + 2),
  };
}

const CATEGORY_COLORS = {
  goal: "#f2c86b",
  property: "#f59f86",
  primary: "#69c8b3",
  support: "#6eb5f7",
  algorithm: "#ff8f68",
  concept: "#f07bc1",
  module: "#ffb4c7",
  tool: "#c89cff",
  stage: "#7fdbe7",
  output: "#d2e36d",
  metric: "#88d66c",
  case: "#f6d36f",
};

const SEARCH_DISCOVERY_GROUPS = [
  {
    title: "Tools",
    ids: ["tool_hifiasm", "tool_verkko", "tool_metaspades", "tool_megahit", "tool_semibin2"],
  },
  {
    title: "Algorithms",
    ids: ["algorithm_phased_graph", "algorithm_olc", "algorithm_repeat_graph"],
  },
  {
    title: "Outputs",
    ids: ["output_chr_anchor", "output_phased", "output_mag_bins"],
  },
  {
    title: "Stages",
    ids: ["stage_graph", "stage_phase", "stage_qc"],
  },
];

const state = {
  raw: null,
  prepared: null,
  graph: null,
  rendererMode: null,
  visibleCategories: new Set(),
  searchDraft: "",
  searchMenuOpen: false,
  searchActiveIndex: -1,
  selectedNodeIds: new Set(),
  primarySelectionId: null,
  viewMode: "full",
  backboneScopeId: DEFAULT_BACKBONE_SCOPE_ID,
  layout: "force",
  nodeColorMode: "category",
  nodeSizeMode: "default",
  showPrerequisites: true,
  showDependents: false,
  activePipelineId: null,
  activeTraitFilters: new Set(),
  settingsOpen: false,
  settingsTab: "graph",
  graphError: null,
  selectionSource: null,
  derived: null,
  derivedDirty: true,
};

const refs = {
  graphCanvas: document.querySelector("#graph-canvas"),
  searchSection: document.querySelector("#search-section"),
  search: document.querySelector("#search"),
  searchResults: document.querySelector("#search-results"),
  stats: document.querySelector("#stats"),
  graphViewSelect: document.querySelector("#graph-view-select"),
  backboneScopeSelect: document.querySelector("#backbone-scope-select"),
  layoutSelect: document.querySelector("#layout-select"),
  recenterBtn: document.querySelector("#recenter-btn"),
  panelsBtn: document.querySelector("#panels-btn"),
  settingsBtn: document.querySelector("#settings-btn"),
  settingsClose: document.querySelector("#settings-close"),
  settingsShell: document.querySelector("#settings-shell"),
  settingsGraphTab: document.querySelector("#settings-graph-tab"),
  settingsFiltersTab: document.querySelector("#settings-filters-tab"),
  settingsGraphPane: document.querySelector("#settings-graph-pane"),
  settingsFiltersPane: document.querySelector("#settings-filters-pane"),
  legend: document.querySelector("#legend"),
  traitFilterShell: document.querySelector("#trait-filter-shell"),
  nodeColoringSelect: document.querySelector("#node-coloring-select"),
  nodeSizingSelect: document.querySelector("#node-sizing-select"),
  resetBtn: document.querySelector("#reset-btn"),
  screenshotBtn: document.querySelector("#screenshot-btn"),
  copyLinkBtn: document.querySelector("#copy-link-btn"),
  infoBody: document.querySelector("#info-body"),
  analyticsBody: document.querySelector("#analytics-body"),
  sidePanels: document.querySelector("#side-panels"),
  infoPanel: document.querySelector("#info-panel"),
  analyticsPanel: document.querySelector("#analytics-panel"),
  infoToggle: document.querySelector("#info-toggle"),
  analyticsToggle: document.querySelector("#analytics-toggle"),
  toast: document.querySelector("#toast"),
};

let toastTimer = null;
let clickTimer = null;

boot().catch((error) => {
  refs.infoBody.innerHTML = `
    <div class="detail-stack">
      <h2 class="detail-heading">Failed To Load Explorer</h2>
      <p class="info-copy">${escapeHtml(error.message)}</p>
    </div>
  `;
  refs.analyticsBody.innerHTML = "";
  console.error(error);
});

async function boot() {
  state.raw = await loadGraphData();
  state.prepared = prepareData(state.raw);
  state.visibleCategories = new Set(state.prepared.categories.map((category) => category.id));

  initUi();
  renderBackboneScopeOptions();
  renderSettingsFilters();
  try {
    initGraph();
  } catch (error) {
    state.graphError = error;
    console.warn("Graph renderer unavailable:", error);
  }
  if (!applyUrlState()) {
    applyLandingSelection();
  }
  renderLegend();
  if (state.graph) {
    rebuildGraph({ zoom: true });
    if (state.primarySelectionId) {
      scheduleSelectionFocus();
    }
  } else {
    renderStats();
  }
  renderPanels();
  syncControls();
}

async function loadGraphData() {
  const dataUrl = new URL("./data/genome_assembler_graph.json", window.location.href);

  try {
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading graph data`);
    }
    return await response.json();
  } catch (error) {
    if (window.location.protocol === "file:") {
      throw new Error(
        "This explorer must be served over http:// or https:// so the browser can load the graph data. Run `python3 -m http.server 8000` in the repo root or open the GitHub Pages URL."
      );
    }
    throw error;
  }
}

function initUi() {
  refs.search.addEventListener("focus", () => {
    state.searchMenuOpen = true;
    state.searchActiveIndex = currentSearchOptions().length ? 0 : -1;
    renderSearchResults();
  });

  refs.search.addEventListener("input", (event) => {
    state.searchDraft = event.target.value;
    state.searchMenuOpen = true;
    state.searchActiveIndex = currentSearchOptions().length ? 0 : -1;
    renderSearchResults();
  });

  refs.search.addEventListener("keydown", (event) => {
    const suggestions = currentSearchOptions();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!suggestions.length) {
        return;
      }
      state.searchMenuOpen = true;
      state.searchActiveIndex =
        state.searchActiveIndex < 0 ? 0 : (state.searchActiveIndex + 1) % suggestions.length;
      renderSearchResults();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.length) {
        return;
      }
      state.searchMenuOpen = true;
      state.searchActiveIndex =
        state.searchActiveIndex < 0
          ? suggestions.length - 1
          : (state.searchActiveIndex - 1 + suggestions.length) % suggestions.length;
      renderSearchResults();
      return;
    }

    if (event.key === "Enter") {
      if (!suggestions.length) {
        return;
      }
      event.preventDefault();
      const index = state.searchActiveIndex >= 0 ? state.searchActiveIndex : 0;
      commitSearchSelection(suggestions[index].id);
      return;
    }

    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    if (state.searchDraft) {
      refs.search.value = "";
      state.searchDraft = "";
      state.searchMenuOpen = true;
      state.searchActiveIndex = currentSearchOptions().length ? 0 : -1;
      renderSearchResults();
      return;
    }

    state.searchMenuOpen = false;
    state.searchActiveIndex = -1;
    renderSearchResults();
    refs.search.blur();
  });

  refs.searchResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-search-target]");
    if (!button) {
      return;
    }
    commitSearchSelection(button.getAttribute("data-search-target"));
  });

  document.addEventListener("pointerdown", (event) => {
    if (refs.searchSection.contains(event.target)) {
      return;
    }
    state.searchMenuOpen = false;
    state.searchActiveIndex = -1;
    renderSearchResults();
  });

  refs.layoutSelect.addEventListener("change", (event) => {
    const nextLayout = event.target.value;
    if (nextLayout === "radial" && !state.primarySelectionId) {
      refs.layoutSelect.value = state.layout;
      return;
    }
    state.layout = nextLayout;
    applyLayout({ zoom: true });
    syncControls();
  });

  refs.graphViewSelect.addEventListener("change", (event) => {
    setViewMode(event.target.value);
  });

  refs.backboneScopeSelect.addEventListener("change", (event) => {
    setBackboneScope(event.target.value);
  });

  refs.recenterBtn.addEventListener("click", () => {
    recenterGraphView();
  });

  refs.panelsBtn.addEventListener("click", () => {
    setPanelsHidden(!panelsAreHidden());
  });

  refs.settingsBtn.addEventListener("click", () => {
    state.settingsOpen = !state.settingsOpen;
    syncControls();
  });

  refs.settingsClose.addEventListener("click", () => {
    state.settingsOpen = false;
    syncControls();
  });

  [refs.settingsGraphTab, refs.settingsFiltersTab].forEach((button) => {
    button.addEventListener("click", () => {
      state.settingsTab = button.dataset.settingsTab || "graph";
      syncControls();
    });
  });

  refs.traitFilterShell.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-clear-trait-filters]");
    if (clearButton) {
      clearTraitFilters();
      return;
    }

    const filterButton = event.target.closest("[data-trait-filter]");
    if (filterButton) {
      toggleTraitFilter(filterButton.getAttribute("data-trait-filter"));
    }
  });

  refs.nodeColoringSelect.addEventListener("change", (event) => {
    state.nodeColorMode = event.target.value;
    refreshGraphStyles();
  });

  refs.nodeSizingSelect.addEventListener("change", (event) => {
    state.nodeSizeMode = event.target.value;
    refreshGraphStyles();
  });

  refs.resetBtn.addEventListener("click", () => {
    const nextLayout = state.layout === "radial" ? "cluster" : state.layout;
    refs.search.value = "";
    state.searchDraft = "";
    state.searchMenuOpen = false;
    state.searchActiveIndex = -1;
    state.activeTraitFilters = new Set();
    state.visibleCategories = new Set(state.prepared.categories.map((category) => category.id));
    state.nodeColorMode = "category";
    state.nodeSizeMode = "default";
    refs.nodeColoringSelect.value = "category";
    refs.nodeSizingSelect.value = "default";
    state.showPrerequisites = true;
    state.showDependents = false;
    clearSelection();
    state.layout = nextLayout;
    refs.layoutSelect.value = nextLayout;
    markDerivedStateDirty();
    renderSettingsFilters();
    renderSearchResults();
    rebuildGraph({ zoom: false });
    renderPanels();
    recenterGraphView();
    syncControls();
  });

  refs.screenshotBtn.addEventListener("click", downloadScreenshot);
  refs.copyLinkBtn.addEventListener("click", copyShareLink);

  refs.infoToggle.addEventListener("click", () => togglePanel(refs.infoPanel));
  refs.analyticsToggle.addEventListener("click", () => togglePanel(refs.analyticsPanel));

  window.addEventListener("resize", () => {
    if (!state.graph) {
      return;
    }
    state.graph.width(window.innerWidth).height(window.innerHeight);
  });
}

function renderBackboneScopeOptions() {
  if (!refs.backboneScopeSelect) {
    return;
  }

  refs.backboneScopeSelect.innerHTML = BACKBONE_SCOPE_OPTIONS.map(
    (scope) => `<option value="${escapeHtml(scope.id)}">${escapeHtml(scope.label)}</option>`
  ).join("");
}

function initGraph() {
  initGraph2d();
  state.rendererMode = "2d";
  configureSharedGraphForces();
  refs.graphCanvas.style.cursor = "grab";
}

function initGraph2d() {
  state.graph = new ForceGraph()(refs.graphCanvas)
    .backgroundColor("rgba(0,0,0,0)")
    .width(window.innerWidth)
    .height(window.innerHeight)
    .nodeLabel((node) => tooltipHtml(node))
    .nodeVal((node) => nodeValue(node))
    .nodeColor((node) => nodeColor(node))
    .nodeCanvasObjectMode(() => "after")
    .nodeCanvasObject((node, ctx, globalScale) => drawNodeOverlay(node, ctx, globalScale))
    .linkColor((link) => linkColor(link))
    .linkWidth((link) => linkWidth(link))
    .linkDirectionalArrowLength((link) => (isActiveLink(link) ? 6 : 3))
    .linkDirectionalArrowRelPos(0.86)
    .linkDirectionalParticles((link) => (isActiveLink(link) ? 2 : 0))
    .linkDirectionalParticleWidth((link) => (isActiveLink(link) ? 3 : 0.1))
    .linkDirectionalParticleColor((link) => linkColor(link))
    .onNodeHover((node) => {
      refs.graphCanvas.style.cursor = node ? "pointer" : "grab";
    })
    .onBackgroundClick(() => {
      clearSelection();
      renderPanels();
      refreshGraphStyles();
      syncControls();
      syncUrlState();
    })
    .onNodeClick((node, event) => handleNodeClick(node, event));
}

function configureSharedGraphForces() {
  state.graph.d3Force("charge").strength(-180);
  state.graph.d3Force("link").distance((link) => {
    const source = typeof link.source === "object" ? link.source : state.prepared.nodeMap.get(link.source);
    const target = typeof link.target === "object" ? link.target : state.prepared.nodeMap.get(link.target);
    if (!source || !target) {
      return 68;
    }
    return source.category === target.category ? 48 : 82;
  });
  state.graph.d3VelocityDecay(0.24);
  state.graph.cooldownTicks(120);
}

function resolveComponentNodes(componentMap, nodeMap) {
  return Object.fromEntries(
    Object.entries(componentMap || {}).map(([field, ids]) => [
      field,
      Array.isArray(ids) ? ids.filter((nodeId) => nodeMap.has(nodeId)).map((nodeId) => nodeMap.get(nodeId)) : [],
    ])
  );
}

function appendUniqueId(list, seen, value) {
  if (!value || seen.has(value)) {
    return;
  }
  seen.add(value);
  list.push(value);
}

function emptyToolProfileRecord() {
  return {
    linked_pipeline_ids: [],
    step_pipeline_ids: [],
    ...Object.fromEntries(TOOL_PROFILE_FIELDS.map((field) => [field, []])),
  };
}

function buildDerivedToolProfiles(pipelines, nodeMap, pipelineMap) {
  const toolIds = [...nodeMap.values()].filter((node) => node.kind === "tool").map((node) => node.id);
  const profiles = new Map(toolIds.map((toolId) => [toolId, emptyToolProfileRecord()]));
  const seen = new Map(
    toolIds.map((toolId) => [
      toolId,
      Object.fromEntries(
        ["linked_pipeline_ids", "step_pipeline_ids", ...TOOL_PROFILE_FIELDS].map((field) => [field, new Set()])
      ),
    ])
  );

  pipelines.forEach((pipeline) => {
    const linkedToolIds = pipeline.node_ids.filter((nodeId) => nodeMap.get(nodeId)?.kind === "tool");
    const stepToolIds = pipeline.step_ids.filter((nodeId) => nodeMap.get(nodeId)?.kind === "tool");
    const relatedToolIds = (pipeline.components?.tool_ids || []).filter((nodeId) => nodeMap.get(nodeId)?.kind === "tool");

    linkedToolIds.forEach((toolId) => {
      appendUniqueId(
        profiles.get(toolId).linked_pipeline_ids,
        seen.get(toolId).linked_pipeline_ids,
        pipeline.id
      );

      relatedToolIds.forEach((relatedToolId) => {
        if (relatedToolId === toolId) {
          return;
        }
        appendUniqueId(
          profiles.get(toolId).related_tool_ids,
          seen.get(toolId).related_tool_ids,
          relatedToolId
        );
      });
    });

    stepToolIds.forEach((toolId) => {
      appendUniqueId(
        profiles.get(toolId).step_pipeline_ids,
        seen.get(toolId).step_pipeline_ids,
        pipeline.id
      );

      TOOL_PROFILE_COMPONENT_FIELDS.forEach((field) => {
        (pipeline.components?.[field] || []).forEach((componentId) => {
          appendUniqueId(
            profiles.get(toolId)[field],
            seen.get(toolId)[field],
            componentId
          );
        });
      });
    });
  });

  return new Map(
    toolIds.map((toolId) => {
      const profile = profiles.get(toolId);
      const componentIds = Object.fromEntries(
        TOOL_PROFILE_COMPONENT_FIELDS.map((field) => [field, profile[field]])
      );

      return [
        toolId,
        {
          ...profile,
          linkedPipelines: profile.linked_pipeline_ids
            .map((pipelineId) => pipelineMap.get(pipelineId))
            .filter(Boolean),
          stepPipelines: profile.step_pipeline_ids
            .map((pipelineId) => pipelineMap.get(pipelineId))
            .filter(Boolean),
          componentNodes: resolveComponentNodes(componentIds, nodeMap),
        },
      ];
    })
  );
}

function deriveDependencyPairs(link, nodeMap) {
  const sourceNode = nodeMap.get(link.sourceId);
  const targetNode = nodeMap.get(link.targetId);
  if (!sourceNode || !targetNode) {
    return [];
  }

  const sourceKind = sourceNode.kind;
  const targetKind = targetNode.kind;
  const pairs = [];
  const addPair = (sourceId, targetId) => {
    if (sourceId === targetId) {
      return;
    }
    pairs.push([sourceId, targetId]);
  };

  switch (link.kind) {
    case "uses":
      if ((sourceKind === "primary" || sourceKind === "support") && targetKind === "algorithm") {
        addPair(link.sourceId, link.targetId);
      } else if (sourceKind === "tool" && (targetKind === "primary" || targetKind === "support")) {
        addPair(link.targetId, link.sourceId);
      } else if (sourceKind === "goal" && targetKind === "algorithm") {
        addPair(link.targetId, link.sourceId);
      }
      break;
    case "requires":
      if (sourceKind === "tool" && (targetKind === "primary" || targetKind === "support")) {
        addPair(link.targetId, link.sourceId);
      } else if (sourceKind === "goal" && (targetKind === "primary" || targetKind === "support")) {
        addPair(link.targetId, link.sourceId);
      }
      break;
    case "targets":
      if (
        sourceKind === "goal" &&
        (targetKind === "primary" || targetKind === "support" || targetKind === "property" || targetKind === "algorithm")
      ) {
        addPair(link.targetId, link.sourceId);
      }
      break;
    case "central_to":
    case "implements":
    case "implemented_by":
      if (
        (sourceKind === "algorithm" && targetKind === "module") ||
        (sourceKind === "algorithm" && targetKind === "concept") ||
        (sourceKind === "concept" && targetKind === "module") ||
        (sourceKind === "module" && targetKind === "tool")
      ) {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "supports":
      if (sourceKind === "concept" && targetKind === "module") {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "augments":
      if (sourceKind === "support" && (targetKind === "algorithm" || targetKind === "module")) {
        addPair(link.sourceId, link.targetId);
      } else if (sourceKind === "goal" && targetKind === "goal") {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "causes":
      if (targetKind === "concept") {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "stage":
    case "starts_at":
      if ((sourceKind === "tool" || sourceKind === "module") && targetKind === "stage") {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "produces":
      if ((sourceKind === "stage" && targetKind === "output") || (sourceKind === "output" && targetKind === "metric")) {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "improves":
      if (sourceKind === "module" && (targetKind === "metric" || targetKind === "output")) {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "applied_to":
      if (sourceKind === "output" && targetKind === "case") {
        addPair(link.sourceId, link.targetId);
      }
      break;
    case "characterized_by":
      if (sourceKind === "case" && (targetKind === "property" || targetKind === "concept")) {
        addPair(link.targetId, link.sourceId);
      } else if (sourceKind === "output" && targetKind === "concept") {
        addPair(link.targetId, link.sourceId);
      }
      break;
    case "validated_by":
      if (sourceKind === "output" && targetKind === "metric") {
        addPair(link.sourceId, link.targetId);
      } else if (sourceKind === "case" && targetKind === "metric") {
        addPair(link.targetId, link.sourceId);
      }
      break;
    default:
      break;
  }

  return pairs;
}

function buildDependencyGraph(rawLinks, nodeMap) {
  const dependencyLinkMap = new Map();
  const rawEdgeDependencyIds = new Map();

  rawLinks.forEach((link) => {
    deriveDependencyPairs(link, nodeMap).forEach(([sourceId, targetId]) => {
      const dependencyId = `dep_${sourceId}_${targetId}`;
      let dependencyLink = dependencyLinkMap.get(dependencyId);
      if (!dependencyLink) {
        dependencyLink = {
          id: dependencyId,
          sourceId,
          targetId,
          source: sourceId,
          target: targetId,
          curvature: deterministicCurvature(sourceId, targetId),
          rawEdgeIds: [],
          relationKinds: [],
          sources: [],
        };
        dependencyLinkMap.set(dependencyId, dependencyLink);
      }

      if (!dependencyLink.rawEdgeIds.includes(link.id)) {
        dependencyLink.rawEdgeIds.push(link.id);
      }
      if (!dependencyLink.relationKinds.includes(link.kind)) {
        dependencyLink.relationKinds.push(link.kind);
      }
      link.sources.forEach((sourceRef) => {
        if (!sourceRef || dependencyLink.sources.some((existing) => existing.id === sourceRef.id)) {
          return;
        }
        dependencyLink.sources.push(sourceRef);
      });

      if (!rawEdgeDependencyIds.has(link.id)) {
        rawEdgeDependencyIds.set(link.id, []);
      }
      if (!rawEdgeDependencyIds.get(link.id).includes(dependencyId)) {
        rawEdgeDependencyIds.get(link.id).push(dependencyId);
      }
    });
  });

  return {
    dependencyLinks: [...dependencyLinkMap.values()],
    dependencyLinkMap,
    rawEdgeDependencyIds,
  };
}

function buildTraitFilterIndex(nodes, nodeMap) {
  const toolNodes = nodes.filter((node) => node.kind === "tool" && node.toolProfile);
  const groups = TOOL_TRAIT_FILTER_GROUPS.map((group) => {
    const counts = new Map();
    toolNodes.forEach((toolNode) => {
      (toolNode.toolProfile[group.field] || []).forEach((nodeId) => {
        counts.set(nodeId, (counts.get(nodeId) || 0) + 1);
      });
    });

    const items = [...counts.entries()]
      .map(([nodeId, count]) => {
        const node = nodeMap.get(nodeId);
        if (!node) {
          return null;
        }
        return {
          key: traitFilterKey(group.field, nodeId),
          field: group.field,
          nodeId,
          label: node.label,
          count,
          color: categoryColor(node),
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

    return {
      ...group,
      items,
    };
  }).filter((group) => group.items.length > 0);

  return {
    groups,
    itemMap: new Map(groups.flatMap((group) => group.items.map((item) => [item.key, item]))),
  };
}

function backboneScopeOption(scopeId) {
  return BACKBONE_SCOPE_OPTION_MAP.get(scopeId) || null;
}

function scopeChildScopeIds(scope) {
  if (!scope) {
    return [];
  }
  return scope.includeScopeIds?.length ? scope.includeScopeIds : [scope.id];
}

function scopePipelineIds(scope) {
  if (!scope) {
    return [];
  }
  const visited = new Set();
  const collectLeafScopeIds = (scopeLike) => {
    const currentScope =
      typeof scopeLike === "string"
        ? backboneScopeOption(scopeLike) || { id: scopeLike }
        : scopeLike;

    if (!currentScope?.id || visited.has(currentScope.id)) {
      return [];
    }
    visited.add(currentScope.id);

    const childScopeIds = currentScope.includeScopeIds || [];
    if (!childScopeIds.length) {
      return [currentScope.id];
    }

    return uniqueNodeIds(childScopeIds.flatMap((childScopeId) => collectLeafScopeIds(childScopeId)));
  };

  return collectLeafScopeIds(scope);
}

function classifyLongReadPipelineScope({ ids, goals, outputs, supports, stages }) {
  const hasScaffoldingSignal =
    goals.has("goal_draft_scaffolding") ||
    goals.has("goal_chromosome_scaffold") ||
    stages.has("stage_anchor") ||
    outputs.has("output_scaffold_draft") ||
    outputs.has("output_chr_anchor") ||
    outputs.has("output_complete_replicons") ||
    supports.has("support_fragmented_draft") ||
    supports.has("support_hic") ||
    supports.has("support_dense_map") ||
    supports.has("support_optical_map") ||
    ids.has("algorithm_anchor_scaffold") ||
    ids.has("module_long_range_phasing") ||
    ids.has("module_map_anchoring") ||
    ids.has("module_alignment_free_linking") ||
    ids.has("module_long_read_link_scaffolding") ||
    ids.has("module_real_time_scaffolding");

  if (hasScaffoldingSignal) {
    return "long_read_scaffolding";
  }

  const hasCoreAssemblySignal =
    goals.has("goal_de_novo") ||
    goals.has("goal_repeat") ||
    goals.has("goal_phased") ||
    goals.has("goal_t2t") ||
    goals.has("goal_heterozygous") ||
    stages.has("stage_overlap") ||
    stages.has("stage_graph") ||
    stages.has("stage_phase") ||
    outputs.has("output_draft") ||
    outputs.has("output_phased") ||
    outputs.has("output_t2t") ||
    outputs.has("output_deduplicated");

  const hasStrongFinishingSignal =
    goals.has("goal_finishing") ||
    stages.has("stage_gap_close") ||
    stages.has("stage_correct") ||
    outputs.has("output_gap_closed") ||
    outputs.has("output_corrected_reads");
  const hasPolishingOnlySignal = (stages.has("stage_polish") || outputs.has("output_polished")) && !hasCoreAssemblySignal;

  if (hasStrongFinishingSignal || hasPolishingOnlySignal) {
    return "long_read_finishing";
  }

  return "long_read_core";
}

function classifyShortReadPipelineScope({ ids, goals, outputs, reads, supports, stages }) {
  const primaryReadIds = [...reads].filter((readId) => readId.startsWith("read_"));
  const hasHybridSignal =
    goals.has("goal_hybrid_assembly") ||
    primaryReadIds.length > 1 ||
    supports.has("support_pacbio_long") ||
    supports.has("support_haploid_tissue") ||
    supports.has("support_fosmid_pools") ||
    ids.has("algorithm_hybrid_dbg_olc") ||
    ids.has("algorithm_hybrid_graph_assembly") ||
    ids.has("algorithm_super_read_hybrid") ||
    ids.has("module_hybrid_graph_bridging") ||
    ids.has("module_short_read_polishing") && primaryReadIds.length > 1;

  if (hasHybridSignal) {
    return "hybrid_upgrade";
  }

  const hasScaffoldingSignal =
    goals.has("goal_draft_scaffolding") ||
    stages.has("stage_anchor") ||
    outputs.has("output_scaffold_draft") ||
    outputs.has("output_complete_replicons") ||
    supports.has("support_fragmented_draft") ||
    supports.has("support_mate_pair") ||
    ids.has("algorithm_paired_link_scaffolding") ||
    ids.has("algorithm_exact_scaffolding") ||
    ids.has("algorithm_graph_motif_scaffolding");

  if (hasScaffoldingSignal) {
    return "short_read_scaffolding";
  }

  const hasFinishingSignal =
    goals.has("goal_finishing") ||
    stages.has("stage_polish") ||
    stages.has("stage_gap_close") ||
    outputs.has("output_polished") ||
    outputs.has("output_gap_closed") ||
    ids.has("algorithm_bloom_filter_polishing") ||
    ids.has("algorithm_bloom_gap_closing") ||
    ids.has("module_short_read_polishing") ||
    ids.has("module_gap_closing");

  if (hasFinishingSignal) {
    return "short_read_finishing";
  }

  return "short_read_core";
}

function classifyPipelineScope(pipeline) {
  const ids = new Set([...(pipeline.step_ids || []), ...(pipeline.node_ids || [])]);
  const goals = new Set([...ids].filter((id) => id.startsWith("goal_")));
  const outputs = new Set([...ids].filter((id) => id.startsWith("output_")));
  const reads = new Set([...ids].filter((id) => id.startsWith("read_")));
  const supports = new Set([...ids].filter((id) => id.startsWith("support_")));
  const stages = new Set([...ids].filter((id) => id.startsWith("stage_")));
  const hasLongReadPrimary = ["read_hifi", "read_ont_simplex", "read_ont_long_ul", "read_clr"].some((readId) =>
    reads.has(readId)
  );
  const hasShortReadPrimary =
    ["read_paired_end", "read_short_wgs"].some((readId) => reads.has(readId)) || goals.has("goal_hybrid_assembly");
  const hasLongRangeScaffoldingSupport = ["support_hic", "support_dense_map", "support_optical_map"].some(
    (supportId) => supports.has(supportId)
  );

  if (goals.has("goal_pangenome") || outputs.has("output_pangenome_graph")) {
    return "pangenome";
  }

  if (goals.has("goal_genome_annotation_update") || goals.has("goal_eukaryotic_metagenome_annotation")) {
    return "annotation";
  }

  if (
    [
      "goal_validation",
      "goal_mag_evaluation",
      "goal_metagenome_evaluation",
      "goal_viral_genome_evaluation",
      "goal_eukaryotic_mag_evaluation",
      "goal_graph_inspection",
      "goal_long_read_variant_calling",
      "goal_contamination",
      "goal_neural_basecalling",
    ].some((goalId) => goals.has(goalId))
  ) {
    return "qc_annotation";
  }

  if (
    [
      "goal_metagenome_assembly",
      "goal_mag_curation",
      "goal_mag_recovery",
      "goal_viral_genome_recovery",
      "goal_viral_host_prediction",
      "goal_eukaryotic_metagenome_recovery",
      "goal_mini_metagenome_assembly",
    ].some((goalId) => goals.has(goalId)) ||
    [
      "output_mag_bins",
      "output_refined_mag_bins",
      "output_curated_mag_set",
      "output_metagenome_contigs",
      "output_strain_resolved_drafts",
      "output_viral_bins",
    ].some((outputId) => outputs.has(outputId)) ||
    ids.has("concept_mag") ||
    ids.has("concept_contig_bin") ||
    ids.has("stage_bin")
  ) {
    return "metagenome";
  }

  if (goals.has("goal_organelle_assembly") || goals.has("goal_plastome_assembly")) {
    return "organelle";
  }

  if (hasShortReadPrimary) {
    return classifyShortReadPipelineScope({ ids, goals, outputs, reads, supports, stages });
  }

  if (hasLongReadPrimary) {
    return classifyLongReadPipelineScope({ ids, goals, outputs, supports, stages });
  }

  if (goals.has("goal_chromosome_scaffold") || hasLongRangeScaffoldingSupport || outputs.has("output_chr_anchor")) {
    return "chromosome_scale";
  }

  return "all";
}

function clampCount(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function uniqueNodeIds(nodeIds) {
  return [...new Set(nodeIds.filter(Boolean))];
}

function pickCappedNodeIds(rankedNodeIds, nodeMap, kindCaps, limit = 10) {
  const picked = [];
  const pickedSet = new Set();
  const kindCounts = new Map();

  rankedNodeIds.forEach((nodeId) => {
    if (picked.length >= limit) {
      return;
    }
    const node = nodeMap.get(nodeId);
    if (!node || node.kind === "goal") {
      return;
    }
    const cap = kindCaps[node.kind];
    const count = kindCounts.get(node.kind) || 0;
    if (cap != null && count >= cap) {
      return;
    }
    picked.push(nodeId);
    pickedSet.add(nodeId);
    kindCounts.set(node.kind, count + 1);
  });

  rankedNodeIds.forEach((nodeId) => {
    if (picked.length >= limit || pickedSet.has(nodeId)) {
      return;
    }
    const node = nodeMap.get(nodeId);
    if (!node || node.kind === "goal") {
      return;
    }
    picked.push(nodeId);
    pickedSet.add(nodeId);
  });

  return picked;
}

function pickBackboneKeyNodeIds(rankedNodeIds, nodeMap, limit = 10) {
  return pickCappedNodeIds(rankedNodeIds, nodeMap, BACKBONE_KEY_KIND_CAPS, limit);
}

function pickBackboneCoreNodeIds(rankedNodeIds, nodeMap, limit = 24) {
  return pickCappedNodeIds(rankedNodeIds, nodeMap, BACKBONE_CORE_KIND_CAPS, limit);
}

function buildBackboneScope(scope, nodes, pipelines, dependencyLinks) {
  const pipelineIds = new Set(pipelines.map((pipeline) => pipeline.id));
  const pipelineStepSequences = new Map(
    pipelines.map((pipeline) => [
      pipeline.id,
      (pipeline.step_ids || []).filter(
        (nodeId) => nodes.has(nodeId) && BACKBONE_PROJECTION_CATEGORY_IDS.has(nodes.get(nodeId)?.categoryId)
      ),
    ])
  );
  const scopeNodeIds = new Set();
  const pipelineCounts = new Map();
  const stepCounts = new Map();

  pipelines.forEach((pipeline) => {
    pipeline.nodeSet.forEach((nodeId) => {
      scopeNodeIds.add(nodeId);
      pipelineCounts.set(nodeId, (pipelineCounts.get(nodeId) || 0) + 1);
    });
    pipeline.stepSet.forEach((nodeId) => {
      stepCounts.set(nodeId, (stepCounts.get(nodeId) || 0) + 1);
    });
  });

  const allowedNodeIds = new Set(
    [...scopeNodeIds].filter((nodeId) => BACKBONE_BASE_CATEGORY_IDS.has(nodes.get(nodeId)?.categoryId))
  );
  const projectableNodeIds = new Set(
    [...scopeNodeIds].filter((nodeId) => BACKBONE_PROJECTION_CATEGORY_IDS.has(nodes.get(nodeId)?.categoryId))
  );
  const allowedNodes = [...allowedNodeIds].map((nodeId) => nodes.get(nodeId)).filter(Boolean);
  const workflowParentMap = new Map([...projectableNodeIds].map((nodeId) => [nodeId, new Set()]));
  const workflowChildMap = new Map([...projectableNodeIds].map((nodeId) => [nodeId, new Set()]));

  pipelineStepSequences.forEach((sequence) => {
    const dedupedSequence = sequence.filter((nodeId, index) => index === 0 || sequence[index - 1] !== nodeId);
    for (let index = 0; index < dedupedSequence.length - 1; index += 1) {
      const sourceId = dedupedSequence[index];
      const targetId = dedupedSequence[index + 1];
      workflowChildMap.get(sourceId)?.add(targetId);
      workflowParentMap.get(targetId)?.add(sourceId);
    }
  });

  const parents = new Map(allowedNodes.map((node) => [node.id, new Set()]));
  const children = new Map(allowedNodes.map((node) => [node.id, new Set()]));
  pipelineStepSequences.forEach((sequence) => {
    const dedupedAllowedSequence = sequence
      .filter((nodeId) => allowedNodeIds.has(nodeId))
      .filter((nodeId, index, arr) => index === 0 || arr[index - 1] !== nodeId);

    for (let index = 0; index < dedupedAllowedSequence.length - 1; index += 1) {
      const sourceId = dedupedAllowedSequence[index];
      const targetId = dedupedAllowedSequence[index + 1];
      children.get(sourceId)?.add(targetId);
      parents.get(targetId)?.add(sourceId);
    }
  });

  const indegrees = new Map(allowedNodes.map((node) => [node.id, parents.get(node.id)?.size || 0]));
  const queue = [...allowedNodes.map((node) => node.id).filter((nodeId) => (indegrees.get(nodeId) || 0) === 0)].sort(
    (left, right) => nodes.get(left).label.localeCompare(nodes.get(right).label)
  );
  const order = [];
  while (queue.length) {
    const currentId = queue.shift();
    order.push(currentId);
    [...(children.get(currentId) || [])]
      .sort((left, right) => nodes.get(left).label.localeCompare(nodes.get(right).label))
      .forEach((childId) => {
        indegrees.set(childId, indegrees.get(childId) - 1);
        if (indegrees.get(childId) === 0) {
          queue.push(childId);
        }
      });
  }

  const ancestorSets = new Map(allowedNodes.map((node) => [node.id, new Set()]));
  order.forEach((nodeId) => {
    (children.get(nodeId) || []).forEach((childId) => {
      const childAncestors = ancestorSets.get(childId);
      childAncestors.add(nodeId);
      ancestorSets.get(nodeId).forEach((ancestorId) => childAncestors.add(ancestorId));
    });
  });

  const descendantSets = new Map(allowedNodes.map((node) => [node.id, new Set()]));
  const leafSets = new Map(allowedNodes.map((node) => [node.id, new Set()]));
  const rootIds = allowedNodes
    .filter((node) => (parents.get(node.id)?.size || 0) === 0)
    .map((node) => node.id);
  const leafIds = allowedNodes
    .filter((node) => (children.get(node.id)?.size || 0) === 0)
    .map((node) => node.id);
  const totalLeaves = Math.max(leafIds.length, 1);
  const pipelineTotal = Math.max(pipelines.length, 1);

  [...order].reverse().forEach((nodeId) => {
    const childIds = children.get(nodeId) || new Set();
    if (!childIds.size) {
      leafSets.get(nodeId).add(nodeId);
      return;
    }
    childIds.forEach((childId) => {
      descendantSets.get(nodeId).add(childId);
      descendantSets.get(childId).forEach((descendantId) => descendantSets.get(nodeId).add(descendantId));
      leafSets.get(childId).forEach((leafId) => leafSets.get(nodeId).add(leafId));
    });
  });

  const interiorCandidates = [];
  let maxReachProduct = 0;
  allowedNodes.forEach((node) => {
    const reachProduct = ancestorSets.get(node.id).size * descendantSets.get(node.id).size;
    maxReachProduct = Math.max(maxReachProduct, reachProduct);
  });

  const nodeStats = new Map(
    allowedNodes.map((node) => {
      const ancestorCount = ancestorSets.get(node.id).size;
      const descendantCount = descendantSets.get(node.id).size;
      const leafCoverage = leafSets.get(node.id).size;
      const pipelineCount = pipelineCounts.get(node.id) || 0;
      const stepCount = stepCounts.get(node.id) || 0;
      const reachProduct = ancestorCount * descendantCount;
      const reachScore = maxReachProduct ? reachProduct / maxReachProduct : 0;
      const leafCoverageRatio = leafCoverage / totalLeaves;
      const pipelineCoverageRatio = pipelineCount / pipelineTotal;
      const stepCoverageRatio = stepCount / pipelineTotal;
      const bonus = BACKBONE_INTERIOR_KIND_BONUS[node.kind] || 0;
      const score =
        stepCoverageRatio * 0.42 +
        pipelineCoverageRatio * 0.28 +
        reachScore * 0.16 +
        leafCoverageRatio * 0.08 +
        (stepCount > 1 || pipelineCount > 2 ? 0.08 : 0) +
        bonus;

      const stat = {
        score,
        ancestorCount,
        descendantCount,
        leafCoverage,
        leafCoverageRatio,
        pipelineCount,
        pipelineCoverageRatio,
        stepCount,
        stepCoverageRatio,
        isRoot: ancestorCount === 0,
        isLeaf: descendantCount === 0,
      };

      if (ancestorCount > 0 && descendantCount > 0) {
        interiorCandidates.push({ nodeId: node.id, ...stat });
      }

      return [node.id, stat];
    })
  );

  const isAggregateScope = Boolean(scope.includeScopeIds?.length);
  const coreTarget = clampCount(
    Math.round(Math.sqrt(Math.max(allowedNodes.length, 1)) * (isAggregateScope ? 2.35 : 3)),
    isAggregateScope ? 10 : 12,
    isAggregateScope ? 28 : 36
  );
  const rootTarget = clampCount(Math.round(coreTarget / 4), isAggregateScope ? 2 : 3, isAggregateScope ? 6 : 8);
  const leafTarget = clampCount(Math.round(coreTarget / 4), isAggregateScope ? 2 : 3, isAggregateScope ? 6 : 8);
  const rankedInteriorIds = interiorCandidates
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.stepCount - left.stepCount ||
        right.pipelineCount - left.pipelineCount ||
        right.leafCoverage - left.leafCoverage ||
        nodes.get(left.nodeId).label.localeCompare(nodes.get(right.nodeId).label)
    )
    .map((entry) => entry.nodeId);
  const rootSeedIds = rootIds
    .slice()
    .sort(
      (left, right) =>
        (nodeStats.get(right).leafCoverageRatio + nodeStats.get(right).pipelineCoverageRatio) -
          (nodeStats.get(left).leafCoverageRatio + nodeStats.get(left).pipelineCoverageRatio) ||
        nodes.get(left).label.localeCompare(nodes.get(right).label)
    )
    .slice(0, rootTarget);
  const leafSeedIds = leafIds
    .slice()
    .sort(
      (left, right) =>
        (nodeStats.get(right).ancestorCount + nodeStats.get(right).pipelineCount) -
          (nodeStats.get(left).ancestorCount + nodeStats.get(left).pipelineCount) ||
        nodes.get(left).label.localeCompare(nodes.get(right).label)
    )
    .slice(0, leafTarget);

  const recurringRankedIds = allowedNodes
    .filter((node) => {
      const stat = nodeStats.get(node.id);
      return stat.stepCount > 1 || stat.pipelineCount > 2;
    })
    .sort(
      (left, right) =>
        nodeStats.get(right.id).stepCount - nodeStats.get(left.id).stepCount ||
        nodeStats.get(right.id).pipelineCount - nodeStats.get(left.id).pipelineCount ||
        nodeStats.get(right.id).score - nodeStats.get(left.id).score ||
        left.label.localeCompare(right.label)
    )
    .map((node) => node.id);
  const coreNodeIds = new Set([
    ...pickBackboneCoreNodeIds(recurringRankedIds.length ? recurringRankedIds : rankedInteriorIds, nodes, coreTarget),
    ...rootSeedIds,
    ...leafSeedIds,
  ]);
  const recurringNodeIds = pickBackboneKeyNodeIds(
    allowedNodes
      .filter((node) => {
        const stat = nodeStats.get(node.id);
        return stat.stepCount > 1 || stat.pipelineCount > 1;
      })
      .sort(
        (left, right) =>
          nodeStats.get(right.id).stepCount - nodeStats.get(left.id).stepCount ||
          nodeStats.get(right.id).pipelineCount - nodeStats.get(left.id).pipelineCount ||
          left.label.localeCompare(right.label)
      )
      .map((node) => node.id),
    nodes,
    8
  );
  const baseVisibleIds = new Set(coreNodeIds);
  pipelineStepSequences.forEach((sequence) => {
    const allowedSequence = sequence.filter((nodeId) => allowedNodeIds.has(nodeId));
    const coreIndexes = allowedSequence
      .map((nodeId, index) => (coreNodeIds.has(nodeId) ? index : -1))
      .filter((index) => index >= 0);

    coreIndexes.forEach((index) => {
      if (allowedSequence[index - 1]) {
        baseVisibleIds.add(allowedSequence[index - 1]);
      }
      if (allowedSequence[index + 1]) {
        baseVisibleIds.add(allowedSequence[index + 1]);
      }
    });

    for (let index = 0; index < coreIndexes.length - 1; index += 1) {
      const start = coreIndexes[index];
      const end = coreIndexes[index + 1];
      allowedSequence.slice(start, end + 1).forEach((nodeId) => baseVisibleIds.add(nodeId));
    }
  });

  coreNodeIds.forEach((nodeId) => {
    const stat = nodeStats.get(nodeId);
    if (stat) {
      stat.isCore = true;
    }
  });

  return {
    ...scope,
    pipelineIds,
    pipelineCount: pipelines.length,
    pipelineStepSequences,
    nodeIds: scopeNodeIds,
    allowedNodeIds,
    projectableNodeIds,
    baseVisibleIds,
    coreNodeIds,
    rootIds,
    leafIds,
    keyNodeIds: pickBackboneKeyNodeIds(recurringRankedIds.length ? recurringRankedIds : rankedInteriorIds, nodes),
    recurringNodeIds,
    nodeStats,
    workflowParentMap,
    workflowChildMap,
  };
}

function buildAggregateBackboneScope(scope, baseScope, childScopes, nodes) {
  const aggregateConfig = BACKBONE_AGGREGATE_SCOPE_CONFIG[scope.id] || {};
  const forcedNodeIds = (aggregateConfig.forcedNodeIds || []).filter((nodeId) => baseScope.allowedNodeIds.has(nodeId));
  const forcedNodeIdSet = new Set(forcedNodeIds);
  const nodeStats = new Map([...baseScope.nodeStats.entries()].map(([nodeId, stat]) => [nodeId, { ...stat, isCore: false }]));
  const representativeCounts = new Map();
  const childScopeCounts = new Map();
  const candidateIds = new Set();
  const promotedConnectorIds = new Set();

  childScopes.forEach((childScope) => {
    const localSeen = new Set();
    const configuredPriority = (aggregateConfig.childPriorityByScopeId?.[childScope.id] || []).filter((nodeId) =>
      childScope.allowedNodeIds.has(nodeId)
    );
    const childPriority = uniqueNodeIds([
      ...configuredPriority,
      ...(childScope.recurringNodeIds || []).slice(0, 5),
      ...(childScope.keyNodeIds || []).slice(0, 5),
      ...[...(childScope.coreNodeIds || [])]
        .sort(
          (left, right) =>
            (childScope.nodeStats.get(right)?.score || 0) - (childScope.nodeStats.get(left)?.score || 0) ||
            nodes.get(left)?.label.localeCompare(nodes.get(right)?.label || "") ||
            0
        )
        .slice(0, 5),
    ]).filter((nodeId) => baseScope.allowedNodeIds.has(nodeId));

    childPriority.forEach((nodeId) => {
      candidateIds.add(nodeId);
      representativeCounts.set(nodeId, (representativeCounts.get(nodeId) || 0) + 1);
      if (!localSeen.has(nodeId)) {
        childScopeCounts.set(nodeId, (childScopeCounts.get(nodeId) || 0) + 1);
        localSeen.add(nodeId);
      }
    });

    [...(childScope.keyNodeIds || []).slice(0, 6), ...(childScope.recurringNodeIds || []).slice(0, 6)].forEach((nodeId) => {
      if (baseScope.allowedNodeIds.has(nodeId)) {
        promotedConnectorIds.add(nodeId);
      }
    });
  });

  forcedNodeIds.forEach((nodeId) => {
    candidateIds.add(nodeId);
    promotedConnectorIds.add(nodeId);
  });

  const rankNodeIds = (nodeIds) =>
    nodeIds
      .filter((nodeId) => baseScope.allowedNodeIds.has(nodeId))
      .sort(
        (left, right) =>
          (childScopeCounts.get(right) || 0) - (childScopeCounts.get(left) || 0) ||
          (representativeCounts.get(right) || 0) - (representativeCounts.get(left) || 0) ||
          (nodeStats.get(right)?.stepCount || 0) - (nodeStats.get(left)?.stepCount || 0) ||
          (nodeStats.get(right)?.pipelineCount || 0) - (nodeStats.get(left)?.pipelineCount || 0) ||
          (nodeStats.get(right)?.score || 0) - (nodeStats.get(left)?.score || 0) ||
          nodes.get(left).label.localeCompare(nodes.get(right).label)
      );

  const rankedCandidateIds = rankNodeIds([...candidateIds]);
  const minSharedChildScopes = aggregateConfig.minSharedChildScopes || 1;
  const bridgeCandidateIds = rankedCandidateIds.filter(
    (nodeId) => forcedNodeIdSet.has(nodeId) || (childScopeCounts.get(nodeId) || 0) >= minSharedChildScopes
  );
  const candidatePoolIds = bridgeCandidateIds.length ? bridgeCandidateIds : rankedCandidateIds;
  const rootSeedIds = aggregateConfig.rootSeedLimit === 0
    ? []
    : rankNodeIds(childScopes.flatMap((childScope) => childScope.rootIds || []))
        .filter((nodeId) => forcedNodeIdSet.has(nodeId) || (childScopeCounts.get(nodeId) || 0) >= minSharedChildScopes)
        .slice(0, aggregateConfig.rootSeedLimit || 2);
  const leafSeedIds = aggregateConfig.leafSeedLimit === 0
    ? []
    : rankNodeIds(childScopes.flatMap((childScope) => childScope.leafIds || []))
        .filter((nodeId) => forcedNodeIdSet.has(nodeId) || (childScopeCounts.get(nodeId) || 0) >= minSharedChildScopes)
        .slice(0, aggregateConfig.leafSeedLimit || 2);
  const guaranteedFamilyIds = childScopes
    .map((childScope) =>
      rankNodeIds([
        ...((aggregateConfig.childPriorityByScopeId?.[childScope.id] || []).filter((nodeId) => childScope.allowedNodeIds.has(nodeId))),
        ...(childScope.recurringNodeIds || []).slice(0, 4),
        ...(childScope.keyNodeIds || []).slice(0, 4),
        ...[...(childScope.coreNodeIds || [])],
      ])[0]
    )
    .filter(Boolean);
  const overviewCoreLimit =
    aggregateConfig.overviewCoreLimit ||
    clampCount(Math.round(Math.sqrt(Math.max(candidatePoolIds.length, 1)) * 2.4), 10, 18);
  const coreNodeIds = new Set([
    ...forcedNodeIds,
    ...rootSeedIds,
    ...guaranteedFamilyIds,
    ...pickCappedNodeIds(candidatePoolIds, nodes, BACKBONE_OVERVIEW_KIND_CAPS, overviewCoreLimit),
    ...leafSeedIds,
  ]);
  const keyNodeIds = uniqueNodeIds([
    ...((aggregateConfig.keyNodeIds || []).filter((nodeId) => coreNodeIds.has(nodeId) || baseScope.allowedNodeIds.has(nodeId))),
    ...pickBackboneKeyNodeIds(uniqueNodeIds([...forcedNodeIds, ...candidatePoolIds]), nodes, aggregateConfig.keyNodeLimit || 10),
  ]).slice(0, aggregateConfig.keyNodeLimit || 10);
  const recurringNodeIds = uniqueNodeIds([
    ...((aggregateConfig.recurringNodeIds || []).filter((nodeId) => baseScope.allowedNodeIds.has(nodeId))),
    ...pickBackboneKeyNodeIds(
      uniqueNodeIds([
        ...forcedNodeIds,
        ...[...candidateIds].sort(
          (left, right) =>
            (childScopeCounts.get(right) || 0) - (childScopeCounts.get(left) || 0) ||
            (nodeStats.get(right)?.stepCount || 0) - (nodeStats.get(left)?.stepCount || 0) ||
            (nodeStats.get(right)?.pipelineCount || 0) - (nodeStats.get(left)?.pipelineCount || 0) ||
            nodes.get(left).label.localeCompare(nodes.get(right).label)
        ),
      ]),
      nodes,
      aggregateConfig.recurringNodeLimit || 8
    ),
  ]).slice(0, aggregateConfig.recurringNodeLimit || 8);
  const promotedConnectorLimit = aggregateConfig.promotedConnectorLimit || 6;
  const promotedConnectorIdSet = new Set(rankNodeIds([...promotedConnectorIds]).slice(0, promotedConnectorLimit));
  const focusNodeIds = new Set([
    ...coreNodeIds,
    ...forcedNodeIds,
    ...keyNodeIds.slice(0, aggregateConfig.focusKeyLimit || 6),
    ...recurringNodeIds.slice(0, aggregateConfig.focusRecurringLimit || 6),
  ]);
  const baseVisibleIds = new Set(coreNodeIds);

  baseScope.pipelineStepSequences.forEach((sequence) => {
    const allowedSequence = sequence.filter((nodeId) => baseScope.allowedNodeIds.has(nodeId));
    const focusIndexes = allowedSequence
      .map((nodeId, index) => (focusNodeIds.has(nodeId) ? index : -1))
      .filter((index) => index >= 0);

    for (let index = 0; index < focusIndexes.length - 1; index += 1) {
      const start = focusIndexes[index];
      const end = focusIndexes[index + 1];
      allowedSequence.slice(start, end + 1).forEach((nodeId) => {
        const stat = nodeStats.get(nodeId);
        if (
          focusNodeIds.has(nodeId) ||
          promotedConnectorIdSet.has(nodeId) ||
          (stat && (stat.stepCount >= 2 || stat.pipelineCount >= 2))
        ) {
          baseVisibleIds.add(nodeId);
        }
      });
    }
  });

  [...coreNodeIds].forEach((nodeId) => {
    (baseScope.workflowParentMap.get(nodeId) || []).forEach((parentId) => {
      const stat = nodeStats.get(parentId);
      if (
        forcedNodeIdSet.has(parentId) ||
        promotedConnectorIdSet.has(parentId) ||
        (stat && (stat.stepCount > 1 || stat.pipelineCount > 1))
      ) {
        baseVisibleIds.add(parentId);
      }
    });
    (baseScope.workflowChildMap.get(nodeId) || []).forEach((childId) => {
      const stat = nodeStats.get(childId);
      if (
        forcedNodeIdSet.has(childId) ||
        promotedConnectorIdSet.has(childId) ||
        (stat && (stat.stepCount > 1 || stat.pipelineCount > 1))
      ) {
        baseVisibleIds.add(childId);
      }
    });
  });

  [...nodeStats.keys()].forEach((nodeId) => {
    nodeStats.get(nodeId).isCore = coreNodeIds.has(nodeId);
  });

  const nodeBranchMap = new Map();
  if (aggregateConfig.layoutMode === "branch_universe") {
    const branchScopeMap = new Map(childScopes.map((childScope) => [childScope.id, childScope]));
    const branchOverrides = aggregateConfig.branchOverrides || {};

    baseScope.nodeIds.forEach((nodeId) => {
      const branchOverride = branchOverrides[nodeId];
      if (branchOverride) {
        nodeBranchMap.set(nodeId, branchOverride);
        return;
      }

      const inShort = branchScopeMap.get(aggregateConfig.branchScopeIds?.short)?.nodeIds.has(nodeId) || false;
      const inLong = branchScopeMap.get(aggregateConfig.branchScopeIds?.long)?.nodeIds.has(nodeId) || false;
      nodeBranchMap.set(nodeId, inShort && inLong ? "shared" : inShort ? "short" : inLong ? "long" : "shared");
    });
  }

  return {
    ...baseScope,
    ...scope,
    baseVisibleIds,
    coreNodeIds,
    keyNodeIds,
    recurringNodeIds,
    nodeStats,
    layoutMode: aggregateConfig.layoutMode || null,
    nodeBranchMap,
    branchCenters: aggregateConfig.branchCenters || null,
    branchLaneSpacing: aggregateConfig.branchLaneSpacing || 18,
  };
}

function buildBackboneIndex(nodes, nodeMap, dependencyLinks, pipelines) {
  const scopedPipelines = new Map(BACKBONE_SCOPE_OPTIONS.map((scope) => [scope.id, []]));
  const nodeScopeCountMap = new Map(nodes.map((node) => [node.id, new Map()]));

  pipelines.forEach((pipeline) => {
    const scopeId = classifyPipelineScope(pipeline);
    pipeline.scopeId = scopeId;
    if (scopedPipelines.has(scopeId)) {
      scopedPipelines.get(scopeId).push(pipeline);
    }

    pipeline.nodeSet.forEach((nodeId) => {
      const scopeCounts = nodeScopeCountMap.get(nodeId);
      scopeCounts.set(scopeId, (scopeCounts.get(scopeId) || 0) + 1);
    });
  });

  const scopeMap = new Map();
  BACKBONE_SCOPE_OPTIONS.filter((scope) => !scope.includeScopeIds?.length).forEach((scope) => {
    const pipelinesForScope =
      scope.id === "all"
        ? pipelines
        : scopePipelineIds(scope).flatMap((scopeId) => scopedPipelines.get(scopeId) || []);
    scopeMap.set(scope.id, buildBackboneScope(scope, nodeMap, pipelinesForScope, dependencyLinks));
  });
  BACKBONE_SCOPE_OPTIONS.filter((scope) => scope.includeScopeIds?.length).forEach((scope) => {
    const pipelinesForScope = scopePipelineIds(scope).flatMap((scopeId) => scopedPipelines.get(scopeId) || []);
    const baseScope = buildBackboneScope(scope, nodeMap, pipelinesForScope, dependencyLinks);
    const childScopes = scopeChildScopeIds(scope).map((scopeId) => scopeMap.get(scopeId)).filter(Boolean);
    scopeMap.set(scope.id, buildAggregateBackboneScope(scope, baseScope, childScopes, nodeMap));
  });

  const nodePrimaryScopeIdMap = new Map(
    nodes.map((node) => {
      const counts = nodeScopeCountMap.get(node.id) || new Map();
      const scopeId =
        [...counts.entries()]
          .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ||
        DEFAULT_BACKBONE_SCOPE_ID;
      return [node.id, scopeId];
    })
  );

  return {
    scopeMap,
    nodePrimaryScopeIdMap,
    nodeScopeCountMap,
  };
}

function prepareData(raw) {
  const laneMap = new Map(raw.lanes.map((lane, index) => [lane.id, { ...lane, index }]));
  const sourceMap = new Map(raw.sources.map((source) => [source.id, source]));
  const nodes = raw.nodes.map((node) => ({
    ...node,
    category: laneMap.get(node.lane)?.label || sentenceCase(node.kind),
    categoryId: node.lane,
    kindLabel: sentenceCase(node.kind),
    definition: node.summary,
    from: [],
    to: [],
    pipelines: [],
    sources: (node.source_ids || []).map((id) => sourceMap.get(id)).filter(Boolean),
  }));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const rawLinks = raw.edges
    .filter((edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target))
    .map((edge) => ({
      ...edge,
      sourceId: edge.source,
      targetId: edge.target,
      source: edge.source,
      target: edge.target,
      curvature: deterministicCurvature(edge.source, edge.target),
      sources: (edge.source_ids || []).map((id) => sourceMap.get(id)).filter(Boolean),
    }));

  const {
    dependencyLinks,
    dependencyLinkMap,
    rawEdgeDependencyIds,
  } = buildDependencyGraph(rawLinks, nodeMap);

  dependencyLinks.forEach((link) => {
    nodeMap.get(link.source).to.push(link.target);
    nodeMap.get(link.target).from.push(link.source);
  });

  const edgeMap = new Map(rawLinks.map((link) => [link.id, link]));
  const pipelines = raw.pipelines.map((pipeline) => {
    const resolvedNodeIds = pipeline.node_ids.filter((nodeId) => nodeMap.has(nodeId));
    const resolvedStepIds = (pipeline.step_ids || []).filter((nodeId) => nodeMap.has(nodeId));
    const resolvedEdgeIds = (pipeline.edge_ids || []).filter((edgeId) => edgeMap.has(edgeId));
    const dependencyEdgeIds = [];
    const dependencyEdgeSeen = new Set();
    resolvedEdgeIds.forEach((edgeId) => {
      (rawEdgeDependencyIds.get(edgeId) || []).forEach((dependencyEdgeId) => {
        if (dependencyEdgeSeen.has(dependencyEdgeId)) {
          return;
        }
        dependencyEdgeSeen.add(dependencyEdgeId);
        dependencyEdgeIds.push(dependencyEdgeId);
      });
    });
    const componentNodes = resolveComponentNodes(pipeline.components, nodeMap);
    return {
      ...pipeline,
      nodes: resolvedNodeIds.map((nodeId) => nodeMap.get(nodeId)),
      stepNodes: resolvedStepIds.map((nodeId) => nodeMap.get(nodeId)),
      edges: resolvedEdgeIds.map((edgeId) => edgeMap.get(edgeId)),
      dependencyLinks: dependencyEdgeIds.map((dependencyEdgeId) => dependencyLinkMap.get(dependencyEdgeId)).filter(Boolean),
      componentNodes,
      nodeSet: new Set(resolvedNodeIds),
      stepSet: new Set(resolvedStepIds),
      edgeSet: new Set(resolvedEdgeIds),
      dependencyEdgeSet: new Set(dependencyEdgeIds),
      sources: resolveSourceRefs(pipeline.source_ids, sourceMap),
    };
  });
  const pipelineMap = new Map(pipelines.map((pipeline) => [pipeline.id, pipeline]));

  pipelines.forEach((pipeline) => {
    pipeline.node_ids.forEach((nodeId) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        node.pipelines.push(pipeline);
      }
    });
  });

  const derivedToolProfiles = buildDerivedToolProfiles(pipelines, nodeMap, pipelineMap);
  nodes.forEach((node) => {
    if (node.kind !== "tool") {
      return;
    }
    node.toolProfile = derivedToolProfiles.get(node.id) || null;
  });

  const backbone = buildBackboneIndex(nodes, nodeMap, dependencyLinks, pipelines);
  nodes.forEach((node) => {
    node.backbonePrimaryScopeId = backbone.nodePrimaryScopeIdMap.get(node.id) || DEFAULT_BACKBONE_SCOPE_ID;
  });

  const depthMemo = new Map();
  const descendantMemo = new Map();
  const ancestorMemo = new Map();

  nodes.forEach((node) => {
    node.depth = computeDepth(node.id, nodeMap, depthMemo, new Set());
    node.descendantIds = collectReachable(node.id, nodeMap, "to", descendantMemo);
    node.ancestorIds = collectReachable(node.id, nodeMap, "from", ancestorMemo);
  });

  const pagerankMap = computePageRank(nodes, nodeMap);
  const betweennessMap = computeBetweenness(nodes, nodeMap);
  const denominator = Math.max(nodes.length - 1, 1);

  nodes.forEach((node) => {
    const reachability = new Set([...node.descendantIds, ...node.ancestorIds]);
    node._pagerank = pagerankMap.get(node.id) || 0;
    node._degree_centrality = (node.to.length + node.from.length) / denominator;
    node._betweenness_centrality = betweennessMap.get(node.id) || 0;
    node._descendant_ratio = node.descendantIds.size / denominator;
    node._prerequisite_ratio = node.ancestorIds.size / denominator;
    node._reachability_ratio = reachability.size / denominator;
    node.defaultVal = 1.4 + normalizeByMetric(node._reachability_ratio, 0, 1) * 5.6;
  });

  const categories = raw.lanes.map((lane) => ({
    id: lane.id,
    label: lane.label,
    color: CATEGORY_COLORS[lane.id] || "#89d3de",
    count: nodes.filter((node) => node.categoryId === lane.id).length,
  }));

  const metricRanges = new Map(
    METRIC_KEYS.map((key) => [
      key,
      {
        min: Math.min(...nodes.map((node) => node[key])),
        max: Math.max(...nodes.map((node) => node[key])),
      },
    ])
  );

  const traitFilterIndex = buildTraitFilterIndex(nodes, nodeMap);

  return {
    nodes,
    nodeMap,
    rawLinks,
    dependencyLinks,
    dependencyLinkMap,
    edgeMap,
    sourceMap,
    pipelines,
    pipelineMap,
    categories,
    metricRanges,
    traitFilterGroups: traitFilterIndex.groups,
    traitFilterItemMap: traitFilterIndex.itemMap,
    backbone,
  };
}

function rebuildGraph({ zoom = false } = {}) {
  ensureDerivedState();
  if (!state.graph) {
    renderStats();
    return;
  }
  const graphData = currentGraphData();
  state.graph.graphData(graphData);
  syncControls();
  renderLegend();
  renderStats(graphData);
  applyLayout({ zoom });
  refreshGraphStyles();
}

function applyLayout({ zoom = false } = {}) {
  const visibleNodes = currentVisibleNodes();
  if (!visibleNodes.length) {
    return;
  }

  if (state.layout === "force") {
    state.prepared.nodes.forEach((node) => {
      delete node.fx;
      delete node.fy;
      delete node.fz;
    });
    if (state.rendererMode === "3d" && typeof state.graph.numDimensions === "function") {
      state.graph.numDimensions(3);
    }
    state.graph.cooldownTicks(140).d3ReheatSimulation();
    if (zoom) {
      window.setTimeout(() => focusGraphCore({ duration: 700 }), 260);
      window.setTimeout(() => focusGraphCore({ duration: 380 }), 900);
    }
    return;
  }

  const positions =
    state.layout === "hierarchical"
      ? computeHierarchicalLayout(visibleNodes)
      : state.layout === "cluster"
        ? computeClusterLayout(visibleNodes)
        : computeRadialLayout(visibleNodes, state.primarySelectionId, state.prepared.nodeMap);

  visibleNodes.forEach((node) => {
    const target = positions.get(node.id);
    if (!target) {
      return;
    }
    node.x = target.x;
    node.y = target.y;
    node.fx = target.x;
    node.fy = target.y;
    if (state.rendererMode === "3d") {
      node.z = target.z;
      node.fz = target.z;
    }
  });

  state.graph.cooldownTicks(0);
  state.graph.d3ReheatSimulation();
  state.graph.refresh?.();
  if (zoom) {
    window.setTimeout(() => focusGraphCore({ duration: 700, positions }), 60);
  }
}

function currentGraphData() {
  const derived = ensureDerivedState();
  return {
    nodes: derived.visibleNodes,
    links: derived.visibleLinks,
  };
}

function currentVisibleNodes() {
  return ensureDerivedState().visibleNodes;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolvedNodePosition(node, positions = null) {
  if (positions?.has(node.id)) {
    return positions.get(node.id);
  }

  const x = Number.isFinite(node.fx) ? node.fx : node.x;
  const y = Number.isFinite(node.fy) ? node.fy : node.y;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return { x, y };
}

function snapshotNodePositions(nodes = currentVisibleNodes()) {
  const positions = new Map();
  nodes.forEach((node) => {
    const position = resolvedNodePosition(node);
    if (position) {
      positions.set(node.id, { x: position.x, y: position.y });
    }
  });
  return positions;
}

function percentile(sortedValues, fraction) {
  if (!sortedValues.length) {
    return 0;
  }

  const index = (sortedValues.length - 1) * fraction;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex];
  }

  const weight = index - lowerIndex;
  return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
}

function robustViewMetricsFromPositions(positions) {
  const samples = positions.filter(
    (position) => position && Number.isFinite(position.x) && Number.isFinite(position.y)
  );
  if (!samples.length) {
    return null;
  }

  const xs = samples.map((position) => position.x).sort((left, right) => left - right);
  const ys = samples.map((position) => position.y).sort((left, right) => left - right);
  const trimFraction = samples.length > 48 ? 0.08 : samples.length > 20 ? 0.04 : 0;
  const minX = percentile(xs, trimFraction);
  const maxX = percentile(xs, 1 - trimFraction);
  const minY = percentile(ys, trimFraction);
  const maxY = percentile(ys, 1 - trimFraction);

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: Math.max(140, maxX - minX),
    height: Math.max(140, maxY - minY),
  };
}

function focusGraphCore({ duration = 700, positions = null } = {}) {
  if (!state.graph || state.rendererMode !== "2d") {
    return;
  }

  const samples = currentVisibleNodes()
    .map((node) => resolvedNodePosition(node, positions))
    .filter(Boolean);
  const metrics = robustViewMetricsFromPositions(samples);
  if (!metrics) {
    return;
  }

  const viewportWidth = refs.graphCanvas?.clientWidth || window.innerWidth;
  const viewportHeight = refs.graphCanvas?.clientHeight || window.innerHeight;
  const padX = Math.max(120, viewportWidth * 0.12);
  const padY = Math.max(120, viewportHeight * 0.12);
  const zoomX = (viewportWidth - padX * 2) / metrics.width;
  const zoomY = (viewportHeight - padY * 2) / metrics.height;
  const nextZoom = clamp(Math.min(zoomX, zoomY), 0.2, 2.4);

  state.graph.centerAt(metrics.centerX, metrics.centerY, duration);
  state.graph.zoom(nextZoom, duration);
}

function recenterGraphView() {
  if (!state.graph) {
    return;
  }

  if (state.rendererMode === "3d") {
    state.graph.zoomToFit?.(700, 80);
    return;
  }

  focusGraphCore({ duration: 700 });
}

function emptySelectionContext() {
  return {
    selected: new Set(),
    prerequisites: new Set(),
    dependents: new Set(),
    prerequisitesAndSelected: new Set(),
    dependentsAndSelected: new Set(),
  };
}

function collectReachableWithinAdjacency(startId, adjacencyMap, allowedNodeIds = null) {
  const visited = new Set();
  if (!adjacencyMap?.has(startId)) {
    return visited;
  }

  const stack = [...adjacencyMap.get(startId)];
  while (stack.length) {
    const currentId = stack.pop();
    if (visited.has(currentId)) {
      continue;
    }
    if (allowedNodeIds && !allowedNodeIds.has(currentId)) {
      continue;
    }
    visited.add(currentId);
    const neighbors = adjacencyMap.get(currentId);
    if (!neighbors) {
      continue;
    }
    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        stack.push(neighborId);
      }
    });
  }

  return visited;
}

function collectReachableThroughNodeMap(startId, direction, allowedNodeIds = null) {
  const visited = new Set();
  const startNode = state.prepared?.nodeMap.get(startId);
  if (!startNode) {
    return visited;
  }

  const stack = [...(startNode[direction] || [])];
  while (stack.length) {
    const currentId = stack.pop();
    if (visited.has(currentId)) {
      continue;
    }
    if (allowedNodeIds && !allowedNodeIds.has(currentId)) {
      continue;
    }
    visited.add(currentId);
    const currentNode = state.prepared.nodeMap.get(currentId);
    if (!currentNode) {
      continue;
    }
    (currentNode[direction] || []).forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        stack.push(neighborId);
      }
    });
  }

  return visited;
}

function computeSelectionContext(allowedNodeIds = null, parentMap = null, childMap = null) {
  const selected = new Set(state.selectedNodeIds);
  const prerequisites = new Set();
  const dependents = new Set();

  selected.forEach((id) => {
    if (allowedNodeIds && !allowedNodeIds.has(id)) {
      return;
    }
    collectReachableWithinAdjacency(id, parentMap, allowedNodeIds).forEach((ancestorId) => prerequisites.add(ancestorId));
    collectReachableWithinAdjacency(id, childMap, allowedNodeIds).forEach((descendantId) => dependents.add(descendantId));
  });

  selected.forEach((id) => {
    prerequisites.delete(id);
    dependents.delete(id);
  });

  return {
    selected,
    prerequisites,
    dependents,
    prerequisitesAndSelected: new Set([...selected, ...prerequisites]),
    dependentsAndSelected: new Set([...selected, ...dependents]),
  };
}

function emptyBackboneState() {
  return {
    scope: null,
    projectionNodeIds: new Set(),
    coreNodeIds: new Set(),
  };
}

function currentBackboneScope() {
  return (
    state.prepared?.backbone?.scopeMap.get(state.backboneScopeId) ||
    state.prepared?.backbone?.scopeMap.get(DEFAULT_BACKBONE_SCOPE_ID) ||
    null
  );
}

function backboneBranchLabel(node, scope = currentBackboneScope()) {
  const branchId = scope?.nodeBranchMap?.get(node.id);
  return branchId ? sentenceCase(branchId) : "";
}

function computeBackboneState() {
  const scope = currentBackboneScope();
  if (!scope) {
    return emptyBackboneState();
  }

  const projectionNodeIds = new Set(scope.baseVisibleIds);

  state.selectedNodeIds.forEach((nodeId) => {
    projectionNodeIds.add(nodeId);
    collectReachableWithinAdjacency(nodeId, scope.workflowParentMap, scope.projectableNodeIds).forEach((ancestorId) =>
      projectionNodeIds.add(ancestorId)
    );
    collectReachableWithinAdjacency(nodeId, scope.workflowChildMap, scope.projectableNodeIds).forEach((descendantId) =>
      projectionNodeIds.add(descendantId)
    );
  });

  if (state.activePipelineId && scope.pipelineIds.has(state.activePipelineId)) {
    (scope.pipelineStepSequences.get(state.activePipelineId) || []).forEach((nodeId) => projectionNodeIds.add(nodeId));
  }

  return {
    scope,
    projectionNodeIds,
    coreNodeIds: new Set(scope.coreNodeIds),
  };
}

function buildAdjacencyMaps(nodes, links) {
  const parentMap = new Map(nodes.map((node) => [node.id, new Set()]));
  const childMap = new Map(nodes.map((node) => [node.id, new Set()]));

  links.forEach((link) => {
    const sourceId = getLinkSourceId(link);
    const targetId = getLinkTargetId(link);
    if (!parentMap.has(targetId) || !childMap.has(sourceId)) {
      return;
    }
    parentMap.get(targetId).add(sourceId);
    childMap.get(sourceId).add(targetId);
  });

  return {
    parentMap,
    childMap,
  };
}

function buildBackboneProjectionLinks(scope, visibleNodeIds) {
  if (!scope) {
    return [];
  }

  const linkMap = new Map();

  scope.pipelineStepSequences.forEach((sequence, pipelineId) => {
    const visibleSequence = sequence.filter((nodeId) => visibleNodeIds.has(nodeId));
    const compressedSequence = visibleSequence.filter(
      (nodeId, index) => index === 0 || visibleSequence[index - 1] !== nodeId
    );

    for (let index = 0; index < compressedSequence.length - 1; index += 1) {
      const sourceId = compressedSequence[index];
      const targetId = compressedSequence[index + 1];
      if (!sourceId || !targetId || sourceId === targetId) {
        continue;
      }

      const linkId = `backbone_${sourceId}_${targetId}`;
      if (!linkMap.has(linkId)) {
        linkMap.set(linkId, {
          id: linkId,
          sourceId,
          targetId,
          source: sourceId,
          target: targetId,
          count: 0,
          pipelineIds: [],
          curvature: deterministicCurvature(sourceId, targetId),
          relationKinds: ["workflow_step_path"],
          sources: [],
          isBackboneProjection: true,
        });
      }

      const link = linkMap.get(linkId);
      link.count += 1;
      if (!link.pipelineIds.includes(pipelineId)) {
        link.pipelineIds.push(pipelineId);
      }
    }
  });

  return [...linkMap.values()];
}

function markDerivedStateDirty() {
  state.derivedDirty = true;
}

function ensureDerivedState() {
  if (!state.prepared) {
    return {
      projectedNodes: [],
      projectionNodeIds: new Set(),
      visibleNodes: [],
      visibleNodeIds: new Set(),
      visibleLinks: [],
      parentMap: new Map(),
      childMap: new Map(),
      backboneState: emptyBackboneState(),
      selectionContext: emptySelectionContext(),
      activePipeline: null,
      traitFilterState: emptyTraitFilterState(),
    };
  }

  if (!state.derivedDirty && state.derived) {
    return state.derived;
  }

  const backboneState = state.viewMode === "backbone" ? computeBackboneState() : emptyBackboneState();
  const projectionNodeIds =
    state.viewMode === "backbone"
      ? backboneState.projectionNodeIds
      : new Set(state.prepared.nodes.map((node) => node.id));
  const projectedNodes = state.prepared.nodes.filter((node) => projectionNodeIds.has(node.id));
  const visibleNodes = projectedNodes.filter((node) => state.visibleCategories.has(node.categoryId));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const projectedLinks =
    state.viewMode === "backbone"
      ? buildBackboneProjectionLinks(backboneState.scope, projectionNodeIds)
      : state.prepared.dependencyLinks.map((link) => ({
          ...link,
          source: link.sourceId,
          target: link.targetId,
        }));
  const visibleLinks = projectedLinks.filter(
    (link) => visibleNodeIds.has(getLinkSourceId(link)) && visibleNodeIds.has(getLinkTargetId(link))
  );
  const { parentMap, childMap } = buildAdjacencyMaps(visibleNodes, visibleLinks);
  const activePipeline =
    state.activePipelineId &&
    state.prepared.pipelineMap.has(state.activePipelineId) &&
    (state.viewMode !== "backbone" || backboneState.scope?.pipelineIds.has(state.activePipelineId))
      ? state.prepared.pipelineMap.get(state.activePipelineId)
      : null;

  state.derived = {
    projectedNodes,
    projectionNodeIds,
    visibleNodes,
    visibleNodeIds,
    visibleLinks,
    parentMap,
    childMap,
    backboneState,
    selectionContext: computeSelectionContext(visibleNodeIds, parentMap, childMap),
    activePipeline,
    traitFilterState: computeTraitFilterState(),
  };
  state.derivedDirty = false;
  return state.derived;
}

function renderSettingsFilters() {
  if (!refs.traitFilterShell || !state.prepared) {
    return;
  }
  refs.traitFilterShell.innerHTML = settingsTraitFiltersHtml();
}

function settingsTraitFiltersHtml() {
  const activeItems = activeTraitFilterItems();
  return `
    <div class="trait-filter-toolbar">
      <p class="section-copy">
        Tools must match all active traits. Matching tools and their linked workflows stay highlighted in the graph.
      </p>
      ${
        activeItems.length
          ? `<button type="button" class="settings-inline-action" data-clear-trait-filters="true">Clear</button>`
          : ""
      }
    </div>
    ${
      activeItems.length
        ? `<div class="filter-pill-row">${activeItems.map((item) => filterPillHtml(item)).join("")}</div>`
        : `<p class="section-copy">No active trait filters.</p>`
    }
    ${state.prepared.traitFilterGroups
      .map(
        (group) => `
          <div class="trait-filter-group">
            <h4>${escapeHtml(group.title)}</h4>
            <div class="trait-filter-grid">
              ${group.items.map((item) => traitFilterChipHtml(item)).join("")}
            </div>
          </div>
        `
      )
      .join("")}
  `;
}

function traitFilterChipHtml(item) {
  return `
    <button
      type="button"
      class="trait-filter-chip ${state.activeTraitFilters.has(item.key) ? "is-active" : ""}"
      data-trait-filter="${escapeHtml(item.key)}"
    >
      <span>${escapeHtml(item.label)}</span>
      <span class="trait-filter-chip-count">${item.count}</span>
    </button>
  `;
}

function filterPillHtml(item) {
  return `
    <span class="filter-pill">
      <span class="pill-dot" style="background:${escapeHtml(item.color)}"></span>
      ${escapeHtml(item.label)}
    </span>
  `;
}

function activeTraitFilterItems() {
  return [...state.activeTraitFilters]
    .map((key) => state.prepared.traitFilterItemMap.get(key))
    .filter(Boolean)
    .sort((left, right) => left.label.localeCompare(right.label));
}

function toggleTraitFilter(key) {
  if (!key || !state.prepared.traitFilterItemMap.has(key)) {
    return;
  }

  if (state.activeTraitFilters.has(key)) {
    state.activeTraitFilters.delete(key);
  } else {
    state.activeTraitFilters.add(key);
  }

  markDerivedStateDirty();
  renderSettingsFilters();
  renderPanels();
  refreshGraphStyles();
  syncUrlState();
}

function searchDiscoveryGroups() {
  if (!state.prepared) {
    return [];
  }

  const groups = SEARCH_DISCOVERY_GROUPS.map((group) => ({
    ...group,
    nodes: group.ids.map((id) => state.prepared.nodeMap.get(id)).filter(Boolean),
  })).filter((group) => group.nodes.length);

  if (state.viewMode === "backbone") {
    const scope = currentBackboneScope();
    const keystoneNodes = (scope?.keyNodeIds || [])
      .map((id) => state.prepared.nodeMap.get(id))
      .filter(Boolean);
    if (keystoneNodes.length) {
      groups.unshift({
        title: `${scope.label} keystones`,
        nodes: keystoneNodes,
      });
    }
  }

  return groups;
}

function currentSearchOptions() {
  const query = state.searchDraft.trim().toLowerCase();
  return query ? currentSearchSuggestions(query) : searchDiscoveryGroups().flatMap((group) => group.nodes);
}

function currentSearchSuggestions(query = state.searchDraft.trim().toLowerCase()) {
  if (!state.prepared || !query) {
    return [];
  }

  return state.prepared.nodes
    .map((node) => ({ node, score: searchSuggestionScore(node, query) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.node.label.localeCompare(right.node.label))
    .slice(0, 12)
    .map((entry) => entry.node);
}

function searchSuggestionScore(node, query) {
  const label = node.label.toLowerCase();
  const kind = node.kindLabel.toLowerCase();
  const category = node.category.toLowerCase();
  const definition = (node.definition || "").toLowerCase();
  const words = label.split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;

  if (label === query) {
    score = 1000;
  } else if (label.startsWith(query)) {
    score = 860;
  } else if (words.some((word) => word.startsWith(query))) {
    score = 760;
  } else if (label.includes(query)) {
    score = 620;
  } else if (kind.includes(query)) {
    score = 280;
  } else if (category.includes(query)) {
    score = 240;
  } else if (definition.includes(query)) {
    score = 120;
  } else {
    return 0;
  }

  if (node.kind === "tool") {
    score += 24;
  }

  return score;
}

function searchResultMeta(node) {
  return `${node.kindLabel} · ${node.category}`;
}

function searchResultDetail(node) {
  if (node.kind === "tool" && node.toolProfile) {
    const algorithmCount =
      (node.toolProfile.componentNodes.algorithm_ids?.length || 0) +
      (node.toolProfile.componentNodes.concept_ids?.length || 0);
    const moduleStageCount =
      (node.toolProfile.componentNodes.module_ids?.length || 0) +
      (node.toolProfile.componentNodes.stage_ids?.length || 0);
    return [
      `${node.toolProfile.linkedPipelines.length} linked workflows`,
      algorithmCount ? `${algorithmCount} linked algorithms or concepts` : "",
      moduleStageCount ? `${moduleStageCount} modules or stages` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return [
    node.pipelines.length ? `${node.pipelines.length} linked workflows` : "",
    node.from.length ? `${node.from.length} direct prerequisites` : "",
    node.to.length ? `${node.to.length} direct dependents` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function searchResultButtonHtml(node, index) {
  const active = index === state.searchActiveIndex;
  const detail = searchResultDetail(node);
  return `
    <button
      type="button"
      role="option"
      aria-selected="${active ? "true" : "false"}"
      class="search-result-item ${active ? "is-active" : ""}"
      data-search-target="${escapeHtml(node.id)}"
    >
      <strong>${escapeHtml(node.label)}</strong>
      <span class="search-result-meta">${escapeHtml(searchResultMeta(node))}</span>
      ${detail ? `<span class="search-result-detail">${escapeHtml(detail)}</span>` : ""}
    </button>
  `;
}

function searchResultsHtml() {
  const query = state.searchDraft.trim();

  if (!query) {
    const groups = searchDiscoveryGroups();
    if (!groups.length) {
      return `
        <div class="search-results-header">Browse the catalog</div>
        <div class="search-results-empty">No search suggestions are available yet.</div>
      `;
    }

    let activeIndex = 0;
    const sectionsHtml = groups
      .map((group) => {
        const buttons = group.nodes.map((node) => searchResultButtonHtml(node, activeIndex++)).join("");
        return `
          <section class="search-results-section">
            <div class="search-results-title">${escapeHtml(group.title)}</div>
            <div class="search-results-list">${buttons}</div>
          </section>
        `;
      })
      .join("");

    return `
      <div class="search-results-header">Browse the catalog</div>
      <div class="search-results-copy">
        Start typing to search all ${state.prepared.nodes.length} nodes by label. Selecting a tool opens its factual tool record and linked workflow path.
      </div>
      ${sectionsHtml}
    `;
  }

  const suggestions = currentSearchSuggestions(query.toLowerCase());
  if (!suggestions.length) {
    return `
      <div class="search-results-header">Matching nodes</div>
      <div class="search-results-empty">No nodes matched that label. Try a tool name, an algorithm, a stage, or an output.</div>
    `;
  }

  return `
    <div class="search-results-header">Matching nodes (${suggestions.length})</div>
    <div class="search-results-copy">
      Results are ranked by node label first. Select a node to open its record, references, and linked workflow path.
    </div>
    <div class="search-results-list">
      ${suggestions.map((node, index) => searchResultButtonHtml(node, index)).join("")}
    </div>
  `;
}

function renderSearchResults() {
  if (!refs.searchResults) {
    return;
  }

  const open = state.searchMenuOpen;
  refs.searchResults.hidden = !open;
  refs.search.setAttribute("aria-expanded", String(open));
  if (!open) {
    refs.searchResults.innerHTML = "";
    return;
  }

  refs.searchResults.innerHTML = searchResultsHtml();
}

function commitSearchSelection(nodeId) {
  if (!nodeId || !state.prepared.nodeMap.has(nodeId)) {
    return;
  }

  const node = state.prepared.nodeMap.get(nodeId);
  refs.search.value = node.label;
  state.searchDraft = node.label;
  state.searchMenuOpen = false;
  state.searchActiveIndex = -1;

  if (!state.visibleCategories.has(node.categoryId)) {
    state.visibleCategories.add(node.categoryId);
    markDerivedStateDirty();
    rebuildGraph({ zoom: false });
  }

  setPanelsHidden(false);
  renderSearchResults();
  selectSingleNode(nodeId);
}

function clearTraitFilters() {
  if (!state.activeTraitFilters.size) {
    return;
  }
  state.activeTraitFilters = new Set();
  markDerivedStateDirty();
  renderSettingsFilters();
  renderPanels();
  refreshGraphStyles();
  syncUrlState();
}

function currentCategoryCounts() {
  const projectedNodeIds = ensureDerivedState().projectionNodeIds;
  return new Map(
    state.prepared.categories.map((category) => [
      category.id,
      state.prepared.nodes.filter(
        (node) => projectedNodeIds.has(node.id) && node.categoryId === category.id
      ).length,
    ])
  );
}

function renderLegend() {
  refs.legend.innerHTML = "";
  const counts = currentCategoryCounts();

  state.prepared.categories.forEach((category) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "legend-item";
    if (!state.visibleCategories.has(category.id)) {
      item.classList.add("is-disabled");
    }

    item.innerHTML = `
      <span class="legend-dot" style="background:${escapeHtml(category.color)}"></span>
      <span class="legend-label">${escapeHtml(category.label)}</span>
      <span class="legend-count">${counts.get(category.id) || 0}</span>
    `;

    item.addEventListener("click", () => {
      if (state.visibleCategories.has(category.id)) {
        state.visibleCategories.delete(category.id);
      } else {
        state.visibleCategories.add(category.id);
      }
      markDerivedStateDirty();

      if (state.visibleCategories.size === 0) {
        state.visibleCategories.add(category.id);
      }

      const primaryVisible =
        state.primarySelectionId &&
        state.visibleCategories.has(state.prepared.nodeMap.get(state.primarySelectionId)?.categoryId);
      if (!primaryVisible) {
        clearSelection();
      }

      rebuildGraph({ zoom: false });
      renderPanels();
    });

    refs.legend.appendChild(item);
  });
}

function renderStats(graphData = currentGraphData()) {
  if (!graphData) {
    refs.stats.textContent = "Renderer unavailable";
    return;
  }

  const totalNodes = graphData.nodes.length;
  const totalEdges = graphData.links.length;
  const selected = state.selectedNodeIds.size;
  const traitFilters = toolTraitFilterState();
  const parts = [`${totalNodes} nodes`, `${totalEdges} edges`];
  if (state.viewMode === "backbone") {
    const scope = ensureDerivedState().backboneState.scope;
    if (scope) {
      parts.unshift(`Backbone: ${scope.label}`);
    }
  }
  if (selected) {
    parts.push(`${selected} selected`);
  }
  if (traitFilters.active) {
    parts.push(`${traitFilters.toolIds.size} tool matches`);
  }
  refs.stats.textContent = parts.join(" · ");
}

function renderPanels() {
  renderInfoPanel();
  renderAnalyticsPanel();
  renderStats();
}

function renderInfoPanel() {
  if (!state.primarySelectionId) {
    refs.infoBody.innerHTML = overviewInfoHtml();
    return;
  }

  const selection = selectedNodes();
  if (selection.length > 1) {
    refs.infoBody.innerHTML = groupInfoHtml(selection);
    return;
  }

  const node = selection[0];
  refs.infoBody.innerHTML = nodeInfoHtml(node);
}

function renderAnalyticsPanel() {
  if (!state.primarySelectionId) {
    refs.analyticsBody.innerHTML = overviewAnalyticsHtml();
    bindPanelActions();
    return;
  }

  const selection = selectedNodes();
  refs.analyticsBody.innerHTML =
    selection.length > 1 ? groupAnalyticsHtml(selection) : nodeAnalyticsHtml(selection[0]);
  bindPanelActions();
}

function currentProjectionMetrics() {
  const nodes = currentVisibleNodes();
  if (!nodes.length) {
    return { roots: 0, leaves: 0, maxDepth: 0 };
  }

  const derived = ensureDerivedState();
  const depthMap = computeProjectionDepthMap(nodes, derived.parentMap, derived.childMap);
  return {
    roots: nodes.filter((node) => (derived.parentMap.get(node.id)?.size || 0) === 0).length,
    leaves: nodes.filter((node) => (derived.childMap.get(node.id)?.size || 0) === 0).length,
    maxDepth: Math.max(...nodes.map((node) => depthMap.get(node.id) || 0)),
  };
}

function backboneKeyNodeButtonsHtml(scope) {
  const keyNodes = (scope?.keyNodeIds || [])
    .map((nodeId) => {
      const node = state.prepared.nodeMap.get(nodeId);
      const stat = scope.nodeStats.get(nodeId);
      if (!node || !stat) {
        return "";
      }
      return `
        <button type="button" data-node-target="${escapeHtml(node.id)}">
          <strong>${escapeHtml(node.label)}</strong><br>
          ${escapeHtml(
            `${stat.ancestorCount} upstream · ${stat.descendantCount} downstream · ${stat.pipelineCount} workflows`
          )}
        </button>
      `;
    })
    .filter(Boolean)
    .join("");

  return keyNodes ? `<div class="action-grid">${keyNodes}</div>` : `<p class="info-copy">No keystone nodes are available in this scope yet.</p>`;
}

function backboneRecurringNodeButtonsHtml(scope) {
  const nodesHtml = (scope?.recurringNodeIds || [])
    .map((nodeId) => {
      const node = state.prepared.nodeMap.get(nodeId);
      const stat = scope.nodeStats.get(nodeId);
      if (!node || !stat) {
        return "";
      }
      return `
        <button type="button" data-node-target="${escapeHtml(node.id)}">
          <strong>${escapeHtml(node.label)}</strong><br>
          ${escapeHtml(`${stat.stepCount} step workflows · ${stat.pipelineCount} scoped workflows`)}
        </button>
      `;
    })
    .filter(Boolean)
    .join("");

  return nodesHtml ? `<div class="action-grid">${nodesHtml}</div>` : `<p class="info-copy">No recurring workflow hubs are available in this scope yet.</p>`;
}

function overviewInfoHtml() {
  if (state.viewMode === "backbone") {
    const derived = ensureDerivedState();
    const scope = derived.backboneState.scope;
    const graphData = currentGraphData();
    return `
      <div class="detail-stack">
        <div>
          <h2 class="detail-heading">Backbone view of genome assembly.</h2>
          <p class="info-copy">
            This projection trims the graph to the most reusable bridge nodes in
            <strong>${escapeHtml(scope.label)}</strong>. Lower nodes act as prerequisites, while higher nodes
            capture downstream assembly structure and goals.
          </p>
        </div>

        <div class="summary-grid">
          <div class="summary-card"><strong>${graphData.nodes.length}</strong><span>Visible backbone nodes</span></div>
          <div class="summary-card"><strong>${scope.coreNodeIds.size}</strong><span>Keystone nodes</span></div>
          <div class="summary-card"><strong>${scope.pipelineCount}</strong><span>Scoped workflows</span></div>
          <div class="summary-card"><strong>${graphData.links.length}</strong><span>Visible workflow edges</span></div>
        </div>

        <section class="info-section">
          <h3>Scope</h3>
          <p class="info-copy">${escapeHtml(scope.description)}</p>
        </section>

        <section class="info-section">
          <h3>Keystone Nodes</h3>
          <p class="info-copy">
            These nodes score highest as bridges between fundamental prerequisites and downstream workflow structure in the current scope.
          </p>
          ${backboneKeyNodeButtonsHtml(scope)}
        </section>

        <section class="info-section">
          <h3>Recurring Workflow Hubs</h3>
          <p class="info-copy">
            These nodes show up most often as actual workflow steps or repeated prerequisites inside the current scope.
          </p>
          ${backboneRecurringNodeButtonsHtml(scope)}
        </section>

        <section class="info-section">
          <h3>How To Read It</h3>
          <p class="info-copy">
            ${
              scope.layoutMode === "branch_universe"
                ? `This scope places short-read bridges on the left, the shared assembly spine in the center, and long-read bridges on the right.
            Backbone mode still only draws edges that follow recorded workflow-step order, so the combined map reads like one universe with two technology branches instead of a generic force cloud.`
                : `Backbone mode keeps recurring workflow primitives visible by default and only draws edges that follow the
            ordered step sequences inside the selected scope. The hierarchical layout pins those nodes into workflow lanes
            so the rendered links follow the actual assembly story instead of a generic force cloud.`
            }
          </p>
        </section>

        <section class="spotlight-card">
          <p>
            Select a keystone node such as graph construction, graph cleanup, consensus refinement, or scaffolding to reveal its prerequisite cone and downstream influence.
          </p>
        </section>
      </div>
    `;
  }

  const nodes = state.prepared.nodes.length;
  const edges = state.prepared.dependencyLinks.length;
  const rawRelations = state.prepared.rawLinks.length;
  const pipelines = state.raw.pipelines.length;
  return `
    <div class="detail-stack">
      <div>
        <h2 class="detail-heading">Interactive map of genome assembly workflows.</h2>
        <p class="info-copy">
          This explorer maps how genome assembly workflows connect reads, support data, algorithms,
          reusable modules, tools, stages, outputs, and metrics. Select a node to inspect
          linked workflow paths and the graph components attached to them.
        </p>
      </div>

      <div class="summary-grid">
        <div class="summary-card"><strong>${nodes}</strong><span>Curated nodes</span></div>
        <div class="summary-card"><strong>${edges}</strong><span>Dependency DAG edges</span></div>
        <div class="summary-card"><strong>${rawRelations}</strong><span>Curated relations</span></div>
        <div class="summary-card"><strong>${pipelines}</strong><span>Curated workflows</span></div>
      </div>

      <section class="info-section">
        <h3>Example Views</h3>
        <p class="info-copy">
          These buttons open a few representative nodes and workflow views from the dataset.
        </p>
        ${startHereButtonsHtml()}
      </section>

      <section class="info-section">
        <h3>How To Read It</h3>
        <p class="info-copy">
          Nodes represent assembly goals, read types, support data, algorithms, reusable modules,
          tools, pipeline stages, outputs, and metrics. Click a node to inspect its
          prerequisites and dependents, or shift-click to build a comparison set.
        </p>
      </section>

      <section class="info-section">
        <h3>How The Dataset Is Built</h3>
        <p class="info-copy">
          The explorer keeps the full curated relation set, but recursive prerequisite traversal now runs on a
          dependency-only DAG derived from those relations. Pairing, suitability, validation, and other contextual
          links still live in the workflow records and node details, but they no longer pollute dependency paths.
        </p>
      </section>

      ${
        state.graphError
          ? `
            <section class="info-section">
              <h3>Renderer Status</h3>
              <p class="info-copy">
                WebGL was unavailable here, so the explorer dropped to a 2D force-graph fallback.
                The interaction model stays intact, including layout changes, highlighting, and recentring in the 2D fallback.
              </p>
            </section>
          `
          : ""
      }

      <section class="spotlight-card">
        <p>
          Reset clears the active selection, search, and tool filters while keeping the current overview layout in place.
        </p>
      </section>
    </div>
  `;
}

function overviewAnalyticsHtml() {
  const metrics = currentProjectionMetrics();
  const categoryCounts = currentCategoryCounts();

  if (state.viewMode === "backbone") {
    const scope = ensureDerivedState().backboneState.scope;
    return `
      <div class="analytics-body">
        <div class="badge-row">
          <span class="info-badge">Root nodes: ${metrics.roots}</span>
          <span class="info-badge">Leaf nodes: ${metrics.leaves}</span>
          <span class="info-badge">Max depth: ${metrics.maxDepth}</span>
          <span class="info-badge">Scope: ${escapeHtml(scope.label)}</span>
        </div>

        <section class="analytics-block">
          <h3>Projection Rules</h3>
          <p class="analytics-copy">
            ${
              scope.layoutMode === "branch_universe"
                ? `This universe view keeps only the bridge nodes needed to connect the short-read branch, the shared assembly spine,
            and the long-read branch. In hierarchical layout, those branches stay separated horizontally while the shared center keeps the combined path legible.`
                : `Backbone mode now starts from recurring workflow hubs inside the selected scope, then adds only the connector
            nodes needed to preserve adjacent step order. In hierarchical layout, each category stays in a fixed workflow
            lane so the visible edges track the actual path being shown.`
            }
          </p>
        </section>

        <section class="analytics-block">
          <h3>Keystone Ranking</h3>
          ${backboneKeyNodeButtonsHtml(scope)}
        </section>

        <section class="analytics-block">
          <h3>Recurring Workflow Hubs</h3>
          ${backboneRecurringNodeButtonsHtml(scope)}
        </section>

        ${toolTraitFilterSummaryHtml()}

        <section class="analytics-block">
          <h3>Path Highlighting</h3>
          <div class="toggle-grid">
            <label class="toggle-option">
              <input id="toggle-prerequisites" type="checkbox" ${state.showPrerequisites ? "checked" : ""}>
              <span>Show prerequisites</span>
            </label>
            <label class="toggle-option">
              <input id="toggle-dependents" type="checkbox" ${state.showDependents ? "checked" : ""}>
              <span>Show dependents</span>
            </label>
          </div>
        </section>

        <section class="analytics-block">
          <h3>Coverage</h3>
          <div class="metrics-grid">
            ${state.prepared.categories
              .map(
                (category) => `
                  <div class="metric-card">
                    <strong>${categoryCounts.get(category.id) || 0}</strong>
                    <span>${escapeHtml(category.label)}</span>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      </div>
    `;
  }

  return `
    <div class="analytics-body">
      <div class="badge-row">
        <span class="info-badge">Root nodes: ${metrics.roots}</span>
        <span class="info-badge">Leaf nodes: ${metrics.leaves}</span>
        <span class="info-badge">Max depth: ${metrics.maxDepth}</span>
      </div>

      <section class="analytics-block">
        <h3>Explorer State</h3>
        <p class="analytics-copy">
          Search works as a node finder with browse sections and ranked label matches. Recursive prerequisites and
          dependents now come from the dependency DAG only, so selecting a node no longer floods the graph through
          pairing, validation, or other contextual relation types.
        </p>
      </section>

      ${toolTraitFilterSummaryHtml()}

      <section class="analytics-block">
        <h3>Path Highlighting</h3>
        <div class="toggle-grid">
          <label class="toggle-option">
            <input id="toggle-prerequisites" type="checkbox" ${state.showPrerequisites ? "checked" : ""}>
            <span>Show prerequisites</span>
          </label>
          <label class="toggle-option">
            <input id="toggle-dependents" type="checkbox" ${state.showDependents ? "checked" : ""}>
            <span>Show dependents</span>
          </label>
        </div>
      </section>

      <section class="analytics-block">
        <h3>Coverage</h3>
        <div class="metrics-grid">
          ${state.prepared.categories
            .map(
              (category) => `
                <div class="metric-card">
                  <strong>${categoryCounts.get(category.id) || 0}</strong>
                  <span>${escapeHtml(category.label)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function nodeInfoHtml(node) {
  const currentPipeline = activePipelineForNode(node);
  const toolProfile = toolProfileForNode(node);
  const backboneScope = state.viewMode === "backbone" ? ensureDerivedState().backboneState.scope : null;
  const backboneStat = backboneScope?.nodeStats.get(node.id) || null;
  const landingIntro =
    state.selectionSource === "default" && node.id === DEFAULT_NODE_ID
      ? `
        <section class="spotlight-card">
          <p>
            <strong>Default view.</strong> ${escapeHtml(node.label)} is selected on initial load so the
            interface opens with one concrete workflow path already highlighted.
          </p>
        </section>

        <section class="info-section">
          <h3>Other Example Views</h3>
          <p class="info-copy">
            These links switch to other nodes and workflow views from the same dataset.
          </p>
          ${startHereButtonsHtml(START_HERE_ITEMS.filter((item) => item.id !== DEFAULT_NODE_ID))}
        </section>
      `
      : "";
  const toolRecord = toolProfile ? toolProfileBreakdownHtml(node, toolProfile) : "";
  const referenceSection = nodeReferenceSectionHtml(node, currentPipeline);
  const pipelineChooser =
    node.pipelines.length > 0
      ? `
        <section class="info-section">
          <h3>Linked Workflows</h3>
          <p class="info-copy">
            Choose a workflow entry linked to this node. The graph highlights the recorded path nodes and any
            compatible workflow-step edges for that workflow record.
          </p>
          ${pipelineChooserHtml(node, currentPipeline)}
        </section>
      `
      : "";
  const pipelineBreakdown = currentPipeline ? pipelineBreakdownHtml(currentPipeline) : "";
  const branchLabel = backboneBranchLabel(node, backboneScope);

  return `
    <div class="detail-stack">
      <div>
        <h2 class="detail-heading">${escapeHtml(node.label)}</h2>
        <span class="category-pill">
          <span class="pill-dot" style="background:${escapeHtml(categoryColor(node))}"></span>
          ${escapeHtml(node.category)}
        </span>
      </div>

      <section class="info-section">
        <h3>Definition</h3>
        <p class="info-copy">${escapeHtml(node.definition || "No summary yet.")}</p>
      </section>

      <section class="info-section">
        <h3>Role In The Graph</h3>
        <p class="info-copy">
          ${
            state.viewMode === "backbone"
              ? `${escapeHtml(node.label)} is shown as a ${escapeHtml(node.kindLabel.toLowerCase())}
          inside the ${
            branchLabel && backboneScope?.layoutMode === "branch_universe"
              ? `${escapeHtml(branchLabel.toLowerCase())} branch and ${escapeHtml(node.category)} lane`
              : `${escapeHtml(node.category)} lane`
          } of the ${escapeHtml(backboneScope.label)} backbone, with
          ${projectionDirectNeighbors(node.id, "from").length} direct prerequisites and ${projectionDirectNeighbors(node.id, "to").length} direct dependents
          in the visible workflow projection.`
              : `${escapeHtml(node.label)} is tracked as a ${escapeHtml(node.kindLabel.toLowerCase())}
          inside the ${escapeHtml(node.category)} lane, with
          ${node.ancestorIds.size} recursive prerequisites and ${node.descendantIds.size} recursive dependents
          in the dependency DAG.`
          }
        </p>
      </section>

      ${
        backboneStat
          ? `
            <section class="info-section">
              <h3>Backbone Role</h3>
              <p class="info-copy">
                In the ${escapeHtml(backboneScope.label)} backbone, ${escapeHtml(node.label)} has
                ${backboneStat.ancestorCount} upstream nodes, ${backboneStat.descendantCount} downstream nodes,
                and appears in ${backboneStat.pipelineCount} scoped workflows.
                ${
                  backboneStat.isCore
                    ? " It is currently treated as a keystone bridge node."
                    : " It is currently shown as supporting context around the keystone layer."
                }
              </p>
            </section>
          `
          : ""
      }

      ${toolRecord}
      ${referenceSection}
      ${pipelineChooser}

      ${
        currentPipeline
          ? `
            <section class="spotlight-card">
              <p>
                <strong>Active workflow record:</strong> ${escapeHtml(currentPipeline.label)}<br>
                ${escapeHtml(pipelineFactSummary(currentPipeline))}
              </p>
            </section>
          `
          : ""
      }

      ${pipelineBreakdown}
      ${landingIntro}
    </div>
  `;
}

function nodeAnalyticsHtml(node) {
  const currentPipeline = activePipelineForNode(node);
  const toolProfile = toolProfileForNode(node);
  const backboneScope = state.viewMode === "backbone" ? ensureDerivedState().backboneState.scope : null;
  const backboneStat = backboneScope?.nodeStats.get(node.id) || null;
  return `
    <div class="analytics-body">
      <div class="badge-row">
        <span class="info-badge">Depth: ${node.depth}</span>
        <span class="info-badge">Direct prerequisites: ${projectionDirectNeighbors(node.id, "from").length}</span>
        <span class="info-badge">Direct dependents: ${projectionDirectNeighbors(node.id, "to").length}</span>
        ${
          currentPipeline
            ? `<span class="info-badge">Path steps: ${currentPipeline.stepNodes.length}</span>`
            : ""
        }
      </div>

      ${
        currentPipeline
          ? `
            <section class="analytics-block">
              <h3>Active Path</h3>
              <div class="metrics-grid">
                ${metricCardHtml("Workflow", currentPipeline.label)}
                ${metricCardHtml("Step nodes", String(currentPipeline.stepNodes.length))}
                ${metricCardHtml("Nodes in path", String(currentPipeline.nodes.length))}
                ${metricCardHtml("Edges in path", String(currentPipeline.edges.length))}
                ${metricCardHtml("Source links", String(currentPipeline.sources.length))}
              </div>
            </section>
          `
          : ""
      }

      ${
        backboneStat
          ? `
            <section class="analytics-block">
              <h3>Backbone Metrics</h3>
              <div class="metrics-grid">
                ${metricCardHtml("Backbone score", backboneStat.score.toFixed(3))}
                ${metricCardHtml("Upstream", String(backboneStat.ancestorCount))}
                ${metricCardHtml("Downstream", String(backboneStat.descendantCount))}
                ${metricCardHtml("Scoped workflows", String(backboneStat.pipelineCount))}
                ${metricCardHtml("Leaf coverage", `${Math.round(backboneStat.leafCoverageRatio * 100)}%`)}
                ${metricCardHtml("Role", backboneStat.isCore ? "Keystone" : "Context")}
              </div>
            </section>
          `
          : ""
      }

      ${toolProfile ? toolProfileAnalyticsHtml(toolProfile) : ""}
      ${toolTraitFilterSummaryHtml()}

      <section class="analytics-block">
        <h3>Graph Metrics</h3>
        <div class="metrics-grid">
          ${METRIC_KEYS.map((key) => metricCardHtml(metricLabel(key), formatMetric(node[key]))).join("")}
        </div>
      </section>

      <section class="analytics-block">
        <h3>Path Highlighting</h3>
        <div class="toggle-grid">
          <label class="toggle-option">
            <input id="toggle-prerequisites" type="checkbox" ${state.showPrerequisites ? "checked" : ""}>
            <span>Show prerequisites</span>
          </label>
          <label class="toggle-option">
            <input id="toggle-dependents" type="checkbox" ${state.showDependents ? "checked" : ""}>
            <span>Show dependents</span>
          </label>
        </div>
      </section>

      <section class="analytics-block">
        <h3>Direct Prerequisites</h3>
        ${relatedButtonsHtml(projectionDirectNeighbors(node.id, "from"))}
      </section>

      <section class="analytics-block">
        <h3>Direct Dependents</h3>
        ${relatedButtonsHtml(projectionDirectNeighbors(node.id, "to"))}
      </section>

      <section class="analytics-block">
        <h3>Sources</h3>
        ${sourcesHtml(node)}
      </section>
    </div>
  `;
}

function pipelineChooserHtml(node, currentPipeline) {
  const visiblePipelines = sortedPipelinesForNode(node).slice(0, 6);
  return `
    <div class="pipeline-switcher">
      ${visiblePipelines
        .map((pipeline) => {
          const active = currentPipeline?.id === pipeline.id;
          return `
            <button
              type="button"
              class="pipeline-button ${active ? "is-active" : ""}"
              data-pipeline-target="${escapeHtml(pipeline.id)}"
            >
              <strong>${escapeHtml(pipeline.label)}</strong><br>
              <span class="pipeline-button-meta">${escapeHtml(pipelineFactSummary(pipeline))}</span>
              ${pipelineChooserDetailsHtml(pipeline)}
            </button>
          `;
        })
        .join("")}
    </div>
    ${
      node.pipelines.length > visiblePipelines.length
        ? `<p class="pipeline-meta">Showing the top ${visiblePipelines.length} curated paths for this node.</p>`
        : ""
    }
  `;
}

function pipelineBreakdownHtml(pipeline) {
  return `
    <section class="info-section">
      <h3>Workflow Components</h3>
      <p class="info-copy">
        This section lists the nodes attached to the selected workflow path.
      </p>
      ${PIPELINE_COMPONENT_GROUPS.map((group) =>
        pipelineNodeGroupHtml(group.title, pipelineNodesForFields(pipeline, group.fields))
      ).join("")}
    </section>
  `;
}

function pipelineNodeGroupHtml(title, nodes) {
  if (!nodes.length) {
    return "";
  }

  return `
    <div class="pipeline-node-group">
      <h4>${escapeHtml(title)}</h4>
      <div class="pipeline-node-list">
        ${nodes
          .map(
            (node) => `
              <button type="button" class="pipeline-node-chip" data-node-target="${escapeHtml(node.id)}">
                ${escapeHtml(node.label)}
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function pipelineNodesForFields(record, fields) {
  const seen = new Set();
  return fields
    .flatMap((field) => record.componentNodes[field] || [])
    .filter((node) => {
      if (!node || seen.has(node.id)) {
        return false;
      }
      seen.add(node.id);
      return true;
    });
}

function pipelineChooserDetailsHtml(pipeline) {
  const detailLines = [
    pipelineFieldSummaryLine("Inputs", pipeline.componentNodes.primary_input_ids),
    pipelineFieldSummaryLine("Support", pipeline.componentNodes.support_data_ids),
    pipelineFieldSummaryLine("Outputs", pipeline.componentNodes.output_ids),
  ].filter(Boolean);

  if (!detailLines.length) {
    return "";
  }

  return detailLines.map((line) => `<span class="pipeline-button-meta">${escapeHtml(line)}</span>`).join("");
}

function pipelineFieldSummaryLine(label, nodes) {
  if (!nodes?.length) {
    return "";
  }
  return `${label}: ${summarizeNodeLabels(nodes)}`;
}

function summarizeNodeLabels(nodes, maxItems = 3) {
  const labels = nodes.map((node) => node.label);
  if (labels.length <= maxItems) {
    return labels.join(", ");
  }
  const visible = labels.slice(0, maxItems).join(", ");
  return `${visible}, +${labels.length - maxItems} more`;
}

function pipelineFactSummary(pipeline) {
  return `${pipeline.stepNodes.length} step nodes · ${pipeline.nodes.length} path nodes · ${pipeline.edges.length} edges · ${pipeline.sources.length} sources`;
}

function toolProfileForNode(node) {
  return node.kind === "tool" ? node.toolProfile || null : null;
}

function toolProfileBreakdownHtml(node, toolProfile) {
  const groupedSections = TOOL_PROFILE_GROUPS.map((group) =>
    pipelineNodeGroupHtml(group.title, pipelineNodesForFields(toolProfile, group.fields))
  )
    .filter(Boolean)
    .join("");

  return `
    <section class="info-section">
      <h3>Tool Record</h3>
      <p class="info-copy">
        This record is derived from workflows where ${escapeHtml(node.label)} appears as an actual step, while linked
        workflows remain listed separately for context.
      </p>
      <div class="badge-row">
        <span class="info-badge">Linked workflows: ${toolProfile.linkedPipelines.length}</span>
        <span class="info-badge">Step workflows: ${toolProfile.stepPipelines.length}</span>
        <span class="info-badge">Primary inputs: ${toolProfile.componentNodes.primary_input_ids?.length || 0}</span>
        <span class="info-badge">Support data: ${toolProfile.componentNodes.support_data_ids?.length || 0}</span>
        <span class="info-badge">Outputs: ${toolProfile.componentNodes.output_ids?.length || 0}</span>
      </div>
      ${
        groupedSections ||
        `<p class="info-copy">No linked workflow records are attached to this tool in the current dataset.</p>`
      }
    </section>
  `;
}

function toolProfileAnalyticsHtml(toolProfile) {
  return `
    <section class="analytics-block">
      <h3>Tool Record</h3>
      <div class="metrics-grid">
        ${metricCardHtml("Linked workflows", String(toolProfile.linkedPipelines.length))}
        ${metricCardHtml("Step workflows", String(toolProfile.stepPipelines.length))}
        ${metricCardHtml("Primary inputs", String(toolProfile.componentNodes.primary_input_ids?.length || 0))}
        ${metricCardHtml("Support data", String(toolProfile.componentNodes.support_data_ids?.length || 0))}
        ${metricCardHtml("Modules", String(toolProfile.componentNodes.module_ids?.length || 0))}
        ${metricCardHtml("Outputs", String(toolProfile.componentNodes.output_ids?.length || 0))}
      </div>
    </section>
  `;
}

function sortedPipelinesForNode(node) {
  return [...node.pipelines].sort((left, right) => {
    const scoreDelta = pipelineRelevanceScore(right, node) - pipelineRelevanceScore(left, node);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    const stepDelta = left.stepNodes.length - right.stepNodes.length;
    if (stepDelta !== 0) {
      return stepDelta;
    }
    return left.label.localeCompare(right.label);
  });
}

function pipelineRelevanceScore(pipeline, node) {
  const label = pipeline.label.toLowerCase();
  const target = node.label.toLowerCase();
  let score = 0;
  if (label.includes(target)) {
    score += 6;
  }
  if (label.startsWith(target)) {
    score += 3;
  }
  if (pipeline.stepSet.has(node.id)) {
    score += 2;
  }
  return score;
}

function groupInfoHtml(selection) {
  return `
    <div class="detail-stack">
      <div>
        <h2 class="detail-heading">${selection.length} Selected Nodes</h2>
        <span class="selection-pill">Selection Group</span>
      </div>

      <section class="info-section">
        <h3>Selection Summary</h3>
        <p class="info-copy">
          Shift+click keeps adding nodes to the active group. The graph now highlights the union of
          recursive prerequisites and dependents for all selected concepts.
        </p>
      </section>

      <section class="info-section">
        <h3>Current Group</h3>
        <ul class="selection-list">
          ${selection
            .map((node) => `<li><strong>${escapeHtml(node.label)}</strong> · ${escapeHtml(node.category)}</li>`)
            .join("")}
        </ul>
      </section>
    </div>
  `;
}

function groupAnalyticsHtml(selection) {
  const context = selectionContext();
  const directPrereqs = uniqueNeighborIds(selection, "from");
  const directDependents = uniqueNeighborIds(selection, "to");

  return `
    <div class="analytics-body">
      <div class="badge-row">
        <span class="info-badge">Prerequisite closure: ${context.prerequisites.size}</span>
        <span class="info-badge">Dependent closure: ${context.dependents.size}</span>
        <span class="info-badge">Visible categories: ${state.visibleCategories.size}</span>
      </div>

      <section class="analytics-block">
        <h3>Graph Metrics</h3>
        <div class="metrics-grid">
          ${METRIC_KEYS.map((key) => metricCardHtml(metricLabel(key), "N/A")).join("")}
        </div>
      </section>

      <section class="analytics-block">
        <h3>Path Highlighting</h3>
        <div class="toggle-grid">
          <label class="toggle-option">
            <input id="toggle-prerequisites" type="checkbox" ${state.showPrerequisites ? "checked" : ""}>
            <span>Show prerequisites</span>
          </label>
          <label class="toggle-option">
            <input id="toggle-dependents" type="checkbox" ${state.showDependents ? "checked" : ""}>
            <span>Show dependents</span>
          </label>
        </div>
      </section>

      <section class="analytics-block">
        <h3>Direct Prerequisites</h3>
        ${relatedButtonsHtml(directPrereqs)}
      </section>

      <section class="analytics-block">
        <h3>Direct Dependents</h3>
        ${relatedButtonsHtml(directDependents)}
      </section>
    </div>
  `;
}

function bindPanelActions() {
  document.querySelectorAll("[data-node-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-node-target");
      if (!id || !state.prepared.nodeMap.has(id)) {
        return;
      }
      selectSingleNode(id);
    });
  });

  document.querySelectorAll("[data-pipeline-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-pipeline-target");
      if (!id || !state.prepared.pipelineMap.has(id)) {
        return;
      }
      activatePipeline(id);
    });
  });

  const prereqToggle = document.querySelector("#toggle-prerequisites");
  const dependentToggle = document.querySelector("#toggle-dependents");

  if (prereqToggle) {
    prereqToggle.addEventListener("change", (event) => {
      state.showPrerequisites = event.target.checked;
      refreshGraphStyles();
      renderAnalyticsPanel();
    });
  }

  if (dependentToggle) {
    dependentToggle.addEventListener("change", (event) => {
      state.showDependents = event.target.checked;
      refreshGraphStyles();
      renderAnalyticsPanel();
    });
  }
}

function handleNodeClick(node, event) {
  if (clickTimer) {
    window.clearTimeout(clickTimer);
    clickTimer = null;
  }

  if (event.detail > 1) {
    ensureBackboneScopeForNode(node);
    if (!state.selectedNodeIds.has(node.id)) {
      state.selectedNodeIds = new Set([node.id]);
      state.primarySelectionId = node.id;
    }
    state.selectionSource = "user";
    state.activePipelineId = defaultPipelineIdForNode(node);
    markDerivedStateDirty();
    if (state.viewMode === "backbone") {
      rebuildGraph({ zoom: false });
    }
    state.layout = "radial";
    syncControls();
    renderPanels();
    refreshGraphStyles();
    applyLayout({ zoom: true });
    syncUrlState();
    return;
  }

  clickTimer = window.setTimeout(() => {
    ensureBackboneScopeForNode(node);
    if (event.shiftKey) {
      state.selectedNodeIds.add(node.id);
      state.primarySelectionId = node.id;
      state.activePipelineId = null;
    } else {
      state.selectedNodeIds = new Set([node.id]);
      state.primarySelectionId = node.id;
      state.activePipelineId = defaultPipelineIdForNode(node);
    }
    state.selectionSource = "user";
    markDerivedStateDirty();
    if (state.viewMode === "backbone") {
      rebuildGraph({ zoom: false });
    }

    if (state.layout === "radial" && !state.primarySelectionId) {
      state.layout = "force";
    }

    renderPanels();
    refreshGraphStyles();
    syncControls();
    focusNode(node.id);
    syncUrlState();
    clickTimer = null;
  }, 210);
}

function focusNode(nodeId) {
  if (!state.graph) {
    return;
  }
  const node = state.prepared.nodeMap.get(nodeId);
  if (!node || node.x == null || node.y == null) {
    return;
  }

  if (state.rendererMode === "3d") {
    const distance = 150;
    const length = Math.hypot(node.x || 1, node.y || 1, node.z || 1) || 1;
    const ratio = 1 + distance / length;

    state.graph.cameraPosition(
      { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
      node,
      700
    );
    return;
  }

  state.graph.centerAt(node.x, node.y, 700);
  state.graph.zoom(1.35, 700);
}

function refreshGraphStyles() {
  ensureDerivedState();
  if (!state.graph) {
    return;
  }

  if (state.rendererMode === "3d") {
    state.graph
      .nodeColor((node) => nodeColor(node))
      .nodeVal((node) => nodeValue(node))
      .linkColor((link) => linkColor(link))
      .linkWidth((link) => linkWidth(link))
      .linkDirectionalArrowColor((link) => linkColor(link))
      .linkDirectionalParticles((link) => (isActiveLink(link) ? 2 : 0))
      .linkDirectionalParticleColor((link) => linkColor(link))
      .refresh();
    return;
  }

  state.graph
    .nodeColor((node) => nodeColor(node))
    .nodeVal((node) => nodeValue(node))
    .linkColor((link) => linkColor(link))
    .linkWidth((link) => linkWidth(link))
    .linkDirectionalParticles((link) => (isActiveLink(link) ? 2 : 0))
    .linkDirectionalParticleColor((link) => linkColor(link));
}

function currentBackboneNodeStat(nodeId) {
  return ensureDerivedState().backboneState.scope?.nodeStats.get(nodeId) || null;
}

function currentBackboneLabelNodeIds() {
  if (state.viewMode !== "backbone") {
    return new Set();
  }

  const ids = new Set(state.selectedNodeIds);
  const scope = ensureDerivedState().backboneState.scope;
  if (!scope) {
    return ids;
  }

  (scope.keyNodeIds || []).slice(0, 10).forEach((nodeId) => ids.add(nodeId));
  (scope.recurringNodeIds || []).slice(0, 8).forEach((nodeId) => ids.add(nodeId));

  const pipeline = activePipeline();
  if (pipeline) {
    (pipeline.step_ids || []).forEach((nodeId) => ids.add(nodeId));
  }

  return ids;
}

function shouldDrawNodeLabel(node, globalScale = 1) {
  if (state.viewMode !== "backbone" || state.rendererMode !== "2d") {
    return false;
  }

  const labelNodeIds = currentBackboneLabelNodeIds();
  if (!labelNodeIds.has(node.id)) {
    return false;
  }

  if (state.layout === "force" && globalScale < 1.35 && !state.selectedNodeIds.has(node.id)) {
    return false;
  }

  const stat = currentBackboneNodeStat(node.id);
  if (!state.selectedNodeIds.has(node.id) && !activePipeline() && !stat?.isCore && globalScale < 1.05) {
    return false;
  }

  return true;
}

function drawNodeOverlay(node, ctx, globalScale) {
  if (!shouldDrawNodeLabel(node, globalScale)) {
    return;
  }

  const scale = Math.max(globalScale || 1, 0.75);
  const fontSize = (state.selectedNodeIds.has(node.id) ? 14 : 11.5) / scale;
  const fontWeight = state.selectedNodeIds.has(node.id) ? 700 : 600;
  const paddingX = 6 / scale;
  const paddingY = 3.5 / scale;
  const radius = Math.max(4, Math.sqrt(Math.max(nodeValue(node), 1)) * 2.2);
  const labelX = node.x + radius + 8 / scale;
  const labelY = node.y - radius * 0.15;

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px IBM Plex Sans, Avenir Next, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const textWidth = ctx.measureText(node.label).width;
  const boxX = labelX - paddingX;
  const boxY = labelY - fontSize / 2 - paddingY;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;

  ctx.fillStyle = state.selectedNodeIds.has(node.id) ? "rgba(9, 23, 37, 0.9)" : "rgba(9, 23, 37, 0.72)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeStyle = state.selectedNodeIds.has(node.id) ? "rgba(242, 200, 107, 0.9)" : "rgba(134, 174, 201, 0.26)";
  ctx.lineWidth = state.selectedNodeIds.has(node.id) ? 1.3 / scale : 0.8 / scale;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = state.selectedNodeIds.has(node.id) ? "rgba(255, 246, 219, 0.98)" : "rgba(228, 239, 247, 0.92)";
  ctx.fillText(node.label, labelX, labelY);
  ctx.restore();
}

function nodeColor(node) {
  const selected = state.selectedNodeIds.has(node.id);
  const context = selectionContext();
  const pipeline = activePipeline();

  if (selected) {
    return "#f5fbff";
  }

  if (pipeline) {
    if (pipeline.stepSet.has(node.id)) {
      return categoryColor(node);
    }
    if (pipeline.nodeSet.has(node.id)) {
      return colorWithAlpha(categoryColor(node), 0.86);
    }
    return colorWithAlpha(categoryColor(node), 0.38);
  }

  if (state.primarySelectionId) {
    if (state.showPrerequisites && context.prerequisites.has(node.id)) {
      return "rgba(242, 200, 107, 0.96)";
    }
    if (state.showDependents && context.dependents.has(node.id)) {
      return "rgba(126, 195, 255, 0.96)";
    }
    return "rgba(88, 109, 124, 0.22)";
  }

  if (state.viewMode === "backbone" && state.nodeColorMode === "category") {
    const backboneState = ensureDerivedState().backboneState;
    const stat = currentBackboneNodeStat(node.id);
    if (!stat) {
      return colorWithAlpha(categoryColor(node), 0.48);
    }
    const alpha = backboneState.coreNodeIds.has(node.id) ? 0.96 : clamp(0.22 + stat.score * 0.62, 0.22, 0.82);
    return colorWithAlpha(categoryColor(node), alpha);
  }

  if (state.nodeColorMode === "category") {
    return categoryColor(node);
  }

  return metricColor(node, state.nodeColorMode);
}

function nodeValue(node) {
  let value = state.nodeSizeMode === "default" ? node.defaultVal : metricSize(node, state.nodeSizeMode);
  const pipeline = activePipeline();

  if (state.selectedNodeIds.has(node.id)) {
    value *= 1.45;
  } else if (pipeline) {
    if (pipeline.stepSet.has(node.id)) {
      value *= 1.34;
    } else if (pipeline.nodeSet.has(node.id)) {
      value *= 1.16;
    } else {
      value *= 0.94;
    }
  } else if (state.primarySelectionId) {
    const context = selectionContext();
    const active =
      (state.showPrerequisites && context.prerequisites.has(node.id)) ||
      (state.showDependents && context.dependents.has(node.id));
    value *= active ? 1.14 : 0.74;
  } else if (state.viewMode === "backbone") {
    const backboneState = ensureDerivedState().backboneState;
    const stat = currentBackboneNodeStat(node.id);
    if (stat) {
      value = state.nodeSizeMode === "default" ? 1.6 + stat.score * 7.2 : value;
      value *= backboneState.coreNodeIds.has(node.id) ? 1.12 : 0.92;
    } else {
      value *= 0.88;
    }
  }

  return value;
}

function linkColor(link) {
  const sourceId = getLinkSourceId(link);
  const targetId = getLinkTargetId(link);
  const pipeline = activePipeline();

  if (pipeline) {
    const pipelineActive =
      state.viewMode === "backbone"
        ? link.pipelineIds?.includes(pipeline.id)
        : pipeline.dependencyEdgeSet.has(link.id);
    if (pipelineActive) {
      return "rgba(242, 200, 107, 0.96)";
    }
    if (pipeline.nodeSet.has(sourceId) && pipeline.nodeSet.has(targetId)) {
      return "rgba(126, 195, 255, 0.44)";
    }
    return "rgba(126, 163, 186, 0.14)";
  }

  if (state.primarySelectionId) {
    const context = selectionContext();
    const prereqActive =
      state.showPrerequisites && context.prerequisitesAndSelected.has(sourceId) && context.prerequisitesAndSelected.has(targetId);
    const depActive =
      state.showDependents && context.dependentsAndSelected.has(sourceId) && context.dependentsAndSelected.has(targetId);

    if (prereqActive && depActive) {
      return "rgba(170, 226, 255, 0.86)";
    }
    if (prereqActive) {
      return "rgba(242, 200, 107, 0.9)";
    }
    if (depActive) {
      return "rgba(126, 195, 255, 0.9)";
    }
    return "rgba(82, 98, 111, 0.1)";
  }

  if (state.viewMode === "backbone") {
    const backboneState = ensureDerivedState().backboneState;
    const sourceCore = backboneState.coreNodeIds.has(sourceId);
    const targetCore = backboneState.coreNodeIds.has(targetId);
    const edgeStrength = Math.min(Math.log2((link.count || 1) + 1) / 4, 1);
    const alpha = clamp(0.14 + edgeStrength * 0.34 + (sourceCore && targetCore ? 0.12 : 0), 0.14, 0.76);
    if (sourceCore && targetCore) {
      return `rgba(166, 216, 255, ${alpha})`;
    }
    return `rgba(102, 127, 148, ${alpha})`;
  }

  return "rgba(126, 163, 186, 0.18)";
}

function linkWidth(link) {
  const pipeline = activePipeline();
  if (pipeline) {
    const pipelineActive =
      state.viewMode === "backbone"
        ? link.pipelineIds?.includes(pipeline.id)
        : pipeline.dependencyEdgeSet.has(link.id);
    if (pipelineActive) {
      return 3.2;
    }
    return 0.5;
  }

  if (isActiveLink(link)) {
    return 2.8;
  }

  if (state.viewMode === "backbone") {
    const backboneState = ensureDerivedState().backboneState;
    const sourceCore = backboneState.coreNodeIds.has(getLinkSourceId(link));
    const targetCore = backboneState.coreNodeIds.has(getLinkTargetId(link));
    const edgeStrength = Math.min(Math.log2((link.count || 1) + 1), 4);
    return (sourceCore && targetCore ? 0.95 : 0.45) + edgeStrength * 0.42;
  }

  return 0.4;
}

function isActiveLink(link) {
  const pipeline = activePipeline();
  if (pipeline) {
    return state.viewMode === "backbone"
      ? Boolean(link.pipelineIds?.includes(pipeline.id))
      : pipeline.dependencyEdgeSet.has(link.id);
  }

  const sourceId = getLinkSourceId(link);
  const targetId = getLinkTargetId(link);
  const context = selectionContext();
  if (!state.primarySelectionId) {
    return false;
  }

  const prereqActive =
    state.showPrerequisites &&
    context.prerequisitesAndSelected.has(sourceId) &&
    context.prerequisitesAndSelected.has(targetId);

  const depActive =
    state.showDependents &&
    context.dependentsAndSelected.has(sourceId) &&
    context.dependentsAndSelected.has(targetId);

  return prereqActive || depActive;
}

function selectedNodes() {
  return [...state.selectedNodeIds]
    .map((id) => state.prepared.nodeMap.get(id))
    .filter(Boolean);
}

function selectionContext() {
  return ensureDerivedState().selectionContext;
}

function uniqueNeighborIds(selection, direction) {
  const current = new Set(selection.map((node) => node.id));
  const ids = new Set();
  const adjacencyMap = direction === "from" ? ensureDerivedState().parentMap : ensureDerivedState().childMap;
  selection.forEach((node) => {
    (adjacencyMap.get(node.id) || []).forEach((id) => {
      if (!current.has(id)) {
        ids.add(id);
      }
    });
  });
  return [...ids];
}

function projectionDirectNeighbors(nodeId, direction) {
  const adjacencyMap = direction === "from" ? ensureDerivedState().parentMap : ensureDerivedState().childMap;
  return [...(adjacencyMap.get(nodeId) || [])];
}

function relatedButtonsHtml(ids) {
  if (!ids.length) {
    return `<p class="analytics-copy">No direct relationships in this direction.</p>`;
  }

  return `
    <div class="link-list">
      ${ids
        .map((id) => {
          const node = state.prepared.nodeMap.get(id);
          if (!node) {
            return "";
          }
          return `
            <button type="button" data-node-target="${escapeHtml(node.id)}">
              <strong>${escapeHtml(node.label)}</strong><br>
              ${escapeHtml(node.category)}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function uniqueSources(sources) {
  const sourceMap = new Map();
  (sources || []).filter(Boolean).forEach((source) => sourceMap.set(source.id, source));
  return [...sourceMap.values()];
}

function sourceListHtml(sources, emptyMessage = "No source links attached to this node.") {
  const items = uniqueSources(sources);
  if (!items.length) {
    return `<p class="analytics-copy">${escapeHtml(emptyMessage)}</p>`;
  }

  return `
    <ul class="source-list">
      ${items
        .map(
          (source) => `
            <li>
              <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
                ${escapeHtml(source.label)}
              </a>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function nodeReferenceSectionHtml(node, currentPipeline) {
  const directSources = uniqueSources(node.sources);
  const directSourceIds = new Set(directSources.map((source) => source.id));
  const workflowSources = uniqueSources(
    (currentPipeline?.sources || []).filter((source) => source && !directSourceIds.has(source.id))
  );

  if (!directSources.length && !workflowSources.length) {
    return "";
  }

  return `
    <section class="info-section">
      <h3>References</h3>
      <p class="info-copy">
        These links point to the attached source records for this node${workflowSources.length ? " and the active workflow" : ""}.
      </p>
      ${
        directSources.length
          ? `
            <div class="source-group">
              <h4>${node.kind === "tool" ? "Tool references" : "Direct references"}</h4>
              ${sourceListHtml(directSources)}
            </div>
          `
          : ""
      }
      ${
        workflowSources.length
          ? `
            <div class="source-group">
              <h4>Active workflow references</h4>
              ${sourceListHtml(workflowSources)}
            </div>
          `
          : ""
      }
    </section>
  `;
}

function sourcesHtml(node) {
  return sourceListHtml(
    [...node.sources, ...node.pipelines.flatMap((pipeline) => resolveSources(pipeline.source_ids))],
    "No source links attached to this node."
  );
}

function metricCardHtml(label, value) {
  return `
    <div class="metric-card">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function toolTraitFilterSummaryHtml() {
  const traitFilters = toolTraitFilterState();
  return `
    <section class="analytics-block">
      <h3>Tool Filters</h3>
      <p class="analytics-copy">
        Settings -> Filters matches tools by the structured traits already attached to their records.
      </p>
      ${
        traitFilters.active
          ? `
            <div class="filter-pill-row">
              ${traitFilters.items.map((item) => filterPillHtml(item)).join("")}
            </div>
            <div class="metrics-grid">
              ${metricCardHtml("Matched tools", String(traitFilters.toolIds.size))}
              ${metricCardHtml("Linked workflows", String(traitFilters.pipelineIds.size))}
              ${metricCardHtml("Highlighted nodes", String(traitFilters.nodeIds.size))}
            </div>
          `
          : `<p class="analytics-copy">No active tool-trait filters.</p>`
      }
    </section>
  `;
}

function toolTraitFilterState() {
  return ensureDerivedState().traitFilterState;
}

function emptyTraitFilterState() {
  return {
    active: false,
    items: [],
    traitNodeIds: new Set(),
    toolIds: new Set(),
    pipelineIds: new Set(),
    nodeIds: new Set(),
    edgeIds: new Set(),
  };
}

function computeTraitFilterState() {
  const items = activeTraitFilterItems();
  if (!items.length) {
    return emptyTraitFilterState();
  }

  const matchedToolNodes = state.prepared.nodes.filter(
    (node) =>
      node.kind === "tool" &&
      node.toolProfile &&
      items.every((item) => (node.toolProfile[item.field] || []).includes(item.nodeId))
  );

  const traitNodeIds = new Set(items.map((item) => item.nodeId));
  const toolIds = new Set();
  const pipelineIds = new Set();
  const nodeIds = new Set(traitNodeIds);
  const edgeIds = new Set();

  matchedToolNodes.forEach((toolNode) => {
    toolIds.add(toolNode.id);
    nodeIds.add(toolNode.id);
    (toolNode.toolProfile.linkedPipelines || []).forEach((pipeline) => {
      pipelineIds.add(pipeline.id);
      pipeline.nodeSet.forEach((nodeId) => nodeIds.add(nodeId));
      pipeline.edgeSet.forEach((edgeId) => edgeIds.add(edgeId));
    });
  });

  return {
    active: true,
    items,
    traitNodeIds,
    toolIds,
    pipelineIds,
    nodeIds,
    edgeIds,
  };
}

function setViewMode(nextMode) {
  const mode = nextMode === "backbone" ? "backbone" : "full";
  if (state.viewMode === mode) {
    syncControls();
    return;
  }

  state.viewMode = mode;
  if (mode === "backbone" && state.layout === "force") {
    state.layout = "hierarchical";
  }
  if (mode === "backbone") {
    sanitizeBackboneSelection();
  }
  markDerivedStateDirty();
  rebuildGraph({ zoom: true });
  renderPanels();
  syncControls();
  syncUrlState();
}

function setBackboneScope(nextScopeId) {
  const scopeId = state.prepared.backbone.scopeMap.has(nextScopeId) ? nextScopeId : DEFAULT_BACKBONE_SCOPE_ID;
  if (state.backboneScopeId === scopeId) {
    syncControls();
    return;
  }

  state.backboneScopeId = scopeId;
  sanitizeBackboneSelection();
  markDerivedStateDirty();
  rebuildGraph({ zoom: true });
  renderPanels();
  syncControls();
  syncUrlState();
}

function sanitizeBackboneSelection() {
  if (state.viewMode !== "backbone") {
    return;
  }

  const scope = currentBackboneScope();
  if (!scope) {
    return;
  }

  if (state.activePipelineId && !scope.pipelineIds.has(state.activePipelineId)) {
    state.activePipelineId = null;
  }

  if (
    state.primarySelectionId &&
    !scope.nodeIds.has(state.primarySelectionId) &&
    state.selectedNodeIds.size === 1
  ) {
    clearSelection();
  }
}

function syncControls() {
  refs.graphViewSelect.value = state.viewMode;
  refs.backboneScopeSelect.value = state.backboneScopeId;
  refs.backboneScopeSelect.disabled = state.viewMode !== "backbone";
  refs.layoutSelect.value = state.layout;
  const hidden = panelsAreHidden();
  refs.settingsGraphTab.classList.toggle("is-active", state.settingsTab === "graph");
  refs.settingsFiltersTab.classList.toggle("is-active", state.settingsTab === "filters");
  refs.settingsGraphTab.setAttribute("aria-selected", String(state.settingsTab === "graph"));
  refs.settingsFiltersTab.setAttribute("aria-selected", String(state.settingsTab === "filters"));
  refs.settingsGraphPane.classList.toggle("is-active", state.settingsTab === "graph");
  refs.settingsFiltersPane.classList.toggle("is-active", state.settingsTab === "filters");
  refs.settingsGraphPane.hidden = state.settingsTab !== "graph";
  refs.settingsFiltersPane.hidden = state.settingsTab !== "filters";
  refs.layoutSelect.querySelector('option[value="radial"]').disabled = !state.primarySelectionId;
  refs.layoutSelect.disabled = !state.graph;
  refs.recenterBtn.disabled = !state.graph;
  refs.panelsBtn.textContent = hidden ? "Show Panels" : "Hide Panels";
  refs.panelsBtn.setAttribute("aria-pressed", String(hidden));
  refs.sidePanels.classList.toggle("is-hidden", hidden);
  refs.sidePanels.hidden = hidden;
  refs.sidePanels.setAttribute("aria-hidden", String(hidden));
  refs.screenshotBtn.disabled = !state.graph;
  refs.settingsShell.classList.toggle("is-open", state.settingsOpen);
  refs.settingsBtn.setAttribute("aria-expanded", String(state.settingsOpen));
  refs.settingsShell.setAttribute("aria-hidden", String(!state.settingsOpen));
}

function panelsAreHidden() {
  return refs.sidePanels.hidden || refs.sidePanels.classList.contains("is-hidden");
}

function setPanelCollapsed(panel, collapsed) {
  panel.classList.toggle("is-collapsed", collapsed);
  const toggle = panel.querySelector(".panel-toggle");
  toggle.textContent = collapsed ? "Expand" : "Collapse";
  toggle.setAttribute("aria-expanded", String(!collapsed));
}

function setPanelsHidden(hidden) {
  refs.sidePanels.hidden = hidden;
  refs.sidePanels.classList.toggle("is-hidden", hidden);
  refs.sidePanels.setAttribute("aria-hidden", String(hidden));
  if (!hidden) {
    setPanelCollapsed(refs.infoPanel, false);
    setPanelCollapsed(refs.analyticsPanel, false);
  }
  syncControls();
}

function togglePanel(panel) {
  setPanelCollapsed(panel, !panel.classList.contains("is-collapsed"));
  syncControls();
}

function downloadScreenshot() {
  if (!state.graph) {
    showToast("Screenshot unavailable without WebGL");
    return;
  }
  const canvas = refs.graphCanvas.querySelector("canvas");
  if (!canvas) {
    return;
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "genome-assembler-knowledge-graph.png";
  link.click();
  showToast("Screenshot downloaded");
}

async function copyShareLink() {
  syncUrlState();
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Link copied");
  } catch (error) {
    showToast("Clipboard unavailable");
  }
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => refs.toast.classList.remove("is-visible"), 1600);
}

function clearSelection() {
  state.selectedNodeIds = new Set();
  state.primarySelectionId = null;
  state.selectionSource = null;
  state.activePipelineId = null;
  markDerivedStateDirty();
  if (state.layout === "radial") {
    state.layout = state.viewMode === "backbone" ? "hierarchical" : "force";
  }
  syncUrlState();
}

function applyUrlState() {
  const params = selectionParamsFromLocation();
  const viewParam = params.get("view");
  const scopeParam = params.get("scope");
  const nodesParam = params.get("nodes");
  const nodeParam = params.get("node");
  const pipelineParam = params.get("pipeline");
  const traitsParam = params.get("traits");

  if (viewParam === "backbone") {
    state.viewMode = "backbone";
    if (state.layout === "force") {
      state.layout = "hierarchical";
    }
  }

  if (scopeParam && state.prepared.backbone.scopeMap.has(scopeParam)) {
    state.backboneScopeId = scopeParam;
  }

  if (traitsParam) {
    state.activeTraitFilters = new Set(
      traitsParam
        .split(",")
        .map((value) => value.trim())
        .filter((value) => state.prepared.traitFilterItemMap.has(value))
    );
    markDerivedStateDirty();
    renderSettingsFilters();
  }

  if (pipelineParam && state.prepared.pipelineMap.has(pipelineParam)) {
    state.activePipelineId = pipelineParam;
    if (state.viewMode === "backbone") {
      state.backboneScopeId =
        state.prepared.pipelineMap.get(pipelineParam).scopeId || DEFAULT_BACKBONE_SCOPE_ID;
    }
    markDerivedStateDirty();
  }

  if (nodesParam || nodeParam) {
    const ids = selectionIdsFromParams(params);
    if (ids.length) {
      state.selectedNodeIds = new Set(ids);
      state.primarySelectionId = ids[ids.length - 1];
      state.selectionSource = "url";
      if (state.viewMode === "backbone" && ids.length === 1) {
        ensureBackboneScopeForNode(state.prepared.nodeMap.get(ids[0]));
      }
      markDerivedStateDirty();
      if (!state.activePipelineId && ids.length === 1) {
        state.activePipelineId = defaultPipelineIdForNode(state.prepared.nodeMap.get(ids[0]));
      }
      return true;
    }
  }

  if (state.activePipelineId) {
    const leadId = pipelineLeadNodeId(state.prepared.pipelineMap.get(state.activePipelineId));
    if (leadId) {
      state.selectedNodeIds = new Set([leadId]);
      state.primarySelectionId = leadId;
      state.selectionSource = "url";
      markDerivedStateDirty();
      return true;
    }
  }

  return false;
}

function syncUrlState() {
  const url = new URL(window.location.href);
  url.searchParams.delete("view");
  url.searchParams.delete("scope");
  url.searchParams.delete("node");
  url.searchParams.delete("nodes");
  url.searchParams.delete("pipeline");
  url.searchParams.delete("traits");
  if (state.viewMode === "backbone") {
    url.searchParams.set("view", "backbone");
    url.searchParams.set("scope", state.backboneScopeId);
  }
  if (state.selectedNodeIds.size > 1) {
    url.searchParams.set("nodes", [...state.selectedNodeIds].join(","));
  } else if (state.primarySelectionId) {
    url.searchParams.set("node", state.primarySelectionId);
  }
  if (state.activePipelineId) {
    url.searchParams.set("pipeline", state.activePipelineId);
  }
  if (state.activeTraitFilters.size) {
    url.searchParams.set("traits", [...state.activeTraitFilters].sort().join(","));
  }
  url.hash = "";
  window.history.replaceState({}, "", url);
}

function selectionParamsFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  if (
    searchParams.has("nodes") ||
    searchParams.has("node") ||
    searchParams.has("pipeline") ||
    searchParams.has("traits") ||
    searchParams.has("view") ||
    searchParams.has("scope")
  ) {
    return searchParams;
  }

  const hash = window.location.hash.replace(/^#/, "");
  return new URLSearchParams(hash);
}

function selectionIdsFromParams(params) {
  const nodesParam = params.get("nodes");
  if (nodesParam) {
    return nodesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => state.prepared.nodeMap.has(id));
  }

  const nodeParam = params.get("node");
  if (nodeParam && state.prepared.nodeMap.has(nodeParam)) {
    return [nodeParam];
  }

  return [];
}

function applyLandingSelection() {
  clearSelection();
  markDerivedStateDirty();
  clearUrlSelectionState();
}

function preferredBackboneScopeIdForNode(node, scope = currentBackboneScope()) {
  if (!node) {
    return DEFAULT_BACKBONE_SCOPE_ID;
  }

  const backbone = state.prepared?.backbone;
  if (!backbone) {
    return DEFAULT_BACKBONE_SCOPE_ID;
  }

  if (scope?.layoutMode === "branch_universe" && scope.nodeBranchMap?.get(node.id) === "shared") {
    return scope.id;
  }

  const scopeCounts = backbone.nodeScopeCountMap.get(node.id) || new Map();
  const directChildScopeIds = scopeChildScopeIds(scope);
  if (scope?.includeScopeIds?.length && directChildScopeIds.length) {
    const rankedChildScopeIds = directChildScopeIds
      .map((scopeId) => ({
        scopeId,
        count: scopePipelineIds(scopeId).reduce((total, leafScopeId) => total + (scopeCounts.get(leafScopeId) || 0), 0),
      }))
      .filter((entry) => entry.count > 0)
      .sort((left, right) => right.count - left.count || left.scopeId.localeCompare(right.scopeId));

    if (rankedChildScopeIds.length > 1 && rankedChildScopeIds[0].count === rankedChildScopeIds[1].count) {
      return scope.id;
    }
    if (rankedChildScopeIds.length) {
      return rankedChildScopeIds[0].scopeId;
    }
  }

  return backbone.nodePrimaryScopeIdMap.get(node.id) || DEFAULT_BACKBONE_SCOPE_ID;
}

function ensureBackboneScopeForNode(node) {
  if (state.viewMode !== "backbone" || !node) {
    return;
  }

  const scope = currentBackboneScope();
  const nextScopeId = preferredBackboneScopeIdForNode(node, scope);
  const shouldNarrowAggregateScope =
    scope &&
    nextScopeId &&
    nextScopeId !== scope.id &&
    (scope.id === "all" ||
      scopeChildScopeIds(scope).includes(nextScopeId) ||
      scopePipelineIds(scope).includes(nextScopeId));

  if (scope?.nodeIds.has(node.id) && !shouldNarrowAggregateScope) {
    return;
  }

  state.backboneScopeId = state.prepared.backbone.scopeMap.has(nextScopeId)
    ? nextScopeId
    : DEFAULT_BACKBONE_SCOPE_ID;
}

function selectSingleNode(id) {
  const node = state.prepared.nodeMap.get(id);
  ensureBackboneScopeForNode(node);
  state.selectedNodeIds = new Set([id]);
  state.primarySelectionId = id;
  state.selectionSource = "user";
  state.activePipelineId = defaultPipelineIdForNode(node);
  markDerivedStateDirty();
  if (state.viewMode === "backbone") {
    rebuildGraph({ zoom: false });
  }
  state.layout = state.layout === "radial" ? "radial" : state.layout;
  syncUrlState();
  renderPanels();
  refreshGraphStyles();
  focusNode(id);
  syncControls();
}

function scheduleSelectionFocus() {
  if (!state.graph || !state.primarySelectionId) {
    return;
  }
  window.setTimeout(() => focusNode(state.primarySelectionId), 720);
}

function clearUrlSelectionState() {
  const url = new URL(window.location.href);
  url.searchParams.delete("view");
  url.searchParams.delete("scope");
  url.searchParams.delete("node");
  url.searchParams.delete("nodes");
  url.searchParams.delete("pipeline");
  url.searchParams.delete("traits");
  url.hash = "";
  window.history.replaceState({}, "", url);
}

function activatePipeline(pipelineId) {
  const pipeline = state.prepared.pipelineMap.get(pipelineId);
  if (!pipeline) {
    return;
  }
  if (state.viewMode === "backbone") {
    state.backboneScopeId = pipeline.scopeId || DEFAULT_BACKBONE_SCOPE_ID;
  }
  state.activePipelineId = pipelineId;
  markDerivedStateDirty();
  if (!state.primarySelectionId || !pipeline.nodeSet.has(state.primarySelectionId)) {
    const leadId = pipelineLeadNodeId(pipeline);
    if (leadId) {
      state.selectedNodeIds = new Set([leadId]);
      state.primarySelectionId = leadId;
    }
  }
  state.selectionSource = "user";
  if (state.viewMode === "backbone") {
    rebuildGraph({ zoom: false });
  }
  syncUrlState();
  renderPanels();
  refreshGraphStyles();
  syncControls();
  if (state.primarySelectionId) {
    focusNode(state.primarySelectionId);
  }
}

function activePipeline() {
  return ensureDerivedState().activePipeline;
}

function activePipelineForNode(node) {
  const pipeline = activePipeline();
  if (pipeline && pipeline.nodeSet.has(node.id)) {
    return pipeline;
  }
  return chooseDefaultPipeline(node);
}

function chooseDefaultPipeline(node) {
  if (!node?.pipelines?.length) {
    return null;
  }
  const activeBackboneScope = state.viewMode === "backbone" ? currentBackboneScope() : null;
  const allowedScopeIds = activeBackboneScope ? new Set(scopePipelineIds(activeBackboneScope)) : null;
  const pipelines =
    state.viewMode === "backbone" && allowedScopeIds
      ? node.pipelines.filter((pipeline) => allowedScopeIds.has(pipeline.scopeId))
      : node.pipelines;
  return (sortedPipelinesForNode({ ...node, pipelines }).find(Boolean) || sortedPipelinesForNode(node)[0] || null);
}

function defaultPipelineIdForNode(node) {
  return chooseDefaultPipeline(node)?.id || null;
}

function pipelineLeadNodeId(pipeline) {
  if (!pipeline) {
    return null;
  }
  const toolNode = pipeline.stepNodes.find((node) => node.kind === "tool") || pipeline.nodes.find((node) => node.kind === "tool");
  return toolNode?.id || pipeline.stepNodes[0]?.id || pipeline.nodes[0]?.id || null;
}

function startHereButtonsHtml(items = START_HERE_ITEMS) {
  const cards = items
    .map((item) => {
      const node = state.prepared.nodeMap.get(item.id);
      if (!node) {
        return "";
      }
      return `
        <button type="button" data-node-target="${escapeHtml(node.id)}">
          <strong>${escapeHtml(item.title)}</strong><br>
          ${escapeHtml(item.description)}
        </button>
      `;
    })
    .filter(Boolean)
    .join("");

  if (!cards) {
    return `<p class="info-copy">Starter views are unavailable in this dataset.</p>`;
  }

  return `<div class="action-grid">${cards}</div>`;
}

function resolveSources(sourceIds = []) {
  return sourceIds.map((id) => state.prepared.sourceMap.get(id)).filter(Boolean);
}

function resolveSourceRefs(sourceIds = [], sourceMap) {
  return sourceIds.map((id) => sourceMap.get(id)).filter(Boolean);
}

function metricColor(node, key) {
  const range = state.prepared.metricRanges.get(key);
  if (!range) {
    return categoryColor(node);
  }
  const t = normalizeByMetric(node[key], range.min, range.max);
  const hue = 214 - t * 182;
  const saturation = 72 + t * 18;
  const lightness = 34 + t * 28;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function metricSize(node, key) {
  const range = state.prepared.metricRanges.get(key);
  if (!range) {
    return node.defaultVal;
  }
  const t = normalizeByMetric(node[key], range.min, range.max);
  return 1.1 + t * 7.2;
}

function categoryColor(node) {
  return CATEGORY_COLORS[node.categoryId] || "#89d3de";
}

function tooltipHtml(node) {
  return `
    <div style="
      padding:10px 12px;
      border-radius:12px;
      background:rgba(7,17,26,0.94);
      color:#ecf5fa;
      border:1px solid rgba(195,227,255,0.12);
      box-shadow:0 16px 36px rgba(1,8,16,0.4);
      font-family: Avenir Next, Segoe UI, sans-serif;
      min-width:180px;">
      <div style="font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#9eb5c1; margin-bottom:6px;">
        ${escapeHtml(node.category)}
      </div>
      <div style="font-size:16px; font-family:Iowan Old Style, Georgia, serif; margin-bottom:6px;">
        ${escapeHtml(node.label)}
      </div>
      <div style="font-size:12px; line-height:1.45; color:#bed0d9;">
        ${escapeHtml(node.definition || "No summary attached.")}
      </div>
    </div>
  `;
}

function computeDepth(nodeId, nodeMap, memo, active) {
  if (memo.has(nodeId)) {
    return memo.get(nodeId);
  }
  if (active.has(nodeId)) {
    return 0;
  }

  active.add(nodeId);
  const node = nodeMap.get(nodeId);
  let depth = 0;

  (node?.from || []).forEach((parentId) => {
    depth = Math.max(depth, computeDepth(parentId, nodeMap, memo, active) + 1);
  });

  active.delete(nodeId);
  memo.set(nodeId, depth);
  return depth;
}

function collectReachable(startId, nodeMap, direction, memo) {
  if (memo.has(startId)) {
    return memo.get(startId);
  }

  const visited = new Set();
  const stack = [...(nodeMap.get(startId)?.[direction] || [])];

  while (stack.length) {
    const current = stack.pop();
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    const node = nodeMap.get(current);
    if (!node) {
      continue;
    }
    stack.push(...node[direction]);
  }

  memo.set(startId, visited);
  return visited;
}

function computePageRank(nodes, nodeMap) {
  const ids = nodes.map((node) => node.id);
  const count = ids.length;
  const damping = 0.85;
  const scores = new Map(ids.map((id) => [id, 1 / count]));

  for (let iteration = 0; iteration < 70; iteration += 1) {
    const next = new Map(ids.map((id) => [id, (1 - damping) / count]));
    let sinkMass = 0;

    ids.forEach((id) => {
      const node = nodeMap.get(id);
      if (!node.to.length) {
        sinkMass += scores.get(id);
        return;
      }
      const share = (scores.get(id) * damping) / node.to.length;
      node.to.forEach((targetId) => {
        next.set(targetId, next.get(targetId) + share);
      });
    });

    const sinkShare = (sinkMass * damping) / count;
    ids.forEach((id) => {
      next.set(id, next.get(id) + sinkShare);
    });

    ids.forEach((id) => scores.set(id, next.get(id)));
  }

  return scores;
}

function computeBetweenness(nodes, nodeMap) {
  const scores = new Map(nodes.map((node) => [node.id, 0]));

  nodes.forEach((sourceNode) => {
    const stack = [];
    const predecessors = new Map(nodes.map((node) => [node.id, []]));
    const sigma = new Map(nodes.map((node) => [node.id, 0]));
    const distance = new Map(nodes.map((node) => [node.id, -1]));
    sigma.set(sourceNode.id, 1);
    distance.set(sourceNode.id, 0);

    const queue = [sourceNode.id];
    while (queue.length) {
      const vertexId = queue.shift();
      stack.push(vertexId);
      const vertex = nodeMap.get(vertexId);

      vertex.to.forEach((neighborId) => {
        if (distance.get(neighborId) < 0) {
          queue.push(neighborId);
          distance.set(neighborId, distance.get(vertexId) + 1);
        }
        if (distance.get(neighborId) === distance.get(vertexId) + 1) {
          sigma.set(neighborId, sigma.get(neighborId) + sigma.get(vertexId));
          predecessors.get(neighborId).push(vertexId);
        }
      });
    }

    const delta = new Map(nodes.map((node) => [node.id, 0]));
    while (stack.length) {
      const vertexId = stack.pop();
      predecessors.get(vertexId).forEach((predecessorId) => {
        const ratio = sigma.get(predecessorId) / sigma.get(vertexId);
        delta.set(predecessorId, delta.get(predecessorId) + ratio * (1 + delta.get(vertexId)));
      });
      if (vertexId !== sourceNode.id) {
        scores.set(vertexId, scores.get(vertexId) + delta.get(vertexId));
      }
    }
  });

  const count = nodes.length;
  const scale = count > 2 ? 1 / ((count - 1) * (count - 2)) : 1;
  scores.forEach((value, key) => scores.set(key, value * scale));
  return scores;
}

function computeScopedDepthMap(nodes) {
  const visibleIds = new Set(nodes.map((node) => node.id));
  const parentMap = new Map(
    nodes.map((node) => [node.id, node.from.filter((parentId) => visibleIds.has(parentId))])
  );
  const childMap = new Map(
    nodes.map((node) => [node.id, node.to.filter((childId) => visibleIds.has(childId))])
  );
  const indegrees = new Map(nodes.map((node) => [node.id, parentMap.get(node.id).length]));
  const queue = nodes
    .map((node) => node.id)
    .filter((nodeId) => indegrees.get(nodeId) === 0)
    .sort((left, right) => state.prepared.nodeMap.get(left).label.localeCompare(state.prepared.nodeMap.get(right).label));
  const depthMap = new Map(nodes.map((node) => [node.id, 0]));

  while (queue.length) {
    const nodeId = queue.shift();
    const nodeDepth = depthMap.get(nodeId) || 0;
    childMap.get(nodeId).forEach((childId) => {
      depthMap.set(childId, Math.max(depthMap.get(childId) || 0, nodeDepth + 1));
      indegrees.set(childId, indegrees.get(childId) - 1);
      if (indegrees.get(childId) === 0) {
        queue.push(childId);
      }
    });
  }

  return depthMap;
}

function computeProjectionDepthMap(nodes, parentMap, childMap) {
  const indegrees = new Map(nodes.map((node) => [node.id, parentMap.get(node.id)?.size || 0]));
  const queue = nodes
    .map((node) => node.id)
    .filter((nodeId) => indegrees.get(nodeId) === 0)
    .sort((left, right) => state.prepared.nodeMap.get(left).label.localeCompare(state.prepared.nodeMap.get(right).label));
  const depthMap = new Map(nodes.map((node) => [node.id, 0]));

  while (queue.length) {
    const nodeId = queue.shift();
    const nodeDepth = depthMap.get(nodeId) || 0;
    (childMap.get(nodeId) || []).forEach((childId) => {
      depthMap.set(childId, Math.max(depthMap.get(childId) || 0, nodeDepth + 1));
      indegrees.set(childId, indegrees.get(childId) - 1);
      if (indegrees.get(childId) === 0) {
        queue.push(childId);
      }
    });
  }

  return depthMap;
}

function computeUniverseBackboneLayout(nodes, depthMap, scope, derived) {
  const laneIndexMap = new Map(BACKBONE_LANE_ORDER.map((laneId, index) => [laneId, index]));
  const visibleLaneIds = [...new Set(nodes.map((node) => node.categoryId))].sort(
    (left, right) =>
      (laneIndexMap.get(left) ?? Number.MAX_SAFE_INTEGER) - (laneIndexMap.get(right) ?? Number.MAX_SAFE_INTEGER) ||
      left.localeCompare(right)
  );
  const laneOffsetMap = new Map(
    visibleLaneIds.map((laneId, index) => [laneId, (index - (visibleLaneIds.length - 1) / 2) * (scope.branchLaneSpacing || 18)])
  );
  const branchCenters = new Map(
    Object.entries(scope.branchCenters || {
      short: -360,
      shared: 0,
      long: 360,
    })
  );
  const groups = new Map();
  let maxDepth = 0;

  nodes.forEach((node) => {
    const depth = depthMap.get(node.id) || 0;
    const branchId = scope.nodeBranchMap?.get(node.id) || "shared";
    const key = `${branchId}::${node.categoryId}::${depth}`;
    if (!groups.has(key)) {
      groups.set(key, {
        branchId,
        laneId: node.categoryId,
        depth,
        nodes: [],
      });
    }
    groups.get(key).nodes.push(node);
    maxDepth = Math.max(maxDepth, depth);
  });

  const positions = new Map();
  groups.forEach((group) => {
    group.nodes.sort((left, right) => {
      const leftScore = derived.backboneState.scope?.nodeStats.get(left.id)?.score || 0;
      const rightScore = derived.backboneState.scope?.nodeStats.get(right.id)?.score || 0;
      return rightScore - leftScore || left.label.localeCompare(right.label);
    });

    const y = (maxDepth / 2 - group.depth) * 92;
    const branchCenterX = branchCenters.get(group.branchId) || 0;
    const laneOffsetX = laneOffsetMap.get(group.laneId) || 0;
    group.nodes.forEach((node, index) => {
      const offset = (index - (group.nodes.length - 1) / 2) * 24;
      positions.set(node.id, {
        x: branchCenterX + laneOffsetX + offset,
        y,
        z: (index - (group.nodes.length - 1) / 2) * 12,
      });
    });
  });

  return positions;
}

function computeHierarchicalLayout(nodes) {
  const derived = ensureDerivedState();
  const depthMap =
    state.viewMode === "backbone"
      ? computeProjectionDepthMap(nodes, derived.parentMap, derived.childMap)
      : computeScopedDepthMap(nodes);

  if (state.viewMode === "backbone") {
    if (derived.backboneState.scope?.layoutMode === "branch_universe") {
      return computeUniverseBackboneLayout(nodes, depthMap, derived.backboneState.scope, derived);
    }

    const laneIndexMap = new Map(BACKBONE_LANE_ORDER.map((laneId, index) => [laneId, index]));
    const visibleLaneIds = [...new Set(nodes.map((node) => node.categoryId))].sort(
      (left, right) =>
        (laneIndexMap.get(left) ?? Number.MAX_SAFE_INTEGER) - (laneIndexMap.get(right) ?? Number.MAX_SAFE_INTEGER) ||
        left.localeCompare(right)
    );
    const laneCenterMap = new Map(
      visibleLaneIds.map((laneId, index) => [laneId, (index - (visibleLaneIds.length - 1) / 2) * 160])
    );
    const groups = new Map();
    let maxDepth = 0;

    nodes.forEach((node) => {
      const depth = depthMap.get(node.id) || 0;
      const key = `${node.categoryId}::${depth}`;
      if (!groups.has(key)) {
        groups.set(key, {
          laneId: node.categoryId,
          depth,
          nodes: [],
        });
      }
      groups.get(key).nodes.push(node);
      maxDepth = Math.max(maxDepth, depth);
    });

    const positions = new Map();
    groups.forEach((group) => {
      group.nodes.sort((left, right) => {
        const leftScore = derived.backboneState.scope?.nodeStats.get(left.id)?.score || 0;
        const rightScore = derived.backboneState.scope?.nodeStats.get(right.id)?.score || 0;
        return rightScore - leftScore || left.label.localeCompare(right.label);
      });

      const y = (maxDepth / 2 - group.depth) * 92;
      const centerX = laneCenterMap.get(group.laneId) || 0;
      group.nodes.forEach((node, index) => {
        const offset = (index - (group.nodes.length - 1) / 2) * 26;
        positions.set(node.id, {
          x: centerX + offset,
          y,
          z: (index - (group.nodes.length - 1) / 2) * 12,
        });
      });
    });

    return positions;
  }

  const groups = new Map();
  let maxDepth = 0;
  nodes.forEach((node) => {
    const depth = depthMap.get(node.id) || 0;
    if (!groups.has(depth)) {
      groups.set(depth, []);
    }
    groups.get(depth).push(node);
    maxDepth = Math.max(maxDepth, depth);
  });

  const positions = new Map();
  groups.forEach((group, depth) => {
    group.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
    const y = (depth - maxDepth / 2) * 60;
    const radius = Math.max(24, group.length * 10);
    group.forEach((node, index) => {
      const angle = (index / Math.max(group.length, 1)) * Math.PI * 2;
      positions.set(node.id, {
        x: Math.cos(angle) * radius,
        y,
        z: Math.sin(angle) * radius,
      });
    });
  });
  return positions;
}

function computeClusterLayout(nodes) {
  const categoryGroups = new Map();
  nodes.forEach((node) => {
    if (!categoryGroups.has(node.categoryId)) {
      categoryGroups.set(node.categoryId, []);
    }
    categoryGroups.get(node.categoryId).push(node);
  });

  const categoryIds = [...categoryGroups.keys()];
  const positions = new Map();
  const radius = 260;

  categoryIds.forEach((categoryId, index) => {
    const phi = Math.acos(1 - 2 * ((index + 0.5) / categoryIds.length));
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    const center = {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta),
    };
    const group = categoryGroups.get(categoryId);
    const localRadius = Math.max(28, Math.sqrt(group.length) * 22);

    group.forEach((node, nodeIndex) => {
      const localPhi = Math.acos(1 - 2 * ((nodeIndex + 0.5) / group.length));
      const localTheta = Math.PI * (1 + Math.sqrt(5)) * nodeIndex;
      positions.set(node.id, {
        x: center.x + localRadius * Math.sin(localPhi) * Math.cos(localTheta),
        y: center.y + localRadius * Math.cos(localPhi),
        z: center.z + localRadius * Math.sin(localPhi) * Math.sin(localTheta),
      });
    });
  });

  return positions;
}

function computeRadialLayout(nodes, centerId, nodeMap) {
  if (!centerId || !nodeMap.has(centerId)) {
    return computeClusterLayout(nodes);
  }

  const visibleIds = new Set(nodes.map((node) => node.id));
  const distances = new Map([[centerId, 0]]);
  const queue = [centerId];

  while (queue.length) {
    const currentId = queue.shift();
    const node = nodeMap.get(currentId);
    const distance = distances.get(currentId);
    [...node.from, ...node.to].forEach((neighborId) => {
      if (!visibleIds.has(neighborId) || distances.has(neighborId)) {
        return;
      }
      distances.set(neighborId, distance + 1);
      queue.push(neighborId);
    });
  }

  const positions = new Map([[centerId, { x: 0, y: 0, z: 0 }]]);
  const grouped = new Map();

  distances.forEach((distance, nodeId) => {
    if (!distance) {
      return;
    }
    if (!grouped.has(distance)) {
      grouped.set(distance, []);
    }
    grouped.get(distance).push(nodeId);
  });

  grouped.forEach((group, distance) => {
    const shell = distance <= 4 ? distance * 68 : 272 + (distance - 4) * 22;
    group.forEach((nodeId, index) => {
      const phi = Math.acos(1 - 2 * ((index + 0.5) / group.length));
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      positions.set(nodeId, {
        x: shell * Math.sin(phi) * Math.cos(theta),
        y: shell * Math.cos(phi),
        z: shell * Math.sin(phi) * Math.sin(theta),
      });
    });
  });

  nodes.forEach((node, index) => {
    if (positions.has(node.id)) {
      return;
    }
    const phi = Math.acos(1 - 2 * ((index + 0.5) / nodes.length));
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    positions.set(node.id, {
      x: 360 * Math.sin(phi) * Math.cos(theta),
      y: 360 * Math.cos(phi),
      z: 360 * Math.sin(phi) * Math.sin(theta),
    });
  });

  return positions;
}

function normalizeByMetric(value, min, max) {
  if (max === min) {
    return 0.5;
  }
  return (value - min) / (max - min);
}

function deterministicCurvature(sourceId, targetId) {
  let hash = 0;
  const input = `${sourceId}:${targetId}`;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 997;
  }
  const sign = hash % 2 === 0 ? 1 : -1;
  return sign * (0.04 + (hash % 5) * 0.02);
}

function colorWithAlpha(color, alpha) {
  if (!color.startsWith("#")) {
    return color;
  }
  const normalized = color.slice(1);
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function metricLabel(key) {
  return sentenceCase(key.replace(/^_/, ""));
}

function getLinkSourceId(link) {
  return typeof link.source === "object" ? link.source.id : link.sourceId || link.source;
}

function getLinkTargetId(link) {
  return typeof link.target === "object" ? link.target.id : link.targetId || link.target;
}

function formatMetric(value) {
  return Number.isFinite(value) ? value.toFixed(4) : "N/A";
}

function sentenceCase(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
