const router = require("express").Router();
const db = require("../database");
const path = require("path");
const fs = require("fs");
const { userInfo } = require("os");
const keys = require("../keys");
const Class2 = require("../Class2");
const { log } = require("console");
const { isSupervisorOrAdministratorOrReporting } = require("../lib/auth");

router.get("/reporteInteracciones", isSupervisorOrAdministratorOrReporting, async (req, res) => {

  sqlListaAgentes = "SELECT PKUSU_NCODIGO, USU_CUSUARIO  FROM " + keys.database.database + ".tbl_usuarios where  USU_CROL like 'AGENTE';";
  let [datasqlListaAgentes] = await db.promise().query(sqlListaAgentes);

  res.render("app/reporteInteracciones", { title: "Reporte interacciones", datasqlListaAgentes });
});

router.get("/reporteAgentes", isSupervisorOrAdministratorOrReporting, async (req, res) => {

  sqlListaAgentes = "SELECT PKUSU_NCODIGO, USU_CUSUARIO  FROM " + keys.database.database + ".tbl_usuarios where  USU_CROL like 'AGENTE';";
  let [datasqlListaAgentes] = await db.promise().query(sqlListaAgentes);
  // console.log(sqlListaAgentes)

  res.render("app/reporteAgentes", { title: "Reporte agentes", datasqlListaAgentes });
});

router.get("/reporteTransferencias", isSupervisorOrAdministratorOrReporting, async (req, res) => {

  sqlListaAgentes = "SELECT PKUSU_NCODIGO, USU_CUSUARIO  FROM " + keys.database.database + ".tbl_usuarios where  USU_CROL in('AGENTE', 'ADMINISTRADOR', 'SUPERVISOR') ;";
  let [datasqlListaAgentes] = await db.promise().query(sqlListaAgentes);

  res.render("app/reporteTransferencias", { title: "Reporte transferencias", datasqlListaAgentes });
});
router.get("/reporteAbandono", isSupervisorOrAdministratorOrReporting, async (req, res) => {

  sqlListaAgentes = "SELECT PKUSU_NCODIGO, USU_CUSUARIO  FROM " + keys.database.database + ".tbl_usuarios where  USU_CROL in('AGENTE', 'ADMINISTRADOR', 'SUPERVISOR') ;";
  let [datasqlListaAgentes] = await db.promise().query(sqlListaAgentes);

  res.render("app/reporteAbandono", { title: "Reporte Abandono", datasqlListaAgentes });
});


router.post("/getReporteAgentes", isSupervisorOrAdministratorOrReporting, async (req, res) => {
  if (req.body.data.listaAgentes != 0) {
    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"
    
    sqlReporteEstadoAgentes = "SELECT * FROM " + keys.database.database + ".tbl_registro_usuarios WHERE (REGU_FECHA_INICIO BETWEEN ? AND ?) AND FKREGU_PKUSU_NCODIGO = ? ;";
    let [datasqlReporteEstadoAgentes] = await db.promise().query(sqlReporteEstadoAgentes, [fechaInicial, fechaFinal, req.body.data.listaAgentes]);
    console.log(sqlReporteEstadoAgentes)
    res.json(datasqlReporteEstadoAgentes);
  } else {
    // console.log('Entra acá')

    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteEstadoAgentes = "SELECT * FROM " + keys.database.database + ".tbl_registro_usuarios WHERE (REGU_FECHA_INICIO BETWEEN ? AND ?) ORDER BY REGU_CUSUARIO;";
    let [datasqlReporteEstadoAgentes] = await db.promise().query(sqlReporteEstadoAgentes, [fechaInicial, fechaFinal]);

    res.json(datasqlReporteEstadoAgentes);
  }
});

router.post("/getReporteInteraccionesFecha", isSupervisorOrAdministratorOrReporting, async (req, res) => {
   // Marca de tiempo inicial
  
  fechaInicial = req.body.data.fechaInicial + " 00:00:00"
  fechaFinal = req.body.data.fechaFinal + " 23:59:59"

  sqlRepoteInteracciones = `SELECT * FROM ${keys.database.database}.view_reporte_interacciones WHERE (fechaInicio BETWEEN ? AND ?) ORDER BY PKGES_CODIGO DESC limit 6000 ;`;
  console.log(sqlRepoteInteracciones)
  let [datasqlRepoteInteracciones] = await db.promise().query(sqlRepoteInteracciones, [fechaInicial, fechaFinal]);
  
  
  
  
  res.json(datasqlRepoteInteracciones);
});

