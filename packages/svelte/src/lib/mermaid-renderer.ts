/**
 * Stream-safe, zero-dependency Mermaid diagram parser and SVG renderer for Joy Design.
 * Supports:
 * 1. Flowchart / Graph (TD, TB, BT, LR, RL) with rectangular, rounded, stadium, diamond, cylinder and circle nodes,
 *    labeled edges, and directional arrows.
 * 2. Sequence Diagrams with participants/actors, message lifelines (solid, dashed, async), and notes.
 *
 * All generated SVG elements map to Joy semantic tokens (.joy-mermaid-*).
 */

export interface MermaidRenderResult {
  success: boolean;
  type: 'flowchart' | 'sequence' | 'unknown';
  svg?: string;
  title?: string;
  error?: string;
}

interface FlowNode {
  id: string;
  label: string;
  shape: 'rect' | 'round' | 'stadium' | 'diamond' | 'cylinder' | 'circle';
  layer?: number;
  x?: number;
  y?: number;
  width: number;
  height: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  style: 'solid' | 'dashed' | 'thick';
  arrow: boolean;
}

interface SequenceParticipant {
  id: string;
  label: string;
  type: 'participant' | 'actor';
  x?: number;
}

interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  style: 'solid' | 'dashed';
  arrow: boolean;
}

interface SequenceNote {
  participants: string[];
  label: string;
  position: 'over' | 'left of' | 'right of';
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parses node declaration such as:
 * A[Label Here]
 * B(Rounded)
 * C([Stadium])
 * D{Diamond}
 * E[(Database)]
 * F((Circle))
 * G
 */
function parseNodeDeclaration(raw: string): { id: string; label: string; shape: FlowNode['shape'] } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Cylinder: id[(label)]
  const cylMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)\[\((.*?)\)\]$/);
  if (cylMatch) {
    return { id: cylMatch[1], label: cylMatch[2] || cylMatch[1], shape: 'cylinder' };
  }

  // Stadium: id([label])
  const stadiumMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)\(\[(.*?)\]\)$/);
  if (stadiumMatch) {
    return { id: stadiumMatch[1], label: stadiumMatch[2] || stadiumMatch[1], shape: 'stadium' };
  }

  // Circle: id((label))
  const circleMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)\(\((.*?)\)\)$/);
  if (circleMatch) {
    return { id: circleMatch[1], label: circleMatch[2] || circleMatch[1], shape: 'circle' };
  }

  // Diamond: id{label}
  const diamondMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)\{(.*?)\}$/);
  if (diamondMatch) {
    return { id: diamondMatch[1], label: diamondMatch[2] || diamondMatch[1], shape: 'diamond' };
  }

  // Round rect: id(label)
  const roundMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)\((.*?)\)$/);
  if (roundMatch) {
    return { id: roundMatch[1], label: roundMatch[2] || roundMatch[1], shape: 'round' };
  }

  // Rect: id[label]
  const rectMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)\[(.*?)\]$/);
  if (rectMatch) {
    return { id: rectMatch[1], label: rectMatch[2] || rectMatch[1], shape: 'rect' };
  }

  // Bare ID
  const bareMatch = trimmed.match(/^([a-zA-Z0-9_\u00C0-\u024F-]+)$/);
  if (bareMatch) {
    return { id: bareMatch[1], label: bareMatch[1], shape: 'rect' };
  }

  return null;
}

