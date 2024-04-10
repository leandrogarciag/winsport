const router = require("express").Router();
const db = require("../database");
const path = require("path");
const fs = require("fs");
const { userInfo } = require("os");
const keys = require("../keys");
const Class2 = require("../Class2");
const { log } = require("console");
const { isSupervisorOrAdministrator } = require("../lib/auth");
const helpers = require('../lib/helpers');

router.get("/crearUsuario", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearUsuario", { title: "Crear usuario" });
});

router.post("/crearUsuario", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { usuario_nombre, usuario_documento, usuario_rol, usuario_nombreUsuario, usuario_password, usuario_campana, usuario_chats} = req.body;

    if (usuario_nombre == undefined || usuario_nombre == null || usuario_nombre == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_documento == undefined || usuario_documento == null || usuario_documento == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_rol == undefined || usuario_rol == null || usuario_rol == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_nombreUsuario == undefined || usuario_nombreUsuario == null || usuario_nombreUsuario == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_password == undefined || usuario_password == null || usuario_password == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_campana == undefined || usuario_campana == null || usuario_campana == "") throw { name: 'error', message: 'Var empty'};
    //if (usuario_emailUsuario == undefined || usuario_emailUsuario == null || usuario_emailUsuario == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_chats == undefined || usuario_chats == null || usuario_chats == "") throw { name: 'error', message: 'Var empty'};
    //if (usuario_skill == undefined || usuario_skill == null || usuario_skill == "") throw { name: 'error', message: 'Var empty'};

    const nuevoUsuario = {
      USU_CNOMBRE: usuario_nombre,
      USU_CDOCUMENTO: usuario_documento,
      USU_CROL: usuario_rol,
      USU_CUSUARIO: usuario_nombreUsuario,
      USU_CPASSWORD: usuario_password,
      USU_CCAMPANA: usuario_campana,
      USU_CESTADO: "ACTIVO",
      //USU_CORREO: usuario_emailUsuario,
      USU_NCHATS: usuario_chats,
      //USU_CSKILL: typeof(usuario_skill) ==='string'?JSON.stringify([usuario_skill]):JSON.stringify(usuario_skill).toString()
    };
    nuevoUsuario.USU_CPASSWORD = await helpers.encryptPassword(usuario_password);

    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&+=])[A-Za-z\d@!#$%^&+=]{8,}$/;
    // if (!regex.test(usuario_password)) throw { name: 'error', message: 'Contraseña incorrecta'};

    const sqlNuevoUsuario = "INSERT INTO " + keys.database.database + ".tbl_usuarios SET ?";
    await db.promise().query(sqlNuevoUsuario, [nuevoUsuario]);

    req.flash("messageSuccess", `User created successfully`);
    res.redirect("/usuarios/crearUsuario");
  } catch (error) {
    console.log("ERROR::", error);
    if (error.message.includes("Duplicate entry")) {
      req.flash("messageError", `Error, User already exists`);
      res.redirect("/usuarios/crearUsuario");    
    }else {
      req.flash("messageError", `Error, Please, try again`);
      res.redirect("/usuarios/crearUsuario");
    }
  }
});

