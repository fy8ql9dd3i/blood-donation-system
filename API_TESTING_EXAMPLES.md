# 🧪 API Testing Examples - Announcements & Inventory

## 📢 Announcements API Tests

### 1. Create Announcement
```bash
curl -X POST http://localhost:5000/api/news \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blood Drive This Weekend!",
    "content": "Join us for a blood donation drive at ABC Hospital. All donors welcome. Registration starts at 8 AM.",
    "language": "en",
    "imageUrl": "http://example.com/blood-drive.jpg"
  }'

Response:
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Blood Drive This Weekend!",
    "content": "Join us...",
    "language": "en",
    "imageUrl": "http://example.com/blood-drive.jpg",
    "authorId": 1,
    "isActive": true,
    "createdAt": "2026-05-28T10:30:00Z",
    "updatedAt": "2026-05-28T10:30:00Z"
  }
}
```

### 2. Get All Announcements (Public)
```bash
curl http://localhost:5000/api/news

# With language filter:
curl http://localhost:5000/api/news?lang=am

Response:
{
  "success": true,
  "data": [
    {
      "id": "550e8400...",
      "title": "Blood Drive This Weekend!",
      "content": "Join us...",
      "language": "en",
      "isActive": true,
      "createdAt": "2026-05-28T10:30:00Z"
    },
    {
      "id": "550e8401...",
      "title": "Emergency Blood Request",
      "content": "Urgent need for O+ blood...",
      "language": "en",
      "isActive": true,
      "createdAt": "2026-05-28T09:15:00Z"
    }
  ]
}
```

### 3. Delete Announcement
```bash
curl -X DELETE http://localhost:5000/api/news/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

Response:
{
  "success": true,
  "message": "News post deleted successfully"
}
```

### 4. Upload Announcement Image
```bash
curl -X POST http://localhost:5000/api/news/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/blood-drive.jpg"

Response:
{
  "success": true,
  "imageUrl": "http://localhost:5000/uploads/1685271000000.jpg"
}
```

---

## 🩸 Blood Inventory API Tests

### 1. Check Inventory Availability for Specific Blood Type
```bash
curl "http://localhost:5000/api/blood-inventory/availability/check?bloodType=O%2B"

Response:
{
  "success": true,
  "data": {
    "bloodType": "O+",
    "totalUnits": 8,
    "totalVolume": 3600,
    "availableInventory": [
      {
        "id": 1,
        "volume": 450,
        "collectionDate": "2026-05-15T08:00:00Z",
        "expiryDate": "2026-06-26T00:00:00Z",
        "donorId": 42
      },
      {
        "id": 2,
        "volume": 450,
        "collectionDate": "2026-05-16T08:00:00Z",
        "expiryDate": "2026-06-27T00:00:00Z",
        "donorId": 43
      }
    ],
    "canFulfill": true,
    "lastUpdated": "2026-05-28T14:30:00Z"
  }
}
```

### 2. Get Inventory Dashboard Summary (All Blood Types)
```bash
curl http://localhost:5000/api/blood-inventory/dashboard/summary

Response:
{
  "success": true,
  "data": {
    "summary": [
      {
        "bloodType": "A+",
        "totalUnits": 5,
        "totalVolume": 2250,
        "estimatedDonations": 5,
        "nearExpiry": 1,
        "status": "adequate"
      },
      {
        "bloodType": "A-",
        "totalUnits": 6,
        "totalVolume": 2700,
        "estimatedDonations": 6,
        "nearExpiry": 0,
        "status": "adequate"
      },
      {
        "bloodType": "B+",
        "totalUnits": 3,
        "totalVolume": 1350,
        "estimatedDonations": 3,
        "nearExpiry": 1,
        "status": "low"
      },
      {
        "bloodType": "B-",
        "totalUnits": 0,
        "totalVolume": 0,
        "estimatedDonations": 0,
        "nearExpiry": 0,
        "status": "critical"
      },
      {
        "bloodType": "AB+",
        "totalUnits": 1,
        "totalVolume": 450,
        "estimatedDonations": 1,
        "nearExpiry": 0,
        "status": "low"
      },
      {
        "bloodType": "AB-",
        "totalUnits": 4,
        "totalVolume": 1800,
        "estimatedDonations": 4,
        "nearExpiry": 1,
        "status": "adequate"
      },
      {
        "bloodType": "O+",
        "totalUnits": 8,
        "totalVolume": 3600,
        "estimatedDonations": 8,
        "nearExpiry": 2,
        "status": "adequate"
      },
      {
        "bloodType": "O-",
        "totalUnits": 2,
        "totalVolume": 900,
        "estimatedDonations": 2,
        "nearExpiry": 0,
        "status": "low"
      }
    ],
    "totalBloodUnits": 29,
    "totalVolumeMl": 13050,
    "criticalTypes": ["B-"],
    "lowStockTypes": ["B+", "AB+", "O-"],
    "generatedAt": "2026-05-28T14:30:00Z"
  }
}
```

