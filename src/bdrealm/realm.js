'use strict';

import Realm from 'realm';

class ChatList extends Realm.Object {}
ChatList.schema = {
    name: 'ChatList',
    primaryKey: 'id_mensaje',
    properties: {
        id_chat:'string',
        id_r:'string',
        id_e:'string',
        id_g:'string',
        id_mensaje: 'string',
        mensaje:'string',
        tipo_mensaje:'string',
        timestamp:'date',
        estado_mensaje: 'string',
        /*pendiente
        pendiente	        emisor,receptor
        enviado	            emisor
        recibido	        receptor
        entregado	        servido,emisor
        entregado_servidor	receptor
        entregado_receptor	servidor
        visto	            emisor,servidor
        visto_servidor	    receptor
        visto_receptor	    servidor
        */
    },
};

class Chats extends Realm.Object {}
Chats.schema = {
    name: 'Chats',
    primaryKey: 'id_chat',
    properties: {
        id_chat: 'string', //id_e o id_grupo
        id_r: 'string', //id_e o id_grupo
        id_e: 'string', //id_e o id_grupo
        id_g: 'string',//id_grupo
        id_mensaje: 'string',
        ultimo_mensaje:'string',
        timestamp:'date',
        avatar:'string',
        estado_mensaje:'string',
        tipo_mensaje:'string'
    },
};

export default new Realm({schema: [ChatList, Chats]});