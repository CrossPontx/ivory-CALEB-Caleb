//
//  CameraManager.swift
//  Ivory's Choice
//
//  Native camera and photo library access
//

import Foundation
import UIKit
import AVFoundation
import Photos
import os.log

class CameraManager: NSObject, ObservableObject {
    static let shared = CameraManager()
    
    private var currentCallback: ((String?, String?) -> Void)?
    private let logger = OSLog(subsystem: "com.ivory.app", category: "Camera")
    
    // MARK: - Permission Methods
    
    func requestCameraPermission(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for camera permission", log: logger, type: .error)
            return
        }
        
        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                os_log("📷 Camera permission %@", log: self.logger, type: .info, granted ? "granted" : "denied")
                viewModel?.resolveCallback(callbackId: callbackId, result: ["granted": granted])
            }
        }
    }
    
    func getCameraPermissionStatus(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for camera permission status", log: logger, type: .error)
            return
        }
        
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        let authorized = status == .authorized
        
        os_log("📷 Camera permission status: %@", log: logger, type: .info, authorized ? "authorized" : "not authorized")
        viewModel?.resolveCallback(callbackId: callbackId, result: ["authorized": authorized])
    }
    
    func requestPhotosPermission(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for photos permission", log: logger, type: .error)
            return
        }
        
        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            DispatchQueue.main.async {
                let granted = status == .authorized || status == .limited
                os_log("📸 Photos permission %@", log: self.logger, type: .info, granted ? "granted" : "denied")
                viewModel?.resolveCallback(callbackId: callbackId, result: ["granted": granted])
            }
        }
    }
    
    func getPhotosPermissionStatus(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided for photos permission status", log: logger, type: .error)
            return
        }
        
        let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        let authorized = status == .authorized || status == .limited
        
        os_log("📸 Photos permission status: %@", log: logger, type: .info, authorized ? "authorized" : "not authorized")
        viewModel?.resolveCallback(callbackId: callbackId, result: ["authorized": authorized])
    }
    
    func takePicture(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            os_log("❌ No callbackId provided", log: logger, type: .error)
            return
        }
        
        let options = data["options"] as? [String: Any] ?? [:]
        let source = options["source"] as? String ?? "prompt"
        
        os_log("🔵 Taking picture with source: %@", log: logger, type: .info, source)
        
        DispatchQueue.main.async {
            let picker = UIImagePickerController()
            picker.delegate = self
            picker.allowsEditing = options["allowEditing"] as? Bool ?? false
            
            if source == "camera" {
                picker.sourceType = .camera
            } else if source == "photos" {
                picker.sourceType = .photoLibrary
            } else {
                // Show action sheet
                let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
                
                if UIImagePickerController.isSourceTypeAvailable(.camera) {
                    alert.addAction(UIAlertAction(title: "Take Photo", style: .default) { _ in
                        picker.sourceType = .camera
                        self.presentPicker(picker, callbackId: callbackId, viewModel: viewModel)
                    })
                }
                
                alert.addAction(UIAlertAction(title: "Choose from Library", style: .default) { _ in
                    picker.sourceType = .photoLibrary
                    self.presentPicker(picker, callbackId: callbackId, viewModel: viewModel)
                })
                
                alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
                    viewModel?.resolveCallback(callbackId: callbackId, error: "User cancelled")
                })
                
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let rootViewController = windowScene.windows.first?.rootViewController {
                    rootViewController.present(alert, animated: true)
                }
                return
            }
            
            self.presentPicker(picker, callbackId: callbackId, viewModel: viewModel)
        }
    }
    
    private func presentPicker(_ picker: UIImagePickerController, callbackId: Any, viewModel: WebViewModel?) {
        // Store callback
        objc_setAssociatedObject(picker, "callbackId", callbackId, .OBJC_ASSOCIATION_RETAIN)
        objc_setAssociatedObject(picker, "viewModel", viewModel, .OBJC_ASSOCIATION_RETAIN)
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(picker, animated: true)
        }
    }
}

// MARK: - UIImagePickerControllerDelegate

extension CameraManager: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true)
        
        guard let callbackId = objc_getAssociatedObject(picker, "callbackId"),
              let viewModel = objc_getAssociatedObject(picker, "viewModel") as? WebViewModel else {
            return
        }
        
        var image: UIImage?
        if let editedImage = info[.editedImage] as? UIImage {
            image = editedImage
        } else if let originalImage = info[.originalImage] as? UIImage {
            image = originalImage
        }
        
        guard let finalImage = image else {
            viewModel.resolveCallback(callbackId: callbackId, error: "No image selected")
            return
        }
        
        // Convert to base64
        guard let imageData = finalImage.jpegData(compressionQuality: 0.8) else {
            viewModel.resolveCallback(callbackId: callbackId, error: "Failed to process image")
            return
        }
        
        let base64String = imageData.base64EncodedString()
        
        os_log("✅ Image captured (%d bytes)", log: logger, type: .info, imageData.count)
        
        viewModel.resolveCallback(callbackId: callbackId, result: [
            "dataUrl": "data:image/jpeg;base64,\(base64String)",
            "format": "jpeg"
        ])
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
        
        guard let callbackId = objc_getAssociatedObject(picker, "callbackId"),
              let viewModel = objc_getAssociatedObject(picker, "viewModel") as? WebViewModel else {
            return
        }
        
        viewModel.resolveCallback(callbackId: callbackId, error: "User cancelled")
    }
}
