//
//  ShareManager.swift
//  Ivory's Choice
//
//  Native share functionality
//

import Foundation
import UIKit
import os.log

class ShareManager: NSObject {
    static let shared = ShareManager()
    
    private let logger = OSLog(subsystem: "com.ivory.app", category: "Share")
    
    func share(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"],
              let options = data["options"] as? [String: Any] else {
            os_log("❌ Invalid share data", log: logger, type: .error)
            return
        }
        
        var itemsToShare: [Any] = []
        
        if let text = options["text"] as? String {
            itemsToShare.append(text)
        }
        
        if let url = options["url"] as? String, let shareURL = URL(string: url) {
            itemsToShare.append(shareURL)
        }
        
        if let title = options["title"] as? String {
            itemsToShare.insert(title, at: 0)
        }
        
        guard !itemsToShare.isEmpty else {
            os_log("❌ No items to share", log: logger, type: .error)
            viewModel?.resolveCallback(callbackId: callbackId, error: "No items to share")
            return
        }
        
        os_log("🔵 Sharing %d items", log: logger, type: .info, itemsToShare.count)
        
        DispatchQueue.main.async {
            let activityVC = UIActivityViewController(activityItems: itemsToShare, applicationActivities: nil)
            
            // Store callback
            objc_setAssociatedObject(activityVC, "callbackId", callbackId, .OBJC_ASSOCIATION_RETAIN)
            objc_setAssociatedObject(activityVC, "viewModel", viewModel, .OBJC_ASSOCIATION_RETAIN)
            
            activityVC.completionWithItemsHandler = { activityType, completed, returnedItems, error in
                if let error = error {
                    os_log("❌ Share failed: %@", log: self.logger, type: .error, error.localizedDescription)
                    viewModel?.resolveCallback(callbackId: callbackId, error: error.localizedDescription)
                } else if completed {
                    os_log("✅ Share completed", log: self.logger, type: .info)
                    viewModel?.resolveCallback(callbackId: callbackId, result: ["completed": true])
                } else {
                    os_log("⚠️ Share cancelled", log: self.logger, type: .info)
                    viewModel?.resolveCallback(callbackId: callbackId, result: ["completed": false])
                }
            }
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootViewController = windowScene.windows.first?.rootViewController {
                
                // For iPad
                if let popover = activityVC.popoverPresentationController {
                    popover.sourceView = rootViewController.view
                    popover.sourceRect = CGRect(x: rootViewController.view.bounds.midX,
                                               y: rootViewController.view.bounds.midY,
                                               width: 0, height: 0)
                    popover.permittedArrowDirections = []
                }
                
                rootViewController.present(activityVC, animated: true)
            }
        }
    }
}