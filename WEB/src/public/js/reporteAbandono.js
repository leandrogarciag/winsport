document.addEventListener("DOMContentLoaded", () => {


    $("#page-length-option4").DataTable({
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

        let reporteAbandono = await postData("/reportes/getReporteAbandono", { data });
        $("#page-length-option4").DataTable().destroy();
        if (reporteAbandono.length > 0) {
            reporteAbandono.forEach(row => {
                if (row.FKGES_NUSU_CODIGO == null && row.GES_CDETALLE_ADICIONAL == 'BOT - MSG_MENU_02') {
                    row.motivo = document.querySelector('[data-i18n="No acepto terminos y condiciones"]').textContent;
                } else if (row.FKGES_NUSU_CODIGO == null && row.GES_CDETALLE_ADICIONAL != 'BOT - MSG_MENU_02') {
                    row.motivo = document.querySelector('[data-i18n="No completo el arbol"]').textContent;
                } else if (row.FKGES_NUSU_CODIGO != null && row.GES_CDETALLE_ADICIONAL2 == 'BOT - CERRADO INACTIVIDAD') {
                    row.motivo = 'AFK';
                } else {
                    row.motivo = 'OUT AFK';
                }
            });
            $("#page-length-option4").DataTable({
                data: reporteAbandono,
                columns: [
                    { data: 'USU_CUSUARIO' },
                    { data: 'GES_NUMERO_COMUNICA' },
                    //{ data: 'GES_CNIVEL' },
                    { data: 'GES_CHORA_INICIO_GESTION' },
                    { data: 'GES_CHORA_FIN_GESTION' },
                    { data: 'motivo' }
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
            $("#page-length-option4").DataTable({
                responsive: true,
                lengthMenu: [
                    [10, 25, 50, -1],
                    [10, 25, 50, "All"],
                ],
            });
        }
    });


});
