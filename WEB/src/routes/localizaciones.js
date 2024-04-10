const router = require("express").Router();
const db = require("../database");
const path = require("path");
const fs = require("fs");
const { userInfo } = require("os");
const keys = require("../keys");
const Class2 = require("../Class2");
const { log } = require("console");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/crearLocalizacion", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearLocalizacion", { title: "Crear Localizacion" });
});

router.get("/listarLocalizacion", isSupervisorOrAdministrator, async (req, res) => {
  try {
    sqlListaLocalizacion = "SELECT * FROM " + keys.database.database + ".tbl_localizaciones  where LOC_ESTADO = 'Activo';";
    let [datasqlListaLocalizacion] = await db.promise().query(sqlListaLocalizacion);

    for (let i = 0; i < datasqlListaLocalizacion.length; i++) {
      datasqlListaLocalizacion[i].EnCrypt = Class2.EnCrypt(`${datasqlListaLocalizacion[i].PKLOC_CODIGO}`);
    }

    res.render("app/listarLocalizacion", { title: "listado Localizacion", listaLocalizacion: datasqlListaLocalizacion });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/actualizarLocalizacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlActualizarLocalizacion = "SELECT * FROM " + keys.database.database + ".tbl_localizaciones where PKLOC_CODIGO = ?;";
    let [datasqlActualizarLocalizacion] = await db.promise().query(sqlActualizarLocalizacion, [id]);
    datasqlActualizarLocalizacion[0].EnCrypt = req.params.id;

    res.render("app/actualizarLocalizacion", { title: "Actualizar Localizacion", Localizacion: datasqlActualizarLocalizacion[0] });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarLocalizacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log("entro");
    const { localizacion_nombre, localizacion_direccion,localizacion_categoria, localizacion_latitud, localizacion_longitud, localizacion_op_menu} = req.body;

    const modificarLocalizacion = {
      LOC_NOMBRE: localizacion_nombre,
      LOC_DIRECCION: localizacion_direccion,
      LOC_LATITUD: localizacion_latitud,
      LOC_LONGITUD: localizacion_longitud,
      LOC_OP_MENU: localizacion_op_menu,
      LOC_CATEGORIA:localizacion_categoria
    };

    sqlModificarLocalizacion = "UPDATE " + keys.database.database + ".tbl_localizaciones SET ? where PKLOC_CODIGO = ?;";
    await db.promise().query(sqlModificarLocalizacion, [modificarLocalizacion, id]);

    req.flash("messageSuccess", `Location modified successfully`);
    res.redirect("/localizaciones/listarLocalizacion");
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/eliminarLocalizacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    const sqlEliminarLocalizacion = "UPDATE " + keys.database.database + ".tbl_localizaciones SET LOC_ESTADO = 'Inactivo' where PKLOC_CODIGO = ?;";

    await db.promise().query(sqlEliminarLocalizacion, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

router.post("/crearLocalizacion", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { localizacion_nombre, localizacion_direccion,localizacion_categoria, localizacion_latitud, localizacion_longitud,localizacion_op_menu } = req.body;

    const nuevaLocalizacion = {
      LOC_NOMBRE: localizacion_nombre,
      LOC_DIRECCION: localizacion_direccion,
      LOC_LATITUD: localizacion_latitud,
      LOC_LONGITUD: localizacion_longitud,
      LOC_OP_MENU: localizacion_op_menu,
      LOC_CATEGORIA:localizacion_categoria
    };

    const sqlnuevaLocalizacion = "INSERT INTO " + keys.database.database + ".tbl_localizaciones SET ?";
    await db.promise().query(sqlnuevaLocalizacion, [nuevaLocalizacion]);

    req.flash("messageSuccess", `Location registered successfully`);
    res.redirect("/localizaciones/crearLocalizacion");
  } catch (error) {
    console.log("ERROR::", error);
    req.flash("messageError", `error, Please, try again`);
    res.redirect("/localizaciones/crearLocalizacion");
  }
});


//llamado por USU_CROL "USUARIO"
router.post("/getLocalizacion", async (req, res) => {
  try {
    const sqlGetLocalizacion = "SELECT * FROM " + keys.database.database + ".tbl_localizaciones;";
    let [datasqlGetLocalizacion] = await db.promise().query(sqlGetLocalizacion);

    res.json(datasqlGetLocalizacion);
  } catch (error) {
    console.log("ERROR::", error);
  }
});
//llamado por USU_CROL "USUARIO"
router.post("/getLocalizacion", async (req, res) => {
  try {
    const { PKLOC_CODIGO } = req.body;

    const sqlGetLocalizacion = "SELECT Localizacion_contenido FROM " + keys.database.database + ".tbl_localizaciones where PKLOC_CODIGO = ?;";
    let [datasqlGetLocalizacion] = await db.promise().query(sqlGetLocalizacion, [PKLOC_CODIGO]);

    res.json(datasqlGetLocalizacion[0]);
  } catch (error) {
    console.log("ERROR::", error);
  }
});

module.exports = router;
