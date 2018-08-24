package com.preguntame.firebaseServices;

import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.preguntame.MainActivity;
import com.preguntame.R;
import com.preguntame.realmbd.RealmModule;
import com.preguntame.realmbd.models.ChatList;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;
import java.util.Map;

import io.realm.Realm;
import io.realm.RealmResults;

/**
 * Created by Frank on 16/08/2018.
 */

public class MyFirebaseMessagingService extends FirebaseMessagingService{
    private static final String TAG = "MessagingService";
    private static final String LOG_TAG = "MessagingService";
    private static final String NOTIFICATION_CHANNEL_ID = "fcm-push-notification-channel-id";
    Realm realm;
    private RequestQueue requestQueue;
    private Context context;
    //@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // ...
        context = getApplicationContext();
        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            final Map<String,String> data = remoteMessage.getData();
            Log.d(TAG, "Message data payload: " + data);
            realm = Realm.getDefaultInstance();
            if(!data.get("tipo_notificacion").equals("status")){
                newMessageReceived(data);
                //Mostrar notificacion si se encuentra en background
                if(!isApplicationInForeground()) {

                    NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context
                            .NOTIFICATION_SERVICE);
                    checkOrCreateChannel(mNotificationManager);
                    mNotificationManager.notify(1312312, createNotification(data));

                }
            }else{
                updateStatusMessage(data);
            }
        }

        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }

        // Also if you intend on generating your own notifications as a result of a received FCM
        // message, here is where that should be initiated. See sendNotification method below.
    }
    //@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private Notification createNotification(Map<String,String> data) {
        String id_r = data.get("id_r");
        RealmResults<ChatList> mensajesPendientes  = realm.where(ChatList.class)
                                                        .equalTo("id_r",id_r)
                                                        .and()
                                                        .notEqualTo("estado_mensaje","visto")
                                                        .sort("id_chat")
                                                        .findAll();
        String bigText = "";
        String mensaje = data.get("mensaje");
        String titulo = data.get("id_e");
        if(mensajesPendientes.size()>1){
            mensaje="Tienes "+mensajesPendientes.size()+" mensaje(s).";
            titulo = "Preguntame";
        }
        for (ChatList c: mensajesPendientes) {
            bigText += c.getId_e()+" : "+c.getMensaje()+"\n";
        }

        Uri uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pIntent = PendingIntent.getActivity(this, (int) System.currentTimeMillis(), intent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this,NOTIFICATION_CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setContentTitle(titulo)
                .setContentText(mensaje)
                .setContentIntent(pIntent)
                .setAutoCancel(true)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(bigText))
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setVibrate(new long[]{ 350, 350,350,350,350})
                .setLights(0xff00ff00, 300, 100)
                .setSound(uri);

        if(Build.VERSION.SDK_INT> Build.VERSION_CODES.KITKAT)
        {
            notificationBuilder.setCategory(Notification.CATEGORY_MESSAGE);
        }
        return notificationBuilder.build();
    }
    private void newMessageReceived(final Map<String,String> data){
        final String id_mensaje = data.get("id_mensaje");
        final String estado_mensaje = data.get("estado_mensaje");
        ChatList chatList = realm.where(ChatList.class).equalTo("id_mensaje",id_mensaje).findFirst();
        if(chatList==null){
            realm.executeTransaction(new Realm.Transaction() {
                @Override
                public void execute(Realm realm) {
                    ChatList chatList = realm.createObject(ChatList.class,data.get("id_mensaje"));
                    chatList.setId_e(data.get("id_e"));
                    chatList.setId_r(data.get("id_r"));
                    chatList.setId_g(data.get("id_g"));
                    chatList.setId_chat(data.get("id_e"));
                    chatList.setMensaje(data.get("mensaje"));
                    chatList.setTipo_mensaje(data.get("tipo_mensaje"));
                    long unix_seconds = Long.parseLong(data.get("timestamp"));
                    chatList.setTimestamp(new Date(unix_seconds));
                /*DateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                try {
                    Date timestamp = dFormat.parse(data.get("timestamp"));
                    chatList.setTimestamp(timestamp);
                } catch (ParseException e) {
                    e.printStackTrace();
                }*/
                    chatList.setEstado_mensaje(data.get("estado_mensaje"));
                }
            });
            if(isApplicationInForeground()){
                if ( RealmModule.getmReactContext().hasActiveCatalystInstance()) {
                    ChatList newChatSaved = realm.where(ChatList.class).equalTo("id_mensaje",data.get("id_mensaje")).findFirst();
                    if(newChatSaved!=null) {
                        RealmModule.getmReactContext()
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("messagedReceived", newChatSaved.getReactObject());
                    }
                }
            }
            //Enviar Respuesta al servidor
            JSONObject msj = new JSONObject();
            try {
                msj.put("id_mensaje", id_mensaje);
                msj.put("estado_mensaje", "entregado");
                ActualizarServidor(msj);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

    }
    private void updateStatusMessage(final Map<String,String> data){
        final String id_mensaje = data.get("id_mensaje");
        final String estado_mensaje = data.get("estado_mensaje");
        final ChatList chatList = realm.where(ChatList.class).equalTo("id_mensaje",id_mensaje).findFirst();
        String estado_mensaje_actual =chatList.getEstado_mensaje();
        boolean cambio = false;
        switch (estado_mensaje_actual){
            case "pendiente":
                if(estado_mensaje.equals("enviado")||
                        estado_mensaje.equals("entregado")||
                        estado_mensaje.equals("visto")){
                    cambio=true;
                }
                break;
            case "enviado":
                if(estado_mensaje.equals("entregado")||
                        estado_mensaje.equals("visto")){
                    cambio=true;
                }
                break;
            case "entregado":
                if(estado_mensaje.equals("visto")){
                    cambio=true;
                }
                break;
        }
        if(cambio) {
            realm.executeTransaction(new Realm.Transaction() {
                @Override
                public void execute(Realm realm) {
                    chatList.setEstado_mensaje(estado_mensaje);
                }
            });
            if(isApplicationInForeground()){
                if ( RealmModule.getmReactContext().hasActiveCatalystInstance()) {
                    ChatList newChatSaved = realm.where(ChatList.class).equalTo("id_mensaje",id_mensaje).findFirst();
                    if(newChatSaved!=null) {
                        RealmModule.getmReactContext()
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("changeStatus_"+id_mensaje, newChatSaved.getEstado_mensaje());
                    }
                }
            }
        }
    }
    private void ActualizarServidor(JSONObject params){
        requestQueue= Volley.newRequestQueue(getApplicationContext());
        JsonObjectRequest consulta = new JsonObjectRequest(
                Request.Method.POST,
                getString(R.string.url_servidor)+"/ws/update_status_message",
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
    private boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(getApplication().getPackageName())) {
                    if (processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                        for (String d : processInfo.pkgList) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private static boolean channelCreated = false;

    private void checkOrCreateChannel(NotificationManager manager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O)
            return;
        if (channelCreated)
            return;
        if (manager == null)
            return;

        int importance = NotificationManager.IMPORTANCE_DEFAULT;
        NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID,
                "Chanel_Notifications", importance);
        channel.setDescription("Chanel_Notifications_Descripcion");
        channel.enableLights(true);
        channel.enableVibration(true);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

        manager.createNotificationChannel(channel);
        channelCreated = true;
    }

}
