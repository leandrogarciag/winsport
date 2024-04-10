const nodemailer = require("nodemailer");
const db = require("../database");
const keys = require("../keys");

const transporterToken = async () => {
    let [data] = await db.promise().query(`SELECT * FROM ${keys.database.database}.tbl_config_mail WHERE CON_ESTADO = 'ACTIVO' ORDER BY idtbl_config_mail DESC LIMIT 1`)

    // console.log(data)

    transporter = nodemailer.createTransport({
        host: data[0].CON_HOST,
        port: data[0].CON_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: data[0].CON_USER, // generated ethereal user
            pass: data[0].CON_PASS, // generated ethereal password
        },
    });

    transporter.verify().then(() => {
        console.log('listo para enviar email');
    }).catch((err) => console.log("ERROR::", err));
    
    return transporter
}

module.exports = transporterToken()