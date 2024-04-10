const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
//Modulo de conexion a directorio activo
const ActiveDirectory = require("activedirectory2").promiseWrapper;
const db = require("../database");
const helpers = require('./helpers');
const keys = require("../keys");
var os = require('os');

//Local Login
passport.use('local.login', new LocalStrategy ({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) =>{
    // console.log(req.body);
    const rows = await await db.promise().query('SELECT * FROM tbl_usuarios WHERE USU_CUSUARIO =?', [username]);
    console.log('rows:',rows.length)
    if (rows[0].length > 0){ 
        const usuario = rows[0];
        const estado = usuario[0].USU_CESTADO;
        console.log('Estado:',estado)      
        const validPassword = await helpers.matchPassword(password, usuario[0].USU_CPASSWORD)
        console.log(validPassword)
        if (validPassword == true && estado == 'ACTIVO') {
            try {
                const desconectar =
                {
                    USU_CAUXILIAR: "DISCONNECTED"
                }
                sqlCambiarEstado = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
                await db.promise().query(sqlCambiarEstado, [desconectar, usuario[0].PKUSU_NCODIGO]);

                sqlBorrarSesiones = "DELETE FROM " + keys.database.database + ".sessions WHERE data like '%" + usuario[0].USU_CDOCUMENTO + "%'and data like '%" + usuario[0].USU_CUSUARIO + "%';"
                await db.promise().query(sqlBorrarSesiones);

                const cambiarEstado =
                {
                    USU_CAUXILIAR: "CONNECTED",
                }

                sqlCambiarEstado = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
                let [datasqlCambiarEstado] = await db.promise().query(sqlCambiarEstado, [cambiarEstado, usuario[0].PKUSU_NCODIGO]);

                const user = { 'Nombre': usuario[0].USU_CNOMBRE, 'Documento': usuario[0].USU_CDOCUMENTO, 'Usuario': usuario[0].USU_CUSUARIO, 'Rol': usuario[0].USU_CROL, 'Idioma': usuario[0].USU_CIDIOMA, 'PKusu': usuario[0].PKUSU_NCODIGO, 'ChatsNumber': usuario[0].USU_NCHATS };

                console.log('<<------- Usuario, Contraseña y Estado ------->> OK');
                done(null, user, req.flash('messageSuccess', 'Welcome ' + usuario[0].USU_CNOMBRE));
            } catch (err) {
                console.log(err)
            }
        } else if (validPassword == true && usuario[0].USU_CESTADO == "INACTIVO") {
            done(null, false, req.flash('messageError', 'El usuario se encuentra Inactivo - Validar con el supervisor'));
            console.log('<<------- Usuario ------->> INACTIVO');
        } else if (validPassword == false) {
            done(null, false, req.flash('messageError', 'Contraseña Incorrecta'));
        }
    } else {
        return done(null, false, req.flash('messageError', 'El usuario ingresado no existe'));
    }
}));