function renderFlowchart(lines: string[], direction: 'TD' | 'LR'): MermaidRenderResult {
  const nodes = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];

  function getOrCreateNode(declaration: string): FlowNode {
    const parsed = parseNodeDeclaration(declaration);
    if (!parsed) {
      const id = declaration.replace(/[^a-zA-Z0-9_-]/g, '_');
      const existing = nodes.get(id);
      if (existing) return existing;
      const width = Math.max(100, id.length * 9 + 32);
      const created: FlowNode = { id, label: id, shape: 'rect', width, height: 44 };
      nodes.set(id, created);
      return created;
    }
    const existing = nodes.get(parsed.id);
    if (existing) {
      if (parsed.label !== parsed.id) {
        existing.label = parsed.label;
        existing.shape = parsed.shape;
        existing.width = Math.max(100, parsed.label.length * 9 + 32);
      }
      return existing;
    }
    const width = Math.max(100, parsed.label.length * 9 + 32);
    const created: FlowNode = {
      id: parsed.id,
      label: parsed.label,
      shape: parsed.shape,
      width,
      height: parsed.shape === 'diamond' ? 56 : 44
    };
    nodes.set(parsed.id, created);
    return created;
  }

  // Regex for edge with optional label:
  // e.g. A --> B
  // e.g. A -->|Yes| B
  // e.g. A -- Yes --> B
  // e.g. A -.-> B
  // e.g. A ==> B
  const edgeRegex =
    /^(.*?)\s*(-->|---|-.->|-.-|==>|===|--\s*.*?\s*-->|-\.\s*.*?\s*\.->|==\s*.*?\s*==>)\s*(.*)$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%') || line.startsWith('subgraph') || line.startsWith('end')) {
      continue;
    }

    const match = line.match(edgeRegex);
    if (match) {
      const leftPart = match[1].trim();
      const opPart = match[2].trim();
      let rightPart = match[3].trim();

      let label: string | undefined = undefined;
      let style: FlowEdge['style'] = 'solid';
      let arrow = true;

      // Extract pipe label: -->|label| rightPart
      if (rightPart.startsWith('|')) {
        const pipeEnd = rightPart.indexOf('|', 1);
        if (pipeEnd !== -1) {
          label = rightPart.slice(1, pipeEnd).trim();
          rightPart = rightPart.slice(pipeEnd + 1).trim();
        }
      }

      // Extract inline label: -- label -->
      if (opPart.startsWith('--') && opPart.endsWith('-->') && opPart.length > 5) {
        label = opPart.slice(2, -3).trim();
        style = 'solid';
        arrow = true;
      } else if (opPart.startsWith('-.') && opPart.endsWith('.->') && opPart.length > 5) {
        label = opPart.slice(2, -3).trim();
        style = 'dashed';
        arrow = true;
      } else if (opPart.startsWith('==') && opPart.endsWith('==>') && opPart.length > 5) {
        label = opPart.slice(2, -3).trim();
        style = 'thick';
        arrow = true;
      } else if (opPart.includes('-.->') || opPart.includes('-.-')) {
        style = 'dashed';
        arrow = opPart.includes('>');
      } else if (opPart.includes('==>')) {
        style = 'thick';
        arrow = true;
      } else if (opPart === '===') {
        style = 'thick';
        arrow = false;
      } else if (opPart === '---') {
        style = 'solid';
        arrow = false;
      } else {
        style = 'solid';
        arrow = true;
      }

      const sourceNode = getOrCreateNode(leftPart);
      const targetNode = getOrCreateNode(rightPart);

      edges.push({
        from: sourceNode.id,
        to: targetNode.id,
        label,
        style,
        arrow
      });
    } else {
      // Standalone node
      getOrCreateNode(line);
    }
  }

  if (nodes.size === 0) {
    return {
      success: false,
      type: 'flowchart',
      error: 'No nodes or edges found in flowchart definition.'
    };
  }

  // Compute layers via topological / longest path
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const [id] of nodes) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of edges) {
    if (nodes.has(edge.from) && nodes.has(edge.to)) {
      adj.get(edge.from)?.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }
  }

  // Assign layers
  const nodeLayer = new Map<string, number>();
  const queue: Array<{ id: string; layer: number }> = [];

  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push({ id, layer: 0 });
      nodeLayer.set(id, 0);
    }
  }

  // Fallback if all nodes are in a cycle
  if (queue.length === 0) {
    const firstId = nodes.keys().next().value;
    if (firstId) {
      queue.push({ id: firstId, layer: 0 });
      nodeLayer.set(firstId, 0);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const { id, layer } = queue[head++];
    const neighbors = adj.get(id) || [];
    for (const next of neighbors) {
      const currentLayer = nodeLayer.get(next) ?? -1;
      const proposed = layer + 1;
      if (proposed > currentLayer && proposed < 25) {
        nodeLayer.set(next, proposed);
        queue.push({ id: next, layer: proposed });
      }
    }
  }

  // Ensure every node has a layer
  for (const [id, node] of nodes) {
    const l = nodeLayer.get(id) ?? 0;
    node.layer = l;
  }

  // Group nodes by layer
  const layersMap = new Map<number, FlowNode[]>();
  for (const node of nodes.values()) {
    const l = node.layer ?? 0;
    if (!layersMap.has(l)) layersMap.set(l, []);
    layersMap.get(l)!.push(node);
  }

  const sortedLayerIndices = Array.from(layersMap.keys()).sort((a, b) => a - b);

  // Position nodes
  const isTD = direction === 'TD';
  const padding = 40;
  const rankGap = 70;
  const siblingGap = 32;

  let totalWidth = 0;
  let totalHeight = 0;

  if (isTD) {
    let currentY = padding;
    let maxRowWidth = 0;

    for (const lIdx of sortedLayerIndices) {
      const layerNodes = layersMap.get(lIdx)!;
      const rowWidth =
        layerNodes.reduce((sum, n) => sum + n.width, 0) + (layerNodes.length - 1) * siblingGap;
      maxRowWidth = Math.max(maxRowWidth, rowWidth);
    }

    totalWidth = Math.max(maxRowWidth + padding * 2, 320);

    for (const lIdx of sortedLayerIndices) {
      const layerNodes = layersMap.get(lIdx)!;
      const rowWidth =
        layerNodes.reduce((sum, n) => sum + n.width, 0) + (layerNodes.length - 1) * siblingGap;
      let startX = (totalWidth - rowWidth) / 2;
      let maxHeightInLayer = 0;

      for (const node of layerNodes) {
        node.x = startX;
        node.y = currentY;
        startX += node.width + siblingGap;
        maxHeightInLayer = Math.max(maxHeightInLayer, node.height);
      }
      currentY += maxHeightInLayer + rankGap;
    }
    totalHeight = currentY - rankGap + padding;
  } else {
    // LR
    let currentX = padding;
    let maxColHeight = 0;

    for (const lIdx of sortedLayerIndices) {
      const layerNodes = layersMap.get(lIdx)!;
      const colHeight =
        layerNodes.reduce((sum, n) => sum + n.height, 0) + (layerNodes.length - 1) * siblingGap;
      maxColHeight = Math.max(maxColHeight, colHeight);
    }

    totalHeight = Math.max(maxColHeight + padding * 2, 240);

    for (const lIdx of sortedLayerIndices) {
      const layerNodes = layersMap.get(lIdx)!;
      const colHeight =
        layerNodes.reduce((sum, n) => sum + n.height, 0) + (layerNodes.length - 1) * siblingGap;
      let startY = (totalHeight - colHeight) / 2;
      let maxWidthInLayer = 0;

      for (const node of layerNodes) {
        node.x = currentX;
        node.y = startY;
        startY += node.height + siblingGap;
        maxWidthInLayer = Math.max(maxWidthInLayer, node.width);
      }
      currentX += maxWidthInLayer + rankGap;
    }
    totalWidth = currentX - rankGap + padding;
  }

  // Generate SVG elements
  const svgParts: string[] = [];
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" class="joy-mermaid__svg" role="img" aria-label="Mermaid Flowchart">`
  );
  svgParts.push(`<title>Flowchart (${direction})</title>`);

  // Edges layer first
  for (const edge of edges) {
    const sNode = nodes.get(edge.from);
    const tNode = nodes.get(edge.to);
    if (!sNode || !tNode || sNode.x === undefined || sNode.y === undefined || tNode.x === undefined || tNode.y === undefined) {
      continue;
    }

    let x1 = 0,
      y1 = 0,
      x2 = 0,
      y2 = 0;

    if (isTD) {
      // Connect bottom center of source to top center of target
      x1 = sNode.x + sNode.width / 2;
      y1 = sNode.y + sNode.height;
      x2 = tNode.x + tNode.width / 2;
      y2 = tNode.y;
    } else {
      // Connect right center of source to left center of target
      x1 = sNode.x + sNode.width;
      y1 = sNode.y + sNode.height / 2;
      x2 = tNode.x;
      y2 = tNode.y + tNode.height / 2;
    }

    const strokeDash = edge.style === 'dashed' ? ' stroke-dasharray="5 5"' : '';
    const strokeWidth = edge.style === 'thick' ? ' stroke-width="2.5"' : ' stroke-width="1.5"';

    // Path with curved bezier
    let pathD = '';
    if (isTD) {
      const midY = (y1 + y2) / 2;
      pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    } else {
      const midX = (x1 + x2) / 2;
      pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }

    svgParts.push(`<path class="joy-mermaid-edge" d="${pathD}"${strokeDash}${strokeWidth} />`);

    // Arrow marker
    if (edge.arrow) {
      if (isTD) {
        svgParts.push(
          `<polygon class="joy-mermaid-arrow" points="${x2 - 5},${y2 - 8} ${x2 + 5},${y2 - 8} ${x2},${y2}" />`
        );
      } else {
        svgParts.push(
          `<polygon class="joy-mermaid-arrow" points="${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5} ${x2},${y2}" />`
        );
      }
    }

    // Edge label
    if (edge.label) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const labelText = escapeXml(edge.label);
      const labelW = Math.max(28, edge.label.length * 7.5 + 12);
      const labelH = 18;

      svgParts.push(`<g class="joy-mermaid-label">`);
      svgParts.push(
        `<rect class="joy-mermaid-label-bg" x="${midX - labelW / 2}" y="${midY - labelH / 2}" width="${labelW}" height="${labelH}" rx="4" />`
      );
      svgParts.push(`<text x="${midX}" y="${midY}">${labelText}</text>`);
      svgParts.push(`</g>`);
    }
  }

  // Nodes layer
  for (const node of nodes.values()) {
    if (node.x === undefined || node.y === undefined) continue;
    const nx = node.x;
    const ny = node.y;
    const nw = node.width;
    const nh = node.height;
    const labelText = escapeXml(node.label);

    svgParts.push(`<g class="joy-mermaid-node" data-node-id="${node.id}">`);

    if (node.shape === 'diamond') {
      const cx = nx + nw / 2;
      const cy = ny + nh / 2;
      svgParts.push(
        `<polygon points="${cx},${ny} ${nx + nw},${cy} ${cx},${ny + nh} ${nx},${cy}" />`
      );
    } else if (node.shape === 'circle') {
      const r = nh / 2;
      svgParts.push(`<circle cx="${nx + nw / 2}" cy="${ny + nh / 2}" r="${r}" />`);
    } else if (node.shape === 'stadium') {
      svgParts.push(`<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="${nh / 2}" ry="${nh / 2}" />`);
    } else if (node.shape === 'round') {
      svgParts.push(`<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="12" ry="12" />`);
    } else if (node.shape === 'cylinder') {
      svgParts.push(`<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="6" ry="6" />`);
      // Arch decoration for cylinder top
      svgParts.push(
        `<path d="M ${nx} ${ny + 8} Q ${nx + nw / 2} ${ny + 16} ${nx + nw} ${ny + 8}" fill="none" stroke="var(--joy-border-strong)" stroke-width="1.5" />`
      );
    } else {
      // Default rect
      svgParts.push(`<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="6" ry="6" />`);
    }

    svgParts.push(`<text x="${nx + nw / 2}" y="${ny + nh / 2}">${labelText}</text>`);
    svgParts.push(`</g>`);
  }

  svgParts.push(`</svg>`);

  return {
    success: true,
    type: 'flowchart',
    svg: svgParts.join('\n'),
    title: `Flowchart (${direction})`
  };
}

