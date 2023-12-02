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
    this.receptores = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  // Método para enviar alertas de reporte cargado
  sendReporteCargado(sender,data) {
    this.users.forEach((user) => {
      if (user !== sender) {
        this.receptores.push(user)
      }
    });
    let uniqueSet = new Set(this.receptores);
    const receivers = [...uniqueSet]

    const newData = `${sender}, ${data}, y se le notifico a los usuarios: ${receivers}`;
    this.io.emit("reporte-cargado", newData);
  }

  // Método para enviar alertas de reporte eliminado
  sendReporteEliminado(sender,data) {
    this.users.forEach((user) => {
      if (user.name !== sender) {
        this.receptores.push(user)
        const mensajeParaReceptor = `Eres recibidor :)`;
        this.io.to(user.socketId).emit("reporte-cargado", mensajeParaReceptor);
      }
    });

    let uniqueSet = new Set(this.receptores);
    const receivers = [...uniqueSet]

    const fecha = new Date(data.data.fecha);
    const formattedDate = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`; // Los meses van de 0 a 11, así que añadimos +1

    const newData = `${sender}, ${data.message}, ${formattedDate}, y se le notifico a los usuarios: ${receivers}`;
    this.io.to(sender).emit("reporte-eliminado", newData);
  }
}

const alertMediator = new AlertMediator(io);

// Configurar eventos de Socket.io
io.on("connection", (socket) => {

  // Agregar usuario al Mediator cuando se conecta
  socket.on("login", (data) => {
    console.log('Usuario Conectado:'+data+socket.id);
    // socket.user = data || { user_id: socket.id }; 
    const userData = { name: data, socketId: socket.id };
    alertMediator.addUser(userData)
  });

  socket.on("reporte-cargado", (data) => {
    alertMediator.sendReporteCargado(socket.user,data);
  });

  socket.on("reporte-eliminado", (data) => {
    alertMediator.sendReporteEliminado(socket.user,data);
  });

  // Desconexión del usuario
  socket.on("disconnect", () => {
  if(socket.user){
    console.log("Usuario desconectado:", socket.user);
  }

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
