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
// ...

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Bienvenido al servidor de chat');
  });
  
  // Ruta para guardar un nuevo mensaje
  app.post('/messages', async (req, res) => {
    // ...
  });
  
  // Ruta para obtener todos los mensajes
  app.get('/messages', async (req, res) => {
    // ...
  });
  
  // ...
  
  
// Ruta para guardar un nuevo mensaje
app.post('/messages', async (req, res) => {
  try {
    const { room, sender, content } = req.body;

    // Verificar si los datos son válidos
    if (!room || !sender || !content) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear una nueva instancia del modelo de mensaje
    const newMessage = new Message({ room, sender, content });

    // Guardar el mensaje en la base de datos
    await newMessage.save();

    // Emitir el mensaje a la sala
    io.to(room).emit('messageReceived', newMessage);

    res.status(201).json({ message: 'Mensaje guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

// Ruta para obtener todos los mensajes
app.get('/messages', async (req, res) => {
  try {
    // Obtener todos los mensajes de la base de datos
    const messages = await Message.find();

    res.json(messages);
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

// Configuración del servidor de express
const server = app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});

const io = socketIO(server);

// Ruta para servir el archivo socket.io.js
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.js'));
});

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
