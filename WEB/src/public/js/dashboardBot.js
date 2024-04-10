document.addEventListener("DOMContentLoaded", () => {
    inicio();

    let contenedorGraficosBot = document.getElementById("contenedorGraficosBot");
    
    function actualizarDashboard() {
      return new Promise((resolve) => {
        getData("/dashboard/actualizarDashboardBot").then((res) => 
        {   

            //obtener posicion del scroll antes de crear el grafico
            var pos = $(document).scrollTop();
          //Actualiza tarjetas
          try{
            //Actualizar interacciones Activas
            document.getElementById("interaccionesActivas").innerHTML = res.datasqlInteraccionesAbiertasBot.length;
           //Actualizar interacciones Activas
            
            if(res.datasqlInteraccionesBot.length >0){
                
                //Actualizar interacciones finalizadas
                document.getElementById("interaccionesFinalizadas").innerHTML = res.datasqlInteraccionesBot.length;
                //FIN Actualizar interacciones finalizadas

                //Actualizar interacciones con paso a asesor
                /* let opcionPasoAsesor = 0
                for (const registro of res.datasqlInteraccionesBot) {
                    for (const opcionAsesor of res.datasqlOpcionesAgentes) {
                        if(registro.OpcionArbol.includes(opcionAsesor.FKBTREE_NCODIGO)){
                            opcionPasoAsesor = opcionPasoAsesor + 1;
                            break;
                        }
                    }
                } */
                document.getElementById("interaccionesAgente").innerHTML = res.datasqlOpcionesAgentes[0].chats;
                //FIN Actualizar interacciones con paso a asesor

                //Actualiza tiempo promedio
                let hora = 0;
                let minuto = 0;
                let segundos = 0;
                let totalSegundos = 0;
        
                res.datasqlInteraccionesBot.forEach((registro) => {
                    hora += parseInt(registro.Duracion.split(":")[0]);
                    minuto += parseInt(registro.Duracion.split(":")[1]);
                    segundos += parseInt(registro.Duracion.split(":")[2]);
                })
  
  
                totalSegundos = (hora*60*60) + (minuto * 60) + (segundos);
                document.getElementById("tarajetaTiempoPromedio").innerHTML = secondsToString(totalSegundos/res.datasqlInteraccionesBot.length);
             
              // FIN Actualiza tiempo promedio
            }
          }catch (error) {
            console.log("Hubo un error : ", error);
          }
          // FIN Actualiza tarjetas

          //INICIO creacion de graficos de barras
          contenedorGraficosBot.innerHTML="";
          const contenedorGraficos = []
          const graficosOpcionesPrincipales = []
          let posicionGrafico = 0;
          
          for (const opcionPrimaria of res.datasqlOpcionPrimaria) {
            contenedorGraficos[posicionGrafico] = document.createElement("div");
            contenedorGraficos[posicionGrafico].innerHTML = `
            <div id="chartjs-bar-chart" class="card">
                <div class="card-content">
                    <div class="row">
                        <div class="col s12">
                            <div class="row">
                                <div class="col s12">
                                <div class="sample-chart-wrapper"><canvas id="bar-chart${posicionGrafico}" height="400"></canvas></div>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                </div>
            </div>`

            contenedorGraficosBot.appendChild(contenedorGraficos[posicionGrafico]);

            graficosOpcionesPrincipales[posicionGrafico] = new Chart($("#bar-chart"+posicionGrafico), {
                type: "horizontalBar",
                options: 
                {
                    responsive: true,
                    maintainAspectRatio: false,
                    responsiveAnimationDuration: 500,
                    scales: 
                    {
                        xAxes: 
                        [{
                            ticks: 
                            {
                                beginAtZero: true
                            }
                        }]
                    },
                },
                data:
                {
                    labels: ["Casos"],
                    datasets:
                    [{
                        label: "Finalizados",
                        data: [],
                        backgroundColor: "#00bcd4",
                        hoverBackgroundColor: "#00acc1",
                        borderColor: "transparent"
                    }]
                }
            });

            // INICIO Genera el label del grafico principal
            if (opcionPrimaria.opcionPrimaria == "MSG_MENU_0"){
                graficosOpcionesPrincipales[posicionGrafico].data.datasets[0].label = "Opcion del ARBOL : Mensaje saludo"
            }
            else{
                for (const arbol of res.datasqlArbol) {
                    if (arbol.BTREE_TIPO_MSG == opcionPrimaria.opcionPrimaria.slice(0, -1) && arbol.BTREE_OPTION_NUM == opcionPrimaria.opcionPrimaria[opcionPrimaria.opcionPrimaria.length -1]) {
                        graficosOpcionesPrincipales[posicionGrafico].data.datasets[0].label = "Opcion del ARBOL : "+arbol.BTREE_TEXTO+" : "+opcionPrimaria.opcionPrimaria
                        break;
                    }
                 }
            }
            // FIN Genera el label del grafico principal


            //INICIO General el label de las barras e ingresa la data de las barras
            let posicionChart = 0
            for (const opcionSecundaria of res.datasqlOpcionSecundaria) {
                if(opcionSecundaria.opcionSecundaria.slice(0, -1) == opcionPrimaria.opcionPrimaria){

                    for (const arbol of res.datasqlArbol) {
                        if (arbol.BTREE_TIPO_MSG == opcionPrimaria.opcionPrimaria && arbol.BTREE_OPTION_NUM == opcionSecundaria.opcionSecundaria[opcionSecundaria.opcionSecundaria.length -1]) {
                            graficosOpcionesPrincipales[posicionGrafico].data.labels[posicionChart] = arbol.BTREE_TEXTO;
                        }else if (arbol.BTREE_TIPO_MSG == 'MSG_MENU_0' && arbol.BTREE_OPTION_NUM == opcionSecundaria.opcionSecundaria[opcionSecundaria.opcionSecundaria.length -1]) {
                            graficosOpcionesPrincipales[posicionGrafico].data.labels[posicionChart] = arbol.BTREE_TEXTO; 
                        }
                     }

                    graficosOpcionesPrincipales[posicionGrafico].data.datasets[0].data[posicionChart] = opcionSecundaria.cantidad;
                    graficosOpcionesPrincipales[posicionGrafico].update();

                    posicionChart = posicionChart + 1
                }
            }
            //FIN General el label de las barras e ingresa la data de las barras

            //volver a la posicion del scroll despues de crear el grafico
            $(document).scrollTop(pos);
            posicionGrafico = posicionGrafico + 1
          }
          
          //FIN creacion de graficos de barras
          resolve();
        });
      });
    }
  
  
    setInterval(() => {
      actualizarDashboard();
    }, 30000);
  
    async function inicio() {
      document.getElementById("loaderGeneral").style.display = "flex";
      await actualizarDashboard();
      document.getElementById("loaderGeneral").style.display = "none";
    }
  });