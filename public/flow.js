let nodes = [];
let edges = [];
let nodeId = 1;
let selectedConnector = null;

const canvas = document.getElementById("canvas");
const svg = document.getElementById("connections");

function addNode(type) {
  const id = String(nodeId++);

  const node = {
    id,
    type,
    x: 100 + nodeId * 20,
    y: 100 + nodeId * 20,
    delay: 0,
    data: { options: [] }
  };

  nodes.push(node);
  render();
}

function render() {
  canvas.querySelectorAll(".node").forEach(n => n.remove());
  svg.innerHTML = "";

  nodes.forEach(node => {
    const div = document.createElement("div");
    div.className = "node";
    div.style.left = node.x + "px";
    div.style.top = node.y + "px";
    div.innerHTML = `
      <strong>${node.type.toUpperCase()}</strong><br>
      Delay: <input type="number" value="${node.delay}"
        onchange="nodeDelay('${node.id}',this.value)" /><br>
      <div class="connector"
        onclick="selectConnector('${node.id}')"></div>
    `;

    makeDraggable(div, node);
    canvas.appendChild(div);
  });

  drawEdges();
}

function makeDraggable(element, node) {
  element.onmousedown = function(e) {
    const offsetX = e.clientX - node.x;
    const offsetY = e.clientY - node.y;

    document.onmousemove = function(e) {
      node.x = e.clientX - offsetX;
      node.y = e.clientY - offsetY;
      render();
    };

    document.onmouseup = function() {
      document.onmousemove = null;
    };
  };
}

function selectConnector(id) {
  if (!selectedConnector) {
    selectedConnector = id;
  } else {
    edges.push({ from: selectedConnector, to: id });
    selectedConnector = null;
    render();
  }
}

function drawEdges() {
  edges.forEach((edge, index) => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);

    const x1 = fromNode.x + 260;
    const y1 = fromNode.y + 40;
    const x2 = toNode.x;
    const y2 = toNode.y + 40;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#6c5ce7");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", midX);
    circle.setAttribute("cy", midY);
    circle.setAttribute("r", 10);
    circle.setAttribute("class", "edge-delete");
    circle.onclick = () => {
      edges.splice(index, 1);
      render();
    };

    svg.appendChild(circle);
  });
}

function nodeDelay(id, value) {
  const node = nodes.find(n => n.id === id);
  node.delay = Number(value);
}

function saveFlow() {
  fetch("/save-flow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges })
  })
  .then(r => r.json())
  .then(res => {
    if (res.error) alert(res.error);
    else alert("Flujo guardado correctamente");
  });
}

render();
