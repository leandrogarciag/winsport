'use strict';
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const Class2 = require('./Class2');
const { database } = require('../../WEB/src/keys');
const db = require("../../WEB/src/database");
const fs = require('fs');

//llamar JSON de configuracion general
const data = fs.readFileSync((path.join(__dirname, '../../config.json')));
const config = JSON.parse(data);

//Inicio
const app = express();
const PORT = config.ConsultarMensajes.PORT
const DB = database.database;

//*settings */
app.set('port', PORT);
app.use(cors({ origin: '*' }));


// * Middleware
app.use(morgan('dev'));
app.use(express.json());

app.use(async(req, res, next) => {
  try {
    const sql = `SELECT * FROM ${DB}.tbl_usuarios WHERE USU_CUSUARIO=?`;
    let [result] = await db.promise().query(sql, [req.body.nombreDeUsuario]);
    if(result.length >= 1)
    {
      next();
    }else
    {
      res.status(401).json("Acceso denegado")
    }
  } catch (error) {
    console.log("Ocurrio un error al momento de autenticar al usuario en API : "+error);
    res.status(401).json("Error contacte al administrador del sistema");
  }
});



// app.post('/searchConversation', async (req, res) => {
//   try {
//     const { chatID, cellPhoneNumber } = req.body;
//     let id = Class2.DeCrypt(chatID);
//     const sqlChats = `SELECT PK_MES_NCODE, MES_BODY, MES_CHANNEL, 
// MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE
// FROM (
// SELECT PK_MES_NCODE, MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, 
// MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE
// FROM ${DB}.tbl_messages
// WHERE FK_GES_CODIGO='${id}'
// ORDER BY PK_MES_NCODE DESC
// LIMIT 10
// ) AS subquery
// ORDER BY PK_MES_NCODE ASC;`;
//     //const sqlChats = `SELECT PK_MES_NCODE, MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE FROM ${DB}.tbl_messages WHERE FK_GES_CODIGO='${id}'`;
//     const sqltyp = `SELECT * FROM ${DB}.tbl_typifications WHERE TYP_CNUMERO = '${cellPhoneNumber}'`;
//     const selectsqlClient = `SELECT * FROM ${DB}.tbl_client WHERE CLI_CELLPHONE_NUMBER like '%${cellPhoneNumber}%'`;

//     const [conversation, typificacion, selectClient] = await Promise.all([
//       db.promise().query(sqlChats),
//       db.promise().query(sqltyp),
//       db.promise().query(selectsqlClient)
//     ]);

//     let validadorInfoCliente = selectClient[0].length > 0;