router.post("/getReporteInteraccionesAgente", isSupervisorOrAdministratorOrReporting, async (req, res) => {
  if (req.body.data.listaAgentes !== 0) {
    console.log(req.body.data.listaAgentes);
    const sqlRepoteInteracciones = `SELECT * FROM ${keys.database.database}.view_reporte_interacciones WHERE PKUSU_NCODIGO = ? ORDER BY PKGES_CODIGO DESC limit 200 `;
    console.log(sqlRepoteInteracciones);
    try {
      const [datasqlRepoteInteracciones] = await db.promise().query(sqlRepoteInteracciones, [req.body.data.listaAgentes]);
      res.json(datasqlRepoteInteracciones);
    } catch (error) {
      console.error("Error executing SQL query:", error);
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  } else {
    res.status(400).json({ error: "Invalid agent ID provided." });
  }
});
// router.post("/getReporteInteraccionesId", isSupervisorOrAdministratorOrReporting, async (req, res) => {
//   const idCaso = req.body.idCaso; // Retrieve the value passed from the frontend

//   const sqlRepoteInteracciones = `SELECT * FROM ${keys.database.database}.view_reporte_interacciones WHERE PKGES_CODIGO LIKE ?`;
//   console.log(sqlRepoteInteracciones);
//   try {
//     const [datasqlRepoteInteracciones] = await db.promise().query(sqlRepoteInteracciones, [`%${idCaso}%`]); // Using % before and after idCaso for partial match
//     res.json(datasqlRepoteInteracciones);
//   } catch (error) {
//     console.error("Error executing SQL query:", error);
//     res.status(500).json({ error: "An error occurred while processing your request." });
//   }
// });

router.post("/getReporteInteraccionesId", isSupervisorOrAdministratorOrReporting, async (req, res) => {
  const idCaso = req.body.idCaso; // Retrieve the value passed from the frontend

  const sqlRepoteInteracciones = `SELECT * FROM ${keys.database.database}.view_reporte_interacciones WHERE PKGES_CODIGO = ? limit 1`;
  console.log(sqlRepoteInteracciones);
  try {
    const [datasqlRepoteInteracciones] = await db.promise().query(sqlRepoteInteracciones, [idCaso]);
    res.json(datasqlRepoteInteracciones);
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

router.post("/getReporteInteraccionesTel", isSupervisorOrAdministratorOrReporting, async (req, res) => {
  const num_tel = req.body.num_tel; // Retrieve the value passed from the frontend
  const sqlRepoteInteracciones = `SELECT * FROM ${keys.database.database}.view_reporte_interacciones WHERE cliente LIKE ? ORDER BY PKGES_CODIGO DESC LIMIT 200`;

  
  console.log(sqlRepoteInteracciones);
  try {
    const [datasqlRepoteInteracciones] = await db.promise().query(sqlRepoteInteracciones, [`%${num_tel}%`]); // Use % before and after the num_tel to search for records that contain the phone number
    res.json(datasqlRepoteInteracciones);
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});



router.post("/getReporteTransferencias", isSupervisorOrAdministratorOrReporting, async (req, res) => {
  if (req.body.data.listaAgentes != 0) {
    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteEstadoAgentes = `SELECT *
    FROM ${keys.database.database}.view_chats_transferencias WHERE (fechaInicio BETWEEN ? AND ?) COLLATE utf8mb4_0900_ai_ci AND codigoUsuarioInicial = ?;`;
    let [datasqlReporteEstadoAgentes] = await db.promise().query(sqlReporteEstadoAgentes, [fechaInicial, fechaFinal, req.body.data.listaAgentes]);

    res.json(datasqlReporteEstadoAgentes);
  } else {

    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteEstadoAgentes = `SELECT * FROM ${keys.database.database}.view_chats_transferencias
    WHERE (fechaInicio BETWEEN ? AND ?) COLLATE utf8mb4_0900_ai_ci ORDER BY fechaInicio;`;
    let [datasqlReporteEstadoAgentes] = await db.promise().query(sqlReporteEstadoAgentes, [fechaInicial, fechaFinal]);

    res.json(datasqlReporteEstadoAgentes);
  }
});

router.post("/getReporteAbandono", isSupervisorOrAdministratorOrReporting, async (req, res) => {
  if (req.body.data.listaAgentes != 0) {
    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteAbandono = `SELECT * FROM ${keys.database.database}.view_reporte_abandono WHERE (GES_CHORA_INICIO_GESTION BETWEEN ? AND ?) COLLATE utf8mb4_0900_ai_ci AND FKGES_NUSU_CODIGO = ? ;`;
    let [datasqlRepAbandono] = await db.promise().query(sqlReporteAbandono, [fechaInicial, fechaFinal, req.body.data.listaAgentes]);

    res.json(datasqlRepAbandono);
  } else {

    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteAbandono = `SELECT * FROM ${keys.database.database}.view_reporte_abandono WHERE (GES_CHORA_INICIO_GESTION BETWEEN ? AND ?) COLLATE utf8mb4_0900_ai_ci ORDER BY GES_CHORA_INICIO_GESTION;`;
    let [datasqlRepAbandono] = await db.promise().query(sqlReporteAbandono, [fechaInicial, fechaFinal]);

    res.json(datasqlRepAbandono);
  }
});



router.post("/getInteraccion", isSupervisorOrAdministratorOrReporting, async (req, res) => {

  sqlGetInteraccion = "SELECT MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE, MES_USER FROM " + keys.database.database + ".tbl_messages WHERE FK_GES_CODIGO = ? order by MES_CREATION_DATE asc;";
  let [datasqlGetInteraccion] = await db.promise().query(sqlGetInteraccion, [req.body.data]);

  res.json(datasqlGetInteraccion);
});

//llamado por USU_CROL "USUARIO"
router.post("/getInteraccionesPorUsuario", async (req, res) => {

  sqlReporteInteraccionesPorUsuario = "SELECT * FROM " + keys.database.database + ".view_reporte_interacciones where PKUSU_NCODIGO = ? AND (fechaFin between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00' ) AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59' ));";

  let [datasqlReporteInteraccionesPorUsuario] = await db.promise().query(sqlReporteInteraccionesPorUsuario, [req.user.PKusu]);

  res.json(datasqlReporteInteraccionesPorUsuario);
});


module.exports = router;
