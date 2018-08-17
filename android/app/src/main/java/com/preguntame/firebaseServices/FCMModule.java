package com.preguntame.firebaseServices;

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
    public String getToken() {
        return "Mitoken12312312";
    }
}
