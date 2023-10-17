const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

// Crear una aplicación Express y un servidor HTTP
const app = express();
app.use(cors());
const server = http.createServer(app);

// Crear una instancia de Socket.io y pasar el servidor HTTP
const io = new Server(server,{
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

// Configurar eventos de Socket.io
io.on('connection', (socket) => {
console.log('Usuario conectado:', socket.id);

    // Ejemplo: Cuando un archivo Excel se procesa con éxito
    socket.on('excel-procesado', (data) => {
    console.log('Archivo Excel procesado con éxito:', data);
    // Emitir un evento a la aplicación Angular
    io.emit('excel-procesado', data);
    });

    // Desconexión del usuario
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });

});

// Configurar una ruta de prueba
app.get('/', (req, res) => {
  res.send('Servicio Alertas UP');
});

// Iniciar el servidor en un puerto específico
const port = process.env.PORT || 2000;
server.listen(port, () => {
  console.log(`Servicio escuchando en el puerto ${port}`);
});
