document.addEventListener('DOMContentLoaded', () => {
  const clickEvent = new Event('click');
  document.dispatchEvent(clickEvent);
  var elemsSelect = document.querySelectorAll('.select');
  M.FormSelect.init(elemsSelect);
  var modal = document.querySelectorAll('.modal');
  M.Modal.init(modal);
  localStorage.setItem('idChatActual', '');
  const btnEstadoUser = document.querySelectorAll('.estadoUser');
  const nameUserEstado = document.getElementById('nameUserEstado');
  //traducir placeholder para buscar chat
  document.getElementById("PlantillaChatOutBound").options[0].textContent = document.querySelector('[data-i18n="Escribe un mensaje para el agente"]').textContent
  // fin traduccion
  $("select").formSelect();
  for (let i = 0; i < btnEstadoUser.length; i++) {
    btnEstadoUser[i].style.color = 'black';
    btnEstadoUser[i].addEventListener('click', function () {
      let estadoUser = btnEstadoUser[i].textContent.toUpperCase();
      nameUserEstado.innerHTML = `${estadoUser}`;
      // btnEstadoUser[i].style.color='#00B347';
      postData('mensajeria/estadosUser', { estadoUser }).then(async (res) => { });
    });
  }
  const traerPlantillas = () => {
    getData('mensajeria/traerPlantillas').then(async (res) => {
      //console.log('res PLANTILLAS',res);
      if (res.length > 0) localStorage.setItem('plantillas', JSON.stringify(res));
    });
  };
  traerPlantillas();
  // ! revisar mensajes nuevos de todos los chats de agente para dar alerta
  const checkNewMessages = async () => {
    try {
      const attendingChats = JSON.parse(localStorage.getItem('AttendingChats')); await showAlertNewMessages(attendingChats);
    } finally {
      idInterval1 = setTimeout(() => {
        checkNewMessages();
      }, 3000);
    }
  };
  checkNewMessages()
});
let idInterval;
const nombreDeUsuario = document.getElementById('userUsuario').innerText;
//const authToken = document.getElementById('authToken').innerText;
// const skill = document.getElementById('userSkill').innerText;
// Cargar plantillas provident By Roger
/* const traerPlantillas = async () => {  
  const Variable_Nombre = document.getElementById('nameCliente').value;
  const Variable_Telefono = document.getElementById('telefono').value;
  const Variable_CRM_ID = document.getElementById('crm_id').value;
  const Variable_Fecha_Nacimiento = document.getElementById('fecha_nacimiento').value;
  const Variable_Direccion = document.getElementById('direccion').value;
  const Variable_Oferta = document.getElementById('oferta').value;
  const Variable_Plazo = document.getElementById('plazo').value;
  if ( 
    Variable_Nombre == '' ||
    Variable_Telefono == '' ||
    Variable_CRM_ID == '' ||
    Variable_Fecha_Nacimiento == '' ||
    Variable_Direccion == '' ||
    Variable_Oferta == '' ||
    Variable_Plazo == '' ) {
      M.toast({ html: "Campos vacios, Intenta de nuevo!"})
  } else {
    const data = {
      Variable_Nombre,
      Variable_Telefono,
      Variable_CRM_ID,
      Variable_Fecha_Nacimiento,
      Variable_Direccion,
      Variable_Oferta,
      Variable_Plazo
    }    
    // console.log(data);
    const res = await postData('mensajeria/traerPlantillas', {data: data})
    if (res.length > 0) localStorage.setItem('plantillas', JSON.stringify(res));
    const verPlantillas = document.getElementById('verPlantillas');
    verPlantillas.style.display = 'block';
  };
}; */

function checkScrollPosition(chatID, cellPhoneNumber) {

  var chatWindow = document.querySelector('.chat-area.ps.ps--active-y');
  var oldHeight = chatWindow.scrollHeight;
  let oldChatsWindow = document.createElement('div');
  oldChatsWindow.setAttribute('class', 'chats');
  oldChatsWindow.setAttribute('id', 'chatContaineroldchats');
  oldChatsWindow.setAttribute('style', 'overflow-y:auto');

  if (chatWindow.scrollTop === 0) {
    localStorage.setItem('idChatActual', chatID);
    let idfirstmessage = localStorage.getItem('idfirstmessage');
    postData(serverConsultarMensajes + '/ActualizarMensajesAntiguos', {
      chatID, nombreDeUsuario, idfirstmessage
    }).then(async (res) => {
      let conversations = res.conversation;


      if (conversations.length > 0) {
        localStorage.setItem('idfirstmessage', conversations[0].PK_MES_NCODE);
      }
      let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
        arrVideoTypes = ['mp4', 'mpeg'],
        arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
        arrAudioTypes = ['ogg', 'oga', 'mp3'];

      for (let i = 0; i < conversations.length; i++) {
        let MES_MEDIA_TYPE = conversations[i].MES_MEDIA_TYPE,
          MES_MEDIA_URL = conversations[i].MES_MEDIA_URL,
          MES_MESSAGE_ID = conversations[i].MES_MESSAGE_ID,
          MES_BODY = conversations[i].MES_BODY,
          isFileImg = false,
          isFileDoc = false,
          isFileVideo = false,
          isFileAudio = false;

        if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
        if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
        if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
        if (MES_MEDIA_TYPE !== null && arrAudioTypes.includes(MES_MEDIA_TYPE)) isFileAudio = true;

        if (conversations[i].MES_CHANNEL == 'RECEIVED') {
          oldChatsWindow.innerHTML += `
                      <div class="chat">
                          <div class="chat-body">
                              <div class="chat-box">
                                  <div class="chat-text${isFileAudio ? 'F' : ''}" 
                                      ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px; display: flex; flex-direction: column"' : ''}>
                                      ${MES_MEDIA_TYPE !== null && isFileImg
              ? `<img href="#modalZoomImg" onclick="imgZoom('${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}')" class="imgChatReceive modal-trigger" src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" style="cursor:pointer;" /> </br> 
                                             ${MES_BODY === '' ? '' : `<p>${MES_BODY}</p>`}
                                             <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
              : MES_MEDIA_TYPE !== null && isFileDoc
                ? `<p><a target="_blank" href="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}"=><b>File <i class="bx bx-file"></i></b></a></p>
                                                 <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
                : MES_MEDIA_TYPE !== null && isFileAudio
                  ? `<audio src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" type="audio/mp3" controls></audio>
                                                 <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
                  : MES_MEDIA_TYPE !== null && isFileVideo
                    ? `<video src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" width="320" height="240" type="audio/mp3" controls></video>
                                                 <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
                    : `
                                              <div class="chat-box">
                                                  <p class='p-msg'>${conversations[i].MES_BODY}</p>
                                                  <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>
                                              </div>`
            }
                                  </div>
                              </div>
                          </div>
                      </div>`;
        } else if (conversations[i].MES_CHANNEL == 'SEND') {
          oldChatsWindow.innerHTML += `
                      <div class="chat chat-right">
                          <div class="chat-body">
                              <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px"' : ''}>
                                  ${MES_MEDIA_TYPE !== null && isFileImg ? `<img href="#modalZoomImg" onclick="imgZoom('${MES_MEDIA_URL}')" class="imgChatSend modal-trigger" src="${MES_MEDIA_URL}" style="cursor:pointer;" />`
              : MES_MEDIA_TYPE !== null && isFileDoc ? `<p><a style="color:white" target="_blank" href="${MES_MEDIA_URL}"=><b>File <i class="bx bx-file"></i></b></a></p>`
                : MES_MEDIA_TYPE !== null && isFileAudio ? `<audio src="${MES_MEDIA_URL}" type="audio/mp3" controls></audio>`
                  : MES_MEDIA_TYPE !== null && isFileVideo ? `<video src="${MES_MEDIA_URL}" width="320" height="240" type="audio/mp3" controls></video>`
                    : `<div class="chat-box">
                                              <p class='p-msg'>${conversations[i].MES_BODY}</p>
                                              <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>
                                          </div>`}
                              </div>
                          </div>
                      </div>`;
        } else if (conversations[i].MES_CHANNEL == 'ADMIN') {
          oldChatsWindow.innerHTML += `
                      <div class="chat chatRecibidoAdminAgente">
                          <div class="chat-body">
                              <div class="chat-text">
                                  <div class="chat-box">
                                      <p class='p-msg'>${conversations[i].MES_BODY}</p>
                                      <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>
                                  </div> 
                              </div>
                          </div>
                      </div>`;
        }
      }
      chatWindow.insertBefore(oldChatsWindow, chatWindow.firstChild);
      chatWindow.scrollTop = (chatWindow.scrollHeight - oldHeight) - 30;
    });
  }
}