// Directorio Activo
// passport.use('local.login', new LocalStrategy({
//     usernameField: 'username',
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, username, password, done) => {
//     //Declaracion de variables para el directorio  activo
//     var query = "sAMAccountName=" + username;
//     username = username + '@groupcos.com'
//     var username02 = (username.split("@"))[0].toUpperCase();
//     console.log(username02 + " Ejecución de variables")
//     keys.config.username = username
//     keys.config.password = password
//     var ad = new ActiveDirectory(keys.config);
//     console.log(keys.config)
//     console.log("******-( ._.)(._. )( ._.)-******" + keys.config.url)
//     //Valida si el usuario tiene mas de dos intentos
//     var validator = true;
//     for (i = 0; i < array.length; i++) {
//         d = array[i][0];
//         console.log(d)
//         if (d.nombre == username && d.Intentos == "1") {
//             let min = new Date();
//             let minutoss = min.getMinutes();
//             console.log(min);
//             var contador_minutos = ((array[i][1] + 1) - minutoss) + " minutos"
//             if ((array[i][1] + 1 <= minutoss) || (array[i][1] + 1 > 58)) {
//                 delete array[i];
//                 array.splice(i, 1);
//                 contador_minutos = "unos segundos"
//             }
//             validator = false;
//             //Le envia error por exceder los intentos
//             done(null, false, req.flash("message", "Intento Fallido → Por favor espere " + contador_minutos + " antes de volver a intentar"));
//         }
//     }
//     if (validator) {
//         //Valida con el usuario en directorio activo 
//         ad.authenticate(username, password, function async(err, auth) {
//             // console.log(err);
//             console.log(auth);
//             let error = JSON.stringify(err)
//             let split = error.split(",")
//             codigo = split[2]
//             console.log(codigo)
//             if (codigo == " data 775") {
//                 done(null, false, req.flash("messageError", "Usuario bloqueado en Directorio Activo por favor solicite ayuda con IT"));
//             }
//             else if (auth == false && codigo == " data 52e") {
//                 if (array.length > 0) {
//                     for (i = 0; i < array.length; i++) {
//                         d = array[i][0];
//                         if (d.nombre == username) {
//                             if (d.nombre == username && d.Intentos == 1) {
//                                 d.Intentos = 1;
//                                 let min0 = new Date();
//                                 let minutos = min0.getMinutes();
//                                 array[i][1] = minutos;
//                                 var encontrado = true;
//                                 break;
//                             }
//                             var encontrado = true;
//                             break;
//                         } else {
//                             var encontrado = false;
//                         }
//                     }
//                     if (encontrado) {
//                         console.log(encontrado);
//                     } else {
//                         console.log("Lo agrega por que no lo encontro");
//                         let elemento = { nombre: username, Intentos: 1 };
//                         let min0 = new Date();
//                         let minutos = min0.getMinutes();
//                         array.push([elemento, minutos]);
//                     }
//                 } else {
//                     console.log("Lo Agrega");
//                     let elemento = { nombre: username, Intentos: 1 };
//                     let min0 = new Date();
//                     let minutos = min0.getMinutes();
//                     array.push([elemento, minutos]);
//                 }
//                 done(null, false, req.flash('messageError', 'Usuario y/o contraseña incorrecta!!!'));
//                 console.log("Autenticacion fallida!");
//             }
//             else if (auth == true) {
//                 console.log('<<------- Usuario en Directorio Activo ------->>');
//                 ad.findUsers(query, true, async (err, users) => {
//                     console.log(users);
//                     var taskId = helpers.obtain(users, "distinguishedName");
//                     if (taskId.grupo) {
//                         try {
//                             let sql = 'SELECT * FROM ' + bdd_name + '.tbl_usuarios WHERE USU_CUSUARIO = "' + username02 + '";'
//                             console.log('User ' + username02 + ' Autenticado');
//                             const rows = await db.promise().query(sql);
//                             if (rows.length > 0) {
//                                 const usuario = rows[0];
//                                 console.log(usuario)
//                                 const estado = usuario[0].USU_CESTADO;
//                                 console.log(estado)
//                                 if (estado == 'ACTIVO') {
//                                     try {
//                                         const desconectar =
//                                         {
//                                             USU_CAUXILIAR: "DISCONNECTED"
//                                         }
//                                         sqlCambiarEstado = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
//                                         await db.promise().query(sqlCambiarEstado, [desconectar, usuario[0].PKUSU_NCODIGO]);

//                                         sqlBorrarSesiones = "DELETE FROM " + keys.database.database + ".sessions WHERE data like '%" + usuario[0].USU_CDOCUMENTO + "%'and data like '%" + usuario[0].USU_CUSUARIO + "%';"
//                                         await db.promise().query(sqlBorrarSesiones);

//                                         const cambiarEstado =
//                                         {
//                                             USU_CAUXILIAR: "CONNECTED",
//                                         }

//                                         sqlCambiarEstado = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
//                                         let [datasqlCambiarEstado] = await db.promise().query(sqlCambiarEstado, [cambiarEstado, usuario[0].PKUSU_NCODIGO]);

//                                         const user = { 'Nombre': usuario[0].USU_CNOMBRE, 'Documento': usuario[0].USU_CDOCUMENTO, 'Usuario': usuario[0].USU_CUSUARIO, 'Rol': usuario[0].USU_CROL, 'Idioma': usuario[0].USU_CIDIOMA, 'PKusu': usuario[0].PKUSU_NCODIGO, 'ChatsNumber': usuario[0].USU_NCHATS};

//                                         console.log('<<------- Usuario, Contraseña y Estado ------->> OK');
//                                         done(null, user, req.flash('messageSuccess', 'Welcome ' + user.USU_CNOMBRES_APELLIDOS));
//                                     } catch (err) {
//                                         console.log(err)
//                                     }
//                                 } else {
//                                     done(null, false, req.flash('messageError', 'El usuario se encuentra Inactivo - Validar con el supervisor'));
//                                     console.log('<<------- Usuario ------->> INACTIVO');
//                                 }
//                             } else {
//                                 done(null, false, req.flash('messageError', 'Disabled user'));
//                             }
//                         } catch (e) {
//                             console.error("Hay un error en la autenticación -  passport!" + e);
//                         }
//                     } else {
//                         done(null, false, req.flash("messageError", "No pertenece a esta campaña !!!"));
//                     }
//                 });
//             }
//         });
//     }
// }));

passport.serializeUser((user, done) => {
    try {
        done(null, user);
    } catch (error) {
        console.log(error);
    }
});

passport.deserializeUser(async (id, done) => {
    try {

        sqlBuscarUsuario = "SELECT * FROM " + keys.database.database + ".tbl_usuarios WHERE PKUSU_NCODIGO = ? ;";
        [usuario] = await db.promise().query(sqlBuscarUsuario,[id.PKusu]);
        const user = { 'Nombre': usuario[0].USU_CNOMBRE, 'Documento': usuario[0].USU_CDOCUMENTO,'Usuario': usuario[0].USU_CUSUARIO, 'Rol':usuario[0].USU_CROL, 'Idioma':usuario[0].USU_CIDIOMA, 'PKusu':usuario[0].PKUSU_NCODIGO,'ChatsNumber':usuario[0].USU_NCHATS, 'authToken':usuario[0].USU_AUTH_TOKEN, 'skill':usuario[0].USU_CSKILL};
        done(null, user);
        
    } catch (error) {
        console.log(error);
    }
})