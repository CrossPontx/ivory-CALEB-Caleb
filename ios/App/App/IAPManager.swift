//
//  IAPManager.swift
//  Ivory's Choice
//
//  Native In-App Purchase Manager (no Capacitor dependency)
//

import Foundation
import StoreKit
import os.log

class IAPManager: NSObject, ObservableObject {
    static let shared = IAPManager()
    
    @Published var products: [SKProduct] = []
    private var productsRequest: SKProductsRequest?
    private weak var webViewModel: WebViewModel?
    
    private let logger = OSLog(subsystem: "com.ivory.app", category: "IAP")
    
    override init() {
        super.init()
        SKPaymentQueue.default().add(self)
        os_log("✅ IAPManager initialized", log: logger, type: .info)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    func setWebViewModel(_ viewModel: WebViewModel?) {
        self.webViewModel = viewModel
    }
    
    // MARK: - Get Products
    
    func getProducts(data: [String: Any], viewModel: WebViewModel?) {
        guard let productIds = data["productIds"] as? [String] else {
            os_log("❌ No productIds provided", log: logger, type: .error)
            if let callbackId = data["callbackId"] {
                viewModel?.resolveCallback(callbackId: callbackId, error: "No productIds provided")
            }
            return
        }
        
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided", log: logger, type: .error)
            return
        }
        
        os_log("🔵 Requesting products: %@", log: logger, type: .info, productIds.joined(separator: ", "))
        
        if !SKPaymentQueue.canMakePayments() {
            os_log("❌ Cannot make payments", log: logger, type: .error)
            viewModel?.resolveCallback(callbackId: callbackId, error: "IAP disabled on device")
            return
        }
        
        let request = SKProductsRequest(productIdentifiers: Set(productIds))
        request.delegate = self
        productsRequest = request
        
        // Store callback for later
        objc_setAssociatedObject(request, "callbackId", callbackId, .OBJC_ASSOCIATION_RETAIN)
        objc_setAssociatedObject(request, "viewModel", viewModel, .OBJC_ASSOCIATION_RETAIN)
        
        request.start()
    }
    
    // MARK: - Purchase
    
    func purchase(data: [String: Any], viewModel: WebViewModel?) {
        guard let productId = data["productId"] as? String else {
            os_log("❌ No productId provided", log: logger, type: .error)
            if let callbackId = data["callbackId"] {
                viewModel?.resolveCallback(callbackId: callbackId, error: "No productId provided")
            }
            return
        }
        
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided", log: logger, type: .error)
            return
        }
        
        guard let product = products.first(where: { $0.productIdentifier == productId }) else {
            os_log("❌ Product not found: %@", log: logger, type: .error, productId)
            viewModel?.resolveCallback(callbackId: callbackId, error: "Product not found")
            return
        }
        
        os_log("🔵 Purchasing: %@", log: logger, type: .info, productId)
        
        let payment = SKPayment(product: product)
        
        // Store callback for transaction
        objc_setAssociatedObject(payment, "callbackId", callbackId, .OBJC_ASSOCIATION_RETAIN)
        objc_setAssociatedObject(payment, "viewModel", viewModel, .OBJC_ASSOCIATION_RETAIN)
        
        SKPaymentQueue.default().add(payment)
    }
    
    // MARK: - Restore Purchases
    
    func restorePurchases(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided", log: logger, type: .error)
            return
        }
        
        os_log("🔵 Restoring purchases", log: logger, type: .info)
        
        // Store callback
        objc_setAssociatedObject(SKPaymentQueue.default(), "restoreCallbackId", callbackId, .OBJC_ASSOCIATION_RETAIN)
        objc_setAssociatedObject(SKPaymentQueue.default(), "restoreViewModel", viewModel, .OBJC_ASSOCIATION_RETAIN)
        
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    // MARK: - Finish Transaction
    
    func finishTransaction(data: [String: Any], viewModel: WebViewModel?) {
        guard let transactionId = data["transactionId"] as? String else {
            os_log("❌ No transactionId provided", log: logger, type: .error)
            if let callbackId = data["callbackId"] {
                viewModel?.resolveCallback(callbackId: callbackId, error: "No transactionId provided")
            }
            return
        }
        
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided", log: logger, type: .error)
            return
        }
        
        os_log("🔵 Finishing transaction: %@", log: logger, type: .info, transactionId)
        
        for transaction in SKPaymentQueue.default().transactions {
            if transaction.transactionIdentifier == transactionId {
                SKPaymentQueue.default().finishTransaction(transaction)
                viewModel?.resolveCallback(callbackId: callbackId, result: ["success": true])
                return
            }
        }
        
        os_log("❌ Transaction not found: %@", log: logger, type: .error, transactionId)
        viewModel?.resolveCallback(callbackId: callbackId, error: "Transaction not found")
    }
}

