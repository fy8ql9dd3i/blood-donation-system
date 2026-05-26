# 🩸 Blood Donation System - Complete Feature Guide

## Overview
Your system already implements all the features you requested! Here's a complete breakdown of how everything works.

---

## ✅ Features Implemented

### 1️⃣ **Donor Registration** (Phone, Name, Age, Address, Gender)

#### Endpoint: `POST /api/donors/register`
```javascript
{
  "name": "John Doe",
  "age": 28,
  "gender": "Male",
  "phone": "+251911223344",  // or 0911223344
  "address": "Addis Ababa, Ethiopia"
}
```

**What Happens:**
- ✅ **Duplicate Check** - System checks if phone number already exists in database
- ✅ **If Already Registered** - Returns existing donor record (prevents duplicate registration)
- ✅ **If New Donor** - Creates new donor record with status = "pending"
- ✅ **Age Validation** - Only donors aged 18-65 can register
- ✅ **Phone Validation** - Validates Ethiopian/East African phone numbers
- ✅ **Location Geocoding** - Converts address to GPS coordinates

**Response (Success):**
```json
{
  "success": true,
  "message": "Donor registered successfully",
  "data": {
    "donorID": 5,
    "name": "John Doe",
    "phone": "+251911223344",
    "age": 28,
    "gender": "Male",
    "address": "Addis Ababa, Ethiopia",
    "status": "pending",
    "totalDonations": 0,
    "lastDonationDate": null
  }
}
```

---

### 2️⃣ **Lab Test Request & Processing**

#### Endpoint: `POST /api/labs/addLabResults`
Lab tester (medical professional) submits health check results:

```javascript
{
  "donorId": 5,
  "blood_type": "O+",
  "hiv": "Negative",
  "hbv": "Negative",
  "weight": 70,
  "bp": "120/80",
  "pulse": 72,
  "health_info": "Good health condition",
  "donation_amount": 450,
  "collection_date": "2026-05-23"
}
```

**What Happens:**

#### **Case 1: Donor Eligible (90+ Days Since Last Donation)**
✅ **Health Check Passed** (HIV & HBV Negative):
- Lab test status = "Approved"
- Donor status = "approved"
- Updates all health information:
  - Weight, Blood Pressure, Pulse Rate, Temperature
  - Hemoglobin, HIV/HBV results
- **Increments donation count** (`totalDonations += 1`)
- Records donation in Donations table
- Adds blood to inventory (450ml = 1 unit, expires in 42 days)
- Sends push notification to donor

❌ **Health Check Failed** (HIV or HBV Positive):
- Lab test status = "Rejected"
- Donor status = "rejected"
- Updates health information
- Does NOT record donation
- Does NOT add blood to inventory
- Sends alert notification to donor

#### **Case 2: Donor NOT Eligible (Less Than 90 Days)**
✅ **Health Check Passed** but donation deferred:
- Lab test status = "Deferred"
- Updates all health information
- Calculates remaining days
- Sends notification with next eligible date
- Example: "Must wait 45 more days until 2026-07-07"

**Response (Approved Donation):**
```json
{
  "success": true,
  "message": "Lab test recorded, donation approved",
  "data": {
    "donor": {
      "donorID": 5,
      "name": "John Doe",
      "status": "approved",
      "totalDonations": 1,
      "lastDonationDate": "2026-05-23",
      "healthInfo": "HIV: Negative, HBV: Negative, WT: 70kg, BP: 120/80, P: 72...",
      "weight": 70,
      "bloodPressure": "120/80",
      "pulseRate": 72
    },
    "labTest": {
      "lab_test_id": 12,
      "status": "Approved",
      "test_results": "HIV: Negative, HBV: Negative..."
    },
    "donation": {
      "id": 45,
      "donorId": 5,
      "bloodType": "O+",
      "collectionDate": "2026-05-23",
      "units": 1
    },
    "inventory": {
      "bloodId": "BAG-A2X9Z7F",
      "bloodType": "O+",
      "quantity": 1,
      "expiryDate": "2026-07-04"
    }
  }
}
```

