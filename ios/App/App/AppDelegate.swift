import UIKit
import os.log

class AppDelegate: NSObject, UIApplicationDelegate {
    private let logger = OSLog(subsystem: "com.ivory.app", category: "AppDelegate")

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        os_log("🟢 AppDelegate: Application did finish launching (Native SwiftUI)", log: logger, type: .info)
        
        // Initialize managers
        _ = IAPManager.shared
        _ = WatchConnectivityManager.shared
        
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // App moving to inactive state
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // App entered background
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // App entering foreground
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // App became active
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // App terminating
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Handle URL schemes (OAuth, Universal Links, etc.)
        os_log("🔵 Opening URL: %@", log: logger, type: .info, url.absoluteString)
        
        // Handle Apple Sign In callback
        if url.scheme == "com.ivory.app" {
            // Process auth callback
            return true
        }
        
        return false
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Handle Universal Links
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            os_log("🔵 Universal Link: %@", log: logger, type: .info, url.absoluteString)
            // Handle universal link
            return true
        }
        
        return false
    }
}
