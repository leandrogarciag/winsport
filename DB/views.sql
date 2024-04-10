CREATE OR REPLACE VIEW view_chats_arbol AS
select PKGES_CODIGO, GES_NUMERO_COMUNICA as cliente, GES_CHORA_INICIO_GESTION as Inicio, GES_CHORA_FIN_GESTION as Fin, timediff(GES_CHORA_FIN_GESTION, GES_CHORA_INICIO_GESTION) as Duracion, GES_CDETALLE_ADICIONAL as OpcionArbol
from tbl_chats_management
where GES_ESTADO_CASO like "CLOSE" AND GES_CULT_MSGBOT like "MSG_FIN" AND GES_CDETALLE_ADICIONAL like "%BOT%";

CREATE OR REPLACE VIEW view_chats_espera AS
select PKGES_CODIGO as idchat, GES_NUMERO_COMUNICA as cliente, GES_CFECHA_PASOASESOR as fecha, timediff(now(), GES_CFECHA_PASOASESOR) as espera, GES_CNIVEL as nivel 
from tbl_chats_management
where GES_ESTADO_CASO like "OPEN" AND GES_CULT_MSGBOT like "MSG_FIN";
#AND DATE_FORMAT(GES_CFECHA_REGISTRO, '%Y-%m-%d') >= DATE_FORMAT(now(), '%Y-%m-%d');

CREATE OR REPLACE VIEW view_chats_activos AS
select PKGES_CODIGO as idchat,
GES_NUMERO_COMUNICA as cliente, 
U.USU_CUSUARIO as agente, 
U.USU_CAUXILIAR as auxiliar,
GES_CFECHA_REGISTRO as fecha, 
timediff(now(), GES_ULTIMO_ENVIADO) as tiempoUltimoEnviado,
timediff(now(), GES_ULTIMO_RECIBIDO)  as tiempoUltimoRecibido,
coalesce(timediff(GES_CFECHA_ASIGNACION, GES_CFECHA_PASOASESOR), timediff(now(), GES_CFECHA_PASOASESOR)) as asaCola,
coalesce(timediff(GES_PRIMERO_AGENTE, GES_CFECHA_ASIGNACION) , timediff(now(), GES_CFECHA_ASIGNACION)) as asaAgente,
timediff(now(), GES_CFECHA_REGISTRO) as tiempoTotal
from tbl_chats_management as g, tbl_usuarios as U
where GES_ESTADO_CASO  IN ("ATENDING","ATTENDING", "TRANSFERRED") AND FKGES_NUSU_CODIGO = PKUSU_NCODIGO;

CREATE OR REPLACE VIEW view_chats_estado AS
select a.chatsActivos, b.chatsEspera 
from 
(
	select count(GES_ESTADO_CASO) as chatsActivos 
    from tbl_chats_management 
    WHERE GES_ESTADO_CASO IN ("ATENDING","ATTENDING","TRANSFERRED")
    #AND DATE_FORMAT(GES_CFECHA_REGISTRO, '%Y-%m-%d') >= DATE_FORMAT(now(), '%Y-%m-%d')
)as a,
(
	select count(GES_ESTADO_CASO) as chatsEspera 
    from tbl_chats_management 
    WHERE GES_ESTADO_CASO like "OPEN"  AND GES_CULT_MSGBOT like "MSG_FIN"
    #AND DATE_FORMAT(GES_CFECHA_REGISTRO, '%Y-%m-%d') >= DATE_FORMAT(now(), '%Y-%m-%d')
) as b;

CREATE OR REPLACE VIEW view_agentes_conectados as
select USU_CUSUARIO as agente, USU_CSKILL as nivel, USU_CNOMBRE as nombre, USU_CAUXILIAR as estado, timediff(now(), USU_CFECHA_CAMBIO_AUXILIAR) as tiempo,
coalesce((
select count(FKGES_NUSU_CODIGO)
from tbl_usuarios, tbl_chats_management
where GES_ESTADO_CASO IN ("ATENDING","ATTENDING","TRANSFERRED")
and FKGES_NUSU_CODIGO = PKUSU_NCODIGO and a.PKUSU_NCODIGO = PKUSU_NCODIGO
), 0 )chats
from tbl_usuarios as a 
where USU_CAUXILIAR IN ("CONNECTED", "ONLINE", "LUNCH", "BATHROOM", "BREAK", "TRAINING") AND USU_CROL like "AGENTE"
order by chats desc, tiempo desc, estado;

