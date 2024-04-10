const router = require('express').Router();
const db = require('../database');
const path = require('path');
const { userInfo } = require('os');
const { isAgente } = require('../lib/auth');
const Class2 = require('../Class2');
const fs = require('fs');
const { chmodSync } = require('fs-chmod');
const { isSupervisorOrAdministrator } = require("../lib/auth");
var request = require('request');
require('colors');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const ExcelJS = require('exceljs');


//llamar JSON de configuracion general
const data = fs.readFileSync((path.join(__dirname, '../../../config.json')));
const apis = JSON.parse(data);
const { database, CONNECTLY_BUSSINES_ID, CONNECTLY_API_KEY } = require('../keys');
const DB = database.database;


router.get('/', isAgente, (req, res) => {
  try {
    let PKPER_NCODIGO = req.user.PKusu;
    const sqlEstado = `SELECT USU_CAUXILIAR, USU_CESTADO_ANTERIOR FROM ${DB}.tbl_usuarios WHERE PKUSU_NCODIGO=?`;
    db.promise()
      .query(sqlEstado, [PKPER_NCODIGO])
      .then(([resultEstadoUser, fields]) => {

        let estadoUser = resultEstadoUser[0].USU_CAUXILIAR;
        if (estadoUser == 'OFF') {
          estadoUser = resultEstadoUser[0].USU_CESTADO_ANTERIOR;
        }

        // console.log('resultEstadoUser',resultEstadoUser);
        //seleccionar plantillas para enviar a un usuario con el que ya se tiene chat
        const sqlPlantillas = `SELECT * FROM ${DB}.tbl_plantillas where PLA_CESTADO = 'Activo';`;
        db.promise()
          .query(sqlPlantillas)
          .then(([resultPlantillas, fields]) => {
            console.log('plantillas', resultPlantillas);
            const sqlTemplates = `SELECT * FROM ${DB}.tbl_template WHERE TEM_ESTADO='Activo'`;
            db.promise()
              .query(sqlTemplates)
              .then(([resultTemplates, fields]) => {
                console.log('resultTemplates', resultTemplates);
                res.render('app/appChat', { title: '', estadoUser, resultTemplates, resultPlantillas, appChat: true });
              });
          });
      });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! ERROR! se genero un error en la ruta GET mensajeria', e);
  }
});

router.get('/traerPlantillas', isAgente, (req, res) => {
  try {
    const sqlPlantillas = `SELECT * FROM ${DB}.tbl_plantillas where PLA_CESTADO = 'Activo';`;
    db.promise()
      .query(sqlPlantillas)
      .then(([resultPlantillas, fields]) => {
        console.log('resultPlantillas', resultPlantillas);
        res.json(resultPlantillas);
      });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! ERROR! se genero un error en la ruta GET traerPlantillas', e);
  }
});

router.get('/getId', (req, res) => {
  try {
    console.log('este es el user ', req.user);
    console.log('CODEEEEEEEEEEEEEEEEE', req.user.PKusu);
    let UserId = Class2.EnCrypt(`${req.user.PKusu}`);
    res.json({ idPer: UserId });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! se genero un error en la ruta GET getId', e);
  }
});

router.get('/cantidadChats', (req, res) => {
  try {
    console.log('CODEEEEEEEEEEEEEEEEE', req.user.ChatsNumber);
    // let ChatsNumber = Class2.EnCrypt(`${req.user.ChatsNumber}`);
    let ChatsNumber = req.user.ChatsNumber;
    res.json({ ChatsNumber: ChatsNumber });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! se genero un error en la ruta GET getId', e);
  }
});

// router.post('/searchInfoUser', async (req, res) => {

//   try {
//     const { cellPhoneNumber } = req.body;

//     const selectsqlClient = `SELECT * FROM ${DB}.tbl_client WHERE CLI_CELLPHONE_NUMBER = '${cellPhoneNumber}' limit 1`;
//     const infoCliente = await db.promise().query(selectsqlClient)

//     const selectChatClient = `select PKGES_CODIGO, GES_CHORA_INICIO_GESTION, GES_CLIENTE_NOMBRE, GES_CLIENTE_EMAIL FROM ${DB}.tbl_chats_management where GES_NUMERO_COMUNICA = '${cellPhoneNumber}' AND GES_ESTADO_CASO = 'CLOSE' order by PKGES_CODIGO desc`;
//     const chatClient = await db.promise().query(selectChatClient)

//     console.log(chatClient[0])  

