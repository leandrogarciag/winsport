document.addEventListener("DOMContentLoaded", () => {


    $("#page-length-option2").DataTable({
        responsive: true,
        lengthMenu: [
            [10, 25, 50, -1],
            [10, 25, 50, "All"],
        ],
    });

    document.getElementById("Buscar").addEventListener("click", async function (e) {
        let fechaInicial = document.getElementById("fechaInicial");
        let fechaFinal = document.getElementById("fechaFinal");
        let listaAgentes = document.getElementById("listaAgentes");
        //let nivel = document.getElementById("nivel");

        const data = {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value,
            listaAgentes: listaAgentes.value,
            //nivel: nivel.value,
        };

        let reporteAgentes = await postData("/reportes/getReporteTransferencias", { data });
        $("#page-length-option2").DataTable().destroy();
        if (reporteAgentes.length > 0) {

            $("#page-length-option2").DataTable({
                data: reporteAgentes,
                columns: [
                    { data: 'usuarioInicial' },
                    //{ data: 'skillUsuarioInicial' },
                    { data: 'usuarioFinal' },
                    //{ data: 'skillUsuarioFinal' },
                    { data: 'cliente' },
                    { data: 'motivo' },
                    { data: 'observacion' },
                    { data: 'fechaInicio' },
                    { data: 'fechaTransferencia' }
                ],
                responsive: true,
                iDisplayLength: 20,
                lengthMenu: [
                    [20, 40, 60, 80, 100, -1],
                    [20, 40, 60, 80, 100, "All"],
                ],
                dom: 'lfrtipB',
                buttons: [{ extend: 'excel', className: 'waves-effect waves-light btn border-round color-oscuro z-depth-4 mr-1 mb-1 ml-3 mt-1 ' }],
            });
        } else {
            $("#page-length-option2").DataTable({
                responsive: true,
                lengthMenu: [
                    [10, 25, 50, -1],
                    [10, 25, 50, "All"],
                ],
            });
        }
    });


});
