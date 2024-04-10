const router = require('express').Router();
const db = require('../database');
const keys = require('../keys');
const fs = require('fs');
const path = require('path');
const { isSupervisorOrAdministrator } = require("../lib/auth");


//llamar JSON de configuracion general
const data = fs.readFileSync((path.join(__dirname, '../../../config.json')));
const config = JSON.parse(data);

router.get('/', (req, res) => {
  res.redirect('/redirect');
});

router.post("/cambiarIdioma", async(req, res) => {
  try {
    let id = req.user.PKusu;
    const modificarIdioma = {
      USU_CIDIOMA: req.body.currentLanguage,
    }
    sqlCambiarIdioma = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? where PKUSU_NCODIGO = ?;";
    await db.promise().query(sqlCambiarIdioma, [modificarIdioma, id]);

  } catch (error) {
    console.log("ERROR::", error);
  }

});


router.post('/tipificacion', async (req, res) => {
  try {
    const sql = `SELECT * FROM ${keys.database.database}.tbl_rtipificaciones_disponibles WHERE TIP_CESTADO = ?`;
    console.log(sql)
    const [rows] = await db.promise().query(sql, ['Activo']);
    res.json(rows);

  } catch (error) {
    console.log("ERROR::", error);
  }

});
router.post('/subtipificacion', async (req, res) => {
  try {
    const categoria = req.body.categoria;
    console.log("esta es la categiria en la ruta sub",categoria)
    const sql = `SELECT * FROM ${keys.database.database}.tbl_opt_select WHERE OP_CATEGORIA = ? AND OP_ESTADO = ? `;
    console.log(sql)
    const [rows] = await db.promise().query(sql, [categoria, 'Activo']);
    res.json(rows);

  } catch (error) {
    console.log("ERROR::", error);
  }

});



module.exports = router;
