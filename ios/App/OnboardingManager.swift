//
//  OnboardingManager.swift
//  Ivory's Choice
//
//  Manages onboarding video state
//

import Foundation

class OnboardingManager {
    static let shared = OnboardingManager()
    
    private let hasSeenVideoKey = "hasSeenOnboardingVideo"
    private let videoProgressKey = "onboardingVideoProgress"
    
    private init() {
        print("🎬 OnboardingManager initialized")
    }
    
    var hasSeenOnboardingVideo: Bool {
        get {
            let value = UserDefaults.standard.bool(forKey: hasSeenVideoKey)
            print("🎬 Getting hasSeenOnboardingVideo: \(value)")
            return value
        }
        set {
            print("🎬 Setting hasSeenOnboardingVideo: \(newValue)")
            UserDefaults.standard.set(newValue, forKey: hasSeenVideoKey)
            UserDefaults.standard.synchronize()
        }
    }
    
    var videoProgress: Double {
        get {
            let progress = UserDefaults.standard.double(forKey: videoProgressKey)
            print("🎬 Getting video progress: \(progress) seconds")
            return progress
        }
        set {
            print("🎬 Setting video progress: \(newValue) seconds")
            UserDefaults.standard.set(newValue, forKey: videoProgressKey)
            UserDefaults.standard.synchronize()
        }
    }
    
    func resetOnboarding() {
        print("🎬 Resetting onboarding and video progress")
        hasSeenOnboardingVideo = false
        UserDefaults.standard.removeObject(forKey: videoProgressKey)
        UserDefaults.standard.synchronize()
    }
    
    func completeOnboarding() {
        print("🎬 Completing onboarding and clearing video progress")
        hasSeenOnboardingVideo = true
        UserDefaults.standard.removeObject(forKey: videoProgressKey)
        UserDefaults.standard.synchronize()
    }
}