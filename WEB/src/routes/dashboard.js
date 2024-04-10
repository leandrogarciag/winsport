const router = require("express").Router();
const db = require("../database");
const path = require("path");
const { userInfo } = require("os");
const keys = require("../keys");
const { isSupervisorOrAdministrator } = require("../lib/auth");
const { log } = require("console");


router.get("/", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/dashboard", { title: "Dashboard" });
});

router.get("/actualizarDashboard", isSupervisorOrAdministrator, async (req, res) => {
  try {

    sqlAsaColaGeneral = "select DATE_FORMAT(GES_CFECHA_REGISTRO, '%T') as hora, coalesce(timediff(GES_CFECHA_ASIGNACION, GES_CFECHA_PASOASESOR), timediff(now(), GES_CFECHA_PASOASESOR))as ASA FROM " + keys.database.database + ".tbl_chats_management where GES_CFECHA_REGISTRO between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') AND GES_CFECHA_PASOASESOR is not null order by  PKGES_CODIGO asc;";
    let [datasqlAsaColaGeneral] = await db.promise().query(sqlAsaColaGeneral);

    sqlChatsEspera = "SELECT * FROM " + keys.database.database + ".view_chats_espera;";
    let [datasqlChatsEspera] = await db.promise().query(sqlChatsEspera);

    sqlChatsActivos = "SELECT * FROM " + keys.database.database + ".view_chats_activos;";
    let [datasqlChatsActivos] = await db.promise().query(sqlChatsActivos);

    sqlChatsEstado = "SELECT * FROM " + keys.database.database + ".view_chats_estado;";
    let [datasqlChatsEstado] = await db.promise().query(sqlChatsEstado);

    sqlAgentesConectados = "SELECT * FROM " + keys.database.database + ".view_agentes_conectados;";
    let [datasqlAgentesConectados] = await db.promise().query(sqlAgentesConectados);

    sqlAgentesEstado = "SELECT * FROM " + keys.database.database + ".view_agentes_estado;";
    let [datasqlAgentesEstado] = await db.promise().query(sqlAgentesEstado);

    res.json({ datasqlChatsEspera, datasqlChatsActivos, datasqlChatsEstado, datasqlAgentesConectados, datasqlAgentesEstado, datasqlAsaColaGeneral  });

  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/bot", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/dashboardBot", { title: "Dashboard" });
});

router.get("/actualizarDashboardBot", isSupervisorOrAdministrator, async (req, res) => {
  try {

    sqlInteraccionesBot = "SELECT * FROM " + keys.database.database + ".view_chats_arbol WHERE Inicio between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59');";
    let [datasqlInteraccionesBot] = await db.promise().query(sqlInteraccionesBot);

    sqlInteraccionesAbiertasBot = "SELECT * FROM " + keys.database.database + ".tbl_chats_management where GES_ESTADO_CASO like 'OPEN' AND GES_CULT_MSGBOT like '%MSG_SALUDO%' AND GES_CHORA_INICIO_GESTION between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') order by PKGES_CODIGO desc;";
    let [datasqlInteraccionesAbiertasBot] = await db.promise().query(sqlInteraccionesAbiertasBot);

    sqlOpcionesAgentes = "SELECT COUNT(PKGES_CODIGO) as chats FROM " + keys.database.database + ".tbl_chats_management WHERE (GES_CDETALLE_ADICIONAL = '5' OR GES_CDETALLE_ADICIONAL BETWEEN '30' AND '34') AND GES_CFECHA_PASOASESOR between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59');";
    let [datasqlOpcionesAgentes] = await db.promise().query(sqlOpcionesAgentes);

    sqlArbol = "SELECT * FROM " + keys.database.database + ".tbl_bot_tree  where BTREE_OPTION_NUM not like '%FIN%';";
    let [datasqlArbol] = await db.promise().query(sqlArbol);

    sqlOpcionPrimaria = "SELECT count(TRIM(substring_index(substring(OpcionArbol, 1, length(OpcionArbol) -1), '-', -1))) as cantidad, TRIM(substring_index(substring(OpcionArbol, 1, length(OpcionArbol) -1), '-', -1)) as opcionPrimaria FROM " + keys.database.database + ".view_chats_arbol where inicio between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') group by TRIM(substring_index(substring(OpcionArbol, 1, length(OpcionArbol) -1), '-', -1))order by TRIM(substring_index(substring(OpcionArbol, 1, length(OpcionArbol) -1), '-', -1)) desc;";
    let [datasqlOpcionPrimaria] = await db.promise().query(sqlOpcionPrimaria);

    sqlOpcionSecundaria = "SELECT count(TRIM(substring_index(OpcionArbol, '-', -1))) as cantidad, TRIM(substring_index(OpcionArbol, '-', -1)) as opcionSecundaria FROM " + keys.database.database + ".view_chats_arbol where inicio between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') group by TRIM(substring_index(OpcionArbol, '-', -1)) order by TRIM(substring_index(OpcionArbol, '-', -1)) desc;";
    let [datasqlOpcionSecundaria] = await db.promise().query(sqlOpcionSecundaria);

    res.json({datasqlInteraccionesBot, datasqlOpcionesAgentes, datasqlInteraccionesAbiertasBot, datasqlOpcionPrimaria, datasqlArbol, datasqlOpcionSecundaria});

  } catch (error) {
    console.log("ERROR::", error);
  }
});


router.post("/enviarMensajeAsesor", isSupervisorOrAdministrator, async (req, res) => {
  const nuevoMensajeAdminAgente =
  {
    FK_GES_CODIGO: req.body.data.codigoChat,
    MES_BODY: req.body.data.mensaje,
    MES_CHANNEL: "ADMIN",
    MES_USER: req.user.Usuario,
    MES_SMS_STATUS: 'received'
  }

  const sqlMensajeAdminAgente = "INSERT INTO " + keys.database.database + ".tbl_messages SET ?";
  await db.promise().query(sqlMensajeAdminAgente, [nuevoMensajeAdminAgente]);
  res.json("Recibido");
});

// router.post("/cerrarSesionAgente", isSupervisorOrAdministrator, async (req, res) => {
//   try {
//     const {agentePrimaryKey, agenteNombre} = req.body;
    
//     const sqlMensajeAdminAgente = `UPDATE ${keys.database.database}.tbl_usuarios SET USU_CAUXILIAR = 'DISCONNECTED' WHERE PKUSU_NCODIGO = ?`;
//     await db.promise().query(sqlMensajeAdminAgente, [agentePrimaryKey]);
//     await db.promise().query(`DELETE FROM ${keys.database.database}.sessions WHERE data like '%${agenteNombre}%';`);
//     res.json({result:'OK'});
//   } catch (error) {
//     res.json({result:'ERROR'});
//   }
// });
router.post("/cerrarSesionAgente", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const {agentePrimaryKey, agenteNombre} = req.body;
    console.log('body',req.body)
    
    const sqlMensajeAdminAgente = `UPDATE ${keys.database.database}.tbl_usuarios SET USU_CAUXILIAR = 'DISCONNECTED' WHERE USU_CUSUARIO = ?`;
    await db.promise().query(sqlMensajeAdminAgente, [agenteNombre]);
    await db.promise().query(`DELETE FROM ${keys.database.database}.sessions WHERE data like '%${agenteNombre}%';`);
    res.json({result:'OK'});
  } catch (error) {
    res.json({result:'ERROR'});
  }
});

module.exports = router;