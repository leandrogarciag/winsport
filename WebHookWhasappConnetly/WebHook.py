import os
import sys

def getPath():
    getSctiptPath = os.path.abspath(__file__)
    scriptPath = os.path.dirname(getSctiptPath)
    return scriptPath
customPath = os.path.join(getPath(),'venv', 'lib', 'python3.8','site-packages')
sys.path.insert(0, customPath)

from flask import Flask, send_file, jsonify, request
from waitress import serve
from crypt import *
import logging
from logging.handlers import RotatingFileHandler
import requests
import json
import pymysql
import threading
import time
import json
import re
import pytz
import traceback
import networkx as nx
from networkx import Graph
with open('/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALWINSPORT/config.json', 'r') as f:
    config = json.load(f)
IPServidor = '41785A3245774C6D41775232446D4C3441784C335A6D7030' 
UsuarioServidor = '41775A324577706D41484C325A6D706C4178443D'
ContrasenaServidor = '417770324147706D416D443242474D5441784832416D4C31417848324147706C41775232446D4C6D41784C335A6D414F5A6D566D5A515A6C5A6D4E3D'
BaseDatosServidor = '417744325A77706A41484C33416D4C344177523341514954416D703242474D53416D5A335A514D54416D5633414E3D3D'
port = 3306
global account_sid
global auth_token
global botWhatsappNum
global RutaProyecto
global URL
global graph_tree
#Se crea una instancia de Flask para el servidor
app = Flask(__name__)
# Configura el controlador para el archivo de registro con rotación
log_filename = '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALWINSPORT/WebHookWhasappConnetly/logs/Webhook.log'
max_log_size = 10 * 1024 * 1024  # X MB
backup_count = 5  # Número de archivos de respaldo a mantener
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
file_handler = RotatingFileHandler(log_filename, maxBytes=max_log_size, backupCount=backup_count)
file_handler.setFormatter(formatter)
# Configura el nivel de registro para el archivo de registro
file_handler.setLevel(logging.INFO)
# Crea un controlador adicional para mostrar los registros en la terminal
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
console_handler.setFormatter(console_formatter)
# Configura el nivel de registro para la salida en la terminal
logging.basicConfig(level=logging.INFO, handlers=[file_handler])
logging.getLogger().addHandler(console_handler)
#Función para establecer la conexión a la base de datos MySQL
def connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port):
    port = 3306
    # Se retorna una conexión a la base de datos con los parámetros especificados
    # host: dirección del servidor de base de datos
    # user: nombre de usuario de la base de datos
    # password: contraseña del usuario de la base de datos
    # db: nombre de la base de datos a conectarse
    # use_unicode: habilita el uso de caracteres unicode en la conexión
    # charset: conjunto de caracteres utilizado en la conexión
    # cursorclass: tipo de cursor que se utilizará en la conexión 
    return pymysql.connect(host=DeCrypt(IPServidor), port=port ,user=DeCrypt(UsuarioServidor),password=DeCrypt(ContrasenaServidor), database=DeCrypt(BaseDatosServidor),use_unicode=True, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
    # return pymysql.connect(host=DeCrypt(IPServidor) ,user=DeCrypt(UsuarioServidor),password=DeCrypt(ContrasenaServidor), db=DeCrypt(BaseDatosServidor),use_unicode=True, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
#Función para obtener los datos de configuración de la aplicación a partir de un código de perfilamiento
def lineProfiling(code):
    # Se inicializan las variables globales necesarias para la aplicación
    global account_sid
    global auth_token
    global botWhatsappNum
    global RutaProyecto
    global URL
    # Se establece la conexión a la base de datos
    connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
    # Se habilita la opción de autocommit en la conexión para que los cambios se guarden de manera automática
    connectionMySQL.autocommit(True)
    # Se obtiene un cursor para realizar consultas a la base de datos
    with connectionMySQL.cursor() as cursor:
        
        # Se crea la consulta SQL para obtener los datos del perfilamiento a partir del código proporcionado
        sql = f"SELECT * FROM {DeCrypt(BaseDatosServidor)}.tbl_line_profiling WHERE PKLIPR_NCODE = '{code}';"
        # Se ejecuta la consulta
        cursor.execute(sql)
        # Se obtienen todos los resultados de la consulta
        rows = cursor.fetchall()
        # Si no se obtuvieron resultados, se muestra un mensaje de error
        if len(rows) == 0:
            app.logger.info("No se encontró el codigo de perfilamiento indicado, por favor validar que el mismo esté registrado en la base de datos principal.")
            exit()
        else:
            account_sid = DeCrypt(rows[0]["LIPR_ACCOUNT_ID"])
            auth_token = DeCrypt(rows[0]["LIPR_API_KEY"])
            botWhatsappNum = rows[0]["LIPR_WHATSAPP_NUM"]
            RutaProyecto = rows[0]["LIPR_PROJECT_ROUTE"]
            URL = rows[0]["LIPR_URL_BOT"]
    connectionMySQL.close
#Función para enviar un mensaje de texto a través de WhatsApp
def sendMessage(whatsappNum, textBody, lastrowid, node):
    # print(whatsappNum)
    global graph_tree
    #Enviar mensaje de respuesta
    lineProfiling("1")
    
    # Se construye la URL para enviar un mensaje a través de la API de Connectly
    print("paso el lineProfiling")
    if node != 0:
        Media = graph_tree.nodes[node]["BTREE_TEXTO"]
        tipoMedia = graph_tree.nodes[node]["BTREE_OPCIONES"]
        if graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "TEMPLATE":
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/whatsapp_templated_messages"
            payload = json.dumps({
                
                "sender": botWhatsappNum,
                "number": whatsappNum,
                "templateName": Media,
                "language": tipoMedia,
                "parameters": []
                
            })
        elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "ADJUNTOS":
            print("entre a adjuntos")
            if tipoMedia == "document":
                url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
                payload = json.dumps({
                    "sender": {
                        "id": botWhatsappNum,
                        "channelType": "whatsapp"
                    },
                    "recipient": {
                        "id": whatsappNum,
                        "channelType": "whatsapp"
                    },
                    "message": {
                        "attachments": [
                            {
                                "type": tipoMedia,
                                "url": os.path.join(URL,"videosGopass", Media),
                                "filename": Media
                            }
                        ]
                    }
                })
            else:
                url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
                payload = json.dumps({
                    "sender": {
                        "id": botWhatsappNum,
                        "channelType": "whatsapp"
                    },
                    "recipient": {
                        "id": whatsappNum,
                        "channelType": "whatsapp"
                    },
                    "message": {
                        "attachments": [
                            {
                                "type": tipoMedia,
                                "url": os.path.join(URL, "videosGopass", Media)
                            }
                        ]
                    }
                })
        elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "BUTTON":
            print("Entro a BUTTON")
            opciones = graph_tree.nodes[node]["BTREE_OPCIONES"].split(',')
            print("opciones:", opciones)
            buttons = [{"id": str(i + 1), "text": opcion} for i, opcion in enumerate(opciones)]
            print("buttons:", buttons)
            #Para agregar un header agregar dentro de replyButtonMessage
            """ "header": {"text": "Header"} """
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            payload = json.dumps ({
                "recipient": {
                    "id": whatsappNum,
                    "channelType": "whatsapp"
                },
                "message": {
                    "text": textBody,
                    "replyButtonMessage": {
                        # "footer": {
                        #     "text": "Selecciona una de las opciones"
                        # },
                        "buttons": buttons
                    }
                }
            })
        elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "LIST":
            opciones = graph_tree.nodes[node]["BTREE_OPCIONES"].split(',')
            buttons = [{"id": str(i + 1), "text": opcion} for i, opcion in enumerate(opciones)]
            #Para agregar un header agregar dentro de listMessage
            """ "header": {"text": "Header"} """
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            payload = json.dumps ({
                "recipient": {
                    "id": whatsappNum,
                    "channelType": "whatsapp"
                },
                "message": {
                    "text": textBody,
                    "listMessage": {
                        "footer": {
                            "text": "Seleccione una opción."
                        },
                        "button": {
                            "text": "Seleccione"
                        },
                        "sections": [
                            {          
                            "rows": buttons
                            }
                        ]
                    }
                }
            })
        elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "LOC":
            opciones = graph_tree.nodes[node]["BTREE_OPCIONES"].split(',')
            latitude = float(opciones[0])
            longitude = float(opciones[1])
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            payload = json.dumps ({
                "recipient": {
                    "id": whatsappNum,
                    "channelType": "whatsapp"
                },
                "message": {
                    "location": {
                        "latitude": latitude,
                        "longitude": longitude,
                        "name": textBody,
                        "address": opciones[2]
                    }
                }
            })        
        elif type(textBody) is dict:
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            payload = json.dumps({
            "recipient": {
                "id": whatsappNum,
                "channelType": "whatsapp"
                
            },
            
            "message": {
                "location": {
                    "latitude": textBody['latitud'],
                    "longitude": textBody['longitud'],
                    "name": textBody['nombre'],
                    "address": textBody['direccion']
                }
            }
            })        
        else:
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            payload = json.dumps({
            "recipient": {
                "channelType": "whatsapp",
                "id": whatsappNum
            },
            "message": {
                "text": textBody
            }
            })
    else:
        url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
        payload = json.dumps({
        "recipient": {
            "channelType": "whatsapp",
            "id": whatsappNum
        },
        "message": {
            "text": textBody
        }
        })
        
    # Se crean los headers necesarios para enviar la solicitud a la API
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': auth_token
    }
    
    # Se envía la solicitud a la API para enviar el mensaje
    response = requests.request("POST", url, headers=headers, data=payload)
    print("Response Status:", response.status_code)
    print("Response Body:", response.text)
    # Se establece la conexión a la base de datos
    connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
    # Se habilita la opción de autocommit en la conexión para que los cambios se guarden de manera automática
    connectionMySQL.autocommit(True)
    # Se obtiene un cursor para realizar consultas a la base de datos
    with connectionMySQL.cursor() as cursor:
    # Se crea la consulta SQL para actualizar el registro de la base de datos con el id proporcionado
        message=str(textBody)
        texto_message = message.replace("{", str(ord("{"))).replace("}", str(ord("}")))
        texto_limpio=texto_message.replace("'", "").replace(",", " ")
        idp={str(json.loads(response.text)['id'])}
        sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY, MES_FROM, MES_TO, MES_CHANNEL, MES_MESSAGE_ID, MES_USER) VALUES ('{str(lastrowid)}', '{str(account_sid)}', '{texto_limpio}', '{str(botWhatsappNum)}', '{str(whatsappNum)}', 'SEND', '{str(json.loads(response.text)['id'])}','BOT');"
        # Se ejecuta la consulta
        cursor.execute(sql)
       
        #app.logger.info(whatsappNum,"\n", textBody,"\n",lastrowid)
        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = '{str(lastrowid)}';"
        cursor.execute(sql)
        
    # Se cierra la conexión a la base de datos
    connectionMySQL.close
    
