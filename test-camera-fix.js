// Camera Fix Test Script
// Run this in browser console on the capture page to test camera cleanup

console.log('🧪 Testing Camera Fix...');

// Test 1: Check if stopCamera properly cleans up
function testStopCamera() {
  console.log('Test 1: stopCamera cleanup');
  
  // Simulate having an active stream
  if (window.streamRef && window.streamRef.current) {
    console.log('✅ Found active stream, testing cleanup...');
    
    // Call stopCamera (assuming it's available in global scope)
    if (typeof stopCamera === 'function') {
      stopCamera();
      
      // Check if cleanup worked
      if (window.streamRef.current === null) {
        console.log('✅ Stream reference properly cleared');
      } else {
        console.log('❌ Stream reference not cleared');
      }
      
      if (window.videoRef && window.videoRef.current && window.videoRef.current.srcObject === null) {
        console.log('✅ Video element source properly cleared');
      } else {
        console.log('❌ Video element source not cleared');
      }
    } else {
      console.log('❌ stopCamera function not accessible');
    }
  } else {
    console.log('ℹ️ No active stream to test');
  }
}

// Test 2: Check camera permission handling
async function testCameraPermissions() {
  console.log('Test 2: Camera permissions');
  
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const permission = await navigator.permissions.query({ name: 'camera' });
      console.log('✅ Camera permission status:', permission.state);
    } else {
      console.log('ℹ️ Permission API not supported');
    }
  } catch (error) {
    console.log('❌ Permission check failed:', error);
  }
}

// Test 3: Check if getUserMedia works after cleanup
async function testCameraRestart() {
  console.log('Test 3: Camera restart after cleanup');
  
  try {
    // First, ensure any existing stream is stopped
    if (typeof stopCamera === 'function') {
      stopCamera();
    }
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Try to get new stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('✅ Camera restart successful');
    
    // Clean up test stream
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Test stream cleaned up');
    
  } catch (error) {
    console.log('❌ Camera restart failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting camera fix tests...');
  
  testStopCamera();
  await testCameraPermissions();
  await testCameraRestart();
  
  console.log('✅ Camera fix tests completed');
}

// Export for manual testing
window.testCameraFix = {
  testStopCamera,
  testCameraPermissions,
  testCameraRestart,
  runAllTests
};

console.log('📋 Camera fix test functions available:');
console.log('- testCameraFix.testStopCamera()');
console.log('- testCameraFix.testCameraPermissions()');
console.log('- testCameraFix.testCameraRestart()');
console.log('- testCameraFix.runAllTests()');