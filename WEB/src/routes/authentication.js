const router = require("express").Router();
const passport = require("passport");
const db = require("../database");
const keys = require("../keys");
const { isNotLoggedIn } = require("../lib/auth");
const { isLoggedIn, error404 } = require('../lib/auth');
//const transporterToken = require("../lib/sendEmail");


router.post("/login", (req, res, next) => {
// router.post("/login", (req, res, next) => {
  passport.authenticate("local.login", {
    successRedirect: "/redirect",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/login",isNotLoggedIn, (req, res) => {
  res.render("auth/login", { title: "Login", login: true });
});


// router.get("/preLogin",isNotLoggedIn, (req, res) => {
//   res.render("auth/preLogin", { title: "Login", login: true });
// });

// //Quitar comentarios o comentar para poner o quitar TOKEN enviado al correo
// router.post("/preLogin", (req, res, next) => {
//   const { username, password } = req.body;
//   var validator = true;
//   if (validator) {  
//     db
//     .promise()
//     .query(`SELECT * FROM ${keys.database.database}.tbl_usuarios WHERE USU_CUSUARIO = '${username}' AND USU_CPASSWORD = '${password}';`)
//     .then(async ([usuario, fields]) => { 
//       if (usuario.length > 0) {
//           if ( usuario[0].USU_CESTADO == "ACTIVO")
//           {
//             let token = '';
//             for (let i = 0; i < 8; i++) {
//               // Generar un dígito aleatorio entre 0 y 9
//               let digito = Math.floor(Math.random() * 10);
//               token += digito;
//             }

//               try {

//                   await transporter.sendMail({
//                       from: '"Validacion Token" <belltrancast@gmail.com>', // sender address
//                       to: usuario[0].USU_CORREO, // list of receivers
//                       subject: "Validacion Token", // Subject line
//                       // text: "Codigo verificacion:    " + token, // plain text body
//                       html: `<!DOCTYPE html">
//                       <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
//                        <head>
//                         <meta charset="UTF-8">
//                         <meta content="width=device-width, initial-scale=1" name="viewport">
//                         <meta name="x-apple-disable-message-reformatting">
//                         <meta http-equiv="X-UA-Compatible" content="IE=edge">
//                         <meta content="telephone=no" name="format-detection">
//                         <title>emal temple rpacos</title><!--[if (mso 16)]>
//                           <style type="text/css">
//                           a {text-decoration: none;}
//                           </style>
//                           <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
//                       <xml>
//                           <o:OfficeDocumentSettings>
//                           <o:AllowPNG></o:AllowPNG>
//                           <o:PixelsPerInch>96</o:PixelsPerInch>
//                           </o:OfficeDocumentSettings>
//                       </xml>
//                       <![endif]--><!--[if !mso]><!-- -->
//                         <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700,700i" rel="stylesheet"><!--<![endif]-->
//                         <style type="text/css">
//                       #outlook a {
//                         padding:0;
//                       }
//                       .ExternalClass {
//                         width:100%;
//                       }
//                       .ExternalClass,
//                       .ExternalClass p,
//                       .ExternalClass span,
//                       .ExternalClass font,
//                       .ExternalClass td,
//                       .ExternalClass div {
//                         line-height:100%;
//                       }
//                       .es-button {
//                         mso-style-priority:100!important;
//                         text-decoration:none!important;
//                       }
//                       a[x-apple-data-detectors] {
//                         color:inherit!important;
//                         text-decoration:none!important;
//                         font-size:inherit!important;
//                         font-family:inherit!important;
//                         font-weight:inherit!important;
//                         line-height:inherit!important;
//                       }
//                       .es-desk-hidden {
//                         display:none;
//                         float:left;
//                         overflow:hidden;
//                         width:0;
//                         max-height:0;
//                         line-height:0;
//                         mso-hide:all;
//                       }
//                       [data-ogsb] .es-button {
//                         border-width:0!important;
//                         padding:15px 25px 15px 25px!important;
//                       }
//                       @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important; border-width:15px 25px 15px 25px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
//                       </style>
//                        </head>
//                        <body style="width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;padding:0;Margin:0">
//                         <div class="es-wrapper-color" style="background-color:#F6F6F6"><!--[if gte mso 9]>
//                             <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
//                               <v:fill type="tile" color="#f6f6f6"></v:fill>
//                             </v:background>
//                           <![endif]-->
//                          <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
//                            <tr style="border-collapse:collapse">
//                             <td valign="top" style="padding:0;Margin:0">
//                              <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
//                                <tr style="border-collapse:collapse">
//                                 <td style="padding:0;Margin:0;background-image:url(https://zornfm.stripocdn.email/content/guids/CABINET_729b6a94015d410538fa6f6810b21b85/images/9701519718227204.jpg);background-position:center top;background-repeat:no-repeat;background-size:cover" bgcolor="#3d4c6b" align="center" background="https://zornfm.stripocdn.email/content/guids/CABINET_729b6a94015d410538fa6f6810b21b85/images/9701519718227204.jpg">
//                                  <table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:640px" cellspacing="0" cellpadding="0" align="center">
//                                    <tr style="border-collapse:collapse">
//                                     <td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px">
//                                      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                        <tr style="border-collapse:collapse">
//                                         <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
//                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                            <tr style="border-collapse:collapse">
//                                             <td align="center" style="padding:0;Margin:0;padding-top:10px;font-size:0px"><a target="_blank" href="https://outsourcingcos.com/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#B7BDC9;font-size:20px"><img class="adapt-img" src="https://outsourcingcos.com/wp-content/themes/COS/img/icons/logo-new.png" alt="New token" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border-radius:3px 3px 0px 0px" title="New token" width="600"></a></td>
//                                            </tr>
//                                          </table></td>
//                                        </tr>
//                                      </table></td>
//                                    </tr>
//                                  </table></td>
//                                </tr>
//                              </table>
//                              <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
//                                <tr style="border-collapse:collapse">
//                                 <td align="center" style="padding:0;Margin:0">
//                                  <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:640px" cellspacing="0" cellpadding="0" align="center">
//                                    <tr style="border-collapse:collapse">
//                                     <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
//                                      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                        <tr style="border-collapse:collapse">
//                                         <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
//                                          <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:3px;background-color:#ffffff" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation">
//                                            <tr style="border-collapse:collapse">
//                                             <td align="center" style="Margin:0;padding-bottom:5px;padding-left:20px;padding-right:20px;padding-top:25px"><h2 style="Margin:0;line-height:34px;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;font-size:28px;font-style:normal;font-weight:bold;color:#444444">${token}</h2></td>
//                                            </tr>
//                                            <tr style="border-collapse:collapse">
//                                             <td align="center" style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#999999;font-size:16px"><span class="product-description"></span>Please use this passcode to sign in to your account.<br><br>This code will expire in 30 minutes.<span class="product-description"></span></p></td>
//                                            </tr>
//                                          </table></td>
//                                        </tr>
//                                      </table></td>
//                                    </tr>
//                                  </table></td>
//                                </tr>
//                              </table>
//                              <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
//                                <tr style="border-collapse:collapse">
//                                 <td align="center" style="padding:0;Margin:0">
//                                  <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#f6f6f6;width:640px" cellspacing="0" cellpadding="0" bgcolor="#f6f6f6" align="center">
//                                    <tr style="border-collapse:collapse">
//                                     <td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px">
//                                      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                        <tr style="border-collapse:collapse">
//                                         <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
//                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                            <tr style="border-collapse:collapse">
//                                             <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0">
//                                              <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                                <tr style="border-collapse:collapse">
//                                                 <td style="padding:0;Margin:0;border-bottom:1px solid #f6f6f6;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
//                                                </tr>
//                                              </table></td>
//                                            </tr>
//                                          </table></td>
//                                        </tr>
//                                      </table></td>
//                                    </tr>
//                                  </table></td>
//                                </tr>
//                              </table>
//                              <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
//                                <tr style="border-collapse:collapse">
//                                 <td align="center" style="padding:0;Margin:0">
//                                  <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#F6F6F6;width:640px">
//                                    <tr style="border-collapse:collapse">
//                                     <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:40px;padding-bottom:40px">
//                                      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                        <tr style="border-collapse:collapse">
//                                         <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
//                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
//                                            <tr style="border-collapse:collapse">
//                                             <td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#999999;font-size:14px">RPA GROUPCOS</p></td>
//                                            </tr>
//                                          </table></td>
//                                        </tr>
//                                      </table></td>
//                                    </tr>
//                                  </table></td>
//                                </tr>
//                              </table></td>
//                            </tr>
//                          </table>
//                         </div>
//                        </body>
//                       </html>`, // html body
//                   });

//                   if(usuario[0]['USU_CAUXILIAR'] == "DISCONNECTED"){
                                                     
//                     const cambiarToken =
//                     {
//                         USU_TOKEN: token
//                     }
//                     sqlToken = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
//                     await db.promise().query(sqlToken,[cambiarToken, usuario[0].PKUSU_NCODIGO]);
                    
//                   }else{

//                     const cambiarToken =
//                     {
//                         USU_TOKEN: token,
//                         USU_CAUXILIAR: "DISCONNECTED"
//                     }
//                     sqlToken = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
//                     await db.promise().query(sqlToken,[cambiarToken, usuario[0].PKUSU_NCODIGO]);

//                   }

//                   sqlBorrarSesiones = "DELETE FROM " + keys.database.database + ".sessions WHERE data like '%"+usuario[0].USU_CDOCUMENTO+"%'and data like '%"+usuario[0].USU_CUSUARIO+"%';"
//                   await db.promise().query(sqlBorrarSesiones);

//                   res.render("auth/login", {nombreDeUsuario: username, title:"Login", login:true});
      
//               } catch (error) {
//                   console.log("mensajee no enviado");
//                   req.flash("messageError", "The authentication mail could not send, please contact the administrator.");
//                   console.log(error);
//                   res.redirect("/preLogin");
//               }
                        
//           } else
//           {
//             req.flash("messageError", "Disabled user");
//             res.redirect("/preLogin");
//           }
//       } else 
//       {
//         req.flash("messageError", "Incorrect username or password");
//         res.redirect("/preLogin");
//       }
//   });                
// }}
// );

router.get("/redirect", isLoggedIn,(req, res, next) => {
  if (req.user.Rol == "SUPERVISOR" || req.user.Rol == "ADMINISTRADOR") {
    res.redirect("/dashboard");
  } else if (req.user.Rol == "AGENTE") {
    res.redirect("/mensajeria");
  }else if (req.user.Rol == "REPORTING") {
    res.redirect("/reportes/reporteInteracciones");
  }
});

router.get("/logout", isLoggedIn, async(req, res) => {

  // consultar si tiene chats siendo atendidos por el usuario 
  let sqlChatsActivos="SELECT count(PKGES_CODIGO) as ChatsAbiertos FROM " + keys.database.database +".tbl_chats_management where FKGES_NUSU_CODIGO=? AND GES_ESTADO_CASO='ATTENDING'";
  let [datasqlChatsActivos] = await db.promise().query(sqlChatsActivos,[ req.user.PKusu]);
  
  // validar si tiene chats atendiendo
  if(datasqlChatsActivos[0].ChatsAbiertos >0){
    console.log('Hay chats siendo atendidos por este usuario ',datasqlChatsActivos[0].ChatsAbiertos);
    req.flash("messageWarning", "There are chats being attended by you");
    res.redirect("/mensajeria");
  }else{
    //si no tiene chats siendo atendidos puede cerrar sesion
    const cambiarEstado =
    {
      USU_CAUXILIAR: "DISCONNECTED"
    }
    sqlCambiarEstado = "UPDATE " + keys.database.database + ".tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ? ;";
    console.log("En logout")
    console.log(cambiarEstado)
    console.log(req.user.PKusu)
    let [datasqlCambiarEstado] = await db.promise().query(sqlCambiarEstado,[cambiarEstado, req.user.PKusu]);

    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  }


  
});

module.exports = router;
