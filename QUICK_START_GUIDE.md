# 🚀 Quick Start Guide - Announcements & Inventory System

## 📢 For Admins: Posting Announcements

### Step 1: Navigate to Announcements Panel
```
URL: http://localhost:3000/admin/announcements
OR
URL: http://localhost:3000/staff/announcements
```

### Step 2: Fill Announcement Form
```
Title:     "Blood Drive This Weekend!"
Content:   "We're hosting a blood donation drive..."
Language:  English (or Amharic/Oromo)
Image:     (Optional) Upload a picture
```

### Step 3: Click "Publish Announcement"
- Announcement saved to database
- ✅ **All mobile app users get notification**
- ✅ **All staff members get notification**
- Appears in news feed within 30 seconds

---

## 📱 For Donors: Registering on Mobile

### Step 1: Visit Registration Page
```
URL: http://localhost:3000/register
Mobile App: Tap "Register" button
```

### Step 2: Fill Registration Form
```
Full Name:     John Abebe
Age:           28
Phone Number:  0911234567  (or +251911234567)
Address:       Addis Ababa, Kolfe
```

### Step 3: Click "Register Me"
System validates:
- ✅ Phone: 09XX-XXXX-XXX format (10 digits)
- ✅ Age: 18-65 years old
- ✅ Name & Address: Not empty

**Success Message**: "Visit lab for blood type testing"

---

## 📋 For Hospital Staff: Requesting Blood

### Step 1: Submit Blood Request
```
URL: Hospital Portal → Blood Request Form
```

### Step 2: Fill Request Details
```
Patient Name:     Jane Doe
Blood Type:       O+
Units Needed:     5
Urgency Level:    Emergency
Message:          Critical case, urgent
```

### Step 3: Submit Request
System automatically:
1. ✅ Checks current O+ inventory
2. ✅ Calculates if request can be fulfilled
3. ✅ Notifies blood bank staff with status:
   - "Available: 8 units ✅ Request can be fulfilled"
   - OR
   - "Available: 2 units ⚠️ Shortage: 3 units needed"

---

## 🩸 For Blood Bank Staff: Managing Inventory

### Check Inventory Status
```
URL: /admin/inventory
OR
URL: /staff/inventory
```

**Dashboard shows:**
```
Blood Type | Units | Volume | Status    | Expiry Soon
O+         | 8     | 3600mL | Adequate  | 1 unit
O-         | 2     | 900mL  | Low       | 0 units
A+         | 5     | 2250mL | Adequate  | 2 units
B+         | 3     | 1350mL | Low       | 1 unit
B-         | 0     | 0mL    | CRITICAL  | 0 units
AB+        | 1     | 450mL  | Critical  | 0 units
AB-        | 4     | 1800mL | Adequate  | 1 unit
A-         | 6     | 2700mL | Adequate  | 0 units

ALERTS:
🔴 Critical: B- (0 units)
🟡 Low Stock: B+ (3 units), AB+ (1 unit)
```

### Check Specific Blood Type Availability
```
GET /api/blood-inventory/availability/check?bloodType=O+

Response:
{
  "bloodType": "O+",
  "totalUnits": 8,
  "totalVolume": 3600,
  "availableInventory": [
    {
      "id": 123,
      "volume": 450,
      "expiryDate": "2026-06-15",
      "donorId": 42
    }
  ],
  "canFulfill": true
}
```

### Fulfill Blood Request
```
1. View pending request in dashboard
2. Click "Allocate Blood"
3. Select blood units (FIFO: expire soonest first)
4. Click "Fulfill Request"
5. Hospital receives notification: "Blood dispatched!"
6. Donors notified: "Your blood saved a life! 🎉"
```

---

## 🔔 For All Users: Viewing Announcements

### Mobile App
```
1. Open mobile app
2. Navigate to "Announcements" tab
3. See all latest news posts
4. Switch language: English / Amharic / Oromo
5. Auto-refreshes every 30 seconds
6. Tap "Read More" to expand full content
```