def arbol(lastrowid, whatsappNum, Body):
    
    global graph_tree
    err_msg = "Por favor marque una opción válida"
    
    # msg_masivo_despedida = "¡Adios, muchas gracias por su respuesta!"
    connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
    connectionMySQL.autocommit(True)
    with connectionMySQL.cursor() as cursor:
        sql = f"SELECT PKGES_CODIGO, GES_ESTADO_CASO, GES_CULT_MSGBOT, GES_CDETALLE_ADICIONAL FROM {DeCrypt(BaseDatosServidor)}.tbl_chats_management WHERE PKGES_CODIGO = '{str(lastrowid)}' AND GES_NUMERO_COMUNICA = '{whatsappNum}' AND GES_CESTADO = 'Activo' ORDER BY PKGES_CODIGO DESC LIMIT 1;"
        cursor.execute(sql)
        rows = cursor.fetchall()
        if len(rows) > 0:
            # Estado para grafo
            if rows[0]["GES_CULT_MSGBOT"] == "MSG_SALUDO":
                # Obtención nodo 
                # Si es NULL se asigna
                if rows[0]["GES_CDETALLE_ADICIONAL"] is None:
                    #node = 5
                    MSG_SALUDO = "Hola, en un momento será atendido por uno de nuestros asesores"
                     # Enviar saludo
                    sendMessage(whatsappNum, MSG_SALUDO, lastrowid,0)
                    # Enviar mensaje del árbol de decisiones
                    #sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                    # Actualizar el estado del caso en la base de datos
                    #sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CFECHA_PASOASESOR = Now(), GES_CULT_MSGBOT = 'MSG_FIN'  WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    #sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE',GES_CULT_MSGBOT = 'MSG_FIN', GES_CDETALLE_ADICIONAL = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    
                    """ if Body.isnumeric() and  int(Body) == 1: 
                        node = 1
                        sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE',GES_CULT_MSGBOT='MSG_SALUDO', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                        cursor.execute(sql)
                    elif Body.isnumeric() and  int(Body) == 2:     
                        mensajeFinal = "Gracias por preferir nuestros servicios."              
                        sendMessage(whatsappNum, mensajeFinal, lastrowid, 0)
                        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE',GES_CULT_MSGBOT = 'MSG_FIN', GES_CDETALLE_ADICIONAL = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                        cursor.execute(sql)
                    else:
                        sendMessage(whatsappNum, err_msg, lastrowid,0) """
                    """ """
                    cursor.execute(sql)                
                else:
                    node = int(rows[0]["GES_CDETALLE_ADICIONAL"])
                    verificar_tipo_result = verificar_tipo(Body, lastrowid, whatsappNum, node)
                    print("verificar_tipo_result", verificar_tipo_result)
                    if verificar_tipo_result == 1:
                        # Si el nodo tiene más de un hijo
                        if graph_tree.out_degree(node) > 1:
                            hijos = list(graph_tree.successors(node))
                            hijo = None
                            i = 0
                            if graph_tree.nodes[node]["BTREE_OPCIONES"] != None:
                                opciones = graph_tree.nodes[node]["BTREE_OPCIONES"].split(',')
                                peso_deseado = opciones.index(Body)
                            else:
                                peso_deseado = None
                            # Obtiene el nodo correspondiente según el peso de la arista entre 
                            # el nodo actual y el nodo elegido con el Body
                            while i < len(hijos) and hijo is None:
                                sucesor = hijos[i]
                                for arista in graph_tree[node][sucesor].values():
                                    if peso_deseado == None and arista['weight'] == (int(Body)-1):
                                        hijo = sucesor
                                    elif arista['weight'] == peso_deseado:
                                        hijo = sucesor
                                i += 1
                            node = graph_tree.nodes[hijo]["PKBTREE_NCODIGO"]                            
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql)
                            
                        # Si el nodo tiene solamente un hijo
                        elif graph_tree.out_degree(node) == 1:
                            node = next(graph_tree.successors(node), None)
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql)     
                        
                    elif verificar_tipo_result == 3:
                        if int(rows[0]["GES_CDETALLE_ADICIONAL"]) in {3, 4, 5, 6, 7, 8, 9}:                            
                            node=2
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql)
                            
                    # Nombre        
                    elif verificar_tipo_result == 4:   
                        node=42
                        sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}', GES_CLIENTE_NOMBRE = '{Body}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                        cursor.execute(sql)
                        return 
                    # Email
                    elif verificar_tipo_result == 5:   
                        node=43
                        sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CFECHA_PASOASESOR = Now(), GES_CULT_MSGBOT = 'MSG_FIN', GES_CDETALLE_ADICIONAL = '{str(node)}', GES_CLIENTE_EMAIL = '{Body}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                        cursor.execute(sql)
                        return
                    
                    elif verificar_tipo_result == 6:
                        phone_str = str(Body)
                        if len(phone_str) == 10 and phone_str.startswith('3'):
                            send_to_vicidial(Body)
                            node = next(graph_tree.successors(node), None)
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql)
                           
                        else:
                            sendMessage(whatsappNum, "Por favor ingresa un número de celular válido", lastrowid,node)
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql)
                            pass
                                                      
                    # Verifica si la respuesta es correcta para casos específicos 
                    elif verificar_tipo_result > 2:
                        pass
                    
   
                    # Si la respuesta en el Body es la correcta se envía el mensaje 
                    if verificar_tipo_result != 2:
                        sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                        time.sleep(2)
                        # Ciclo para los nodos que no necesitan respuesta, se envían continuamente
                        while graph_tree.nodes[node]["BTREE_TIPO_MSG"] == 'AUTO':
                                parent_node = node
                                print(parent_node)
                                node = node + 1
                                sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                                sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = '{str(node)}', GES_CFECHA_PASOASESOR = Now() WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                                cursor.execute(sql)
                        if graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "MSG_FIN":
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CFECHA_PASOASESOR = Now(), GES_CULT_MSGBOT = 'MSG_FIN'  WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            print(sql)
                            cursor.execute(sql)
                       
                        
                        elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "MSG_FINAL":
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE', GES_CULT_MSGBOT = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql)             
                            
                        """  elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "MSG_FINAL":
                            calificaciones = {
                                1: "Mala",
                                2: "Regular",
                                3: "Buena",
                                4: "Excelente"
                            }                            
                            calificacion_body = calificaciones.get(int(Body))
                            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE', GES_CULT_MSGBOT = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION', GES_CDETALLE_ENCUESTA = '{str(calificacion_body)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                            cursor.execute(sql) """       
                    else:
                        sendMessage(whatsappNum, err_msg, lastrowid,0)                              
           
            #INICIO MASIVO
            elif rows[0]["GES_CULT_MSGBOT"] == "MSG_MASIVO":
                if Body.isnumeric() and  int(Body) == 1: 
                    node = 1
                    sendMessage(whatsappNum, graph_tree.nodes[node]["BTREE_TEXTO"], lastrowid,node)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN',GES_CULT_MSGBOT='MSG_SALUDO', GES_CDETALLE_ADICIONAL = '{str(node)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                elif Body.isnumeric() and  int(Body) == 2:     
                    mensajeFinal = "Gracias por preferir nuestros servicios."              
                    sendMessage(whatsappNum, mensajeFinal, lastrowid, 0)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE',GES_CULT_MSGBOT = 'MSG_FIN', GES_CDETALLE_ADICIONAL = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                else:
                    sendMessage(whatsappNum, err_msg, lastrowid,0)
                
                
            #INICIO ENCUESTA
            elif rows[0]["GES_CULT_MSGBOT"] == "MSG_ENCUESTA":
                print('Entra a encuestas')
                if rows[0]["GES_CDETALLE_ADICIONAL"] == '43' and Body.isnumeric() and ( 1 <= int(Body) <= 2):   
                    pregunta2 = "En la escala del 1 al 10, ¿cómo calificaría la calidad del servicio en línea que recibió? (10 = Muy satisfecho; 1 = Muy insatisfecho)"            
                    sendMessage(whatsappNum, pregunta2, lastrowid, 0)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = 'PREGUNTA2', GES_PREGUNTA1 = '{str(Body)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                elif rows[0]["GES_CDETALLE_ADICIONAL"]=="PREGUNTA2" and Body.isnumeric() and (1 <= int(Body) <= 10):  
                    pregunta3 = "¡Muy bien!, Agradecemos que se sienta satisfecho con nuestro servicio. Por favor, díganos cuál de los siguientes aspectos le han sido más satisfactorios.\n\n1. WhatsApp sencillo de encontrar\n2. Conexión rápida al soporte en línea\n3. Soporte en línea amigable\n4. Respuesta rápida\n5. Comunicación eficaz\n6. Atención al cliente profesional\n7. Otros aspectos"
                    sendMessage(whatsappNum, pregunta3, lastrowid, 0)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = 'PREGUNTA3',GES_PREGUNTA2 = '{str(Body)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                elif rows[0]["GES_CDETALLE_ADICIONAL"]=="PREGUNTA3" and Body.isnumeric():
                    if  (1 <= int(Body) <= 6):     
                        mensajeFinal = "¡Gracias por tomarte el tiempo de compartir tu experiencia!"              
                        sendMessage(whatsappNum, mensajeFinal, lastrowid, 0)
                        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE',GES_CULT_MSGBOT = 'MSG_FIN', GES_CDETALLE_ADICIONAL = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION',GES_PREGUNTA3 = '{str(Body)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                        cursor.execute(sql)
                    elif(int(Body) == 7):     
                        mensajeMotiv = "¡Agradecemos mucho tu respuesta!, por favor dejanos saber el motivo de tu respuesta "              
                        sendMessage(whatsappNum, mensajeMotiv, lastrowid, 0)
                        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CDETALLE_ADICIONAL = 'MOTIVO',GES_PREGUNTA3 = '{str(Body)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                        cursor.execute(sql)
                    else:
                        sendMessage(whatsappNum, err_msg, lastrowid,0)
                elif rows[0]["GES_CDETALLE_ADICIONAL"]=="MOTIVO":     
                    mensajeFinal = "¡Gracias por tomarte el tiempo de compartir tu experiencia!"              
                    sendMessage(whatsappNum, mensajeFinal, lastrowid, 0)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE',GES_CULT_MSGBOT = 'MSG_FIN', GES_CDETALLE_ADICIONAL = 'MSG_FIN', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO AUTOGESTION',GES_MOTIVO = '{str(Body)}' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                else:
                    sendMessage(whatsappNum, err_msg, lastrowid,0)            
            #FIN ENCUESTA
#Administrar el arbol de atencion y asignacion de chats.
def manageTree(datMessageIn):
    # Mensaje que se enviará al usuario si aún está en la cola de atención
    waitingMessage = 'Su solicitud está en espera y pronto será atendida por uno de nuestros asesores. Por favor, aguarde un poco más, valoramos su tiempo y estamos trabajando para asistirle lo antes posible.'
    # Fecha y hora actual
    formatoHora = pytz.timezone('America/Bogota')
    current_date = datetime.datetime.now(formatoHora).strftime("%Y-%m-%d %H:%M:%S")
    # current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    lastrowid = 0
    # Inicializamos la variable comprobar como False
    comprobar = False
    
    # Establecemos la conexión a la base de datos
    connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
    # Habilitamos la opción de autocommit para que los cambios se guarden automáticamente
    connectionMySQL.autocommit(True)
    
    # Creamos un cursor para ejecutar consultas en la base de datos
    with connectionMySQL.cursor() as cursor:
        # Consultamos el último registro de la tabla tbl_chats_management para el usuario especificado en datMessageIn
        sql = f"SELECT PKGES_CODIGO, GES_ESTADO_CASO, GES_CULT_MSGBOT FROM {DeCrypt(BaseDatosServidor)}.tbl_chats_management WHERE GES_NUMERO_COMUNICA = '{datMessageIn['sender']['id']}' AND GES_CESTADO = 'Activo' ORDER BY PKGES_CODIGO DESC LIMIT 1;"
        app.logger.info(sql)
        cursor.execute(sql)
        rows = cursor.fetchall()
        # Si no hay ningún registro para el usuario, insertamos un nuevo registro en la tabla
        if len(rows) == 0:
            sql = f"""INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_chats_management (GES_ESTADO_CASO, GES_NUMERO_COMUNICA, GES_CULT_MSGBOT,  GES_CESTADO) 
                    VALUES ('OPEN', '{str(datMessageIn['sender']['id'])}', 'MSG_SALUDO',  'Activo');"""
            #app.logger.info(sql)
            cursor.execute(sql)
            lastrowid = cursor.lastrowid
            comprobar = True            
        else:
            # Si hay un registro para el usuario, verificamos el valor del campo GES_CULT_MSGBOT
            #Administrar arbol de atencion
            if rows[0]["GES_CULT_MSGBOT"] == "MSG_FIN":
                # Si el valor es "MSG_FIN", verificamos el valor del campo GES_ESTADO_CASO
                if rows[0]["GES_ESTADO_CASO"] == "OPEN":
                    # Si el valor es "OPEN", enviamos un mensaje al usuario y guardamos el ID del registro
                    lastrowid = rows[0]["PKGES_CODIGO"]
                    sendMessage(datMessageIn['sender']['id'], waitingMessage, lastrowid,0)
                elif rows[0]["GES_ESTADO_CASO"] == "CLOSE":
                    # Si el valor es "CLOSE", insertamos un nuevo registro en la tabla y establecemos la variable comprobar como True
                    sql = f"""INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_chats_management (GES_ESTADO_CASO, GES_NUMERO_COMUNICA, GES_CULT_MSGBOT,  GES_CESTADO) 
                            VALUES ('OPEN', '{str(datMessageIn['sender']['id'])}', 'MSG_SALUDO',  'Activo');"""
                    #app.logger.info(sql)
                    cursor.execute(sql)
                    lastrowid = cursor.lastrowid
                    comprobar = True
                elif rows[0]["GES_ESTADO_CASO"] == "ATTENDING":
                    # Si el valor es "ATTENDING", guardamos el ID del registro
                    lastrowid = rows[0]["PKGES_CODIGO"]
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_NAFK = 0 WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                elif rows[0]["GES_ESTADO_CASO"] == "TRANSFERRED":
                    # Si el valor es "TRANSFERRED", guardamos el ID del registro
                    lastrowid = rows[0]["PKGES_CODIGO"]
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_NAFK = 0 WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
            else:
                # Si el valor del campo GES_CULT_MSGBOT es diferente de "MSG_FIN", establecemos la variable comprobar como True y guardamos el ID del registro
                comprobar = True
                lastrowid = rows[0]["PKGES_CODIGO"]
        #Insertar la hora del mensaje recibido en la tabla de GESTION
        sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ULTIMO_RECIBIDO = now() WHERE PKGES_CODIGO = '{str(lastrowid)}';"
        cursor.execute(sql)
    connectionMySQL.close
    # Devolvemos las variables lastrowid y comprobar
    return lastrowid, comprobar
@app.before_request
def middleware():
    try:
        # Registra la dirección IP y la URL solicitada
        # Accede a información de la solicitud HTTP usando el objeto request
        ip_address = request.remote_addr
        http_method = request.method
        requested_url = request.url
        user_agent = request.user_agent.string
        # Puedes realizar cualquier lógica que necesites con esta información
        app.logger.info(f"IP: {ip_address}, Método: {http_method}, URL: {requested_url}")
        app.logger.info(f"User-Agent: {user_agent}")
    except Exception as e:
        # Maneja errores y registra cualquier excepción si ocurre
        app.logger.error(f"Error en el middleware: {str(e)}")
      
#Función para procesar los mensajes recibidos a través de WhatsApp
@app.route("/inwhatsapp", methods=["POST"])
def reply_whatsapp():
    msg_fueraHorario="¡Gracias por contactarnos!, por ahora no podemos atender tu solicitud, ya que hemos cerrado por hoy.\nTen por seguro te responderemos apenas leamos tu mensaje. Recuerda que nuestro horario de atención es de lunes a viernes de 8 a.m. a 5 p.m. y sábados de de 8 a.m. a 2 p.m"
    msg_noMultimedia = "Lamentamos informarte que, de acuerdo con nuestra política de seguridad, no podemos aceptar mensajes con imágenes."
    response = request.json
    app.logger.info(response)
    if 'message' in response:
        mensaje = str(response['message']['text'])
        mensajeID = str(response['message']['id'])
        if  'location' in response['message']:
            if response['message']['location'] is not None:
                if 'latitude' in response['message']['location'] and 'longitude' in response['message']['location']:
                    mensaje = json.dumps(response['message']['location'])
    elif 'buttonResponse' in response:
        mensaje = str(response['buttonResponse']['text'])
        mensajeID = str(response['buttonResponse']['id'])
  
    lastrowid, comprobar = manageTree(response)
    connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
    connectionMySQL.autocommit(True)
    with connectionMySQL.cursor() as cursor:
        try: 
            sql = f"SELECT PK_MES_NCODE FROM {DeCrypt(BaseDatosServidor)}.tbl_messages WHERE MES_MESSAGE_ID = %s" 
            cursor.execute(sql, (mensajeID))
            mensajeDuplicado = cursor.fetchall()
            #Si el mensaje se duplica por que la respuesta es muy demorada devolver un OK al proveedor
            if len(mensajeDuplicado) > 0:
                connectionDB.close
                return "OK"
            if len(response['message']['attachments']) == 0:
                sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY,  MES_TO, MES_FROM, MES_CHANNEL, MES_MESSAGE_ID, MES_SMS_STATUS) VALUES ('{str(lastrowid)}', '{str(account_sid)}', '{mensaje}', '{str(botWhatsappNum)}', '{str(response['sender']['id'])}', 'RECEIVED', '{mensajeID}', 'received');"
                print(sql)
            else:
                try:
                    r = requests.get(str(response['message']['attachments'][0]['url']), allow_redirects=True)
                    content_type = r.headers['content-type']
                    typeFile = str(content_type).split("/")[1]
                    #Quitar este IF y dejar contenido, quitar el else y el contenido para recibir MULTIMEDIA ADJUNTOS
                    #if (str(response['message']['attachments'][0]['type']) == "audio"):
                    if content_type.startswith("image/"):
                    # Si es una imagen, enviar mensaje de política y no guardar en la base de datos
                        sendMessage(str(response['sender']['id']), msg_noMultimedia, lastrowid, 0)
                        return "OK"
                    else:
                        filename = os.path.join(RutaProyecto, "receivedFiles", mensajeID + "." + typeFile)
                        open(filename, 'wb').write(r.content)
                        sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY, MES_TO, MES_FROM, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_SMS_STATUS) VALUES ('{str(lastrowid)}', '{str(account_sid)}', '{mensaje}', '{str(botWhatsappNum)}', '{str(response['sender']['id'])}', 'RECEIVED', '{mensajeID}', '{typeFile}', '{response['message']['attachments'][0]['url']}', 'received');"
                        print(sql)
                    #else:
                    #    sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY,  MES_TO, MES_FROM, MES_CHANNEL, MES_MESSAGE_ID, MES_SMS_STATUS) VALUES ('{str(lastrowid)}', '{str(account_sid)}', 'MULTIMEDIA', '{str(botWhatsappNum)}', '{str(response['sender']['id'])}', 'RECEIVED', '{mensajeID}', 'received');"
                except Exception as e:
                    app.logger.error(e)
                    print(e)
        except:
            if 'buttonResponse' in response:
                sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY,  MES_TO, MES_FROM, MES_CHANNEL, MES_MESSAGE_ID, MES_SMS_STATUS) VALUES ('{str(lastrowid)}', '{str(account_sid)}', '{mensaje}', '{str(botWhatsappNum)}', '{str(response['sender']['id'])}', 'RECEIVED', '{mensajeID}', 'received');"
        
        if 'buttonResponse' in response:
            sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY,  MES_TO, MES_FROM, MES_CHANNEL, MES_MESSAGE_ID, MES_SMS_STATUS) VALUES ('{str(lastrowid)}', '{str(account_sid)}', '{mensaje}', '{str(botWhatsappNum)}', '{str(response['sender']['id'])}', 'RECEIVED', '{mensajeID}', 'received');"        
        
        cursor.execute(sql) 
    
        """  # INICIO VALIDAR HORARIO DE ATENCION - HORA DE ATENCION
        if comprobar == True:
            # Obtener la hora actual en la zona horaria especificada
            formatoHora = pytz.timezone('America/Bogota')
            current_time = datetime.datetime.now(formatoHora).time()
            # Crear un objeto de tiempo que represente la hora de inicio y fin
            horaInicio = datetime.time(0, 0, 0)
            horaFin = datetime.time(23, 0, 0)
            # Obtener la fecha actual
            current_date = datetime.date.today()
            #Obtener dia de la semana actual de lunes (0) a viernes (4)
            diaSemana = current_date.weekday()
            # Formatear la fecha actual para la consulta
            fechaActualFormato = current_date.strftime('%Y-%m-%d')
            
            # FIN VALIDAR HORARIO DE ATENCION - HORA DE ATENCION """
        if comprobar == True:
            # Obtener la hora actual en la zona horaria especificada
            formatoHora = pytz.timezone('America/Bogota')
            current_time = datetime.datetime.now(formatoHora).time()

            # Crear un objeto de tiempo que represente la hora de inicio y fin
            horario_lv_inicio = datetime.time(8, 0, 0)
            horario_lv_fin = datetime.time(17, 0, 0)
            
            horario_sab_inicio = datetime.time(8, 0, 0)
            horario_sab_fin = datetime.time(14, 0, 0)
            # Obtener la fecha actual
            current_date = datetime.date.today()
            #Obtener dia de la semana actual de lunes (0) a viernes (4)
            diaSemana = current_date.weekday()

            # Validar si el día de la semana es de lunes (0) a viernes (4)
            if 0 <= diaSemana <= 4:
                #validar si se encuentra dentro del horario
                if horario_lv_inicio<= current_time <= horario_lv_fin:
                    pass
                else:
                    sendMessage(str(response['sender']['id']), msg_fueraHorario, lastrowid, 0)
                    #sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_CULT_MSGBOT = 'MSG_FIN', GES_ESTADO_CASO='OPEN', GES_CHORA_FIN_GESTION = now(), GES_CDETALLE_ADICIONAL2 = 'BOT - FUERA DE HORARIO' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CFECHA_PASOASESOR = Now(), GES_CULT_MSGBOT = 'MSG_FIN'  WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                    return "Ok"
            
            elif diaSemana == 5:
                if horario_sab_inicio<= current_time <= horario_sab_fin:
                    pass
                else:
                    sendMessage(str(response['sender']['id']), msg_fueraHorario, lastrowid, 0)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_CULT_MSGBOT = 'MSG_FIN', GES_ESTADO_CASO='CLOSE', GES_CHORA_FIN_GESTION = now(), GES_CDETALLE_ADICIONAL2 = 'BOT - FUERA DE HORARIO' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    #sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'OPEN', GES_CFECHA_PASOASESOR = Now(), GES_CULT_MSGBOT = 'MSG_FIN'  WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                    cursor.execute(sql)
                    return "Ok"
                    
            else:
                sendMessage(str(response['sender']['id']), msg_fueraHorario, lastrowid)
                sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_CULT_MSGBOT = 'MSG_FIN', GES_ESTADO_CASO='CLOSE', GES_CHORA_FIN_GESTION = now(), GES_CDETALLE_ADICIONAL2 = 'BOT - FUERA DE HORARIO' WHERE (PKGES_CODIGO = '{str(lastrowid)}');"
                cursor.execute(sql)
                return "Ok"

            # FIN VALIDAR HORARIO DE ATENCION - HORA DE ATENCION    
            
        
    connectionMySQL.close
    if comprobar == True:
        arbol(lastrowid, str(response['sender']['id']), mensaje)
    return "Ok"
