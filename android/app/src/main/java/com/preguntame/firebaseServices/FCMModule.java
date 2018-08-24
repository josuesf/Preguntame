package com.preguntame.firebaseServices;

import android.app.NotificationManager;
import android.content.Context;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.iid.FirebaseInstanceId;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by Frank on 16/08/2018.
 */

public class FCMModule extends ReactContextBaseJavaModule {

    public FCMModule(ReactApplicationContext reactContext){
        super(reactContext);
    }
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("TOKEN", FirebaseInstanceId.getInstance().getToken());
        return constants;
    }
    @Override
    public String getName() {
        return "FCMModule";
    }
    @ReactMethod
    public void getToken(Callback callback) {
        callback.invoke(FirebaseInstanceId.getInstance().getToken());
    }
    @ReactMethod
    public void cancelAllLocalNotifications() {
        NotificationManager notificationManager = notificationManager();
        notificationManager.cancelAll();
    }
    private NotificationManager notificationManager() {
        return (NotificationManager) getCurrentActivity().getSystemService(Context.NOTIFICATION_SERVICE);
    }
}
