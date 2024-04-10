document.addEventListener("DOMContentLoaded", () => {
    try {
      const tipificacionContenido = document.getElementById("tipificacion_nombre");
  
      tipificacionContenido.addEventListener("input", function () {
        //convertir contenido en mayusculas
        this.value = this.value.toUpperCase();
      });
  
      tipificacionContenido.value = tipificacionContenido.value.toUpperCase();
    } catch (error) {
      console.error('Error al convertir contenido a mayúsculas', error);
    }
});

  