---

## 🏥 Blood Request API Tests

### 1. Submit Blood Request (With Inventory Check)
```bash
curl -X POST http://localhost:5000/api/blood-request \
  -H "Authorization: Bearer HOSPITAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "bloodType": "O+",
    "unitsRequired": 5,
    "urgencyLevel": "emergency",
    "requestMessage": "Critical case, patient on life support"
  }'

Response (With Inventory Status):
{
  "success": true,
  "data": {
    "id": 123,
    "hospitalId": 1,
    "patientName": "John Doe",
    "bloodType": "O+",
    "unitsRequired": 5,
    "urgencyLevel": "emergency",
    "status": "pending",
    "inventoryStatus": {
      "available": true,
      "availableUnits": 8,
      "requestedUnits": 5,
      "shortage": 0,
      "shortagePercentage": 0,
      "availableVolumeMl": 3600,
      "volumeNeededMl": 2250,
      "message": "✅ Sufficient stock available (8 units)"
    },
    "createdAt": "2026-05-28T14:35:00Z"
  }
}
```

### 2. Blood Request with Shortage
```bash
curl -X POST http://localhost:5000/api/blood-request \
  -H "Authorization: Bearer HOSPITAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Jane Smith",
    "bloodType": "B-",
    "unitsRequired": 5,
    "urgencyLevel": "high",
    "requestMessage": "Post-surgery transfusion needed"
  }'

Response (Shortage Alert):
{
  "success": true,
  "data": {
    "id": 124,
    "hospitalId": 2,
    "patientName": "Jane Smith",
    "bloodType": "B-",
    "unitsRequired": 5,
    "urgencyLevel": "high",
    "status": "pending",
    "inventoryStatus": {
      "available": false,
      "availableUnits": 0,
      "requestedUnits": 5,
      "shortage": 5,
      "shortagePercentage": 100,
      "availableVolumeMl": 0,
      "volumeNeededMl": 2250,
      "message": "⚠️ Shortage: Only 0 of 5 units available (100% shortage)"
    },
    "createdAt": "2026-05-28T14:40:00Z"
  }
}
```

### 3. Get All Blood Requests
```bash
curl http://localhost:5000/api/blood-request \
  -H "Authorization: Bearer STAFF_TOKEN"

# With filters:
curl "http://localhost:5000/api/blood-request?status=pending&bloodType=O%2B&urgency=emergency"

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "hospitalId": 1,
      "hospital": {
        "name": "ABC Hospital",
        "address": "123 Main St",
        "phoneNumber": "+251-1-234-5678"
      },
      "patientName": "John Doe",
      "bloodType": "O+",
      "unitsRequired": 5,
      "urgencyLevel": "emergency",
      "status": "pending",
      "createdAt": "2026-05-28T14:35:00Z"
    }
  ]
}
```

---

## 👤 Donor Registration API Tests

### 1. Register New Donor (With Phone Validation)
```bash
curl -X POST http://localhost:5000/api/donors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abebe Kebede",
    "age": 28,
    "phone": "0911234567",
    "address": "Addis Ababa, Kolfe",
    "registeredBy": "mobile"
  }'

Response:
{
  "success": true,
  "data": {
    "donorID": 1001,
    "userId": null,
    "name": "Abebe Kebede",
    "age": 28,
    "gender": null,
    "phone": "0911234567",
    "address": "Addis Ababa, Kolfe",
    "bloodType": null,
    "totalDonations": 0,
    "lastDonationDate": null,
    "notificationConsent": true,
    "registeredBy": "mobile",
    "createdAt": "2026-05-28T14:45:00Z"
  }
}
```

