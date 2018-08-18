package com.preguntame.realmbd.models;

import java.util.Date;

import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

/**
 * Created by Frank on 17/08/2018.
 */

public class ChatList extends RealmObject{

    @PrimaryKey
    private String id_mensaje;

    private String id_chat;
    private String id_r;
    private String id_e;
    private String id_g;
    private String mensaje;
    private String tipo_mensaje;
    private Date timestamp;
    private String estado_mensaje;

    public String getId_mensaje() {
        return id_mensaje;
    }

    public void setId_mensaje(String id_mensaje) {
        this.id_mensaje = id_mensaje;
    }

    public String getId_chat() {
        return id_chat;
    }

    public void setId_chat(String id_chat) {
        this.id_chat = id_chat;
    }

    public String getId_r() {
        return id_r;
    }

    public void setId_r(String id_r) {
        this.id_r = id_r;
    }

    public String getId_e() {
        return id_e;
    }

    public void setId_e(String id_e) {
        this.id_e = id_e;
    }

    public String getId_g() {
        return id_g;
    }

    public void setId_g(String id_g) {
        this.id_g = id_g;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getTipo_mensaje() {
        return tipo_mensaje;
    }

    public void setTipo_mensaje(String tipo_mensaje) {
        this.tipo_mensaje = tipo_mensaje;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public String getEstado_mensaje() {
        return estado_mensaje;
    }

    public void setEstado_mensaje(String estado_mensaje) {
        this.estado_mensaje = estado_mensaje;
    }
}
