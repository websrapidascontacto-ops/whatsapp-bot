let nodes = [];
let edges = [];
let nodeId = 1;
let selectedNode = null;
let selectedConnector = null;
let scale = 1;

const canvas = document.getElementById("canvas");
const svg = document.getElementById("connections");
const wrapper = document.getElementById("canvas-wrapper");
const configPanel = document.getElementById("node-config");

wrapper.addEventListener("wheel", e => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(.5, scale), 2);
  wrapper.style.transform = `scale(${scale})`;
});

function addNode(type) {
  const id = String(nodeId++);

  const node = {
    id,
    type,
    x: 200,
    y: 200,
    delay: 0,
    data: { text: "", url: "", options: [] }
  };

  nodes.push(node);
  render();
  autoSave();
}

function render() {
  canvas.innerHTML = "";
  svg.innerHTML = "";

  nodes.forEach(node => {
    const div = document.createElement("div");
    div.className = "node";
    div.style.left = node.x + "px";
    div.style.top = node.y + "px";
    div.innerHTML = `
      <strong>${node.type.toUpperCase()}</strong>
      <div class="connector" onclick="selectConnector('${node.id}')"></div>
    `;

    div.onclick = () => openConfig(node.id);
    makeDraggable(div, node);

    canvas.appendChild(div);
  });

  drawEdges();
}

function makeDraggable(element, node) {
  element.onmousedown = function(e) {
    if (e.target.classList.contains("connector")) return;

    const offsetX = e.clientX - node.x;
    const offsetY = e.clientY - node.y;

    document.onmousemove = function(e) {
      node.x = (e.clientX - offsetX);
      node.y = (e.clientY - offsetY);
      render();
      autoSave();
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
    autoSave();
  }
}

function drawEdges() {
  edges.forEach((edge, index) => {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);

    const x1 = from.x + 240;
    const y1 = from.y + 40;
    const x2 = to.x;
    const y2 = to.y + 40;

    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    const curve = `M ${x1} ${y1} C ${x1+100} ${y1}, ${x2-100} ${y2}, ${x2} ${y2}`;
    path.setAttribute("d", curve);
    path.setAttribute("stroke", "#6c5ce7");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");

    svg.appendChild(path);

    const midX = (x1 + x2)/2;
    const midY = (y1 + y2)/2;

    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx", midX);
    circle.setAttribute("cy", midY);
    circle.setAttribute("r", 8);
    circle.setAttribute("fill", "red");
    circle.style.cursor = "pointer";

    circle.onclick = () => {
      edges.splice(index,1);
      render();
      autoSave();
    };

    svg.appendChild(circle);
  });
}

function openConfig(id) {
  selectedNode = nodes.find(n => n.id === id);

  configPanel.innerHTML = `
    <label>Delay</label>
    <input type="number" value="${selectedNode.delay}"
      onchange="updateDelay(this.value)" />
    
    <label>Texto</label>
    <textarea onchange="updateText(this.value)">
      ${selectedNode.data.text}
    </textarea>
  `;
}

function updateDelay(value) {
  selectedNode.delay = Number(value);
  autoSave();
}

function updateText(value) {
  selectedNode.data.text = value;
  autoSave();
}

function saveFlow() {
  fetch("/save-flow", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({nodes,edges})
  });
}

function autoSave() {
  saveFlow();
}

render();