# Se define una ruta en la aplicación Flask que permite descargar un archivo multimedia (como una imagen o un video) desde la aplicación. Al acceder a la ruta '/media/<nombre_del_archivo>', la función media_file se ejecutará y enviará el archivo al cliente.
@app.route('/media/<path:filename>')
def media_file(filename):
    # Se construye la ruta completa al archivo media utilizando la ruta del proyecto y el nombre del archivo
    file_path = os.path.join(RutaProyecto, "media", filename)
    # Se utiliza la función send_file de Flask para enviar el archivo al cliente
    return send_file(file_path)
"""permite enviar mensajes a través de WhatsApp. La función espera recibir algunos parámetros a través de una solicitud HTTP POST, como el número de WhatsApp al que se enviará el mensaje, el cuerpo del mensaje, un ID de gestión y algunos otros parámetros relacionados con la media.
La función luego verifica si alguno de los parámetros especificados es inválido. Si es así, devuelve un mensaje de error. Si no es así, se procede a enviar el mensaje a través de la API de WhatsApp utilizando la biblioteca requests.
Si se proporciona una media (como un archivo de imagen), se adjunta al mensaje utilizando una estructura de datos de tipo "attachments". Si no se proporciona una media, se envía el mensaje simplemente con el texto proporcionado.
Finalmente, la función guarda un registro del mensaje enviado en una base de datos MySQL y devuelve un mensaje de éxito."""
@app.route("/SendMessage", methods=["POST"])
def sendMessageWeb():
    # Obtener los valores de los parámetros de la solicitud HTTP POST
    whatsappNum = request.values.get('To')
    textBody = request.values.get('body')
    GestionID = request.values.get('GestionID')
    Media = request.values.get('Media')
    typeMedia = request.values.get('typeMedia')
    idAgent = request.values.get('idAgent')
   
    arrVideoTypes = ['mp4']
    arrImgenTypes = ['jpeg', 'png', 'webp', 'jpg']
    arrAudioTypes = ['mp3', 'aac', 'm4a', 'ogg', 'wav', 'mpeg']
    arrDocumentosTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv']
    # Verificar si alguno de los parámetros especificados es inválido
    if whatsappNum == None or whatsappNum == "" or GestionID == None or GestionID == "":
        # Devolver un mensaje de error si es así
        return "Alguno de los parametros indicados es invalido."
    else:
        # Si se ha proporcionado media (como un archivo de imagen)
        if Media == None or Media == "":
            # Enviar un mensaje simplemente con el texto proporcionado
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            urlm=os.path.join(URL, "media", Media)
            payload = json.dumps({
                "recipient": {
                    "channelType": "whatsapp",
                    "id": whatsappNum
                },
                "message": {
                    "text": textBody
                }
            })
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': auth_token
            }
            response = requests.request("POST", url, headers=headers, data=payload)
            try:
                if json.loads(response.text)["type"] == "ERROR_TYPE_FAILED_PRECONDITION":
                    return "ERROR_TYPE_FAILED_PRECONDITION"
            except Exception as e:
                # Establecer una conexión a la base de datos MySQL y autocommit en True
                connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
                connectionMySQL.autocommit(True)
                with connectionMySQL.cursor() as cursor:
                    # Insertar un registro del mensaje enviado en la base de datos
                    sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY, MES_FROM, MES_TO, MES_CHANNEL, MES_MESSAGE_ID, MES_USER) VALUES ('{str(GestionID)}', '{str(account_sid)}', '{str(textBody)}', '{str(botWhatsappNum)}', '{str(whatsappNum)}', 'SEND', '{str(json.loads(response.text)['id'])}', '{str(idAgent)}');"
                    cursor.execute(sql)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = '{str(GestionID)}';"
                    cursor.execute(sql)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_PRIMERO_AGENTE = NOW() WHERE PKGES_CODIGO = '{str(GestionID)}' AND GES_PRIMERO_AGENTE is null;"
                    cursor.execute(sql)
                  
                connectionMySQL.close
        else:
            typeMedia = str(typeMedia)#.split("/")[1]
            tipoMediaPartes = Media.split('.')   
            tipoMedia = "document"
            tipoMedia = "audio" if tipoMediaPartes[1] in arrAudioTypes else tipoMedia
            tipoMedia = "video" if tipoMediaPartes[1] in arrVideoTypes else tipoMedia
            tipoMedia = "image" if tipoMediaPartes[1] in arrImgenTypes else tipoMedia
            tipoMedia = "document" if tipoMediaPartes[1] in arrDocumentosTypes else tipoMedia
            # Si se proporciona media, adjuntarla al mensaje
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/messages"
            urlm=os.path.join(URL, "media", Media)
            if tipoMedia == "document":
                payload = json.dumps({
                    "sender": {
                        "id": botWhatsappNum,
                        "channelType": "whatsapp"
                    },
                    "recipient": {
                        "id": whatsappNum,
                        "channelType": "whatsapp"
                    },
                    "message": {
                        "attachments": [
                            {
                                "type": tipoMedia,
                                "url": os.path.join(URL, "media", Media),
                                "filename": Media
                            }
                        ]
                    }
                })
            else:
                payload = json.dumps({
                    "sender": {
                        "id": botWhatsappNum,
                        "channelType": "whatsapp"
                    },
                    "recipient": {
                        "id": whatsappNum,
                        "channelType": "whatsapp"
                    },
                    "message": {
                        "attachments": [
                            {
                                "type": tipoMedia,
                                "url": os.path.join(URL, "media", Media)
                            }
                        ]
                    }
                })
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': auth_token
            }
            response = requests.request("POST", url, headers=headers, data=payload)
            try:
                if json.loads(response.text)["type"] == "ERROR_TYPE_FAILED_PRECONDITION":
                    return "ERROR_TYPE_FAILED_PRECONDITION"
            except Exception as e:
                # Establecer una conexión a la base de datos MySQL y autocommit en True
                connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
                connectionMySQL.autocommit(True)
                with connectionMySQL.cursor() as cursor:
                    # Insertar un registro del mensaje enviado en la base de datos
                    sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY, MES_FROM, MES_TO, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_USER) VALUES ('{str(GestionID)}', '{str(account_sid)}', '{str(textBody)}', '{str(botWhatsappNum)}', '{str(whatsappNum)}', 'SEND', '{str(json.loads(response.text)['id'])}', '{str(typeMedia)}', '{str(Media)}', '{str(idAgent)}');"
                    cursor.execute(sql)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = '{str(GestionID)}';"
                    cursor.execute(sql)
                    sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_PRIMERO_AGENTE = NOW() WHERE PKGES_CODIGO = '{str(GestionID)}' AND GES_PRIMERO_AGENTE is null;"
                    cursor.execute(sql)
                  
                connectionMySQL.close
        
        return response.text
    
