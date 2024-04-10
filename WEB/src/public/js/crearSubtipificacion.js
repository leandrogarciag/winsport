document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Obtén datos de tipificación
        let resultado1 = await postData("/tipificacion");

        if (resultado1 != undefined) {
            const container = document.getElementById("subtipificacion_categoria");
            // Crea el selector de tipificaciones
            const select1 = document.createElement('select');
            select1.classList.add('select'); 
            select1.name = 'subtipificacion_categoria'; // Asigna el nombre del campo
            select1.id = 'subtipificacion_categoria'; // Asigna el ID del campo
            select1.required = true; 

            // Agrega la opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.value = '0';
            defaultOption.text = 'seleccione una opción';
            select1.appendChild(defaultOption);

            // Agrega las opciones de tipificación
            resultado1.forEach((element) => {
                const option = document.createElement('option');
                option.value = element.PKTIP_NCODIGO;
                option.textContent = element.TIP_CNOMBRE_TIPIFICACION;
                select1.appendChild(option);
            });

            container.appendChild(select1);

            // Inicializa el selector 
            $("select").formSelect();
        } else {
            console.log('Sin datos de tipificación');
        }
    } catch (error) {
        console.error('Error al obtener datos de tipificación', error);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    try {
      const subtipificacionContenido = document.getElementById("subtipificacion_contenido");
  
      subtipificacionContenido.addEventListener("input", function () {
        //convertir contenido en mayusculas
        this.value = this.value.toUpperCase();
      });
  
      subtipificacionContenido.value = subtipificacionContenido.value.toUpperCase();
    } catch (error) {
      console.error('Error al convertir contenido a mayúsculas', error);
    }
  });

  