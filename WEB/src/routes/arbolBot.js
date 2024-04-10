const router = require('express').Router();
const db = require('../database');
const path = require('path');
const { userInfo } = require('os');
const { database } = require('../keys');
const { isAgente } = require('../lib/auth');
const Class2 = require('../Class2');
const DB = database.database;
const fs = require('fs');
const { chmodSync } = require('fs-chmod');
const { isAdministrator } = require("../lib/auth");
var request = require('request');
require('colors');
const tabla_arbol ="tbl_bot_tree"


router.get("/arbolBot", isAdministrator, async (req, res) => {
  try {
    const sqlArbol= `SELECT * FROM ${DB}.${tabla_arbol} WHERE BTREE_ESTADO='ACTIVO'`;
  db.promise()
    .query(sqlArbol)
    .then(([resultArbol, fields]) => {
   
      for (let i = 0; i < resultArbol.length; i++) {
        resultArbol[i].EnCrypt = Class2.EnCrypt(`${resultArbol[i].PKBTREE_NCODIGO}`);
      }
      
      res.render("app/arbolBot", { title: "Árbol BOT", arbol: resultArbol});
    })
  } catch (error) {
    console.log("ERROR::", error);
  }
  
 
});

router.get("/actualizarTextoGuionBOT/:id", isAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log('id',id);
    const sqlTextoGuion= `SELECT * FROM ${DB}.${tabla_arbol} WHERE PKBTREE_NCODIGO=?`;
    db.promise()
      .query(sqlTextoGuion,id)
      .then(([resultTextoGuion, fields]) => {
        console.log('resultTextoGuion',resultTextoGuion);
        
        res.render("app/actualizarTextoGuionBOT", { title: "Editar Texto Guion BOT", texto:resultTextoGuion[0],idTextEncrypt:req.params.id});
      })
  } catch (error) {
    console.log("ERROR::", error);
  }
 
    
});

router.post("/actualizarTextoGuionBOT", isAdministrator, async (req, res) => {
  try {
    
    const { idText, textoBot } = req.body;
    let id = Class2.DeCrypt(idText);
    console.log("entro",id);
    console.log("textoBot",textoBot);

    const updateTextBot = {
      BTREE_TEXTO: textoBot,
    };

    const sqlTextoGuion = `UPDATE ${DB}.${tabla_arbol} SET ?  WHERE PKBTREE_NCODIGO=?`;
    await db.promise().query(sqlTextoGuion, [updateTextBot, id]);

    // req.flash("messageSuccess", `Text modified successfully`);
    // res.redirect("/textoBot/arbolBot");
    res.json('ok')
  } catch (error) {
    console.log("ERROR:", error);
  }
  
});



module.exports = router;