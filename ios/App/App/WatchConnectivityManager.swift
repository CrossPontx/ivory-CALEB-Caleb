//
//  WatchConnectivityManager.swift
//  Ivory's Choice
//
//  Native Apple Watch connectivity (no Capacitor dependency)
//

import Foundation
import WatchConnectivity
import os.log

class WatchConnectivityManager: NSObject, ObservableObject {
    static let shared = WatchConnectivityManager()
    
    private var session: WCSession?
    private weak var webViewModel: WebViewModel?
    private let logger = OSLog(subsystem: "com.ivory.app", category: "Watch")
    
    override init() {
        super.init()
        
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
            os_log("✅ Watch session activated", log: logger, type: .info)
        } else {
            os_log("⚠️ Watch not supported on this device", log: logger, type: .info)
        }
    }
    
    func setWebViewModel(_ viewModel: WebViewModel?) {
        self.webViewModel = viewModel
    }
    
    func sendToWatch(data: [String: Any], viewModel: WebViewModel?) {
        guard let session = session, session.isReachable else {
            os_log("❌ Watch not reachable", log: logger, type: .error)
            return
        }
        
        guard let watchData = data["data"] as? [String: Any] else {
            os_log("❌ No data provided", log: logger, type: .error)
            return
        }
        
        os_log("🔵 Sending to watch: %@", log: logger, type: .info, String(describing: watchData))
        
        session.sendMessage(watchData, replyHandler: { reply in
            os_log("✅ Watch replied: %@", log: self.logger, type: .info, String(describing: reply))
        }, errorHandler: { error in
            os_log("❌ Watch send failed: %@", log: self.logger, type: .error, error.localizedDescription)
        })
    }
    
    func isWatchReachable(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided", log: logger, type: .error)
            return
        }
        
        let reachable = session?.isReachable ?? false
        os_log("🔵 Watch reachable: %@", log: logger, type: .info, reachable ? "YES" : "NO")
        
        viewModel?.resolveCallback(callbackId: callbackId, result: ["reachable": reachable])
    }
}

// MARK: - WCSessionDelegate

extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            os_log("❌ Watch activation failed: %@", log: logger, type: .error, error.localizedDescription)
        } else {
            os_log("✅ Watch activation completed: %@", log: logger, type: .info, String(describing: activationState))
        }
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        os_log("⚠️ Watch session inactive", log: logger, type: .info)
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        os_log("⚠️ Watch session deactivated", log: logger, type: .info)
        session.activate()
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        os_log("📨 Received from watch: %@", log: logger, type: .info, String(describing: message))
        
        // Notify web app
        webViewModel?.notifyWeb(event: "watchMessage", data: message)
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        os_log("📨 Received from watch (with reply): %@", log: logger, type: .info, String(describing: message))
        
        // Notify web app
        webViewModel?.notifyWeb(event: "watchMessage", data: message)
        
        // Send reply
        replyHandler(["status": "received"])
    }
}
