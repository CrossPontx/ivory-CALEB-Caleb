import Foundation
import UserNotifications
import UIKit
import os.log

/// Manages push notifications and local notifications for the app
class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()
    
    private let logger = OSLog(subsystem: "com.ivory.app", category: "NotificationManager")
    
    @Published var isAuthorized = false
    @Published var deviceToken: String?
    @Published var pendingNotifications: [UNNotification] = []
    
    private override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
        checkAuthorizationStatus()
    }
    
    // MARK: - Authorization
    
    func requestNotificationPermission(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for notification permission", log: logger, type: .error)
            return
        }
        
        requestAuthorization { granted in
            viewModel?.resolveCallback(callbackId: callbackId, result: ["granted": granted])
        }
    }
    
    func getNotificationPermissionStatus(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for notification permission status", log: logger, type: .error)
            return
        }
        
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let authorized = settings.authorizationStatus == .authorized
            DispatchQueue.main.async {
                viewModel?.resolveCallback(callbackId: callbackId, result: ["authorized": authorized])
            }
        }
    }
    
    func scheduleLocalNotification(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"],
              let options = data["options"] as? [String: Any],
              let title = options["title"] as? String,
              let body = options["body"] as? String else {
            os_log("❌ Invalid data for schedule notification", log: logger, type: .error)
            return
        }
        
        let identifier = options["identifier"] as? String ?? "notif-\(Date().timeIntervalSince1970)"
        let delay = options["delay"] as? TimeInterval ?? 0
        let userInfo = options["userInfo"] as? [String: Any] ?? [:]
        
        scheduleLocalNotification(
            title: title,
            body: body,
            identifier: identifier,
            delay: delay,
            userInfo: userInfo
        )
        
        viewModel?.resolveCallback(callbackId: callbackId, result: [
            "success": true,
            "identifier": identifier
        ])
    }
    
    func cancelNotification(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"],
              let identifier = data["identifier"] as? String else {
            os_log("❌ Invalid data for cancel notification", log: logger, type: .error)
            return
        }
        
        cancelNotification(identifier: identifier)
        viewModel?.resolveCallback(callbackId: callbackId, result: ["success": true])
    }
    
    func setBadgeCount(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"],
              let count = data["count"] as? Int else {
            os_log("❌ Invalid data for set badge count", log: logger, type: .error)
            return
        }
        
        setBadgeCount(count)
        viewModel?.resolveCallback(callbackId: callbackId, result: ["success": true])
    }
    
    func clearBadge(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for clear badge", log: logger, type: .error)
            return
        }
        
        clearBadge()
        viewModel?.resolveCallback(callbackId: callbackId, result: ["success": true])
    }
    
    func getDeviceToken(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for get device token", log: logger, type: .error)
            return
        }
        
        let token = deviceToken ?? ""
        viewModel?.resolveCallback(callbackId: callbackId, result: ["token": token])
    }
    
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        os_log("📱 Requesting notification authorization", log: logger, type: .info)
        
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { [weak self] granted, error in
            DispatchQueue.main.async {
                self?.isAuthorized = granted
                
                if granted {
                    os_log("✅ Notification authorization granted", log: self?.logger ?? .default, type: .info)
                    self?.registerForRemoteNotifications()
                } else {
                    os_log("❌ Notification authorization denied: %@", log: self?.logger ?? .default, type: .error, error?.localizedDescription ?? "Unknown")
                }
                
                completion(granted)
            }
        }
    }
    
    func checkAuthorizationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { [weak self] settings in
            DispatchQueue.main.async {
                self?.isAuthorized = settings.authorizationStatus == .authorized
                
                if settings.authorizationStatus == .authorized {
                    self?.registerForRemoteNotifications()
                }
            }
        }
    }
    
    private func registerForRemoteNotifications() {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
    
    // MARK: - Device Token
    
    func setDeviceToken(_ token: Data) {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        deviceToken = tokenString
        os_log("📱 Device token: %@", log: logger, type: .info, tokenString)
        
        // Send token to server
        sendTokenToServer(tokenString)
    }
    
    func handleRegistrationError(_ error: Error) {
        os_log("❌ Failed to register for remote notifications: %@", log: logger, type: .error, error.localizedDescription)
    }
    
    private func sendTokenToServer(_ token: String) {
        // Send device token to your backend for push notifications
        guard let userId = UserDefaults.standard.value(forKey: "userId") as? Int else {
            os_log("⚠️ No user ID found, skipping token registration", log: logger, type: .info)
            return
        }
        
        // TODO: Implement API call to register device token
        os_log("📤 Would send token to server for user %d", log: logger, type: .info, userId)
    }
    
    // MARK: - Local Notifications
    
    func scheduleLocalNotification(
        title: String,
        body: String,
        identifier: String,
        delay: TimeInterval = 0,
        userInfo: [String: Any] = [:]
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.userInfo = userInfo
        
        let trigger: UNNotificationTrigger?
        if delay > 0 {
            trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        } else {
            trigger = nil
        }
        
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { [weak self] error in
            if let error = error {
                os_log("❌ Failed to schedule notification: %@", log: self?.logger ?? .default, type: .error, error.localizedDescription)
            } else {
                os_log("✅ Notification scheduled: %@", log: self?.logger ?? .default, type: .info, identifier)
            }
        }
    }
    
    func cancelNotification(identifier: String) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: [identifier])
    }
    
    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }
    
    // MARK: - Badge Management
    
    func setBadgeCount(_ count: Int) {
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber = count
        }
    }
    
    func clearBadge() {
        setBadgeCount(0)
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationManager: UNUserNotificationCenterDelegate {
    
    // Called when notification is received while app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        os_log("📬 Notification received in foreground: %@", log: logger, type: .info, notification.request.identifier)
        
        // Store notification
        DispatchQueue.main.async {
            self.pendingNotifications.append(notification)
        }
        
        // Notify WebView
        notifyWebView(notification: notification)
        
        // Show banner, badge, and play sound even in foreground
        completionHandler([.banner, .badge, .sound])
    }
    
    // Called when user taps on notification
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        os_log("📬 Notification tapped: %@", log: logger, type: .info, response.notification.request.identifier)
        
        let userInfo = response.notification.request.content.userInfo
        
        // Handle notification tap - navigate to appropriate screen
        handleNotificationTap(userInfo: userInfo)
        
        completionHandler()
    }
    
    private func notifyWebView(notification: UNNotification) {
        let content = notification.request.content
        let data: [String: Any] = [
            "title": content.title,
            "body": content.body,
            "userInfo": content.userInfo
        ]
        
        // Post notification for WebView to handle
        NotificationCenter.default.post(
            name: NSNotification.Name("InAppNotificationReceived"),
            object: nil,
            userInfo: data
        )
    }
    
    private func handleNotificationTap(userInfo: [AnyHashable: Any]) {
        // Extract notification type and related ID
        guard let type = userInfo["type"] as? String else { return }
        
        var path = "/"
        
        switch type {
        case "booking_confirmed", "booking_cancelled", "booking_paid":
            if let bookingId = userInfo["bookingId"] as? Int {
                path = "/booking/\(bookingId)"
            } else {
                path = "/bookings"
            }
            
        case "design_request":
            if let requestId = userInfo["requestId"] as? Int {
                path = "/tech/request/\(requestId)"
            }
            
        case "design_breakdown_ready":
            if let bookingId = userInfo["bookingId"] as? Int {
                path = "/booking/\(bookingId)"
            }
            
        case "new_review":
            path = "/tech/dashboard"
            
        case "credits_low":
            path = "/settings/credits"
            
        default:
            path = "/notifications"
        }
        
        // Navigate WebView to the path
        NotificationCenter.default.post(
            name: NSNotification.Name("NavigateToPath"),
            object: nil,
            userInfo: ["path": path]
        )
    }
}
