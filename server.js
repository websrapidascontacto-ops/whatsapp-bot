const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/save-flow", (req, res) => {
  const flow = req.body;

  const error = validarFlujo(flow);
  if (error !== true) {
    return res.status(400).json({ error });
  }

  fs.writeFileSync("flow.json", JSON.stringify(flow, null, 2));
  res.json({ success: true });
});

function validarFlujo(flow) {
  const { nodes, edges } = flow;

  const startNodes = nodes.filter(n => n.type === "start");
  if (startNodes.length !== 1)
    return "Debe existir un solo nodo Inicio";

  const connected = new Set();
  edges.forEach(e => {
    connected.add(e.from);
    connected.add(e.to);
  });

  const orphan = nodes.filter(n =>
    n.type !== "start" && !connected.has(n.id)
  );

  if (orphan.length > 0)
    return "Hay nodos sin conectar";

  return true;
}

app.listen(8080, () =>
  console.log("Servidor corriendo en puerto 8080")
);
