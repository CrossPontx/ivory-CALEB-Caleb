//
//  HapticsManager.swift
//  Ivory's Choice
//
//  Native haptic feedback
//

import Foundation
import UIKit

class HapticsManager {
    static let shared = HapticsManager()
    
    func impact(data: [String: Any]) {
        let style = data["style"] as? String ?? "medium"
        
        DispatchQueue.main.async {
            let generator: UIImpactFeedbackGenerator
            
            switch style {
            case "light":
                generator = UIImpactFeedbackGenerator(style: .light)
            case "medium":
                generator = UIImpactFeedbackGenerator(style: .medium)
            case "heavy":
                generator = UIImpactFeedbackGenerator(style: .heavy)
            case "soft":
                if #available(iOS 13.0, *) {
                    generator = UIImpactFeedbackGenerator(style: .soft)
                } else {
                    generator = UIImpactFeedbackGenerator(style: .light)
                }
            case "rigid":
                if #available(iOS 13.0, *) {
                    generator = UIImpactFeedbackGenerator(style: .rigid)
                } else {
                    generator = UIImpactFeedbackGenerator(style: .heavy)
                }
            default:
                generator = UIImpactFeedbackGenerator(style: .medium)
            }
            
            generator.prepare()
            generator.impactOccurred()
        }
    }
    
    func notification(type: UINotificationFeedbackGenerator.FeedbackType) {
        DispatchQueue.main.async {
            let generator = UINotificationFeedbackGenerator()
            generator.prepare()
            generator.notificationOccurred(type)
        }
    }
    
    func selection() {
        DispatchQueue.main.async {
            let generator = UISelectionFeedbackGenerator()
            generator.prepare()
            generator.selectionChanged()
        }
    }
}