### Web Dashboard
```
1. Login to staff dashboard
2. See announcements in notification center
3. Click to read full content
4. Pin important announcements
```

---

## 📊 Key Metrics

### For Inventory Management
- **Standard Blood Unit Size**: 450 mL
- **Typical Expiry**: 42 days from collection
- **Min Expiry Alert**: 7 days before expiration
- **Critical Stock Level**: < 2 units
- **Low Stock Level**: 2-5 units

### For Donor Registration
- **Min Age**: 18 years
- **Max Age**: 65 years
- **Phone Format**: 09XXXXXXXXX (Ethiopian)
- **Alternative Formats**:
  - +251911234567 (international)
  - 251911234567 (without +)
  - 911234567 (missing leading 0)

---

## 🎯 Common Tasks

### Task 1: Update Inventory After Donation
```
1. Go to: /admin/lab/verify-donor
2. Enter donor details
3. Fill lab test results
4. Click "Verify & Bleed"
5. Inventory automatically updated
6. Shows: "1 unit of O+ added to inventory"
```

### Task 2: Handle Blood Request Shortage
```
SCENARIO: Hospital requests 10 units O+, only 5 available

STEPS:
1. System shows: "⚠️ Shortage: 5 units needed"
2. Staff options:
   a) Partial fulfillment: Send 5 units, mark 5 units as "Pending"
   b) Wait: Request stays pending until more blood available
   c) Alternative: Suggest compatible blood types (O-)
3. Keep hospital updated on expected arrival date
```

### Task 3: Send Emergency Alert
```
SCENARIO: Blood type becomes critical (0 units)

SYSTEM AUTO-SENDS:
- ✅ Notification to all staff
- ✅ Alert to potential donors: "Your blood type (B-) is critical!"
- ✅ SMS/Email to emergency contacts
- ✅ Socket broadcast for real-time dashboard update
```

---

## 🔍 Troubleshooting

### Issue: Phone validation failing
**Problem**: "Invalid phone format"
**Solution**: 
- Use: 0911234567 (not 09 11 234567)
- Or: +251911234567 (with +)
- Or: 251911234567 (without +)

### Issue: Announcement not showing on mobile
**Problem**: Announcement posted but not visible
**Solutions**:
1. Refresh mobile app (pull down to refresh)
2. Check if language filter matches announcement language
3. Verify announcement is marked as "Active"
4. Check notification consent in donor profile

### Issue: Inventory shows 0 after fulfilling request
**Problem**: All blood units allocated but not fully used
**Solution**: This is normal. Units marked as "allocated" are reserved. Mark as "used" only after transfusion.

### Issue: Hospital request not getting inventory check
**Problem**: Inventory status missing from response
**Solution**: Restart backend server to reload inventoryManager utility

---

## 📞 Support

### For Technical Issues
```
Contact: IT Support Team
Issues: Inventory queries, notifications, database
```

### For Content Issues
```
Contact: Admin/Communications Team
Issues: Announcement content, language, image upload
```

### For Hospital Issues
```
Contact: Blood Bank Manager
Issues: Blood request fulfillment, shortage handling
```

---

## 📱 Mobile App URLs

```
/                           # Home page
/register                   # Donor registration
/announcements              # News & announcements
/donations                  # Donation history
/profile                    # User profile
/settings                   # App settings
```

---

## 👨‍💼 Staff Portal URLs

```
/admin/announcements        # Manage announcements
/admin/inventory            # View inventory
/admin/blood-requests       # View requests
/staff/verify-donor         # Lab verification
/staff/analytics            # Dashboard analytics
```

---

## ✅ Daily Checklist

### Morning
- [ ] Check critical blood types
- [ ] Post any important announcements
- [ ] Review pending blood requests

### Throughout Day
- [ ] Update inventory after each donation
- [ ] Respond to blood requests (within 30 mins)
- [ ] Monitor alerts for low stock

### End of Day
- [ ] Reconcile inventory count
- [ ] Archive old announcements
- [ ] Generate daily report

---

**Last Updated**: May 28, 2026
**For Questions**: Contact Blood Bank IT Support