@app.route("/SendTemplate", methods=["POST"])
def SendTemplate():
    # Obtener los valores de los parámetros de la solicitud HTTP POST
    whatsappNum = request.values.get('To')
    GestionID = request.values.get('GestionID')
    templateName = request.values.get('templateName')
    language = request.values.get('language')
    # Verificar si alguno de los parámetros especificados es inválido
    if whatsappNum == None or whatsappNum == "" or GestionID == None or GestionID == ""  or templateName == None or templateName == "":
        # Devolver un mensaje de error si es así
        return "Alguno de los parametros indicados es invalido."
    else:
        # Si se proporciona media, adjuntarla al mensaje
            url = f"https://api.connectly.ai/v1/businesses/{account_sid}/send/whatsapp_templated_messages"
            payload = json.dumps({
                
                "sender": botWhatsappNum,
                "number": whatsappNum,
                "templateName": templateName,
                "language": language,
                "parameters": []
                
            })
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-Key': auth_token
            }
            response = requests.request("POST", url, headers=headers, data=payload)
     # Establecer una conexión a la base de datos MySQL y autocommit en True
    connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
    connectionMySQL.autocommit(True)
    with connectionMySQL.cursor() as cursor:
        if response.status_code == 400:
           
            #Cerrar chat de la tabla de gestion que se crea antes de enviar el template
            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET FKGES_NUSU_CODIGO = null, GES_ESTADO_CASO = 'CLOSE', GES_CHORA_FIN_GESTION = NOW(), GES_CDETALLE_ADICIONAL2 = 'OUT - NUMERO DE WHATSAPP NO EXISTE' WHERE PKGES_CODIGO = {GestionID};"
            cursor.execute(sql)
            connectionMySQL.close
            return "OUT - NUMERO DE WHATSAPP NO EXISTE"
        else:
            # Insertar un registro del mensaje enviado en la base de datos
            sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_CDETALLE_ADICIONAL='ENVIO TEMPLATE', GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = '{str(GestionID)}' AND GES_CDETALLE_ADICIONAL IS NULL;"
            cursor.execute(sql)
            sql = f"INSERT INTO {DeCrypt(BaseDatosServidor)}.tbl_messages (FK_GES_CODIGO, MES_ACCOUNT_SID, MES_BODY, MES_FROM, MES_TO, MES_CHANNEL, MES_MESSAGE_ID, MES_USER) VALUES ('{str(GestionID)}', '{str(account_sid)}', '{str(templateName)}', '{str(botWhatsappNum)}', '{str(whatsappNum)}', 'SEND', '{str(json.loads(response.text)['id'])}', 'BOT');"
            #app.logger.info(sql)
            cursor.execute(sql)
            connectionMySQL.close
            return "template enviado"
