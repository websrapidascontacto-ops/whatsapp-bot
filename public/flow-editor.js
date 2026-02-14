let editorIniciado = false;

function startEditor() {
  if (editorIniciado) return;
  editorIniciado = true;

  const container = document.getElementById('flow-editor-container');

  container.innerHTML = `
    <div class="flow-header">
      <span>Editor de Flujos</span>
      <div>
        <button id="add-trigger" class="btn btn-sm btn-light">+ Trigger</button>
        <button id="add-msg" class="btn btn-sm btn-light">+ Mensaje</button>
        <button id="save-flow" class="btn btn-sm btn-success">Guardar</button>
        <button id="close-flow" class="btn btn-sm btn-danger">Cerrar</button>
      </div>
    </div>
    <div id="canvas-wrapper">
      <div id="canvas-area"></div>
    </div>
  `;

  const canvas = document.getElementById('canvas-area');

  document.getElementById('add-trigger').onclick = () => {
    crearNodo("Trigger", "trigger");
  };

  document.getElementById('add-msg').onclick = () => {
    crearNodo("Mensaje", "mensaje");
  };

  document.getElementById('close-flow').onclick = () => {
    container.style.display = "none";
  };

  document.getElementById('save-flow').onclick = guardarFlujo;
}

function crearNodo(titulo, clase) {
  const nodo = document.createElement('div');
  nodo.className = "nodo";
  nodo.style.left = Math.random() * 800 + "px";
  nodo.style.top = Math.random() * 400 + "px";

  nodo.innerHTML = `
    <div class="nodo-header ${clase}">
      ${titulo}
    </div>
    <div class="nodo-body">
      <input class="form-control form-control-sm mb-2" placeholder="Contenido...">
    </div>
    <div class="port port-in"></div>
    <div class="port port-out"></div>
  `;

  hacerDraggable(nodo);

  document.getElementById('canvas-area').appendChild(nodo);
}

function hacerDraggable(el) {
  let offsetX, offsetY;

  el.onmousedown = function(e) {
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

    document.onmousemove = function(e) {
      el.style.left = e.clientX - offsetX + 'px';
      el.style.top = e.clientY - offsetY + 'px';
    };

    document.onmouseup = function() {
      document.onmousemove = null;
    };
  };
}

function guardarFlujo() {
  const nodos = [];
  document.querySelectorAll('.nodo').forEach(n => {
    nodos.push({
      x: n.style.left,
      y: n.style.top
    });
  });

  fetch('/api/guardar-flujo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodos })
  }).then(() => alert("Flujo guardado"));
}
