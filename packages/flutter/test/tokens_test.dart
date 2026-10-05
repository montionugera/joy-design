import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

void main() {
  test('Dart tokens compile and match resolved tokens.json values', () {
    const light = JoyThemeTokens.light;
    const dark = JoyThemeTokens.dark;

    expect(light.surface.canvas, isNotNull);
    expect(dark.surface.canvas, isNotNull);
    expect(light.surface.canvas, isNot(equals(dark.surface.canvas)));

    expect(JoySpacing.s4, equals(4.0));
    expect(JoySpacing.s8, equals(8.0));
    expect(JoySpacing.s16, equals(16.0));
    expect(JoyRadius.md, equals(8.0));
  });

  test('JoyThemeTokens provides all palette presets and outdoor mode', () {
    final classic = JoyThemeTokens.classic();
    final bauhaus = JoyThemeTokens.bauhausPrimary();
    final clay = JoyThemeTokens.clayCourt();
    final nordic = JoyThemeTokens.nordicSlate();
    final verdant = JoyThemeTokens.verdantLawn();
    final outdoor = JoyThemeTokens.outdoor();

    expect(classic.palette, equals('classic'));
    expect(bauhaus.palette, equals('bauhaus-primary'));
    expect(clay.palette, equals('clay-court'));
    expect(nordic.palette, equals('nordic-slate'));
    expect(verdant.palette, equals('verdant-lawn'));
    expect(outdoor.palette, equals('outdoor'));

    expect(JoyPalettePreset.values.length, equals(6));
  });

  test('JoyThemeTokens 3-level status colors and reserved words resolve', () {
    const light = JoyThemeTokens.light;

    // Status 3-level structure
    expect(light.status.success.fg, isNotNull);
    expect(light.status.success.bg, isNotNull);
    expect(light.status.success.border, isNotNull);
    expect(light.status.successFg, equals(light.status.success.fg));

    // Reserved word mapping (default -> base)
    expect(light.accent.base, isNotNull);
    expect(light.border.base, isNotNull);
    expect(light.accent.primary, equals(light.accent.base));
  });

  test('JoyTheme.themeData produces valid ThemeData with extension', () {
    final lightTheme = JoyTheme.themeData(JoyThemeTokens.light);
    expect(lightTheme.brightness, equals(Brightness.light));
    expect(lightTheme.extension<JoyThemeTokens>(), isNotNull);

    final darkTheme = JoyTheme.themeData(JoyThemeTokens.dark);
    expect(darkTheme.brightness, equals(Brightness.dark));
    expect(darkTheme.extension<JoyThemeTokens>(), isNotNull);
  });
}