def cerrarChatInactivo():
    while True:
        try:
            # print('Ejecutando cerrarChatInactivo')
            msg_cierreEnc="*¿Sigue ahí?*"
            mensajeAdmin="¡Gracias por haber contactado al Soporte en línea de *CLARO*!"
            mensajeAbandono="Estimado cliente CLARO, debido al tiempo de inactividad, la conversación se cerrará. Le invitamos comunicarse nuevamente por este medio. ¡Muchas gracias por su confianza!"
            mensajeCM="Si necesita asistencia en el futuro, no dude en contactarnos. ¡Que tenga un excelente día!"
            connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
            connectionMySQL.autocommit(True)            
            
            with connectionMySQL.cursor() as cursor:
                #Cierra casos ABIERTOS 
                #---------5 MINITOS
                #sql = f" SELECT PKGES_CODIGO, GES_ULTIMO_RECIBIDO, GES_ULTIMO_ENVIADO, GES_NUMERO_COMUNICA FROM {DeCrypt(BaseDatosServidor)}.tbl_chats_management WHERE GES_ESTADO_CASO in ('OPEN') AND GES_CULT_MSGBOT = 'MSG_SALUDO' AND timediff(now(), GES_ULTIMO_ENVIADO) > '00:05:30' "
                #cursor.execute(sql)
                #registros_5min = cursor.fetchall()
                #Envia los mensajes de cierre
                #for registro in registros_5min:
                    #sendMessage(registro['GES_NUMERO_COMUNICA'], msg_cierreEnc, #registro['PKGES_CODIGO'],0)
                 
                #------- 10 MINUTOS
                sql = f"SELECT PKGES_CODIGO,GES_ULTIMO_RECIBIDO, GES_ULTIMO_ENVIADO, GES_NUMERO_COMUNICA FROM {DeCrypt(BaseDatosServidor)}.tbl_chats_management WHERE GES_ESTADO_CASO in ('OPEN') AND GES_CULT_MSGBOT = 'MSG_SALUDO' AND timediff(now(), GES_ULTIMO_RECIBIDO) > '23:59:00'"
                cursor.execute(sql)
                registros = cursor.fetchall()
                #Envia los mensajes de cierre
                for registro in registros:
                    sendMessage(registro['GES_NUMERO_COMUNICA'], mensajeAdmin, registro['PKGES_CODIGO'],0)                        
    
                #Cierra los mensajes en BD
                sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE', GES_CULT_MSGBOT ='MSG_FIN', GES_CHORA_FIN_GESTION = now(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO INACTIVIDAD' WHERE GES_ESTADO_CASO in ('OPEN') AND GES_CULT_MSGBOT = 'MSG_SALUDO' AND timediff(now(), GES_ULTIMO_RECIBIDO) > '00:10:00'"
                cursor.execute(sql)
            
                # -------- Cierra casos en estado ATENDING ABANDONO
                sql = f" SELECT PKGES_CODIGO, GES_NUMERO_COMUNICA FROM {DeCrypt(BaseDatosServidor)}.tbl_chats_management WHERE GES_ESTADO_CASO in ('ATTENDING', 'ATENDING') AND (timediff(now(), GES_ULTIMO_ENVIADO) > '23:59:00' AND timediff(now(), GES_ULTIMO_RECIBIDO) > '23:59:00');"
                cursor.execute(sql)
                registros = cursor.fetchall()
                #Envia los mensajes de cierre
                for registro in registros:
                    sendMessage(registro['GES_NUMERO_COMUNICA'], mensajeAbandono, registro['PKGES_CODIGO'],0)
                #Cierra casos ATENDING por abandono
                sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE', GES_CULT_MSGBOT ='MSG_FIN', GES_CHORA_FIN_GESTION = now() ,GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO ABANDONO' WHERE GES_ESTADO_CASO in ('ATTENDING', 'ATENDING') AND timediff(now(), GES_ULTIMO_RECIBIDO) > '23:59:00' AND timediff(now(), GES_CFECHA_ASIGNACION) > '23:59:00'"
                cursor.execute(sql)   
                # -------- Cierra casos los masivos o encuesta que no respondieron en DB
                sql = f"UPDATE {DeCrypt(BaseDatosServidor)}.tbl_chats_management SET GES_ESTADO_CASO = 'CLOSE', GES_CULT_MSGBOT ='MSG_FIN', GES_CHORA_FIN_GESTION = now(), GES_CDETALLE_ADICIONAL2 = 'BOT - CERRADO INACTIVIDAD' WHERE GES_ESTADO_CASO in ('OPEN') AND GES_CULT_MSGBOT = 'MSG_ENCUESTA' AND timediff(now(), GES_CHORA_INICIO_GESTION) > '24:00:00'"
                cursor.execute(sql)                 
                connectionMySQL.close()
                # print('Finalizando cerrarChatInactivo')
        except pymysql.Error as e:
            print('Error cerrarChatInactivo:', e)
            # Puedes registrar el error detallado en un archivo de registro si es necesario
            # app.logger.error(e)
        except Exception as e:
            print('Error cerrarChatInactivo:', e)
            # app.logger.error(e)
        time.sleep(60 * 1)
