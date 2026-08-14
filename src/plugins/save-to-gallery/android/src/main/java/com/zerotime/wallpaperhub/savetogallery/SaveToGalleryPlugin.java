package com.zerotime.wallpaperhub.savetogallery;

import android.Manifest;
import android.content.ContentValues;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

@CapacitorPlugin(
    name = "SaveToGallery",
    permissions = {
        @Permission(alias = "storage", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE })
    }
)
public class SaveToGalleryPlugin extends Plugin {

    @PluginMethod
    public void saveImage(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.trim().isEmpty()) {
            call.reject("path is required");
            return;
        }

        // Android 10 (API 29) and above use MediaStore and need no permission.
        // Older versions write to public storage directly, so request
        // WRITE_EXTERNAL_STORAGE when it has not been granted yet.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && !hasStoragePermission()) {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
            return;
        }

        saveImageToGallery(call);
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        if (hasStoragePermission()) {
            saveImageToGallery(call);
        } else {
            call.reject("Storage permission is required to save images on this device");
        }
    }

    private boolean hasStoragePermission() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE)
            == PackageManager.PERMISSION_GRANTED;
    }

    private void saveImageToGallery(PluginCall call) {
        try {
            String path = call.getString("path");
            String album = call.getString("album");
            String mime = call.getString("mime");
            if (album == null || album.trim().isEmpty()) {
                album = "Wallpapers";
            }
            if (mime == null || mime.trim().isEmpty()) {
                mime = "image/jpeg";
            }

            File srcFile = resolveFile(path);
            if (!srcFile.exists()) {
                call.reject("Source file not found: " + path);
                return;
            }

            String uri = insertIntoGallery(srcFile, album, mime);
            JSObject result = new JSObject();
            result.put("uri", uri);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to save image: " + e.getMessage(), e);
        }
    }

    private File resolveFile(String path) {
        if (path.startsWith("file://")) {
            return new File(Uri.parse(path).getPath());
        }
        return new File(path);
    }

    private String insertIntoGallery(File srcFile, String album, String mime) throws Exception {
        Context context = getContext();
        String displayName = srcFile.getName();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, displayName);
            values.put(MediaStore.Images.Media.MIME_TYPE, mime);
            values.put(
                MediaStore.Images.Media.RELATIVE_PATH,
                Environment.DIRECTORY_PICTURES + File.separator + album
            );
            values.put(MediaStore.Images.Media.IS_PENDING, 1);

            Uri collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
            Uri item = context.getContentResolver().insert(collection, values);
            if (item == null) {
                throw new Exception("Could not create a gallery entry");
            }

            OutputStream out = context.getContentResolver().openOutputStream(item);
            if (out == null) {
                context.getContentResolver().delete(item, null, null);
                throw new Exception("Could not open output stream for the gallery entry");
            }
            copyFile(srcFile, out);

            values.clear();
            values.put(MediaStore.Images.Media.IS_PENDING, 0);
            context.getContentResolver().update(item, values, null, null);
            return item.toString();
        }

        File dir = new File(
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
            album
        );
        if (!dir.exists() && !dir.mkdirs()) {
            throw new Exception("Could not create the gallery album directory");
        }
        File dest = new File(dir, displayName);
        copyFile(srcFile, new FileOutputStream(dest));
        return Uri.fromFile(dest).toString();
    }

    private void copyFile(File src, OutputStream out) throws Exception {
        try (InputStream in = new FileInputStream(src); OutputStream os = out) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) > 0) {
                os.write(buffer, 0, read);
            }
            os.flush();
        }
    }
}
