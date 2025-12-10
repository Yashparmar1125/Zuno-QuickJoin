# 🧪 Testing Guide for Zuno Video Conferencing

## Testing Multiple Participants on a Single Device

Since you only have one camera, here are several ways to test the video conferencing features with multiple participants:

### Method 1: Multiple Browser Windows/Profiles (Recommended)

**Using Different Browsers:**
1. Open Chrome and log in as User 1
2. Open Firefox/Edge and log in as User 2 (or use a different account)
3. Both browsers can use the same camera simultaneously
4. Join the same meeting from both browsers

**Using Browser Profiles:**
1. Chrome: Create multiple profiles (Settings → People → Add person)
2. Each profile acts as a separate browser instance
3. Log in with different accounts in each profile
4. Join the same meeting from each profile

**Using Incognito/Private Windows:**
1. Open a regular Chrome window and log in as User 1
2. Open an Incognito window (Ctrl+Shift+N) and log in as User 2
3. Both can use the camera and join the same meeting

### Method 2: Multiple Devices

**Using Your Phone/Tablet:**
1. Connect your phone to the same WiFi network
2. Access the app on your phone (e.g., `http://YOUR_IP:5173`)
3. Log in with a different account
4. Join the same meeting

**Finding Your Local IP:**
- Windows: Run `ipconfig` in CMD, look for IPv4 Address
- Mac/Linux: Run `ifconfig` or `ip addr`
- Use this IP instead of `localhost` (e.g., `http://192.168.1.100:5173`)

### Method 3: Browser Developer Tools (Simulate Devices)

**Chrome DevTools:**
1. Open DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Select a device (iPhone, iPad, etc.)
4. This creates a separate "device" that can join meetings
5. Note: Still limited to one camera, but useful for UI testing

### Method 4: Virtual Camera/Webcam Simulator

**Using OBS Virtual Camera:**
1. Install [OBS Studio](https://obsproject.com/)
2. Add a video source (image, video file, or screen capture)
3. Start Virtual Camera in OBS
4. In your browser, select "OBS Virtual Camera" as the camera
5. You can create multiple virtual cameras for testing

**Using ManyCam or Similar:**
1. Install a virtual webcam software (ManyCam, DroidCam, etc.)
2. Configure multiple virtual cameras
3. Each browser window can use a different virtual camera

### Method 5: Network Testing Setup

**Setup for Local Network Testing:**

1. **Backend Configuration:**
   ```javascript
   // Backend/app.js - Add your local IP to allowedOrigins
   export const allowedOrigins = [
     "http://localhost:5173",
     "http://YOUR_LOCAL_IP:5173",  // Add this
     // ... other origins
   ];
   ```

2. **Frontend Configuration:**
   ```javascript
   // Frontend/src/lib/api.js
   const api = axios.create({
     baseURL: "http://YOUR_LOCAL_IP:5000/api",  // Use your IP
     // ...
   });
   ```

3. **Access from Other Devices:**
   - Phone/Tablet: `http://YOUR_LOCAL_IP:5173`
   - Another Computer: `http://YOUR_LOCAL_IP:5173`

### Method 6: Quick Testing Checklist

**Single User Testing (What You Can Test Alone):**
- ✅ Meeting creation
- ✅ Dashboard functionality
- ✅ Meeting settings
- ✅ Chat functionality (send messages to yourself)
- ✅ Screen sharing
- ✅ Mute/unmute controls
- ✅ Video on/off
- ✅ Participant list (you'll see yourself)
- ✅ Meeting details page
- ✅ Feedback submission

**Multi-User Testing (Requires Multiple Participants):**
- ✅ WebRTC peer connections
- ✅ Multiple video streams
- ✅ Real-time chat between users
- ✅ Participant join/leave events
- ✅ Media state synchronization
- ✅ Focus/presenter view with multiple users

### Method 7: Automated Testing Script

Create a simple test script to simulate multiple users:

```javascript
// test-multiple-users.js
// This can help test the backend without needing multiple browsers

const axios = require('axios');
const io = require('socket.io-client');

async function simulateUser(userId, meetingId) {
  // Simulate user joining meeting
  const socket = io('http://localhost:5000', {
    auth: { token: `test-token-${userId}` }
  });
  
  socket.on('connect', () => {
    socket.emit('join-meeting', { meetingId });
    console.log(`User ${userId} joined meeting ${meetingId}`);
  });
}

// Simulate 3 users
simulateUser(1, 'TEST123');
simulateUser(2, 'TEST123');
simulateUser(3, 'TEST123');
```

### Method 8: Using ngrok for Remote Testing

If you want to test with friends/colleagues remotely:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com/
   ```

2. **Expose Frontend:**
   ```bash
   ngrok http 5173
   ```

3. **Expose Backend:**
   ```bash
   ngrok http 5000
   ```

4. **Update CORS in Backend:**
   ```javascript
   // Add ngrok URLs to allowedOrigins
   export const allowedOrigins = [
     "http://localhost:5173",
     "https://your-ngrok-url.ngrok.io",  // Add this
   ];
   ```

5. **Share ngrok URL** with testers

## Recommended Testing Workflow

1. **Start with Single User Testing:**
   - Test all UI components
   - Test meeting creation
   - Test dashboard features
   - Test feedback system

2. **Move to Multi-User Testing:**
   - Use Method 1 (Multiple browsers/profiles) for quick testing
   - Use Method 2 (Multiple devices) for realistic testing
   - Use Method 4 (Virtual cameras) for camera-specific testing

3. **Network Testing:**
   - Test on local network with multiple devices
   - Test with ngrok for remote participants

## Troubleshooting Multi-User Testing

**Issue: Can't see other participant's video**
- Check WebRTC connection in browser console
- Verify Socket.IO connection is established
- Check if STUN server is accessible

**Issue: Audio not working**
- Check browser permissions
- Verify microphone is not being used by another application
- Check browser audio settings

**Issue: Can't join from another device**
- Verify both devices are on same network
- Check firewall settings
- Verify backend CORS allows your IP
- Check backend is accessible from other devices

## Quick Test Commands

```bash
# Start backend
cd Backend
npm run dev

# Start frontend (in another terminal)
cd Frontend
npm run dev

# Test on localhost
# Open http://localhost:5173 in Chrome
# Open http://localhost:5173 in Firefox (or Chrome Incognito)
# Log in with different accounts
# Create/join same meeting
```

## Best Practices

1. **Use Different Accounts**: Create multiple test accounts for realistic testing
2. **Test on Real Devices**: Use actual phones/tablets for mobile testing
3. **Test Network Conditions**: Test with different network speeds
4. **Test Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge
5. **Test Permissions**: Test camera/microphone permission flows

---

**Need Help?** Check the main README.md for setup instructions or open an issue on GitHub.

