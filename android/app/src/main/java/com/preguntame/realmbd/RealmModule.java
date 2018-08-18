package com.preguntame.realmbd;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by Frank on 17/08/2018.
 */

public class RealmModule extends ReactContextBaseJavaModule {

    public RealmModule(ReactApplicationContext reactContext) {
        super(reactContext);
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
}
