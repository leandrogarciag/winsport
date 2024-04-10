document.addEventListener("DOMContentLoaded", () => {

  const socket = io();
  socket.on('message', (message) => {
  //Esto no hace nada solo es para crear la conexion y decirle al servidor que se conecto
  });
});
