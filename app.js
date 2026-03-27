const SVG_NS = "http://www.w3.org/2000/svg";

const COLORS = {
  goal: "#d96c3c",
  primary: "#2d7dd2",
  support: "#7d5ba6",
  algorithm: "#238b67",
  module: "#c84c1a",
  tool: "#865d36",
  stage: "#4c6a92",
  output: "#bf9b30",
};

const state = {
  data: null,
  activePipelineId: null,
  activeNodeId: null,
  query: "",
};

const searchInput = document.querySelector("#search");
const clearSelectionButton = document.querySelector("#clear-selection");
const pipelineList = document.querySelector("#pipeline-list");
const detailsPanel = document.querySelector("#details");
const legend = document.querySelector("#legend");
const svg = document.querySelector("#graph");

boot().catch((error) => {
  detailsPanel.innerHTML = `
    <div class="stack">
      <h3>Failed to load graph data</h3>
      <p>${escapeHtml(error.message)}</p>
    </div>
  `;
  console.error(error);
});

async function boot() {
  const response = await fetch("./data/genome_assembler_graph.json");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while loading graph data`);
  }

  const data = await response.json();
  state.data = indexData(data);
  applyUrlState();

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    state.activeNodeId = null;
    renderSidebar();
    renderGraph();
  });

  clearSelectionButton.addEventListener("click", () => {
    state.activePipelineId = null;
    state.activeNodeId = null;
    syncUrlState();
    renderSidebar();
    renderGraph();
  });

  window.addEventListener("popstate", () => {
    applyUrlState();
    renderSidebar();
    renderGraph();
  });

  renderLegend();
  renderSidebar();
  renderGraph();
}

function indexData(data) {
  const nodeMap = new Map(data.nodes.map((node) => [node.id, node]));
  const edgeMap = new Map(data.edges.map((edge) => [edge.id, edge]));
  const sourceMap = new Map(data.sources.map((source) => [source.id, source]));
  const laneOrder = new Map(data.lanes.map((lane, index) => [lane.id, index]));

  return {
    ...data,
    nodeMap,
    edgeMap,
    sourceMap,
    laneOrder,
  };
}

function renderLegend() {
  legend.innerHTML = "";
  state.data.lanes.forEach((lane) => {
    const pill = document.createElement("div");
    pill.className = "legend-pill";
    pill.textContent = lane.label;
    pill.style.setProperty("--swatch", getColorForKind(lane.id));
    legend.appendChild(pill);
  });
}

function renderSidebar() {
  renderPipelineCards();
  renderDetails();
}

function renderPipelineCards() {
  pipelineList.innerHTML = "";
  const pipelines = filteredPipelines();

  pipelines.forEach((pipeline) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pipeline-card";
    if (pipeline.id === state.activePipelineId) {
      button.classList.add("active");
    }

    const meta = [
      pipeline.focus,
      `${pipeline.step_ids.length} steps`,
    ];

    button.innerHTML = `
      <h3>${escapeHtml(pipeline.label)}</h3>
      <p>${escapeHtml(pipeline.tagline)}</p>
      <div class="pipeline-meta">
        ${meta
          .map(
            (item) =>
              `<span class="meta-pill" style="--swatch:${getColorForKind("tool")}">${escapeHtml(item)}</span>`
          )
          .join("")}
      </div>
    `;

    button.addEventListener("click", () => {
      state.activePipelineId = pipeline.id;
      state.activeNodeId = null;
      syncUrlState();
      renderSidebar();
      renderGraph();
    });

    pipelineList.appendChild(button);
  });

  if (pipelines.length === 0) {
    pipelineList.innerHTML = `
      <p class="lede">No pipelines match the current search term.</p>
    `;
  }
}

function renderDetails() {
  const pipeline = activePipeline();
  const node = activeNode();

  if (pipeline) {
    detailsPanel.innerHTML = pipelineDetailsHtml(pipeline);
    return;
  }

  if (node) {
    detailsPanel.innerHTML = nodeDetailsHtml(node);
    return;
  }

  const counts = {
    nodes: state.data.nodes.length,
    edges: state.data.edges.length,
    pipelines: state.data.pipelines.length,
  };

  detailsPanel.innerHTML = `
    <div class="stack">
      <h3>Overview</h3>
      <p>
        This graph is organized as a compositional map of genome assembly tools: goal, reads, support data,
        algorithmic primitive, reusable functional module, assembler, stage flow, and output.
      </p>
    </div>
    <div class="stack">
      <h3>Current Scope</h3>
      <ul>
        <li>${counts.nodes} curated nodes</li>
        <li>${counts.edges} typed relationships</li>
        <li>${counts.pipelines} highlightable method paths</li>
        <li>${state.data.sources.length} cited sources</li>
      </ul>
    </div>
    <div class="stack">
      <h3>Interaction</h3>
      <p>Select a pipeline to highlight its path, or click any node in the graph to inspect its local neighborhood.</p>
    </div>
  `;
}

function pipelineDetailsHtml(pipeline) {
  const sources = resolveSources(pipeline.source_ids);
  const steps = pipeline.step_ids
    .map((stepId) => state.data.nodeMap.get(stepId)?.label)
    .filter(Boolean);

  return `
    <div class="stack">
      <h3>${escapeHtml(pipeline.label)}</h3>
      <p>${escapeHtml(pipeline.description)}</p>
    </div>
    <div class="stack">
      <h3>Path</h3>
      <ul>
        ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ul>
    </div>
    <div class="stack">
      <h3>Sources</h3>
      <ul>
        ${sources
          .map(
            (source) =>
              `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a></li>`
          )
          .join("")}
      </ul>
    </div>
  `;
}

function nodeDetailsHtml(node) {
  const pipelineMatches = state.data.pipelines.filter((pipeline) =>
    pipeline.node_ids.includes(node.id)
  );
  const sources = resolveSources(node.source_ids || []);

  return `
    <div class="stack">
      <h3>${escapeHtml(node.label)}</h3>
      <p>${escapeHtml(node.summary)}</p>
    </div>
    <div class="stack">
      <h3>Category</h3>
      <p>${escapeHtml(sentenceCase(node.kind))}</p>
    </div>
    ${
      pipelineMatches.length
        ? `
          <div class="stack">
            <h3>Appears In</h3>
            <ul>
              ${pipelineMatches.map((pipeline) => `<li>${escapeHtml(pipeline.label)}</li>`).join("")}
            </ul>
          </div>
        `
        : ""
    }
    ${
      sources.length
        ? `
          <div class="stack">
            <h3>Sources</h3>
            <ul>
              ${sources
                .map(
                  (source) =>
                    `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a></li>`
                )
                .join("")}
            </ul>
          </div>
        `
        : ""
    }
  `;
}

function renderGraph() {
  const { lanes, nodes, edges, laneOrder } = state.data;
  const filteredNodeIds = new Set(filteredNodes().map((node) => node.id));
  const layoutNodes = nodes.filter(
    (node) => filteredNodeIds.has(node.id) || shouldShowNodeBecauseOfSelection(node.id)
  );
  const positions = layoutGraph(layoutNodes, lanes, laneOrder);

  const laneWidth = 210;
  const leftPad = 48;
  const rightPad = 48;
  const topPad = 84;
  const bottomPad = 48;
  const width = leftPad + rightPad + laneWidth * lanes.length;
  const height = positions.height + topPad + bottomPad;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";

  lanes.forEach((lane, index) => {
    const x = leftPad + laneWidth * index + 8;

    const divider = document.createElementNS(SVG_NS, "line");
    divider.setAttribute("class", "lane-divider");
    divider.setAttribute("x1", String(x - 18));
    divider.setAttribute("x2", String(x - 18));
    divider.setAttribute("y1", "56");
    divider.setAttribute("y2", String(height - 24));
    svg.appendChild(divider);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", "lane-label");
    label.setAttribute("x", String(x));
    label.setAttribute("y", "42");
    label.textContent = lane.label;
    svg.appendChild(label);
  });

  const edgeLayer = document.createElementNS(SVG_NS, "g");
  const nodeLayer = document.createElementNS(SVG_NS, "g");
  svg.append(edgeLayer, nodeLayer);

  edges.forEach((edge) => {
    const source = positions.map.get(edge.source);
    const target = positions.map.get(edge.target);
    if (!source || !target) {
      return;
    }

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", edgeClassName(edge));
    path.setAttribute("d", edgePath(source, target));
    path.dataset.id = edge.id;
    edgeLayer.appendChild(path);
  });

  layoutNodes.forEach((node) => {
    const position = positions.map.get(node.id);
    if (!position) {
      return;
    }

    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", nodeClassName(node));
    group.dataset.id = node.id;

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("class", "node-card");
    rect.setAttribute("x", String(position.x));
    rect.setAttribute("y", String(position.y));
    rect.setAttribute("width", String(position.width));
    rect.setAttribute("height", String(position.height));
    rect.setAttribute("fill", colorWithAlpha(getColorForKind(node.kind), 0.12));
    group.appendChild(rect);

    const subtitle = document.createElementNS(SVG_NS, "text");
    subtitle.setAttribute("class", "node-subtitle");
    subtitle.setAttribute("x", String(position.x + 16));
    subtitle.setAttribute("y", String(position.y + 20));
    subtitle.textContent = sentenceCase(node.kind);
    group.appendChild(subtitle);

    wrapText(group, node.label, position.x + 16, position.y + 42, 15, "node-title", 150);
    wrapText(group, node.summary, position.x + 16, position.y + 72, 11, "node-note", 154, 2);

    group.addEventListener("click", () => {
      state.activeNodeId = node.id;
      state.activePipelineId = null;
      syncUrlState();
      renderSidebar();
      renderGraph();
    });

    nodeLayer.appendChild(group);
  });
}

function filteredPipelines() {
  if (!state.query) {
    return state.data.pipelines;
  }

  return state.data.pipelines.filter((pipeline) => {
    const haystack = [
      pipeline.label,
      pipeline.tagline,
      pipeline.description,
      pipeline.focus,
      ...pipeline.step_ids.map((id) => state.data.nodeMap.get(id)?.label || ""),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(state.query);
  });
}

function filteredNodes() {
  if (!state.query) {
    return state.data.nodes;
  }

  return state.data.nodes.filter((node) => {
    const haystack = `${node.label} ${node.summary} ${node.kind}`.toLowerCase();
    return haystack.includes(state.query);
  });
}

function layoutGraph(nodes, lanes, laneOrder) {
  const laneBuckets = new Map(lanes.map((lane) => [lane.id, []]));
  nodes.forEach((node) => {
    laneBuckets.get(node.lane)?.push(node);
  });

  laneBuckets.forEach((bucket) => bucket.sort((a, b) => a.row - b.row));

  const map = new Map();
  const leftPad = 48;
  const topPad = 84;
  const laneWidth = 210;
  const nodeWidth = 176;
  const nodeHeight = 102;
  const rowGap = 124;
  let maxRows = 0;

  laneBuckets.forEach((bucket) => {
    maxRows = Math.max(maxRows, bucket.length);
  });

  laneBuckets.forEach((bucket, laneId) => {
    const laneIndex = laneOrder.get(laneId);
    bucket.forEach((node, index) => {
      map.set(node.id, {
        x: leftPad + laneWidth * laneIndex,
        y: topPad + 26 + rowGap * index,
        width: nodeWidth,
        height: nodeHeight,
        centerX: leftPad + laneWidth * laneIndex + nodeWidth / 2,
        centerY: topPad + 26 + rowGap * index + nodeHeight / 2,
      });
    });
  });

  return {
    map,
    height: maxRows * rowGap + nodeHeight,
  };
}

function edgePath(source, target) {
  const x1 = source.x + source.width;
  const y1 = source.centerY;
  const x2 = target.x;
  const y2 = target.centerY;
  const dx = Math.max(40, (x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function nodeClassName(node) {
  const classes = ["node"];
  const pipeline = activePipeline();
  const relatedNodeIds = selectedRelatedNodeIds();

  if (pipeline && pipeline.node_ids.includes(node.id)) {
    classes.push("active");
  } else if (relatedNodeIds.has(node.id)) {
    classes.push("related");
  }

  if (shouldDimNode(node.id)) {
    classes.push("dimmed");
  }

  return classes.join(" ");
}

function edgeClassName(edge) {
  const classes = ["edge"];
  const pipeline = activePipeline();
  const relatedEdgeIds = selectedRelatedEdgeIds();

  if (pipeline && pipeline.edge_ids.includes(edge.id)) {
    classes.push("active");
  } else if (relatedEdgeIds.has(edge.id)) {
    classes.push("related");
  }

  if (shouldDimEdge(edge.id)) {
    classes.push("dimmed");
  }

  return classes.join(" ");
}

function shouldDimNode(nodeId) {
  const pipeline = activePipeline();
  if (pipeline) {
    return !pipeline.node_ids.includes(nodeId);
  }

  const node = activeNode();
  if (node) {
    return !selectedRelatedNodeIds().has(nodeId);
  }

  return false;
}

function shouldDimEdge(edgeId) {
  const pipeline = activePipeline();
  if (pipeline) {
    return !pipeline.edge_ids.includes(edgeId);
  }

  const node = activeNode();
  if (node) {
    return !selectedRelatedEdgeIds().has(edgeId);
  }

  return false;
}

function shouldShowNodeBecauseOfSelection(nodeId) {
  const pipeline = activePipeline();
  if (pipeline && pipeline.node_ids.includes(nodeId)) {
    return true;
  }

  const node = activeNode();
  return Boolean(node && selectedRelatedNodeIds().has(nodeId));
}

function activePipeline() {
  return state.data?.pipelines.find((pipeline) => pipeline.id === state.activePipelineId) || null;
}

function activeNode() {
  return state.data?.nodeMap.get(state.activeNodeId) || null;
}

function selectedRelatedNodeIds() {
  const node = activeNode();
  const set = new Set();
  if (!node) {
    return set;
  }

  set.add(node.id);
  state.data.edges.forEach((edge) => {
    if (edge.source === node.id || edge.target === node.id) {
      set.add(edge.source);
      set.add(edge.target);
    }
  });
  return set;
}

function selectedRelatedEdgeIds() {
  const node = activeNode();
  const set = new Set();
  if (!node) {
    return set;
  }

  state.data.edges.forEach((edge) => {
    if (edge.source === node.id || edge.target === node.id) {
      set.add(edge.id);
    }
  });
  return set;
}

function resolveSources(sourceIds) {
  return sourceIds
    .map((sourceId) => state.data.sourceMap.get(sourceId))
    .filter(Boolean);
}

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const pipelineId = params.get("pipeline");
  const nodeId = params.get("node");

  state.activePipelineId = state.data.pipelines.some((pipeline) => pipeline.id === pipelineId)
    ? pipelineId
    : null;
  state.activeNodeId = state.data.nodeMap.has(nodeId) ? nodeId : null;

  if (state.activePipelineId) {
    state.activeNodeId = null;
  }
}

function syncUrlState() {
  const url = new URL(window.location.href);

  if (state.activePipelineId) {
    url.searchParams.set("pipeline", state.activePipelineId);
    url.searchParams.delete("node");
  } else if (state.activeNodeId) {
    url.searchParams.set("node", state.activeNodeId);
    url.searchParams.delete("pipeline");
  } else {
    url.searchParams.delete("pipeline");
    url.searchParams.delete("node");
  }

  window.history.replaceState({}, "", url);
}

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function wrapText(group, text, x, y, fontSize, className, maxWidth, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize) <= maxWidth || !current) {
      current = candidate;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    const textNode = document.createElementNS(SVG_NS, "text");
    textNode.setAttribute("class", className);
    textNode.setAttribute("x", String(x));
    textNode.setAttribute("y", String(y + index * (fontSize + 4)));
    textNode.textContent =
      index === maxLines - 1 && lines.length > maxLines
        ? `${line.replace(/\W*\w+$/, "")}...`
        : line;
    group.appendChild(textNode);
  });
}

function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.58;
}

function colorWithAlpha(hex, alpha) {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getColorForKind(kind) {
  return COLORS[kind] || "#7a7a7a";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
