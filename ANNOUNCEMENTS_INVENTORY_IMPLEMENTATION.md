# Blood Donation System - Announcements & Inventory Management Implementation

## 📋 Overview
This document describes the complete implementation of:
1. **Admin Announcements/News System** - Posts announcements to mobile app and staff
2. **Blood Inventory Management** - Tracks blood units, checks availability, handles hospital requests
3. **Donor Registration Validation** - Phone and age validation for mobile registration
4. **Real-time Notifications** - Broadcasts announcements to all users

---

## ✨ Features Implemented

### 1. 📢 Admin Announcements System

#### Backend Components
- **Model**: `News` (news.model.js)
  - Title, Content, Image, Language, Author, Active Status
  - Timestamps (created, updated)

- **Controller**: `news.controller.js`
  - `createNews()` - Create new announcement + broadcast
  - `getNews()` - Fetch active announcements (supports language filtering)
  - `deleteNews()` - Soft delete announcements
  - Auto-triggers notification broadcast to all donors

- **Routes**: `/api/news`
  - `GET /news` - Get all announcements (Public)
  - `POST /news` - Create announcement (Admin only)
  - `DELETE /news/:id` - Delete announcement (Admin only)
  - `POST /news/upload` - Upload announcement image (Admin)

#### Frontend Components
- **Admin Panel** (`AnnouncementsPanel.jsx`)
  - Create announcements with title, content, image, language
  - Real-time character counter
  - Image upload with preview
  - List all announcements with delete function
  - Broadcasting info banner

- **Mobile Announcements Page** (`AnnouncementsPage.jsx`)
  - Display all active announcements
  - Language selector (English, Amharic, Afan Oromo)
  - Auto-refresh every 30 seconds
  - Image support
  - "Read more" expand functionality
  - Empty state & error handling

---

### 2. 🩸 Blood Inventory Management System

#### Inventory Tracking
- **Model**: `BloodInventory` (bloodInventory.model.js)
  - Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - Quantity/units
  - Volume (mL)
  - Collection date
  - Expiry date
  - Status (available, allocated, used, expired)
  - Donor reference

#### Inventory Utilities
- **File**: `backend/utils/inventoryManager.js`
  - `checkBloodAvailability(bloodType)` - Check available units/volume
  - `calculateFulfillment(requestedUnits, availableVolume)` - Check if request can be fulfilled
  - `getAllBloodTypeStatus()` - Get status for all blood types
  - `allocateBloodUnits(requestId, bloodType, unitsToAllocate)` - Allocate units to request
  - `getPendingRequests(bloodType)` - Get pending requests for prioritization

#### Blood Request Handling
**Enhanced Blood Request Controller** (`bloodRequest.controller.js`)

When hospital submits blood request:
1. ✅ Validate request details (blood type, units, urgency)
2. ✅ **CHECK INVENTORY AVAILABILITY** (new feature)
3. ✅ Create request record
4. ✅ Calculate fulfillment status:
   - Available units
   - Requested units
   - Shortage percentage
   - Message (sufficient/insufficient stock)
5. ✅ **BROADCAST TO STAFF** via socket + notification
   - Shows inventory availability status
   - Alerts if shortage exists

**Example Response:**
```json
{
  "requestId": 123,
  "bloodType": "O+",
  "unitsRequired": 5,
  "inventoryStatus": {
    "available": true,
    "availableUnits": 8,
    "shortage": 0,
    "shortagePercentage": 0,
    "message": "✅ Sufficient stock available (8 units)"
  }
}
```

#### Inventory Check Endpoints
- **Route**: `/api/blood-inventory/`
  - `GET /dashboard/summary` - Get dashboard summary for all blood types
    ```json
    {
      "summary": [
        {
          "bloodType": "O+",
          "totalUnits": 10,
          "totalVolume": 4500,
          "estimatedDonations": 10,
          "nearExpiry": 2,
          "status": "adequate"
        }
      ],
      "totalBloodUnits": 80,
      "criticalTypes": ["B-"],
      "lowStockTypes": ["AB+"]
    }
    ```

  - `GET /availability/check?bloodType=O+` - Check availability for specific type
    ```json
    {
      "bloodType": "O+",
      "totalUnits": 10,
      "totalVolume": 4500,
      "availableInventory": [...],
      "canFulfill": true
    }
    ```

---

### 3. 📱 Donor Registration with Validation