//     const encryptedChatClient = chatClient[0].map((item) => ({
//       PKGES_CODIGO: item.PKGES_CODIGO,
//       GES_CHORA_INICIO_GESTION: item.GES_CHORA_INICIO_GESTION,
//       GES_CLIENTE_NOMBRE: item.GES_CLIENTE_NOMBRE,
//       GES_CLIENTE_EMAIL: item.GES_CLIENTE_EMAIL,
//       idGestion: Class2.EnCrypt(`${item.PKGES_CODIGO}`),
//     }));

//     console.log(encryptedChatClient)

//     const contentChat = [];
//     const selectChatContentPromises = chatClient[0].map(async gestion => {
//       const selectChatContent = `select MES_BODY, MES_CHANNEL FROM ${DB}.tbl_messages where FK_GES_CODIGO = ${gestion.PKGES_CODIGO} order by PK_MES_NCODE`;
//       const chatContent = await db.promise().query(selectChatContent);
//       return chatContent[0];
//     });

//     Promise.all(selectChatContentPromises).then(results => {
//       contentChat.push(...results);

//       res.json({ infoCliente: infoCliente[0], chatClient: encryptedChatClient, contentChat });
//     }).catch(error => {
//       console.error(error);
//     });

//   } catch (e) {
//     console.log('Existe un ERROR en la ruta POST searchInfoUser', e);
//   }
// });

