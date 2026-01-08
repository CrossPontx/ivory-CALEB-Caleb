//
//  WebViewModel.swift
//  Ivory's Choice
//
//  Manages WebView state and JavaScript bridge communication
//

import Foundation
import WebKit
import Combine

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
        if let url = URL(string: "https://ivory-blond.vercel.app") {
            let request = URLRequest(url: url)
            webView?.load(request)
        }
    }
    
    // MARK: - JavaScript Bridge
    
    func injectBridge() {
        let bridgeScript = """
        window.NativeBridge = {
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
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getProducts', { productIds, callbackId });
                });
            },
            
            purchase: function(productId) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('purchase', { productId, callbackId });
                });
            },
            
            restorePurchases: function() {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('restorePurchases', { callbackId });
                });
            },
            
            finishTransaction: function(transactionId) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
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
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('isWatchReachable', { callbackId });
                });
            },
            
            // Camera Methods
            takePicture: function(options) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('takePicture', { options, callbackId });
                });
            },
            
            // Share Methods
            share: function(options) {
                return new Promise((resolve, reject) => {
                    window._nativeCallbacks = window._nativeCallbacks || {};
                    const callbackId = Date.now() + Math.random();
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
                    const callbackId = Date.now() + Math.random();
                    window._nativeCallbacks[callbackId] = { resolve, reject };
                    
                    this.call('getDeviceInfo', { callbackId });
                });
            }
        };
        
        // Helper to resolve callbacks from native
        window.resolveNativeCallback = function(callbackId, result, error) {
            if (window._nativeCallbacks && window._nativeCallbacks[callbackId]) {
                if (error) {
                    window._nativeCallbacks[callbackId].reject(error);
                } else {
                    window._nativeCallbacks[callbackId].resolve(result);
                }
                delete window._nativeCallbacks[callbackId];
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
        webView?.evaluateJavaScript(script, completionHandler: completion)
    }
    
    func resolveCallback(callbackId: Any, result: [String: Any]? = nil, error: String? = nil) {
        let resultJSON = result != nil ? try? JSONSerialization.data(withJSONObject: result!, options: []) : nil
        let resultString = resultJSON != nil ? String(data: resultJSON!, encoding: .utf8) ?? "null" : "null"
        let errorString = error != nil ? "'\(error!)'" : "null"
        
        let script = "window.resolveNativeCallback(\(callbackId), \(resultString), \(errorString));"
        callJavaScript(script)
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