// MARK: - SKProductsRequestDelegate

extension IAPManager: SKProductsRequestDelegate {
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        os_log("✅ Products received: %d", log: logger, type: .info, response.products.count)
        
        // Update products on main thread to avoid SwiftUI warnings
        DispatchQueue.main.async {
            self.products = response.products
        }
        
        let productsData = response.products.map { product -> [String: Any] in
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = product.priceLocale
            
            return [
                "productId": product.productIdentifier,
                "title": product.localizedTitle,
                "description": product.localizedDescription,
                "price": product.price.doubleValue,
                "priceString": formatter.string(from: product.price) ?? "",
                "currency": product.priceLocale.currencyCode ?? "USD"
            ]
        }
        
        if let callbackId = objc_getAssociatedObject(request, "callbackId"),
           let viewModel = objc_getAssociatedObject(request, "viewModel") as? WebViewModel {
            viewModel.resolveCallback(callbackId: callbackId, result: [
                "products": productsData,
                "invalidProductIds": response.invalidProductIdentifiers
            ])
        }
    }
    
    func request(_ request: SKRequest, didFailWithError error: Error) {
        os_log("❌ Products request failed: %@", log: logger, type: .error, error.localizedDescription)
        
        if let callbackId = objc_getAssociatedObject(request, "callbackId"),
           let viewModel = objc_getAssociatedObject(request, "viewModel") as? WebViewModel {
            viewModel.resolveCallback(callbackId: callbackId, error: error.localizedDescription)
        }
    }
}

// MARK: - SKPaymentTransactionObserver

extension IAPManager: SKPaymentTransactionObserver {
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .failed:
                handleFailed(transaction)
            case .restored:
                handleRestored(transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        os_log("✅ Purchase completed: %@", log: logger, type: .info, transaction.payment.productIdentifier)
        
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            let data: [String: Any] = [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString,
                "transactionDate": transaction.transactionDate?.timeIntervalSince1970 ?? 0
            ]
            
            // Notify web app
            webViewModel?.notifyWeb(event: "purchaseCompleted", data: data)
        }
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let error = transaction.error as? SKError
        let errorCode = error?.code.rawValue ?? -1
        let errorMessage = error?.localizedDescription ?? "Unknown error"
        
        os_log("❌ Purchase failed: %@ - %@", log: logger, type: .error, transaction.payment.productIdentifier, errorMessage)
        
        let data: [String: Any] = [
            "productId": transaction.payment.productIdentifier,
            "errorCode": errorCode,
            "errorMessage": errorMessage
        ]
        
        webViewModel?.notifyWeb(event: "purchaseFailed", data: data)
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        os_log("✅ Purchase restored: %@", log: logger, type: .info, transaction.payment.productIdentifier)
        
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            let data: [String: Any] = [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString
            ]
            
            webViewModel?.notifyWeb(event: "purchaseRestored", data: data)
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        os_log("✅ Restore completed", log: logger, type: .info)
        
        if let callbackId = objc_getAssociatedObject(queue, "restoreCallbackId"),
           let viewModel = objc_getAssociatedObject(queue, "restoreViewModel") as? WebViewModel {
            viewModel.resolveCallback(callbackId: callbackId, result: ["success": true])
        }
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        os_log("❌ Restore failed: %@", log: logger, type: .error, error.localizedDescription)
        
        if let callbackId = objc_getAssociatedObject(queue, "restoreCallbackId"),
           let viewModel = objc_getAssociatedObject(queue, "restoreViewModel") as? WebViewModel {
            viewModel.resolveCallback(callbackId: callbackId, error: error.localizedDescription)
        }
    }
}