router.get("/listarUsuarios", isSupervisorOrAdministrator, async (req, res) => {
  try {

    if (req.user.Rol == 'ADMINISTRADOR'){
      sqlListaUsuarios = "SELECT * FROM " + keys.database.database + ".tbl_usuarios order by USU_CUSUARIO asc;";
    } else{
      sqlListaUsuarios = "SELECT * FROM " + keys.database.database + ".tbl_usuarios WHERE USU_CROL NOT LIKE 'ADMINISTRADOR' order by USU_CUSUARIO asc;";

    }
    let [datasqlListaUsuarios] = await db.promise().query(sqlListaUsuarios);

    for (let i = 0; i < datasqlListaUsuarios.length; i++) {
      datasqlListaUsuarios[i].EnCrypt = Class2.EnCrypt(`${datasqlListaUsuarios[i].PKUSU_NCODIGO}`);
    }

    res.render("app/listarUsuarios", { title: "listado usuarios", listaUsuarios: datasqlListaUsuarios });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/actualizarUsuario/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlActualizarUsuario = "SELECT * FROM " + keys.database.database + ".tbl_usuarios where PKUSU_NCODIGO = ?;";
    let [datasqlActualizarUsuario] = await db.promise().query(sqlActualizarUsuario, [id]);
    datasqlActualizarUsuario[0].EnCrypt = req.params.id;

    res.render("app/actualizarUsuario", { title: "Actualizar usuario", usuario: datasqlActualizarUsuario[0] });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarUsuario/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    var idEncrypt = req.params.id;
    let id = Class2.DeCrypt(req.params.id);

    const { usuario_nombre, usuario_documento, usuario_rol, usuario_nombreUsuario, usuario_password, usuario_campana, usuario_estado, usuario_chats} = req.body;

    if (usuario_nombre == undefined || usuario_nombre == null || usuario_nombre == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_documento == undefined || usuario_documento == null || usuario_documento == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_rol == undefined || usuario_rol == null || usuario_rol == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_nombreUsuario == undefined || usuario_nombreUsuario == null || usuario_nombreUsuario == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_password == undefined || usuario_password == null || usuario_password == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_campana == undefined || usuario_campana == null || usuario_campana == "") throw { name: 'error', message: 'Var empty'};
    //if (usuario_emailUsuario == undefined || usuario_emailUsuario == null || usuario_emailUsuario == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_chats == undefined || usuario_chats == null || usuario_chats == "") throw { name: 'error', message: 'Var empty'};
    //if (usuario_skill == undefined || usuario_skill == null || usuario_skill == "") throw { name: 'error', message: 'Var empty'};
    if (usuario_estado == undefined || usuario_estado == null || usuario_estado == "") throw { name: 'error', message: 'Var empty'};

    const modificarUsuario = {
      USU_CNOMBRE: usuario_nombre,
      USU_CDOCUMENTO: usuario_documento,
      USU_CROL: usuario_rol,
      USU_CUSUARIO: usuario_nombreUsuario,
      USU_CPASSWORD: usuario_password,
      USU_CCAMPANA: usuario_campana,
      USU_CESTADO: usuario_estado,
      //USU_CORREO: usuario_emailUsuario,
      USU_NCHATS: usuario_chats,
      //USU_CSKILL: typeof(usuario_skill) ==='string'?JSON.stringify([usuario_skill]):JSON.stringify(usuario_skill).toString()
    };

    modificarUsuario.USU_CPASSWORD = await helpers.encryptPassword(usuario_password);

    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&+=])[A-Za-z\d@!#$%^&+=]{8,}$/;
    // if (!regex.test(usuario_password)) throw { name: 'error', message: 'Contraseña incorrecta'};

    sqlModificarUsuario = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? where PKUSU_NCODIGO = ?;";
    await db.promise().query(sqlModificarUsuario, [modificarUsuario, id]);

    req.flash("messageSuccess", `User modified successfully`);
    res.redirect("/usuarios/listarUsuarios");
  } catch (error) {
    console.log("ERROR::", error);
    if (error.message.includes("Duplicate entry")) {
      req.flash("messageError", `Error, User already exists`);
      res.redirect("/usuarios/actualizarUsuario/" + idEncrypt);
     }else {
      req.flash("messageError", `Error, Please, try again`);
      res.redirect("/usuarios/actualizarUsuario/" + idEncrypt);
    }
  }
});

router.get("/eliminarUsuarios/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlEliminarUsuario = "DELETE FROM " + keys.database.database + ".tbl_usuarios where PKUSU_NCODIGO = ?;";
    await db.promise().query(sqlEliminarUsuario, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

router.get("/disableUser/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlDisableUser = "UPDATE " + keys.database.database + ".tbl_usuarios SET USU_CESTADO = 'NO ACTIVO' where PKUSU_NCODIGO = ?;";
    await db.promise().query(sqlDisableUser, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

//Llamado por cualquiera cambiar password
router.post("/cambiarPassword", async (req, res) => {
  try {
    const { PKusu } = req.user;
    const {  passwordNueva1 } = req.body;

    console.log('Id:',PKusu)
    console.log('passwordNueva1;',passwordNueva1)

    const cambiarPassword = {
      USU_CPASSWORD: passwordNueva1,
    };    

    cambiarPassword.USU_CPASSWORD = await helpers.encryptPassword(passwordNueva1);    
    // console.log('cambiarPassword:',cambiarPassword.USU_CPASSWORD)
    

    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!#$%^&+=])[A-Za-z\d@!#$%^&+=]{8,}$/;
    // if (!regex.test(passwordNueva1)) throw { name: 'error', message: 'Contraseña incorrecta'};
    
    sqlCambiarPassword = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? where PKUSU_NCODIGO = ?;";
    await db
      .promise()
      .query(sqlCambiarPassword, [cambiarPassword, PKusu])
      .then((conn) => {
        if (conn[0].changedRows == 0) {
          throw "Contraseña incorrecta";
        }
      });

    if (req.user.Rol == "AGENTE") {
      req.flash("messageSuccess", `Password updated successfully`);
      res.redirect("/mensajeria");
    } else if (req.user.Rol == "REPORTING") {
      req.flash("messageSuccess", `Password updated successfully`);
      res.redirect("/reportes/reporteInteracciones");
    } else {
      req.flash("messageSuccess", `Password updated successfully`);
      res.redirect("/dashboard");
    }
  } catch (error) {
    if (req.user.Rol == "AGENTE") {
      req.flash("messageError", `An error occurred, wrong password`);
      res.redirect("/mensajeria");
    } else if (req.user.Rol == "REPORTING") {
      req.flash("messageError", `An error occurred, wrong password`);
      res.redirect("/reportes/reporteInteracciones");
    }else {
      req.flash("messageError", `An error occurred, wrong password`);
      res.redirect("/dashboard");
    }
  }
});

//Llamado por cualquiera para verificar si la session esta repetida
router.post("/verificarLogin", async (req, res) => {
  try {
    sqlVerificarLogin =  "SELECT * FROM " + keys.database.database + ".sessions WHERE session_id like ?;";
    let [datasqlVerificarLogin] = await db.promise().query(sqlVerificarLogin,[req.sessionID]) 
    if(datasqlVerificarLogin.length > 0)
    {
      res.json(true);
    }
    else
    {
      res.json(false);
    }
  } catch (error) {
    console.log("ERROR::"+error);
  }
});

module.exports = router;