CREATE OR REPLACE VIEW view_agentes_estado AS
SELECT a.agentesActivos, b.agentesPausa 
FROM 
(
	SELECT count(PKUSU_NCODIGO) AS agentesActivos 
    FROM tbl_usuarios 
    WHERE USU_CROL like "AGENTE" AND USU_CAUXILIAR LIKE "ONLINE"
)as a,
(
	SELECT count(PKUSU_NCODIGO) AS agentesPausa
    FROM tbl_usuarios 
    WHERE  USU_CROL like "AGENTE" AND USU_CAUXILIAR IN ("CONNECTED", "LUNCH", "BATHROOM", "BREAK", "TRAINING")
) AS b;

CREATE OR REPLACE VIEW view_chats_transferencias AS
SELECT FKTRA_NUSU_CODIGO as codigoUsuarioInicial, 
(select USU_CUSUARIO from tbl_usuarios where PKUSU_NCODIGO = T.FKTRA_NUSU_CODIGO) as usuarioInicial,
(SELECT USU_CSKILL FROM tbl_usuarios WHERE (PKUSU_NCODIGO = T.FKTRA_NUSU_CODIGO)) AS skillUsuarioInicial,
FKTRA_NUSU_TRANSFERIDO as codigoUsuarioFinal,
(select USU_CUSUARIO from tbl_usuarios where PKUSU_NCODIGO = T.FKTRA_NUSU_TRANSFERIDO) as usuarioFinal,
(SELECT USU_CSKILL FROM tbl_usuarios WHERE (PKUSU_NCODIGO = T.FKTRA_NUSU_TRANSFERIDO)) AS skillUsuarioFinal,
FKTRA_NGES_CODIGO as codigoGestion, GES_NUMERO_COMUNICA as cliente,TRA_MOTIVO as motivo, TRA_OBSERVACION as observacion, GES_CHORA_INICIO_GESTION as fechaInicio, TRA_CFECHA_REGISTRO as fechaTransferencia
FROM tbl_transfers as T, tbl_chats_management
WHERE FKTRA_NGES_CODIGO = PKGES_CODIGO;

CREATE OR REPLACE VIEW view_reporte_abandono AS
SELECT PKGES_CODIGO, FKGES_NUSU_CODIGO, USU_CUSUARIO ,GES_ESTADO_CASO, GES_NUMERO_COMUNICA, GES_CHORA_INICIO_GESTION, GES_CHORA_FIN_GESTION, GES_CNIVEL, GES_CDETALLE_ADICIONAL, GES_CDETALLE_ADICIONAL2
FROM tbl_chats_management, tbl_usuarios
WHERE FKGES_NUSU_CODIGO = PKUSU_NCODIGO
AND GES_ESTADO_CASO = 'CLOSE'
AND GES_CDETALLE_ADICIONAL2 like "%BOT%";

CREATE OR REPLACE VIEW view_asignacion AS
WITH agentesOnline AS (
	SELECT PKUSU_NCODIGO, USU_NCHATS as chatMaximos, USU_CSKILL as nivel FROM tbl_usuarios WHERE USU_CAUXILIAR = "ONLINE"
), 
cantidadChats AS (
	SELECT count(FKGES_NUSU_CODIGO) as cantidadAsignados, FKGES_NUSU_CODIGO  FROM tbl_chats_management WHERE GES_ESTADO_CASO != "CLOSE"  AND GES_CULT_MSGBOT = "MSG_FIN" GROUP BY FKGES_NUSU_CODIGO
)
SELECT A.PKUSU_NCODIGO as IDusuario, COALESCE(B.cantidadAsignados, 0) as cantidadAsignados, A.chatMaximos, A.nivel, COALESCE((A.chatMaximos - B.cantidadAsignados), chatMaximos) AS capacidad
FROM agentesOnline as A 
LEFT JOIN
cantidadChats as B ON A.PKUSU_NCODIGO = B.FKGES_NUSU_CODIGO;

CREATE OR REPLACE VIEW view_chats_arbol AS
select PKGES_CODIGO, GES_NUMERO_COMUNICA as cliente, GES_CHORA_INICIO_GESTION as Inicio, GES_CHORA_FIN_GESTION as Fin, timediff(GES_CHORA_FIN_GESTION, GES_CHORA_INICIO_GESTION) as Duracion, GES_CDETALLE_ADICIONAL as OpcionArbol
from tbl_chats_management
where GES_ESTADO_CASO like "CLOSE" AND GES_CULT_MSGBOT like "MSG_FIN" AND GES_CDETALLE_ADICIONAL like "%BOT%";

