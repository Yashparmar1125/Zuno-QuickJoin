# 🎥 Zuno – Video Conferencing Platform

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-Real--Time-333333?style=for-the-badge&logo=webrtc&logoColor=white)

</div>

> 🌟 Crystal-clear, secure video calls that just work. Fast joins, HD video, and browser-native simplicity.

## 📚 Overview

Zuno is a modern, full-stack video conferencing platform that provides real-time video/audio calls, screen sharing, chat, and meeting management. It combines a beautiful React frontend with a secure Node.js/Express backend, Firebase authentication, Socket.IO for real-time signaling, and WebRTC for peer-to-peer communication.

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎥 Video Conferencing
- 📹 HD video calls with multiple participants  
- 🎤 Audio controls (mute/unmute)  
- 📺 Screen sharing capabilities  
- 👥 Participant management  
- 🎯 Focus/Presenter view  
- 📱 Responsive design for all devices  

### 💬 Real-Time Communication
- 💬 In-meeting chat  
- 👥 Live participant list  
- 📊 Meeting statistics  
- 🔔 Real-time notifications  
- 📡 WebRTC peer-to-peer connections  

</td>
<td width="50%">

### 🏠 Meeting Management
- ➕ Create meetings with custom settings  
- 📋 Meeting details and history  
- 📊 Dashboard with meeting statistics  
- 🔍 Recent meetings list  
- 🗑️ Delete/archive meetings  
- ⚙️ Customizable meeting settings  

### 🔐 Authentication & Security
- 🔑 Firebase Authentication  
- 📧 Email/Password login  
- 🔵 Google Sign-In  
- 🛡️ Secure token verification  
- 👤 User profiles with avatars  

</td>
</tr>
</table>

## 🛠️ Tech Stack

<details>
<summary><b>🔷 Frontend Technologies</b></summary>

- ⚛️ **React 18** – Component-based UI  
- ⚡ **Vite 7** – Fast dev server and build tool  
- 🎨 **Tailwind CSS 3** – Utility-first styling  
- 🛣️ **React Router 7** – Client-side routing  
- 🔥 **Firebase Client SDK** – Authentication  
- 📡 **Socket.IO Client** – Real-time signaling  
- 🌐 **Axios** – HTTP client for API calls  
- 🎨 **Lucide React** – Beautiful icon library  
- 📹 **WebRTC** – Peer-to-peer video/audio  

</details>

<details>
<summary><b>🔷 Backend Technologies</b></summary>

- 🟢 **Node.js 20** – Runtime environment  
- 🚂 **Express.js 5** – HTTP server and routing  
- 🍃 **MongoDB** – Primary datastore (users, meetings, feedback)  
- 🔥 **Firebase Admin SDK** – Token verification  
- 📡 **Socket.IO** – Real-time signaling for WebRTC  
- 🔐 **JWT** – Legacy token support  
- 🧰 **Nodemon** – Development auto-reload  

</details>

<details>
<summary><b>🧩 Features & Integrations</b></summary>

- 🎥 **WebRTC** – Peer-to-peer video/audio communication  
- 💬 **Real-time Chat** – Socket.IO-based messaging  
- 📊 **Meeting Analytics** – Statistics and feedback system  
- 🎨 **Modern UI/UX** – Clean, responsive design  
- 🔄 **Auto-reconnection** – Robust connection handling  

</details>

## 📁 Project Structure

```ascii
Video-Conferencing-App/
├── 📱 Frontend/                    # React + Vite Frontend
│   ├── src/
│   │   ├── 🧩 components/          # Header, Footer, ProtectedRoute
│   │   ├── 📄 pages/              # LandingPage, Dashboard, MeetingRoom, MeetingDetails, CallEnded
│   │   ├── 🧠 context/            # AuthContext
│   │   ├── 🛰️ services/           # auth, feedback, firebaseAuth
│   │   ├── 📚 lib/                # api, socket, firebase
│   │   ├── ⚛️ App.jsx
│   │   └── 🚀 main.jsx
│   ├── 🌐 public/                 # Static assets (logos, images)
│   └── 📦 package.json
│
├── ⚙️ Backend/                     # Node.js + Express Backend
│   ├── 📊 Models/                 # User, Meeting, Feedback
│   ├── 🧠 controllers/            # user, meeting, feedback, health
│   ├── 🛣️ routes/                # API endpoints
│   ├── 🛡️ middleware/            # Authentication middleware
│   ├── ⚙️ config/                # Database, Firebase Admin, config
│   ├── 📡 Socket/                 # Socket.IO server setup
│   ├── 🔐 Secrets/                # ServiceAccount.json
│   └── 🚀 server.js               # Server entrypoint
│
└── 📝 README.md
```

