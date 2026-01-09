//
//  IvoryApp.swift
//  Ivory's Choice
//
//  Main SwiftUI App Entry Point
//

import SwiftUI

@main
struct IvoryApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.light)
        }
    }
}