CREATE OR REPLACE VIEW view_chats_espera AS
select PKGES_CODIGO as idchat, GES_NUMERO_COMUNICA as cliente, GES_CFECHA_PASOASESOR as fecha, timediff(now(), GES_CFECHA_PASOASESOR) as espera, GES_CNIVEL as nivel 
from tbl_chats_management
where GES_ESTADO_CASO like "OPEN" AND GES_CULT_MSGBOT like "MSG_FIN";
#AND DATE_FORMAT(GES_CFECHA_REGISTRO, '%Y-%m-%d') >= DATE_FORMAT(now(), '%Y-%m-%d');

CREATE OR REPLACE VIEW view_chats_activos AS
select PKGES_CODIGO as idchat,
GES_NUMERO_COMUNICA as cliente, 
U.USU_CUSUARIO as agente, 
U.USU_CAUXILIAR as auxiliar,
GES_CFECHA_REGISTRO as fecha, 
timediff(now(), GES_ULTIMO_ENVIADO) as tiempoUltimoEnviado,
timediff(now(), GES_ULTIMO_RECIBIDO)  as tiempoUltimoRecibido,
coalesce(timediff(GES_CFECHA_ASIGNACION, GES_CFECHA_PASOASESOR), timediff(now(), GES_CFECHA_PASOASESOR)) as asaCola,
coalesce(timediff(GES_PRIMERO_AGENTE, GES_CFECHA_ASIGNACION) , timediff(now(), GES_CFECHA_ASIGNACION)) as asaAgente,
timediff(now(), GES_CFECHA_REGISTRO) as tiempoTotal
from tbl_chats_management as g, tbl_usuarios as U
where GES_ESTADO_CASO  IN ("ATENDING","ATTENDING","TRANSFERRED") AND FKGES_NUSU_CODIGO = PKUSU_NCODIGO;

CREATE OR REPLACE VIEW view_chats_estado AS
select a.chatsActivos, b.chatsEspera 
from 
(
	select count(GES_ESTADO_CASO) as chatsActivos 
    from tbl_chats_management 
    WHERE GES_ESTADO_CASO IN ("ATENDING","ATTENDING","TRANSFERRED")
    #AND DATE_FORMAT(GES_CFECHA_REGISTRO, '%Y-%m-%d') >= DATE_FORMAT(now(), '%Y-%m-%d')
)as a,
(
	select count(GES_ESTADO_CASO) as chatsEspera 
    from tbl_chats_management 
    WHERE GES_ESTADO_CASO like "OPEN"  AND GES_CULT_MSGBOT like "MSG_FIN"
    #AND DATE_FORMAT(GES_CFECHA_REGISTRO, '%Y-%m-%d') >= DATE_FORMAT(now(), '%Y-%m-%d')
) as b;

CREATE OR REPLACE VIEW view_agentes_conectados as
select USU_CUSUARIO as agente, USU_CSKILL as nivel, USU_CNOMBRE as nombre, USU_CAUXILIAR as estado, timediff(now(), USU_CFECHA_CAMBIO_AUXILIAR) as tiempo,
coalesce((
select count(FKGES_NUSU_CODIGO)
from tbl_usuarios, tbl_chats_management
where GES_ESTADO_CASO IN ("ATENDING","ATTENDING","TRANSFERRED")
and FKGES_NUSU_CODIGO = PKUSU_NCODIGO and a.PKUSU_NCODIGO = PKUSU_NCODIGO
), 0 )chats
from tbl_usuarios as a 
where USU_CAUXILIAR IN ("CONNECTED", "ONLINE", "LUNCH", "BATHROOM", "BREAK", "TRAINING") AND USU_CROL like "AGENTE"
order by chats desc, tiempo desc, estado;

CREATE OR REPLACE VIEW view_agentes_estado AS
SELECT a.agentesActivos, b.agentesPausa 
FROM 
(
	SELECT count(PKUSU_NCODIGO) AS agentesActivos 
    FROM tbl_usuarios 
    WHERE USU_CROL like "AGENTE" AND USU_CAUXILIAR LIKE "ONLINE"
)as a,
(
	SELECT count(PKUSU_NCODIGO) AS agentesPausa
    FROM tbl_usuarios 
    WHERE  USU_CROL like "AGENTE" AND USU_CAUXILIAR IN ("CONNECTED", "LUNCH", "BATHROOM", "BREAK", "TRAINING")
) AS b;

