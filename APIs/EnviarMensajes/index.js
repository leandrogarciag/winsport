const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
var request = require('request');
const fileUpload = require('express-fileupload');
require('colors')
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
const PORT = config.EnviarMensajes.PORT;
const DB = database.database;

const pathFolder = config.pathFolder.media;

//*settings */
app.set('port', PORT);
app.use(cors({ origin: '*' }));

// * Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(fileUpload());

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

app.post('/sendMessage', async (req, res) => {
  try {
    console.log('entra a enviar mensaje');
    let { To, body, GestionID, usuario } = req.body;
    console.log('usuario',usuario);
    GestionID = Class2.DeCrypt(GestionID);
    let fileName = '',
      pathFile = '';
    // * Save File
    if (req.files) {
      console.log(req.files);
      console.log(`${Date.now()}.${req.files.Media.name.split('.')[1]}`);
      fileName = `${Date.now()}.${req.files.Media.name.split('.')[1]}`;
      let file = req.files.Media;

      // * Create Folder - Set Access
      if (!fs.existsSync(pathFolder)) {
        fs.mkdirSync(pathFolder);
        chmodSync(pathFolder, 'a+rwx');
      }
      // * Path File - Save  File in Folder
      pathFile = `${pathFolder}/${fileName}`;
      file.mv(pathFile);
      console.log('aqui if');
    }

    var options = {
      method: 'POST',
      url: `http://localhost:${config.WebHookWhasapp.PORT}/SendMessage`,
      rejectUnauthorized: false,
      headers: {},
      formData: {
        To: To,
        body: req.files ? '' : body,
        GestionID: GestionID,
        Media: fileName,
        //API OFICIAL CONNECTLY
        // typeMedia: req.files ? req.files.Media.mimetype : 'text/text',

        //API NO OFICIAL pedro lopez
        typeMedia: req.files ?  fileName.split('.')[1] : 'text/text',
        idAgent: usuario,
      },
    };
    console.log('entra',options);

    request(options, (error, response) => {
      
      if (error) {
        console.log(error);
        res.json('error conexion bot enviar mensaje')
      }else{ 
        
        const botCaido = '500 Internal Server Error';
        const ventanaTermino = 'ERROR_TYPE_FAILED_PRECONDITION';
        const idMensaje = '"id":"';
        // console.log('idmensaje:',idMensaje);
        let respuesta =  response.body;
        // console.log(JSON.parse(respuesta));
        console.log(`${response.body}`.green);
        // res.json(response.body);
        // if (respuesta.includes(botCaido)) return res.json({ message: `bot caido`});
        // if (respuesta.includes(ventanaTermino)) return res.json({ message: `bot caido`});
        let message = (respuesta.includes(botCaido)) ? 'bot caido' :
          (respuesta.includes(ventanaTermino)) ? 'more than 24 hours have passed since the customer last replied' :
          (respuesta.includes(idMensaje)) ? 'Mensaje Enviado' :
          `${response.body}`;
         
        res.json(message)
      }
        // throw new Error(error);

    });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST sendMessage', e);
    res.json('error conexion bot enviar mensaje');
  }
});

app.post('/sendTemplate', async (req, res) => {
  try {
    console.log('entra a enviar mensaje template');
    let { To, body, GestionID } = req.body;
    GestionID = Class2.DeCrypt(GestionID);
    let fileName = '',
      pathFile = '';
    // * Save File
    if (req.files) {
      fileName = `${Date.now()}.${req.files.Media.name.split('.')[1]}`;
      let file = req.files.Media;

      // * Create Folder - Set Access
      if (!fs.existsSync(pathFolder)) {
        fs.mkdirSync(pathFolder);
        chmodSync(pathFolder, 'a+rwx');
      }
      // * Path File - Save  File in Folder
      pathFile = `${pathFolder}/${fileName}`;
      file.mv(pathFile);
    }
    //! Buscar datos del template
    const sqlTemplates = `SELECT * FROM ${DB}.tbl_template WHERE TEM_NCODIGO='${body}'`;
            db.promise()
              .query(sqlTemplates)
              .then(([resultTemplates, fields]) => {
                console.log('resultTemplates', resultTemplates[0]);
                var options = {
                  method: 'POST',
                  url: `http://127.0.0.1:${config.WebHookWhasapp.PORT}/SendTemplate`,
                  rejectUnauthorized: false,
                  headers: {},
                  formData: {
                    To: To,
                    GestionID: GestionID,
                    codigoTemplate: resultTemplates[0].TEM_NCODIGO,
                    templateName: resultTemplates[0].TEM_TEMPLATE_NAME,
                    bodyTemplate: resultTemplates[0].TEM_MESSAGE_TEXT,
                    language: resultTemplates[0].TEM_LENGUAGE,
            
                  },
                };
                request(options, (error, response) => {
                  if (error) throw new Error(error);
                  console.log(`${response.body}`.green);
                  res.json(response.body);
                });
              });

    
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST sendMessage', e);
  }
});

app.listen(PORT, () => console.log('Server Enviar Mensajes Running', PORT));