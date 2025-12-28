#!/bin/bash

# Script to generate iOS app icons and splash screens from App_logo.png
# This uses sips (built-in macOS tool) to resize images

echo "🎨 Generating iOS App Assets from App_logo.png..."

# Check if App_logo.png exists
if [ ! -f "public/App_logo.png" ]; then
    echo "❌ Error: public/App_logo.png not found!"
    exit 1
fi

# Create temp directory
mkdir -p temp_assets

# Generate App Icon (1024x1024 required for iOS)
echo "📱 Generating App Icon..."
sips -z 1024 1024 public/App_logo.png --out temp_assets/AppIcon-1024.png --padToHeightWidth 1024 1024 --padColor 000000

# Copy to iOS assets
cp temp_assets/AppIcon-1024.png ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

# Generate Splash Screens (centered logo on black background)
echo "🌟 Generating Splash Screens..."

# Create a properly sized logo that maintains aspect ratio
# We'll make it 30% of screen height to look good
# For iPhone screens (roughly 2532 height), 30% = ~760px

# First, resize logo to appropriate size while maintaining aspect ratio
# Using 600px as a good size for the logo
sips -Z 600 public/App_logo.png --out temp_assets/splash_logo_sized.png

# Now pad it to create square canvas with black background
sips --padToHeightWidth 600 600 temp_assets/splash_logo_sized.png --out temp_assets/splash_logo_square.png --padColor 000000

# For splash screens, create black background with centered logo
# @1x (1170x2532 for iPhone 13 Pro)
sips --padToHeightWidth 2532 1170 temp_assets/splash_logo_square.png --out temp_assets/splash_1x.png --padColor 000000

# @2x (2340x5064)
sips --padToHeightWidth 5064 2340 temp_assets/splash_logo_square.png --out temp_assets/splash_2x.png --padColor 000000

# @3x (3510x7596)
sips --padToHeightWidth 7596 3510 temp_assets/splash_logo_square.png --out temp_assets/splash_3x.png --padColor 000000

# Copy splash screens to iOS assets (light mode)
cp temp_assets/splash_1x.png ios/App/App/Assets.xcassets/Splash.imageset/Default@1x~universal~anyany.png
cp temp_assets/splash_2x.png ios/App/App/Assets.xcassets/Splash.imageset/Default@2x~universal~anyany.png
cp temp_assets/splash_3x.png ios/App/App/Assets.xcassets/Splash.imageset/Default@3x~universal~anyany.png

# Copy splash screens to iOS assets (dark mode - same as light for now)
cp temp_assets/splash_1x.png ios/App/App/Assets.xcassets/Splash.imageset/Default@1x~universal~anyany-dark.png
cp temp_assets/splash_2x.png ios/App/App/Assets.xcassets/Splash.imageset/Default@2x~universal~anyany-dark.png
cp temp_assets/splash_3x.png ios/App/App/Assets.xcassets/Splash.imageset/Default@3x~universal~anyany-dark.png

# Clean up
rm -rf temp_assets

echo "✅ iOS assets generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npx cap sync ios"
echo "2. Open Xcode and verify the assets look good"
echo "3. Build and test on device/simulator"
