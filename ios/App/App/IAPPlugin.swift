import Foundation
import Capacitor
import StoreKit
import os.log

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IAPPlugin"
    public let jsName = "IAPPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishTransaction", returnType: CAPPluginReturnPromise)
    ]
    
    private var products: [SKProduct] = []
    private var productsRequest: SKProductsRequest?
    private var pendingCalls: [String: CAPPluginCall] = [:]
    
    // Logger for detailed debugging
    private let logger = OSLog(subsystem: "com.ivory.app", category: "IAP")
    
    public override func load() {
        super.load()
        os_log("🟢 IAPPlugin: load() called - Plugin is initializing", log: logger, type: .info)
        SKPaymentQueue.default().add(self)
        os_log("🟢 IAPPlugin: Added as payment queue observer", log: logger, type: .info)
        
        // Log StoreKit availability
        if SKPaymentQueue.canMakePayments() {
            os_log("✅ IAPPlugin: Device CAN make payments", log: logger, type: .info)
        } else {
            os_log("❌ IAPPlugin: Device CANNOT make payments - IAP disabled in settings", log: logger, type: .error)
        }
    }
    
    deinit {
        os_log("🔴 IAPPlugin: deinit called - Plugin is being deallocated", log: logger, type: .info)
        SKPaymentQueue.default().remove(self)
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        os_log("🔵 IAPPlugin: getProducts() called", log: logger, type: .info)
        
        guard let productIds = call.getArray("productIds", String.self) else {
            os_log("❌ IAPPlugin: No productIds provided", log: logger, type: .error)
            call.reject("Must provide productIds")
            return
        }
        
        os_log("🔵 IAPPlugin: Requesting %d products: %@", log: logger, type: .info, productIds.count, productIds.joined(separator: ", "))
        
        // Check if we can make payments
        if !SKPaymentQueue.canMakePayments() {
            os_log("❌ IAPPlugin: Cannot make payments - IAP disabled", log: logger, type: .error)
            call.reject("IAP_DISABLED", "In-App Purchases are disabled on this device")
            return
        }
        
        let request = SKProductsRequest(productIdentifiers: Set(productIds))
        request.delegate = self
        productsRequest = request
        
        // Store call for later response
        pendingCalls["getProducts"] = call
        
        os_log("🔵 IAPPlugin: Starting products request...", log: logger, type: .info)
        request.start()
    }
    
    @objc func purchase(_ call: CAPPluginCall) {
        os_log("🔵 IAPPlugin: purchase() called", log: logger, type: .info)
        
        guard let productId = call.getString("productId") else {
            os_log("❌ IAPPlugin: No productId provided", log: logger, type: .error)
            call.reject("Must provide productId")
            return
        }
        
        os_log("🔵 IAPPlugin: Attempting to purchase: %@", log: logger, type: .info, productId)
        
        guard let product = products.first(where: { $0.productIdentifier == productId }) else {
            os_log("❌ IAPPlugin: Product not found in loaded products. Available: %@", log: logger, type: .error, products.map { $0.productIdentifier }.joined(separator: ", "))
            call.reject("Product not found")
            return
        }
        
        os_log("✅ IAPPlugin: Product found: %@ - %@", log: logger, type: .info, product.localizedTitle, product.price.description)
        
        // Store call for later response
        pendingCalls["purchase_\(productId)"] = call
        
        let payment = SKPayment(product: product)
        os_log("🔵 IAPPlugin: Adding payment to queue...", log: logger, type: .info)
        SKPaymentQueue.default().add(payment)
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        os_log("🔵 IAPPlugin: restorePurchases() called", log: logger, type: .info)
        SKPaymentQueue.default().restoreCompletedTransactions()
        call.resolve()
    }
    
    @objc func finishTransaction(_ call: CAPPluginCall) {
        os_log("🔵 IAPPlugin: finishTransaction() called", log: logger, type: .info)
        
        guard let transactionId = call.getString("transactionId") else {
            os_log("❌ IAPPlugin: No transactionId provided", log: logger, type: .error)
            call.reject("Must provide transactionId")
            return
        }
        
        os_log("🔵 IAPPlugin: Looking for transaction: %@", log: logger, type: .info, transactionId)
        
        // Find and finish the transaction
        for transaction in SKPaymentQueue.default().transactions {
            if transaction.transactionIdentifier == transactionId {
                os_log("✅ IAPPlugin: Found transaction, finishing...", log: logger, type: .info)
                SKPaymentQueue.default().finishTransaction(transaction)
                call.resolve()
                return
            }
        }
        
        os_log("❌ IAPPlugin: Transaction not found in queue", log: logger, type: .error)
        call.reject("Transaction not found")
    }
}

// MARK: - SKProductsRequestDelegate
extension IAPPlugin: SKProductsRequestDelegate {
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        os_log("✅ IAPPlugin: Products request succeeded", log: logger, type: .info)
        os_log("🔵 IAPPlugin: Received %d valid products", log: logger, type: .info, response.products.count)
        os_log("🔵 IAPPlugin: Received %d invalid product IDs", log: logger, type: .info, response.invalidProductIdentifiers.count)
        
