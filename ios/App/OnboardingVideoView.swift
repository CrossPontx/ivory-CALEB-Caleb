//
//  OnboardingVideoView.swift
//  Ivory's Choice
//
//  Onboarding video for first-time users
//

import SwiftUI
import AVKit
import AVFoundation

struct OnboardingVideoView: View {
    @State private var player: AVPlayer?
    @State private var timeObserver: Any?
    let onComplete: () -> Void
    
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            if let player = player {
                VideoPlayer(player: player)
                    .ignoresSafeArea()
                    .onAppear {
                        setupPlayer()
                    }
                    .onDisappear {
                        saveVideoProgress()
                        player.pause()
                    }
            } else {
                // Loading state
                VStack {
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)
                    
                    Text("Loading...")
                        .foregroundColor(.white)
                        .padding(.top)
                }
            }
        }
        .onAppear {
            setupVideo()
            setupNotifications()
        }
        .onDisappear {
            removeNotifications()
            removeTimeObserver()
        }
    }
    
    private func setupVideo() {
        // Try multiple possible video file names and locations
        let possibleVideoNames = [
            "ivory - Made with Clipchamp",
            "onboarding-video",
            "ivory_onboarding"
        ]
        
        var videoURL: URL?
        
        for videoName in possibleVideoNames {
            if let url = Bundle.main.url(forResource: videoName, withExtension: "mov") {
                videoURL = url
                print("✅ Found video file: \(videoName).mov")
                break
            } else if let url = Bundle.main.url(forResource: videoName, withExtension: "mp4") {
                videoURL = url
                print("✅ Found video file: \(videoName).mp4")
                break
            }
        }
        
        guard let url = videoURL else {
            print("❌ Could not find onboarding video file in bundle")
            print("📁 Bundle contents:")
            if let bundlePath = Bundle.main.resourcePath {
                do {
                    let contents = try FileManager.default.contentsOfDirectory(atPath: bundlePath)
                    for file in contents.prefix(20) {
                        if file.contains("ivory") || file.contains("onboarding") || file.hasSuffix(".mov") || file.hasSuffix(".mp4") {
                            print("  - \(file)")
                        }
                    }
                } catch {
                    print("  Error reading bundle: \(error)")
                }
            }
            
            // If video not found, complete onboarding immediately
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                completeOnboarding()
            }
            return
        }
        
        print("🎬 Loading video from: \(url.lastPathComponent)")
        player = AVPlayer(url: url)
        
        // Add observer for when video finishes
        NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: player?.currentItem,
            queue: .main
        ) { _ in
            print("🎬 Video finished playing, completing onboarding")
            self.completeOnboarding()
        }
        
        // Add observer for playback errors
        NotificationCenter.default.addObserver(
            forName: .AVPlayerItemFailedToPlayToEndTime,
            object: player?.currentItem,
            queue: .main
        ) { notification in
            if let error = notification.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? Error {
                print("❌ Video playback failed: \(error)")
            }
            // Complete onboarding even if video fails
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.completeOnboarding()
            }
        }
    }
    
    private func setupPlayer() {
        guard let player = player else { return }
        
        // Configure audio session for video playback
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("❌ Failed to configure audio session: \(error)")
        }
        
        // Set volume to system volume
        player.volume = 1.0
        
        // Restore video progress if exists
        let savedProgress = UserDefaults.standard.double(forKey: "onboardingVideoProgress")
        if savedProgress > 0 {
            print("🎬 Restoring video progress: \(savedProgress) seconds")
            let time = CMTime(seconds: savedProgress, preferredTimescale: 600)
            player.seek(to: time)
        }
        
        // Add time observer to track progress
        let interval = CMTime(seconds: 1.0, preferredTimescale: 600)
        timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { time in
            let seconds = CMTimeGetSeconds(time)
            if seconds > 0 {
                UserDefaults.standard.set(seconds, forKey: "onboardingVideoProgress")
            }
        }
        
        // Start playing with a small delay to ensure everything is ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            print("🎬 Starting video playback")
            player.play()
        }
    }
    
    private func setupNotifications() {
        // Pause video when app goes to background
        NotificationCenter.default.addObserver(
            forName: UIApplication.willResignActiveNotification,
            object: nil,
            queue: .main
        ) { _ in
            print("📱 App going to background, pausing video and saving progress")
            self.saveVideoProgress()
            self.player?.pause()
        }
        
        // Resume video when app becomes active
        NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { _ in
            print("📱 App became active, resuming video")
            self.player?.play()
        }
    }
    
    private func saveVideoProgress() {
        guard let player = player else { return }
        let currentTime = CMTimeGetSeconds(player.currentTime())
        if currentTime > 0 {
            UserDefaults.standard.set(currentTime, forKey: "onboardingVideoProgress")
            UserDefaults.standard.synchronize()
            print("💾 Saved video progress: \(currentTime) seconds")
        }
    }
    
    private func removeTimeObserver() {
        if let timeObserver = timeObserver {
            player?.removeTimeObserver(timeObserver)
            self.timeObserver = nil
        }
    }
    
    private func removeNotifications() {
        NotificationCenter.default.removeObserver(self)
    }
    
    private func completeOnboarding() {
        print("✅ Completing onboarding video")
        
        // Clear video progress since video is complete
        UserDefaults.standard.removeObject(forKey: "onboardingVideoProgress")
        
        // Mark onboarding as completed
        OnboardingManager.shared.completeOnboarding()
        
        // Stop and cleanup player
        saveVideoProgress()
        removeTimeObserver()
        player?.pause()
        player = nil
        
        // Call completion handler
        onComplete()
    }
}

struct OnboardingVideoView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingVideoView {
            print("Onboarding completed")
        }
    }
}