# Creación del grafo 
def decision_tree():
    while True:
        global graph_tree
        print("cargando arbol")
        # Obtención información DB del árbol
        connectionMySQL = connection(IPServidor, UsuarioServidor, ContrasenaServidor, BaseDatosServidor, port)
        query = f"SELECT * FROM {DeCrypt(BaseDatosServidor)}.tbl_bot_tree"
        cursor = connectionMySQL.cursor()
        cursor.execute(query)
        data_from_database = cursor.fetchall()
        # Grafo dirigido de múltiples aristas 
        G = nx.MultiDiGraph()
        
        # Creación de nodos según mensajes del árbol
        for node_data in data_from_database:
            G.add_node(node_data['PKBTREE_NCODIGO'], **node_data)
        # Creación de aristas entre nodos
        for node_data in data_from_database:
            if node_data['FKBTREE_NCODIGO']:      
                child_nodes = list(map(int, node_data['FKBTREE_NCODIGO'].split(',')))
                # Se asigna un peso por arista para evitar problemas de múltiples aristas entre nodos iguales
                w = 0
                for child_node in child_nodes:
                    G.add_edge(node_data['PKBTREE_NCODIGO'], child_node, weight = w)
                    w += 1
        cursor.close()
        connectionMySQL.close()
        graph_tree = G
        # print("Nodos del grafo:", G.nodes())
        time.sleep(60*10)
