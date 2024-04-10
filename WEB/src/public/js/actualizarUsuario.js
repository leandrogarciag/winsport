document.addEventListener("DOMContentLoaded", () => {
  $("select").formSelect();
  
  let rol = document.getElementById("rolUsuario").innerHTML;
  let campana = document.getElementById("campanaUsuario").innerHTML;
  let estado = document.getElementById("estadoUsuario").innerHTML;
  let chats = document.getElementById("cantidadChats").innerHTML;
  //let skill = document.getElementById("skill").innerHTML;

  // console.log(rol)
  // console.log(campana)
  // console.log(estado)
  // console.log(chats)
  // console.log(skill)

  function showSelectOnForm(options, select, dato) {
    options.forEach((elemOption) => {
      if (elemOption.value === dato) {
        elemOption.setAttribute("selected", "true");
      }
    });
    M.FormSelect.init(select);
  }

  function showSelectOnForm2(options, select, dato) {
    let selects = dato.split(",");
    console.log(typeof(dato))
    options.forEach((elemOption) => {
      selects.forEach((val)=>{val == elemOption.attributes.value.value?elemOption.setAttribute("selected", "true"):console.log('chaou')})
    });
    M.FormSelect.init(select);
  }

  const rolOptions = document.querySelectorAll("#usuario_rol option"),
    selectRol = document.getElementById("usuario_rol");
  showSelectOnForm(rolOptions, selectRol, rol);

  const campanaOptions = document.querySelectorAll("#usuario_campana option"),
    selectCampana = document.getElementById("usuario_campana");
  showSelectOnForm(campanaOptions, selectCampana, campana);

  const estadoOptions = document.querySelectorAll("#usuario_estado option"),
    selectEstado = document.getElementById("usuario_estado");
  showSelectOnForm(estadoOptions, selectEstado, estado);

  const chatsOptions = document.querySelectorAll("#usuario_chats option"),
    selectChats = document.getElementById("usuario_chats");
  showSelectOnForm(chatsOptions, selectChats, chats);

/*   const skillOptions = document.querySelectorAll("#usuario_skill option"),
    selectSkill = document.getElementById("usuario_skill");
  showSelectOnForm2(skillOptions, selectSkill, skill); */

  const usuario_nombre = document.getElementById("usuario_nombre");
  inputsMayus([usuario_nombre]);

  const usuario_documento = document.getElementById("usuario_documento");
  inputsMayus([usuario_documento]);

  const usuario_nombreUsuario = document.getElementById("usuario_nombreUsuario");
  inputsMayus([usuario_nombreUsuario]);

  /* const usuario_emailUsuario = document.getElementById("usuario_emailUsuario");
  inputsMayus([usuario_emailUsuario]); */
  
});

