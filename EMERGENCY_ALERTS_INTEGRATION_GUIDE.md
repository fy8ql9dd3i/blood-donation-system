# 🚨 Emergency Alert System - Complete Integration Guide

## Overview
This document outlines the complete real-time emergency alert broadcast system that connects the blood donation mobile app with the backend via WebSocket (Socket.io).

## What's Been Fixed

### ✅ Backend Changes

#### 1. **Socket.io Enhancement** (`backend/sockets/socket.js`)
- Added real-time connection management
- Implemented donor registration system
- Support for blood type room subscriptions
- Proper connection/disconnection handling
- Connection tracking for monitoring

**Key Features:**
```javascript
- register_donor: Registers donor with socket for real-time alerts
- join_blood_type_room: Allows donors to join specific blood type alerts
- connection_success: Confirms successful connection
- disconnect: Handles cleanup on disconnect
```

#### 2. **Notification Controller Updates** (`backend/controllers/notification.controller.js`)
- **broadcastEmergency()**: Enhanced with Socket.io real-time delivery
  - Creates notifications in database
  - Emits `emergency_alert` to all connected donors with matching blood type
  - Falls back to push notifications if socket unavailable
  - Background processing for multiple donors
  
- **broadcastNearest()**: New proximity-based emergency broadcast
  - Filters donors within radius of hospital
  - Emits real-time socket events
  - Includes distance information
  - Falls back to push/email/SMS

**Broadcast Payload:**
```json
{
  "id": "notification-uuid",
  "donorId": 123,
  "title": "🚨 Emergency Blood Request",
  "message": "Emergency message text",
  "type": "EMERGENCY",
  "urgency": "high",
  "bloodType": "O+",
  "read": false,
  "response": "PENDING",
  "createdAt": "2026-05-28T10:30:00Z",
  "timestamp": "2026-05-28T10:30:00Z"
}
```

### ✅ Mobile App Changes

#### 1. **Dependencies Added** (`pubspec.yaml` - both apps)
```yaml
socket_io_client: ^2.0.1        # Real-time WebSocket client
firebase_messaging: ^15.0.0     # Push notifications
firebase_core: ^3.0.0           # Firebase core
```

#### 2. **Notification Service Enhancement** (`lib/services/notification_service.dart`)
- Socket.io connection initialization
- Real-time emergency alert listener
- Callback registration system
- Connection state management

**Key Methods:**
```dart
// Initialize socket connection
static Future<void> initializeSocket(int donorId)

// Register callback for alerts
static void onEmergencyAlert(Function(NotificationModel) callback)

// Disconnect socket
static void disconnect()

// Check connection status
static bool isConnected()
```

#### 3. **Storage Service Extension** (`lib/services/storage_service.dart`)
- Added `saveDonorId()`: Persist donor ID for socket registration
- Added `getDonorId()`: Retrieve donor ID for socket connection
- Enables automatic socket reconnection on app restart

#### 4. **Emergency Screen Enhancement** (`lib/screens/emergency_screen.dart`)
- Socket initialization on screen load
- Real-time emergency alert reception
- Live UI updates when alerts arrive
- Connection status indicator in AppBar
- Local notification popup when alert received
- Graceful disconnect on screen exit

**New Features:**
- Green checkmark icon when connected
- Yellow spinner when connecting
- Automatic alert insertion at top of list
- Pop-up notification with alert details
- No duplicates handling

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MOBILE APP                             │
├─────────────────────────────────────────────────────────────┤
│  Emergency Screen                                             │
│  ├─ Socket Listener (Real-time alerts)                       │
│  ├─ HTTP Fetch (Initial notifications)                       │
│  └─ UI State Management                                      │
│                                                               │
│  Notification Service                                        │
│  ├─ Socket.io Client Connection                              │
│  ├─ Event Handlers                                           │
│  └─ Emergency Alert Callbacks                                │
│                                                               │
│  Storage Service                                             │
│  ├─ Donor ID Persistence                                     │
│  └─ Token Management                                         │
└─────────────────────────────────────────────────────────────┘
                            ↑↓ Socket.io
                    (WebSocket + Fallback)
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                          │
├─────────────────────────────────────────────────────────────┤
│  Socket.io Server                                            │
│  ├─ Connection Pool                                          │
│  ├─ Donor Registration                                       │
│  ├─ Room Management (blood types)                            │
│  └─ Real-time Broadcast Rooms                                │
│                                                               │
│  Notification Controller                                     │
│  ├─ broadcastEmergency()                                     │
│  ├─ broadcastNearest()                                       │
│  ├─ Database Persistence                                     │
│  └─ Push Notification Fallback                               │
│                                                               │
│  Services                                                    │
│  ├─ Push Service (Firebase)                                  │
│  ├─ Email Service                                            │
│  ├─ SMS Service                                              │
│  └─ Map Service (Distance calc)                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Checklist

### Backend Setup
- [x] Enhanced Socket.io with donor registration
- [x] Updated broadcastEmergency() with socket events
- [x] Updated broadcastNearest() with socket events
- [x] Response handling for ACCEPTED/DECLINED
- [x] Fallback to push notifications

### Mobile App Setup
- [x] Added socket_io_client dependency
- [x] Enhanced NotificationService with socket support
- [x] Added getDonorId() to StorageService
- [x] Updated EmergencyScreen with real-time listeners
- [x] Added connection status indicator
- [x] Implemented local notification popups

