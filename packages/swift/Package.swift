// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "JoyDesign",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "JoyDesign",
            targets: ["JoyDesign"]
        )
    ],
    targets: [
        .target(
            name: "JoyDesign",
            path: "Sources/JoyDesign"
        ),
        .testTarget(
            name: "JoyDesignTests",
            dependencies: ["JoyDesign"],
            path: "Tests/JoyDesignTests"
        )
    ]
)