**Response (Deferred - Not Eligible Yet):**
```json
{
  "success": false,
  "message": "Donor not eligible yet. Must wait 45 more days until 2026-07-07.",
  "nextDonationDate": "2026-07-07",
  "donor": { ... },
  "labTest": { ... }
}
```

---

### 3️⃣ **90-Day Eligibility Check** (Automatic Clock)

Located in: `backend/utils/donationInterval.js`

**How It Works:**
```javascript
// ✅ If donor has NEVER donated: Eligible immediately
if (!lastDonationDate) {
  eligible: true,
  remainingDays: 0
}

// ✅ If last donation was 90+ days ago: Eligible
if (daysSinceLastDonation >= 90) {
  eligible: true,
  remainingDays: 0
}

// ❌ If less than 90 days: NOT eligible
if (daysSinceLastDonation < 90) {
  eligible: false,
  remainingDays: 90 - daysSinceLastDonation,
  nextDonationDate: lastDonationDate + 90 days
}
```

**Example Timeline:**
```
Day 1 (May 23, 2026):   Donor donates blood
                        lastDonationDate = 2026-05-23
                        totalDonations = 1

Day 45 (July 7, 2026):  remainingDays = 45
                        nextDonationDate = 2026-08-21

Day 90 (August 21):     ✅ ELIGIBLE - Can donate again
                        if health check passes

Day 91 (August 22):     Lab tester submits results
                        totalDonations = 2
                        lastDonationDate = 2026-08-22
```

---

### 4️⃣ **Donation Count & Health Info Updates**

#### Tracked in Donor Model:

| Field | Purpose | Updates |
|-------|---------|---------|
| `totalDonations` | How many times donor has successfully donated | +1 per approved donation |
| `totalLitersDonated` | Total volume donated in liters | +0.45 per donation (450ml) |
| `lastDonationDate` | Date of most recent successful donation | Set on each approved donation |
| `healthInfo` | Latest health information | Updated on each lab test |
| `weight`, `hemoglobin`, `bloodPressure`, `pulseRate`, `bodyTemperature` | Current vital signs | Updated on each lab test |

#### Example - Donor After Multiple Donations:
```json
{
  "donorID": 5,
  "name": "John Doe",
  "phone": "+251911223344",
  "age": 28,
  "gender": "Male",
  "status": "approved",
  
  // 🩸 DONATION TRACKING
  "totalDonations": 3,           // Has donated 3 times
  "totalLitersDonated": 1.35,    // 3 × 450ml = 1.35 liters
  "lastDonationDate": "2026-08-22",  // Most recent donation
  
  // 📋 LATEST HEALTH INFO (from most recent lab test)
  "healthInfo": "HIV: Negative, HBV: Negative, WT: 70kg, HB: 14.5, BP: 120/80, P: 72, T: 36.8°C",
  "weight": 70,
  "hemoglobin": 14.5,
  "bloodPressure": "120/80",
  "pulseRate": 72,
  "bodyTemperature": 36.8
}
```

---

### 5️⃣ **Duplicate Registration Prevention**

**How It Works:**

#### Step 1: Mobile App User Registers
```javascript
POST /api/donors/register
{
  "phone": "+251911223344",
  "name": "John Doe",
  ...
}
```

**System Checks:**
```javascript
// Check if phone already exists
let donor = await Donor.findOne({ where: { phone: "+251911223344" } });

if (donor) {
  // ✅ Donor already exists
  return res.status(200).json(successResponse("Donor already exists", donor));
}

// ❌ New donor, create record
```

#### Step 2: Lab Tester Submits Results
```javascript
POST /api/labs/addLabResults
{
  "phone": "+251911223344",
  "blood_type": "O+",
  ...
}
```

**System Checks (in order):**
1. If `donorId` provided → Find by ID
2. If only `phone` → Find by phone (prevent duplicates)
3. If not found → Create new donor record
4. Return existing donor (never creates dupes)

---

### 6️⃣ **Complete Workflow Example**

#### **Timeline: John Doe's Donations**

**📱 Day 1 (May 23, 2026) - Mobile Registration**
```
User opens Blood Donation app
→ Fills: Name, Age, Phone, Address, Gender
→ System checks phone for duplicates
→ Creates donor record (status: pending)
→ totalDonations = 0, lastDonationDate = null
```

