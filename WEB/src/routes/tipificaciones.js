const router = require("express").Router();
const db = require("../database");
const path = require("path");
const fs = require("fs");
const { userInfo } = require("os");
const keys = require("../keys");
const Class2 = require("../Class2");
const { log } = require("console");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/crearTipificacion", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearTipificacion", { title: "Crear Tipificacion" });
});

router.get("/listarTipificacion", isSupervisorOrAdministrator, async (req, res) => {
  try {
    sqlListaTipificacion = "SELECT * FROM " + keys.database.database + ".tbl_rtipificaciones_disponibles where TIP_CESTADO = 'Activo';";
    let [datasqlListaTipificacion] = await db.promise().query(sqlListaTipificacion);

    for (let i = 0; i < datasqlListaTipificacion.length; i++) {
      datasqlListaTipificacion[i].EnCrypt = Class2.EnCrypt(`${datasqlListaTipificacion[i].PKTIP_NCODIGO}`);
    }

    res.render("app/listarTipificacion", { title: "listado Tipificacion", listaTipificacion: datasqlListaTipificacion });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/actualizarTipificacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlActualizarTipificacion = "SELECT * FROM " + keys.database.database + ".tbl_rtipificaciones_disponibles where PKTIP_NCODIGO = ?;";
    let [datasqlActualizarTipificacion] = await db.promise().query(sqlActualizarTipificacion, [id]);
    datasqlActualizarTipificacion[0].EnCrypt = req.params.id;

    res.render("app/actualizarTipificacion", { title: "Actualizar Tipificacion", Tipificacion: datasqlActualizarTipificacion[0] });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarTipificacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log("entro");
    const { tipificacion_nombre  } = req.body;

    const modificarTipificacion = {
      TIP_CNOMBRE_TIPIFICACION: tipificacion_nombre,
    };

    sqlModificarTipificacion = "UPDATE " + keys.database.database + ".tbl_rtipificaciones_disponibles SET ? where PKTIP_NCODIGO = ?;";
    await db.promise().query(sqlModificarTipificacion, [modificarTipificacion, id]);

    req.flash("messageSuccess", `typification modified successfully`);
    res.redirect("/tipificaciones/listarTipificacion");
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/eliminarTipificacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    const sqlEliminarTipificacion = "UPDATE " + keys.database.database + ".tbl_rtipificaciones_disponibles SET TIP_CESTADO = 'Inactivo' where PKTIP_NCODIGO = ?;";
    await db.promise().query(sqlEliminarTipificacion, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

router.post("/crearTipificacion", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { tipificacion_nombre } = req.body;

    const nuevaTipificacion = {
      TIP_CNOMBRE_TIPIFICACION: tipificacion_nombre
    };
    
    const sqlnuevaTipificacion = "INSERT INTO " + keys.database.database + ".tbl_rtipificaciones_disponibles SET ?";
    await db.promise().query(sqlnuevaTipificacion, [nuevaTipificacion]);

    req.flash("messageSuccess", `typification registered successfully`);
    res.redirect("/tipificaciones/crearTipificacion");
  } catch (error) {
    console.log("ERROR::", error);
    req.flash("messageError", `error, Please, try again`);
    res.redirect("/tipificaciones/crearTipificacion");
  }
});


//llamado por USU_CROL "USUARIO"
router.post("/getTipificacion", async (req, res) => {
  try {
    const sqlGetTipificacion = "SELECT * FROM " + keys.database.database + ".tbl_rtipificaciones_disponibles;";
    let [datasqlGetTipificacion] = await db.promise().query(sqlGetTipificacion);

    res.json(datasqlGetTipificacion);
  } catch (error) {
    console.log("ERROR::", error);
  }
});
//llamado por USU_CROL "USUARIO"
router.post("/getTipificacion", async (req, res) => {
  try {
    const { PKTIP_NCODIGO } = req.body;

    const sqlGetTipificacion = "SELECT tipificacion_contenido FROM " + keys.database.database + ".tbl_rtipificaciones_disponibles where PKTIP_NCODIGO = ?;";
    let [datasqlGetTipificacion] = await db.promise().query(sqlGetTipificacion, [PKTIP_NCODIGO]);

    res.json(datasqlGetTipificacion[0]);
  } catch (error) {
    console.log("ERROR::", error);
  }
});

module.exports = router;