## 🏗️ Architecture & Flows

### 🌐 System Overview

Zuno is composed of:

- **Frontend (SPA)** – React app served by Vite, connects to REST APIs and Socket.IO  
- **API Server** – Node.js + Express app exposing `/api/*` endpoints  
- **Real-Time Layer** – Socket.IO server for WebRTC signaling and chat  
- **Data Layer** – MongoDB for users, meetings, and feedback  
- **Auth Layer** – Firebase Authentication (client) + Firebase Admin (server)  

```ascii
[ React SPA ]  <--HTTP/WS-->  [ Express + Socket.IO ]  <--->  [ MongoDB ]
      |                                   |
      |                                   |
      '---------- Firebase Auth ----------'
      |                                   |
      '---------- WebRTC P2P ------------'
```

### 🧩 Frontend Architecture

- **Pages**:
  - `LandingPage` – Home page with meeting creation/join and auth modals
  - `Dashboard` – User dashboard with stats, recent meetings, and quick actions
  - `MeetingRoom` – Main video conferencing interface with WebRTC
  - `MeetingDetails` – Detailed view of past meetings
  - `CallEnded` – Post-meeting feedback form
- **Components**:
  - `Header` – Navigation and user profile
  - `Footer` – Application footer
  - `ProtectedRoute` – Route protection wrapper
- **Services**:
  - `auth.js` – User authentication API calls
  - `feedback.js` – Feedback submission and retrieval
  - `firebaseAuth.js` – Firebase client SDK wrappers
- **Context**:
  - `AuthContext` – Global authentication state management

### ⚙️ Backend Architecture

- **Routes** (`routes/`):
  - `user.routes.js` – Authentication, profile management
  - `meeting.routes.js` – Meeting CRUD operations
  - `feedback.routes.js` – Feedback submission and statistics
  - `health.routes.js` – Health checks
- **Controllers** (`controllers/`):
  - Handle HTTP requests, validate inputs, interact with models
  - Emit Socket.IO events for real-time updates
- **Models** (`Models/`):
  - `User` – User accounts with Firebase integration
  - `Meeting` – Meeting data with settings and participants
  - `Feedback` – User feedback and ratings
- **Socket.IO** (`Socket/socket.server.js`):
  - WebRTC signaling (offer/answer/ICE candidates)
  - Real-time chat messages
  - Media state updates (mute/video)
  - User join/leave events

### 🔐 Authentication Flow

1. **User signs in** with Firebase (email/password or Google)
2. Client obtains Firebase ID token
3. For **REST APIs**:
   - Client includes `Authorization: Bearer <firebaseToken>` header
   - `auth.middleware.js` verifies token via Firebase Admin
   - Backend creates/updates local user record
4. For **WebSockets**:
   - Client connects with `auth: { token: <firebaseToken> }`
   - Socket server verifies token and attaches user to socket

### ⚡ WebRTC Meeting Flow

**Joining a Meeting**

1. User navigates to `/meeting/:meetingId`
2. Frontend requests camera/microphone permissions
3. Client connects to Socket.IO server with authentication
4. Client emits `join-meeting` event
5. Server broadcasts `user-joined` to other participants
6. Peers exchange WebRTC offer/answer/ICE candidates via Socket.IO
7. Direct peer-to-peer connections established

**During Meeting**

- **Chat**: Messages sent via Socket.IO `chat-message` event
- **Media Control**: Mute/video toggle updates sent via `media-state` event
- **Screen Share**: Video track replaced with screen capture
- **Participant List**: Real-time updates via Socket.IO events

**Leaving Meeting**

1. User clicks "Leave Meeting"
2. All peer connections closed
3. Socket.IO disconnects
4. Redirects to `CallEnded` page with feedback form

## 🚀 Getting Started

### ⚙️ Prerequisites

- 💻 Node.js (v18 or higher)
- 🍃 MongoDB instance (local or cloud)
- 🔥 Firebase project with Authentication enabled
- 📦 Firebase Service Account JSON file

### 🎨 Frontend Setup (`Frontend/`)

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Configure environment
# Create .env file with:
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# VITE_FIREBASE_PROJECT_ID=your_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# VITE_FIREBASE_APP_ID=your_app_id

# Start development server
npm run dev
```

### ⚙️ Backend Setup (`Backend/`)

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Configure environment
# Create .env file with:
# PORT=5000
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
# JWT_EXPIRE=15m
# JWT_REFRESH_SECRET=your_refresh_secret
# JWT_REFRESH_EXPIRE=7d

# Place Firebase Service Account JSON in:
# Backend/Secrets/ServiceAccount.json

# Start server
npm run dev
```

## 🔑 Environment Variables

