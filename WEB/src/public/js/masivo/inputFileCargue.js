document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("loaderGeneral").style.display = "flex";
  getData(`/mensajeria/masivo/estado`).then(res =>{
    
    document.getElementById("loaderGeneral").style.display = "none";
   
    if (res.estado) {
      Swal.fire({
        icon: 'error',
        title: "Actualmente hay un envío masivo de correos en curso.",
        html: `Enviados : <strong>${res.enviados}</strong> <br> Por enviar : <strong>${res.porEnviar}</strong> <br>Total : <strong>${res.enviados + res.porEnviar}</strong> <br><br> Progresso : <strong>${Math.round((res.enviados * 100) / (res.enviados + res.porEnviar))}%</strong>`,
        showCancelButton: false,
        confirmButtonColor: 'rgb(202, 5, 29)',
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          location.href = "/dashboard";
        }
      });
    }

  }) 


  const btnCargarExcel = document.querySelector('#btnCargarExcel');
  const fileExcel = document.querySelector('#fileExcel');
  fileExcel.value = null;
  
  btnCargarExcel.addEventListener('click', e => {
    let msgToast = null;

    const mimeExcel = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!fileExcel.value) {
      msgToast = 'Seleccione un Excel'
    } else if (fileExcel.files[0].type !== mimeExcel) {
      msgToast = 'El archivo debe ser un Excel'
    }

    if (msgToast) {
      alertaSwal.fire({
        icon: 'error',
        title: msgToast,
      });
      msgToast = null;
      e.preventDefault();
    } else {
      document.getElementById("loaderGeneral").style.display = "flex";
    }
  });



  });