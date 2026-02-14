require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Flow = require("./models/Flow");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log(err));

/* ===== REGISTER ===== */
app.post("/api/register", async (req,res)=>{
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password,10);

  await User.create({ email, password: hashed });

  res.json({ success:true });
});

/* ===== LOGIN ===== */
app.post("/api/login", async (req,res)=>{
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error:"Usuario no existe" });

  const valid = await bcrypt.compare(password,user.password);
  if (!valid) return res.status(400).json({ error:"Password incorrecto" });

  const token = jwt.sign({ id:user._id },process.env.JWT_SECRET);

  res.json({ token });
});

/* ===== CREAR FLOW ===== */
app.post("/api/flows", auth, async (req,res)=>{
  const flow = await Flow.create({
    userId: req.user.id,
    name: req.body.name,
    nodes: [],
    edges: []
  });
  res.json(flow);
});

/* ===== GUARDAR FLOW ===== */
app.post("/api/flows/:id", auth, async (req,res)=>{
  await Flow.updateOne(
    { _id:req.params.id, userId:req.user.id },
    { nodes:req.body.nodes, edges:req.body.edges }
  );
  res.json({ success:true });
});

/* ===== LISTAR FLOWS ===== */
app.get("/api/flows", auth, async (req,res)=>{
  const flows = await Flow.find({ userId:req.user.id });
  res.json(flows);
});

app.listen(process.env.PORT,()=>{
  console.log("Servidor iniciado");
});
