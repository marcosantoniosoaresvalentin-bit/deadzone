package com.deadzone.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.PackageInfo;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Deadzone · tela única do jogo.
 *
 * O jogo (pasta assets/www, gerada por "npm run build:android") é servido em
 * https://appassets.androidplatform.net/ pelo WebViewAssetLoader. Assim ele roda
 * em um contexto seguro (HTTPS): login, armazenamento local e modo online
 * funcionam igual ao navegador.
 *
 * ATUALIZAÇÃO DENTRO DO APP: o jogo pergunta (ponte "DZApp") se há versão nova no GitHub;
 * se houver, baixa o pacote www.zip da versão, confere o SHA-256, descompacta em
 * files/upd/current e passa a abrir o jogo de lá (https://appassets.androidplatform.net/upd/).
 * O endereço é o mesmo, então os dados salvos (localStorage) continuam.
 */
public class MainActivity extends Activity {

    private static final String HOST = "https://appassets.androidplatform.net";
    private static final String BUILTIN_URL = HOST + "/assets/www/index.html";
    private static final String UPDATE_URL = HOST + "/upd/index.html";
    private static final String VERSION_URL =
            "https://github.com/marcosantoniosoaresvalentin-bit/deadzone/releases/latest/download/version.json";
    private WebView webView;
    private volatile boolean busy = false;
    private JSONObject remote = null;

    private File updDir() { return new File(getFilesDir(), "upd/current"); }

    private int apkCode() {
        try {
            PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? (int) pi.getLongVersionCode() : pi.versionCode;
        } catch (Exception e) { return 0; }
    }

    private static String readAll(InputStream in) throws Exception {
        ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n);
        in.close(); return o.toString("UTF-8");
    }

    /** versão do conteúdo baixado (0 se não houver) */
    private int updCode() {
        try { return new JSONObject(readAll(new FileInputStream(new File(updDir(), "version.json")))).optInt("code", 0); }
        catch (Exception e) { return 0; }
    }

    private boolean useUpdate() { return new File(updDir(), "index.html").exists() && updCode() > apkCode(); }
    private String startUrl() { return useUpdate() ? UPDATE_URL : BUILTIN_URL; }
    private int currentCode() { return Math.max(apkCode(), useUpdate() ? updCode() : 0); }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        updDir().getParentFile().mkdirs();
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/upd/", new WebViewAssetLoader.InternalStoragePathHandler(this, updDir()))
                .build();

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);   // sempre os arquivos da versão instalada (nunca a versão antiga em cache)
        webView.clearCache(true);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
        });
        webView.addJavascriptInterface(new Bridge(), "DZApp");
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(webView);
        hideSystemBars();

        if (savedInstanceState != null) webView.restoreState(savedInstanceState);
        else webView.loadUrl(startUrl());
    }

    private void toJs(final JSONObject o) {
        runOnUiThread(() -> { if (webView != null) webView.evaluateJavascript("window.dzUpd&&window.dzUpd(" + o.toString() + ")", null); });
    }

    private JSONObject msg(String st) { JSONObject o = new JSONObject(); try { o.put("st", st); } catch (Exception e) { } return o; }

    private HttpURLConnection open(String u) throws Exception {
        HttpURLConnection c = null;
        for (int i = 0; i < 6; i++) { // segue os redirecionamentos do GitHub (github.com -> objects.githubusercontent.com)
            c = (HttpURLConnection) new URL(u).openConnection();
            c.setInstanceFollowRedirects(false); c.setConnectTimeout(15000); c.setReadTimeout(30000);
            c.setRequestProperty("User-Agent", "Deadzone-App");
            int code = c.getResponseCode();
            if (code >= 300 && code < 400) { String loc = c.getHeaderField("Location"); c.disconnect(); if (loc == null || !loc.startsWith("https://")) throw new Exception("redirecionamento inválido"); u = loc; continue; }
            if (code != 200) throw new Exception("HTTP " + code);
            return c;
        }
        throw new Exception("muitos redirecionamentos");
    }

    /** Ponte usada pelo jogo (src/js/features/updater.js). */
    private class Bridge {
        @JavascriptInterface public String info() {
            JSONObject o = new JSONObject();
            try { o.put("apk", apkCode()); o.put("code", currentCode()); o.put("upd", useUpdate()); } catch (Exception e) { }
            return o.toString();
        }

        @JavascriptInterface public void check() {
            if (busy) return;
            new Thread(() -> {
                try {
                    HttpURLConnection c = open(VERSION_URL);
                    JSONObject r = new JSONObject(readAll(c.getInputStream()));
                    remote = r;
                    JSONObject o = msg(r.optInt("code", 0) > currentCode() ? "avail" : "none");
                    o.put("v", r.optString("v")); o.put("size", r.optLong("size")); o.put("code", r.optInt("code"));
                    toJs(o);
                } catch (Exception e) { JSONObject o = msg("offline"); try { o.put("m", String.valueOf(e.getMessage())); } catch (Exception x) { } toJs(o); }
            }).start();
        }

        @JavascriptInterface public void download() {
            if (busy || remote == null) return;
            busy = true;
            new Thread(() -> {
                File zip = new File(getCacheDir(), "upd.zip"), tmp = new File(getFilesDir(), "upd/tmp"), cur = updDir();
                try {
                    String url = remote.getString("url"), sha = remote.optString("sha256", "").toLowerCase();
                    if (!url.startsWith("https://github.com/marcosantoniosoaresvalentin-bit/deadzone/releases/download/")) throw new Exception("endereço inválido");
                    HttpURLConnection c = open(url);
                    long total = c.getContentLengthLong(); if (total <= 0) total = remote.optLong("size", 0);
                    MessageDigest md = MessageDigest.getInstance("SHA-256");
                    try (InputStream in = new BufferedInputStream(c.getInputStream()); OutputStream out = new FileOutputStream(zip)) {
                        byte[] b = new byte[65536]; long got = 0; int n, last = -1;
                        while ((n = in.read(b)) > 0) {
                            out.write(b, 0, n); md.update(b, 0, n); got += n;
                            int p = total > 0 ? (int) (got * 100 / total) : 0;
                            if (p != last) { last = p; JSONObject o = msg("prog"); o.put("p", p); toJs(o); }
                        }
                    }
                    StringBuilder h = new StringBuilder(); for (byte x : md.digest()) h.append(String.format("%02x", x));
                    if (!sha.isEmpty() && !sha.equals(h.toString())) throw new Exception("arquivo corrompido");
                    toJs(msg("unzip"));
                    deleteAll(tmp); tmp.mkdirs();
                    String base = tmp.getCanonicalPath() + File.separator;
                    try (ZipInputStream zin = new ZipInputStream(new BufferedInputStream(new FileInputStream(zip)))) {
                        ZipEntry e; byte[] b = new byte[65536];
                        while ((e = zin.getNextEntry()) != null) {
                            File f = new File(tmp, e.getName());
                            if (!f.getCanonicalPath().startsWith(base)) throw new Exception("pacote inválido");
                            if (e.isDirectory()) { f.mkdirs(); continue; }
                            f.getParentFile().mkdirs();
                            try (OutputStream out = new FileOutputStream(f)) { int n; while ((n = zin.read(b)) > 0) out.write(b, 0, n); }
                        }
                    }
                    if (!new File(tmp, "index.html").exists()) throw new Exception("pacote incompleto");
                    deleteAll(cur);
                    if (!tmp.renameTo(cur)) throw new Exception("não foi possível instalar");
                    zip.delete();
                    toJs(msg("ready"));
                } catch (Exception e) {
                    deleteAll(tmp); zip.delete();
                    JSONObject o = msg("err"); try { o.put("m", String.valueOf(e.getMessage())); } catch (Exception x) { } toJs(o);
                } finally { busy = false; }
            }).start();
        }

        @JavascriptInterface public void restart() {
            runOnUiThread(() -> { if (webView != null) { webView.clearCache(true); webView.loadUrl(startUrl()); } });
        }
    }

    private static void deleteAll(File f) {
        if (f == null || !f.exists()) return;
        File[] l = f.listFiles(); if (l != null) for (File c : l) deleteAll(c);
        f.delete();
    }

    /** Tela cheia imersiva: esconde barra de status e navegação. */
    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        View d = getWindow().getDecorView();
        d.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (webView != null) webView.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        hideSystemBars();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
