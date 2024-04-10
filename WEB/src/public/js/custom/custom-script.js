document.addEventListener("DOMContentLoaded", function () {
  $(".modal").modal({dismissible: false});

  //$("select").formSelect();

  $(".select2").select2({
    dropdownAutoWidth: true,
    width: "100%",
  });

  mensajeSweetalert2();
});

// * getData -> Peticiones Fetch GET - Recibe como parametro una ruta Ej: "/prueba"
// * --- Ejemplo - Misma idea con el resto de funciones Fetch
// *  getData("/rutaNode")
// *    then((res) => console.log(res))
const getData = async (route) => {
  try {
    let res = await fetch(route);
    let json = await res.json();
    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    return json;
  } catch (err) {
    console.error(err);
    Toast.fire({
      icon: "error",
      title: `Error en getData(): ${(err.status, err.statusText)}`,
    });
  }
};

// * postData -> Peticiones Fetch POST - Recibe como parametro una ruta y un JSON Ej: "/prueba", {x:1,y:2}
const postData = async (route, data = {}) => {
  try {
    let res = await fetch(route, {
      mode: "cors",
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      },
    });
    let json = await res.json();

    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    return json;
  } catch (err) {
    console.log(err);
  }
};

// * deleteData -> Peticiones Fetch DELETE - Recibe como parametro una ruta Ej: "/delete/:id"
const deleteData = async (route) => {
  try {
    let res = await fetch(route, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let json = await res.json();
    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    return json;
  } catch (err) {
    console.log(err);
  }
};

// * Toast -> Pequeñas alertas, si modificas esto se modifican TODAS
const alertaSwal = Swal.mixin({
  toast: true,
  position: "top-end", // * Posicion
  showConfirmButton: false,
  timer: 4000, // * Time
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// * inputMayus -> Pasar a MAYUSCULAS el texto de los inputs
// * --- los cuales son seleccionados antes con 'let inputTal = document.getElementById("inputTal")'
// * --- se pasan los campos por Array de forma dinamica Ej: inputsMayus([inputTal, etc...])
// TODO --- Para un ejemplo ver input en el Login
const inputsMayus = (arrInputs = []) => {
  arrInputs.forEach((element) => {
    element.addEventListener("keyup", (e) => {
      element.value = element.value.toUpperCase();
    });
  });
};
// * limpiarCampos -> Limpia inputs Materialize - Misma idea de la function inputsMayus()
const limpiarCampos = (arrInputs = []) => {
  arrInputs.forEach((element) => {
    element.value = "";
    element.nextElementSibling.classList.remove("active");
  });
};
// * mensajeSuccess -> Muestra una alerta tomando el nombre de '<div id="messageSuccess" data-message="{{success}}"></div>'
// * --- ver en views/partials/messages.hbs
const mensajeSweetalert2 = () => {
  let message = "";
  const messageSuccess = document.getElementById("messageSuccess"),
    messageInfo = document.getElementById("messageInfo"),
    messageWarning = document.getElementById("messageWarning"),
    messageError = document.getElementById("messageError");
  if (messageSuccess) {
    message = messageSuccess.dataset.message;
    alertaSwal.fire({ icon: "success", title: message });
  } else if (messageInfo) {
    message = messageInfo.dataset.message;
    alertaSwal.fire({ icon: "info", title: message });
  } else if (messageWarning) {
    message = messageWarning.dataset.message;
    alertaSwal.fire({ icon: "warning", title: message });
  } else if (messageError) {
    message = messageError.dataset.message;
    alertaSwal.fire({ icon: "error", title: message });
  }
};

// * Funciones Cargar y Ocultar loader
const containerLoader = document.getElementById("containerLoader"),
  textLoader = document.getElementById("textLoader"),
  cargarLoader = (message = "Cargando...") => {
    containerLoader.classList.remove("hidden");
    textLoader.textContent = message;
  },
  ocultarLoader = () => {
    containerLoader.classList.add("hidden");
    textLoader.textContent = "";
  };

$(window).on("load", function () {
  // Traduccion
  // Inicializar i18n y cargar JSON
  i18next.use(window.i18nextXHRBackend).init(
    {
      debug: false,
      fallbackLng: "es",
	    lng: "es",
	  supportedLngs: ["es", "pt", "en"],
      backend: {
        loadPath: "/data/locales/{{lng}}.json",
      },
      returnObjects: true,
    },
    function (err, t) {
      // resources have been loaded
      jqueryI18next.init(i18next, $);
    }
  );


 // TRADUCIR PAGINA Y MANTENER TRADUCCION
  if (localStorage.getItem("localIdioma") === null) {
    localStorage.setItem("localIdioma", $("#idioma").text());
  }

  // Carrgar idioma al cargar la pagina
  $(".dropdown-language .dropdown-item").each(function () {
	var $this = $(this);
	$this.siblings(".selected").removeClass("selected");
	if (localStorage.getItem("localIdioma")== $this.find("a").data("language")) {
	  $this.addClass("selected");
	  var selectedFlag = $this.find(".flag-icon").attr("class");
	  $(".translation-button .flag-icon").removeClass().addClass(selectedFlag);
	}
  });
  setTimeout(() => {
	  i18next.changeLanguage(localStorage.getItem("localIdioma"), function (err, t) {
		$("html").localize();
	  });

  }, 100);

  //Cambiar lenguaje segun bandera seleccionada
  $(".dropdown-language .dropdown-item").on("click", function () {
    var $this = $(this);
    $this.siblings(".selected").removeClass("selected");
    $this.addClass("selected");
    var selectedFlag = $this.find(".flag-icon").attr("class");

    $(".translation-button .flag-icon").removeClass().addClass(selectedFlag);
    var currentLanguage = $this.find("a").data("language");
	  postData("/cambiarIdioma", { currentLanguage });
    localStorage.setItem("localIdioma", currentLanguage);

    i18next.changeLanguage(currentLanguage, function (err, t) {
      $("html").localize();
    });
  });
  
});

// const fillSelect = ({ request, select, valueAfterLoad }) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const arrData = await getData(request);
//       select.innerHTML = `<option value='' disabled selected>Elija una opción</option>`;
//       if (arrData.length) {
//         const listadoOpt = arrData.map(data => `<option value='${data.PKOP_CODIGO}'>${data.OP_OPCION}</option>`).join('');
//         select.innerHTML += listadoOpt;
//       }
//       select.value = valueAfterLoad ? valueAfterLoad : '';
//       select.disabled = false;
//       M.FormSelect.init(select);
//       resolve(true);

//     } catch (error) {
//       console.log(error);
//       reject(error);
//     }
//   });
// }

function secondsToString(seconds) {
  var hour = Math.floor(seconds / 3600);
  hour = (hour < 10)? '0' + hour : hour;
  var minute = Math.floor((seconds / 60) % 60);
  minute = (minute < 10)? '0' + minute : minute;
  var second = Math.floor(seconds % 60);
  second = (second < 10)? '0' + second : second;
  return hour + ':' + minute + ':' + second ;
}
