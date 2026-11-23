import XCTest
import SwiftUI
@testable import JoyDesign

final class JoyTokensTests: XCTestCase {
    func testSpacingScale() {
        XCTAssertEqual(JoyDesign.Space.s1, 4)
        XCTAssertEqual(JoyDesign.Space.s2, 8)
        XCTAssertEqual(JoyDesign.Space.s3, 12)
        XCTAssertEqual(JoyDesign.Space.s4, 16)
        XCTAssertEqual(JoyDesign.Space.s5, 24)
        XCTAssertEqual(JoyDesign.Space.s6, 32)
        XCTAssertEqual(JoySpaceTokens.s4, 16)
    }

    func testRadiusAndFontSizeTokens() {
        XCTAssertEqual(JoyDesign.Radius.r1, 6)
        XCTAssertEqual(JoyDesign.Radius.r2, 10)
        XCTAssertEqual(JoyDesign.Radius.r3, 16)
        XCTAssertEqual(JoyRadiusTokens.control, 6)
        XCTAssertEqual(JoyRadiusTokens.card, 12)
        XCTAssertEqual(JoyFontSizeTokens.md, 16)
    }

    func testSemanticModes() {
        XCTAssertFalse(JoyThemeTokens.light.isDark)
        XCTAssertTrue(JoyThemeTokens.dark.isDark)
        XCTAssertFalse(JoyThemeTokens.modernLight.isDark)
        XCTAssertTrue(JoyThemeTokens.modernDark.isDark)
        XCTAssertFalse(JoyThemeTokens.modern(isDark: false).isDark)
        XCTAssertTrue(JoyThemeTokens.modern(isDark: true).isDark)
    }

