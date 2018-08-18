package com.preguntame.firebaseServices;

import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.preguntame.MainActivity;
import com.preguntame.R;
import com.preguntame.realmbd.models.ChatList;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import io.realm.Realm;
import io.realm.react.RealmReactPackage;

/**
 * Created by Frank on 16/08/2018.
 */

public class MyFirebaseMessagingService extends FirebaseMessagingService{
    private static final String TAG = "MessagingService";

    //@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // ...

        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            final Map<String,String> data = remoteMessage.getData();
            Log.d(TAG, "Message data payload: " + data);

            if(!isApplicationInForeground()) {
                NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context
                        .NOTIFICATION_SERVICE);
                mNotificationManager.notify(1312312, createNotification(data));
                Realm realm = Realm.getDefaultInstance();
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
                        DateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                        try {
                            Date timestamp = dFormat.parse(data.get("timestamp"));
                            chatList.setTimestamp(timestamp);
                        } catch (ParseException e) {
                            e.printStackTrace();
                        }
                        chatList.setEstado_mensaje(data.get("estado_mensaje"));
                    }
                });

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
    Notification createNotification(Map<String,String> data) {
        Uri uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        String bigText = data.get("mensaje");
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pIntent = PendingIntent.getActivity(this, (int) System.currentTimeMillis(), intent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentTitle(data.get("id_e"))
                .setContentText(data.get("mensaje"))
                .setContentIntent(pIntent)
                .setAutoCancel(true)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(bigText))
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setVibrate(new long[]{ 350, 350,350,350,350})
                .setSound(uri);

        if(Build.VERSION.SDK_INT> Build.VERSION_CODES.KITKAT)
        {
            notificationBuilder.setCategory(Notification.CATEGORY_MESSAGE);
        }
        return notificationBuilder.build();
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
}