router.post('/chatContent', async (req, res) => {
  try {
    const { gestionId } = req.body;

    const selectChatContent = `
      SELECT MES_BODY, MES_CHANNEL 
      FROM ${DB}.tbl_messages 
      WHERE FK_GES_CODIGO = ${gestionId} 
      ORDER BY PK_MES_NCODE
    `;
    const contentChat = await db.promise().query(selectChatContent);

    res.json({ contentChat: contentChat[0] });
  } catch (error) {
    console.error('Error en la ruta POST /chatContent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/searchInfoUser', async (req, res) => {
  try {
    const { cellPhoneNumber } = req.body;

    const selectsqlClient = `SELECT * FROM ${DB}.tbl_client WHERE CLI_CELLPHONE_NUMBER = '${cellPhoneNumber}' LIMIT 1`;
    const infoCliente = await db.promise().query(selectsqlClient);

    const selectChatClient = `SELECT PKGES_CODIGO, GES_CHORA_INICIO_GESTION, GES_CLIENTE_NOMBRE, GES_CLIENTE_EMAIL FROM ${DB}.tbl_chats_management WHERE GES_NUMERO_COMUNICA = '${cellPhoneNumber}' AND GES_ESTADO_CASO = 'CLOSE' ORDER BY PKGES_CODIGO DESC`;
    const chatClient = await db.promise().query(selectChatClient);

    console.log(chatClient[0]);

    const encryptedChatClient = chatClient[0].map((item) => ({
      PKGES_CODIGO: item.PKGES_CODIGO,
      GES_CHORA_INICIO_GESTION: item.GES_CHORA_INICIO_GESTION,
      GES_CLIENTE_NOMBRE: item.GES_CLIENTE_NOMBRE,
      GES_CLIENTE_EMAIL: item.GES_CLIENTE_EMAIL,
      idGestion: Class2.EnCrypt(`${item.PKGES_CODIGO}`),
    }));

    console.log(encryptedChatClient);

    res.json({ infoCliente: infoCliente[0], chatClient: encryptedChatClient });

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST searchInfoUser', e);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});




router.post('/sendTypification', async (req, res) => {
  console.log('entra a la ruta POST sendTypification');
  try {
    const { chatID, radicadoTip, subtipificacionTip, TipificacionTip, observationsTip, numChat } = req.body.data;

    let id = Class2.DeCrypt(chatID);

    const newTypification = {
      FKTYP_NGES_CODIGO: id,
      TYP_CRADICADO: radicadoTip,
      FKTYP_NUSU_CODIGO: req.user.PKusu,
      TYP_OBSERVACIONES: observationsTip,
      TYP_SUBTIPIFICACION: subtipificacionTip,
      TYP_TIPIFICACION: TipificacionTip,
      TYP_CNUMERO: numChat,
      TYP_CESTADO: 'Activo',
    };
    const selectsqlTyp = `INSERT INTO ${DB}.tbl_typifications SET ?`;
    await db
      .promise()
      .query(selectsqlTyp, [newTypification])
      .then(async ([insertTyp, fields]) => {
        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST sendTypification', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/updateInfoClient', async (req, res) => {
  console.log('entra a la ruta POST updateInfoClient');
  try {
    const { idClient, celularClienteTip, nombre, correo } = req.body.infoClienteActualizada;

    console.log('nombre', nombre, correo);

    const client = {
      CLI_NAME: nombre,
      CLI_EMAIL: correo,
      CLI_STATUS: 'Activo',
    };
    const selectsqlClient = `UPDATE ${DB}.tbl_client SET ? WHERE PK_CLI_NCODE = ?`;
    await db
      .promise()
      .query(selectsqlClient, [client, idClient])
      .then(async ([UpdateClient]) => {
        console.log('UpdateClient', UpdateClient);
        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST sendTypification', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/insertInfoClient', async (req, res) => {
  console.log('entra a la ruta POST insertInfoClient');
  try {
    const { celularClienteTip, nombre, correo } = req.body.infoClienteActualizada;
    console.log('req.body', req.body.infoClienteActualizada);
    const client = {
      CLI_NAME: nombre,
      CLI_CELLPHONE_NUMBER: celularClienteTip,
      CLI_EMAIL: correo,
      CLI_STATUS: 'Activo',
    };
    console.log('Cliente:', client)
    const selectsqlClient = `SELECT * FROM ${DB}.tbl_client WHERE CLI_CELLPHONE_NUMBER like '%${celularClienteTip}%'`;
    console.log(selectsqlClient)
    await db
      .promise()
      .query(selectsqlClient)
      .then(async ([selectClient, fields]) => {
        if (selectClient.length == 0) {
          const sqlInsertClient = `INSERT INTO ${DB}.tbl_client SET ?`;
          await db
            .promise()
            .query(sqlInsertClient, [client])
            .then(async ([insertClient, fields]) => {
              console.log('inserta cliente', insertClient);
              res.json('ok');
            });
        } else {
          res.json('no');
        }
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST insertInfoClient', e);
    res.json('error');
    M.toast({ html: 'Se generó un error, intente de nuevo' });
  }
});

router.get('/availableUsers', async (req, res) => {
  try {
    console.log('entra a avalible users');
    const selectsqlUsers = `SELECT * FROM ${DB}.tbl_usuarios WHERE USU_CROL='AGENTE' AND USU_CAUXILIAR= 'ONLINE' AND PKUSU_NCODIGO != ${req.user.PKusu}`;
    await db
      .promise()
      .query(selectsqlUsers)
      .then(async ([selectUsers, fields]) => {
        console.log('selectUsers', selectUsers);
        res.json({ selectUsers });
      });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! se genero un error en la ruta GET availableUsers', e);
  }
});
router.post('/isChatAttending', async (req, res) => {
  try {
    console.log('entra a isChatAttending');
    const { numeroCel } = req.body;

    const sql = `SELECT * FROM ${DB}.tbl_chats_management where GES_NUMERO_COMUNICA like '%${numeroCel}%' and ((GES_ESTADO_CASO='ATTENDING' OR GES_ESTADO_CASO='TRANSFERRED') OR ( GES_ESTADO_CASO='OPEN' AND GES_CULT_MSGBOT='MSG_FIN'))`;
    let [result] = await db.promise().query(sql);
    // ! el numero NO esta siendo atendido
    if (result.length == 0) return res.json({ result });
    // !el numero esta siendo atendido
    if (result.length > 0) return res.json({ result, message: `Chat en attending por ${result[0].FKGES_NUSU_CODIGO}`, idUserAttending: Class2.EnCrypt(`${result[0].FKGES_NUSU_CODIGO}`), idGestion: Class2.EnCrypt(`${result[0].PKGES_CODIGO}`) });

    res.json(`La peticion ${req.originalUrl} no hizo una nada :v`);
  } catch (e) {
    console.log(`ERROR! ERROR! ERROR! se genero un error en la ruta GET ${req.originalUrl}`, e);
  }
});

router.post('/transferir', async (req, res) => {
  console.log('entra a la ruta POST transferir');
  try {
    const { chatID, MotivoTransferencia, selectModalAvalibleUsers, nivel, ObservacionTransferencia } = req.body.data;
    console.log('chatID', chatID);
    console.log(req.body.data);

    let id = chatID

    let nivelPermitdios = ['FB', 'CR', 'IB']

    if (isNaN(chatID)) {
      id = Class2.DeCrypt(chatID);
    } else {
      id = chatID;
    }

    const newTransfer = {
      FKTRA_NUSU_CODIGO: req.user.PKusu,
      FKTRA_NUSU_TRANSFERIDO: selectModalAvalibleUsers,
      FKTRA_NGES_CODIGO: id,
      TRA_MOTIVO: MotivoTransferencia,
      TRA_OBSERVACION: ObservacionTransferencia,
      TYP_CESTADO: 'Activo',
    };
    let update;
    if (nivelPermitdios.includes(selectModalAvalibleUsers)) {
      update = {
        FKGES_NUSU_CODIGO: null,
        GES_ESTADO_CASO: 'OPEN',
        //GES_CNIVEL: selectModalAvalibleUsers,
      };
    } else {
      update = {
        FKGES_NUSU_CODIGO: selectModalAvalibleUsers,
        GES_ESTADO_CASO: 'TRANSFERRED',
        //GES_CNIVEL: nivel.split("- ")[1]
      };

      const updateFechaAsignacion = `UPDATE ${DB}.tbl_chats_management SET GES_CFECHA_ASIGNACION = NOW() WHERE PKGES_CODIGO = ? AND GES_CFECHA_ASIGNACION is null`;
      await db.promise().query(updateFechaAsignacion, [id])

    }
    const updatesql = `UPDATE ${DB}.tbl_chats_management SET ? WHERE PKGES_CODIGO = ?`;
    await db
      .promise()
      .query(updatesql, [update, id])
      .then(async ([UpdateClient, fields]) => {
        console.log('UpdateClient', UpdateClient);
        if (UpdateClient.affectedRows == 1) {
          const selectsqlTransfer = `INSERT INTO ${DB}.tbl_transfers SET ?`;
          await db
            .promise()
            .query(selectsqlTransfer, [newTransfer])
            .then(async ([insertTransfer, fields]) => {
              res.json('ok');
            });
        }
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST transferir', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

//modificar estado del usuario
router.post('/estadosUser', async (req, res) => {
  console.log('entra a la ruta POST estados');
  try {
    const { estadoUser } = req.body;
    let idUser = req.user.PKusu;
    console.log('estado', estadoUser);
    const estadoUpdate = {
      USU_CAUXILIAR: estadoUser,
    };
    const selectsqlClient = `UPDATE ${DB}.tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ?`;
    await db
      .promise()
      .query(selectsqlClient, [estadoUpdate, idUser])
      .then(async ([UpdateUser, fields]) => {
        // console.log('UpdateClient', UpdateUser);
        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST estados', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/cerrarChat', async (req, res) => {
  try {
    const { chatIDHeader } = req.body;

    let ChatID = chatIDHeader

    if (isNaN(chatIDHeader)) {
      ChatID = Class2.DeCrypt(chatIDHeader);
    } else {
      ChatID = chatIDHeader;
    }

    const estadoUpdate = {
      //GES_ESTADO_CASO: 'OPEN',
      //GES_CULT_MSGBOT: 'MSG_ENCUESTA'
      GES_ESTADO_CASO: 'CLOSE',
      GES_CULT_MSGBOT: 'MSG_FIN',

    };

    const selectsqlClient = `UPDATE ${DB}.tbl_chats_management SET ?, GES_CHORA_FIN_GESTION = NOW() WHERE PKGES_CODIGO = ?`;
    await db
      .promise()
      .query(selectsqlClient, [estadoUpdate, ChatID])
      .then(async ([UpdateUser, fields]) => {
        console.log('UpdateClient', UpdateUser.serverStatus);

        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST cerrarChat', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

// INICIO Cierra el caso desde el dashboard 
router.post('/cerrarChatAdmin', isSupervisorOrAdministrator, async (req, res) => {
  try {

    let mensajeAdmin = "¡Gracias por haber contactado al Soporte en línea de *CLARO*!"

    const { chatIDHeader, numeroCliente } = req.body;

    let ChatID = chatIDHeader

    if (isNaN(chatIDHeader)) {
      ChatID = Class2.DeCrypt(chatIDHeader);
    } else {
      ChatID = chatIDHeader;
    }


    const estadoUpdate = {
      GES_ESTADO_CASO: 'CLOSE',
      GES_CULT_MSGBOT: 'MSG_FIN'
    };

    const tipificaAdmin = {
      FKTYP_NGES_CODIGO: chatIDHeader,
      FKTYP_NUSU_CODIGO: req.user.PKusu,
      TYP_CRADICADO: "Cerrado desde ADMIN",
      TYP_CNUMERO: numeroCliente,
      TYP_OBSERVACIONES: "Cerrado desde ADMIN",
      TYP_CESTADO: "Activo"
    };

    const sqlTipificaAdmin = `INSERT INTO ${DB}.tbl_typifications SET ?`;
    await db.promise().query(sqlTipificaAdmin, [tipificaAdmin]);

    const selectsqlClient = `UPDATE ${DB}.tbl_chats_management SET ?, GES_CHORA_FIN_GESTION = NOW() WHERE PKGES_CODIGO = ?`;
    await db
      .promise()
      .query(selectsqlClient, [estadoUpdate, ChatID])
      .then(async ([UpdateUser, fields]) => {
        console.log('UpdateClient', UpdateUser.serverStatus);

        var options = {
          method: 'POST',
          url: `http://localhost:${apis.WebHookWhasapp.PORT}/SendMessage`,
          rejectUnauthorized: false,
          headers: {},
          formData: {
            To: numeroCliente,
            body: mensajeAdmin,
            GestionID: ChatID,
            Media: '',
            typeMedia: 'text/text',
            idAgent: req.user.Usuario,
          },
        };

        request(options, (error, response) => {
          if (error) {
            console.log('Existe un ERROR en la ruta POST cerrarChat', e);
            req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
          } else {
            res.json('ok');
          }
        })


      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST cerrarChat', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});
// FIN Cierra el caso desde el dashboard

router.post('/insertIdGestion', async (req, res) => {
  try {
    const { ChatOutboundCelular, PlantillaChatOutBound } = req.body.data;
    console.log('>>>>numero', ChatOutboundCelular);
    const client = {
      FKGES_NUSU_CODIGO: req.user.PKusu,
      GES_ESTADO_CASO: 'ATTENDING',
      GES_NUMERO_COMUNICA: ChatOutboundCelular,
      GES_CULT_MSGBOT: 'MSG_FIN',
      GES_CESTADO: 'Activo',
      GES_CNIVEL: req.user.skill,
      GES_CANAL: 'OUT',
    };
    const sqlInsertClient = `INSERT INTO ${DB}.tbl_chats_management SET ?, GES_CFECHA_ASIGNACION = NOW()`;
    await db
      .promise()
      .query(sqlInsertClient, [client])
      .then(async ([insertClient, fields]) => {
        // console.log('insertClient',insertClient.insertId);
        let idGestion = Class2.EnCrypt(`${insertClient.insertId}`);
        console.log('idGestion', idGestion);
        res.json(idGestion);
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST insertIdGestion', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/updateAttending', async (req, res) => {
  console.log('entra a la ruta POST updateAttending');
  try {
    const { GestionID } = req.body;
    console.log('GestionID', GestionID);

    const sqlUpdate = `UPDATE ${DB}.tbl_chats_management SET GES_ESTADO_CASO = 'ATTENDING', FKGES_NUSU_CODIGO='${req.user.PKusu}'  WHERE PKGES_CODIGO = ${GestionID}`
    let [resultUpdate] = await db.promise().query(sqlUpdate)
    if (resultUpdate.changedRows) return res.json({ ASIGNED: true })

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST updateAttending', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/enviarChatEmail', async (req, res) => {
  try {
    let { GestionID, data } = req.body;
    if (isNaN(GestionID)) {
      GestionID = Class2.DeCrypt(GestionID);
    }
    const [conversation] = await db.promise().query(`SELECT * FROM ${DB}.tbl_messages WHERE FK_GES_CODIGO= ?; `, [GestionID]);
    const [gestionInfo] = await db.promise().query(`SELECT * FROM ${DB}.tbl_chats_management WHERE PKGES_CODIGO = ?; `, [GestionID]);

    let htmlEmail = `<!DOCTYPE html>
      <html>
       <head>
          <style>
              body {
                  width: 100%;
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
                  font-family: 'open sans', 'helvetica neue', helvetica, arial, sans-serif;
                  padding: 0;
                  Margin: 0;
                  font-size: large;
              }
      
              .msg-container {
                  width: 600px;
                  border: 3px solid rgb(102, 102, 102);
                  border-radius: 5px;
                  margin: auto;
                  padding: 15px;
                  overflow-y: scroll;
                  scroll-behavior: smooth;
                  height: 400px;
              }
      
              .msg-left {
                  width: 100%;
                  background-color: #eee;
                  border-radius: 8px;
                  padding: 10px;
                  border-bottom-left-radius: 0;
                  margin-bottom: 15px;
                  width: fit-content;
                  max-width: 50%;
      
              }
      
              .msg-right {
                  width: 100%;
                  text-align: -webkit-right;
      
              }
      
              .msg-right .msg-bubble {
                  color: white;
                  background-color: #579ffb;
                  border-radius: 8px;
                  padding: 10px;
                  border-bottom-right-radius: 0;
                  margin-bottom: 15px;
                  width: fit-content;
                  max-width: 50%;
                  text-align: left;
      
              }
      
              .msg-info {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 10px;
              }
      
              .msg-info-name {
                  margin-right: 10px;
                  font-weight: bold;
              }
      
              .msg-info-time {
                  font-size: 0.85em;
              }
          </style>
      </head>
      
      <body>
          ${data}
          <h4>Fecha Inicio: ${gestionInfo[0].GES_CHORA_INICIO_GESTION}, Fecha Fin: ${gestionInfo[0].GES_CHORA_FIN_GESTION}</h4>
          <div class="msg-container">`;
    for (const mensaje of conversation) {
      if (mensaje.MES_CHANNEL == 'RECEIVED') {
        htmlEmail += `<div class="msg-left">
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${mensaje.MES_FROM}</div>
                    <div class="msg-info-time">${mensaje.MES_CREATION_DATE}</div>
                </div>${mensaje.MES_BODY}
            </div>
        </div>`;
      } else {
        htmlEmail += `<div class="msg-right">
          <div class="msg-bubble">
              <div class="msg-info">
                  <div class="msg-info-name">${mensaje.MES_USER}</div>
                  <div class="msg-info-time">${mensaje.MES_CREATION_DATE}</div>
              </div>${mensaje.MES_BODY}
          </div>
      </div>`;
      }
    }
    htmlEmail += `</div>
      </body>
      </html>`;
    console.log(gestionInfo[0]);
    // await transporter.sendMail({
    //   from: `"Conversación cliente: ${gestionInfo[0].GES_NUMERO_COMUNICA}" <belltrancast@gmail.com>`, // sender address
    //   to: 'mrbotwpp@gmail.com', // list of receivers
    //   subject: `Conversación cliente: ${gestionInfo[0].GES_NUMERO_COMUNICA}`, // Subject line
    //   // text: "Codigo verificacion:    " + token, // plain text body
    //   html: htmlEmail, // html body
    // });

    return res.json({ ASIGNED: true })

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST updateAttending', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

// * envio masivo

router.get('/masivo/cargar-excel', async (req, res) => {
  res.render('app/masivo/inputFileCargue', { title: 'Cargar Excel' })
});

router.post('/masivo/guarde-local-excel', async (req, res) => {
  const excel = req.files.fileExcel;
  const extensionArchivo = excel.name.split('.').pop();
  const nombreArchivo = `${req.user.Usuario}$_$${Date.now()}.${extensionArchivo}`;
  const rutaArchivo = path.join(__dirname, `../doc/excel/${nombreArchivo}`)

  try {
    excel.mv(rutaArchivo, async (err) => {
      if (err) return res.status(500).send({ message: err });
      chmodSync(rutaArchivo, 'a+rwx'); // permisos sobre el archivo

      //Archivo guardado
      getDataExcel({ rutaArchivo, req })
        .then(resolve => {
          const arrTelefonos = resolve;
          // console.log(arrTelefonos);
          return res.status(200).render('app/masivo/vistaPrevia', { title: 'Cargar Excel', arrTelefonos, nombreExcel: excel.name, rutaArchivo });
        }).catch(reject => {
          req.flash('messageError', reject);
          return res.redirect('/mensajeria/masivo/cargar-excel');
        })
    });

  } catch (error) {
    console.error(error);
  }
});

router.get('/masivo/estado', async (req, res) => {

  const sqlConsultaEstado = `SELECT ENMA_COD_ENVIO FROM  ${DB}.tbl_envio_masivo WHERE ENMA_ESTADO_ENVIO like "POR ENVIAR";`;
  let [datasqlConsultaEstado] = await db.promise().query(sqlConsultaEstado)

  if (datasqlConsultaEstado.length > 0) {

    const sqlConsultaCantidad = `SELECT count(ENMA_COD_ENVIO) as cantidad FROM ${DB}.tbl_envio_masivo WHERE ENMA_ESTADO_ENVIO not like "POR ENVIAR" AND ENMA_COD_ENVIO like '${datasqlConsultaEstado[0].ENMA_COD_ENVIO}' ;`;
    let [datasqlConsultaCantidad] = await db.promise().query(sqlConsultaCantidad)

    datosJson = {
      enviados: datasqlConsultaCantidad[0].cantidad,
      porEnviar: datasqlConsultaEstado.length,
      estado: true
    }

    res.json(datosJson);
  } else {
    res.json({ estado: false });
  }

});

function getDataExcel({ rutaArchivo, req }) {
  return new Promise((resolve, reject) => {
    let arrTelefonos = [];
    const workbook = new ExcelJS.Workbook();

    workbook.xlsx.readFile(rutaArchivo).then(() => {
      try {
        const hojas = workbook.worksheets.map((sheet) => sheet.name);
        const selectedHoja1 = workbook.getWorksheet(hojas[0]);
        const cantFilas = selectedHoja1.actualRowCount; // para que la diga bien, borrar por debajo de la tabla del excel bien
        const cantColumnas = selectedHoja1.actualColumnCount; // para que la diga bien, borrar por lado derecho de la tabla del excel bien

        if (cantColumnas !== 1) {
          return reject(`El excel debe ser de <b>1 columna<b/>, el ingresado tiene <b style="color: red"> ${cantColumnas} columnas</b> `);
        }

        for (let i = 2; i <= cantFilas; i++) { // recorre todas la filas, comienzo en 2, ya que 1 es el cabezote del excel
          const telefono = selectedHoja1.getRow(i).getCell(1).toCsvString().replace(/"/g, '').replaceAll(' ', '');

          if (telefono.trim().length > 13) {
            return reject(`El número de teléfono en la celda <b style="color: red"> A${i} </b> no es valido, debe ser menor de 13 digitos`);
          }

          if (!/^[0-9]+$/.test(telefono)) {
            return reject(`El número de teléfono en la celda <b style="color: red"> A${i} </b> no es valido, solo debe contener números`);
          }

          arrTelefonos.push(telefono.trim());
        }

        arrTelefonos = [...new Set(arrTelefonos)]; //quitar valores repetidos en el array

        if (arrTelefonos.length) {
          resolve(arrTelefonos);
        } else {
          reject('No se pudo extraer los datos del Excel');
        }
      } catch (err) {
        reject(`Error en el archivo Excel ${err}`);
      }
    });
  });
}

router.post('/masivo/generar-envio', async (req, res) => {
  const { rutaArchivo, nombreExcel, codPlantilla, codLanguage, nivel } = req.body;

  randomID = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

  const arrGeneral = [
    req.user.PKusu, // FKUSU_ENMA_CODE
    randomID, // ENMA_COD_ENVIO
    codPlantilla.trim(), // ENMA_COD_PLANTILLA
    codLanguage.trim(), // ENMA_COD_LANGUAGE
    'POR ENVIAR', // ENMA_ESTADO_ENVIO
    nombreExcel, // ENMA_NOMBRE_ARCHIVO
    nivel, // ENMA_NIVEL
  ]

  try {
    const arrTelefonos = await getDataExcel({ rutaArchivo, req });
    const rowsToInsert = arrTelefonos.map(telefono => {
      return [
        ...arrGeneral,
        telefono // ENMA_NUMERO_DESTINO
      ]
    });

    const sqlInsert = `
      INSERT INTO ${DB}.tbl_envio_masivo 
        (FKUSU_ENMA_CODE, ENMA_COD_ENVIO, ENMA_COD_PLANTILLA, ENMA_COD_LANGUAGE, ENMA_ESTADO_ENVIO, ENMA_NOMBRE_ARCHIVO, ENMA_NIVEL, ENMA_NUMERO_DESTINO) 
        VALUES ?`;

    await db.promise().query(sqlInsert, [rowsToInsert]);
    recuPorEnviar(); // se ejecuta el envio de mensajes

    res.json(true);
  } catch (error) {
    console.error(error);
    res.json(false);
  }

});

async function recuPorEnviar() {
  try {
    const sqlSelect = `SELECT COUNT(*) AS CANT_ENVIOS FROM ${DB}.tbl_envio_masivo WHERE ENMA_ESTADO_ENVIO = ?`;
    const [rows] = await db.promise().query(sqlSelect, ['POR ENVIAR']);

    const { CANT_ENVIOS } = rows[0];

    if (CANT_ENVIOS > 0) {
      const sqlSelectOne = `SELECT * FROM ${DB}.tbl_envio_masivo WHERE ENMA_ESTADO_ENVIO = ? LIMIT 1`;
      const [rowsOne] = await db.promise().query(sqlSelectOne, ['POR ENVIAR']);
      const { PKENMA_NCODE, ENMA_NUMERO_DESTINO, ENMA_COD_PLANTILLA, ENMA_COD_LANGUAGE, ENMA_NIVEL } = rowsOne[0];


      const sqlBuscarActivo = `SELECT * FROM ${DB}.tbl_chats_management WHERE GES_ESTADO_CASO in ("OPEN", "ATTENDING", "TRANSFERRED") AND GES_NUMERO_COMUNICA = ? LIMIT 1`;
      const [datasqlBuscarActivo] = await db.promise().query(sqlBuscarActivo, [`+${ENMA_NUMERO_DESTINO}`]);

      // SI hay un chat activo en ese momento no le envia el mensaje.

      if (datasqlBuscarActivo.length > 0) {

        const actualizarRegistro = {
          ENMA_ESTADO_ENVIO: "ERROR",
          ENMA_DETALLE_ERROR: "Interaccion activa"
        };

        const sqlactualizarRegistro = `UPDATE ${DB}.tbl_envio_masivo SET ? WHERE PKENMA_NCODE = ?`;
        await db.promise().query(sqlactualizarRegistro, [actualizarRegistro, PKENMA_NCODE]);

      } else {

        const url = `https://api.connectly.ai/v1/businesses/${CONNECTLY_BUSSINES_ID}/send/whatsapp_templated_messages`;

        const response = await fetch(url, {
          method: 'post',
          body: JSON.stringify({
            sender: apis.connectly.numero,
            number: `+${ENMA_NUMERO_DESTINO}`,
            templateName: ENMA_COD_PLANTILLA,
            language: ENMA_COD_LANGUAGE,
            paramaters: []
          }),
          headers: { 'X-API-Key': CONNECTLY_API_KEY }
        });

        const data = await response.json();

        console.log('data...........', data.id)


        // se actualiza el estado del envio al mensaje
        let objUpdate = {};
        if (data.hasOwnProperty('id')) {
          objUpdate.ENMA_ESTADO_ENVIO = 'ENVIADO';

          const nuevoRegistro = {
            GES_ESTADO_CASO: "OPEN",
            GES_NUMERO_COMUNICA: `+${ENMA_NUMERO_DESTINO}`,
            GES_CULT_MSGBOT: "MSG_MASIVO",
            GES_CESTADO: "Activo",
            GES_CNIVEL: ENMA_NIVEL,
            GES_CANAL: "MASIVO",
          };

          //Insertar en tbl_chats_management
          const sqlNuevoRegistro = `INSERT INTO ${DB}.tbl_chats_management SET ?`;
          const resultMess = await db.promise().query(sqlNuevoRegistro, [nuevoRegistro]);

          // result_id = resultMess[0].insertId
          // console.log('sqlNuevoRegistro.......',result_id)

          // const nuevoRegistroMensajes = {
          //   FK_GES_CODIGO : result_id,
          //   MES_ACCOUNT_SID  : '2ea0e260-96a7-4cfb-b417-da71f3b86ffb' ,
          //   MES_BODY : "Mensaje masivo",
          //   MES_FROM : "+14158435684",
          //   MES_TO : `+${ENMA_NUMERO_DESTINO}`,
          //   MES_CHANNEL : "MASIVO",
          //   MES_MESSAGE_ID : data.id,
          //   MES_USER : "BOT_MASIVO",
          // };

          // //Insertar en tbl_chats_management
          // const sqlNuevoRegistroMensajes = `INSERT INTO ${DB}.tbl_messages SET ?`;
          // await db.promise().query(sqlNuevoRegistroMensajes, [nuevoRegistroMensajes]);

          console.log('Fin gestion')

        }

        if (data.hasOwnProperty('message')) {
          objUpdate.ENMA_ESTADO_ENVIO = 'ERROR';
          objUpdate.ENMA_DETALLE_ERROR = data.message;
        }

        const sqlUpdate = `UPDATE ${DB}.tbl_envio_masivo SET ? WHERE PKENMA_NCODE = ?`;
        await db.promise().query(sqlUpdate, [objUpdate, PKENMA_NCODE]);
      }

      setTimeout(() => recuPorEnviar(), 2000);
    }
  } catch (e) {
    console.error('Error en recuPorEnviar')
  }
}

// * ?

router.get('/connectyl/plantillas', async (req, res) => {
  const url = `https://api.connectly.ai/v1/businesses/${CONNECTLY_BUSSINES_ID}/get/templates`;
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify({}),
    headers: { 'X-API-Key': CONNECTLY_API_KEY }
  });

  const data = await response.json();

  res.json(data.entity.templateGroups);
});


module.exports = router;