//     res.json({ conversation: conversation[0], tipificacion: typificacion[0], infoClient: selectClient[0], validadorInfoCliente });
//   } catch (e) {
//     console.log('Existe un ERROR en la ruta POST searchConversation', e);
//     res.status(500).json({ error: 'Error en la consulta' });
//   }
// });
app.post('/searchConversation', async (req, res) => {
  
  try {
    const { chatID, cellPhoneNumber } = req.body;
    const id = Class2.DeCrypt(chatID);

    const sqlChats = `
      SELECT PK_MES_NCODE, MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE
      FROM (
        SELECT PK_MES_NCODE, MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE
        FROM ${DB}.tbl_messages
        WHERE FK_GES_CODIGO='${id}'
        ORDER BY PK_MES_NCODE DESC
        LIMIT 10
      ) AS subquery
      ORDER BY PK_MES_NCODE ASC;`;

    const sqltyp = `SELECT * FROM ${DB}.tbl_typifications WHERE TYP_CNUMERO = '${cellPhoneNumber}'`;
    const selectsqlClient = `SELECT * FROM ${DB}.tbl_client WHERE CLI_CELLPHONE_NUMBER LIKE '%${cellPhoneNumber}%'`;

    const [conversation, typificacion, selectClient] = await Promise.all([
      db.promise().query(sqlChats),
      db.promise().query(sqltyp),
      db.promise().query(selectsqlClient)
    ]);

    const validadorInfoCliente = selectClient[0].length > 0;

    res.json({ conversation: conversation[0], tipificacion: typificacion[0], infoClient: selectClient[0], validadorInfoCliente });
  } catch (error) {
    console.log('Existe un ERROR en la ruta POST searchConversation', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
  
});


app.post('/searchNewChats', async (req, res) => {
  try {
    const { chatID } = req.body;
    console.log('entra searchNewChats');

    let id = Class2.DeCrypt(chatID);
    const sqlNumberBot = `SELECT LIPR_WHATSAPP_NUM FROM ${DB}.tbl_line_profiling`;
    let [resultNumberBot] = await db.promise().query(sqlNumberBot);
    const numberBotWhatsapp = resultNumberBot[0].LIPR_WHATSAPP_NUM;
    console.log('numero Bot:',resultNumberBot[0].LIPR_WHATSAPP_NUM);
    const sqlNumberChat = `SELECT GES_NUMERO_COMUNICA FROM ${DB}.tbl_chats_management WHERE PKGES_CODIGO='${id}'`;
    let [resultNumberChats] = await db.promise().query(sqlNumberChat);
    // ! Validar si se encontró el numero
    if (resultNumberChats.length > 0) {
      let GES_NUMERO_COMUNICA = resultNumberChats[0].GES_NUMERO_COMUNICA.slice(9);
      // Consultar mensajes que no han sido leídos por el agente y obtener la cantidad y los IDs
      const sqlMessagesChat = `
        SELECT PK_MES_NCODE 
        FROM ${DB}.tbl_messages 
        WHERE MES_TO LIKE '%${numberBotWhatsapp}%' 
        AND FK_GES_CODIGO = '${id}' 
        AND MES_SMS_STATUS = 'received'
      `;
      let [resultMessagesChats] = await db.promise().query(sqlMessagesChat);
      
      // Obtener la cantidad de mensajes no leídos
      let numUnreadMessages = resultMessagesChats.length;
      
      // Obtener los IDs de los mensajes no leídos
      let unreadMessageIDs = resultMessagesChats.map(message => message.PK_MES_NCODE);
      
      res.json({ 
        numUnreadMessages: numUnreadMessages,
        unreadMessageIDs: unreadMessageIDs,
        resultNumberChats: resultNumberChats
      });
    } else {
      // Si no hay chats, devuelve cero mensajes no leídos y un array vacío de IDs
      res.json({ 
        numUnreadMessages: 0,
        unreadMessageIDs: []
      });
    }
    


  } catch (e) {
    console.log('Existe un ERROR en la ruta POST searchNewChats', e);
  }
})

app.post('/searchNewMessagesInChat', async (req, res) => {
  try {
    const { chatID } = req.body;

    let id = Class2.DeCrypt(chatID);
    const sqlNumberChat = `SELECT COUNT(*) as numberChats FROM ${DB}.tbl_messages WHERE FK_GES_CODIGO='${id}'`;
    let [resultNumberChats] = await db.promise().query(sqlNumberChat);
    // console.log('resultNumberChats',resultNumberChats[0]);
   
        // ! consultar mensajes que no han sido leídos por el agente
    const sqlMessagesChat = `SELECT PK_MES_NCODE, MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_SMS_STATUS, MES_CREATION_DATE FROM ${DB}.tbl_messages WHERE FK_GES_CODIGO='${id}' and MES_SMS_STATUS in ('received','delivered','sent','read') and MES_MESSAGE_SHOW is null limit 1`;
    let [resultMessagesChats] = await db.promise().query(sqlMessagesChat);
      // ! si no hay mensajes 
    let incomingMessages = resultMessagesChats[0];
    // console.log('incomingMessages', incomingMessages);
    res.json({ incomingMessages: incomingMessages,conversation:resultNumberChats[0].numberChats})  
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST searchNewMessagesInChat', e);
  }
})
app.post('/updateReadMessages', async (req, res) => {
  try {
     // Iniciar medición de tiempo

    const { chatID } = req.body;
    console.log('>>>>entra update read messages');
    const id = Class2.DeCrypt(chatID);
    const sqlMessagesChat = `SELECT PK_MES_NCODE, MES_SMS_STATUS FROM ${DB}.tbl_messages WHERE FK_GES_CODIGO='${id}' AND MES_SMS_STATUS in ('received','delivered','sent','read')`;
    const [resultMessagesChats] = await db.promise().query(sqlMessagesChat);

    if (resultMessagesChats.length > 0) {
      const arraIds = [];
      const arrayIdsdeliveredSent = [];

      for (const message of resultMessagesChats) {
        if (message.MES_SMS_STATUS === 'received') {
          arraIds.push(message.PK_MES_NCODE);
        } else {
          arrayIdsdeliveredSent.push(message.PK_MES_NCODE);
        }
      }

      if (arraIds.length > 0) {
        const sqlUpdate = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = 'read', MES_MESSAGE_SHOW = 1 WHERE PK_MES_NCODE IN (?)`;
        await db.promise().query(sqlUpdate, [arraIds]);
      }

      if (arrayIdsdeliveredSent.length > 0) {
        const sqlUpdateDeliveredSent = `UPDATE ${DB}.tbl_messages SET MES_MESSAGE_SHOW = 1 WHERE PK_MES_NCODE IN (?)`;
        await db.promise().query(sqlUpdateDeliveredSent, [arrayIdsdeliveredSent]);
      }


      return res.json({ message: `Chat actualizados a READ` });
    } else {
      return res.json({ message: 'sin mensajes nuevos' });
    }
  } catch (error) {
    console.log('Existe un ERROR en la ruta POST updateReadMessages', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// app.post('/updateReadMessages', async (req, res) => {
//   try {
//     const { chatID } = req.body;
//     console.log('>>>>entra update read messages');
//     let id = Class2.DeCrypt(chatID);
//     const sqlMessagesChat = `SELECT PK_MES_NCODE, MES_SMS_STATUS FROM ${DB}.tbl_messages WHERE FK_GES_CODIGO='${id}' AND MES_SMS_STATUS in ('received','delivered','sent','read') `;
//     let [resultMessagesChats] = await db.promise().query(sqlMessagesChat);
//     if (resultMessagesChats.length > 0) {
//       let arraIds =[];
//       let arrayIdsdeliveredSent =[];
//       let validadorReceived=0;
//       let validadorDelivered=0;
    
//       console.log('>>resultMessagesChats',resultMessagesChats);
//       // ! colocar los ids en formato array
//       for (let i = 0; i < resultMessagesChats.length; i++) {
//         if(resultMessagesChats[i].MES_SMS_STATUS == 'received')
//         {
//           arraIds.push(resultMessagesChats[i].PK_MES_NCODE);
//         }else if (resultMessagesChats[i].MES_SMS_STATUS == 'delivered' || (resultMessagesChats[i].MES_SMS_STATUS == 'sent') || (resultMessagesChats[i].MES_SMS_STATUS == 'read')){
          
//           arrayIdsdeliveredSent.push(resultMessagesChats[i].PK_MES_NCODE);
//           console.log(arrayIdsdeliveredSent);
//         }
//       }
//       // console.log('arraIds',arraIds);
//       if (arraIds.length>0) {
//         validadorReceived=1;
//         const sqlUpdate = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = 'read', MES_MESSAGE_SHOW = 1 WHERE PK_MES_NCODE in (?)`;
//         let [resultNumberChats] = await db.promise().query(sqlUpdate,[arraIds]);
//       }

//       if(arrayIdsdeliveredSent.length>0){
//         validadorDelivered=0
//         const sqlUpdateDeliveredSent = `UPDATE ${DB}.tbl_messages SET MES_MESSAGE_SHOW = 1 WHERE PK_MES_NCODE in (?)`;
//         let [resultNumberChatsDeliveredSent] = await db.promise().query(sqlUpdateDeliveredSent,[arrayIdsdeliveredSent]);
//         // console.log('resultNumberChatsDeliveredSent',resultNumberChatsDeliveredSent);
//       }     

//       if (validadorReceived>0 || validadorDelivered>0){ 
//         return res.json({ message: `Chat actualizados a READ`}); 
//       } else { 
//         return res.json({ message: 'sin mensajes nuevos' }) 
//       } 
//     } else {
//        return res.json({ message: 'sin mensajes nuevos' }) 
//     }

//   } catch (e) {
//     console.log('Existe un ERROR en la ruta POST updateReadMessages', e);
//   }
// })

app.post('/updateReadIncomingMessage', async (req, res) => {
  try {
    const { IdMessage, status } = req.body;
    console.log('entra updateReadIncomingMessage');
    console.log('status',status);

    if(status=='received'){
      const sqlUpdate = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = 'read', MES_MESSAGE_SHOW = 1 WHERE PK_MES_NCODE = ?`;
      console.log('es received',);
      let [resultNumberChats] = await db.promise().query(sqlUpdate,IdMessage);
      
      if (resultNumberChats.changedRows){
        return res.json({ message: `Actualizado`});
      }else{
        return res.json({ message: 'no se actualizo' })
      }
    }else{
      const sqlUpdate = `UPDATE ${DB}.tbl_messages SET  MES_MESSAGE_SHOW = 1 WHERE PK_MES_NCODE = ?`;
      console.log('OTRO QUE NO ES received');
      let [resultNumberChats] = await db.promise().query(sqlUpdate,IdMessage);
      
      if (resultNumberChats.changedRows){
        return res.json({ message: `Actualizado`});
      }else{
        return res.json({ message: 'no se actualizo' })
      }
    }
    
       
      
    
      

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST updateReadIncomingMessage', e);
  }
})
app.post('/ActualizarMensajesAntiguos', async (req, res) => {
  try {
    const { chatID, idfirstmessage } = req.body;
    let id = Class2.DeCrypt(chatID);
    //console.log("el id es : ", idfirstmessage)
    const sqlChats = `SELECT PK_MES_NCODE, MES_BODY,MES_FROM, MES_CHANNEL, 
  MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE
  FROM (
  SELECT PK_MES_NCODE, MES_BODY,MES_FROM, MES_CHANNEL, MES_MEDIA_TYPE, 
  MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE
  FROM dbp_what_winsport.tbl_messages m
  JOIN dbp_what_winsport.tbl_chats_management g ON m.FK_GES_CODIGO = 
  g.PKGES_CODIGO
  WHERE g.PKGES_CODIGO = '${id}' AND m.PK_MES_NCODE < 
  ${idfirstmessage}
  ORDER BY m.PK_MES_NCODE DESC
  LIMIT 10
  ) AS subquery
  ORDER BY PK_MES_NCODE ASC;`;
    const [conversation] = await Promise.all([
      db.promise().query(sqlChats)
    ]);
    res.json({ conversation: conversation[0] });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST ActualizarMensajesAntiguos', e);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});
app.listen(PORT, () => console.log('Server Consultar Mensajes Running', PORT));