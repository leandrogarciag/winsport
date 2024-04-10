const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const Class2 = require('./Class2');
const { database } = require('../../WEB/src/keys');
const db = require("../../WEB/src/database");
const fs = require('fs');
const { type } = require('os');

//llamar JSON de configuracion general
const data = fs.readFileSync((path.join(__dirname, '../../config.json')));
const config = JSON.parse(data);

//Inicio
const app = express();
const PORT = config.Asignacion.PORT;
const DB = database.database;

//*settings */
app.set('port', PORT);
app.use(cors({ origin: '*' }));


// * Middleware
app.use(morgan('dev'));
app.use(express.json());

app.use(async (req, res, next) => {
    try {
        const sql = `SELECT * FROM ${DB}.tbl_usuarios WHERE USU_CUSUARIO=?`;
        let [result] = await db.promise().query(sql, [req.body.nombreDeUsuario]);
        if (result.length >= 1) {
            next();
        } else {
            res.status(401).json("Acceso denegado")
        }
    } catch (error) {
        console.log("Ocurrio un error al momento de autenticar al usuario en API : " + error);
        res.status(401).json("Error contacte al administrador del sistema");
    }
});

app.post('/chatsAsignados', async (req, res) => {
    try {
        let { UserId, arrayAttendingChats } = req.body;
        if (arrayAttendingChats.length < 1) {
            arrayAttendingChats.push('0');
        } else {
            for (let i = 0; i < arrayAttendingChats.length; i++) {
                arrayAttendingChats[i] = Class2.DeCrypt(`${arrayAttendingChats[i]}`);
            }
        }

        let idPer = Class2.DeCrypt(UserId);
        
        // const sql = `SELECT count(*) as contador FROM ${DB}.tbl_chats_management WHERE FKGES_NUSU_CODIGO=? AND GES_ESTADO_CASO="ATENDING"`;
        const sql = `SELECT * FROM ${DB}.tbl_chats_management WHERE FKGES_NUSU_CODIGO=? AND (GES_ESTADO_CASO='ATTENDING' OR GES_ESTADO_CASO='TRANSFERRED') AND PKGES_CODIGO NOT IN (?)  limit 1`;
        let [result] = await db.promise().query(sql, [idPer, arrayAttendingChats]);
        // ! Validar si tiene chats asignados
        if (result.length == 0) return res.json({ result });

        result[0].EnCryptId = Class2.Encrypt(`${result[0].PKGES_CODIGO}`);

        // ! Validar si tiene un nuevo chat con estado ATTENDING
        if (result[0].GES_ESTADO_CASO == 'ATTENDING') return res.json({ result, message: 'Nuevo Chat ATTENDING' });

        // ! Validar si le transfirieron un chat - TRANSFERRED
        if (result[0].GES_ESTADO_CASO == 'TRANSFERRED') {
            const sqlUpdate = `UPDATE ${DB}.tbl_chats_management SET GES_ESTADO_CASO = 'ATTENDING' WHERE PKGES_CODIGO = ${result[0].PKGES_CODIGO}`;
            let [resultUpdate] = await db.promise().query(sqlUpdate);
            if (resultUpdate.changedRows) return res.json({ result, message: `Chat Transferido ${result[0].GES_NUMERO_COMUNICA}`, TRANSFERRED: true });
        }
        res.json(`La peticion ${req.originalUrl} no hizo una nada`);
    } catch (e) {
        console.log('ERROR! ERROR! ERROR! se genero un error en la ruta POST chatsAsignados', e);
    }
});

