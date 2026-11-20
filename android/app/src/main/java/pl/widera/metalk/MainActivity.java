package pl.widera.metalk;

import android.os.Bundle;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * MeTalk – główna aktywność.
 * Etap 1: pełny ekran (immersive – ukryte paski systemowe), ekran nie gaśnie, gdy aplikacja jest aktywna.
 * Orientacja pionowa jest ustawiona w AndroidManifest.xml.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Ekran nie gaśnie, dopóki aplikacja jest na wierzchu.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemBars();
    }

    @Override
    public void onResume() {
        super.onResume();
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Po dialogach systemowych / powrocie z tła paski potrafią wrócić – chowamy je ponownie.
        if (hasFocus) hideSystemBars();
    }

    /** Tryb immersive: paski statusu i nawigacji schowane; pojawiają się chwilowo po przeciągnięciu od krawędzi. */
    private void hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