def validar_nombre(cadena):
    # Utilizando expresiones regulares para comprobar si la cadena contiene solo letras y espacios
    patron = "^[A-Za-z\s]+$"
    if re.match(patron, cadena):
        return True
    else:
        return False
def validar_email(email):
    # Utilizando expresiones regulares para validar el formato de correo electrónico
    patron_email = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if re.match(patron_email, email):
        return True
    else:
        return False
    
# Tipo de respuesta para cada nodo
def verificar_tipo(Body, lastrowid, whatsappNum, node):
    global graph_tree
    # 1: Respuesta correcta dependiendo del tipo
    # 2: Respuesta incorrecta
    # Se pueden agregar más opciones en el caso de un árbol
    # que deba tomar caminos específicos según la respuesta
    if graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "OP":
        # Se obtiene tamaño de los hijos del nodo
        hijos = list(graph_tree.successors(node))
        pesos_unicos = set()
        for hijo in hijos:
            for arista in graph_tree[node][hijo].values():
                peso_arista = arista['weight']
                pesos_unicos.add(peso_arista)
        if Body.isnumeric() and (int(Body) >= 1 and int(Body) <= len(pesos_unicos)):
            return 1
        else:
            return 2
    elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "BUTTON" or graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "LIST":
        # Se obtiene tamaño de los hijos del nodo
        opciones = graph_tree.nodes[node]["BTREE_OPCIONES"].split(',')
        if Body in opciones:
            return 1
        else:
            return 2
    elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "NAME":
        if validar_nombre(Body):
            return 4
        else:
            return 2
    elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "EMAIL":
        if validar_email(Body):
            return 5
        else:
            return 2    
    elif graph_tree.nodes[node]["BTREE_OPTION_NUM"] == "NUM":
        return 6
    else:
        return 1
