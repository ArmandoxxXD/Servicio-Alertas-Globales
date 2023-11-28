const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

// Crear una aplicación Express y un servidor HTTP
const app = express();
app.use(cors());
const server = http.createServer(app);

// Crear una instancia de Socket.io y pasar el servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

// Clase del Alert (Mediator)
class AlertMediator {
  constructor(io) {
    this.io = io;
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  // Método para enviar alertas de reporte cargado
  sendReporteCargado(sender,data) {
    console.log(`Usuario [${sender}] envió alerta con éxito a:`);
    this.users.forEach((user) => {
      if (user !== sender) {
        console.log(`- [${user}]`);
      }
    });

    this.io.emit("reporte-cargado", data);
  }

  // Método para enviar alertas de reporte eliminado
  sendReporteEliminado(sender,data) {
    console.log(`Usuario [${sender}] emvio alerta con éxito a:`);
    this.users.forEach((user) => {
      if (user !== sender) {
        console.log(`- [${user}]`);
      }
    });
    this.io.emit("reporte-eliminado", data);
  }
}

// Configurar eventos de Socket.io
io.on("connection", (socket) => {

  // Agregar usuario al Mediator cuando se conecta
  socket.on("login", (data) => {
    console.log('Usuario Conectado:'+data);
    socket.user = data || { user_id: socket.id }; 

    alertMediator.addUser(socket.user)
  });

  socket.on("reporte-cargado", (data) => {
    alertMediator.sendReporteCargado(socket.user,data);
  });

  socket.on("reporte-eliminado", (data) => {
    alertMediator.sendReporteEliminado(socket.user,data);
  });

  // Desconexión del usuario
  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);

    // Eliminar usuario del Mediator cuando se desconecta
    const index = alertMediator.users.indexOf(socket.user);
    if (index !== -1) {
      alertMediator.users.splice(index, 1);
    }
  });
});

// Configurar una ruta de prueba
app.get("/", (res) => {
  res.send("Servicio Alertas UP");
});

// Iniciar el servidor en un puerto específico
const port = process.env.PORT || 2000;
server.listen(port, () => {
  console.log(`Servicio escuchando en el puerto ${port}`);
});

const alertMediator = new AlertMediator(io);