        if !response.invalidProductIdentifiers.isEmpty {
            os_log("⚠️ IAPPlugin: Invalid product IDs: %@", log: logger, type: .error, response.invalidProductIdentifiers.joined(separator: ", "))
        }
        
        self.products = response.products
        
        let productsData = response.products.map { product -> [String: Any] in
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = product.priceLocale
            
            let productData: [String: Any] = [
                "productId": product.productIdentifier,
                "title": product.localizedTitle,
                "description": product.localizedDescription,
                "price": product.price.doubleValue,
                "priceString": formatter.string(from: product.price) ?? "",
                "currency": product.priceLocale.currencyCode ?? "USD"
            ]
            
            os_log("📦 IAPPlugin: Product - %@ | %@ | %@", log: logger, type: .info, 
                   product.productIdentifier, 
                   product.localizedTitle, 
                   formatter.string(from: product.price) ?? "")
            
            return productData
        }
        
        if let call = pendingCalls["getProducts"] {
            os_log("✅ IAPPlugin: Resolving getProducts call with %d products", log: logger, type: .info, productsData.count)
            call.resolve([
                "products": productsData,
                "invalidProductIds": response.invalidProductIdentifiers
            ])
            pendingCalls.removeValue(forKey: "getProducts")
        } else {
            os_log("⚠️ IAPPlugin: No pending getProducts call found", log: logger, type: .error)
        }
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        os_log("❌ IAPPlugin: Products request FAILED: %@", log: logger, type: .error, error.localizedDescription)
        os_log("❌ IAPPlugin: Error domain: %@, code: %d", log: logger, type: .error, (error as NSError).domain, (error as NSError).code)
        
        if let call = pendingCalls["getProducts"] {
            call.reject("Failed to load products: \(error.localizedDescription)")
            pendingCalls.removeValue(forKey: "getProducts")
        }
    }
}

// MARK: - SKPaymentTransactionObserver
extension IAPPlugin: SKPaymentTransactionObserver {
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        os_log("🔵 IAPPlugin: Payment queue updated with %d transactions", log: logger, type: .info, transactions.count)
        
        for transaction in transactions {
            let stateString: String
            switch transaction.transactionState {
            case .purchasing:
                stateString = "PURCHASING"
            case .purchased:
                stateString = "PURCHASED"
            case .failed:
                stateString = "FAILED"
            case .restored:
                stateString = "RESTORED"
            case .deferred:
                stateString = "DEFERRED"
            @unknown default:
                stateString = "UNKNOWN"
            }
            
            os_log("🔵 IAPPlugin: Transaction %@ - State: %@", log: logger, type: .info, 
                   transaction.payment.productIdentifier, stateString)
            
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
        os_log("✅ IAPPlugin: Purchase completed for %@", log: logger, type: .info, transaction.payment.productIdentifier)
        
        // Get receipt data
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            os_log("✅ IAPPlugin: Receipt data obtained (%d bytes)", log: logger, type: .info, receiptData.count)
            
            let data: [String: Any] = [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString,
                "transactionDate": transaction.transactionDate?.timeIntervalSince1970 ?? 0
            ]
            
            os_log("🔵 IAPPlugin: Notifying listeners of purchase completion", log: logger, type: .info)
            notifyListeners("purchaseCompleted", data: data)
            
            // Also resolve pending purchase call if exists
            if let call = pendingCalls["purchase_\(transaction.payment.productIdentifier)"] {
                os_log("✅ IAPPlugin: Resolving pending purchase call", log: logger, type: .info)
                call.resolve(data)
                pendingCalls.removeValue(forKey: "purchase_\(transaction.payment.productIdentifier)")
            }
        } else {
            os_log("❌ IAPPlugin: Failed to get receipt data", log: logger, type: .error)
        }
        
        // Don't finish transaction here - let the app do it after server validation
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let error = transaction.error as? SKError
        let errorCode = error?.code.rawValue ?? -1
        let errorMessage = error?.localizedDescription ?? "Unknown error"
        
        os_log("❌ IAPPlugin: Purchase FAILED for %@ - Code: %d, Message: %@", log: logger, type: .error,
               transaction.payment.productIdentifier, errorCode, errorMessage)
        
        let data: [String: Any] = [
            "productId": transaction.payment.productIdentifier,
            "errorCode": errorCode,
            "errorMessage": errorMessage
        ]
        
        notifyListeners("purchaseFailed", data: data)
        
        // Also reject pending purchase call if exists
        if let call = pendingCalls["purchase_\(transaction.payment.productIdentifier)"] {
            call.reject(errorMessage, "\(errorCode)", error, nil)
            pendingCalls.removeValue(forKey: "purchase_\(transaction.payment.productIdentifier)")
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        os_log("✅ IAPPlugin: Purchase RESTORED for %@", log: logger, type: .info, transaction.payment.productIdentifier)
        
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            notifyListeners("purchaseRestored", data: [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString
            ])
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
}
