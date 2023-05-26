const express = require('express');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const path = require('path');

// URL de conexión a MongoDB Atlas
const dbUrl = 'mongodb+srv://admin:admin@cluster0.i94n2hx.mongodb.net/parcial3web';

// Opciones de conexión
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Conexión a la base de datos
mongoose.connect(dbUrl, connectionParams)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((error) => {
    console.error('Error de conexión a MongoDB:', error);
  });

// Definir el esquema del mensaje
const messageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  content: String,
});

// Definir el modelo de mensaje
const Message = mongoose.model('Message', messageSchema);

// Crear una nueva instancia de Express
const app = express();

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Configuración del servidor de Express
const server = app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});

const io = socketIO(server);

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Nueva conexión establecida');

  // Manejo de eventos 'joinRoom' para unirse a una sala
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Usuario se unió a la sala: ${room}`);
  });

  // Manejo de eventos 'sendMessage' para enviar un mensaje a la sala
  socket.on('sendMessage', async (data) => {
    const { room, sender, content } = data;

    // Verificar si los datos son válidos
    if (!room || !sender || !content) {
      return;
    }

    try {
      // Guardar el mensaje en la base de datos
      const message = new Message({ room, sender, content });
      await message.save();

      // Emitir el mensaje a la sala
      io.to(room).emit('messageReceived', message);
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
  });
});

module.exports = io;
