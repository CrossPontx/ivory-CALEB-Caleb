//
//  ContentView.swift
//  Ivory's Choice
//
//  Native SwiftUI + WKWebView implementation
//

import SwiftUI
import WebKit

struct ContentView: View {
    @StateObject private var webViewModel = WebViewModel()
    @StateObject private var iapManager = IAPManager.shared
    @StateObject private var watchManager = WatchConnectivityManager.shared
    
    var body: some View {
        ZStack {
            WebView(viewModel: webViewModel)
            
            // Loading indicator
            if webViewModel.isLoading {
                ProgressView()
                    .scaleEffect(1.5)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black.opacity(0.3))
            }
        }
        .onAppear {
            // Initialize managers
            iapManager.setWebViewModel(webViewModel)
            watchManager.setWebViewModel(webViewModel)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
