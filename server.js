const express = require("express");
const path = require("path");

const app = express();

// Servir archivos estáticos
app.use("/src", express.static(path.join(__dirname, "src")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// Servir el index.html como raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  // Corrige aquí el console.log
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