#### Phone Number Validation
- **Utility**: `backend/utils/phoneValidator.js`
  - Validates Ethiopian phone numbers
  - Format: **09XXXXXXXXX** (10 digits starting with 09)
  - Accepts multiple formats:
    - ✅ `0911234567` (local format)
    - ✅ `+251911234567` (international with +)
    - ✅ `251911234567` (international without +)
    - ✅ `911234567` (missing leading 0)
  - Auto-normalizes to standard format

#### Mobile Registration Features
**Enhanced `MobileRegistration.jsx`**

1. **Real-time Validation**
   - Name: Minimum 2 characters
   - Age: 18-65 years old
   - Phone: Ethiopian format validation
   - Address: Minimum 2 characters

2. **User Feedback**
   - Error messages with helpful hints
   - Field-level error indicators
   - Example formats shown
   - Success/failure messages with emojis

3. **Donor Info Displayed**
   - First-time vs returning donor
   - Previous donation count
   - Days since last donation (if applicable)
   - Age eligibility check

---

## 🔔 Notification System

### Notification Types
1. **Announcement Broadcasts**
   - Triggered when admin posts news
   - Sent to all donors
   - Respects notification consent

2. **Blood Request Alerts**
   - When hospital requests blood
   - Shows inventory availability
   - Emergency alerts if shortage

3. **Hero Notifications**
   - When donor's blood is used
   - Thanks them for life-saving contribution
   - Shows hospital name

### Notification Channels
- ✅ Push notifications (mobile app)
- ✅ Email notifications
- ✅ In-app notifications
- ✅ Real-time socket.io events

---

## 📊 Dashboard Summary for Staff

Shows current inventory status:
```
Blood Type | Units | Volume | Status      | Near Expiry
O+         | 10    | 4500mL | Adequate    | 2
O-         | 3     | 1350mL | Low         | 1
A+         | 8     | 3600mL | Adequate    | 0
...
Critical:  B- (0 units)
Low Stock: AB+ (2 units)
```

---

## 🚀 Usage Examples

### 1. Admin Posts Announcement
```
Admin navigates to: /admin/announcements
- Fills title: "Blood Drive This Weekend!"
- Fills content: "Join us for blood donation..."
- Selects language: English
- Uploads image
- Clicks "Publish Announcement"

Result:
✅ Announcement saved to database
✅ All donors receive push notification
✅ Mobile app shows new announcement
✅ Staff notified
```

### 2. Hospital Requests Blood
```
Hospital staff navigates to: Blood Request Form
- Patient Name: "John Doe"
- Blood Type: "O+"
- Units Required: 5
- Urgency: Emergency

System Response:
✅ Checks inventory for O+ blood
✅ Finds 8 units available
✅ Creates request (PENDING)
✅ Notifies blood bank staff:
   "Hospital ABC requesting 5 units O+. Stock: 8 available ✅"
```

### 3. Donor Registers via Mobile
```
Donor navigates to: /register
- Name: "Abebe Kebede"
- Age: "28"
- Phone: "0911234567" (auto-normalized)
- Address: "Addis Ababa"
- Clicks "Register Me"

System:
✅ Validates phone (09XXXXXXXXX format)
✅ Validates age (18-65)
✅ Checks if already registered
✅ Success message: "Visit lab for blood type testing"
```

---

## 📱 Mobile App Features

### Donor Mobile App
1. **Announcements Page** (`/announcements`)
   - Real-time news feed
   - Language support
   - Auto-refresh
   - Images & content display

2. **Registration** (`/register`)
   - Phone validation (Ethiopian format)
   - Age verification (18-65)
   - Form validation
   - Success/error messaging

3. **Dashboard**
   - View active announcements
   - Donation history
   - Upcoming drives
   - Notifications

---

## 👨‍💼 Staff/Admin Interface

### Blood Bank Staff
1. **Inventory Dashboard**
   - View all blood types stock
   - Check expiry dates
   - Critical/low stock alerts
   - Volume calculations

2. **Blood Requests**
   - View incoming requests (sorted by urgency)
   - Check inventory before fulfilling
   - Allocate blood units
   - Dispatch to hospital

3. **Announcements**
   - Create news/updates
   - Upload images
   - Multi-language support
   - Broadcast to all users

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN ANNOUNCEMENT                        │
│                    Fills news form                            │
│                    + image upload                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │  News Controller           │
        │  - Saves to database       │
        │  - Validates content       │
        └────────┬───────────────────┘
                 │
        ┌────────┴─────────────────────────┐
        ↓                                   ↓
    MOBILE APP                          STAFF
    Shows Announcements                 Gets Notification
    (Auto-refresh 30s)                 (Real-time)
