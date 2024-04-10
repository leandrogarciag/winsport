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
