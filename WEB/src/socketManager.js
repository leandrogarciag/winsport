const db = require("./database");
const keys = require("./keys");
const socketIO = require('socket.io');

function setupSocket(server, sessionInstance) {
    const io = socketIO(server);

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(sessionInstance));

  io.on('connection', async (socket) => {
    const user = socket.request.session.passport.user;
    console.log('Un cliente se ha conectado');

    sqlUsuario = "SELECT * FROM " + keys.database.database + ".tbl_usuarios WHERE PKUSU_NCODIGO = ?;";
    let [datasqlUsuario] = await db.promise().query(sqlUsuario, [user.PKusu]);
    
    if (datasqlUsuario[0].USU_CAUXILIAR == "OFF"){

        sqlModificarEstadoAnterior = "UPDATE " + keys.database.database + ".tbl_usuarios SET USU_CAUXILIAR = ? , USU_CESTADO_ANTERIOR = null where PKUSU_NCODIGO = ?;";
        await db.promise().query(sqlModificarEstadoAnterior, [datasqlUsuario[0].USU_CESTADO_ANTERIOR, user.PKusu]);
    }

  
    // Manejar eventos cuando el cliente se desconecta
    socket.on('disconnect', async () => {
      console.log('Cliente desconectado');
      sqlUsuario = "SELECT * FROM " + keys.database.database + ".tbl_usuarios WHERE PKUSU_NCODIGO = ?;";
      let [datasqlUsuario] = await db.promise().query(sqlUsuario, [user.PKusu]);

      sqlModificarEstadoAnterior = "UPDATE " + keys.database.database + ".tbl_usuarios SET USU_CAUXILIAR = 'OFF', USU_CESTADO_ANTERIOR = ? where PKUSU_NCODIGO = ?;";
      await db.promise().query(sqlModificarEstadoAnterior, [datasqlUsuario[0].USU_CAUXILIAR, user.PKusu]);

    });


  });
}

module.exports = setupSocket;
