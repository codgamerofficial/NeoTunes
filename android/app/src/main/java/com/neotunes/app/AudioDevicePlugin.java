package com.neotunes.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioDeviceCallback;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "AudioDevice")
public class AudioDevicePlugin extends Plugin {

    private AudioManager audioManager;
    private AudioDeviceCallback audioDeviceCallback;
    private BroadcastReceiver noisyReceiver;

    @Override
    public void load() {
        super.load();
        Context context = getContext();
        audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioManager != null) {
            audioDeviceCallback = new AudioDeviceCallback() {
                @Override
                public void onAudioDevicesAdded(AudioDeviceInfo[] addedDevices) {
                    notifyAudioOutputChanged();
                }

                @Override
                public void onAudioDevicesRemoved(AudioDeviceInfo[] removedDevices) {
                    notifyAudioOutputChanged();
                }
            };
            audioManager.registerAudioDeviceCallback(audioDeviceCallback, new Handler(Looper.getMainLooper()));
        }

        // Listen for headphone unplug / noisy audio events
        noisyReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
                    JSObject ret = new JSObject();
                    ret.put("event", "becomingNoisy");
                    notifyListeners("audioBecomingNoisy", ret);
                }
                notifyAudioOutputChanged();
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(AudioManager.ACTION_AUDIO_BECOMING_NOISY);
        filter.addAction(AudioManager.ACTION_HEADSET_PLUG);
        context.registerReceiver(noisyReceiver, filter);
    }

    @PluginMethod
    public void getCurrentAudioOutput(PluginCall call) {
        if (audioManager == null) {
            JSObject fallback = createFallbackDevice("phone", "Phone Speaker", "Built-in Speaker", true);
            call.resolve(fallback);
            return;
        }

        JSObject activeDevice = getActiveOutputDevice();
        call.resolve(activeDevice);
    }

    @PluginMethod
    public void getAvailableAudioOutputs(PluginCall call) {
        JSArray devicesList = new JSArray();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioManager != null) {
            AudioDeviceInfo[] devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS);
            for (AudioDeviceInfo dev : devices) {
                JSObject devObj = parseDeviceInfo(dev);
                devicesList.put(devObj);
            }
        }

        if (devicesList.length() == 0) {
            devicesList.put(createFallbackDevice("phone", "Phone Speaker", "Built-in Speaker", true));
        }

        JSObject ret = new JSObject();
        ret.put("devices", devicesList);
        call.resolve(ret);
    }

    private JSObject getActiveOutputDevice() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioManager != null) {
            AudioDeviceInfo[] devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS);
            
            // 1. Check for Active External Bluetooth (A2DP, BLE, SCO, Soundbar)
            for (AudioDeviceInfo dev : devices) {
                int type = dev.getType();
                if (type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                    type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                    (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && type == AudioDeviceInfo.TYPE_BLE_HEADSET) ||
                    (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && type == AudioDeviceInfo.TYPE_BLE_SPEAKER) ||
                    (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && type == AudioDeviceInfo.TYPE_BLE_BROADCAST)) {
                    return parseDeviceInfo(dev);
                }
            }

            // 2. Check for Wired / USB Headphones
            for (AudioDeviceInfo dev : devices) {
                int type = dev.getType();
                if (type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
                    type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                    type == AudioDeviceInfo.TYPE_USB_DEVICE ||
                    type == AudioDeviceInfo.TYPE_USB_HEADSET) {
                    return parseDeviceInfo(dev);
                }
            }

            // 3. Fallback to Built-in Speaker
            for (AudioDeviceInfo dev : devices) {
                if (dev.getType() == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) {
                    return parseDeviceInfo(dev);
                }
            }
        }

        return createFallbackDevice("phone", "Phone Speaker", "Built-in Speaker", true);
    }

    private JSObject parseDeviceInfo(AudioDeviceInfo dev) {
        JSObject obj = new JSObject();
        int type = dev.getType();
        String rawName = dev.getProductName() != null ? dev.getProductName().toString().trim() : "";
        String typeName = "internal";
        String displayType = "Built-in Speaker";
        String finalName = rawName;

        if (type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP || type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO) {
            typeName = "bluetooth";
            displayType = "Bluetooth • Active";
            finalName = !rawName.isEmpty() ? rawName : "Bluetooth Audio Device";
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && 
                  (type == AudioDeviceInfo.TYPE_BLE_HEADSET || type == AudioDeviceInfo.TYPE_BLE_SPEAKER || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && type == AudioDeviceInfo.TYPE_BLE_BROADCAST))) {
            typeName = "ble";
            displayType = "BLE Audio • Active";
            finalName = !rawName.isEmpty() ? rawName : "BLE Audio Device";
        } else if (type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES || type == AudioDeviceInfo.TYPE_WIRED_HEADSET) {
            typeName = "wired";
            displayType = "Wired Audio • Active";
            finalName = !rawName.isEmpty() ? rawName : "Wired Headphones";
        } else if (type == AudioDeviceInfo.TYPE_USB_DEVICE || type == AudioDeviceInfo.TYPE_USB_HEADSET) {
            typeName = "usb";
            displayType = "USB Audio • Active";
            finalName = !rawName.isEmpty() ? rawName : "USB Audio Device";
        } else {
            typeName = "internal";
            displayType = "Built-in Speaker";
            finalName = "Phone Speaker";
        }

        obj.put("id", String.valueOf(dev.getId()));
        obj.put("type", typeName);
        obj.put("displayType", displayType);
        obj.put("name", finalName);
        obj.put("isConnected", true);
        obj.put("isActive", true);
        return obj;
    }

    private JSObject createFallbackDevice(String type, String name, String displayType, boolean isActive) {
        JSObject obj = new JSObject();
        obj.put("id", "default");
        obj.put("type", type);
        obj.put("name", name);
        obj.put("displayType", displayType);
        obj.put("isConnected", true);
        obj.put("isActive", isActive);
        return obj;
    }

    private void notifyAudioOutputChanged() {
        JSObject activeDev = getActiveOutputDevice();
        notifyListeners("audioOutputChanged", activeDev);
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        Context context = getContext();
        if (noisyReceiver != null && context != null) {
            try {
                context.unregisterReceiver(noisyReceiver);
            } catch (Exception ignored) {}
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioManager != null && audioDeviceCallback != null) {
            try {
                audioManager.unregisterAudioDeviceCallback(audioDeviceCallback);
            } catch (Exception ignored) {}
        }
    }
}