<details>
<summary><b>🎨 Frontend (.env)</b></summary>

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

</details>

<details>
<summary><b>⚙️ Backend (.env)</b></summary>

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zuno
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=7d
```

**Firebase Service Account**: Place `ServiceAccount.json` in `Backend/Secrets/ServiceAccount.json`

</details>

## 📝 API Routes

| Route prefix              | Description                                              |
|---------------------------|----------------------------------------------------------|
| 🔐 `/api/users`           | Authentication, profile, token refresh                  |
| 🎥 `/api/meetings`        | Meeting CRUD, recent meetings, meeting details          |
| 💬 `/api/feedback`        | Feedback submission, statistics, user feedback history |
| ❤️ `/api/health`          | Health checks                                            |

### 🔐 User Routes

- `POST /api/users/register` – Register new user
- `POST /api/users/login` – Login user
- `GET /api/users/me` – Get current user (protected)
- `POST /api/users/refresh` – Refresh access token
- `POST /api/users/logout` – Logout user
- `POST /api/users/change-password` – Change password (protected)
- `POST /api/users/forgot-password` – Request password reset
- `POST /api/users/reset-password/:token` – Reset password

### 🎥 Meeting Routes

- `POST /api/meetings/create` – Create new meeting (protected)
- `GET /api/meetings/recent` – Get recent meetings (protected)
- `GET /api/meetings/:meetingId` – Get meeting details
- `DELETE /api/meetings/:meetingId` – Delete meeting (protected, host only)

### 💬 Feedback Routes

- `POST /api/feedback/submit` – Submit meeting feedback (protected)
- `GET /api/feedback/meeting/:meetingId` – Get meeting feedback (protected)
- `GET /api/feedback/stats/:meetingId` – Get feedback statistics (protected, host only)
- `GET /api/feedback/user` – Get user's feedback history (protected)

## 🎯 Key Features Explained

### 🎥 Video Conferencing

- **WebRTC P2P**: Direct peer-to-peer connections for low latency
- **Screen Sharing**: Share entire screen or application window
- **Media Controls**: Toggle camera/microphone with real-time updates
- **Focus View**: Enlarge active speaker or presenter
- **Responsive Grid**: Dynamic layout based on participant count

### 📊 Dashboard

- **Meeting Statistics**: View hosted/joined meeting counts
- **Recent Meetings**: Quick access to past meetings with details
- **Quick Actions**: Create meeting, view details, delete meetings
- **Meeting Form**: Configure meeting settings before starting

### 💬 Real-Time Chat

- **In-Meeting Chat**: Text messaging during calls
- **Participant List**: See all participants with status indicators
- **Notifications**: Toast notifications for important events

### 📝 Feedback System

- **Post-Meeting Feedback**: Rate call quality and provide comments
- **Statistics**: Hosts can view aggregated feedback data
- **History**: Users can view their feedback history

## 🎨 UI/UX Highlights

- **Modern Design**: Clean, light theme with consistent color scheme
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Micro-interactions and transitions
- **Accessibility**: Keyboard navigation and screen reader support
- **Visual Feedback**: Color-coded status indicators (muted, speaking, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check that backend is running on correct port
   - Verify CORS settings in `Backend/app.js`
   - Ensure Socket.IO URL matches backend URL

2. **Firebase Authentication Errors**
   - Verify Firebase project ID matches in frontend and backend
   - Check Service Account JSON is in correct location
   - Ensure Firebase Authentication is enabled in Firebase Console

3. **Camera/Microphone Not Working**
   - Check browser permissions
   - Ensure HTTPS (or localhost) for getUserMedia
   - Verify WebRTC is supported in browser

4. **Meeting Not Found**
   - Verify meeting ID is correct
   - Check MongoDB connection
   - Ensure meeting exists in database

## 🤝 Contributing

1. 🍴 Fork the repository  
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)  
3. 💾 Commit your changes (`git commit -m "Add some AmazingFeature"`)  
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)  
5. 🔄 Open a Pull Request  

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

**Yash Parmar**  
- 🌐 [GitHub](https://github.com/Yashparmar1125)  
- 💼 [LinkedIn](https://linkedin.com/in/yashparmar1125)  
- 📧 [Email](mailto:yashparmar11y@gmail.com)

## 🙏 Acknowledgments

- 🌟 All contributors who help improve Zuno  
- 💡 Open-source community for libraries and tools  
- 🎨 Design inspiration and UI resources  
- 🔥 Firebase for authentication infrastructure  
- 📡 Socket.IO for real-time communication  

---

<div align="center">
  
### 🌟 Star this repo if you find it helpful! 🌟

**Built with ❤️ using React, Node.js, and WebRTC**

</div>
