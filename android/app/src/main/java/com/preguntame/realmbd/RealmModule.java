package com.preguntame.realmbd;

import android.util.Log;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.preguntame.R;
import com.preguntame.realmbd.models.ChatList;
import com.preguntame.realmbd.models.Usuario;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import io.realm.Realm;
import io.realm.RealmResults;
import io.realm.Sort;

/**
 * Created by Frank on 17/08/2018.
 */

public class RealmModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext mReactContext;

    private RequestQueue requestQueue;
    public RealmModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;

    }
    public static ReactApplicationContext getmReactContext(){
        return mReactContext;
    }
    @Override
    public String getName() {
        return "RealmModule";
    }
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        //constants.put("TOKEN", FirebaseInstanceId.getInstance().getToken());
        return constants;
    }

    @ReactMethod
    public void getChats(ReadableMap query, Callback successCallBack, Callback failureCallBack){
        Realm realm = Realm.getDefaultInstance();
        try {
            RealmResults<ChatList> chatLists = realm.where(ChatList.class)
                                                    .sort("timestamp", Sort.DESCENDING)
                                                    .distinct("id_chat")
                                                    .findAll();

            WritableNativeArray ArrayResultado = new WritableNativeArray();
            for (ChatList c:chatLists) {
                WritableMap chat = new WritableNativeMap();
                chat.putString("id_mensaje",c.getId_mensaje());
                chat.putString("id_chat",c.getId_chat());
                chat.putString("id_r",c.getId_r());
                chat.putString("id_e",c.getId_e());
                chat.putString("id_g",c.getId_g());
                chat.putString("mensaje",c.getMensaje());
                chat.putString("tipo_mensaje",c.getTipo_mensaje());
                chat.putString("timestamp",String.valueOf(c.getTimestamp().getTime()));
                chat.putString("estado_mensaje",c.getEstado_mensaje());
                ArrayResultado.pushMap(chat);
            }
            successCallBack.invoke(ArrayResultado);
        }catch (Exception ex){
            failureCallBack.invoke(ex.getMessage());
        }

    }
    @ReactMethod
    public void getMessagesbyUser(ReadableMap query, Callback successCallBack, Callback failureCallBack){
        Realm realm = Realm.getDefaultInstance();
        try {
            RealmResults<ChatList> chatLists = realm.where(ChatList.class)
                    .sort("timestamp", Sort.DESCENDING)
                    .equalTo("id_chat",query.getString("id_chat"))
                    .findAll();

            WritableNativeArray ArrayResultado = new WritableNativeArray();
            for (ChatList c:chatLists) {
                WritableMap chat = new WritableNativeMap();
                chat.putString("id_mensaje",c.getId_mensaje());
                chat.putString("id_chat",c.getId_chat());
                chat.putString("id_r",c.getId_r());
                chat.putString("id_e",c.getId_e());
                chat.putString("id_g",c.getId_g());
                chat.putString("mensaje",c.getMensaje());
                chat.putString("tipo_mensaje",c.getTipo_mensaje());
                chat.putString("timestamp",String.valueOf(c.getTimestamp().getTime()));
                chat.putString("estado_mensaje",c.getEstado_mensaje());
                ArrayResultado.pushMap(chat);
            }
            successCallBack.invoke(ArrayResultado);
        }catch (Exception ex){
            failureCallBack.invoke(ex.getMessage());
        }

    }
    @ReactMethod
    public void saveMessage(final ReadableMap data, final Callback successCallBack, final Callback failureCallBack){
        final Realm realm = Realm.getDefaultInstance();
        final Date fecha_registro = new Date();
        realm.executeTransactionAsync(new Realm.Transaction() {
            @Override
            public void execute(Realm realm) {
                ChatList chatList = realm.createObject(ChatList.class,data.getString("id_mensaje"));
                chatList.setId_e(data.getString("id_e"));
                chatList.setId_r(data.getString("id_r"));
                chatList.setId_g(data.getString("id_g"));
                chatList.setId_chat(data.getString("id_chat"));
                chatList.setMensaje(data.getString("mensaje"));
                chatList.setTipo_mensaje(data.getString("tipo_mensaje"));
                chatList.setTimestamp(fecha_registro);
//                DateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
//                try {
//                    Date timestamp = dFormat.parse(data.getString("timestamp"));
//                    chatList.setTimestamp(timestamp);
//                } catch (ParseException e) {
//                    e.printStackTrace();
//                }
                chatList.setEstado_mensaje(data.getString("estado_mensaje"));
            }
        }, new Realm.Transaction.OnSuccess() {
            @Override
            public void onSuccess() {
                if (mReactContext.hasActiveCatalystInstance()) {
                    ChatList newChatSaved = realm.where(ChatList.class).equalTo("id_mensaje",data.getString("id_mensaje")).findFirst();
                    mReactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("messagedReceived",newChatSaved.getReactObject());
                }
                JSONObject msj = new JSONObject();
                try {
                    msj.put("id_mensaje", data.getString("id_mensaje"));
                    msj.put("id_e", data.getString("id_e"));
                    msj.put("id_r", data.getString("id_r"));
                    msj.put("id_g", data.getString("id_g"));
                    msj.put("id_chat", data.getString("id_chat"));
                    msj.put("mensaje", data.getString("mensaje"));
                    msj.put("tipo_mensaje", data.getString("tipo_mensaje"));
                    msj.put("timestamp", fecha_registro.getTime());
                    msj.put("estado_mensaje", data.getString("estado_mensaje"));
                    sendToServidor(msj);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                successCallBack.invoke("Guardado");
                //Enviar al servidor

            }
        }, new Realm.Transaction.OnError() {
            @Override
            public void onError(Throwable error) {
                // Transaction failed and was automatically canceled.
                failureCallBack.invoke(error.getMessage());
            }
        });

    }
    @ReactMethod
    public void sendVistos(ReadableMap query){
        Realm realm = Realm.getDefaultInstance();
        RealmResults<ChatList> chatLists= realm.where(ChatList.class)
                .sort("timestamp")
                .equalTo("id_e",query.getString("id_chat"))
                .and()
                .notEqualTo("estado_mensaje","visto")
                .findAll();

        for (ChatList c:chatLists) {
            updateStatusMessage(c.getId_mensaje(), "visto");
            //Enviar Respuesta al servidor
            JSONObject msj = new JSONObject();
            try {
                msj.put("id_mensaje", c.getId_mensaje());
                msj.put("estado_mensaje", "visto");
                ActualizarServidor(msj);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

    }
    @ReactMethod
    public void sendPendientes(ReadableMap query,Callback callback){
        Realm realm = Realm.getDefaultInstance();
        ChatList chatLists = realm.where(ChatList.class)
                .sort("timestamp")
                .equalTo("id_e",query.getString("id_e"))
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

                WritableMap chat = new WritableNativeMap();
                chat.putString("id_mensaje",chatLists.getId_mensaje());
                chat.putString("id_chat",chatLists.getId_chat());
                chat.putString("id_r",chatLists.getId_r());
                chat.putString("id_e",chatLists.getId_e());
                chat.putString("id_g",chatLists.getId_g());
                chat.putString("mensaje",chatLists.getMensaje());
                chat.putString("tipo_mensaje",chatLists.getTipo_mensaje());
                chat.putString("timestamp",String.valueOf(chatLists.getTimestamp().getTime()));
                chat.putString("estado_mensaje",chatLists.getEstado_mensaje());
                sendToServidor(msj);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

    }
    @ReactMethod
    public void getUser(Callback successCallBack, Callback failureCallBack){
        Realm realm = Realm.getDefaultInstance();
        try {
            Usuario user = realm.where(Usuario.class).findFirst();
            if(user!=null) {
                WritableNativeMap my_user = new WritableNativeMap();
                my_user.putString("username", user.getUsername());
                my_user.putString("email", user.getEmail());
                my_user.putString("avatar_url", user.getAvatar_url());
                my_user.putString("token_fcm", user.getToken_fcm());
                successCallBack.invoke(my_user);
            }else{
                successCallBack.invoke(null);
            }
        }catch (Exception ex){
            failureCallBack.invoke(ex.getMessage());
        }
    }
    @ReactMethod
    public void getNroNoVistos(ReadableMap query,Callback successCallBack){
        Realm realm = Realm.getDefaultInstance();

        RealmResults<ChatList> noVistos = realm.where(ChatList.class)
                                .notEqualTo("estado_mensaje","visto")
                                .and().equalTo("id_e",query.getString("id_chat"))
                                .findAll();
        successCallBack.invoke(noVistos.size());

    }
    @ReactMethod
    public void setUser(final ReadableMap query, Callback successCallBack, Callback failureCallBack){
        Realm realm = Realm.getDefaultInstance();
        try {
            realm.executeTransaction(new Realm.Transaction() {
                @Override
                public void execute(Realm realm) {
                    Usuario user = realm.createObject(Usuario.class,query.getString("username"));
                    user.setEmail(query.getString("email"));
                    user.setAvatar_url("");
                    user.setToken_fcm(query.getString("token_fcm"));
                }
            });
            successCallBack.invoke("Se registro correctamente!");
        }catch (Exception ex){
            failureCallBack.invoke(ex.getMessage());
        }
    }
    private void sendToServidor(JSONObject params){
        requestQueue= Volley.newRequestQueue(getReactApplicationContext());
        JsonObjectRequest consulta = new JsonObjectRequest(
                Request.Method.POST,
                getReactApplicationContext().getString(R.string.url_servidor)+"/ws/send_message",
                params,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        /*try {
                            if(response.getString("respuesta").equals("ok")){
                                updateStatusMessage(response.getString("data"),"enviado");
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }*/
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
        if (RealmModule.getmReactContext().hasActiveCatalystInstance()) {
            WritableNativeMap msjUpdated = new WritableNativeMap();
            msjUpdated.putString("id_mensaje",id_mensaje);
            msjUpdated.putString("id_mensaje",estado_mensaje);
            RealmModule.getmReactContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("changeStatus_"+id_mensaje, estado_mensaje);
        }
    }
    private void ActualizarServidor(JSONObject params){
        requestQueue= Volley.newRequestQueue(getReactApplicationContext());
        JsonObjectRequest consulta = new JsonObjectRequest(
                Request.Method.POST,
                getReactApplicationContext().getString(R.string.url_servidor)+"/ws/update_status_message",
                params,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {

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
}
