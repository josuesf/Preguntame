package com.preguntame.Receiver;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.preguntame.R;
import com.preguntame.realmbd.RealmModule;
import com.preguntame.realmbd.models.ChatList;
import com.preguntame.realmbd.models.Usuario;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URL;
import java.net.URLConnection;
import java.util.List;

import io.realm.Realm;

/**
 * Created by Frank on 21/08/2018.
 */

public class ConnectivityChangeReceiver extends BroadcastReceiver {
    Context acontext;
    @Override
    public void onReceive(final Context context, final Intent intent) {
        final String action = intent.getAction();
        acontext = context;
        if (intent.getAction().equals(ConnectivityManager.CONNECTIVITY_ACTION)) {
            checkConnectivity(context);
        }
    }


    private void checkConnectivity(final Context context) {
        if (!isNetworkInterfaceAvailable(context)) {
            Toast.makeText(context, "You are OFFLINE!", Toast.LENGTH_SHORT).show();
            return;
        }

        final Handler handler = new Handler();
        new Thread(new Runnable() {
            @Override
            public void run() {
                final boolean isConnected = isAbleToConnect("http://www.google.com", 1000);
                handler.post(new Runnable() {
                    @Override
                    public void run() {
                        if (isConnected) {
                            Realm realm = Realm.getDefaultInstance();
                            Usuario usuario = realm.where(Usuario.class).findFirst();
                            if(usuario!=null){
                             EnviarPendientes(usuario.getUsername());
                            }
                            Toast.makeText(context, "You are ONLINE!", Toast.LENGTH_SHORT).show();
                        }
                        else
                            Toast.makeText(context, "You are OFFLINE!", Toast.LENGTH_SHORT).show();
                    }
                });

            }
        }).start();

    }

    //This only checks if the network interface is available, doesn't guarantee a particular network service is available, for example, there could be low signal or server downtime
    private boolean isNetworkInterfaceAvailable(Context context) {
        ConnectivityManager cm = (ConnectivityManager)context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

    //This makes a real connection to an url and checks if you can connect to this url, this needs to be wrapped in a background thread
    private boolean isAbleToConnect(String url, int timeout) {
        try {
            URL myUrl = new URL(url);
            URLConnection connection = myUrl.openConnection();
            connection.setConnectTimeout(timeout);
            connection.connect();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    private void EnviarPendientes(String id_e){
        Realm realm = Realm.getDefaultInstance();
        ChatList chatLists = realm.where(ChatList.class)
                .sort("timestamp")
                .equalTo("id_e",id_e)
                .and()
                .equalTo("estado_mensaje","pendiente")
                .findFirst();

        if(chatLists!=null) {
            JSONObject msj = new JSONObject();
            try {
                msj.put("id_mensaje", chatLists.getId_mensaje());
                msj.put("id_e", chatLists.getId_e());
                msj.put("id_r", chatLists.getId_r());
                msj.put("id_g", chatLists.getId_g());
                msj.put("id_chat", chatLists.getId_chat());
                msj.put("mensaje", chatLists.getMensaje());
                msj.put("tipo_mensaje", chatLists.getTipo_mensaje());
                msj.put("timestamp", chatLists.getTimestamp().getTime());
                msj.put("estado_mensaje", chatLists.getEstado_mensaje());
                sendToServidor(msj,id_e);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }
    private void sendToServidor(JSONObject params, final String id_e){
        RequestQueue requestQueue= Volley.newRequestQueue(acontext);
        JsonObjectRequest consulta = new JsonObjectRequest(
                Request.Method.POST,
                acontext.getApplicationContext().getString(R.string.url_servidor)+"/ws/send_message",
                params,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            if(response.getString("respuesta").equals("ok")){
                                updateStatusMessage(response.getString("data"),"enviado");
                                EnviarPendientes(id_e);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {

                    }
                }
        );
        requestQueue.add(consulta);
    }
    private void updateStatusMessage(final String id_mensaje,final String estado_mensaje){
        Realm realm = Realm.getDefaultInstance();
        final ChatList chatList = realm.where(ChatList.class).equalTo("id_mensaje",id_mensaje).findFirst();
        realm.executeTransaction(new Realm.Transaction() {
            @Override
            public void execute(Realm realm) {
                chatList.setEstado_mensaje(estado_mensaje);
            }
        });
    }
}