**🏥 Day 2 (May 24, 2026) - First Lab Test**
```
Lab tester enters John's health info:
- HIV: Negative ✅
- HBV: Negative ✅
- Weight: 70kg
- BP: 120/80
- Pulse: 72
- Hemoglobin: 14.5

✅ ELIGIBLE (first donation) + ✅ HEALTH CHECK PASSED
→ Lab Test Status: APPROVED
→ Donor Status: approved
→ totalDonations: 0 → 1 ✨
→ lastDonationDate: 2026-05-24
→ totalLitersDonated: 0 → 0.45
→ Adds 450ml blood to inventory (Expires 2026-07-05)
```

**📋 Day 45 (July 7, 2026) - Eligibility Check (Early)**
```
Lab tester tries to process another donation:

System calculates: 2026-07-07 - 2026-05-24 = 44 days

❌ NOT ELIGIBLE YET
→ remainingDays: 1 day left
→ nextDonationDate: 2026-07-08
→ Lab Test Status: DEFERRED
→ Sends notification: "Please wait 1 more day"
```

**🩸 Day 90 (August 22, 2026) - Second Donation**
```
Lab tester enters John's health info (updated):
- HIV: Negative ✅
- HBV: Negative ✅
- Weight: 68kg (lost 2kg)
- BP: 118/78 (improved)
- Hemoglobin: 15.0 (improved)

System calculates: 2026-08-22 - 2026-05-24 = 90 days

✅ ELIGIBLE (90+ days) + ✅ HEALTH CHECK PASSED
→ Lab Test Status: APPROVED
→ Donor Status: approved
→ totalDonations: 1 → 2 ✨
→ lastDonationDate: 2026-05-24 → 2026-08-22
→ totalLitersDonated: 0.45 → 0.9
→ healthInfo: Updated with new vitals
→ Adds 450ml blood to inventory (Expires 2026-10-03)
```

**❌ Day 120 (September 21, 2026) - Third Donation Attempt with Problem**
```
Lab tester enters John's health info:
- HIV: POSITIVE ⚠️
- HBV: Negative ✅

System calculates: 2026-09-21 - 2026-08-22 = 30 days

❌ NOT ELIGIBLE (only 30 days) + ❌ HEALTH CHECK FAILED
→ Lab Test Status: REJECTED
→ Donor Status: rejected
→ totalDonations: 2 (unchanged)
→ lastDonationDate: 2026-08-22 (unchanged)
→ NO blood added to inventory
→ Sends alert notification
```

---

## 📊 Database Tables

### Donors Table
```sql
donorID (PK)
userId (FK)
name
age
gender
phone (UNIQUE) -- Prevents duplicate registration
address
bloodType
totalDonations -- Increments on each approved donation
totalLitersDonated
lastDonationDate -- Used for 90-day calculation
status (pending/approved/rejected)
healthInfo
weight, hemoglobin, bloodPressure, pulseRate, bodyTemperature
latitude, longitude -- From geocoding
registeredBy (mobile/lab)
createdAt, updatedAt
```

### LabTests Table
```sql
lab_test_id (PK)
donor_id (FK)
blood_type
test_results
status (Pending/Approved/Deferred/Rejected)
completed (boolean)
tested_by (FK to lab staff)
weight, hemoglobin, bloodPressure, pulseRate, bodyTemperature
hiv, hbv (test results)
collectionDate
createdAt, updatedAt
```

### Donations Table
```sql
id (PK)
donorId (FK)
collectionDate
bloodType
units (1 unit = 450ml)
lab_test_id (FK) -- Links to lab test
createdAt, updatedAt
```

### BloodInventory Table
```sql
inventoryId (PK)
bloodId (BAG-XXXXX)
bloodType
quantity (units)
expiryDate (42 days from collection)
donorId (FK)
status (Approved/Rejected/Expired)
createdAt, updatedAt
```

---

## 🚀 API Endpoints Summary

