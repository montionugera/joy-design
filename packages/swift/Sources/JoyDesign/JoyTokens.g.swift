// GENERATED CODE - DO NOT MODIFY BY HAND
// Source: packages/tokens/src/tokens.json
// Generator: packages/tokens/scripts/gen-swift-tokens.mjs

import Foundation
import SwiftUI

public extension Color {
    init(joyHex: UInt32, alpha: Double = 1.0) {
        let r = Double((joyHex >> 16) & 0xFF) / 255.0
        let g = Double((joyHex >> 8) & 0xFF) / 255.0
        let b = Double(joyHex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}

/// Generated primitive color ramps from tokens.json.
public enum JoyColorRamps {
    public static let navy50 = Color(joyHex: 0xECF2FC)
    public static let navy100 = Color(joyHex: 0xCED8E8)
    public static let navy200 = Color(joyHex: 0xA2B2CB)
    public static let navy300 = Color(joyHex: 0x7487A5)
    public static let navy400 = Color(joyHex: 0x566A87)
    public static let navy500 = Color(joyHex: 0x14253E)
    public static let navy600 = Color(joyHex: 0x142238)
    public static let navy700 = Color(joyHex: 0x132033)
    public static let navy800 = Color(joyHex: 0x111B2B)
    public static let navy900 = Color(joyHex: 0x0D1624)
    public static let navy950 = Color(joyHex: 0x0A121F)
    public static let gold50 = Color(joyHex: 0xFBF4E6)
    public static let gold100 = Color(joyHex: 0xF4E6CA)
    public static let gold200 = Color(joyHex: 0xE9CD94)
    public static let gold300 = Color(joyHex: 0xDAB362)
    public static let gold400 = Color(joyHex: 0xC49A3A)
    public static let gold450 = Color(joyHex: 0xAD8A3B)
    public static let gold500 = Color(joyHex: 0xA5802B)
    public static let gold600 = Color(joyHex: 0x856515)
    public static let gold700 = Color(joyHex: 0x674B00)
    public static let gold800 = Color(joyHex: 0x4B3300)
    public static let gold900 = Color(joyHex: 0x2F1E00)
    public static let gold950 = Color(joyHex: 0x150B00)
    public static let ink50 = Color(joyHex: 0xF4F2EC)
    public static let ink100 = Color(joyHex: 0xDAD7CF)
    public static let ink200 = Color(joyHex: 0xAEABA0)
    public static let ink300 = Color(joyHex: 0x7E7A70)
    public static let ink400 = Color(joyHex: 0x4B483D)
    public static let ink500 = Color(joyHex: 0x1F1C13)
    public static let ink600 = Color(joyHex: 0x18160E)
    public static let ink700 = Color(joyHex: 0x13100A)
    public static let ink800 = Color(joyHex: 0x0D0B06)
    public static let ink900 = Color(joyHex: 0x080604)
    public static let ink950 = Color(joyHex: 0x040302)
    public static let cream50 = Color(joyHex: 0xFDFAF3)
    public static let cream100 = Color(joyHex: 0xF8F3E8)
    public static let cream200 = Color(joyHex: 0xEFE9DC)
    public static let cream300 = Color(joyHex: 0xE3DCCC)
    public static let neutral50 = Color(joyHex: 0xF8F5EE)
    public static let neutral100 = Color(joyHex: 0xEAE8E0)
    public static let neutral200 = Color(joyHex: 0xD3D1CA)
    public static let neutral300 = Color(joyHex: 0xBAB7B0)
    public static let neutral400 = Color(joyHex: 0x88867F)
    public static let neutral500 = Color(joyHex: 0x686660)
    public static let neutral600 = Color(joyHex: 0x52504A)
    public static let neutral700 = Color(joyHex: 0x3C3A35)
    public static let neutral800 = Color(joyHex: 0x26241F)
    public static let neutral900 = Color(joyHex: 0x13110D)
    public static let neutral950 = Color(joyHex: 0x050402)
    public static let statusSuccess100 = Color(joyHex: 0xE7F2E7)
    public static let success100 = statusSuccess100
    public static let statusSuccess300 = Color(joyHex: 0x93C794)
    public static let success300 = statusSuccess300
    public static let statusSuccess500 = Color(joyHex: 0x478D4B)
    public static let success500 = statusSuccess500
    public static let statusSuccess600 = Color(joyHex: 0x306D35)
    public static let success600 = statusSuccess600
    public static let statusSuccess700 = Color(joyHex: 0x1A4F1F)
    public static let success700 = statusSuccess700
    public static let statusSuccess900 = Color(joyHex: 0x061B07)
    public static let success900 = statusSuccess900
    public static let statusWarning100 = Color(joyHex: 0xF7EDDF)
    public static let warning100 = statusWarning100
    public static let statusWarning300 = Color(joyHex: 0xDFAE68)
    public static let warning300 = statusWarning300
    public static let statusWarning500 = Color(joyHex: 0xA96B00)
    public static let warning500 = statusWarning500
    public static let statusWarning600 = Color(joyHex: 0x865000)
    public static let warning600 = statusWarning600
    public static let statusWarning700 = Color(joyHex: 0x643600)
    public static let warning700 = statusWarning700
    public static let statusWarning900 = Color(joyHex: 0x241100)
    public static let warning900 = statusWarning900
    public static let statusDanger100 = Color(joyHex: 0xFEE9E6)
    public static let danger100 = statusDanger100
    public static let statusDanger300 = Color(joyHex: 0xFB9890)
    public static let danger300 = statusDanger300
    public static let statusDanger500 = Color(joyHex: 0xC74B47)
    public static let danger500 = statusDanger500
    public static let statusDanger600 = Color(joyHex: 0x9F3331)
    public static let danger600 = statusDanger600
    public static let statusDanger700 = Color(joyHex: 0x781B1C)
    public static let danger700 = statusDanger700
    public static let statusDanger900 = Color(joyHex: 0x2D0606)
    public static let danger900 = statusDanger900
    public static let statusInfo100 = Color(joyHex: 0xE6F0F9)
    public static let info100 = statusInfo100
    public static let statusInfo300 = Color(joyHex: 0x8FBCEB)
    public static let info300 = statusInfo300
    public static let statusInfo500 = Color(joyHex: 0x437EB9)
    public static let info500 = statusInfo500
    public static let statusInfo600 = Color(joyHex: 0x2C6193)
    public static let info600 = statusInfo600
    public static let statusInfo700 = Color(joyHex: 0x17446F)
    public static let info700 = statusInfo700
    public static let statusInfo900 = Color(joyHex: 0x051729)
    public static let info900 = statusInfo900
    public static let clay50 = Color(joyHex: 0xFBF0EA)
    public static let clay100 = Color(joyHex: 0xF0D8C9)
    public static let clay200 = Color(joyHex: 0xDFB093)
    public static let clay300 = Color(joyHex: 0xC97C52)
    public static let clay400 = Color(joyHex: 0xA85A34)
    public static let clay500 = Color(joyHex: 0x8A4526)
    public static let clay600 = Color(joyHex: 0x63311B)
}

/// Generated spacing tokens from tokens.json.
public enum JoySpaceTokens {
    public static let s1: CGFloat = 4
    public static let s2: CGFloat = 8
    public static let s3: CGFloat = 12
    public static let s4: CGFloat = 16
    public static let s5: CGFloat = 20
    public static let s6: CGFloat = 24
    public static let s8: CGFloat = 32
    public static let s10: CGFloat = 40
    public static let s12: CGFloat = 48
    public static let s16: CGFloat = 64
    public static let s20: CGFloat = 80
    public static let s24: CGFloat = 96
    public static let s0_5: CGFloat = 2
}

/// Generated corner radius tokens from tokens.json.
public enum JoyRadiusTokens {
    public static let control: CGFloat = 6
    public static let card: CGFloat = 12
    public static let overlay: CGFloat = 16
    public static let pill: CGFloat = 9999
}

/// Generated font-size tokens from tokens.json.
public enum JoyFontSizeTokens {
    public static let xs: CGFloat = 12
    public static let sm: CGFloat = 14
    public static let md: CGFloat = 16
    public static let lg: CGFloat = 19.2
    public static let xl: CGFloat = 23.04
    public static let n2xl: CGFloat = 27.648
    public static let n3xl: CGFloat = 33.184
    public static let n4xl: CGFloat = 39.808
    public static let n5xl: CGFloat = 47.776
    public static let displaySm: CGFloat = 32
    public static let displayMd: CGFloat = 40
    public static let displayLg: CGFloat = 48
}

/// Semantic theme tokens for Light and Dark modes.
public struct JoyThemeTokens: Sendable {
    public let surfaceCanvas: Color
    public let surfaceCard: Color
    public let surfaceElevated: Color
    public let surfaceSunken: Color
    public let textPrimary: Color
    public let textSecondary: Color
    public let textMuted: Color
    public let textOnAccent: Color
    public let borderSubtle: Color
    public let borderDefault: Color
    public let borderStrong: Color
    public let accentBase: Color
    public let accentHover: Color
    public let accentSubtle: Color
    public let statusSuccessFg: Color
    public let statusWarningFg: Color
    public let statusDangerFg: Color
    public let statusInfoFg: Color
    public let isDark: Bool

    public static let light = JoyThemeTokens(
        surfaceCanvas: Color(joyHex: 0xF8F3E8),
        surfaceCard: Color(joyHex: 0xFFFFFF),
        surfaceElevated: Color(joyHex: 0xFFFFFF),
        surfaceSunken: Color(joyHex: 0xEFE9DC),
        textPrimary: Color(joyHex: 0x1F1C13),
        textSecondary: Color(joyHex: 0x3C3A35),
        textMuted: Color(joyHex: 0x686660),
        textOnAccent: Color(joyHex: 0x14253E),
        borderSubtle: Color(joyHex: 0xE3DCCC),
        borderDefault: Color(joyHex: 0x88867F),
        borderStrong: Color(joyHex: 0x52504A),
        accentBase: Color(joyHex: 0xC49A3A),
        accentHover: Color(joyHex: 0xA5802B),
        accentSubtle: Color(joyHex: 0xFBF4E6),
        statusSuccessFg: Color(joyHex: 0x1A4F1F),
        statusWarningFg: Color(joyHex: 0x643600),
        statusDangerFg: Color(joyHex: 0x9F3331),
        statusInfoFg: Color(joyHex: 0x17446F),
        isDark: false
    )

    public static let dark = JoyThemeTokens(
        surfaceCanvas: Color(joyHex: 0x0D1624),
        surfaceCard: Color(joyHex: 0x111B2B),
        surfaceElevated: Color(joyHex: 0x14253E),
        surfaceSunken: Color(joyHex: 0x0A121F),
        textPrimary: Color(joyHex: 0xF8F3E8),
        textSecondary: Color(joyHex: 0xBAB7B0),
        textMuted: Color(joyHex: 0xA2B2CB),
        textOnAccent: Color(joyHex: 0x0A121F),
        borderSubtle: Color(joyHex: 0x22324B),
        borderDefault: Color(joyHex: 0x566A87),
        borderStrong: Color(joyHex: 0x7487A5),
        accentBase: Color(joyHex: 0xDAB362),
        accentHover: Color(joyHex: 0xE9CD94),
        accentSubtle: Color(joyHex: 0x1E2129),
        statusSuccessFg: Color(joyHex: 0x93C794),
        statusWarningFg: Color(joyHex: 0xDFAE68),
        statusDangerFg: Color(joyHex: 0xFB9890),
        statusInfoFg: Color(joyHex: 0x8FBCEB),
        isDark: true
    )
}

/// Canonical JoyDesign namespace shared across macOS & iOS SwiftUI tools.
public enum JoyDesign {
    public enum Palette {
        public static let navy950 = JoyColorRamps.navy950
        public static let navy900 = Color(joyHex: 0x0F1320)
        public static let navy800 = Color(joyHex: 0x1A2036)
        public static let navy700 = Color(joyHex: 0x232A45)
        public static let navy600 = Color(joyHex: 0x2E3757)
        public static let navy500 = Color(joyHex: 0x3A4468)

        public static let gold400 = Color(joyHex: 0xFFE24D)
        public static let gold500 = Color(joyHex: 0xFFD700)
        public static let gold600 = Color(joyHex: 0xE6C200)

        public static let bronze400 = Color(joyHex: 0xDDA05A)
        public static let bronze500 = Color(joyHex: 0xCD7F32)
        public static let bronze600 = Color(joyHex: 0xA9662A)

        public static let sand50  = Color(joyHex: 0xF5EFE0)
        public static let sand200 = Color(joyHex: 0xD8CFBB)
        public static let sand400 = Color(joyHex: 0xA89F8B)
        public static let sand600 = Color(joyHex: 0x6B6355)

        public static let success = Color(joyHex: 0x4ADE80)
        public static let danger  = Color(joyHex: 0xF87171)
        public static let warn    = Color(joyHex: 0xFBBF24)
        public static let info    = Color(joyHex: 0x60A5FA)
    }

    public enum Colors {
        public static let background     = Palette.navy800
        public static let surface        = Palette.navy700
        public static let surfaceVariant = Palette.navy600
        public static let well           = Palette.navy900
        public static let scrim          = Palette.navy900.opacity(0.72)

        public static let primary        = Palette.gold500
        public static let primaryHover   = Palette.gold400
        public static let primaryPressed = Palette.gold600
        public static let onPrimary      = Palette.navy900

        public static let secondary      = Palette.bronze500
        public static let secondaryHover = Palette.bronze400

        public static let textPrimary    = Palette.sand50
        public static let textSecondary  = Palette.sand400
        public static let textMuted      = Palette.sand600
        public static let textDisabled   = Palette.sand400.opacity(0.45)

        public static let border         = Palette.navy500
        public static let borderStrong   = Palette.bronze500
        public static let focusRing      = Palette.gold500

        public static let success        = Palette.success
        public static let danger         = Palette.danger
        public static let warn           = Palette.warn
        public static let info           = Palette.info
    }

    public enum Space {
        public static let s1: CGFloat = 4
        public static let s2: CGFloat = 8
        public static let s3: CGFloat = 12
        public static let s4: CGFloat = 16
        public static let s5: CGFloat = 24
        public static let s6: CGFloat = 32
    }

    public enum Radius {
        public static let r1: CGFloat = 6
        public static let r2: CGFloat = 10
        public static let r3: CGFloat = 16
    }

    public enum Typography {
        public static let display  = Font.system(size: 32, weight: .heavy, design: .rounded)
        public static let h1       = Font.system(size: 22, weight: .bold, design: .rounded)
        public static let h2       = Font.system(size: 16, weight: .bold, design: .rounded)
        public static let body     = Font.system(size: 14, weight: .regular, design: .default)
        public static let caption  = Font.system(size: 12, weight: .medium, design: .default)
        public static let value    = Font.system(size: 15, weight: .semibold, design: .monospaced)
        public static let mono     = Font.system(size: 12, weight: .regular, design: .monospaced)
        public static let monoBold = Font.system(size: 12, weight: .bold, design: .monospaced)
    }
}
