import 'dart:js_interop';
import 'dart:js_interop_unsafe';
import 'package:flutter/foundation.dart';

typedef ThemeChangeCallback = void Function(String theme);
typedef ButtonClickCallback = void Function(int count);

/// JavaScript bridge connecting Joymify Flutter Web Hub with Playwright & browser automation.
class JoyHubBridge {
  static bool _initialized = false;
  static int _buttonClickCount = 0;
  static String _currentTheme = 'light';
  static ThemeChangeCallback? _onThemeChange;
  static ButtonClickCallback? _onButtonClick;
  static JSObject? _hubJsObject;

  static bool get isReady => _initialized;
  static int get buttonClickCount => _buttonClickCount;
  static String get currentTheme => _currentTheme;

  /// Initializes the bridge and exposes `window.__joyHub` on the global context.
  static void initialize({
    required String initialTheme,
    required ThemeChangeCallback onThemeChange,
    ButtonClickCallback? onButtonClick,
  }) {
    _currentTheme = initialTheme;
    _onThemeChange = onThemeChange;
    _onButtonClick = onButtonClick;

    if (kIsWeb) {
      try {
        final hub = JSObject();
        _hubJsObject = hub;

        hub['ready'] = true.toJS;
        hub['currentTheme'] = _currentTheme.toJS;
        hub['buttonClickCount'] = _buttonClickCount.toJS;

        hub['setTheme'] = ((JSAny? theme) {
          if (theme != null && theme.isA<JSString>()) {
            setTheme((theme as JSString).toDart);
          } else if (theme != null) {
            setTheme(theme.toString());
          }
        }).toJS;

        hub['notifyButtonClick'] = (() {
          incrementButtonClick();
        }).toJS;

        globalContext['__joyHub'] = hub;
      } catch (_) {
        // Fallback for non-browser or test runner environments
      }
    }

    _initialized = true;
  }

  /// Sets the active theme and updates the JS bridge.
  static void setTheme(String theme) {
    if (theme != 'light' && theme != 'dark') return;
    _currentTheme = theme;
    if (kIsWeb && _hubJsObject != null) {
      _hubJsObject!['currentTheme'] = theme.toJS;
    }
    _onThemeChange?.call(theme);
  }

  /// Increments the interactive button click count and updates the JS bridge.
  static void incrementButtonClick() {
    _buttonClickCount++;
    if (kIsWeb && _hubJsObject != null) {
      _hubJsObject!['buttonClickCount'] = _buttonClickCount.toJS;
    }
    _onButtonClick?.call(_buttonClickCount);
  }

  /// Resets the bridge state (useful for tests).
  static void reset() {
    _initialized = false;
    _buttonClickCount = 0;
    _currentTheme = 'light';
    _onThemeChange = null;
    _onButtonClick = null;
    _hubJsObject = null;
  }
}