const cerrarChat = async () => {
  // console.log('entra a cerrar chat');
  // const chatIDHeader = document.getElementById('chatIDHeader').textContent;
  const chatIDHeader = localStorage.getItem('idChatActual');
  const numChatActual = localStorage.getItem('numChatActual');
  const res = await postData('mensajeria/cerrarChat', { chatIDHeader: chatIDHeader });
  if (res == 'ok') {
    let sectionChatMenu = document.getElementById('sectionChatMenu');
    const mainContainerChat = document.getElementById('mainContainerChat');
    const mainContainerTipificar = document.getElementById('mainContainerTipificar');
    const chat = document.getElementById(chatIDHeader);
    sectionChatMenu.removeChild(chat);
    mainContainerChat.innerHTML = ` <div style="width: 100%; height:100%;display:flex;align-items:center;justify-content: center"><img style="max-width: 35%; max-height: 30%;" src="/images/logo/logo_claro.png" alt="fondo" /></div>`;
    mainContainerTipificar.innerHTML = ``;
    const chatID = localStorage.getItem('idChatActual');
    let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
    const filterChats = arrayAttendingChats.filter((item) => item !== chatID);
    localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
    // ENCUESTA
    //let messageToSend = "Desde *CLARO* nos interesa su opinión frente a la atención recibida.\n\n¿Su problema ha sido resuelto?\n1. Si\n2. No"
    //SIN ENCUESTA
    let messageToSend = "Gracias por preferir nuestros servicios.";
    M.toast({ html: document.querySelector('[data-i18n="Chat cerrado con éxito"]').textContent });
    postData(serverEnviarMensajes + '/sendMessage', { To: numChatActual, body: messageToSend, GestionID: chatIDHeader, usuario: nombreDeUsuario, nombreDeUsuario }).then(async (resMessage) => {
      // document.getElementById('message_to_send').value = '';
      // console.log('entra a enviar mensaje de encuesta',resMessage);
      if (resMessage == 'more than 24 hours have passed since the customer last replied') {
        // M.toast({ html: 'La ventana de 24 horas ha finalizado' });
        console.log("La ventana de 24 horas ha finalizado");
      } else if (resMessage != 'Mensaje Enviado') {
        M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
        // M.toast({ html: resMessage});
      }
      showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
    });
    const inputMessage = document.getElementById('messageToSend');
    if (inputMessage) {
      inputMessage.value = '';
    }
  } else {
    console.log('No se cumple')
  }
  // document.getElementById('message_to_send').value = '';
};
// ! Zoom imagen
function imgZoom(MES_MEDIA_URL) {
  // console.log('entra a imgZoom',MES_MEDIA_URL);
  const modalZoomImg = document.getElementById('modalZoomImg');
  let modalContent = document.createElement('div');
  let modalFooter = document.createElement('div');
  modalContent.setAttribute('class', 'modal-content');
  modalFooter.setAttribute('class', 'modal-footer');
  modalZoomImg.innerHTML = ``;
  // const main = document.getElementById('main');
  // let containerImg = document.createElement('div');
  // containerImg.setAttribute('style', 'border: 1px solid black;position:fixed');
  modalContent.innerHTML = `
    <div style="width:100%; height:100%">
      <img  style=""  src="${MES_MEDIA_URL}" />   
    </div>
  `;
  modalFooter.innerHTML = `
      <a class="modal-close waves-effect waves-green btn-flat"><span data-i18n="Cerrar">Cerrar</span></a>
  `;
  modalZoomImg.appendChild(modalContent);
  modalZoomImg.appendChild(modalFooter);
}
//enviar mensaje
function sendMessage(cellPhoneNumber, gestionID) {
  const inputMessage = document.getElementById('messageToSend'),
    messageToSend = inputMessage.value;
  if (messageToSend.length > 0) {
    postData(serverEnviarMensajes + '/sendMessage', { To: cellPhoneNumber, body: messageToSend, GestionID: gestionID, usuario: nombreDeUsuario, nombreDeUsuario }).then(async (resMessage) => {
      // document.getElementById('message_to_send').value = '';
      // console.log('entra a enviar mensaje1',resMessage);
      if (resMessage == 'more than 24 hours have passed since the customer last replied') {
        // M.toast({ html: 'La ventana de 24 horas ha finalizado' });
        console.log("La ventana de 24 horas ha finalizado");
      } else if (resMessage != 'Mensaje Enviado') {
        M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
        // M.toast({ html: resMessage});
      }
      showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
    });
    inputMessage.value = '';
  }
}
const shwoInfoUser = (cellPhoneNumber) => {
  // console.log(cellPhoneNumber)
  const modalInfoCliente = document.getElementById('modalInfoCliente');
  let modal = document.createElement('div');
  let modalFooter = document.createElement('div');
  modal.setAttribute('class', 'modal-content');
  modalFooter.setAttribute('class', 'modal-footer');
  modalInfoCliente.innerHTML = ``;
  // console.log(cellPhoneNumber);
  postData('mensajeria/searchInfoUser', { cellPhoneNumber: cellPhoneNumber }).then(async (res) => {
    //console.log(res)
    if (res.infoCliente.length > 0) {
      modal.innerHTML = `
      <h4 data-i18n="Informacion del cliente">Información del cliente</h4>
          <div class="row">
              <div class="input-field col s12">
                  <i class="material-icons prefix">account_box</i>
                  <input id="ModalCelClient" type="tel" class="validate" disabled
                      value="${res.infoCliente[0].CLI_NAME}">
                  
              </div>              
              <div class="input-field col s6">
                  <i class="material-icons prefix">phone</i>
                  <input id="ModalCelClient" type="tel" class="validate" disabled
                      value="${res.infoCliente[0].CLI_CELLPHONE_NUMBER}">
                  
              </div>
              <div class="input-field col s6">
                  <i class="material-icons prefix">mail</i>
                  <input id="ModalCorreoClient" type="tel" class="validate" value="${res.infoCliente[0].CLI_EMAIL}" disabled>
                  
              </div>
              <h5><center>Histórico Gestiones</center></h5>
          </div>
      `;
      if (res.chatClient.length > 0) {
        modal.innerHTML += `
        <div id="view-collaps">
          <div class="row">
            <div class="col s12">
                <ul id="listaHistoricoChats" class="collapsible" data-collapsible="accordion">
                
                </ul>
            </div>
          </div>
        </div>`;
        modalInfoCliente.appendChild(modal);
        for (let index = 0; index < res.chatClient.length; index++) {
          let ul = document.querySelector('#listaHistoricoChats');
          let li = document.createElement('li');
          let headerDiv = document.createElement('div');
          headerDiv.classList.add('collapsible-header', 'row');
          headerDiv.textContent = `ID GESTIÓN:  ${res.chatClient[index].idGestion} - ${res.chatClient[index].PKGES_CODIGO} | FECHA GESTIÓN: ${res.chatClient[index].GES_CHORA_INICIO_GESTION}`;
          let bodyDiv = document.createElement('div');
          bodyDiv.classList.add('collapsible-body', 'row');
          headerDiv.addEventListener('click', async () => {
            postData('mensajeria/chatContent', { gestionId: res.chatClient[index].PKGES_CODIGO }).then(async (res) => {
              //console.log(res)
              bodyDiv.innerHTML = '';
              for (let index2 = 0; index2 < res.contentChat.length; index2++) {
                if (res.contentChat[index2].MES_CHANNEL == "RECEIVED") {
                  let receivedBody = document.createElement('div');
                  receivedBody.classList.add('chatRecibido', 'col', 's10', 'mt-1', 'mb-1');
                  let chatBody = document.createElement('div');
                  chatBody.classList.add('chat-body');
                  let chatText = document.createElement('div');
                  chatText.classList.add('chat-text');
                  let chatTextP = document.createElement('p');
                  chatTextP.textContent = res.contentChat[index2].MES_BODY;
                  chatText.appendChild(chatTextP)
                  chatBody.appendChild(chatText)
                  receivedBody.appendChild(chatBody)
                  bodyDiv.appendChild(receivedBody)
                } else if (res.contentChat[index2].MES_CHANNEL == "SEND") {
                  let sendBody = document.createElement('div');
                  sendBody.classList.add('chatEnviado', 'col', 's10', 'offset-s2', 'mt-1', 'mb-1');
                  let chatBody = document.createElement('div');
                  chatBody.classList.add('chat-body');
                  let chatText = document.createElement('div');
                  chatText.classList.add('chat-text');
                  let chatTextP = document.createElement('p');
                  chatTextP.textContent = res.contentChat[index2].MES_BODY;
                  chatText.appendChild(chatTextP)
                  chatBody.appendChild(chatText)
                  sendBody.appendChild(chatBody)
                  bodyDiv.appendChild(sendBody)
                }
              }
            })
          })
          li.appendChild(headerDiv);
          li.appendChild(bodyDiv);
          ul.appendChild(li);
        }
      }
      modalFooter.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat"><span data-i18n="Cerrar"><span data-i18n="Cerrar">Cerrar</span></span></a>
      `;
      // modalFooter.innerHTML = `
      // <a class="modal-close waves-effect waves-green btn-flat" onclick="updateInfoClient('${cellPhoneNumber}','${res[0].EnCryptId}');">Actualizar</a>
      // `
      modalInfoCliente.appendChild(modalFooter);
    } else {
      modal.innerHTML = `<h4 data-i18n="No hay informacion">No hay información</h4>`;
      if (res.chatClient.length > 0) {
        modal.innerHTML += `
        <div id="view-collaps">
          <div class="row">
            <div class="col s12">
                <ul id="listaHistoricoChats" class="collapsible" data-collapsible="accordion">
                
                </ul>
            </div>
          </div>
        </div>`;
        modalInfoCliente.appendChild(modal);
        for (let index = 0; index < res.chatClient.length; index++) {
          let ul = document.querySelector('#listaHistoricoChats');
          let li = document.createElement('li');
          let headerDiv = document.createElement('div');
          headerDiv.classList.add('collapsible-header', 'row');
          headerDiv.textContent = `ID GESTIÓN:  ${res.chatClient[index].idGestion} - ${res.chatClient[index].PKGES_CODIGO} | FECHA GESTIÓN: ${res.chatClient[index].GES_CHORA_INICIO_GESTION}`;
          let bodyDiv = document.createElement('div');
          bodyDiv.classList.add('collapsible-body', 'row');
          headerDiv.addEventListener('click', async () => {
            postData('mensajeria/chatContent', { gestionId: res.chatClient[index].PKGES_CODIGO }).then(async (res) => {
              //console.log(res)
              bodyDiv.innerHTML = '';
              for (let index2 = 0; index2 < res.contentChat.length; index2++) {
                if (res.contentChat[index2].MES_CHANNEL == "RECEIVED") {
                  let receivedBody = document.createElement('div');
                  receivedBody.classList.add('chatRecibido', 'col', 's10', 'mt-1', 'mb-1');
                  let chatBody = document.createElement('div');
                  chatBody.classList.add('chat-body');
                  let chatText = document.createElement('div');
                  chatText.classList.add('chat-text');
                  let chatTextP = document.createElement('p');
                  chatTextP.textContent = res.contentChat[index2].MES_BODY;
                  chatText.appendChild(chatTextP)
                  chatBody.appendChild(chatText)
                  receivedBody.appendChild(chatBody)
                  bodyDiv.appendChild(receivedBody)
                } else if (res.contentChat[index2].MES_CHANNEL == "SEND") {
                  let sendBody = document.createElement('div');
                  sendBody.classList.add('chatEnviado', 'col', 's10', 'offset-s2', 'mt-1', 'mb-1');
                  let chatBody = document.createElement('div');
                  chatBody.classList.add('chat-body');
                  let chatText = document.createElement('div');
                  chatText.classList.add('chat-text');
                  let chatTextP = document.createElement('p');
                  chatTextP.textContent = res.contentChat[index2].MES_BODY;
                  chatText.appendChild(chatTextP)
                  chatBody.appendChild(chatText)
                  sendBody.appendChild(chatBody)
                  bodyDiv.appendChild(sendBody)
                }
              }
            })
          })
          li.appendChild(headerDiv);
          li.appendChild(bodyDiv);
          ul.appendChild(li);
        }
      }
      modalFooter.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat"><span data-i18n="Cerrar">Cerrar</span></a>
      `;
      modalInfoCliente.appendChild(modal);
      modalInfoCliente.appendChild(modalFooter);
    }
    $(document).ready(function () {
      $('.collapsible').collapsible();
    });
    let currentLanguage = localStorage.getItem('localIdioma');
    i18next.changeLanguage(currentLanguage, function (err, t) {
      $('html').localize();
    });
  });
};
//busca los mensajes del chat seleccinado y los muestra
// let idInterval = 0;
// let idInterval1 = 0;
async function shwoConversation(chatID, cellPhoneNumber, idGestion, clienteNombre, clienteCorreo) {
  let inicio = performance.now();
  document.getElementById("loaderGeneral").style.display = "flex";
  // console.log(cellPhoneNumber);
  localStorage.setItem('numChatActual', cellPhoneNumber);
  localStorage.setItem('idChatActual', chatID);
  // console.log(chatID);
  const mainContainerChat = document.getElementById('mainContainerChat');
  const mainContainerTipificar = document.getElementById('mainContainerTipificar');
  mainContainerChat.innerHTML = ``;
  mainContainerTipificar.innerHTML = ``;
  let nombreCliente = document.createElement('div');
  let chatWindow = document.createElement('div');
  let secondChatWindow = document.createElement('div');
  let thirdChatWindow = document.createElement('div');
  let chatFooter = document.createElement('div');
  //seccion del chat =>chatWindow
  chatWindow.setAttribute('class', 'chat-area ps ps--active-y');
  chatWindow.setAttribute('style', 'overflow-y:auto !important');
  chatWindow.setAttribute('id', 'seccionChat');
  secondChatWindow.setAttribute('class', 'chats');
  thirdChatWindow.setAttribute('class', 'chats');
  thirdChatWindow.setAttribute('id', 'chatContainer');
  thirdChatWindow.setAttribute('style', 'overflow-y:auto');
  chatFooter.setAttribute('class', 'chat-footer');
  secondChatWindow.appendChild(thirdChatWindow);
  chatWindow.appendChild(secondChatWindow);
  chatWindow.addEventListener('scroll', () => {
    checkScrollPosition(chatID, cellPhoneNumber);
  });

  const res = await postData(serverConsultarMensajes + '/searchConversation', { chatID, cellPhoneNumber, nombreDeUsuario });
  let infoClientActual = {
    id: '',
    nombre: '',
    correo: ''
  };
  let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
    arrVideoTypes = ['mp4', 'mpeg'],
    arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
    arrAudioTypes = ['ogg', 'oga', 'mp3'];
  // * Guardar Numero de mensajes del chat
  localStorage.setItem('countMessages', res.conversation.length);
  if (res.conversation.length > 0) {
    //buscar informacion del cliente
    // console.log(cellPhoneNumber)
    const resInfo = await postData('mensajeria/searchInfoUser', { cellPhoneNumber: cellPhoneNumber });
    // console.log(resInfo)
    if (resInfo.infoCliente.length > 0) {
      infoClientActual = {
        id: resInfo.infoCliente[0].PK_CLI_NCODE,
        nombre: resInfo.infoCliente[0].CLI_NAME,
        correo: resInfo.infoCliente[0].CLI_EMAIL
      };
    }
    // console.log(infoClientActual.id)
    // console.log(infoClientActual.nombre)
    // console.log(infoClientActual.correo)
    nombreCliente.innerHTML = `
        <div class="chat-header">
          <div class="row valign-wrapper" id="nombreCliente">
            <div class="col media-image online pr-0">
              <i class="material-icons circle z-depth-2 responsive-img"
                style="font-size: 40px;color:#276E90;">account_circle</i>
            </div>
            <div class="col">
              <p class="m-0 blue-grey-text text-darken-4 font-weight-700" id="celularCliente">${cellPhoneNumber}</p>
              <p id="chatIDHeader">ID: ${chatID} - ${idGestion}</p>
            </div> 
          </div>
          <span class="option-icon">
            <i class="material-icons modal-trigger"
              id="" style="text-align: center;"
              href="#modalTransferir" onclick="showModaltransferir();" >repeat
            </i>
            <i class="material-icons modal-trigger"
              id="searchInfoClient" style="text-align: right;"
              href="#modalInfoCliente" onclick="shwoInfoUser('${cellPhoneNumber}');" >info_outline
            </i>
            <ul id='dropdown2' class='dropdown-content'
              style="width: 150px; text-align:center;  ">
              <li style="line-height:0.5rem;min-height:20px;">
                <a class="modal-trigger"
                  href="#modalTransferir"
                  style="font-size: 13px; padding:3px 3px; text-align:center;color:#707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
              </li>
            </ul>
          </span>
        </div>
        `;
    let conversations = res.conversation;
    localStorage.setItem('idfirstmessage', conversations[0].PK_MES_NCODE);
    // chat content

    for (let i = 0; i < conversations.length; i++) {

      // * Validar tipo de mensaje
      let MES_MEDIA_TYPE = conversations[i].MES_MEDIA_TYPE,
        MES_MEDIA_URL = conversations[i].MES_MEDIA_URL,
        MES_MESSAGE_ID = conversations[i].MES_MESSAGE_ID,
        MES_BODY = conversations[i].MES_BODY,
        isFileImg = false,
        isFileDoc = false,
        isFileVideo = false,
        isFileAudio = false;
      // console.log(MES_MEDIA_TYPE);
      if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
      if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
      if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
      if (MES_MEDIA_TYPE !== null && arrAudioTypes.includes(MES_MEDIA_TYPE)) isFileAudio = true;
      if (conversations[i].MES_CHANNEL == 'RECEIVED') {
        thirdChatWindow.innerHTML += `
              <div class="chat">
                <div class="chat-body">
                <div class = "chat-box">
                  <div class="chat-text${isFileAudio ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px; display: flex; flex-direction: column"' : ''}>
                    ${MES_MEDIA_TYPE !== null && isFileImg
            ? `<img href="#modalZoomImg" onclick="imgZoom('${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}')" class="imgChatReceive modal-trigger" src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" style="cursor:pointer;" /> </br> ${MES_BODY === '' ? '' : `<p>${MES_BODY}</p>`}
                <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
            : MES_MEDIA_TYPE !== null && isFileDoc
              ? `<p><a target="_blank" href="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}"=><b>File <i class="bx bx-file"></i></b></a></p>
                  <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
              : MES_MEDIA_TYPE !== null && isFileAudio
                ? `<audio src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" type="audio/mp3" controls></audio>
                    <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
                : MES_MEDIA_TYPE !== null && isFileVideo
                  ? `<video src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" width="320" height="240" type="audio/mp3" controls></video>
                      <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>`
                  : `
                      <div class="chat-box">
                        <p class='p-msg'>${conversations[i].MES_BODY}</p>
                        <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>
                      </div>`
          }
              </div>
                  </div>
                </div>
              </div>`;
      } else if (conversations[i].MES_CHANNEL == 'SEND') {
        thirdChatWindow.innerHTML += `
              <div class="chat chat-right">
                <div class="chat-body">
                  <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px"' : ''}>
                    ${MES_MEDIA_TYPE !== null && isFileImg ? `<img href="#modalZoomImg" onclick="imgZoom('${MES_MEDIA_URL}')" class="imgChatSend modal-trigger"  src="${MES_MEDIA_URL}" style="cursor:pointer;" />`
            : MES_MEDIA_TYPE !== null && isFileDoc ? `<p><a style="color:white" target="_blank" href="${MES_MEDIA_URL}"=><b>File <i class="bx bx-file"></i></b></a></p>`
              : MES_MEDIA_TYPE !== null && isFileAudio ? `<audio src="${MES_MEDIA_URL}" type="audio/mp3" controls></audio>`
                : MES_MEDIA_TYPE !== null && isFileVideo ? `<video src="${MES_MEDIA_URL}" width="320" height="240" type="audio/mp3" controls></video>`
                  : `<div class="chat-box">
                      <p class='p-msg'>${conversations[i].MES_BODY}</p>
                      <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>
                    </div>`}
                  </div>
                </div>
              </div>`;
      } else if (conversations[i].MES_CHANNEL == 'ADMIN') {
        thirdChatWindow.innerHTML += `
              <div class="chat chatRecibidoAdminAgente">
                <div class="chat-body">
                  <div class="chat-text">
                     <div class="chat-box">
                        <p class='p-msg'>${conversations[i].MES_BODY}</p>
                        <p class='p-hour'>${conversations[i].MES_CREATION_DATE}</p>
                      </div>   
                  </div>
                </div>
              </div>`;
      }

    }

    //footer chat
    //! la siguente linea se debe colocar para que aparezca el icono de adjuntar archivos en el chatFooter ADJUNTOS
    chatFooter.innerHTML = `
        <form onsubmit="" action="javascript:void(0);" class="chat-input" enctype="multipart/form-data" autocomplete="off">
          <i class="material-icons modal-trigger" style="cursor: pointer;" id="iconSendFile" href="#modalSendFile" >attach_file</i>
          <i class="material-icons modal-trigger" onclick="showPlantillas();" id="verPlantillas" style="cursor: pointer;" href="#modalPlantillas" >description</i>              
          
          <textarea placeholder="Message" class="mb-0" id="messageToSend"></textarea>   
          <a onclick="sendMessage('${cellPhoneNumber}','${chatID}');" id="btnSendMessage"><i class="material-icons" style="padding-right: 5px;cursor:pointer;color:#6C7082;">send</i></a>
              
        </form>
        `;
    const mainContainerChat = document.getElementById('mainContainerChat');
    const mainContainerTipificar = document.getElementById('mainContainerTipificar');
    mainContainerChat.innerHTML = ``;
    mainContainerTipificar.innerHTML = ``;
    mainContainerChat.appendChild(nombreCliente);
    mainContainerChat.appendChild(chatWindow);
    mainContainerChat.appendChild(chatFooter);
    let messageToSend = document.getElementById('messageToSend');
    // ! enviar mensaje con enter
    messageToSend.addEventListener('keyup', async (e) => {
      if (e.key === 'Enter') {
        texto = messageToSend.value;
        let numChatActual = localStorage.getItem('numChatActual');
        let idChatActual = localStorage.getItem('idChatActual');
        if (texto == null) {
          alert('No puede  enviar un mensaje vacio')
        } else {
          const resMessage = await postData(serverEnviarMensajes + '/sendMessage', { To: numChatActual, body: texto, GestionID: idChatActual, usuario: nombreDeUsuario, nombreDeUsuario });
          // document.getElementById('message_to_send').value = '';
          // console.log('entra a enviar mensaje de encuesta',resMessage);
          if (resMessage == 'more than 24 hours have passed since the customer last replied') {
            // M.toast({ html: 'La ventana de 24 horas ha finalizado' });
            console.log("La ventana de 24 horas ha finalizado");
          } else if (resMessage != 'Mensaje Enviado') {
            M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
            // M.toast({ html: resMessage});
          }
          showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
          messageToSend.focus();
        }
        messageToSend.value = '';
      }
    });
    /* <li class="step active">     
                <div class="step-title waves-effect">Datos plantillas</div>
                <div class="step-content">      
                
                  <div class="row">
                    <div class="input-field col s12">
                      <input id="nameCliente" name="nameCliente" class="validate" type="text" require>
                      <label for="nameCliente">Nombre del prospecto</label>
                    </div>      
                    <div class="input-field col s6">
                      <input id="telefono" name="telefono" class="validate" type="text" value="${cellPhoneNumber}" require disabled>
                    </div> 
                    <div class="input-field col s6">
                      <input id="crm_id" name="crm_id" class="validate" type="text" require>
                      <label for="crm_id">Crm ID</label>
                    </div>      
                    <div class="input-field col s6">
                      <input id="fecha_nacimiento" name="fecha_nacimiento" class="validate" type="date" require>
                      <label for="fecha_nacimiento">Fecha Nacimiento</label>
                    </div>      
                    <div class="input-field col s6">
                      <input id="direccion" name="direccion" class="validate" type="text" require>
                      <label for="direccion">Dirección</label>
                    </div>      
                    <div class="input-field col s6">
                      <input id="oferta" name="oferta" class="validate" type="number" require>
                      <label for="oferta">Oferta</label>
                    </div>         
                    <div class="input-field col s6">
                      <input id="plazo" name="plazo" class="validate" type="number" require>
                      <label for="plazo">Plazo</label>
                    </div>        
          
                    <div class="col s12" style="text-align: center;">
                      <a class="waves-effect waves-light btn-small" onclick="traerPlantillas()" ><span >Generar</span> </a>
                    </div>  
                  </div> 
                </div> 
              </li> 
              
              `         
              <li class="step">      
                <div class="step-title waves-effect">Tipificación</div>
                <div class="step-content">
                  <div class="row">
                    <div class="input-field col s12">
                      <i class="material-icons prefix">phone</i>
                      <input  id="celularClienteTip" type="text" class="validate" value="${cellPhoneNumber}" disabled>
                    </div>    
                    
                    <div class="input-field col s12">
                    <i class="material-icons prefix">account_box</i>
                      <input id="nameCliente" name="nameCliente" class="validate" value="${clienteNombre}" type="text" require autofocus>
                      <label for="nameCliente" class="active">Nombre cliente</label>
                    </div> 
                    <div class="input-field col s12">
                      <i class="material-icons prefix">mail</i>
                      <input id="emailTip" name="emailTip" class="validate" value="${clienteCorreo}" type="email" require autofocus>
                      <label for="emailTip" class="active">Correo cliente</label>
                    </div> 
          
                    <div class="input-field col s12">
                      <i class="material-icons prefix">view_list</i>
                      <select class="select" id="selTipificacion" onchange="cargarSuptificaciones();">
                        <option value="" disabled selected>Elije una opción</option>
                      </select>
                      <label data-i18n="Tipificación">Tipificación</label>
                    </div>
                    <div class="input-field col s12">
                        <i class="material-icons prefix">view_list</i>
                        <select class="select" id='selSubtipificacion'>
                          <option value="" disabled selected>Elije una opción</option>
                        </select>
                        <label data-i18n="Subtipificación">Subtipificación</label>
                    </div>
                    <div class="input-field col s12">
                      <i class="material-icons prefix">comment</i>
                      <input id="observationsTip" type="tel" class="validate">
                      <label for="observationsTip" data-i18n="Observaciones">Observaciones</label>
                    </div>
          
                    <div class="col s12" style="text-align: center;">
                      <a class="waves-effect waves-light btn-small" onclick="sendTypification('${chatID}','${infoClientActual.nombre}','${infoClientActual.correo}','${infoClientActual.id}')" ><span >Guardar</span> </a>
                    </div>     
                  </div>
                </div>
              </li>
        `*/
    mainContainerTipificar.innerHTML = `         
              
                    <div class="input-field col s12">
                      <i class="material-icons prefix">comment</i>
                      <input id="observationsTip" type="tel" class="validate">
                      <label for="observationsTip" data-i18n="Observaciones">Observaciones</label>
                    </div>
          
                    <div class="col s12" style="text-align: center;">
                      <a class="waves-effect waves-light btn-small" onclick="sendTypification('${chatID}','${infoClientActual.nombre}','${infoClientActual.correo}','${infoClientActual.id}')" ><span >Cerrar Chat</span> </a>
                    </div>  
                  
        `;
    //const select2 = document.getElementById('selSubtipificacion');
    //select2.innerHTML = '';
    // form-wizar By Roger    
    function cargarScriptsDinamicamente(urls) {
      var body = document.getElementsByTagName('body')[0];
      urls.forEach(function (url, index) {
        var script = document.createElement('script');
        script.src = url;
        // Añadir un retardo de 1000 milisegundos (1 segundo) entre la carga de cada script
        setTimeout(function () {
          body.insertBefore(script, body.lastChild.nextSibling);
        }, index * 1000); // Multiplicamos el índice por 1000 para crear un retardo progresivo
      });
    }
    setTimeout(() => {
      cargarScriptsDinamicamente(['/vendors/materialize-stepper/materialize-stepper.min.js', '/js/form-wizard.js']);
    }, 200);
    document.getElementById('containerDropdownTip').innerHTML = `<ul id='dropdownTip' style="width: 250px;" class='dropdown-content'></ul>`;
    // Llenar plantillas automaticamente By Roger
    /* const llenarPlantilla = await postData('mensajeria/llenarPlantilla', { cellPhoneNumber: cellPhoneNumber })
    if (llenarPlantilla != undefined || llenarPlantilla != null){   
      // console.log('Entro 1');
      if (llenarPlantilla.plantilla){    
        // console.log('Entro 2');  
        document.getElementById('nameCliente').value = llenarPlantilla.plantilla.PCL_NOMBRE_PROSPECTO;
        document.querySelector('label[for="nameCliente"]').classList.add('active');
        document.getElementById('crm_id').value = llenarPlantilla.plantilla.PCL_CRM_ID;
        document.querySelector('label[for="crm_id"]').classList.add('active');
        document.getElementById('fecha_nacimiento').value = llenarPlantilla.plantilla.PCL_CFECHA_NACIMIENTO;
        document.querySelector('label[for="fecha_nacimiento"]').classList.add('active');
        document.getElementById('direccion').value = llenarPlantilla.plantilla.PCL_DIRECCION;
        document.querySelector('label[for="direccion"]').classList.add('active');
        document.getElementById('oferta').value = llenarPlantilla.plantilla.PCL_OFERTA;
        document.querySelector('label[for="oferta"]').classList.add('active');
        document.getElementById('plazo').value = llenarPlantilla.plantilla.PCL_PLAZO;
        document.querySelector('label[for="plazo"]').classList.add('active');
      }
    } */
    let resultado1 = await postData("/tipificacion");
    // console.log(resultado1);
    /*  const select1 = document.getElementById("selTipificacion");
     if (resultado1 != undefined) {
       resultado1.forEach((element) => {
         const option = document.createElement('option');
         option.value = element.PKTIP_NCODIGO;
         option.textContent = element.TIP_CNOMBRE_TIPIFICACION;
         select1.appendChild(option);
       });
     } else {
       console.log('Sin data')
     } */
    let dropdownTip = document.getElementById('dropdownTip'),
      htmlTip = '';
    res.tipificacion.forEach((tip) => {
      htmlTip += `<li><a href="#"><span>${tip.TYP_OBSERVACIONES}</span></a></li>`;
    });
    dropdownTip.innerHTML = htmlTip;
    var elemsDropdown = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elemsDropdown);
    var elemsSelect = document.querySelectorAll('.select');
    M.FormSelect.init(elemsSelect);
    $('input.input_text, textarea#textarea2').characterCounter();
    // showSelectOnForm(emailOptions, emailSelect);
    // * Hacer Scroll AL Chat
    const seccionChat = document.getElementById('seccionChat');
    setTimeout(() => {
      if (seccionChat === undefined || seccionChat === null) {
        // console.log('Undefined - null')
      } else if (seccionChat) {
        seccionChat.scrollTo({ top: seccionChat.scrollHeight, behavior: 'smooth' });
      }
    }, 300);
    let currentLanguage = localStorage.getItem('localIdioma');
    i18next.changeLanguage(currentLanguage, function (err, t) {
      $('html').localize();
    });
  } else {
    secondChatWindow.appendChild(thirdChatWindow);
    chatWindow.appendChild(secondChatWindow);
    nombreCliente.innerHTML = `
      <div class="chat-header">
        <div class="row valign-wrapper" id="nombreCliente">
         <div class="col media-image online pr-0">
            <i class="material-icons circle z-depth-2 responsive-img"
            style="font-size: 40px;color:#276E90;">account_circle</i>  
          </div>
          <div class="col">
            <p class="m-0 blue-grey-text text-darken-4 font-weight-700"
            id="celularCliente">${cellPhoneNumber}</p>
            <p id="chatIDHeader" style='display:none;'>${chatID}</p>           
          </div> 
        </div>
        <span class="option-icon">  
          <i class="material-icons modal-trigger"
          id="" style="text-align: center;"
          href="#modalTransferir" onclick="showModaltransferir();" >repeat</i>
    
          <i class="material-icons modal-trigger"
              id="searchInfoClient" style="text-align: right;"
              href="#modalInfoCliente" onclick="shwoInfoUser('${cellPhoneNumber}');" >info_outline</i>
            
          <ul id='dropdown2' class='dropdown-content'
              style="width: 150px; text-align:center;  ">
              <li style="line-height:0.5rem;min-height:20px;">
                  <a class="modal-trigger"
                      href="#modalTransferir"
                      style="font-size: 13px; padding:3px 3px; text-align:center;color:#707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
              </li>
          </ul>
        </span>
      </div>
      `;
    chatFooter.innerHTML = `
      <form onsubmit=""  class="chat-input" enctype="multipart/form-data" autocomplete="off">
        <i class="material-icons " style="cursor: pointer;"  >attach_file</i>
          <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
          <input type="text" placeholder="Message" class="message mb-0" disabled>
          <a><i class="material-icons" style="padding-right: 5px;cursor:pointer;color:#6C7082;">send</i></a>
      </form>
      `;
    const mainContainerChat = document.getElementById('mainContainerChat');
    const mainContainerTipificar = document.getElementById('mainContainerTipificar');
    mainContainerChat.innerHTML = ``;
    mainContainerTipificar.innerHTML = ``;
    mainContainerChat.appendChild(nombreCliente);
    mainContainerChat.appendChild(chatWindow);
    mainContainerChat.appendChild(chatFooter);
  }
  await postData(serverConsultarMensajes + '/updateReadMessages', { chatID, nombreDeUsuario });
  // !Actualizacion para indicar que los chats ya fueron leidos
  const infoSection = document.querySelectorAll('.info-section');
  let chatsContainer = document.getElementById('sectionChatMenu');
  // !verificar si el chat tiene un contador para quitarle el contador (circulito azul :v)
  if (chatsContainer && infoSection.length > 0) {
    chatsContainer = chatsContainer.children;
    for (let j = 0; j < chatsContainer.length; j++) {
      if (chatsContainer[j] && chatsContainer[j].id == chatID && infoSection[j]) {
        let badgePill = infoSection[j].getElementsByClassName('badge badge pill');
        if (badgePill.length > 0) {
          chatsContainer[j].style.backgroundColor = '#FFFF';
          infoSection[j].removeChild(badgePill[0]);
        }
      }
    }
  }
  // *** Recursiva - Revisando entrada de mensajes
  if (idInterval) {
    clearTimeout(idInterval);
  }
  const checkNewMessage = async () => {
    try {
      clearTimeout(idInterval);
      await showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
    } finally {
      idInterval = setTimeout(() => {
        checkNewMessage();
      }, 1500);
    }
  };
  checkNewMessage();
  document.getElementById("loaderGeneral").style.display = "none";
  let fin = performance.now();

  // Calcular la diferencia de tiempo
  let tiempoTotal = fin - inicio;

  // Imprimir el tiempo total en la consola
  console.log('Tiempo total de ejecución:', tiempoTotal, 'milisegundos');
}
// ! *** Actualizar Chat
const showNewMessage = async (chatID, cellPhoneNumber) => {
  //console.log('busca mensaje nuevo', chatID);
  if (window.document.hidden) {
    console.log("La pestaña está oculta (no activa)");


  } else {
    // console.log("La pestaña está visible (activa)");
    try {
      let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
        arrVideoTypes = ['mp4', 'mpeg'],
        arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
        arrAudioTypes = ['ogg', 'oga', 'mp3'];
      let chatContainer = document.getElementById('chatContainer');
      const res = await postData(serverConsultarMensajes + '/searchNewMessagesInChat', { chatID, cellPhoneNumber, nombreDeUsuario });
      //console.log(res)
      if (res.conversation == localStorage.getItem('countMessages')) {
        return;
      }
      if (res.incomingMessages !== undefined) {
        let newMessage = res.incomingMessages;
        // console.log(newMessage)
        let MES_MEDIA_TYPE = newMessage.MES_MEDIA_TYPE,
          MES_MEDIA_URL = newMessage.MES_MEDIA_URL,
          MES_MESSAGE_ID = newMessage.MES_MESSAGE_ID,
          MES_BODY = newMessage.MES_BODY,
          isFileImg = false,
          isFileDoc = false,
          isFileVideo = false,
          isFileAudio = false;
        /////
        // console.log(MES_MEDIA_TYPE);
        if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
        if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
        if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
        if (MES_MEDIA_TYPE !== null && arrAudioTypes.includes(MES_MEDIA_TYPE)) isFileAudio = true;
        if (newMessage.MES_CHANNEL == 'RECEIVED') {
          if (chatContainer) {
            chatContainer.innerHTML += `
            <div class="chat">
              <div class="chat-body">
              <div class = "chat-box">
                <div class="chat-text${isFileAudio ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px; display: flex; flex-direction: column"' : ''}>
                  ${MES_MEDIA_TYPE !== null && isFileImg
                ? `<img href="#modalZoomImg" onclick="imgZoom('${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}')" class="imgChatReceive modal-trigger" src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" style="cursor:pointer;" /> </br> ${MES_BODY === '' ? '' : `<p>${MES_BODY}</p>`}
              <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>`
                : MES_MEDIA_TYPE !== null && isFileDoc
                  ? `<p><a target="_blank" href="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}"=><b>File <i class="bx bx-file"></i></b></a></p>
                <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>`
                  : MES_MEDIA_TYPE !== null && isFileAudio
                    ? `<audio src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" type="audio/mp3" controls></audio>
                  <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>`
                    : MES_MEDIA_TYPE !== null && isFileVideo
                      ? `<video src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" width="320" height="240" type="audio/mp3" controls></video>
                    <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>`
                      : `<div class="chat-box">
                    <p class='p-msg'>${newMessage.MES_BODY}</p>
                    <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>
                  </div>`
              }
                </div>
                </div>
              </div>
            </div>
            `;
          }
        } else if (newMessage.MES_CHANNEL == 'SEND') {
          if (chatContainer) {
            chatContainer.innerHTML += `
            <div class="chat chat-right">
              <div class="chat-body">
                <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px"' : ''}>
                  ${MES_MEDIA_TYPE !== null && isFileImg ? `<img href="#modalZoomImg" onclick="imgZoom('${MES_MEDIA_URL}')" class="imgChatSend modal-trigger" src="${MES_MEDIA_URL}" style="cursor:pointer;" />`
                : MES_MEDIA_TYPE !== null && isFileDoc ? `<p><a style="color:white" target="_blank" href="${MES_MEDIA_URL}"=><b>File <i class="bx bx-file"></i></b></a></p>`
                  : MES_MEDIA_TYPE !== null && isFileAudio ? `<audio src="${MES_MEDIA_URL}" type="audio/mp3" controls></audio>`
                    : MES_MEDIA_TYPE !== null && isFileVideo ? `<video src="${MES_MEDIA_URL}" width="320" height="240" type="audio/mp3" controls></video>`
                      : `<div class="chat-box">
                    <p class='p-msg'>${newMessage.MES_BODY}</p>
                    <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>
                  </div>`}
                </div>
              </div>
            </div>
            `;
          }
        } else if (newMessage.MES_CHANNEL == 'ADMIN') {
          if (chatContainer) {
            chatContainer.innerHTML += `
          <div class="chat chatRecibidoAdminAgente">
            <div class="chat-body">
              <div class="chat-text">
              <div class="chat-box">
              <p class='p-msg'>${newMessage.MES_BODY}</p>
              <p class='p-hour'>${newMessage.MES_CREATION_DATE}</p>
            </div>
              </div>
            </div>
          </div>
          `;
          }
        }
        // !Actualizacion para indicar que los chats ya fueron leidos
        // if(newMessage.MES_SMS_STATUS=='delivered'){
        let IdMessage = newMessage.PK_MES_NCODE
        let status = newMessage.MES_SMS_STATUS
        // console.log(status)
        const resUpdateReadMessages = await postData(serverConsultarMensajes + '/updateReadIncomingMessage', { IdMessage, status, nombreDeUsuario })
        if (resUpdateReadMessages.message == 'Actualizado') {
          localStorage.setItem('countMessages', parseInt(localStorage.getItem('countMessages')) + 1);
        }
      }
      // * Hacer Scroll AL Chat
      const seccionChat = document.getElementById('seccionChat');
      // setTimeout(() => {
      //   if (seccionChat === undefined || seccionChat === null) {
      //     // console.log('Undefined - null')
      //   } else if (seccionChat) {
      //     seccionChat.scrollTo({ top: seccionChat.scrollHeight });
      //   }
      // }, 300);
    } catch (error) {
      console.error('Error:', error);
    }
  }
};
const loadNotifiedMessages = () => {
  let notifiedMessages = new Set();
  // Check if there are notified messages saved in localStorage
  const savedNotifiedMessages = localStorage.getItem('notifiedMessages');
  if (savedNotifiedMessages) {
    // If there are, parse and add them to the Set
    notifiedMessages = new Set(JSON.parse(savedNotifiedMessages));
  }
  return notifiedMessages;
};
const saveNotifiedMessages = (notifiedMessages) => {
  localStorage.setItem('notifiedMessages', JSON.stringify([...notifiedMessages]));
};
const showAlertNewMessages = (AttendingChats) => {
  //console.log("en alerta")
  // Declaración del conjunto para almacenar los ID de mensajes notificados
  let notifiedMessages = loadNotifiedMessages();
  // console.log(notifiedMessages);
  // console.log(AttendingChats);
  return new Promise((resolve, reject) => {
    let chatsContainer = document.getElementById("sectionChatMenu").children;
    let infoSections = document.querySelectorAll(".info-section");
    if (AttendingChats.length > 0 && infoSections.length > 0) {
      for (let i = 0; i < AttendingChats.length; i++) {
        let chatID = AttendingChats[i];
        postData(serverConsultarMensajes + "/searchNewChats", {
          chatID,
          nombreDeUsuario,
        }).then(async (res) => {
          //console.log(res);
          if (res.numUnreadMessages > 0) {
            let numUnreadMessages = res.numUnreadMessages;
            //console.log("cantidad de mensajes: ", numUnreadMessages)
            let unreadMessageIDs = res.unreadMessageIDs;
            let cellPhoneNumber = res.resultNumberChats[0].GES_NUMERO_COMUNICA
            for (let j = 0; j < chatsContainer.length; j++) {
              //  console.log("el chat", chatID, "tiene mensajes sin leer", numUnreadMessages);
              //  console.log("mostrar mensaje");
              //console.log(cellPhoneNumber);
              let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
                arrVideoTypes = ['mp4', 'mpeg'],
                arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
                arrAudioTypes = ['ogg', 'oga', 'mp3'];
              let chatContainer = document.getElementById('chatContainer');
              const res = await postData(serverConsultarMensajes + '/searchNewMessagesInChat', { chatID, cellPhoneNumber, nombreDeUsuario });
              const incomingMessage = res.incomingMessages;
              //console.log("incomingMessage",incomingMessage);
              //console.log(numUnreadMessages)
              if (numUnreadMessages == 1) {
                if (res.conversation == localStorage.getItem('countMessages')) {
                  return;
                }
                if (res.incomingMessages !== undefined) {
                  let newMessage = res.incomingMessages;
                  //console.log(newMessage)
                  let MES_MEDIA_TYPE = newMessage.MES_MEDIA_TYPE,
                    MES_MEDIA_URL = newMessage.MES_MEDIA_URL,
                    MES_MESSAGE_ID = newMessage.MES_MESSAGE_ID,
                    MES_BODY = newMessage.MES_BODY,
                    isFileImg = false,
                    isFileDoc = false,
                    isFileVideo = false,
                    isFileAudio = false;
                  // console.log(MES_MEDIA_TYPE);
                  if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
                  if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
                  if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
                  if (MES_MEDIA_TYPE !== null && arrAudioTypes.includes(MES_MEDIA_TYPE)) isFileAudio = true;
                  if (newMessage.MES_CHANNEL == 'RECEIVED') {
                    // console.log("aqui");
                    if (chatsContainer[j].id == AttendingChats[i]) {
                      chatID = localStorage.getItem("idChatActual");
                      if (
                        infoSections[j].getElementsByClassName("badge badge pill")
                          .length > 0
                      ) {
                        let span = infoSections[j].getElementsByClassName("badge badge pill");
                        infoSections[j].removeChild(span[0]);
                        if (chatsContainer[j].id != chatID) {
                          chatsContainer[j].style.backgroundColor = "#1de9b6";
                          infoSections[j].innerHTML += `<span class="badge badge pill light-blue darken-4">${numUnreadMessages}</span>`;
                        }
                      } else {
                        if (chatsContainer[j].id != chatID) {
                          chatsContainer[j].style.backgroundColor = "#1de9b6";
                          infoSections[j].innerHTML += `<span class="badge badge pill light-blue darken-4">${numUnreadMessages}</span>`;
                        }
                      }
                    }
                    if (!notifiedMessages.has(newMessage.PK_MES_NCODE)) {
                      if (MES_BODY == undefined && MES_MEDIA_TYPE != undefined || MES_BODY == null || MES_BODY == '') {
                        const message = `${cellPhoneNumber} :Mensaje multimedia.`;
                        await showNotificationAndSound(message);
                      }
                      else if (MES_BODY && MES_MEDIA_TYPE != undefined) {
                        const message = `${cellPhoneNumber} :Mensaje multimedia.`;
                        await showNotificationAndSound(message);
                      }
                      else {
                        if (MES_BODY.includes("This message (type: sticker) is currently unsupported. We are working hard to make it visible")) {
                          const message = `${cellPhoneNumber} : Stiker.`;
                          await showNotificationAndSound(message);
                        }
                        else {
                          const message = `${cellPhoneNumber} :${MES_BODY}.`;
                          await showNotificationAndSound(message);
                        }
                      }
                      // Agregar el ID del mensaje al conjunto de mensajes notificados
                      notifiedMessages.add(newMessage.PK_MES_NCODE);
                      // Guardar los mensajes notificados actualizados en el almacenamiento local
                      saveNotifiedMessages(notifiedMessages);
                    }
                    //  else {
                    //   // Si el ID del mensaje ya ha sido notificado antes, omitir la notificación
                    //   console.log("mensaje con ID", newMessage.PK_MES_NCODE, " ya ha sido notificado.");
                    // }
                  }
                }
              } else if (numUnreadMessages > 1) {
                // console.log("ids: ", unreadMessageIDs);
                //console.log("mensajes sin leeer",numUnreadMessages );
                if (chatsContainer[j].id == AttendingChats[i]) {
                  chatID = localStorage.getItem("idChatActual");
                  if (
                    infoSections[j].getElementsByClassName("badge badge pill")
                      .length > 0
                  ) {
                    let span = infoSections[j].getElementsByClassName("badge badge pill");
                    infoSections[j].removeChild(span[0]);
                    if (chatsContainer[j].id != chatID) {
                      chatsContainer[j].style.backgroundColor = "#1de9b6";
                      infoSections[j].innerHTML += `<span class="badge badge pill light-blue darken-4">${numUnreadMessages}</span>`;
                    }
                  } else {
                    if (chatsContainer[j].id != chatID) {
                      chatsContainer[j].style.backgroundColor = "#1de9b6";
                      infoSections[j].innerHTML += `<span class="badge badge pill light-blue darken-4">${numUnreadMessages}</span>`;
                    }
                    else {
                      chatsContainer[j].style.backgroundColor = "";
                      infoSections[j].innerHTML = "";
                    }
                  }
                }
                const allIDsNotified = unreadMessageIDs.every(id => notifiedMessages.has(id));
                if (!allIDsNotified) {
                  const message = `${cellPhoneNumber}:Tienes ${numUnreadMessages} nuevos mensajes.`;
                  await showNotificationAndSound(message);
                  // Agregar los IDs de mensajes no notificados al conjunto de mensajes notificados
                  unreadMessageIDs.forEach(id => {
                    if (!notifiedMessages.has(id)) {
                      notifiedMessages.add(id);
                    }
                  });
                  // Guardar los mensajes notificados actualizados en el almacenamiento local
                  saveNotifiedMessages(notifiedMessages);

                }
                // else {
                //   console.log("todos los mensajes han sido notificados")
                // }
              }
            }
          }
          // else {
          //   console.log(`no hay mensajes nuevos para el chat ${chatID}`);

          // }
        });
      }
      resolve(); // Resuelve la promesa cuando el bucle for termina
    } else {
      resolve(); // Resuelve la promesa si AttendingChats no tiene elementos o no hay elementos con la clase "info-section"
    }
  });
};
// Pide permiso para enviar notificaciones al usuario
function requestNotificationPermission() {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permisos de notificación concedidos.');
      }
    });
  }
}
// Función para mostrar una notificación de escritorio y reproducir un sonido
async function showNotificationAndSound(message) {
  if (Notification.permission === 'granted') {
    const audio = new Audio('audio/soundWpp.mp3');
    audio.play().catch(error => {
      //console.error('Error al reproducir sonido:', error);
      error1 = error
    });
    // Get the current URL
    const currentURL = window.location.href;
    //console.log(currentURL)
    // Check if the user is not on the specified URL and has granted permission for notifications
    if (window.document.hidden && !document.hasFocus()) {
      // Show the notification
      const notification = new Notification('CLARO Chat', {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" stroke="black" stroke-width="1" fill="none" /></svg>',
        body: message
      });
      // notification.addEventListener('click', () => {
      //   const targetURL = 'https://democrmwhatsappoficialoppo.rpagroupcos.com/mensajeria';
      //   const existingTabs = Array.from(window.top.frames).filter(frame => frame.location.href === targetURL);
      //   if (existingTabs.length === 0) {
      //     window.close(currentURL);
      //     window.open(targetURL);
      //   }
      // });
      //Play a sound
      const audio = new Audio('audio/soundWpp.mp3');
      audio.play().catch(error => {
        //console.error('Error al reproducir sonido:', error);
        error1 = error
      });
    }
  } else {
    console.log('El usuario no ha dado permiso para mostrar notificaciones o está navegando en la URL especificada.');
  }
}
function isTabOpenWithLink(link) {
  // Obtiene todas las pestañas abiertas en la ventana actual
  const tabs = Array.from(window.top.frames);
  // Verifica si alguna de las pestañas tiene la misma URL que el enlace dado
  return tabs.some(tab => tab.location.href === link);
}
// Llamada a la función de solicitud de permisos de notificación
requestNotificationPermission();
// !colocar valor dentro de un select
function showSelectOnForm(options, select, dato) {
  options.forEach((elemOption) => {
    if (elemOption.value == dato) {
      elemOption.setAttribute('selected', 'true');
    }
  });
  var elemsSelect = document.querySelectorAll('.select');
  M.FormSelect.init(elemsSelect);
}
// !verificacion de datos de tipificacion y envío para ser guardados
function sendTypification(chatID, nombre, correo, idCliente) {
  const nameClient = "document.getElementById('nameCliente')";
  const emailTip = "document.getElementById('emailTip')";
  const tipificacionSeleccionadaElement = "document.getElementById('selTipificacion')";
  const subtipificacionSeleccionadaElement = "document.getElementById('selSubtipificacion')";
  const observationsTip = document.getElementById('observationsTip');
  // const radicadoTip = document.getElementById('radicadoTip');
  const mainContainerTipificar = document.getElementById('mainContainerTipificar');
  const celularClienteTip = 1234567891;
  // console.log(nameClient.value);
  // console.log(emailTip.value);
  // console.log(tipificacionSeleccionadaElement.value);
  // console.log(subtipificacionSeleccionadaElement.value);
  // console.log(observationsTip.value);
  // console.log(celularClienteTip);
  let validador = true;
  let TipificacionTip = '';
  let subtipificacionTip = '';
  // console.log("esta es la tipificacion", TipificacionTip)
  // if (radicadoTip.value == null || radicadoTip.value == '') {
  //   validador = false;
  //   // M.toast({ html: document.querySelector('[data-i18n="Falta radicado"]').textContent});
  //   M.toast({ html: 'falta radicado' });
  // }
  /*   if (nameClient.value == null || nameClient.value == '') {
      validador = false;
      M.toast({ html: document.querySelector('[data-i18n="Falta el nombre"]').textContent });
    }
    if (emailTip.value == null || emailTip.value == '') {
      validador = false;
      M.toast({ html: document.querySelector('[data-i18n="Falta Correo"]').textContent });
    }
    if (tipificacionSeleccionadaElement.value == null || tipificacionSeleccionadaElement.value == '') {
      validador = false;
      M.toast({ html: document.querySelector('[data-i18n="Falta Tipificación"]').textContent });
    } else {
      TipificacionTip = tipificacionSeleccionadaElement.options[tipificacionSeleccionadaElement.selectedIndex].textContent;
    }
    if (subtipificacionSeleccionadaElement.value == null || subtipificacionSeleccionadaElement.value == '') {
      validador = false;
      M.toast({ html: document.querySelector('[data-i18n="Falta Subtipificación"]').textContent });
    } else {
      subtipificacionTip = subtipificacionSeleccionadaElement.options[subtipificacionSeleccionadaElement.selectedIndex].textContent;
    } */
  if (observationsTip.value == null || observationsTip.value == '') {
    validador = false;
    M.toast({ html: document.querySelector('[data-i18n="Falta observación"]').textContent });
  }
  if (validador === true) {
    const data = {
      chatID: chatID,
      celularClienteTip: celularClienteTip,
      // radicadoTip: ,radicadoTip,
      TipificacionTip: TipificacionTip,
      subtipificacionTip: subtipificacionTip,
      observationsTip: observationsTip.value,
      numChat: localStorage.getItem('numChatActual'),
    };
    // console.log(data)
    //validar si se modifico la informacion del cliente
    postData('mensajeria/sendTypification', { data }).then(async (res) => {
      if (res == 'ok') {
        console.log("Entrando al ok")
        M.toast({ html: document.querySelector('[data-i18n="Tipificación realizada con éxito"]').textContent });
        mainContainerTipificar.innerHTML = `Tipificación agregada`;
        // * Cerrar Chat
        cerrarChat();
        // *Enviar Email
        // postData('/mensajeria/enviarChatEmail', { GestionID: chatID, data: `<h3>Celular cliente: ${celularClienteTip}, Nombre: ${nameClient.value}, Email: ${emailTip.value}<h3>` });
      } else {
        console.log("ERROR");
        M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
      }
      let infoClienteActualizada = {
        idClient: idCliente,
        celularClienteTip: celularClienteTip,
        nombre: nameClient.value,
        correo: emailTip.value,
      };
      // console.log(infoClienteActualizada);
      // console.log(nombre, correo);
      if (nombre == '' && correo == '') {
        postData('mensajeria/insertInfoClient', { infoClienteActualizada }).then(async (res) => {
          if (res == 'ok') {
            // M.toast({ html: 'Tipificación realizada con éxito' })
            // mainContainerTipificar.innerHTML = `Información de usuario actualizada`
          } else if (res == 'no') {
            M.toast({ html: 'Cliente ya existe en base de datos' });
          } else if (res == 'error') {
            M.toast({ html: document.querySelector('[data-i18n="Se generó un error al insertar el cliente"]').textContent });
          }
        });
      } else {
        //console.log('Entro al else')
        //if (nombre != nameClient.value || correo != emailTip.value) {
        postData('mensajeria/updateInfoClient', { infoClienteActualizada }).then(async (res) => {
          if (res == 'ok') {
            // M.toast({ html: 'Tipificación realizada con éxito' })
            M.toast({ html: 'Información de usuario actualizada' });
            // mainContainerTipificar.innerHTML = `Información de usuario actualizada`
          } else {
            M.toast({ html: 'Se generó un error al actualizar cliente' });
          }
        });
        //}
      }
    });
    let currentLanguage = localStorage.getItem('localIdioma');
    i18next.changeLanguage(currentLanguage, function (err, t) {
      $('html').localize();
    });
  }
}
function updateInfoClient(cellPhoneNumber, idClient) {
  //const ModalNameClient = document.getElementById('ModalNameClient');
  const ModalCelClient = document.getElementById('ModalCelClient');
  const ModalDocumentClient = document.getElementById('ModalDocumentClient');
  //const ModalCorreoClient = document.getElementById('ModalCorreoClient');
  let validador = true;
  // if (ModalNameClient.value == '' || ModalNameClient.value == null) {
  //   validador = false;
  // }
  if (ModalCelClient.value == '' || ModalCelClient.value == null) {
    validador = false;
  }
  // if (ModalCorreoClient.value == '' || ModalCorreoClient.value == null) {
  //   validador = false;
  // }
  if (validador === true) {
    const data = {
      idClient: idClient,
      // ModalNameClient: ModalNameClient.value,
      ModalCelClient: ModalCelClient.value,
      ModalDocumentClient: ModalDocumentClient.value,
      // ModalCorreoClient: ModalCorreoClient.value,
    };
    postData('mensajeria/updateInfoClient', { data }).then(async (res) => {
      if (res == 'ok') {
        M.toast({ html: 'Información de cliente actualizada' });
      } else {
        M.toast({ html: 'Se generó un error, intente de nuevo' });
      }
    });
  }
}
function insertInfoClient(cellPhoneNumber) {
  const ModalNameClient = document.getElementById('ModalNameClient');
  const ModalCelClient = document.getElementById('ModalCelClient');
  const ModalDocumentClient = document.getElementById('ModalDocumentClient');
  const ModalCorreoClient = document.getElementById('ModalCorreoClient');
  let validador = true;
  // if (ModalNameClient.value == '' || ModalNameClient.value == null) {
  //   validador = false;
  // }
  if (ModalCelClient.value == '' || ModalCelClient.value == null) {
    validador = false;
  }
  // if (ModalCorreoClient.value == '' || ModalCorreoClient.value == null) {
  //   validador = false;
  // }
  if (validador === true) {
    const data = {
      // ModalNameClient: ModalNameClient.value,
      ModalCelClient: ModalCelClient.value,
      ModalDocumentClient: ModalDocumentClient.value,
      // ModalCorreoClient: ModalCorreoClient.value,
    };
    postData('mensajeria/insertInfoClient', { data }).then(async (res) => {
      if (res == 'ok') {
        M.toast({ html: 'Información de cliente agregada' });
      } else {
      }
    });
  }
}
function showModaltransferir() {
  //FIX modal duplicado
  document.getElementById("divFooterModalTransferirChat").innerHTML = `
    <a class="waves-effect waves-light btn-small " id="btnEnviarTransfer"><span data-i18n="Enviar">Enviar</span></a>
    <a class="modal-action modal-close waves-effect waves-green btn-flat "><span data-i18n="Cerrar">Cerrar</span></a>`
  //FIX modal duplicado
  let arrayAttendingChats = [];
  arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
  const chatID = localStorage.getItem('idChatActual');
  const btnEnviarTransfer = document.getElementById('btnEnviarTransfer');
  const modalTransferir = document.getElementById('modalTransferir');
  const MotivoTransferencia = document.getElementById('MotivoTransferencia');
  const selectModalAvalibleUsers = document.getElementById('selectModalAvalibleUsers');
  const ObservacionTransferencia = document.getElementById('ObservacionTransferencia');
  let options = document.createElement('div');
  MotivoTransferencia.value = '';
  selectModalAvalibleUsers.value = '';
  ObservacionTransferencia.value = '';
  let sectionChatMenu = document.getElementById('sectionChatMenu');
  const chatsNumber = sectionChatMenu.children; //cantidad de chats
  getData('mensajeria/availableUsers').then(async (res) => {
    options = `<option value="" disabled selected data-i18n="Seleccione el usuario">Seleccione el usuario</option>
    
    `;
    if (res.selectUsers.length > 0) {
      let array = res.selectUsers;
      array.forEach((element) => {
        options += `<option value="${element.PKUSU_NCODIGO}" >${element.USU_CUSUARIO} - ${element.USU_CSKILL} </option>`;
      });
      selectModalAvalibleUsers.innerHTML = options;
      var elemsSelect = document.querySelectorAll('.select');
      M.FormSelect.init(elemsSelect);
    }
    let currentLanguage = localStorage.getItem('localIdioma');
    i18next.changeLanguage(currentLanguage, function (err, t) {
      $('html').localize();
    });
  });
  btnEnviarTransfer.addEventListener('click', function () {
    console.log('cualquier cosa');
    let validador = true;
    if (MotivoTransferencia.value == null || MotivoTransferencia.value == '') {
      validador = false;
      M.toast({ html: document.querySelector('[data-i18n="Digite motivo de transferencia"]').textContent });
    }
    if (selectModalAvalibleUsers.value == null || selectModalAvalibleUsers.value == '') {
      validador = false;
      M.toast({ html: document.querySelector('[data-i18n="Seleccione usuario a transferir"]').textContent });
    }
    if (validador === true) {
      const data = {
        chatID: chatID,
        MotivoTransferencia: MotivoTransferencia.value,
        selectModalAvalibleUsers: selectModalAvalibleUsers.value,
        ObservacionTransferencia: ObservacionTransferencia.value,
        //nivel: selectModalAvalibleUsers.selectedOptions[0].value
      };
      postData('mensajeria/transferir', { data }).then(async (res) => {
        if (res == 'ok') {
          let sectionChatMenu = document.getElementById('sectionChatMenu');
          const mainContainerChat = document.getElementById('mainContainerChat');
          const mainContainerTipificar = document.getElementById('mainContainerTipificar');
          const chat = document.getElementById(chatID);
          //eliminar del array de localstorage el chat que se transfirió
          const filterChats = arrayAttendingChats.filter((item) => item !== chatID);
          localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
          sectionChatMenu.removeChild(chat);
          mainContainerChat.innerHTML = ``;
          mainContainerTipificar.innerHTML = ``;
          M.toast({ html: document.querySelector('[data-i18n="Chat transferido con éxito"]').textContent });
          var modal = document.querySelectorAll('.modal');
          M.Modal.init(modal);
        }
      });
    }
  });
}
//realizar insert en tabla tbl_chats_management cuando es chatOutBound
function insertIdGestion(cellPhoneNumber) {
  let idUser = localStorage.getItem('UserId');
  let arrayAttendingChats = [];
  arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
  const ChatOutboundCelular = document.getElementById('ChatOutboundCelular');
  const PlantillaChatOutBound = document.getElementById('PlantillaChatOutBound');
  const indicativoChatOutBound = document.getElementById('indicativoChatOutBound');
  const regex = /^[0-9]+$/;
  let validador = true;
  if (ChatOutboundCelular.value == '' || ChatOutboundCelular.value == null || !regex.test(ChatOutboundCelular.value)) {
    validador = false;
    M.toast({ html: document.querySelector('[data-i18n="Por favor digite el numero celular"]').textContent });
  }
  if (PlantillaChatOutBound.value == '' || PlantillaChatOutBound.value == null) {
    validador = false;
    M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione una plantilla"]').textContent });
  }
  if (indicativoChatOutBound.value == '' || indicativoChatOutBound.value == null) {
    validador = false;
    M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione el indicativo"]').textContent });
  }
  if (validador === true) {
    // let numeroCel = '+57' + ChatOutboundCelular.value;
    let numeroCel = indicativoChatOutBound.value + ChatOutboundCelular.value;
    // ! validar si el número al que desea enviar chatoutbound ya está siendo atendido
    postData('mensajeria/isChatAttending', { numeroCel }).then(async (resisChatAttending) => {
      if (resisChatAttending.result.length < 1) {
        // ! el chat no está siendo atendido
        // console.log('! el chat no está siendo atendido')
        const data = {
          ChatOutboundCelular: numeroCel,
          PlantillaChatOutBound: PlantillaChatOutBound.value,
        };
        postData('mensajeria/insertIdGestion', { data }).then(async (res) => {
          if (res) {
            let IdGestion = res;
            // console.log('Enviando...')
            postData(serverEnviarMensajes + '/sendTemplate', { To: numeroCel, body: PlantillaChatOutBound.value, GestionID: IdGestion, nombreDeUsuario }).then(async (resTemplate) => {
              // console.log('entra a enviar mensaje2');
              if (resTemplate == 'template enviado') {
                M.toast({ html: document.querySelector('[data-i18n="Mensaje enviado, por favor espere a que el cliente responda"]').textContent });
              } else {
                M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
              }
            });
          }
        });
      } else {
        if (resisChatAttending.idUserAttending == idUser) {
          Swal.fire({
            title: document.querySelector('[data-i18n="Este Chat ya está siendo atendido por usted"]').textContent,
            text: document.querySelector('[data-i18n="¿Desea cerrar el chat actual y abrir uno nuevo?"]').textContent,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: document.querySelector('[data-i18n="Sí, continuar"]').textContent,
            cancelButtonText: document.querySelector('[data-i18n="Cancelar"]').textContent,
          }).then((resultado) => {
            if (resultado.value) {
              // ! Hicieron click en "Sí"
              postData('mensajeria/cerrarChat', { chatIDHeader: resisChatAttending.idGestion }).then(async (res) => {
                if (res == 'ok') {
                  // document.getElementById('messageToSend').value = 'Gracias por comunicarse con nosotros';
                  //función de enviar mensaje
                  // sendMessage(numChatActual, idChatActual);
                  let idGestion = resisChatAttending.idGestion;
                  let sectionChatMenu = document.getElementById('sectionChatMenu');
                  const mainContainerChat = document.getElementById('mainContainerChat');
                  const mainContainerTipificar = document.getElementById('mainContainerTipificar');
                  const chat = document.getElementById(idGestion);
                  // console.log('idGestion',idGestion);
                  let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
                  const filterChats = arrayAttendingChats.filter((item) => item !== idGestion);
                  localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
                  sectionChatMenu.removeChild(chat);
                  mainContainerChat.innerHTML = ``;
                  mainContainerTipificar.innerHTML = ``;
                  // M.toast({ html: 'Chat cerrado con éxito' });
                  const data = {
                    ChatOutboundCelular: numeroCel,
                    PlantillaChatOutBound: PlantillaChatOutBound.value,
                  };
                  postData('mensajeria/insertIdGestion', { data }).then(async (res) => {
                    if (res) {
                      let IdGestion = res;
                      postData(serverEnviarMensajes + '/sendTemplate', { To: numeroCel, body: PlantillaChatOutBound.value, GestionID: IdGestion, nombreDeUsuario }).then(async (resTemplate) => {
                        // console.log('entra a enviar mensaje3');
                        if (resTemplate == 'template enviado') {
                          M.toast({ html: document.querySelector('[data-i18n="Mensaje enviado, por favor espere a que el cliente responda"]').textContent });
                        } else {
                          M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
                        }
                      });
                    }
                  });
                }
                // document.getElementById('message_to_send').value = '';
              });
            } else {
              // ! Dijeron que no
            }
          });
        }
        if (resisChatAttending.result[0].GES_ESTADO_CASO == 'OPEN') {
          let IdGestion = resisChatAttending.result[0].PKGES_CODIGO;
          postData('mensajeria/updateAttending', { GestionID: IdGestion }).then(async (resUpdateAttending) => {
            if (resUpdateAttending.ASIGNED == true) {
              postData(serverEnviarMensajes + '/sendTemplate', { To: numeroCel, body: PlantillaChatOutBound.value, GestionID: IdGestion, nombreDeUsuario }).then(async (resTemplate) => {
                // console.log('entra a enviar mensaje4');
                if (resTemplate == 'template enviado') {
                  M.toast({ html: document.querySelector('[data-i18n="Mensaje enviado, por favor espere a que el cliente responda"]').textContent });
                } else {
                  M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
                }
              });
            }
          });
        }
        if (resisChatAttending.idUserAttending != idUser && resisChatAttending.result[0].GES_ESTADO_CASO == 'ATTENDING') {
          Swal.fire(document.querySelector('[data-i18n="Cuidado!"]').textContent, document.querySelector('[data-i18n="Este número ya está siendo atendido por otro agente"]').textContent, 'warning');
        }
      }
    });
  }
}
//buscar chat por numero
function buscarChatsPorNumero() {
  const modalContentBuscarChatNumero = document.getElementById('modalContentBuscarChatNumero');
  const buscarChatsCelular = document.getElementById('buscarChatsCelular');
  const buscarChatsIndicativo = document.getElementById('buscarChatsIndicativo');
  const regex = /^[0-9]+$/;
  let validador = true;
  if (buscarChatsCelular.value == '' || buscarChatsCelular.value == null || !regex.test(buscarChatsCelular.value)) {
    validador = false;
    M.toast({ html: document.querySelector('[data-i18n="Por favor digite el numero celular"]').textContent });
  }
  if (buscarChatsIndicativo.value == '' || buscarChatsIndicativo.value == null) {
    validador = false;
    M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione el indicativo"]').textContent });
  }
  if (validador === true) {
    let numeroCel = buscarChatsIndicativo.value + buscarChatsCelular.value;
    postData('mensajeria/searchInfoUser', { cellPhoneNumber: numeroCel }).then(async (res) => {
      if (res.chatClient.length > 0) {
        modalContentBuscarChatNumero.innerHTML = `
        <div id="view-collaps">
          <div class="row">
            <div class="col s12">
                <ul id="listaHistoricoChats" class="collapsible" data-collapsible="accordion">
                
                </ul>
            </div>
          </div>
        </div>`;
        for (let index = 0; index < res.chatClient.length; index++) {
          let ul = document.querySelector('#listaHistoricoChats');
          let li = document.createElement('li');
          let headerDiv = document.createElement('div');
          headerDiv.classList.add('collapsible-header', 'row');
          headerDiv.textContent = `ID GESTIÓN:  ${res.chatClient[index].idGestion} - ${res.chatClient[index].PKGES_CODIGO} | FECHA GESTIÓN: ${res.chatClient[index].GES_CHORA_INICIO_GESTION}`;
          let bodyDiv = document.createElement('div');
          bodyDiv.classList.add('collapsible-body', 'row');
          headerDiv.addEventListener('click', async () => {
            postData('mensajeria/chatContent', { gestionId: res.chatClient[index].PKGES_CODIGO }).then(async (res) => {
              //console.log(res)
              bodyDiv.innerHTML = '';
              for (let index2 = 0; index2 < res.contentChat.length; index2++) {
                if (res.contentChat[index2].MES_CHANNEL == "RECEIVED") {
                  let receivedBody = document.createElement('div');
                  receivedBody.classList.add('chatRecibido', 'col', 's10', 'mt-1', 'mb-1');
                  let chatBody = document.createElement('div');
                  chatBody.classList.add('chat-body');
                  let chatText = document.createElement('div');
                  chatText.classList.add('chat-text');
                  let chatTextP = document.createElement('p');
                  chatTextP.textContent = res.contentChat[index2].MES_BODY;
                  chatText.appendChild(chatTextP)
                  chatBody.appendChild(chatText)
                  receivedBody.appendChild(chatBody)
                  bodyDiv.appendChild(receivedBody)
                } else if (res.contentChat[index2].MES_CHANNEL == "SEND") {
                  let sendBody = document.createElement('div');
                  sendBody.classList.add('chatEnviado', 'col', 's10', 'offset-s2', 'mt-1', 'mb-1');
                  let chatBody = document.createElement('div');
                  chatBody.classList.add('chat-body');
                  let chatText = document.createElement('div');
                  chatText.classList.add('chat-text');
                  let chatTextP = document.createElement('p');
                  chatTextP.textContent = res.contentChat[index2].MES_BODY;
                  chatText.appendChild(chatTextP)
                  chatBody.appendChild(chatText)
                  sendBody.appendChild(chatBody)
                  bodyDiv.appendChild(sendBody)
                }
              }
            })
          })
          li.appendChild(headerDiv);
          li.appendChild(bodyDiv);
          ul.appendChild(li);
        }
      } else {
        modalContentBuscarChatNumero.innerHTML = `
        <div id="view-collaps">
          <div class="row">
            <div class="col s12">
                <h4 class="center">${document.querySelector('[data-i18n="No se encontraron resultados"]').textContent}</h4>
            </div>
          </div>
        </div>`;
      }
      $(document).ready(function () {
        $('.collapsible').collapsible();
      });
      let currentLanguage = localStorage.getItem('localIdioma');
      i18next.changeLanguage(currentLanguage, function (err, t) {
        $('html').localize();
      });
    })
  }
}
//Mostrar plantillas cargadas en localStorage
//Mostrar plantillas cargadas en localStorage
function showPlantillas() {
  var plantillasLocal = JSON.parse(localStorage.getItem('plantillas'));
  const containerPlantillas = document.getElementById('containerPlantillas');
  containerPlantillas.innerHTML = ``;
  // console.log(plantillasLocal)
  if (plantillasLocal != null) {
    for (let i = 0; i < plantillasLocal.length; i++) {
      containerPlantillas.innerHTML += `
      <div class="collection card" style="border-radius: 5px;">
        <a  class="collection-item sectionPlantilla modal-close" style="color:#333333;cursor:pointer;">${plantillasLocal[i].PLA_CCONTENIDO}</a>
      </div>
      `;
    }
    const sectionPlantilla = document.querySelectorAll('.sectionPlantilla');
    for (let i = 0; i < sectionPlantilla.length; i++) {
      sectionPlantilla[i].style.color = 'black';
      sectionPlantilla[i].addEventListener('click', function () {
        const inputMessage = document.getElementById('messageToSend');
        inputMessage.value = sectionPlantilla[i].textContent;
        // postData('mensajeria/estadosUser', { estadoUser }).then(async (res) => {
        // });
      });
    }
  }
}
$(document).ready(function () {
  // Función para manejar la búsqueda por palabra clave
  function searchTemplates() {
    // Obtener la palabra clave ingresada por el usuario
    var keyword = $('#keywordInput').val().toLowerCase();
    // Ocultar todas las plantillas
    $('#containerPlantillas').children().hide();
    // Mostrar solo las plantillas que coincidan con la palabra clave
    $('#containerPlantillas').children().filter(function () {
      return $(this).text().toLowerCase().indexOf(keyword) > -1;
    }).show();
  }
  // Asignar el evento click al botón de búsqueda
  $('#searchButton').on('click', function () {
    searchTemplates();
  });
  // Asignar el evento keyup al campo de entrada para realizar la búsqueda mientras el usuario escribe
  $('#keywordInput').on('keyup', function () {
    searchTemplates();
  });
});
async function cargarSuptificaciones() {
  try {
    const select2 = document.getElementById('selSubtipificacion');
    select2.innerHTML = '<option value="" disabled selected>Elija una opción</option>';
    const id_tipificacion = document.getElementById("selTipificacion").value;
    const resultado2 = await postData("/subtipificacion", { categoria: id_tipificacion });
    if (resultado2 && resultado2.length > 0) {
      const optionsHTML = resultado2.map(element => `<option value="${element.PKOP_CODIGO}">${element.OP_OPCION}</option>`).join('');
      select2.innerHTML += optionsHTML;
    } else {
      console.log('Sin datos');
    }
    // Seleccionar el valor después de cargar las opciones
    select2.value = ''; // O seleccionar el valor predeterminado si se desea
    // Inicializar el elemento select (si estás utilizando algún framework o librería como Materialize)
    M.FormSelect.init(select2);
  } catch (error) {
    console.error('Error:', error);
  }
}