```

```
┌─────────────────────────────────────────────────────────────┐
│                    HOSPITAL REQUEST                          │
│            Submits blood request (5 units O+)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │ Blood Request Controller   │
        │ 1. Validate request        │
        │ 2. Check inventory         │
        │ 3. Calculate fulfillment   │
        │ 4. Notify staff            │
        └────────┬───────────────────┘
                 │
        ┌────────┴──────────────────────────┐
        ↓                                    ↓
    STAFF SEES:                        RESPONSE:
    "O+ needed: 5 units"              {
    "Available: 8 units ✅"            "availableUnits": 8,
    "Emergency!"                       "shortage": 0,
                                       "canFulfill": true
                                       }
```

---

## 🔐 Access Control

| Feature | Admin | Blood Bank | Hospital | Donor |
|---------|-------|-----------|----------|-------|
| Create Announcement | ✅ | ✅ | ❌ | ❌ |
| View Announcements | ✅ | ✅ | ✅ | ✅ |
| Check Inventory | ✅ | ✅ | ❌ | ❌ |
| Submit Blood Request | ❌ | ❌ | ✅ | ❌ |
| Register Donor | ❌ | ❌ | ❌ | ✅ |

---

## ⚙️ Configuration

### Environment Variables
```
NOTIFICATION_CONSENT_REQUIRED=true
AUTO_BROADCAST_ANNOUNCEMENTS=true
INVENTORY_UNIT_SIZE_ML=450
BLOOD_EXPIRY_DAYS=42
MOBILE_REFRESH_INTERVAL=30000
```

### Database Schema
All models properly configured in Sequelize with relationships:
- Donor ←→ BloodInventory (donor's blood units)
- Hospital ←→ BloodRequest (hospital requests)
- BloodRequest ←→ BloodInventory (allocated units)
- News ←→ Notification (broadcast tracking)

---

## ✅ Testing Checklist

- [ ] Admin can create announcement
- [ ] Announcement appears on mobile app
- [ ] Phone validation works (09XXXXXXXXX format)
- [ ] Age validation (18-65)
- [ ] Hospital request triggers inventory check
- [ ] Staff gets notification with inventory status
- [ ] Announcements auto-refresh on mobile
- [ ] Language selection works
- [ ] Image upload for announcements
- [ ] Inventory dashboard shows all blood types
- [ ] Critical/low stock alerts work
- [ ] Notifications sent to all users

---

## 📚 API Reference

### Announcements Endpoints
```
GET  /api/news                    # Get all announcements
POST /api/news                    # Create announcement (Admin)
DELETE /api/news/:id              # Delete announcement (Admin)
POST /api/news/upload             # Upload image (Admin)
```

### Inventory Endpoints
```
GET  /api/blood-inventory/dashboard/summary          # Dashboard summary
GET  /api/blood-inventory/availability/check         # Check availability
POST /api/blood-inventory                            # Add/update stock
GET  /api/blood-inventory/alerts                     # Get expiry alerts
```

### Donor Registration
```
POST /api/donors/register         # Register new donor
GET  /api/donors/phone/:phone     # Check existing donor
```

### Blood Requests
```
POST /api/blood-request                             # Submit request
GET  /api/blood-request                             # Get all requests
PATCH /api/blood-request/:id/status                # Update status
```

---

## 🎯 Performance Optimizations

1. **Mobile Announcements**
   - Auto-refresh every 30 seconds (configurable)
   - Only fetch active announcements
   - Cache results with React Query

2. **Inventory Checks**
   - Only validate non-expired stock
   - FIFO allocation (expire soonest first)
   - Atomic updates to prevent race conditions

3. **Notifications**
   - Batch broadcasts for efficiency
   - Skip if donor consent not given
   - Parallel send (email + push simultaneously)

---

## 🚀 Future Enhancements

1. SMS notifications for critical alerts
2. Email digest of daily announcements
3. Inventory forecasting based on donation rates
4. Donor scheduling for blood drives
5. Staff shift management for availability
6. Analytics dashboard with usage statistics
7. Integration with payment systems
8. Barcode scanning for blood units

---

**Last Updated**: May 28, 2026
**Version**: 1.0
**Status**: ✅ Complete