app.post('/asignacionSelect', async (req, res) => {
    try {
        const { UserId } = req.body;
        let idPer = Class2.DeCrypt(UserId); 
        let sql = `SELECT PKGES_CODIGO, GES_NUMERO_COMUNICA, GES_CLIENTE_NOMBRE, GES_CLIENTE_EMAIL FROM  ${DB}.tbl_chats_management where  FKGES_NUSU_CODIGO is null  and GES_ESTADO_CASO='OPEN' and GES_CULT_MSGBOT="MSG_FIN" order by PKGES_CODIGO asc limit 1 `;
        let [result] = await db.promise().query(sql);  
        console.log(result);
        console.log('Casos encontrados: ', result.length)
            
        console.log('UserId: ', idPer)


        // ! Validar si hay chats para Asignar
        if (result.length == 0) {

            return res.json({ result, message: 'No hay chats para asignar' });

        }else{

            console.log('Entro al procesos de asignación')

            let autoAsignacion = true;

            //Trae toda la informacion de los usuarios y chats asignados del mismo nivel
            let sqlChatsAsignados = `SELECT * FROM ${DB}.view_asignacion WHERE capacidad > 0 `;
            let [datasqlChatsAsignados] = await db.promise().query(sqlChatsAsignados);
            console.log('Chats Asignados: ', datasqlChatsAsignados.length)
            console.log('Consulta Asignados: ', sqlChatsAsignados)

            if (datasqlChatsAsignados.length < 2) {
                autoAsignacion = true;
            }

            // Encontrar la cantidadAsignados del elemento con IDusuario del mismo usuario
            let cantidadAsignadosUsuario = datasqlChatsAsignados.find(elemento => elemento.IDusuario == idPer).cantidadAsignados;

            console.log('cantidadAsignadosUsuario:', cantidadAsignadosUsuario)
        
            // Verificar si hay otros elementos con diferente IDusuario que tienen más cantidadAsignados
            let otrosElementosConMasAsignados = datasqlChatsAsignados.some(elemento => elemento.IDusuario != idPer && elemento.cantidadAsignados > cantidadAsignadosUsuario);
        
            //True: Hay otro usuario con mas chats, por lo tanto me lo asigno
            //False: No hay usuarios con mas chats, por lo tanto valido si todos tenemos la misma cantidad, si es asi me lo asigno, de lo contrario no

            if (!otrosElementosConMasAsignados) {
                console.log('otrosElementosConMasAsignados')
                autoAsignacion = false;

                //Verificar si todos tienen la misma cantidad de chats
                // Obtener la cantidadAsignados del primer elemento en la lista
                let cantidadAsignadosPrimerUsuario = datasqlChatsAsignados[0].cantidadAsignados;
            
                // Verificar si todos los usuarios tienen la misma cantidadAsignados
                let todosTienenMismaCantidad = datasqlChatsAsignados.every(elemento => elemento.cantidadAsignados == cantidadAsignadosPrimerUsuario);
    

                if (todosTienenMismaCantidad) {
                    autoAsignacion = true;
                }
                else{
                    autoAsignacion = false;
                }
            }else{
                autoAsignacion = true;
            }

            if (autoAsignacion) {
                console.log('Cambio de estado a Attending')
                
                result[0].EnCryptId = Class2.Encrypt(`${result[0].PKGES_CODIGO}`);
                let chatID = result[0].PKGES_CODIGO;
                let updateChat = `UPDATE ${DB}.tbl_chats_management SET FKGES_NUSU_CODIGO = ${idPer}, GES_ESTADO_CASO = 'ATTENDING', GES_CFECHA_ASIGNACION = NOW() WHERE PKGES_CODIGO = ${chatID};`;
                let [resultUpdate] = await db.promise().query(updateChat);

                if (resultUpdate.changedRows) return res.json({ result, message: `Nuevo Chat Asignado ${result[0].GES_NUMERO_COMUNICA}` });
        
                res.json(`La peticion ${req.originalUrl} no hizo una nada`);
            }else{
                res.json(`La peticion ${req.originalUrl} no hizo una nada`);
            }
        }
        
    } catch (e) {
        console.log('ERROR! ERROR! ERROR! se genero un error en la ruta POST asignacionSelect', e);
    }
});

app.post('/verificarChats', async (req, res) => {
    try {
        let { UserId, arrayAttendingChats } = req.body;
        let idPer = Class2.DeCrypt(UserId);

        if (arrayAttendingChats.length < 1) {
            res.json(arrayAttendingChats);
        } else {

            for (let i = 0; i < arrayAttendingChats.length; i++) {
                arrayAttendingChats[i] = parseInt(Class2.DeCrypt(`${arrayAttendingChats[i]}`));
            }

            const sql = `SELECT PKGES_CODIGO FROM ${DB}.tbl_chats_management WHERE FKGES_NUSU_CODIGO=? AND (GES_ESTADO_CASO='ATTENDING' OR GES_ESTADO_CASO='TRANSFERRED');`;
            let [result] = await db.promise().query(sql, [idPer]);

            let arrayAsignados = []
            result.forEach((elem) => {
                arrayAsignados.push(elem.PKGES_CODIGO);
            });
            let arrayChatsCambiados = arrayAttendingChats.filter(f => !arrayAsignados.includes(f));

            for (let i = 0; i < arrayChatsCambiados.length; i++) {
                arrayChatsCambiados[i] = Class2.Encrypt(`${arrayChatsCambiados[i]}`);
            }

            res.json(arrayChatsCambiados);
        }
    } catch (e) {
        console.log('ERROR! ERROR! ERROR! se genero un error en la ruta POST verificarChats', e);
    }
});


app.listen(PORT, () => console.log('Server Asignacion running', PORT));