### Donor Management
- `POST /api/donors/register` - Register new donor or get existing
- `GET /api/donors` - Get all donors
- `GET /api/donors/:id` - Get specific donor
- `PUT /api/donors/:id` - Update donor info
- `POST /api/donors/checkEligibility/:id` - Check 90-day eligibility

### Lab Operations
- `POST /api/labs/addLabResults` - Submit lab test & process donation
- `GET /api/labs/tests` - Get all lab tests
- `GET /api/labs/tests/:donorId` - Get donor's lab history

### Donations
- `POST /api/donations` - Record donation (after lab approval)
- `GET /api/donations/:donorId` - Get donor's donation history

### Blood Inventory
- `GET /api/inventory` - View available blood units
- `GET /api/inventory/:bloodType` - Filter by blood type

---

## ✨ Key Features Already Working

| Feature | Status | File | How It Works |
|---------|--------|------|--------------|
| Donor Registration | ✅ | `donor.controller.js` | Registers via phone, prevents duplicates |
| 90-Day Check | ✅ | `donationInterval.js` | Checks `lastDonationDate + 90 days` |
| Lab Test Processing | ✅ | `lab.controller.js` | Health check + eligibility validation |
| Health Info Updates | ✅ | `lab.controller.js` | Stores latest vitals on each test |
| Donation Count | ✅ | `lab.controller.js` | Increments `totalDonations` on approval |
| Duplicate Prevention | ✅ | Both controllers | Phone-based unique constraint |
| Notifications | ✅ | `lab.controller.js` | Sends push/SMS on status changes |
| Blood Inventory | ✅ | `donation.controller.js` | Creates inventory units on approval |
| Age Validation | ✅ | `ageValidator.js` | Only 18-65 can register/donate |

---

## 🔧 How to Use (Step by Step)

### Step 1: Donor Registers on Mobile
```bash
POST /api/donors/register
Content-Type: application/json

{
  "name": "John Doe",
  "age": 28,
  "gender": "Male",
  "phone": "+251911223344",
  "address": "Addis Ababa, Ethiopia"
}
```

### Step 2: Lab Tester Submits Results
```bash
POST /api/labs/addLabResults
Content-Type: application/json

{
  "donorId": 5,  # or can provide just phone + other fields
  "blood_type": "O+",
  "hiv": "Negative",
  "hbv": "Negative",
  "weight": 70,
  "bp": "120/80",
  "pulse": 72,
  "health_info": "Good condition",
  "donation_amount": 450,
  "collection_date": "2026-05-23"
}
```

### Step 3: System Automatically:
✅ Checks if donor already registered (by phone)
✅ Validates age (18-65)
✅ Checks 90-day eligibility from last donation
✅ Validates health results (HIV/HBV)
✅ Updates health information
✅ Increments donation count (if approved)
✅ Adds blood to inventory (if approved)
✅ Sends notifications

### Step 4: Monitor Donor History
```bash
GET /api/donors/5
→ Returns donor with totalDonations, lastDonationDate, healthInfo, etc.
```

---

## ⚠️ Important Business Rules

1. **Age Requirement**: 18-65 years old
2. **Donation Interval**: Minimum 90 days between donations
3. **Health Requirements**: HIV & HBV must be Negative
4. **Duplicate Prevention**: One phone number = One donor record
5. **Health Info**: Updated on EVERY lab test (approvedor deferred)
6. **Blood Expiry**: 42 days from collection date
7. **Notification**: Donors are notified of approval/deferral/rejection

---

## 🎯 Testing the System

### Test Scenario 1: New Donor, First Time
```
Register → Eligible → Health Check Pass → ✅ Donation Approved
```

### Test Scenario 2: Duplicate Registration
```
Register (phone: 0911223344) → System returns existing donor record
```

### Test Scenario 3: Too Soon to Donate Again
```
Last donation: May 23 → Try again: July 7 (45 days) → ❌ Deferred
```

### Test Scenario 4: Health Check Failed
```
90 days passed → Health check → HIV Positive → ❌ Rejected
```

---

This system is fully functional! All features you requested are already implemented. The donation clock automatically tracks the 90-day interval, health information is updated with each lab test, and duplicate registrations are prevented by the phone-based unique constraint.

**Happy donating! 🩸**
