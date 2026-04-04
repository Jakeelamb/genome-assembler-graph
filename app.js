const METRIC_KEYS = [
  "_pagerank",
  "_degree_centrality",
  "_betweenness_centrality",
  "_descendant_ratio",
  "_prerequisite_ratio",
  "_reachability_ratio",
];

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

const state = {
  raw: null,
  prepared: null,
  graph: null,
  rendererMode: null,
  visibleCategories: new Set(),
  searchQuery: "",
  selectedNodeIds: new Set(),
  primarySelectionId: null,
  layout: "force",
  autoRotate: false,
  nodeColorMode: "category",
  nodeSizeMode: "default",
  showPrerequisites: true,
  showDependents: false,
  activePipelineId: null,
  settingsOpen: false,
  graphError: null,
  selectionSource: null,
};

const refs = {
  graphCanvas: document.querySelector("#graph-canvas"),
  search: document.querySelector("#search"),
  stats: document.querySelector("#stats"),
  layoutSelect: document.querySelector("#layout-select"),
  autoRotateBtn: document.querySelector("#auto-rotate-btn"),
  settingsBtn: document.querySelector("#settings-btn"),
  settingsClose: document.querySelector("#settings-close"),
  settingsShell: document.querySelector("#settings-shell"),
  legend: document.querySelector("#legend"),
  nodeColoringSelect: document.querySelector("#node-coloring-select"),
  nodeSizingSelect: document.querySelector("#node-sizing-select"),
  resetBtn: document.querySelector("#reset-btn"),
  screenshotBtn: document.querySelector("#screenshot-btn"),
  copyLinkBtn: document.querySelector("#copy-link-btn"),
  infoBody: document.querySelector("#info-body"),
  analyticsBody: document.querySelector("#analytics-body"),
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
  refs.search.addEventListener("input", (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    clearSelection();
    rebuildGraph({ zoom: false });
    renderPanels();
  });

  refs.search.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    refs.search.value = "";
    state.searchQuery = "";
    rebuildGraph({ zoom: false });
    renderPanels();
    refs.search.blur();
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

  refs.autoRotateBtn.addEventListener("click", () => {
    state.autoRotate = !state.autoRotate;
    updateAutoRotate();
    syncControls();
  });

  refs.settingsBtn.addEventListener("click", () => {
    state.settingsOpen = !state.settingsOpen;
    syncControls();
  });

  refs.settingsClose.addEventListener("click", () => {
    state.settingsOpen = false;
    syncControls();
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
    refs.search.value = "";
    state.searchQuery = "";
    state.layout = "force";
    refs.layoutSelect.value = "force";
    applyLandingSelection();
    rebuildGraph({ zoom: true });
    renderPanels();
    syncControls();
    scheduleSelectionFocus();
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

function initGraph() {
  initGraph2d();
  state.rendererMode = "2d";
  configureSharedGraphForces();
  refs.graphCanvas.style.cursor = "grab";
  updateAutoRotate();
}

function initGraph2d() {
  state.graph = new ForceGraph()(refs.graphCanvas)
    .backgroundColor("rgba(0,0,0,0)")
    .width(window.innerWidth)
    .height(window.innerHeight)
    .nodeLabel((node) => tooltipHtml(node))
    .nodeVal((node) => nodeValue(node))
    .nodeColor((node) => nodeColor(node))
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
  const links = raw.edges
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

  links.forEach((link) => {
    nodeMap.get(link.source).to.push(link.target);
    nodeMap.get(link.target).from.push(link.source);
  });

  const edgeMap = new Map(links.map((link) => [link.id, link]));
  const pipelines = raw.pipelines.map((pipeline) => {
    const resolvedNodeIds = pipeline.node_ids.filter((nodeId) => nodeMap.has(nodeId));
    const resolvedStepIds = (pipeline.step_ids || []).filter((nodeId) => nodeMap.has(nodeId));
    const resolvedEdgeIds = (pipeline.edge_ids || []).filter((edgeId) => edgeMap.has(edgeId));
    return {
      ...pipeline,
      nodes: resolvedNodeIds.map((nodeId) => nodeMap.get(nodeId)),
      stepNodes: resolvedStepIds.map((nodeId) => nodeMap.get(nodeId)),
      edges: resolvedEdgeIds.map((edgeId) => edgeMap.get(edgeId)),
      nodeSet: new Set(resolvedNodeIds),
      stepSet: new Set(resolvedStepIds),
      edgeSet: new Set(resolvedEdgeIds),
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
    node.searchText = [
      node.label,
      node.definition,
      node.kindLabel,
      node.category,
      ...node.pipelines.map((pipeline) => pipeline.label),
      ...node.pipelines.map((pipeline) => pipeline.focus || ""),
    ]
      .join(" ")
      .toLowerCase();
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

  return {
    nodes,
    nodeMap,
    links,
    edgeMap,
    sourceMap,
    pipelines,
    pipelineMap,
    categories,
    metricRanges,
  };
}

function rebuildGraph({ zoom = false } = {}) {
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
      window.setTimeout(() => state.graph.zoomToFit(700, 70), 160);
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
    node.fx = target.x;
    node.fy = state.rendererMode === "3d" ? target.y : target.z;
    if (state.rendererMode === "3d") {
      node.fz = target.z;
    }
  });

  state.graph.cooldownTicks(0).d3ReheatSimulation().refresh();
  if (zoom) {
    window.setTimeout(() => state.graph.zoomToFit(700, 70), 160);
  }
}

function currentGraphData() {
  const visibleNodeIds = new Set(currentVisibleNodes().map((node) => node.id));
  return {
    nodes: currentVisibleNodes(),
    links: state.prepared.links
      .filter((link) => visibleNodeIds.has(link.sourceId) && visibleNodeIds.has(link.targetId))
      .map((link) => ({
        ...link,
        source: link.sourceId,
        target: link.targetId,
      })),
  };
}

function currentVisibleNodes() {
  return state.prepared.nodes.filter((node) => state.visibleCategories.has(node.categoryId));
}

function renderLegend() {
  refs.legend.innerHTML = "";

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
      <span class="legend-count">${category.count}</span>
    `;

    item.addEventListener("click", () => {
      if (state.visibleCategories.has(category.id)) {
        state.visibleCategories.delete(category.id);
      } else {
        state.visibleCategories.add(category.id);
      }

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
  const matches = matchingNodeIds().size;
  const selected = state.selectedNodeIds.size;
  const parts = [`${totalNodes} nodes`, `${totalEdges} edges`];
  if (state.searchQuery) {
    parts.push(`${matches} matches`);
  }
  if (selected) {
    parts.push(`${selected} selected`);
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

function overviewInfoHtml() {
  const nodes = state.prepared.nodes.length;
  const edges = state.prepared.links.length;
  const pipelines = state.raw.pipelines.length;
  return `
    <div class="detail-stack">
      <div>
        <h2 class="detail-heading">Interactive map of genome assembly workflows.</h2>
        <p class="info-copy">
          This explorer maps how genome assembly workflows connect reads, support data, algorithms,
          reusable modules, tools, stages, outputs, metrics, and case studies. Select a node to inspect
          linked workflow paths and the graph components attached to them.
        </p>
      </div>

      <div class="summary-grid">
        <div class="summary-card"><strong>${nodes}</strong><span>Curated nodes</span></div>
        <div class="summary-card"><strong>${edges}</strong><span>Directed edges</span></div>
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
          tools, pipeline stages, outputs, metrics, and case studies. Click a node to inspect its
          prerequisites and dependents, or shift-click to build a comparison set.
        </p>
      </section>

      ${
        state.graphError
          ? `
            <section class="info-section">
              <h3>Renderer Status</h3>
              <p class="info-copy">
                WebGL was unavailable here, so the explorer dropped to a 2D force-graph fallback.
                The interaction model stays intact, but auto-rotate and full 3D depth are disabled.
              </p>
            </section>
          `
          : ""
      }

      <section class="spotlight-card">
        <p>
          Reset restores the initial view with <strong>hifiasm</strong> selected.
        </p>
      </section>
    </div>
  `;
}

function overviewAnalyticsHtml() {
  const roots = state.prepared.nodes.filter((node) => node.from.length === 0).length;
  const leaves = state.prepared.nodes.filter((node) => node.to.length === 0).length;
  const maxDepth = Math.max(...state.prepared.nodes.map((node) => node.depth));

  return `
    <div class="analytics-body">
      <div class="badge-row">
        <span class="info-badge">Root nodes: ${roots}</span>
        <span class="info-badge">Leaf nodes: ${leaves}</span>
        <span class="info-badge">Max depth: ${maxDepth}</span>
      </div>

      <section class="analytics-block">
        <h3>Explorer State</h3>
        <p class="analytics-copy">
          Search dims the graph to matching concepts. Category toggles remove whole lanes.
          Radial layout unlocks when a node is selected or double-clicked.
        </p>
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
        <h3>Coverage</h3>
        <div class="metrics-grid">
          ${state.prepared.categories
            .map(
              (category) => `
                <div class="metric-card">
                  <strong>${category.count}</strong>
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
  const pipelineMeta = currentPipeline?.focus ? pipelineFocusBadgesHtml(currentPipeline) : "";
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
  const pipelineChooser =
    node.pipelines.length > 0
      ? `
        <section class="info-section">
          <h3>Linked Workflows</h3>
          <p class="info-copy">
            Choose a workflow entry linked to this node. The graph highlights the nodes and edges recorded for
            that path in the dataset.
          </p>
          ${pipelineChooserHtml(node, currentPipeline)}
        </section>
      `
      : "";
  const pipelineBreakdown = currentPipeline ? pipelineBreakdownHtml(currentPipeline) : "";

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
          ${escapeHtml(node.label)} is tracked as a ${escapeHtml(node.kindLabel.toLowerCase())}
          inside the ${escapeHtml(node.category)} lane, with
          ${node.ancestorIds.size} recursive prerequisites and ${node.descendantIds.size} recursive dependents.
        </p>
      </section>

      ${pipelineChooser}

      ${
        currentPipeline
          ? `
            <section class="spotlight-card">
              ${pipelineMeta}
              <p>
                Pipeline spotlight:
                <strong>${escapeHtml(currentPipeline.label)}</strong><br>
                ${escapeHtml(currentPipeline.description)}
              </p>
            </section>
          `
          : ""
      }

      ${landingIntro}
      ${pipelineBreakdown}
    </div>
  `;
}

function nodeAnalyticsHtml(node) {
  const currentPipeline = activePipelineForNode(node);
  return `
    <div class="analytics-body">
      <div class="badge-row">
        <span class="info-badge">Depth: ${node.depth}</span>
        <span class="info-badge">Direct prerequisites: ${node.from.length}</span>
        <span class="info-badge">Direct dependents: ${node.to.length}</span>
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
                ${metricCardHtml("Focus", currentPipeline.focus || "Curated path")}
                ${metricCardHtml("Nodes in path", String(currentPipeline.nodes.length))}
                ${metricCardHtml("Edges in path", String(currentPipeline.edges.length))}
              </div>
            </section>
          `
          : ""
      }

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
        ${relatedButtonsHtml(node.from)}
      </section>

      <section class="analytics-block">
        <h3>Direct Dependents</h3>
        ${relatedButtonsHtml(node.to)}
      </section>

      <section class="analytics-block">
        <h3>Sources</h3>
        ${sourcesHtml(node)}
      </section>
    </div>
  `;
}

function pipelineFocusLineHtml(pipeline) {
  return pipeline.focus ? `<div class="pipeline-meta">${escapeHtml(`Focus: ${pipeline.focus}`)}</div>` : "";
}

function pipelineFocusBadgesHtml(pipeline) {
  return pipeline.focus
    ? `
      <div class="badge-row inline-badges">
        <span class="info-badge">${escapeHtml(pipeline.focus)}</span>
      </div>
    `
    : "";
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
              ${escapeHtml(pipeline.tagline)}
              ${pipelineFocusLineHtml(pipeline)}
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
  const techniques = pipeline.stepNodes.filter((node) =>
    ["algorithm", "concept", "module"].includes(node.kind)
  );
  const inputs = pipeline.stepNodes.filter((node) => ["primary", "support"].includes(node.kind));
  const outputs = pipeline.stepNodes.filter((node) => ["output", "stage"].includes(node.kind));

  return `
    <section class="info-section">
      <h3>Workflow Components</h3>
      <p class="info-copy">
        This section lists the nodes attached to the selected workflow path.
      </p>
      ${pipelineNodeGroupHtml("Inputs and support data", inputs)}
      ${pipelineNodeGroupHtml("Core techniques and modules", techniques)}
      ${pipelineNodeGroupHtml("Stages and outputs", outputs)}
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
  const focus = (pipeline.focus || "").toLowerCase();
  const target = node.label.toLowerCase();
  let score = 0;
  if (label.includes(target)) {
    score += 6;
  }
  if (label.startsWith(target)) {
    score += 3;
  }
  if (focus.includes(target)) {
    score += 1;
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
    if (!state.selectedNodeIds.has(node.id)) {
      state.selectedNodeIds = new Set([node.id]);
      state.primarySelectionId = node.id;
    }
    state.selectionSource = "user";
    state.activePipelineId = defaultPipelineIdForNode(node);
    state.layout = "radial";
    syncControls();
    renderPanels();
    refreshGraphStyles();
    applyLayout({ zoom: true });
    syncUrlState();
    return;
  }

  clickTimer = window.setTimeout(() => {
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
  state.graph.zoom(3.2, 700);
}

function refreshGraphStyles() {
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

function nodeColor(node) {
  const selected = state.selectedNodeIds.has(node.id);
  const context = selectionContext();
  const isMatch = isSearchMatch(node);
  const pipeline = activePipeline();

  if (selected) {
    return "#f5fbff";
  }

  if (pipeline) {
    if (pipeline.stepSet.has(node.id)) {
      return categoryColor(node);
    }
    if (pipeline.nodeSet.has(node.id)) {
      return colorWithAlpha(categoryColor(node), 0.64);
    }
    return "rgba(88, 109, 124, 0.14)";
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

  if (state.searchQuery && !isMatch) {
    return "rgba(88, 109, 124, 0.18)";
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
      value *= 1.08;
    } else {
      value *= 0.56;
    }
  } else if (state.primarySelectionId) {
    const context = selectionContext();
    const active =
      (state.showPrerequisites && context.prerequisites.has(node.id)) ||
      (state.showDependents && context.dependents.has(node.id));
    value *= active ? 1.14 : 0.74;
  } else if (state.searchQuery && !isSearchMatch(node)) {
    value *= 0.72;
  } else if (state.searchQuery) {
    value *= 1.14;
  }

  return value;
}

function linkColor(link) {
  const sourceId = getLinkSourceId(link);
  const targetId = getLinkTargetId(link);
  const matches = matchingNodeIds();
  const pipeline = activePipeline();

  if (pipeline) {
    if (pipeline.edgeSet.has(link.id)) {
      return "rgba(242, 200, 107, 0.96)";
    }
    if (pipeline.nodeSet.has(sourceId) && pipeline.nodeSet.has(targetId)) {
      return "rgba(126, 195, 255, 0.34)";
    }
    return "rgba(82, 98, 111, 0.08)";
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

  if (state.searchQuery && matches.has(sourceId) && matches.has(targetId)) {
    return "rgba(244, 251, 255, 0.45)";
  }

  if (state.searchQuery) {
    return "rgba(82, 98, 111, 0.08)";
  }

  return "rgba(126, 163, 186, 0.18)";
}

function linkWidth(link) {
  const pipeline = activePipeline();
  if (pipeline) {
    if (pipeline.edgeSet.has(link.id)) {
      return 3.2;
    }
    return 0.25;
  }

  if (isActiveLink(link)) {
    return 2.8;
  }

  const sourceId = getLinkSourceId(link);
  const targetId = getLinkTargetId(link);
  const matches = matchingNodeIds();

  if (state.searchQuery && matches.has(sourceId) && matches.has(targetId)) {
    return 1.2;
  }

  return 0.4;
}

function isActiveLink(link) {
  const pipeline = activePipeline();
  if (pipeline) {
    return pipeline.edgeSet.has(link.id);
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
  const selected = new Set(state.selectedNodeIds);
  const prerequisites = new Set();
  const dependents = new Set();

  selected.forEach((id) => {
    const node = state.prepared.nodeMap.get(id);
    if (!node) {
      return;
    }
    node.ancestorIds.forEach((ancestorId) => prerequisites.add(ancestorId));
    node.descendantIds.forEach((descendantId) => dependents.add(descendantId));
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

function uniqueNeighborIds(selection, direction) {
  const current = new Set(selection.map((node) => node.id));
  const ids = new Set();
  selection.forEach((node) => {
    node[direction].forEach((id) => {
      if (!current.has(id)) {
        ids.add(id);
      }
    });
  });
  return [...ids];
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

function sourcesHtml(node) {
  const sourceMap = new Map();
  [...node.sources, ...node.pipelines.flatMap((pipeline) => resolveSources(pipeline.source_ids))]
    .filter(Boolean)
    .forEach((source) => sourceMap.set(source.id, source));

  const items = [...sourceMap.values()];
  if (!items.length) {
    return `<p class="analytics-copy">No source links attached to this node.</p>`;
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

function metricCardHtml(label, value) {
  return `
    <div class="metric-card">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function matchingNodeIds() {
  const matches = new Set();
  currentVisibleNodes().forEach((node) => {
    if (isSearchMatch(node)) {
      matches.add(node.id);
    }
  });
  return matches;
}

function isSearchMatch(node) {
  return !state.searchQuery || node.searchText.includes(state.searchQuery);
}

function syncControls() {
  refs.layoutSelect.value = state.layout;
  refs.layoutSelect.querySelector('option[value="radial"]').disabled = !state.primarySelectionId;
  refs.layoutSelect.disabled = !state.graph;
  refs.autoRotateBtn.classList.toggle("is-active", state.autoRotate && state.rendererMode === "3d");
  refs.autoRotateBtn.disabled = !state.graph || state.rendererMode !== "3d";
  refs.screenshotBtn.disabled = !state.graph;
  refs.settingsShell.classList.toggle("is-open", state.settingsOpen);
  refs.settingsBtn.setAttribute("aria-expanded", String(state.settingsOpen));
  refs.settingsShell.setAttribute("aria-hidden", String(!state.settingsOpen));
}

function updateAutoRotate() {
  if (!state.graph || state.rendererMode !== "3d") {
    return;
  }
  const controls = state.graph.controls();
  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = 0.45;
}

function togglePanel(panel) {
  const collapsed = panel.classList.toggle("is-collapsed");
  const toggle = panel.querySelector(".panel-toggle");
  toggle.textContent = collapsed ? "Expand" : "Collapse";
  toggle.setAttribute("aria-expanded", String(!collapsed));
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
  if (state.layout === "radial") {
    state.layout = "force";
  }
  syncUrlState();
}

function applyUrlState() {
  const params = selectionParamsFromLocation();
  const nodesParam = params.get("nodes");
  const nodeParam = params.get("node");
  const pipelineParam = params.get("pipeline");

  if (pipelineParam && state.prepared.pipelineMap.has(pipelineParam)) {
    state.activePipelineId = pipelineParam;
  }

  if (nodesParam || nodeParam) {
    const ids = selectionIdsFromParams(params);
    if (ids.length) {
      state.selectedNodeIds = new Set(ids);
      state.primarySelectionId = ids[ids.length - 1];
      state.selectionSource = "url";
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
      return true;
    }
  }

  return false;
}

function syncUrlState() {
  const url = new URL(window.location.href);
  url.searchParams.delete("node");
  url.searchParams.delete("nodes");
  url.searchParams.delete("pipeline");
  if (state.selectedNodeIds.size > 1) {
    url.searchParams.set("nodes", [...state.selectedNodeIds].join(","));
  } else if (state.primarySelectionId) {
    url.searchParams.set("node", state.primarySelectionId);
  }
  if (state.activePipelineId) {
    url.searchParams.set("pipeline", state.activePipelineId);
  }
  url.hash = "";
  window.history.replaceState({}, "", url);
}

function selectionParamsFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("nodes") || searchParams.has("node")) {
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
  if (!state.prepared.nodeMap.has(DEFAULT_NODE_ID)) {
    clearSelection();
    return;
  }
  state.selectedNodeIds = new Set([DEFAULT_NODE_ID]);
  state.primarySelectionId = DEFAULT_NODE_ID;
  state.selectionSource = "default";
  state.activePipelineId = defaultPipelineIdForNode(state.prepared.nodeMap.get(DEFAULT_NODE_ID));
  clearUrlSelectionState();
}

function selectSingleNode(id) {
  const node = state.prepared.nodeMap.get(id);
  state.selectedNodeIds = new Set([id]);
  state.primarySelectionId = id;
  state.selectionSource = "user";
  state.activePipelineId = defaultPipelineIdForNode(node);
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
  url.searchParams.delete("node");
  url.searchParams.delete("nodes");
  url.searchParams.delete("pipeline");
  url.hash = "";
  window.history.replaceState({}, "", url);
}

function activatePipeline(pipelineId) {
  const pipeline = state.prepared.pipelineMap.get(pipelineId);
  if (!pipeline) {
    return;
  }
  state.activePipelineId = pipelineId;
  if (!state.primarySelectionId || !pipeline.nodeSet.has(state.primarySelectionId)) {
    const leadId = pipelineLeadNodeId(pipeline);
    if (leadId) {
      state.selectedNodeIds = new Set([leadId]);
      state.primarySelectionId = leadId;
    }
  }
  state.selectionSource = "user";
  syncUrlState();
  renderPanels();
  refreshGraphStyles();
  syncControls();
  if (state.primarySelectionId) {
    focusNode(state.primarySelectionId);
  }
}

function activePipeline() {
  return state.activePipelineId ? state.prepared.pipelineMap.get(state.activePipelineId) || null : null;
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
  return sortedPipelinesForNode(node)[0] || null;
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

function computeHierarchicalLayout(nodes) {
  const groups = new Map();
  let maxDepth = 0;
  nodes.forEach((node) => {
    if (!groups.has(node.depth)) {
      groups.set(node.depth, []);
    }
    groups.get(node.depth).push(node);
    maxDepth = Math.max(maxDepth, node.depth);
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
