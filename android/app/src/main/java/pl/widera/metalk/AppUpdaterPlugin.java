package pl.widera.metalk;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Aktualizacja aplikacji z poziomu MeTalk (przycisk „Sprawdź aktualizacje” na ekranie logowania).
 * JS sprawdza wersję; ten plugin tylko pobiera wskazany APK (https), sprawdza go i otwiera
 * systemowe okno instalacji – zgodę na instalację zawsze daje człowiek.
 *
 * Kontrole przed instalacją: SHA-256 zgodny z plikiem wydania, ta sama nazwa pakietu,
 * wyższy versionCode. Podpis sprawdza sam Android (aktualizacja musi mieć ten sam klucz).
 */
@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    /** Czy MeTalk ma zgodę na instalowanie aplikacji (Android 8+: „Instalowanie nieznanych aplikacji”). */
    @PluginMethod
    public void canInstall(PluginCall call) {
        JSObject r = new JSObject();
        r.put("allowed", installAllowed());
        call.resolve(r);
    }

    /**
     * Pobiera APK i otwiera okno instalacji.
     * Parametry: url (https), sha256 (hex), versionCode (oczekiwany).
     * Błędy (code): NEED_PERMISSION, BAD_URL, DOWNLOAD, CHECKSUM, BAD_APK, NOT_NEWER, INSTALL.
     */
    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url", "");
        String sha256 = call.getString("sha256", "").toLowerCase(Locale.ROOT);
        if (!url.startsWith("https://")) { call.reject("Adres pliku musi zaczynać się od https://", "BAD_URL"); return; }
        if (!installAllowed()) {
            openInstallPermission();
            call.reject("Zezwól MeTalk na instalowanie aplikacji, wróć i kliknij ponownie.", "NEED_PERMISSION");
            return;
        }
        executor.execute(() -> {
            File dir = new File(getContext().getCacheDir(), "updates");
            File apk = new File(dir, "MeTalk-update.apk");
            try {
                dir.mkdirs();
                String got = download(url, apk);
                if (!sha256.isEmpty() && !sha256.equals(got)) { apk.delete(); call.reject("Pobrany plik jest uszkodzony.", "CHECKSUM"); return; }

                PackageManager pm = getContext().getPackageManager();
                PackageInfo update = pm.getPackageArchiveInfo(apk.getAbsolutePath(), 0);
                PackageInfo current = pm.getPackageInfo(getContext().getPackageName(), 0);
                if (update == null || !getContext().getPackageName().equals(update.packageName)) {
                    apk.delete(); call.reject("To nie jest plik MeTalk.", "BAD_APK"); return;
                }
                if (versionCode(update) <= versionCode(current)) {
                    apk.delete(); call.reject("Pobrana wersja nie jest nowsza.", "NOT_NEWER"); return;
                }

                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(uri, "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().runOnUiThread(() -> {
                    try {
                        getContext().startActivity(i);
                        JSObject r = new JSObject();
                        r.put("versionName", update.versionName);
                        call.resolve(r);
                    } catch (Exception e) {
                        call.reject("Nie udało się otworzyć instalatora.", "INSTALL", e);
                    }
                });
            } catch (Exception e) {
                apk.delete();
                call.reject("Nie udało się pobrać aktualizacji. Sprawdź internet.", "DOWNLOAD", e);
            }
        });
    }

    private boolean installAllowed() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true;
        return getContext().getPackageManager().canRequestPackageInstalls();
    }

    private void openInstallPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getActivity().runOnUiThread(() -> getContext().startActivity(i));
    }

    @SuppressWarnings("deprecation")
    private static long versionCode(PackageInfo p) {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? p.getLongVersionCode() : p.versionCode;
    }

    /** Pobiera plik (z przekierowaniami https → https) i zwraca jego SHA-256 (hex). */
    private static String download(String address, File out) throws Exception {
        URL url = new URL(address);
        HttpURLConnection c = null;
        for (int hop = 0; hop < 5; hop++) {
            c = (HttpURLConnection) url.openConnection();
            c.setInstanceFollowRedirects(false);
            c.setConnectTimeout(15000);
            c.setReadTimeout(30000);
            int code = c.getResponseCode();
            if (code >= 300 && code < 400) {
                URL next = new URL(url, c.getHeaderField("Location"));
                c.disconnect();
                if (!"https".equals(next.getProtocol())) throw new Exception("redirect to non-https");
                url = next;
                continue;
            }
            if (code != 200) throw new Exception("HTTP " + code);
            break;
        }
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        try (InputStream in = c.getInputStream(); OutputStream os = new FileOutputStream(out)) {
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) > 0) { os.write(buf, 0, n); md.update(buf, 0, n); }
        } finally {
            c.disconnect();
        }
        StringBuilder sb = new StringBuilder();
        for (byte b : md.digest()) sb.append(String.format(Locale.ROOT, "%02x", b));
        return sb.toString();
    }
}
