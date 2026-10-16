// JoyComponents.swift — Shared SwiftUI Component Primitives for Joymify Design System
//
// Consumes generated tokens from `JoyTokens.g.swift`.
// Zero hardcoded hex literals; verified by `scripts/lint-colors.sh`.

import SwiftUI

public extension JoyDesign {
    enum BadgeTone: Sendable {
        case gold
        case bronze
        case success
        case danger
        case warn
        case info
        case neutral

        public var foreground: Color {
            switch self {
            case .gold:    return Palette.gold500
            case .bronze:  return Palette.bronze400
            case .success: return Palette.success
            case .danger:  return Palette.danger
            case .warn:    return Palette.warn
            case .info:    return Palette.info
            case .neutral: return Palette.sand200
            }
        }

        public var background: Color {
            foreground.opacity(0.16)
        }

        public var border: Color {
            foreground.opacity(0.42)
        }
    }
}

public struct JoyBadge: View {
    public let text: String
    public var tone: JoyDesign.BadgeTone = .gold

    public init(_ text: String, tone: JoyDesign.BadgeTone = .gold) {
        self.text = text
        self.tone = tone
    }

    public var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .bold, design: .monospaced))
            .foregroundColor(tone.foreground)
            .padding(.horizontal, JoyDesign.Space.s2)
            .padding(.vertical, 3)
            .background(tone.background)
            .overlay(
                Capsule().stroke(tone.border, lineWidth: 1)
            )
            .clipShape(Capsule())
    }
}

public struct JoyCard<Content: View>: View {
    public let title: String?
    public let badgeText: String?
    public let badgeTone: JoyDesign.BadgeTone
    public let strongBorder: Bool
    @ViewBuilder public let content: () -> Content

    public init(
        title: String? = nil,
        badge: String? = nil,
        badgeTone: JoyDesign.BadgeTone = .bronze,
        strongBorder: Bool = false,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.badgeText = badge
        self.badgeTone = badgeTone
        self.strongBorder = strongBorder
        self.content = content
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JoyDesign.Space.s2) {
            if title != nil || badgeText != nil {
                HStack(spacing: JoyDesign.Space.s2) {
                    if let title = title {
                        Text(title)
                            .font(JoyDesign.Typography.h2)
                            .foregroundColor(JoyDesign.Colors.textPrimary)
                    }
                    Spacer()
                    if let badgeText = badgeText {
                        JoyBadge(badgeText, tone: badgeTone)
                    }
                }
                Rectangle()
                    .fill(JoyDesign.Colors.border.opacity(0.6))
                    .frame(height: 1)
            }
            content()
        }
        .padding(JoyDesign.Space.s4)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(JoyDesign.Colors.surface)
        .cornerRadius(JoyDesign.Radius.r2)
        .overlay(
            RoundedRectangle(cornerRadius: JoyDesign.Radius.r2)
                .stroke(
                    strongBorder ? JoyDesign.Colors.borderStrong : JoyDesign.Colors.border,
                    lineWidth: strongBorder ? 1.5 : 1.0
                )
        )
    }
}

public struct JoyWell<Content: View>: View {
    @ViewBuilder public let content: () -> Content

    public init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    public var body: some View {
        content()
            .padding(JoyDesign.Space.s3)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(JoyDesign.Colors.well)
            .cornerRadius(JoyDesign.Radius.r1)
            .overlay(
                RoundedRectangle(cornerRadius: JoyDesign.Radius.r1)
                    .stroke(JoyDesign.Colors.border.opacity(0.8), lineWidth: 1)
            )
    }
}

public struct JoyKpiTile: View {
    public let label: String
    public let value: String
    public let subtitle: String
    public var accentTone: JoyDesign.BadgeTone = .gold

    public init(
        label: String,
        value: String,
        subtitle: String,
        accentTone: JoyDesign.BadgeTone = .gold
    ) {
        self.label = label
        self.value = value
        self.subtitle = subtitle
        self.accentTone = accentTone
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JoyDesign.Space.s1) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(JoyDesign.Colors.textSecondary)
            Text(value)
                .font(.system(size: 26, weight: .heavy, design: .rounded))
                .foregroundColor(JoyDesign.Colors.primary)
            Text(subtitle)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundColor(accentTone.foreground)
        }
        .padding(JoyDesign.Space.s3)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(JoyDesign.Colors.surface)
        .cornerRadius(JoyDesign.Radius.r2)
        .overlay(
            RoundedRectangle(cornerRadius: JoyDesign.Radius.r2)
                .stroke(JoyDesign.Colors.borderStrong.opacity(0.55), lineWidth: 1)
        )
    }
}

public struct JoyPrimaryButtonStyle: ButtonStyle {
    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12, weight: .bold, design: .rounded))
            .foregroundColor(JoyDesign.Colors.onPrimary)
            .padding(.horizontal, JoyDesign.Space.s3)
            .padding(.vertical, 6)
            .background(
                configuration.isPressed
                    ? JoyDesign.Colors.primaryPressed
                    : JoyDesign.Colors.primary
            )
            .cornerRadius(JoyDesign.Radius.r1)
            .overlay(
                RoundedRectangle(cornerRadius: JoyDesign.Radius.r1)
                    .stroke(JoyDesign.Palette.gold400, lineWidth: 1)
            )
    }
}

public struct JoyGhostButtonStyle: ButtonStyle {
    public var isActive: Bool = false

    public init(isActive: Bool = false) {
        self.isActive = isActive
    }

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundColor(isActive ? JoyDesign.Colors.primary : JoyDesign.Colors.textPrimary)
            .padding(.horizontal, JoyDesign.Space.s3)
            .padding(.vertical, 6)
            .background(
                configuration.isPressed || isActive
                    ? JoyDesign.Colors.surfaceVariant
                    : JoyDesign.Colors.surface
            )
            .cornerRadius(JoyDesign.Radius.r1)
            .overlay(
                RoundedRectangle(cornerRadius: JoyDesign.Radius.r1)
                    .stroke(
                        isActive ? JoyDesign.Colors.primary : JoyDesign.Colors.border,
                        lineWidth: 1
                    )
            )
    }
}