#Se inicializa el servidor con Waitress

def send_to_vicidial(phone_number):
    print(phone_number)
    url = "https://endpoindapivcdial.rpagroupcos.com/process_json"
    headers = {
        "Authorization": "8d2f7aee56c8d0bba2b6fc2c14eef9fcabf8e2c98411a6f7737a85edae883d4f",
        "X-UserId": "Winsports"
    }

    json_data = [{
        "phone_number": phone_number
    }]

    try:
        response = requests.post(url, headers=headers, json=json_data)  # Enviar como lista
        print(response)
        if response.status_code == 200:
            print("Datos enviados y procesados exitosamente")
            return True
        else:
            print(f"Error al enviar los datos. Código de estado: {response.status_code} {response.text}")
            return False
    except Exception as e:
        print(f"Error en la solicitud: {str(e)}")
        return False

if __name__ == "__main__":
    global graph_tree
    global node 
    global parent_node
    node = 1
    parent_node = 0
    decision_tree = threading.Thread(target=decision_tree)
    decision_tree.start()
    chatsInactivos = threading.Thread(target=cerrarChatInactivo)
    chatsInactivos.start()
    # Se obtiene el código de perfilamiento a partir del primer argumento proporcionado
    lineProfiling("1")
    host="localhost"
    port=config['WebHookWhasapp']['PORT']
    app.logger.info(f"En linea en Host: {host} y puerto: {port}")
    #Siempre intentar poner la mitad de hilos/nucleos que tenga el procesador, mirarlo con el comando nproc
    #Lo recomando es threads = 8 como minimo para no tener problemas con tareas bloqueantes.
    # sendMessage("+573183955170", "Mensaje Prueba", "1")
    # sendMessage("+573125634645", "Mensaje Prueba", "1")
    serve(app, port=port, host=host, _quiet=True, threads = 4)
    
    
    
    