    func testModernPresetTokensMatchSpecimen() {
        XCTAssertEqual(JoyModernTokens.radiusControl, 3)
        XCTAssertEqual(JoyModernTokens.radiusCard, 4)
        XCTAssertEqual(JoyModernTokens.seamWidth, 6)
        XCTAssertEqual(JoyModernTokens.firstLightAngleDegrees, 172)

        XCTAssertEqual(JoyModernTokens.sky1, Color(joyHex: 0x0B1226))
        XCTAssertEqual(JoyModernTokens.sky2, Color(joyHex: 0x101B38))
        XCTAssertEqual(JoyModernTokens.sky3, Color(joyHex: 0x2A2014))
        XCTAssertEqual(JoyModernTokens.sky4, Color(joyHex: 0x4A2A14))
        XCTAssertEqual(JoyModernTokens.sky5, Color(joyHex: 0xC7743F))
        XCTAssertEqual(JoyModernTokens.sky6, Color(joyHex: 0xF2C078))
        XCTAssertEqual(JoyModernTokens.skyText, Color(joyHex: 0xFBF3E9))
        XCTAssertEqual(JoyModernTokens.pill, Color(joyHex: 0xDAB362))
        XCTAssertEqual(JoyModernTokens.pillFg, Color(joyHex: 0x150B00))
        XCTAssertEqual(JoyModernTokens.sun, Color(joyHex: 0xDAB362))

        let light = JoyModernTokens.mode(isDark: false)
        XCTAssertFalse(light.isDark)
        XCTAssertEqual(light.canvas, Color(joyHex: 0xF3F5F9))
        XCTAssertEqual(light.card, Color(joyHex: 0xFFFFFF))
        XCTAssertEqual(light.text, Color(joyHex: 0x14253E))
        XCTAssertEqual(light.muted, Color(joyHex: 0x4E5F7B))
        XCTAssertEqual(light.border, Color(joyHex: 0xD5DBE6))
        XCTAssertEqual(light.mast, Color(joyHex: 0x14253E))
        XCTAssertEqual(light.mastHover, Color(joyHex: 0x223250))
        XCTAssertEqual(light.mastText, Color(joyHex: 0xF3F5F9))
        XCTAssertEqual(light.mastCtl, Color(joyHex: 0xA9B4C6))
        XCTAssertEqual(light.action, Color(joyHex: 0xDAB362))
        XCTAssertEqual(light.actionHover, Color(joyHex: 0xF4E6CA))
        XCTAssertEqual(light.actionFg, Color(joyHex: 0x150B00))
        XCTAssertEqual(light.actionEdge, Color(joyHex: 0xA5802B))
        XCTAssertEqual(light.solid, Color(joyHex: 0x14253E))
        XCTAssertEqual(light.solidFg, Color(joyHex: 0xF3F5F9))
        XCTAssertEqual(light.live, Color(joyHex: 0xAE7D0E))
        XCTAssertEqual(light.seamA, Color(joyHex: 0xE0B03A))
        XCTAssertEqual(light.seamB, Color(joyHex: 0xAE7D0E))
        XCTAssertEqual(light.ok, Color(joyHex: 0x306D35))
        XCTAssertEqual(light.warn, Color(joyHex: 0xAD4A00))
        XCTAssertEqual(light.bad, Color(joyHex: 0x9F3331))
        XCTAssertEqual(light.info, Color(joyHex: 0x2C6193))
        XCTAssertEqual(light.firstLightStops.count, 6)
        XCTAssertEqual(light.firstLightStops.map(\.location), [0.00, 0.46, 0.56, 0.63, 0.80, 1.00])

        let dark = JoyModernTokens.mode(isDark: true)
        XCTAssertTrue(dark.isDark)
        XCTAssertEqual(dark.canvas, Color(joyHex: 0x0A121F))
        XCTAssertEqual(dark.card, Color(joyHex: 0x111B2B))
        XCTAssertEqual(dark.text, Color(joyHex: 0xEEF2F8))
        XCTAssertEqual(dark.muted, Color(joyHex: 0xA9B4C6))
        XCTAssertEqual(dark.border, Color(joyHex: 0x223250))
        XCTAssertEqual(dark.mast, Color(joyHex: 0x0A121F))
        XCTAssertEqual(dark.mastHover, Color(joyHex: 0x111B2B))
        XCTAssertEqual(dark.mastText, Color(joyHex: 0xEEF2F8))
        XCTAssertEqual(dark.action, Color(joyHex: 0xDAB362))
        XCTAssertEqual(dark.actionHover, Color(joyHex: 0xF4E6CA))
        XCTAssertEqual(dark.actionFg, Color(joyHex: 0x150B00))
        XCTAssertEqual(dark.solid, Color(joyHex: 0xEEF2F8))
        XCTAssertEqual(dark.solidHover, Color(joyHex: 0xD5DBE6))
        XCTAssertEqual(dark.solidFg, Color(joyHex: 0x0A121F))
        XCTAssertEqual(dark.live, Color(joyHex: 0xDAB362))
        XCTAssertEqual(dark.seamA, Color(joyHex: 0xF0CC7A))
        XCTAssertEqual(dark.seamB, Color(joyHex: 0xB8892B))
        XCTAssertEqual(dark.ok, Color(joyHex: 0x93C794))
        XCTAssertEqual(dark.warn, Color(joyHex: 0xF2884A))
        XCTAssertEqual(dark.bad, Color(joyHex: 0xFB9890))
        XCTAssertEqual(dark.info, Color(joyHex: 0x8FBCEB))
        XCTAssertEqual(dark.firstLightStops.count, 6)
        XCTAssertEqual(dark.firstLightStops.map(\.location), [0.00, 0.52, 0.61, 0.68, 0.86, 1.00])

        XCTAssertEqual(JoyThemeTokens.modernLight.surfaceCanvas, Color(joyHex: 0xF3F5F9))
        XCTAssertEqual(JoyThemeTokens.modernLight.statusWarningFg, Color(joyHex: 0xAD4A00))
        XCTAssertEqual(JoyThemeTokens.modernDark.surfaceCanvas, Color(joyHex: 0x0A121F))
        XCTAssertEqual(JoyThemeTokens.modernDark.statusWarningFg, Color(joyHex: 0xF2884A))
    }

    func testBadgeTonesAndComponentsInitialize() {
        let tones: [JoyDesign.BadgeTone] = [.gold, .bronze, .success, .danger, .warn, .info, .neutral]
        for tone in tones {
            XCTAssertNotNil(tone.foreground)
            XCTAssertNotNil(tone.background)
            XCTAssertNotNil(tone.border)
        }

        let badge = JoyBadge("READY", tone: .success)
        XCTAssertEqual(badge.text, "READY")

        let kpi = JoyKpiTile(label: "FPS", value: "60", subtitle: "60 Hz", accentTone: .gold)
        XCTAssertEqual(kpi.label, "FPS")
        XCTAssertEqual(kpi.value, "60")

        let card = JoyCard(title: "Telemetry", badge: "LIVE", badgeTone: .gold, strongBorder: true) {
            JoyWell {
                Text("Content")
            }
        }
        XCTAssertEqual(card.title, "Telemetry")
        XCTAssertEqual(card.badgeText, "LIVE")
        XCTAssertTrue(card.strongBorder)

        let primaryStyle = JoyPrimaryButtonStyle()
        let ghostStyle = JoyGhostButtonStyle(isActive: true)
        XCTAssertNotNil(primaryStyle)
        XCTAssertTrue(ghostStyle.isActive)
    }
}
