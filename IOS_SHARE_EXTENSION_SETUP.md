# iOS Share Extension Setup Guide

## Overview
The Share Extension allows users to save nail design inspiration from any app (TikTok, Instagram, Pinterest, Safari, etc.) directly to Ivory's Choice without leaving the app they're in.

## How It Works

### User Flow
1. User sees nail inspo in TikTok/Instagram/Pinterest/browser
2. Taps the Share button
3. Selects "Save to Ivory's Choice" from share sheet
4. Mini UI appears with:
   - Image preview
   - Source URL (auto-captured)
   - Optional title/notes
   - Collection selector
5. Taps "Save"
6. Design is saved to their collection
7. Returns to original app
8. Next time they open Ivory's Choice, the design appears in their collection

## Implementation Steps

### 1. Create Share Extension Target in Xcode

```bash
# Open Xcode project
open ios/App/App.xcodeproj
```

1. In Xcode, go to **File > New > Target**
2. Select **iOS > Share Extension**
3. Name it: `IvoryShareExtension`
4. Language: Swift
5. Click **Finish**
6. When prompted about activating scheme, click **Activate**

### 2. Configure App Groups

App Groups allow the Share Extension to share data with the main app.

#### In Xcode:
1. Select the **App** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability** > **App Groups**
4. Add: `group.com.ivoryschoice.app`

5. Select the **IvoryShareExtension** target
6. Go to **Signing & Capabilities**
7. Click **+ Capability** > **App Groups**
8. Add: `group.com.ivoryschoice.app` (same as main app)

#### In Apple Developer Portal:
1. Go to **Certificates, Identifiers & Profiles**
2. Select **Identifiers**
3. Find your app's Bundle ID
4. Enable **App Groups** capability
5. Configure the App Group: `group.com.ivoryschoice.app`
6. Repeat for the Share Extension Bundle ID: `com.ivoryschoice.app.IvoryShareExtension`

### 3. Share Extension Code

Create `ios/App/IvoryShareExtension/ShareViewController.swift`:

```swift
import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    
    private let appGroupIdentifier = "group.com.ivoryschoice.app"
    private var imageData: Data?
    private var sourceURL: String?
    
    private let imageView: UIImageView = {
        let iv = UIImageView()
        iv.contentMode = .scaleAspectFill
        iv.clipsToBounds = true
        iv.layer.cornerRadius = 8
        iv.translatesAutoresizingMaskIntoConstraints = false
        return iv
    }()
    
    private let titleTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Title (optional)"
        tf.borderStyle = .roundedRect
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    private let notesTextView: UITextView = {
        let tv = UITextView()
        tv.layer.borderColor = UIColor.systemGray4.cgColor
        tv.layer.borderWidth = 1
        tv.layer.cornerRadius = 8
        tv.font = .systemFont(ofSize: 14)
        tv.translatesAutoresizingMaskIntoConstraints = false
        return tv
    }()
    
    private let saveButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Save to Ivory's Choice", for: .normal)
        btn.backgroundColor = .black
        btn.setTitleColor(.white, for: .normal)
        btn.layer.cornerRadius = 8
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()
    
    private let cancelButton: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Cancel", for: .normal)
        btn.translatesAutoresizingMaskIntoConstraints = false
        return btn
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .systemBackground
        setupUI()
        extractSharedContent()
    }
    
    private func setupUI() {
        view.addSubview(imageView)
        view.addSubview(titleTextField)
        view.addSubview(notesTextView)
        view.addSubview(saveButton)
        view.addSubview(cancelButton)
        
        NSLayoutConstraint.activate([
            imageView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            imageView.widthAnchor.constraint(equalToConstant: 200),
            imageView.heightAnchor.constraint(equalToConstant: 200),
            
            titleTextField.topAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 20),
            titleTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            titleTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            titleTextField.heightAnchor.constraint(equalToConstant: 44),
            
            notesTextView.topAnchor.constraint(equalTo: titleTextField.bottomAnchor, constant: 12),
            notesTextView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            notesTextView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            notesTextView.heightAnchor.constraint(equalToConstant: 80),
            
            saveButton.topAnchor.constraint(equalTo: notesTextView.bottomAnchor, constant: 20),
            saveButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            saveButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            saveButton.heightAnchor.constraint(equalToConstant: 50),
            
            cancelButton.topAnchor.constraint(equalTo: saveButton.bottomAnchor, constant: 12),
            cancelButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])
        
        saveButton.addTarget(self, action: #selector(saveDesign), for: .touchUpInside)
        cancelButton.addTarget(self, action: #selector(cancel), for: .touchUpInside)
    }
    
    private func extractSharedContent() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            return
        }
        
        // Extract source URL
        if let userInfo = extensionItem.userInfo as? [String: Any],
           let items = userInfo[NSExtensionItemAttachmentsKey] as? [NSItemProvider] {
            for item in items {
                if item.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    item.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (url, error) in
                        if let url = url as? URL {
                            self?.sourceURL = url.absoluteString
                        }
                    }
                }
            }
        }
        
        // Extract image
        if itemProvider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { [weak self] (item, error) in
                guard let self = self else { return }
                
                var imageToSave: UIImage?
                
                if let url = item as? URL {
                    imageToSave = UIImage(contentsOfFile: url.path)
                } else if let data = item as? Data {
                    imageToSave = UIImage(data: data)
                } else if let image = item as? UIImage {
                    imageToSave = image
                }
                
                if let image = imageToSave {
                    DispatchQueue.main.async {
                        self.imageView.image = image
                        self.imageData = image.jpegData(compressionQuality: 0.8)
                    }
                }
            }
        }
    }
    
    @objc private func saveDesign() {
        guard let imageData = imageData else {
            showAlert(message: "No image to save")
            return
        }
        
        // Save to shared container
        if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) {
            let timestamp = Date().timeIntervalSince1970
            let filename = "shared-\(timestamp).jpg"
            let fileURL = containerURL.appendingPathComponent(filename)
            
            do {
                try imageData.write(to: fileURL)
                
                // Save metadata
                let metadata: [String: Any] = [
                    "filename": filename,
                    "title": titleTextField.text ?? "",
                    "notes": notesTextView.text ?? "",
                    "sourceUrl": sourceURL ?? "",
                    "timestamp": timestamp
                ]
                
                // Save to UserDefaults in app group
                if let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) {
                    var pendingDesigns = sharedDefaults.array(forKey: "pendingDesigns") as? [[String: Any]] ?? []
                    pendingDesigns.append(metadata)
                    sharedDefaults.set(pendingDesigns, forKey: "pendingDesigns")
                    sharedDefaults.synchronize()
                }
                
                showAlert(message: "Design saved! Open Ivory's Choice to see it.") {
                    self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
                }
            } catch {
                showAlert(message: "Failed to save design: \(error.localizedDescription)")
            }
        }
    }
    
    @objc private func cancel() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
    
    private func showAlert(message: String, completion: (() -> Void)? = nil) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completion?()
        })
        present(alert, animated: true)
    }
}
```

