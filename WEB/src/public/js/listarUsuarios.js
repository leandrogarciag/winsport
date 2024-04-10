document.addEventListener('DOMContentLoaded', () => {

  const eliminar = () => {
    document.querySelectorAll("a#borrar").forEach((botonBorrar) => {
      botonBorrar.addEventListener("click", function (e) {
        let ideliminar = this.getAttribute("eliminarUsuario");
        console.log(ideliminar);
        Swal.fire({
          title: "¿Are you sure you want to disable the user?",
          showCancelButton: true,
          confirmButtonColor: 'rgb(202, 5, 29)',
          confirmButtonText: "DISABLE",
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("eliminado " + ideliminar);
            getData(`/usuarios/disableUser/${ideliminar}`).then(res => {
              location.reload();
            })

          }
        });
      });
    });
  };

  eliminar();

  $('#tuTablaUsuarios').DataTable({
    initComplete: function () {
      this.api().columns().every(function () {
        var column = this;
        var select = $('<select><option value=""></option></select>')
          .appendTo($(column.header()).find('tr'))
          .on('change', function () {
            var val = $.fn.dataTable.util.escapeRegex(
              $(this).val()
            );

            column
              .search(val ? '^' + val + '$' : '', true, false)
              .draw();
          });

        column.data().unique().sort().each(function (d, j) {
          select.append('<option value="' + d + '">' + d + '</option>');
        });
      });
    }
  });
});