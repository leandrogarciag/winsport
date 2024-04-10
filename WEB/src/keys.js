var Class2 = require("./public/js/Class2");

IPServidor = Class2.DeCrypt('41785A3245774C6D41775232446D4C3441784C335A6D7030') //localhost
UsuarioServidor = Class2.DeCrypt('41775A324577706D41484C325A6D706C4178443D')  // por defecto
ContrasenaServidor = Class2.DeCrypt('417770324147706D416D443242474D5441784832416D4C31417848324147706C41775232446D4C6D41784C335A6D414F5A6D566D5A515A6C5A6D4E3D') // por defecto
BaseDatosServidor = Class2.DeCrypt('417744325A77706A41484C33416D4C344177523341514954416D703242474D53416D5A335A514D54416D5633414E3D3D') //Especifico para cada proyecto
Puerto = 3306

//Variables de usuario active directorty
const url = 'LDAP://172.70.7.11:389'
const baseDN = 'dc=groupcos,dc=com'
const username = ''
const password = ''

module.exports = {
  database: {
    host: IPServidor,
    port : Puerto,
    user: UsuarioServidor,
    password: ContrasenaServidor,
    database: BaseDatosServidor,
  },
  config: {
    url: url,
    baseDN: baseDN,
    username: username,
    password: password,
  },
  
  CONNECTLY_BUSSINES_ID: 'befcf1e6-7362-44ff-b14e-374f0a21d749' ,
  CONNECTLY_API_KEY: 'kiKesJIAkz/ArdoHvrXo+iJmtt1yK9/iD3FJAlzLB2U=',

  // NO OLVIDAR VER EL ARCHIVO public/js/custom/configClient.js

};