### 4. Info.plist Configuration

Add to `ios/App/IvoryShareExtension/Info.plist`:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionAttributes</key>
    <dict>
        <key>NSExtensionActivationRule</key>
        <dict>
            <key>NSExtensionActivationSupportsImageWithMaxCount</key>
            <integer>1</integer>
            <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
            <integer>1</integer>
        </dict>
    </dict>
    <key>NSExtensionMainStoryboard</key>
    <string>MainInterface</string>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.share-services</string>
</dict>
```

### 5. Sync with Main App

Add to `ios/App/App/AppDelegate.swift`:

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // ... existing code ...
    
    // Process pending designs from Share Extension
    processPendingSharedDesigns()
    
    return true
}

private func processPendingSharedDesigns() {
    let appGroupIdentifier = "group.com.ivoryschoice.app"
    
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier),
          let pendingDesigns = sharedDefaults.array(forKey: "pendingDesigns") as? [[String: Any]],
          !pendingDesigns.isEmpty,
          let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
        return
    }
    
    // Upload each pending design
    for metadata in pendingDesigns {
        guard let filename = metadata["filename"] as? String else { continue }
        
        let fileURL = containerURL.appendingPathComponent(filename)
        
        // Upload to server
        uploadSharedDesign(
            fileURL: fileURL,
            title: metadata["title"] as? String,
            notes: metadata["notes"] as? String,
            sourceUrl: metadata["sourceUrl"] as? String
        )
    }
    
    // Clear pending designs
    sharedDefaults.removeObject(forKey: "pendingDesigns")
    sharedDefaults.synchronize()
}

private func uploadSharedDesign(fileURL: URL, title: String?, notes: String?, sourceUrl: String?) {
    // Call your API to upload the design
    // This should match the /api/saved-designs endpoint
}
```

### 6. Build and Test

1. Select the **IvoryShareExtension** scheme in Xcode
2. Build and run on a device (Share Extensions don't work in simulator)
3. Open Safari, Instagram, or any app with images
4. Tap Share button
5. Look for "Ivory's Choice" in the share sheet
6. Test saving a design

## Troubleshooting

### Share Extension doesn't appear
- Make sure you're testing on a real device (not simulator)
- Check that App Groups are properly configured
- Verify the extension's Info.plist has correct activation rules

### Images not syncing
- Verify App Group identifier matches in both targets
- Check file permissions in shared container
- Ensure main app processes pending designs on launch

### Can't upload to server
- Add network permissions to extension's Info.plist
- Ensure API endpoints accept requests from extension
- Consider using background upload tasks for reliability

## Next Steps

1. Add collection selector to Share Extension UI
2. Implement background upload queue for offline support
3. Add rich preview with design analysis
4. Support multiple image selection
5. Add tags and categories

## Benefits

- **Seamless workflow**: Save inspiration without app switching
- **Source preservation**: Automatically captures source URL
- **Instant collection**: Designs appear in app immediately
- **Universal**: Works with any app that supports sharing images
