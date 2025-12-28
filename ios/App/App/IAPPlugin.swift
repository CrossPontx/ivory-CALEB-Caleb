import Foundation
import Capacitor
import StoreKit

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
    
    public override func load() {
        super.load()
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self) else {
            call.reject("Must provide productIds")
            return
        }
        
        let request = SKProductsRequest(productIdentifiers: Set(productIds))
        request.delegate = self
        productsRequest = request
        
        // Store call for later response
        pendingCalls["getProducts"] = call
        
        request.start()
    }
    
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Must provide productId")
            return
        }
        
        guard let product = products.first(where: { $0.productIdentifier == productId }) else {
            call.reject("Product not found")
            return
        }
        
        // Store call for later response
        pendingCalls["purchase_\(productId)"] = call
        
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        SKPaymentQueue.default().restoreCompletedTransactions()
        call.resolve()
    }
    
    @objc func finishTransaction(_ call: CAPPluginCall) {
        guard let transactionId = call.getString("transactionId") else {
            call.reject("Must provide transactionId")
            return
        }
        
        // Find and finish the transaction
        for transaction in SKPaymentQueue.default().transactions {
            if transaction.transactionIdentifier == transactionId {
                SKPaymentQueue.default().finishTransaction(transaction)
                call.resolve()
                return
            }
        }
        
        call.reject("Transaction not found")
    }
}

// MARK: - SKProductsRequestDelegate
extension IAPPlugin: SKProductsRequestDelegate {
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        self.products = response.products
        
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
        
        if let call = pendingCalls["getProducts"] {
            call.resolve([
                "products": productsData,
                "invalidProductIds": response.invalidProductIdentifiers
            ])
            pendingCalls.removeValue(forKey: "getProducts")
        }
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        if let call = pendingCalls["getProducts"] {
            call.reject("Failed to load products: \(error.localizedDescription)")
            pendingCalls.removeValue(forKey: "getProducts")
        }
    }
}

// MARK: - SKPaymentTransactionObserver
extension IAPPlugin: SKPaymentTransactionObserver {
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
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
        // Get receipt data
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            let data: [String: Any] = [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString,
                "transactionDate": transaction.transactionDate?.timeIntervalSince1970 ?? 0
            ]
            
            notifyListeners("purchaseCompleted", data: data)
            
            // Also resolve pending purchase call if exists
            if let call = pendingCalls["purchase_\(transaction.payment.productIdentifier)"] {
                call.resolve(data)
                pendingCalls.removeValue(forKey: "purchase_\(transaction.payment.productIdentifier)")
            }
        }
        
        // Don't finish transaction here - let the app do it after server validation
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let error = transaction.error as? SKError
        let errorCode = error?.code.rawValue ?? -1
        let errorMessage = error?.localizedDescription ?? "Unknown error"
        
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
