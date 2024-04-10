const router = require("express").Router();
const db = require("../database");
const path = require("path");
const fs = require("fs");
const { userInfo } = require("os");
const keys = require("../keys");
const Class2 = require("../Class2");
const { log } = require("console");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/crearSubtipificacion", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearSubtipificacion", { title: "Crear Subtipificacion" });
});

router.get("/listarSubtipificacion", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const sqlListaSubtipificacion = `
      SELECT tbl_opt_select.*, tbl_rtipificaciones_disponibles.TIP_CNOMBRE_TIPIFICACION
      FROM ${keys.database.database}.tbl_opt_select
      LEFT JOIN ${keys.database.database}.tbl_rtipificaciones_disponibles
      ON tbl_opt_select.OP_CATEGORIA = tbl_rtipificaciones_disponibles.PKTIP_NCODIGO
      WHERE tbl_opt_select.OP_ESTADO = 'Activo';
    `;

    let [datasqlListaSubtipificacion] = await db.promise().query(sqlListaSubtipificacion);

    for (let i = 0; i < datasqlListaSubtipificacion.length; i++) {
      datasqlListaSubtipificacion[i].EnCrypt = Class2.EnCrypt(`${datasqlListaSubtipificacion[i].PKOP_CODIGO}`);
    }

    res.render("app/listarSubtipificacion", {
      title: "listado Subtipificacion",
      listaSubtipificacion: datasqlListaSubtipificacion
    });
  } catch (error) {
    console.log("ERROR::", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/actualizarSubtipificacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);

    const sqlActualizarSubtipificacion = `
      SELECT tbl_opt_select.*, tbl_rtipificaciones_disponibles.TIP_CNOMBRE_TIPIFICACION
      FROM ${keys.database.database}.tbl_opt_select
      LEFT JOIN ${keys.database.database}.tbl_rtipificaciones_disponibles
      ON tbl_opt_select.OP_CATEGORIA = tbl_rtipificaciones_disponibles.PKTIP_NCODIGO
      WHERE tbl_opt_select.PKOP_CODIGO = ?;
    `;

    let [datasqlActualizarSubtipificacion] = await db.promise().query(sqlActualizarSubtipificacion, [id]);

    datasqlActualizarSubtipificacion[0].EnCrypt = req.params.id;

    res.render("app/actualizarSubtipificacion", {
      title: "Actualizar Subtipificacion",
      Subtipificacion: datasqlActualizarSubtipificacion[0]
    });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarSubtipificacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    const { subtipificacion_categoria, subtipificacion_contenido } = req.body;

    const modificarSubtipificacion = {
      OP_CATEGORIA: subtipificacion_categoria,
      OP_OPCION: subtipificacion_contenido,
    };

    const sqlModificarSubtipificacion = `
      UPDATE ${keys.database.database}.tbl_opt_select
      SET ?
      WHERE PKOP_CODIGO = ?;
    `;

    await db.promise().query(sqlModificarSubtipificacion, [modificarSubtipificacion, id]);

    req.flash("messageSuccess", "Typification modified successfully");
    res.redirect("/subtipificaciones/listarSubtipificacion");
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/eliminarSubtipificacion/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    const sqlEliminarSubtipificacion = "UPDATE " + keys.database.database + ".tbl_opt_select SET OP_ESTADO = 'Inactivo' where PKOP_CODIGO = ?;";
    await db.promise().query(sqlEliminarSubtipificacion, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

router.post("/crearSubtipificacion", isSupervisorOrAdministrator, async (req, res) => {
  try {
    
    const { subtipificacion_categoria, subtipificacion_contenido } = req.body;

    const nuevaSubtipificacion = {
      OP_CATEGORIA: subtipificacion_categoria,
      OP_OPCION: subtipificacion_contenido,
      
    };

    const sqlnuevaSubtipificacion = "INSERT INTO " + keys.database.database + ".tbl_opt_select SET ?";
    await db.promise().query(sqlnuevaSubtipificacion, [nuevaSubtipificacion]);

    req.flash("messageSuccess", `typification registered successfully`);
    res.redirect("/subtipificaciones/crearSubtipificacion");
  } catch (error) {
    console.log("ERROR::", error);
    req.flash("messageError", `error, Please, try again`);
    res.redirect("/tipificaciones/crearSubtipificacion");
  }
});


//llamado por USU_CROL "USUARIO"
router.post("/getSubtipificacion", async (req, res) => {
  try {
    const sqlGetSubtipificacion = "SELECT * FROM " + keys.database.database + ".tbl_opt_select;";
    let [datasqlGetSubtipificacion] = await db.promise().query(sqlGetSubtipificacion);

    res.json(datasqlGetSubtipificacion);
  } catch (error) {
    console.log("ERROR::", error);
  }
});
//llamado por USU_CROL "USUARIO"
router.post("/getSubtipificacion", async (req, res) => {
  try {
    const { PKOP_CODIGO } = req.body;

    const sqlGetSubtipificacion = "SELECT tipificacion_contenido FROM " + keys.database.database + ".tbl_opt_select where PKOP_CODIGO = ?;";
    let [datasqlGetSubtipificacion] = await db.promise().query(sqlGetSubtipificacion, [PKOP_CODIGO]);

    res.json(datasqlGetSubtipificacion[0]);
  } catch (error) {
    console.log("ERROR::", error);
  }
});

module.exports = router;
