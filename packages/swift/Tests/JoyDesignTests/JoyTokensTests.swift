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
