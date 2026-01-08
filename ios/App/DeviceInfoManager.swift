//
//  DeviceInfoManager.swift
//  Ivory's Choice
//
//  Native device information
//

import Foundation
import UIKit

class DeviceInfoManager {
    static let shared = DeviceInfoManager()
    
    func getInfo(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            return
        }
        
        let device = UIDevice.current
        let screen = UIScreen.main
        
        let info: [String: Any] = [
            "platform": "ios",
            "model": device.model,
            "osVersion": device.systemVersion,
            "manufacturer": "Apple",
            "isVirtual": isSimulator(),
            "screenWidth": Int(screen.bounds.width * screen.scale),
            "screenHeight": Int(screen.bounds.height * screen.scale),
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0",
            "appBuild": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        ]
        
        viewModel?.resolveCallback(callbackId: callbackId, result: info)
    }
    
    private func isSimulator() -> Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }
}