### 2. Register with Invalid Phone (Validation Error)
```bash
curl -X POST http://localhost:5000/api/donors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 30,
    "phone": "123456789",
    "address": "Location",
    "registeredBy": "mobile"
  }'

Response (Validation Error):
{
  "success": false,
  "message": "Invalid phone format. Please use: 09XX-XXXX-XXX (Example: 0911-234567). Phone: 123456789"
}
```

### 3. Register with Invalid Age
```bash
curl -X POST http://localhost:5000/api/donors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Young Donor",
    "age": 16,
    "phone": "0911234567",
    "address": "Location",
    "registeredBy": "mobile"
  }'

Response (Age Error):
{
  "success": false,
  "message": "Donor must be at least 18 years old to register"
}
```

### 4. Check if Donor Already Registered
```bash
curl http://localhost:5000/api/donors/phone/0911234567

Response (Found):
{
  "success": true,
  "alreadyExists": true,
  "data": {
    "donorID": 1001,
    "name": "Abebe Kebede",
    "age": 28,
    "phone": "0911234567",
    "totalDonations": 2,
    "lastDonationDate": "2026-05-20T10:00:00Z"
  }
}

Response (Not Found):
{
  "success": false,
  "message": "Donor not found"
}
```

---

## 📨 Notification API Tests

### 1. Send Announcement Notification
```bash
# Automatically triggered when creating announcement
# But can also be sent manually:

curl -X POST http://localhost:5000/api/notifications/broadcast \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "📢 Important Announcement",
    "message": "Blood bank will be closed on Monday",
    "type": "GENERAL"
  }'

Response:
{
  "success": true,
  "message": "Notification broadcast to 1245 users",
  "sentTo": {
    "totalDonors": 1245,
    "totalStaff": 34,
    "failedCount": 3
  }
}
```

### 2. Send Personalized Notification
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": 1001,
    "title": "Your blood saved a life!",
    "message": "Your O+ blood was used at ABC Hospital today. Thank you!",
    "type": "GENERAL"
  }'

Response:
{
  "success": true,
  "data": {
    "id": 5001,
    "donorId": 1001,
    "title": "Your blood saved a life!",
    "message": "Your O+ blood was used...",
    "type": "GENERAL",
    "read": false,
    "createdAt": "2026-05-28T15:00:00Z"
  }
}
```

---

## 🧪 Postman Collection

### Import into Postman
```json
{
  "info": {
    "name": "Blood Donation System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Announcement",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Test\",\"content\":\"Test\",\"language\":\"en\"}"
        },
        "url": {
          "raw": "{{base_url}}/api/news",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "news"]
        }
      }
    },
    {
      "name": "Get All Announcements",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/news",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "news"]
        }
      }
    },
    {
      "name": "Check Inventory",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/blood-inventory/availability/check?bloodType=O+",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "blood-inventory", "availability", "check"],
          "query": [
            {
              "key": "bloodType",
              "value": "O+"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "admin_token",
      "value": ""
    }
  ]
}
```

---

## ✅ Test Results Expected

| Test | Expected Result | Status |
|------|-----------------|--------|
| Create Announcement | 201 Created | ✅ |
| Get Announcements | 200 OK, array | ✅ |
| Check O+ Inventory | 200 OK, availability data | ✅ |
| Dashboard Summary | 200 OK, all blood types | ✅ |
| Register Donor (Valid Phone) | 201 Created | ✅ |
| Register Donor (Invalid Phone) | 400 Bad Request | ✅ |
| Submit Blood Request | 201 Created + Inventory Status | ✅ |
| Blood Request with Shortage | 201 Created, shortage shown | ✅ |

---

**Last Updated**: May 28, 2026
**API Version**: 1.0
**Base URL**: http://localhost:5000