### Testing Required
- [ ] Emergency broadcast to all donors
- [ ] Proximity broadcast to nearby donors
- [ ] Accept/Decline response handling
- [ ] Socket reconnection after disconnect
- [ ] Push notification fallback
- [ ] Multiple alert handling (no duplicates)

## API Endpoints

### Broadcast Emergency (Blood Type)
```
POST /api/notifications/broadcast
{
  "bloodType": "O+",           // or "ALL" for universal
  "message": "Custom message",
  "hospitalName": "Hospital XYZ",
  "urgency": "high"
}
```

### Broadcast Nearest (Radius)
```
POST /api/notifications/broadcast-nearest
{
  "bloodType": "O+",
  "hospitalId": 1,
  "radiusKm": 50,
  "message": "Custom message"
}
```

### Respond to Emergency
```
POST /api/notifications/respond/:notificationId
{
  "response": "ACCEPTED"  // or "DECLINED"
}
```

## Socket Events

### Client → Server
```javascript
// Register donor on connection
emit('register_donor', donorId)

// Join blood type room (optional)
emit('join_blood_type_room', 'O+')
```

### Server → Client
```javascript
// Emergency alert received
on('emergency_alert', (alertData) => {})

// Connection confirmed
on('connection_success', (data) => {})

// Handle disconnection
on('disconnect', () => {})

// Handle errors
on('error', (error) => {})
```

## Environment Configuration

### Backend (`Server.js`)
```javascript
const { initSocket } = require("./sockets/socket");
// Socket initialized when server starts with HTTP listener
```

### Frontend (`api_constants.dart`)
```dart
// Make sure baseUrl is correctly pointing to backend
static const String baseUrl = 'http://your-backend-url:5000/api';
```

## Database Schema

### Notification Model
```sql
CREATE TABLE "Notifications" (
  "id" UUID PRIMARY KEY DEFAULT uuid_v4(),
  "donorId" INTEGER NOT NULL REFERENCES "donors"("donorID"),
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "type" ENUM('EMERGENCY', 'REMINDER', 'GENERAL') DEFAULT 'GENERAL',
  "read" BOOLEAN DEFAULT false,
  "language" VARCHAR(5) DEFAULT 'en',
  "response" ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'NO_RESPONSE') DEFAULT 'PENDING',
  "responseDate" TIMESTAMP NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Socket Connection Failures
- Automatic retry with exponential backoff
- Falls back to HTTP polling if WebSocket unavailable
- Graceful degradation to push notifications

### Notification Failures
- Each delivery method retried independently
- Priority: Socket → Push → Email → SMS
- Failed attempts logged for monitoring

### Response Validation
- Only PENDING notifications can be responded to
- Double response prevention in database
- Timestamp validation for response ordering

## Performance Optimization

### Broadcast Optimization
- Fire-and-forget pattern for large donor lists
- Background processing prevents API timeout
- Database persistence before notification delivery
- Async push notification dispatch

### Connection Management
- Connection pooling at socket level
- Automatic cleanup on disconnect
- Memory-efficient room management
- Donor tracking with Map structure

### Database
- Indexed queries on donorId and type
- Pagination support for notification fetching
- Efficient distance calculations using Google Maps API

## Troubleshooting

### Alerts Not Received
1. Check socket connection status in app UI
2. Verify donorId is correctly saved in storage
3. Check backend logs for broadcast events
4. Verify donor notification consent flag

### Slow Delivery
1. Check network latency
2. Monitor backend server load
3. Review push notification service status
4. Check database query performance

### Duplicate Alerts
1. Verify notification ID handling in app
2. Check for multiple socket connections
3. Review refresh triggering logic

## Migration from Old System

### If Coming from HTTP-Only Polling
1. Keep existing HTTP endpoints active
2. Add socket support alongside
3. Gradually migrate clients to socket
4. Monitor both systems in parallel
5. Phase out HTTP once stable

## Security Considerations

### Authentication
- Socket connection requires valid donor registration
- Token validation on every broadcast
- Hospital staff can only broadcast from their institution

### Data Privacy
- Notification consent respected
- No personally identifiable information in logs
- Encrypted push notification payloads

### Rate Limiting
- Broadcast frequency limits per hospital
- Max alerts per hour per donor
- DDoS protection on socket connections

## Future Enhancements

1. **Alert Scheduling**: Schedule broadcasts for specific times
2. **Advanced Filtering**: Blood type + age + medical conditions
3. **Two-Way Chat**: Direct communication with donors
4. **Analytics Dashboard**: Real-time broadcast metrics
5. **A/B Testing**: Different message variants
6. **AI-Powered Targeting**: ML-based donor selection

## Support & Debugging

### Enable Debug Logging
```dart
// In notification_service.dart
print('[Socket] Connected to server');  // Already enabled

// Backend logging
console.log('[Socket] Donor registered:', donorId);
console.log('[Emergency Broadcast] Starting to ${donors.length} donors...');
```

### Test Socket Connection
```bash
# From mobile app
NotificationService.isConnected()  // Returns true if connected

# From backend
io.engine.clientsCount  // Number of connected clients
```

## Documentation Files

- 📄 [EMERGENCY_DONOR_FINDER_GUIDE.md](./EMERGENCY_DONOR_FINDER_GUIDE.md)
- 📄 [HOSPITAL_EMERGENCY_QUICK_START.md](./HOSPITAL_EMERGENCY_QUICK_START.md)
- 📄 [EMERGENCY_IMPLEMENTATION_SUMMARY.md](./EMERGENCY_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated**: May 28, 2026
**Status**: ✅ Fully Integrated
**Version**: 2.0 (Real-time Socket.io)
