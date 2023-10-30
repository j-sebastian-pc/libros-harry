const express = require('express');
const app = express();
const port = 3000;

const libros = require('./db.json');
const cors = require('cors'); // Importa el middleware CORS

// Habilita CORS para todas las rutas
app.use(cors());

// Ruta para obtener la lista de libros
app.get('/api/libros', (req, res) => {
  res.json(libros);
});

// Ruta para obtener información sobre un libro específico
app.get('/api/libros/:id', (req, res) => {
  const libroId = parseInt(req.params.id);
  const libro = libros.libros.find(l => l.id === libroId);

  if (!libro) {
    res.status(404).json({ error: 'Libro no encontrado' });
  } else {
    res.json(libro);
  }
});

app.listen(port, () => {
  console.log(`Servidor API funcionando en el puerto ${port}`);
});
