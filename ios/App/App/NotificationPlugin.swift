import Foundation
import WebKit
import os.log

/// Plugin to bridge notification functionality between WebView and native iOS
class NotificationPlugin {
    static let shared = NotificationPlugin()
    
    private let logger = OSLog(subsystem: "com.ivory.app", category: "NotificationPlugin")
    private weak var webView: WKWebView?
    
    private init() {
        setupObservers()
    }
    
    func setWebView(_ webView: WKWebView) {
        self.webView = webView
    }
    
    private func setupObservers() {
        // Listen for in-app notifications to forward to WebView
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleInAppNotification(_:)),
            name: NSNotification.Name("InAppNotificationReceived"),
            object: nil
        )
        
        // Listen for navigation requests
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleNavigationRequest(_:)),
            name: NSNotification.Name("NavigateToPath"),
            object: nil
        )
    }
    
    @objc private func handleInAppNotification(_ notification: Notification) {
        guard let userInfo = notification.userInfo else { return }
        
        let title = userInfo["title"] as? String ?? ""
        let body = userInfo["body"] as? String ?? ""
        let data = userInfo["userInfo"] as? [String: Any] ?? [:]
        
        // Convert to JSON and send to WebView
        let payload: [String: Any] = [
            "title": title,
            "body": body,
            "data": data
        ]
        
        sendEventToWebView(event: "notificationReceived", data: payload)
    }
    
    @objc private func handleNavigationRequest(_ notification: Notification) {
        guard let path = notification.userInfo?["path"] as? String else { return }
        
        sendEventToWebView(event: "navigateTo", data: ["path": path])
    }
    
    // MARK: - WebView Communication
    
    func sendEventToWebView(event: String, data: [String: Any]) {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: data),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }
        
        let script = """
        if (window.NativeBridge && window.NativeBridge.onEvent) {
            window.NativeBridge.onEvent('\(event)', \(jsonString));
        }
        """
        
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(script) { _, error in
                if let error = error {
                    os_log("❌ Failed to send event to WebView: %@", log: self?.logger ?? .default, type: .error, error.localizedDescription)
                }
            }
        }
    }
    
    // MARK: - Handle Messages from WebView
    
    func handleMessage(_ message: [String: Any]) -> Any? {
        guard let action = message["action"] as? String else {
            return ["error": "Missing action"]
        }
        
        switch action {
        case "requestPermission":
            return requestPermission()
            
        case "getPermissionStatus":
            return getPermissionStatus()
            
        case "scheduleLocal":
            return scheduleLocalNotification(message)
            
        case "cancelNotification":
            return cancelNotification(message)
            
        case "setBadge":
            return setBadge(message)
            
        case "clearBadge":
            NotificationManager.shared.clearBadge()
            return ["success": true]
            
        case "getDeviceToken":
            return ["token": NotificationManager.shared.deviceToken ?? ""]
            
        default:
            return ["error": "Unknown action: \(action)"]
        }
    }
    
    private func requestPermission() -> [String: Any] {
        var result: [String: Any] = [:]
        let semaphore = DispatchSemaphore(value: 0)
        
        NotificationManager.shared.requestAuthorization { granted in
            result = ["granted": granted]
            semaphore.signal()
        }
        
        // Wait with timeout
        _ = semaphore.wait(timeout: .now() + 10)
        return result
    }
    
    private func getPermissionStatus() -> [String: Any] {
        return ["authorized": NotificationManager.shared.isAuthorized]
    }
    
    private func scheduleLocalNotification(_ message: [String: Any]) -> [String: Any] {
        guard let title = message["title"] as? String,
              let body = message["body"] as? String else {
            return ["error": "Missing title or body"]
        }
        
        let identifier = message["identifier"] as? String ?? UUID().uuidString
        let delay = message["delay"] as? TimeInterval ?? 0
        let userInfo = message["userInfo"] as? [String: Any] ?? [:]
        
        NotificationManager.shared.scheduleLocalNotification(
            title: title,
            body: body,
            identifier: identifier,
            delay: delay,
            userInfo: userInfo
        )
        
        return ["success": true, "identifier": identifier]
    }
    
    private func cancelNotification(_ message: [String: Any]) -> [String: Any] {
        guard let identifier = message["identifier"] as? String else {
            return ["error": "Missing identifier"]
        }
        
        NotificationManager.shared.cancelNotification(identifier: identifier)
        return ["success": true]
    }
    
    private func setBadge(_ message: [String: Any]) -> [String: Any] {
        guard let count = message["count"] as? Int else {
            return ["error": "Missing count"]
        }
        
        NotificationManager.shared.setBadgeCount(count)
        return ["success": true]
    }
}
