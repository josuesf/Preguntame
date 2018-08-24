package com.preguntame.realmbd.models;

import io.realm.RealmObject;
import io.realm.annotations.PrimaryKey;

/**
 * Created by Frank on 21/08/2018.
 */

public class Usuario extends RealmObject{

    @PrimaryKey
    private String username;

    private String email;
    private String avatar_url;
    private String token_fcm;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar_url() {
        return avatar_url;
    }

    public void setAvatar_url(String avatar_url) {
        this.avatar_url = avatar_url;
    }

    public String getToken_fcm() {
        return token_fcm;
    }

    public void setToken_fcm(String token_fcm) {
        this.token_fcm = token_fcm;
    }
}
