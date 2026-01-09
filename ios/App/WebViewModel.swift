//
//  WebViewModel.swift
//  Ivory's Choice
//
//  Manages WebView state and JavaScript bridge communication
//

import Foundation
import WebKit
import Combine
import UserNotifications

class WebViewModel: ObservableObject {
    @Published var isLoading = false
    weak var webView: WKWebView?
    
    private var messageHandlers: [String: (([String: Any]) -> Void)] = [:]
    
    init() {
        setupMessageHandlers()
    }
    
    // MARK: - Web App Loading
    
    func loadWebApp() {
        // Always load from production URL
        if let url = URL(string: "https://www.ivoryschoice.com") {
            let request = URLRequest(url: url)
            webView?.load(request)
        }
    }
    
    // MARK: - JavaScript Bridge
    
    func injectBridge() {
        let bridgeScript = """
        window.NativeBridge = {
            _callbackCounter: 0,
            
            _generateCallbackId: function() {
                return 'cb_' + Date.now() + '_' + (++this._callbackCounter);
            },
            
            call: function(action, data) {
                window.webkit.messageHandlers.nativeHandler.postMessage({
                    action: action,
                    ...data
                });
            },
            
            // IAP Methods
            getProducts: function(productIds) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    console.log('🔵 JS: getProducts callbackId:', callbackId);
                    
                    this.call('getProducts', { productIds, callbackId });
                });
            },
            
            purchase: function(productId) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    console.log('🔵 JS: purchase callbackId:', callbackId);
                    
                    this.call('purchase', { productId, callbackId });
                });
            },
            
            restorePurchases: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    console.log('🔵 JS: restorePurchases callbackId:', callbackId);
                    
                    this.call('restorePurchases', { callbackId });
                });
            },
            
            finishTransaction: function(transactionId) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    console.log('🔵 JS: finishTransaction callbackId:', callbackId);
                    
                    this.call('finishTransaction', { transactionId, callbackId });
                });
            },
            
            // Watch Methods
            sendToWatch: function(data) {
                this.call('sendToWatch', { data });
            },
            
            isWatchReachable: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('isWatchReachable', { callbackId });
                });
            },
            
            // Camera Methods
            takePicture: function(options) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('takePicture', { options, callbackId });
                });
            },
            
            // Share Methods
            share: function(options) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('share', { options, callbackId });
                });
            },
            
            // Haptics
            hapticImpact: function(style) {
                this.call('hapticImpact', { style });
            },
            
            // Device Info
            getDeviceInfo: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getDeviceInfo', { callbackId });
                });
            },
            
            // Permission Methods
            requestCameraPermission: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('requestCameraPermission', { callbackId });
                });
            },
            
            getCameraPermissionStatus: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getCameraPermissionStatus', { callbackId });
                });
            },
            
            requestPhotosPermission: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('requestPhotosPermission', { callbackId });
                });
            },
            
            getPhotosPermissionStatus: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getPhotosPermissionStatus', { callbackId });
                });
            },
            
            // Notification Methods
            requestNotificationPermission: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('requestNotificationPermission', { callbackId });
                });
            },
            
            getNotificationPermissionStatus: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getNotificationPermissionStatus', { callbackId });
                });
            },
            
            scheduleLocalNotification: function(options) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('scheduleLocalNotification', { options, callbackId });
                });
            },
            
            cancelNotification: function(identifier) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('cancelNotification', { identifier, callbackId });
                });
            },
            
            setBadgeCount: function(count) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('setBadgeCount', { count, callbackId });
                });
            },
            
            clearBadge: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('clearBadge', { callbackId });
                });
            },
            
            getDeviceToken: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = this._generateCallbackId();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getDeviceToken', { callbackId });
                });
            }
        };
        
        // Helper to resolve callbacks from native
        window.resolveNativeCallback = function(callbackId, result, error) {
            console.log('🔵 JS: resolveNativeCallback called with:', callbackId);
            console.log('🔵 JS: Available callbacks:', Object.keys(window._nativeCallbacks || {}));
            
            if (window._nativeCallbacks && window._nativeCallbacks[callbackId]) {
                console.log('✅ JS: Found callback, resolving...');
                if (error) {
                    window._nativeCallbacks[callbackId].reject(error);
                } else {
                    window._nativeCallbacks[callbackId].resolve(result);
                }
                delete window._nativeCallbacks[callbackId];
            } else {
                console.log('❌ JS: Callback not found for id:', callbackId);
            }
        };
        
        console.log('✅ Native bridge injected');
        """
        
        webView?.evaluateJavaScript(bridgeScript) { result, error in
            if let error = error {
                print("❌ Failed to inject bridge: \(error)")
            } else {
                print("✅ Bridge injected successfully")
            }
        }
    }
    
    // MARK: - Message Handling
    
