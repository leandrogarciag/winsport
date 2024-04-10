const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const db = require("../../WEB/src/database");
const fileUpload = require('express-fileupload');
const { database } = require('../../WEB/src/keys');
const fs = require('fs');

//llamar JSON de configuracion general
const data = fs.readFileSync((path.join(__dirname, '../../config.json')));
const config = JSON.parse(data);

// Inicio
const app = express();

const PORT = config.EstadoMensajes.PORT;
const DB = database.database;

// Configuración de variables de entorno
app.set('port', PORT);
app.set('ZONA_HORARIA', 'America/Bogota');
app.use(cors({ origin: '*' }));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(fileUpload());

const bodyParser = require('body-parser');
const moment = require('moment-timezone');

app.use(bodyParser.json());

app.route('/Status')
  .post( async (req, res) => {
    // Si el número de WhatsApp del mensaje es igual al número del bot, se procesa el mensaje
    // console.log('req.body ===> ',req.body);
    const senderId = req.body.sender.id;
    console.log('■ senderId ===> ',senderId);
    let sql;
    // if (senderId.toString() === app.get('LINEA')) {
    if (senderId.toString()) {
      
      // Se obtiene la fecha y hora actual en la zona horaria configurada
      const formatoHora = app.get('ZONA_HORARIA');
      const current_date = moment().tz(formatoHora).format('YYYY-MM-DD HH:mm:ss');
      
      // Lógica para actualizar la base de datos según el estado del mensaje
      const statusUpdate = req.body.statusUpdate;
      console.log('• statusUpdate.status ===> ',statusUpdate.status);
      const messageId = statusUpdate.id;
      
      if (statusUpdate.status === 'sent') {
        sql = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = '${statusUpdate.status}', MES_DATE_SENT__MESSAGE = '${current_date}' WHERE (MES_MESSAGE_ID = '${messageId}');`;
      } else if (statusUpdate.status === 'delivered') {
        sql = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = '${statusUpdate.status}', MES_DATE_DELIVERED = '${current_date}' WHERE (MES_MESSAGE_ID = '${messageId}');`;
      } else if (statusUpdate.status === 'read') {
        sql = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = '${statusUpdate.status}', MES_DATE_READ = '${current_date}' WHERE (MES_MESSAGE_ID = '${messageId}');`;
      } else {
        sql = `UPDATE ${DB}.tbl_messages SET MES_SMS_STATUS = '${statusUpdate.status}' WHERE (MES_MESSAGE_ID = '${messageId}');`;
      }
    }
      
    try {
      let [result] = await db.promise().query(sql);
      console.log('• result.info ===> ',result.info);
      if (result) {
        res.send('True');
      } else {
        res.send('False');
      }
    } catch (error) {
      console.log("Ocurrió un error al consultar el Estado del Mensaje en la API: " + error);
      res.status(500).send('Error interno del servidor');
    }
    

    
  });

// Iniciar el servidor
app.listen(PORT, () => console.log('Server Status WhatsApp Running', PORT));