document.addEventListener('DOMContentLoaded', () => {

  const nombreDeUsuario = document.getElementById('userUsuario').innerText;
  // const authToken = document.getElementById('authToken').innerText;
  const skill = document.getElementById('userSkill').innerText;

  var idPer = '';
  const btnSendFile = document.getElementById('btnSendFile');
  //adjuntos
  let arrayPrueba = [];
  localStorage.setItem('AttendingChats', JSON.stringify(arrayPrueba));

  function getId() {
    getData('mensajeria/getId').then((res) => {
      let idPer = res.idPer;
      localStorage.setItem('UserId', idPer);

      //SIEMPRE QUE ENTRE EL USUARIO VA A ESTAR ACTVIO PERO PRIMERO DEBE VALIDAR SI TIENE UN ESTADO ANTERIOR
      //SI ES NULO SIGNIFICA QUE NO SE LE HA ASIGNADO NADA Y LO PONE COMO EN ESTADO ACTIVO
      //SI SIGNIFICA QUE SI REFRESCA LA PÁGINA NO VA A PERDER EL ESTADO EN EL QUE ESTA, DE OTRA FORMA LO ASIGNA EN ACTIVO
    });
  }
  getId();

  function cantidadChats() {
    getData('mensajeria/cantidadChats').then((res) => {
      let chatsAllowed = res.ChatsNumber;
      localStorage.setItem('chatsAllowed', chatsAllowed);
    });
  }
  cantidadChats();

  // ! Enviar Adjunto
  btnSendFile.addEventListener('click', () => {
    console.log("entreeeeeeeeeeeeeeeeeeeeeeeee")
    const inputAddFile = document.getElementById('inputAddFile');
    let Media = inputAddFile.files[0];
    let fileSize = inputAddFile.files[0].size;
    let formData = new FormData();
    if (fileSize > 25000000) {
      alert('el archivo supera las 25 megas, IMPOSIBLE ENVIAR');
      return;
    }

    // * Send File
    formData.append('Media', Media);
    formData.append('To', localStorage.getItem('numChatActual'));
    formData.append('GestionID', localStorage.getItem('idChatActual'));
    formData.append('body', '');
    formData.append('usuario', nombreDeUsuario);
    formData.append('nombreDeUsuario', nombreDeUsuario);
    // formData.append('authToken', authToken);

    fetch(serverEnviarMensajes + '/sendMessage', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
        showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
      });
  });

  const countNumberChats = () => {
    let arrayAttendingChats = [];
    arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
    // let existchata = arrayAttendingChats.includes('5A6D786D414E3D3D');

    let chatsAllowed = localStorage.getItem('chatsAllowed'); //se trae la cantidad de chats permitidos

    let UserId = localStorage.getItem('UserId');
    //capturamos el div que contiene el array de los chats para saber que cantidad de chats tiene el agente actualmente
    let sectionChatMenu = document.getElementById('sectionChatMenu');
    const chatsNumber = sectionChatMenu.children.length; //cantidad de chats
    const nameUserEstado = document.getElementById('nameUserEstado');

    //verificar estado de usuario
    if (nameUserEstado.textContent === 'ONLINE') {
      //verificar si la cantidad de chats es menor al tope permitido
      if (chatsNumber < chatsAllowed ) {
        //traer chats ATTENDING o en estado TRANSFERRED
        postData(serverAsignacion + '/chatsAsignados', { UserId, arrayAttendingChats, nombreDeUsuario }).then(async (res) => {
          if (res.result.length > 0) {
            // console.log("pintando los chats")
            if (res.TRANSFERRED) Swal.fire('Message!', document.querySelector('[data-i18n="Se le ha transferido el chat"]').textContent + ' ' + res.result[0].GES_NUMERO_COMUNICA, 'success');
            let mensaje = res.result[0];
            // console.log(mensaje.PKGES_CODIGO)
            let existchat = arrayAttendingChats.includes(mensaje.EnCryptId);

            if (existchat == false) {
              let htmlChat = document.createElement('div');
              htmlChat.setAttribute('id', mensaje.EnCryptId);

              htmlChat.innerHTML = `
                    <div class="chat-user animate fadeUp delay-2" onclick="shwoConversation('${mensaje.EnCryptId}','${mensaje.GES_NUMERO_COMUNICA}','${mensaje.PKGES_CODIGO}', '${mensaje.GES_CLIENTE_NOMBRE}', '${mensaje.GES_CLIENTE_EMAIL}')">
                      <div class="user-section">
                        <div class="row valign-wrapper">
                          <div class="col s2 media-image online pr-0">
                            <i class="material-icons circle z-depth-2 responsive-img" style="font-size: 35px;color:#276E90;">account_circle</i>
                          </div>
                          <div class="col s10">
                            <p class="m-0 blue-grey-text text-darken-4 font-weight-700">${mensaje.GES_NUMERO_COMUNICA} </p>
                            <p class="m-0 info-text"></p>
                          </div>
                        </div>
                      </div>
                      <div class="info-section">
                        <div class="star-timing">
                          <div class="time"><span></span></div>
                        </div>
                        
                      </div>
                    </div>
                    `;

              sectionChatMenu.appendChild(htmlChat);

              arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
              arrayAttendingChats.push(mensaje.EnCryptId.toString());
              localStorage.setItem('AttendingChats', JSON.stringify(arrayAttendingChats));
            }
          } else {
            postData(serverAsignacion + '/asignacionSelect', { UserId, nombreDeUsuario }).then(async (res) => {
              //console.log('recibe de asignacion select',res);
              if (res.result.length > 0) {
                let mensaje = res.result[0];
                let existchat = arrayAttendingChats.includes(mensaje.EnCryptId);
                if (existchat == false) {
                  let htmlChat = document.createElement('div');
                  htmlChat.setAttribute('id', mensaje.EnCryptId);

                  htmlChat.innerHTML += `
                            <div class="chat-user animate fadeUp delay-2"  onclick="shwoConversation('${mensaje.EnCryptId}','${mensaje.GES_NUMERO_COMUNICA}','${mensaje.PKGES_CODIGO}', '${mensaje.GES_CLIENTE_NOMBRE}', '${mensaje.GES_CLIENTE_EMAIL}')">
                              <div class="user-section">
                                <div class="row valign-wrapper">
                                  <div class="col s2 media-image online pr-0">
                                    <i class="material-icons circle z-depth-2 responsive-img" style="font-size: 35px;color:#276E90;">account_circle</i>
                                  </div>
                                  <div class="col s10">
                                    <p class="m-0 blue-grey-text text-darken-4 font-weight-700">${mensaje.GES_NUMERO_COMUNICA} </p>
                                    <p class="m-0 info-text"></p>
                                  </div>
                                </div>
                              </div>
                              <div class="info-section">
                                <div class="star-timing">
                                  <div class="time"><span></span></div>
                                </div>
                              </div>
                            </div>
                            `;

                  sectionChatMenu.appendChild(htmlChat);
                  arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
                  arrayAttendingChats.push(mensaje.EnCryptId.toString());
                  localStorage.setItem('AttendingChats', JSON.stringify(arrayAttendingChats));
                }
              } else {
                let isCheckingChats = false; // Variable de estado para controlar si se está verificando chats

                  if (arrayAttendingChats.length > 0 && !isCheckingChats) {
                      isCheckingChats = true;
                  postData(serverAsignacion + '/verificarChats', { UserId, arrayAttendingChats, nombreDeUsuario }).then(async (res) => {
                  //  console.log(" verificacion 1");
                    //console.log('res',res);
                    if (res.length > 0) {
                      let sectionChatMenu = document.getElementById('sectionChatMenu');
                      const mainContainerChat = document.getElementById('mainContainerChat');
                      const mainContainerTipificar = document.getElementById('mainContainerTipificar');

                      res.forEach((elem) => {
                        try {
                          //console.log(elem);
                          let chat = document.getElementById(elem);
                          sectionChatMenu.removeChild(chat);

                          let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
                          let filterChats = arrayAttendingChats.filter((item) => item !== elem);
                          localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
                        } catch (error) {
                          console.log("El chat " + elem + " no se puede eliminar por que no existe, error : " + error);
                        }
                        

                      });
                      mainContainerChat.innerHTML = ``;
                      mainContainerTipificar.innerHTML = ``;

                      M.toast({ html: document.querySelector('[data-i18n="Chats actualizados por supervisor"]').textContent });
                      isCheckingChats = false;
                    }
                  });
                }
              }
            });
          }
        });
      } else {

        postData(serverAsignacion + '/chatsAsignados', { UserId, arrayAttendingChats, nombreDeUsuario }).then(async (res) => {
          if (res.result.length > 0) {
            // console.log("se pintan aqui los chats")
            if (res.TRANSFERRED) Swal.fire('Message!', document.querySelector('[data-i18n="Se le ha transferido el chat"]').textContent + ' ' + res.result[0].GES_NUMERO_COMUNICA, 'success');
            let mensaje = res.result[0];
            let existchat = arrayAttendingChats.includes(mensaje.EnCryptId);

            if (existchat == false) {
              let htmlChat = document.createElement('div');
              htmlChat.setAttribute('id', mensaje.EnCryptId);

              htmlChat.innerHTML = `
                    <div class="chat-user animate fadeUp delay-2" onclick="shwoConversation('${mensaje.EnCryptId}','${mensaje.GES_NUMERO_COMUNICA}','${mensaje.PKGES_CODIGO}', '${mensaje.GES_CLIENTE_NOMBRE}', '${mensaje.GES_CLIENTE_EMAIL}')">
                      <div class="user-section">
                        <div class="row valign-wrapper">
                          <div class="col s2 media-image online pr-0">
                            <i class="material-icons circle z-depth-2 responsive-img" style="font-size: 35px;color:#276E90;">account_circle</i>
                          </div>
                          <div class="col s10">
                            <p class="m-0 blue-grey-text text-darken-4 font-weight-700">${mensaje.GES_NUMERO_COMUNICA} </p>
                            <p class="m-0 info-text"></p>
                          </div>
                        </div>
                      </div>
                      <div class="info-section">
                        <div class="star-timing">
                          <div class="time"><span></span></div>
                        </div>
                        
                      </div>
                    </div>
                    `;

              sectionChatMenu.appendChild(htmlChat);

              arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
              arrayAttendingChats.push(mensaje.EnCryptId.toString());
              localStorage.setItem('AttendingChats', JSON.stringify(arrayAttendingChats));
            }
          }
        });

        if (arrayAttendingChats.length > 0) {
          postData(serverAsignacion + '/verificarChats', { UserId, arrayAttendingChats, nombreDeUsuario }).then(async (res) => {
            //console.log('res',res);
             //console.log(" verificacion 2");
            if (res.length > 0) {
              let sectionChatMenu = document.getElementById('sectionChatMenu');
              const mainContainerChat = document.getElementById('mainContainerChat');
              const mainContainerTipificar = document.getElementById('mainContainerTipificar');

              res.forEach((elem) => {
                try {
                  //console.log(elem);
                  let chat = document.getElementById(elem);
                  sectionChatMenu.removeChild(chat);

                  let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
                  let filterChats = arrayAttendingChats.filter((item) => item !== elem);
                  localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
                } catch (error) {
                  console.log("El chat " + elem + " no se puede eliminar por que no existe, error : " + error);
                }


              });
              mainContainerChat.innerHTML = ``;
              mainContainerTipificar.innerHTML = ``;

              M.toast({ html: document.querySelector('[data-i18n="Chats actualizados por supervisor"]').textContent });
            }
          });
        }
      }
    }

    // ! Repeat
    setTimeout(() => {
      countNumberChats();
    }, 1500);
  };

  countNumberChats();
});