    private func setupMessageHandlers() {
        // IAP handlers
        messageHandlers["getProducts"] = { [weak self] data in
            IAPManager.shared.getProducts(data: data, viewModel: self)
        }
        
        messageHandlers["purchase"] = { [weak self] data in
            IAPManager.shared.purchase(data: data, viewModel: self)
        }
        
        messageHandlers["restorePurchases"] = { [weak self] data in
            IAPManager.shared.restorePurchases(data: data, viewModel: self)
        }
        
        messageHandlers["finishTransaction"] = { [weak self] data in
            IAPManager.shared.finishTransaction(data: data, viewModel: self)
        }
        
        // Watch handlers
        messageHandlers["sendToWatch"] = { [weak self] data in
            WatchConnectivityManager.shared.sendToWatch(data: data, viewModel: self)
        }
        
        messageHandlers["isWatchReachable"] = { [weak self] data in
            WatchConnectivityManager.shared.isWatchReachable(data: data, viewModel: self)
        }
        
        // Camera handlers
        messageHandlers["takePicture"] = { [weak self] data in
            CameraManager.shared.takePicture(data: data, viewModel: self)
        }
        
        messageHandlers["requestCameraPermission"] = { [weak self] data in
            CameraManager.shared.requestCameraPermission(data: data, viewModel: self)
        }
        
        messageHandlers["getCameraPermissionStatus"] = { [weak self] data in
            CameraManager.shared.getCameraPermissionStatus(data: data, viewModel: self)
        }
        
        messageHandlers["requestPhotosPermission"] = { [weak self] data in
            CameraManager.shared.requestPhotosPermission(data: data, viewModel: self)
        }
        
        messageHandlers["getPhotosPermissionStatus"] = { [weak self] data in
            CameraManager.shared.getPhotosPermissionStatus(data: data, viewModel: self)
        }
        
        // Share handlers
        messageHandlers["share"] = { [weak self] data in
            ShareManager.shared.share(data: data, viewModel: self)
        }
        
        // Haptics handlers
        messageHandlers["hapticImpact"] = { [weak self] data in
            HapticsManager.shared.impact(data: data)
        }
        
        // Device info handlers
        messageHandlers["getDeviceInfo"] = { [weak self] data in
            DeviceInfoManager.shared.getInfo(data: data, viewModel: self)
        }
        
        // Notification handlers
        messageHandlers["requestNotificationPermission"] = { [weak self] data in
            NotificationManager.shared.requestNotificationPermission(data: data, viewModel: self)
        }
        
        messageHandlers["getNotificationPermissionStatus"] = { [weak self] data in
            NotificationManager.shared.getNotificationPermissionStatus(data: data, viewModel: self)
        }
        
        messageHandlers["scheduleLocalNotification"] = { [weak self] data in
            NotificationManager.shared.scheduleLocalNotification(data: data, viewModel: self)
        }
        
        messageHandlers["cancelNotification"] = { [weak self] data in
            NotificationManager.shared.cancelNotification(data: data, viewModel: self)
        }
        
        messageHandlers["setBadgeCount"] = { [weak self] data in
            NotificationManager.shared.setBadgeCount(data: data, viewModel: self)
        }
        
        messageHandlers["clearBadge"] = { [weak self] data in
            NotificationManager.shared.clearBadge(data: data, viewModel: self)
        }
        
        messageHandlers["getDeviceToken"] = { [weak self] data in
            NotificationManager.shared.getDeviceToken(data: data, viewModel: self)
        }
    }
    
    func handleMessage(action: String, data: [String: Any]) {
        if let handler = messageHandlers[action] {
            handler(data)
        } else {
            print("⚠️ No handler for action: \(action)")
        }
    }
    
    // MARK: - JavaScript Execution
    
    func callJavaScript(_ script: String, completion: ((Any?, Error?) -> Void)? = nil) {
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(script, completionHandler: completion)
        }
    }
    
    func resolveCallback(callbackId: Any, result: [String: Any]? = nil, error: String? = nil) {
        let resultJSON = result != nil ? try? JSONSerialization.data(withJSONObject: result!, options: []) : nil
        let resultString = resultJSON != nil ? String(data: resultJSON!, encoding: .utf8) ?? "null" : "null"
        let errorString = error != nil ? "'\(error!)'" : "null"
        
        // Handle callback ID - now using string-based IDs like "cb_1234567890_1"
        let callbackIdForJS: String
        if let stringId = callbackId as? String {
            callbackIdForJS = "'\(stringId)'"
        } else if let doubleId = callbackId as? Double {
            // Legacy support for numeric IDs
            callbackIdForJS = String(format: "%.10f", doubleId)
        } else if let numId = callbackId as? NSNumber {
            callbackIdForJS = String(format: "%.10f", numId.doubleValue)
        } else {
            callbackIdForJS = "'\(callbackId)'"
        }
        
        let script = "window.resolveNativeCallback(\(callbackIdForJS), \(resultString), \(errorString));"
        print("🔵 Resolving callback: \(callbackIdForJS)")
        print("🔵 Script: \(script.prefix(200))...")
        
        callJavaScript(script) { result, error in
            if let error = error {
                print("❌ JavaScript execution error: \(error)")
            } else {
                print("✅ JavaScript executed successfully")
            }
        }
    }
    
    func notifyWeb(event: String, data: [String: Any]) {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: data, options: []),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }
        
        let script = """
        if (window.NativeBridge && window.NativeBridge.onEvent) {
            window.NativeBridge.onEvent('\(event)', \(jsonString));
        }
        """
        callJavaScript(script)
    }
}