function renderSequence(lines: string[]): MermaidRenderResult {
  const participants: SequenceParticipant[] = [];
  const partMap = new Map<string, SequenceParticipant>();
  const messages: SequenceMessage[] = [];
  const notes: SequenceNote[] = [];

  function getOrCreateParticipant(id: string, label?: string, type: 'participant' | 'actor' = 'participant'): SequenceParticipant {
    const existing = partMap.get(id);
    if (existing) {
      if (label && label !== id) existing.label = label;
      return existing;
    }
    const created: SequenceParticipant = {
      id,
      label: label || id,
      type
    };
    partMap.set(id, created);
    participants.push(created);
    return created;
  }

  // Regex for sequence message: A->>B: message
  const msgRegex = /^([a-zA-Z0-9_-]+)\s*(->>|-->>|->|-->)\s*([a-zA-Z0-9_-]+)\s*:\s*(.*)$/;
  // Regex for participant: participant A as Label or participant A
  const partRegex = /^(participant|actor)\s+([a-zA-Z0-9_-]+)(?:\s+as\s+(.*))?$/i;
  // Regex for note: Note over A,B: message or Note right of A: message
  const noteRegex = /^note\s+(over|left of|right of)\s+([a-zA-Z0-9_,-]+)\s*:\s*(.*)$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%') || line.toLowerCase() === 'sequencediagram') {
      continue;
    }

    const pMatch = line.match(partRegex);
    if (pMatch) {
      const type = pMatch[1].toLowerCase() as 'participant' | 'actor';
      const id = pMatch[2];
      const label = pMatch[3]?.trim();
      getOrCreateParticipant(id, label, type);
      continue;
    }

    const nMatch = line.match(noteRegex);
    if (nMatch) {
      const pos = nMatch[1].toLowerCase() as 'over' | 'left of' | 'right of';
      const pList = nMatch[2].split(',').map((p) => p.trim());
      const noteText = nMatch[3].trim();
      for (const p of pList) {
        getOrCreateParticipant(p);
      }
      notes.push({
        participants: pList,
        label: noteText,
        position: pos
      });
      continue;
    }

    const mMatch = line.match(msgRegex);
    if (mMatch) {
      const from = mMatch[1];
      const op = mMatch[2];
      const to = mMatch[3];
      const label = mMatch[4].trim();

      getOrCreateParticipant(from);
      getOrCreateParticipant(to);

      messages.push({
        from,
        to,
        label,
        style: op.startsWith('--') ? 'dashed' : 'solid',
        arrow: op.endsWith('>>') || op.endsWith('>')
      });
    }
  }

  if (participants.length === 0) {
    return {
      success: false,
      type: 'sequence',
      error: 'No participants found in sequence diagram.'
    };
  }

  // Layout coordinates
  const paddingX = 40;
  const colWidth = Math.max(160, 600 / Math.max(1, participants.length));
  const boxWidth = Math.min(140, colWidth - 24);
  const boxHeight = 36;
  const rowHeight = 48;
  const headerY = 30;

  participants.forEach((p, idx) => {
    p.x = paddingX + idx * colWidth + colWidth / 2;
  });

  const totalWidth = paddingX * 2 + participants.length * colWidth;
  const numSteps = Math.max(messages.length, 1);
  const lifelineBottom = headerY + boxHeight + (numSteps + 1) * rowHeight + 20;
  const totalHeight = lifelineBottom + boxHeight + 40;

  const svgParts: string[] = [];
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" class="joy-mermaid__svg" role="img" aria-label="Mermaid Sequence Diagram">`
  );
  svgParts.push(`<title>Sequence Diagram</title>`);

  // Lifelines
  for (const p of participants) {
    if (p.x === undefined) continue;
    svgParts.push(
      `<line class="joy-mermaid-edge" x1="${p.x}" y1="${headerY + boxHeight}" x2="${p.x}" y2="${lifelineBottom}" stroke-dasharray="4 4" />`
    );
  }

  // Messages
  messages.forEach((msg, idx) => {
    const sPart = partMap.get(msg.from);
    const tPart = partMap.get(msg.to);
    if (!sPart || !tPart || sPart.x === undefined || tPart.x === undefined) return;

    const y = headerY + boxHeight + (idx + 1) * rowHeight;
    const x1 = sPart.x;
    const x2 = tPart.x;
    const strokeDash = msg.style === 'dashed' ? ' stroke-dasharray="5 5"' : '';

    svgParts.push(`<line class="joy-mermaid-edge" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"${strokeDash} />`);

    if (msg.arrow && x1 !== x2) {
      if (x2 > x1) {
        // Arrow pointing right
        svgParts.push(
          `<polygon class="joy-mermaid-arrow" points="${x2 - 8},${y - 4} ${x2 - 8},${y + 4} ${x2},${y}" />`
        );
      } else {
        // Arrow pointing left
        svgParts.push(
          `<polygon class="joy-mermaid-arrow" points="${x2 + 8},${y - 4} ${x2 + 8},${y + 4} ${x2},${y}" />`
        );
      }
    }

    // Message label
    const midX = (x1 + x2) / 2;
    const labelText = escapeXml(msg.label);
    const labelW = Math.max(30, msg.label.length * 7 + 10);
    svgParts.push(`<g class="joy-mermaid-label">`);
    svgParts.push(
      `<rect class="joy-mermaid-label-bg" x="${midX - labelW / 2}" y="${y - 18}" width="${labelW}" height="14" rx="3" />`
    );
    svgParts.push(`<text x="${midX}" y="${y - 11}">${labelText}</text>`);
    svgParts.push(`</g>`);
  });

  // Participant boxes (top & bottom)
  for (const p of participants) {
    if (p.x === undefined) continue;
    const bx = p.x - boxWidth / 2;
    const labelText = escapeXml(p.label);

    // Top box
    svgParts.push(`<g class="joy-mermaid-node">`);
    svgParts.push(`<rect x="${bx}" y="${headerY}" width="${boxWidth}" height="${boxHeight}" rx="6" />`);
    svgParts.push(`<text x="${p.x}" y="${headerY + boxHeight / 2}">${labelText}</text>`);
    svgParts.push(`</g>`);

    // Bottom box
    svgParts.push(`<g class="joy-mermaid-node">`);
    svgParts.push(`<rect x="${bx}" y="${lifelineBottom}" width="${boxWidth}" height="${boxHeight}" rx="6" />`);
    svgParts.push(`<text x="${p.x}" y="${lifelineBottom + boxHeight / 2}">${labelText}</text>`);
    svgParts.push(`</g>`);
  }

  svgParts.push(`</svg>`);

  return {
    success: true,
    type: 'sequence',
    svg: svgParts.join('\n'),
    title: 'Sequence Diagram'
  };
}