CREATE OR REPLACE VIEW view_chats_transferencias AS
SELECT FKTRA_NUSU_CODIGO as codigoUsuarioInicial, 
(select USU_CUSUARIO from tbl_usuarios where PKUSU_NCODIGO = T.FKTRA_NUSU_CODIGO) as usuarioInicial,
(SELECT USU_CSKILL FROM tbl_usuarios WHERE (PKUSU_NCODIGO = T.FKTRA_NUSU_CODIGO)) AS skillUsuarioInicial,
FKTRA_NUSU_TRANSFERIDO as codigoUsuarioFinal,
(select USU_CUSUARIO from tbl_usuarios where PKUSU_NCODIGO = T.FKTRA_NUSU_TRANSFERIDO) as usuarioFinal,
(SELECT USU_CSKILL FROM tbl_usuarios WHERE (PKUSU_NCODIGO = T.FKTRA_NUSU_TRANSFERIDO)) AS skillUsuarioFinal,
FKTRA_NGES_CODIGO as codigoGestion, GES_NUMERO_COMUNICA as cliente,TRA_MOTIVO as motivo, TRA_OBSERVACION as observacion, GES_CHORA_INICIO_GESTION as fechaInicio, TRA_CFECHA_REGISTRO as fechaTransferencia
FROM tbl_transfers as T, tbl_chats_management
WHERE FKTRA_NGES_CODIGO = PKGES_CODIGO;

CREATE OR REPLACE VIEW view_reporte_abandono AS
SELECT PKGES_CODIGO, FKGES_NUSU_CODIGO, USU_CUSUARIO ,GES_ESTADO_CASO, GES_NUMERO_COMUNICA, GES_CHORA_INICIO_GESTION, GES_CHORA_FIN_GESTION, GES_CNIVEL, GES_CDETALLE_ADICIONAL, GES_CDETALLE_ADICIONAL2
FROM tbl_chats_management, tbl_usuarios
WHERE FKGES_NUSU_CODIGO = PKUSU_NCODIGO
AND GES_ESTADO_CASO = 'CLOSE'
AND GES_CDETALLE_ADICIONAL2 like "%BOT%";



CREATE OR REPLACE VIEW view_asignacion AS
WITH agentesOnline AS (
	SELECT PKUSU_NCODIGO, USU_NCHATS as chatMaximos, USU_CSKILL as nivel FROM tbl_usuarios WHERE USU_CAUXILIAR = "ONLINE"
), 
cantidadChats AS (
	SELECT count(FKGES_NUSU_CODIGO) as cantidadAsignados, FKGES_NUSU_CODIGO  FROM tbl_chats_management WHERE GES_ESTADO_CASO != "CLOSE"  AND GES_CULT_MSGBOT = "MSG_FIN" GROUP BY FKGES_NUSU_CODIGO
)
SELECT A.PKUSU_NCODIGO as IDusuario, COALESCE(B.cantidadAsignados, 0) as cantidadAsignados, A.chatMaximos, A.nivel, COALESCE((A.chatMaximos - B.cantidadAsignados), chatMaximos) AS capacidad
FROM agentesOnline as A 
LEFT JOIN
cantidadChats as B ON A.PKUSU_NCODIGO = B.FKGES_NUSU_CODIGO;

CREATE OR REPLACE VIEW view_reporte_interacciones AS    
    SELECT 
    PKGES_CODIGO, 
	PKUSU_NCODIGO, 
	USU_CUSUARIO AS agente, 
	GES_NUMERO_COMUNICA AS cliente, 
    GES_CNIVEL as nivel,        
        (SELECT TYP_TIPIFICACION FROM  tbl_typifications WHERE FKTYP_NGES_CODIGO = a.PKGES_CODIGO limit 1) as tipificacion,
        (SELECT TYP_SUBTIPIFICACION FROM tbl_typifications WHERE FKTYP_NGES_CODIGO = a.PKGES_CODIGO limit 1) as radicado,
       GES_CDETALLE_ADICIONAL AS OpcionArbol,
       GES_CDETALLE_ENCUESTA AS Encuesta,
       GES_CDETALLE_ADICIONAL2 AS Detalle,
       GES_CFECHA_REGISTRO AS fechaInicio,
       GES_CFECHA_PASOASESOR AS fechaPasoAsesor,
       GES_CFECHA_ASIGNACION AS fechaAsignacion,
       GES_CHORA_FIN_GESTION AS fechaFin,
       timediff(GES_CHORA_FIN_GESTION, GES_CFECHA_REGISTRO) AS tiempo
    FROM tbl_usuarios, tbl_chats_management as a
    WHERE GES_ESTADO_CASO LIKE "CLOSE" AND FKGES_NUSU_CODIGO = PKUSU_NCODIGO;