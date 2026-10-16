import XCTest
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
}
