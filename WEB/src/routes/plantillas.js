const router = require("express").Router();
const db = require("../database");
const path = require("path");
const fs = require("fs");
const { userInfo } = require("os");
const keys = require("../keys");
const Class2 = require("../Class2");
const { log } = require("console");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/crearPlantilla", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearPlantilla", { title: "Crear plantilla" });
});

router.get("/listarPlantillas", isSupervisorOrAdministrator, async (req, res) => {
  try {
    sqlListaPlantillas = "SELECT * FROM " + keys.database.database + ".tbl_plantillas where PLA_CESTADO = 'Activo';";
    let [datasqlListaPlantillas] = await db.promise().query(sqlListaPlantillas);

    for (let i = 0; i < datasqlListaPlantillas.length; i++) {
      datasqlListaPlantillas[i].EnCrypt = Class2.EnCrypt(`${datasqlListaPlantillas[i].PKPLA_NCODIGO}`);
    }

    res.render("app/listarPlantillas", { title: "listado plantillas", listaPlantillas: datasqlListaPlantillas });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/actualizarPlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlActualizarPlantilla = "SELECT * FROM " + keys.database.database + ".tbl_plantillas where PKPLA_NCODIGO = ?;";
    let [datasqlActualizarPlantilla] = await db.promise().query(sqlActualizarPlantilla, [id]);
    datasqlActualizarPlantilla[0].EnCrypt = req.params.id;

    res.render("app/actualizarPlantilla", { title: "Actualizar plantilla", plantilla: datasqlActualizarPlantilla[0] });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarPlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log("entro");
    const { plantilla_nombre, plantilla_contenido } = req.body;

    const modificarPlantilla = {
      PLA_CNOMBRE: plantilla_nombre,
      PLA_CCONTENIDO: plantilla_contenido,
    };

    sqlModificarPlantilla = "UPDATE " + keys.database.database + ".tbl_plantillas SET ? where PKPLA_NCODIGO = ?;";
    await db.promise().query(sqlModificarPlantilla, [modificarPlantilla, id]);

    req.flash("messageSuccess", `Template modified successfully`);
    res.redirect("/plantillas/listarPlantillas");
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/eliminarPlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    const sqlEliminarPlantilla = "UPDATE " + keys.database.database + ".tbl_plantillas SET PLA_CESTADO = 'Inactivo' where PKPLA_NCODIGO = ?;";
    await db.promise().query(sqlEliminarPlantilla, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});
router.get("/disablePlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log("Decrypted ID:", id);
    const sqlDisablePlantilla = "UPDATE " + keys.database.database + ".tbl_plantillas SET PLA_CESTADO = 'Inactivo' where PKPLA_NCODIGO = ?;";
    console.log("SQL Query:", sqlDisablePlantilla);
    const [result] = await db.promise().query(sqlDisablePlantilla, [id]);
    console.log("Database Update Result:", result);
    res.json(true);
  } catch (error) {
    console.error("Error:", error);
    res.json(false);
  }
});

router.post("/crearPlantilla", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { plantilla_nombre, plantilla_contenido } = req.body;

    const nuevaPlantilla = {
      PLA_CNOMBRE: plantilla_nombre,
      PLA_CCONTENIDO: plantilla_contenido,
      PLA_CESTADO: "Activo"
    };

    const sqlNuevaPlantilla = "INSERT INTO " + keys.database.database + ".tbl_plantillas SET ?";
    await db.promise().query(sqlNuevaPlantilla, [nuevaPlantilla]);

    req.flash("messageSuccess", `Template registered successfully`);
    res.redirect("/plantillas/crearPlantilla");
  } catch (error) {
    console.log("ERROR::", error);
    req.flash("messageError", `error, Please, try again`);
    res.redirect("/plantillas/crearPlantilla");
  }
});


//llamado por USU_CROL "USUARIO"
router.post("/getPlantillas", async (req, res) => {
  try {
    const sqlGetPlantillas = "SELECT * FROM " + keys.database.database + ".tbl_plantillas;";
    let [datasqlGetPlantillas] = await db.promise().query(sqlGetPlantillas);

    res.json(datasqlGetPlantillas);
  } catch (error) {
    console.log("ERROR::", error);
  }
});
//llamado por USU_CROL "USUARIO"
router.post("/getPlantilla", async (req, res) => {
  try {
    const { PKPLA_NCODIGO } = req.body;

    const sqlGetPlantilla = "SELECT plantilla_contenido FROM " + keys.database.database + ".tbl_plantillas where PKPLA_NCODIGO = ?;";
    let [datasqlGetPlantilla] = await db.promise().query(sqlGetPlantilla, [PKPLA_NCODIGO]);

    res.json(datasqlGetPlantilla[0]);
  } catch (error) {
    console.log("ERROR::", error);
  }
});

module.exports = router;
