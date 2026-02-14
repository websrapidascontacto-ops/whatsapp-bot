const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FOLDER = path.join(__dirname, 'data');
const FLOW_FILE = path.join(DATA_FOLDER, 'flujos.json');

// Crear carpeta data si no existe
if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER);
}

// Crear archivo flujos.json si no existe
if (!fs.existsSync(FLOW_FILE)) {
  fs.writeFileSync(FLOW_FILE, JSON.stringify({ nodos: [], conexiones: [] }, null, 2));
}

// Guardar flujo
app.post('/api/guardar-flujo', (req, res) => {
  fs.writeFileSync(FLOW_FILE, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

// Cargar flujo
app.get('/api/cargar-flujo', (req, res) => {
  const data = fs.readFileSync(FLOW_FILE, 'utf8');
  res.json(JSON.parse(data));
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
