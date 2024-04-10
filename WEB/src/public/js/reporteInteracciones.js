
document.addEventListener("DOMContentLoaded", () => {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
  let archivoChat = "";
  let archivoNombre = "";
  var selectField = document.getElementById('select_filtro');
  let selectedEndpoint; // Define a variable to store the selected endpoint
  // Event listener for the change event on the dropdown
  selectField.addEventListener('change', function () {
    selectedEndpoint = selectField.value; // Store the selected value
    let contenidogestiones = document.getElementById("contenidogestiones");
    contenidogestiones.style.display = "none";
    if (selectedEndpoint === 'F') {
      fechaInicial.value = '';
      fechaFinal.value = '';
      fechas_div.style.display = 'block';
      listaAgentes_div.style.display = 'none';
      ID_CASO_div.style.display = 'none';
      num_tel_div.style.display = 'none';
    } else if (selectedEndpoint === 'A') {
      listaAgentes_div.style.display = 'block';
      fechas_div.style.display = 'none';
      ID_CASO_div.style.display = 'none';
      num_tel_div.style.display = 'none';
    } else if (selectedEndpoint === 'I') {
      ID_CASO.value = '';
      ID_CASO_div.style.display = 'block';
      listaAgentes_div.style.display = 'none';
      fechas_div.style.display = 'none';
      num_tel_div.style.display = 'none';
    } else if (selectedEndpoint === 'T') {
      num_tel.value = '';
      num_tel_div.style.display = 'block';
      listaAgentes_div.style.display = 'none';
      fechas_div.style.display = 'none';
      ID_CASO_div.style.display = 'none';
    } else {
      num_tel_div.style.display = 'none';
      listaAgentes_div.style.display = 'none';
      fechas_div.style.display = 'none';
      ID_CASO_div.style.display = 'none';
    }
  });
  document.getElementById("Buscar").addEventListener("click", async function (e) {
    document.getElementById("loaderGeneral").style.display = "flex";
    //const startTime = new Date();
    let selectedEndpoint = selectField.value;
    let fechaInicial = document.getElementById("fechaInicial");
    let fechaFinal = document.getElementById("fechaFinal");
    let listaAgentes = document.getElementById("listaAgentes");
    //let nivel = document.getElementById("nivel");
    const idCaso = document.getElementById('ID_CASO').value;
    const num_tel = document.getElementById('num_tel').value;
    const data = {
      fechaInicial: fechaInicial.value,
      fechaFinal: fechaFinal.value,
      listaAgentes: listaAgentes.value,
      //nivel: nivel.value,
    };
    let reporteInteracciones; // Declare the variable here
    if (selectedEndpoint === 'F') {
      if (fechaInicial.value.trim() === '' || fechaInicial.value.trim() === undefined || fechaInicial.value.trim() === null || fechaInicial.value.trim() === '0') {

        M.toast({ html: document.querySelector('[data-i18n="Por favor complete el campo de fecha inicial"]').textContent });
      } else if (fechaFinal.value.trim() === '' || fechaFinal.value.trim() === undefined || fechaFinal.value.trim() === null || fechaFinal.value.trim() === '0') {

        M.toast({ html: document.querySelector('[data-i18n="Por favor complete el campo de fecha final"]').textContent });
      } else if (fechaFinal.value.trim() >= fechaInicial.value.trim()) {
        reporteInteracciones = await postData("/reportes/getReporteInteraccionesFecha", { data });
      }
      else {
        M.toast({ html: document.querySelector('[data-i18n="La fecha final debe ser posterior a la fecha inicial"]').textContent });
      }
    } else if (selectedEndpoint === 'A') {
      if (listaAgentes.value.trim() !== '' && listaAgentes.value.trim() !== undefined && listaAgentes.value.trim() !== null && listaAgentes.value.trim() !== '0') {
        reporteInteracciones = await postData("/reportes/getReporteInteraccionesAgente", { data });
      } else {

        M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione un agente"]').textContent });
      }
    } else if (selectedEndpoint === 'I') {
      if (idCaso.trim() !== '' && idCaso.trim() !== undefined && idCaso.trim() !== null && idCaso.trim() !== '0') {
        reporteInteracciones = await postData("/reportes/getReporteInteraccionesId", { idCaso });
      } else {
        M.toast({ html: document.querySelector('[data-i18n="Por favor digite el id del caso"]').textContent });
      }
    } else if (selectedEndpoint === 'T') {

      if (num_tel.trim() !== '') {
        reporteInteracciones = await postData("/reportes/getReporteInteraccionesTel", { num_tel });
      }
      else {
        M.toast({ html: document.querySelector('[data-i18n="Por favor digite el numero celular"]').textContent });
      }
    }
    else {
      M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione el tipo de reporte para continuar"]').textContent });
    }
    $("#page-length-option").DataTable().destroy();
    if (reporteInteracciones) {
      if (reporteInteracciones.length > 0) {
        let contenidogestiones = document.getElementById("contenidogestiones");
        contenidogestiones.style.display = "block";
        //   let array_reporteAgentes = reporteAgentes.map((elem) => {
        //     return Object.values(elem);
        //   });
        var table = $("#page-length-option").DataTable({
          data: reporteInteracciones,
          columns: [{ data: "PKGES_CODIGO" }, { data: "agente" }, { data: "cliente" }, { data: "tipificacion" }, { data: "radicado" }, { data: "fechaInicio" }, { data: "fechaAsignacion" }, { data: "fechaFin" }, { data: "tiempo" }],
          responsive: true,
          iDisplayLength: 20,
          lengthMenu: [
            [20, 40, 60, 80, 100, -1],
            [20, 40, 60, 80, 100, "All"],
          ],
          dom: "lfrtipB",
          buttons: [{ extend: "excel", className: "waves-effect waves-light btn border-round color-oscuro z-depth-4 mr-1 mb-1 ml-3 mt-1 " }],
        });
        table.order([0, 'desc']).draw();
        $("#page-length-option tbody").on("click", "tr", async function () {
          var data = table.row(this).data();
          $("#modalVerChat").modal("open");
          chat = "";
          archivoChat = "";
          archivoNombre = `${data.cliente}_${data.fechaInicio}.txt`;
          document.getElementById("contenedorChat").innerHTML = chat;
          let interaccion = await postData("/reportes/getInteraccion", { data: data.PKGES_CODIGO });
          let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
            arrVideoTypes = ['mp4', 'mpeg'],
            arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
            arrAudioTypes = ['ogg', 'oga', 'mp3'];
          interaccion.forEach((element) => {
            let isFileImg = false,
              isFileDoc = false,
              isFileVideo = false,
              isFileAudio = false;
            isMultimedia = false;
            tipoMultimedia = "";
            if (Boolean(element.MES_MEDIA_TYPE) && element.MES_MEDIA_TYPE != "Null" && element.MES_MEDIA_TYPE != "None") {
              if (arrImgTypes.includes(element.MES_MEDIA_TYPE)) isFileImg = true;
              if (arrDocsTypes.includes(element.MES_MEDIA_TYPE)) isFileDoc = true;
              if (arrVideoTypes.includes(element.MES_MEDIA_TYPE)) isFileVideo = true;
              if (arrAudioTypes.includes(element.MES_MEDIA_TYPE)) isFileAudio = true;
              isMultimedia = true;
              tipoMultimedia = element.MES_MEDIA_TYPE;
              if (element.MES_CHANNEL == "RECEIVED") {
                if (isFileImg) element.MES_BODY = `<img class="imgChatReceive" src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}"> ${element.MES_BODY}`;
                if (isFileDoc) element.MES_BODY = `<a target="_blank" href="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}"> <b>File <i class="bx bx-file"></i></b></a> ${element.MES_BODY}`;
                if (isFileVideo) element.MES_BODY = `<div><video class="imgChatReceive" src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}" width="320" height="240" type="audio/mp3" controls></video> </div>${element.MES_BODY}`;
                if (isFileAudio) element.MES_BODY = `<audio src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}" type="audio/mp3" controls></audio> ${element.MES_BODY}`;
              }
              else if (element.MES_CHANNEL == "SEND") {
                if (isFileImg) element.MES_BODY = `<img class="imgChatReceive" src="${element.MES_MEDIA_URL}"> ${element.MES_BODY}`;
                if (isFileDoc) element.MES_BODY = `<a target="_blank" href="${element.MES_MEDIA_URL}"> <b>File <i class="bx bx-file"></i></b></a> ${element.MES_BODY}`;
                if (isFileVideo) element.MES_BODY = `<div><video class="imgChatReceive" src="${element.MES_MEDIA_URL}" width="320" height="240" type="audio/mp3" controls></video> </div>${element.MES_BODY}`;
                if (isFileAudio) element.MES_BODY = `<audio src="${element.MES_MEDIA_URL}" type="audio/mp3" controls></audio> ${element.MES_BODY}`;
              }
            }
            if (element.MES_CHANNEL == "RECEIVED") {
              chat += ` 
              <div>
                <div class="col s9 mt-1 mb-1 chatRecibido">
                  <p class="left">${data.cliente} - ${element.MES_CREATION_DATE} :</p>
                  <br>
                  <p class="left">${element.MES_BODY}</p>
                </div>
              </div>
              `;
              archivoChat += `${data.cliente} - ${element.MES_CREATION_DATE} : \n`;
              if (isMultimedia) {
                archivoChat += `${tipoMultimedia} `;
              } else {
                archivoChat += `${element.MES_BODY} `;
              }
            } else if (element.MES_CHANNEL == "SEND") {
              chat += ` 
              <div>
                <div class="col s9 offset-s3 mt-1 mb-1 chatEnviado">
                  <p class="left">${element.MES_USER} - ${element.MES_CREATION_DATE} :</p>
                  <br>
                  <p class="left">${element.MES_BODY}</p>
                </div>
              </div>
              `;
              archivoChat += `${element.MES_USER} - ${element.MES_CREATION_DATE} : \n`;
              if (isMultimedia) {
                archivoChat += `${tipoMultimedia} `;
              } else {
                archivoChat += `${element.MES_BODY} `;
              }
            } else if (element.MES_CHANNEL == "ADMIN") {
              chat += ` 
              <div>
                <div class="col s9 mt-1 mb-1 chatRecibidoAdmin">
                  <p class="left">${element.MES_USER} - ${element.MES_CREATION_DATE} :</p>
                  <br>
                  <p class="left">${element.MES_BODY}</p>
                </div>
              </div>
              `;
              archivoChat += `${element.MES_USER} - ${element.MES_CREATION_DATE} : \n`;
              if (isMultimedia) {
                archivoChat += `${tipoMultimedia} `;
              } else {
                archivoChat += `${element.MES_BODY} `;
              }
            }
          });
          document.getElementById("contenedorChat").innerHTML = chat;
        });
      }
      else {
        M.toast({ html: document.querySelector('[data-i18n="No se encontraron registros relacionados a la búsqueda"]').textContent });
        let contenidogestiones = document.getElementById("contenidogestiones");
        contenidogestiones.style.display = "none";
      }
    }
    else {
      console.log("sin filtros de busqueda")
      // M.toast({ html: document.querySelector('[data-i18n="No se encontraron registros relacionados a la búsqueda"]').textContent });
      // let contenidogestiones = document.getElementById("contenidogestiones");
      // contenidogestiones.style.display = "none";
    }
    document.getElementById("loaderGeneral").style.display = "none";
    // const endTime = new Date(); 
    // const executionTime = endTime - startTime; 
    // console.log("Tiempo de ejecución:", executionTime, "ms"); 
  });
  document.getElementById("descargarChat").addEventListener("click", function () {
    var text = archivoChat;
    var filename = archivoNombre;
    download(filename, text);
  });
  function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
});