/**
 * Main entrance to render Mermaid code to SVG.
 */
export function renderMermaidToSvg(code: string): MermaidRenderResult {
  const trimmed = (code || '').trim();
  if (!trimmed) {
    return {
      success: false,
      type: 'unknown',
      error: 'Empty mermaid definition.'
    };
  }

  const lines = trimmed.split('\n');
  const firstLine = lines[0].trim().toLowerCase();

  if (firstLine.startsWith('graph') || firstLine.startsWith('flowchart')) {
    const dirMatch = lines[0].trim().match(/^(?:graph|flowchart)\s+([A-Za-z]+)/i);
    const rawDir = dirMatch ? dirMatch[1].toUpperCase() : 'TD';
    const direction = rawDir === 'LR' || rawDir === 'RL' ? 'LR' : 'TD';
    return renderFlowchart(lines.slice(1), direction);
  }

  if (firstLine.startsWith('sequencediagram')) {
    return renderSequence(lines.slice(1));
  }

  // If no explicit header, attempt flowchart TD
  const fallback = renderFlowchart(lines, 'TD');
  if (fallback.success) return fallback;

  return {
    success: false,
    type: 'unknown',
    error: `Unsupported diagram syntax: "${lines[0]}". Supported: flowchart/graph (TD, LR) and sequenceDiagram.`
  };
}
