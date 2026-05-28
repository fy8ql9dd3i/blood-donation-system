# 🩸 Blood Bank Inventory Management System - Complete Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Architecture](#architecture)
4. [Data Model](#data-model)
5. [API Examples](#api-examples)
6. [Integration Guide](#integration-guide)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This is a **robust, unit-based Blood Bank Inventory Management System** with strict adherence to medical standards and inventory control rules.

### Key Features

✅ **Unit-based logic**: 1 unit = 450 mL (standard medical unit)  
✅ **FIFO allocation**: Earliest expiring blood used first  
✅ **Real-time dashboard**: Blood type breakdown with alerts  
✅ **Strict validation**: Blood type & volume conversion rules  
✅ **Hospital requests**: Unit-based fulfillment with shortage handling  
✅ **Expiry management**: Automatic tracking of near-expiry & expired blood  

---

## Core Principles

### 1. **Units are the Single Source of Truth**

```
RULE: All inventory decisions are based on UNITS, never on mL.

✅ DO THIS:
- Store quantity as integer units only
- Make approval/rejection decisions based on units
- Calculate shortages in units

❌ DON'T DO THIS:
- Store raw mL values for decisions
- Mix volume and unit logic
- Use mL for request validation
```

### 2. **Unit Conversion Formula**

```
DONATION FLOW:
volumeMl = 500 (from lab test)
units = Math.floor(500 / 450) = 1 unit

CALCULATION:
- 450 mL = 1 complete unit (stored)
- 50 mL wasted (discarded - can't form another unit)
- No fractional units stored
```

### 3. **Blood Types (International Standard)**

```javascript
VALID_BLOOD_TYPES = [
  "A+", "A-",      // A type
  "B+", "B-",      // B type
  "AB+", "AB-",    // AB type
  "O+", "O-"       // O type
];
```

### 4. **Stock Status Classification**

```javascript
CLASSIFICATION BY UNITS:
- 0 units        → "empty"
- 1–3 units      → "low"
- 4–10 units     → "medium"
- >10 units      → "high"
```

### 5. **Expiry Logic**

```javascript
EXPIRY_THRESHOLD:
- expiryDate < today           → "expired" (excluded from availability)
- 0 ≤ daysUntilExpiry ≤ 7     → "near_expiry" (warning, still available)
- daysUntilExpiry > 7          → "available" (normal)

EXAMPLE:
Today: 2026-05-28
Batch expires: 2026-06-01 → 4 days until expiry → "near_expiry" ⚠️
```

---

## Architecture

### Service Layer Structure

```
backend/services/
├── bloodUnitConverter.service.js       (Core conversion & validation)
├── hospitalRequest.service.js          (Hospital request handling)
├── donationFlow.service.js             (Donor donation processing)
├── inventoryDashboard.service.js       (Dashboard generation)
└── bloodInventory.tests.js             (Test suite)
```

### Data Flow

```
DONATION FLOW:
Donor (500 mL)
    ↓
Lab Test (volume in mL)
    ↓
donationFlow.processDonation()
    ↓ Convert using Math.floor(volumeMl / 450)
    ↓
BloodInventory (1 unit stored)
    ↓
Dashboard & Allocation

---

HOSPITAL REQUEST FLOW:
Hospital (requests 5 units of O+)
    ↓
hospitalRequest.validateRequestFulfillment()
    ↓ Check: available_units >= requested_units?
    ↓
✅ APPROVE (allocate FIFO)  OR  ❌ REJECT (shortage)
    ↓
BloodRequest Status Updated
    ↓
Inventory Deducted
```

---

## Data Model

### BloodInventory Table

```sql
CREATE TABLE "BloodInventory" (
  "bloodUnitID" SERIAL PRIMARY KEY,
  "bloodType" VARCHAR NOT NULL,        -- A+, B-, AB+, etc.
  "quantity" INT NOT NULL DEFAULT 0,   -- Units only (must be ≥ 0)
  "volumeMl" INT,                      -- Optional: quantity * 450
  "collectionDate" TIMESTAMP,
  "expiryDate" TIMESTAMP NOT NULL,
  "status" VARCHAR DEFAULT 'available', -- available, expired, near_expiry
  "donorId" INT,
  "labTestId" INT,
  "hospitalID" INT REFERENCES "Hospital"("hospitalID")
);

CONSTRAINTS:
- quantity >= 0 (non-negative)
- bloodType IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
- expiryDate NOT NULL
```

### Donation Table

```sql
CREATE TABLE "Donation" (
  "donationID" SERIAL PRIMARY KEY,
  "donorID" INT REFERENCES "Donor"("donorID"),
  "volumeMl" INT NOT NULL,        -- Original volume from lab
  "units" INT NOT NULL,           -- Converted units
  "donationDate" TIMESTAMP,
  "labTestId" INT,
  "status" VARCHAR               -- pending, processed, tested, stored
);
```

### BloodRequest Table

```sql
CREATE TABLE "BloodRequest" (
  "requestID" SERIAL PRIMARY KEY,
  "hospitalID" INT REFERENCES "Hospital"("hospitalID"),
  "bloodType" VARCHAR NOT NULL,
  "requestedUnits" INT NOT NULL,  -- Must be positive integer
  "urgencyLevel" VARCHAR,         -- low, medium, high, emergency
  "requestDate" TIMESTAMP,
  "status" VARCHAR,               -- pending, approved, rejected, fulfilled
  "approvedUnits" INT DEFAULT 0,
  "fulfilledUnits" INT DEFAULT 0
);
```

---

## API Examples

### Example 1: Process Blood Donation (500 mL → 1 Unit)

```javascript
const DonationFlow = require('./services/donationFlow.service');

const donation = {
  donorId: 101,
  bloodType: "O+",
  volumeMl: 500,
  labTestId: 5001
};

const result = DonationFlow.processDonation(donation);

// RESPONSE:
{
  status: "ACCEPTED",
  message: "✅ Donation successfully processed",
  donation: {
    donorId: 101,
    bloodType: "O+",
    volumeCollected: 500,
    volumeWasted: 50
  },
  conversion: {
    units: 1,
    wastedMl: 50,
    formula: "Math.floor(500 / 450) = 1"
  },
  inventory: {
    unitsStored: 1,
    volumeMlStored: 450,
    expiryDate: "2026-07-09",
    daysUntilExpiry: 42
  }
}
```

### Example 2: Hospital Requests 10 Units of O+ (Approved)

```javascript
const HospitalRequest = require('./services/hospitalRequest.service');

// Current inventory
const inventory = [
  {
    bloodUnitID: 1,
    bloodType: "O+",
    quantity: 8,
    expiryDate: "2026-06-20",
    status: "available"
  },
  {
    bloodUnitID: 2,
    bloodType: "O+",
    quantity: 5,
    expiryDate: "2026-06-15",
    status: "available"
  }
];

const request = {
  hospitalId: 201,
  bloodType: "O+",
  requestedUnits: 10,
  urgencyLevel: "emergency",
  patientName: "Emergency Patient"
};

const result = HospitalRequest.processHospitalRequest(request, inventory);

// RESPONSE:
{
  requestStatus: "APPROVED",
  fulfillmentDetails: {
    requestedUnits: 10,
    availableUnits: 13,
    shortage: 0,
    canFulfill: true
  },
  allocation: {
    totalAllocated: 10,
    allocationPlan: [
      {
        bloodUnitID: 2,
        unitsAllocated: 5,   // Batch 2 expires sooner (FIFO)
        expiryDate: "2026-06-15",
        daysUntilExpiry: 18
      },
      {
        bloodUnitID: 1,
        unitsAllocated: 5,   // Batch 1 used second
        expiryDate: "2026-06-20",
        daysUntilExpiry: 23
      }
    ]
  },
  message: "✅ Sufficient stock available (13 units available)"
}
```

### Example 3: Hospital Requests 10 Units of B+ (Rejected - Shortage)

```javascript
const inventory = [
  {
    bloodUnitID: 10,
    bloodType: "B+",
    quantity: 4,
    expiryDate: "2026-06-20",
    status: "available"
  }
];

const request = {
  hospitalId: 202,
  bloodType: "B+",
  requestedUnits: 10,
  urgencyLevel: "normal",
  patientName: "Scheduled Surgery"
};

const result = HospitalRequest.processHospitalRequest(request, inventory);

// RESPONSE:
{
  requestStatus: "REJECTED",
  fulfillmentDetails: {
    requestedUnits: 10,
    availableUnits: 4,
    shortage: 6,
    canFulfill: false,
    fulfillmentPercentage: 40  // Only 40% can be fulfilled
  },
  message: "❌ Stock shortage: Only 4 of 10 units available (40% shortage)"
}
```

### Example 4: Generate Inventory Dashboard

```javascript
const Dashboard = require('./services/inventoryDashboard.service');

const allInventory = [
  { bloodUnitID: 1, bloodType: "O+", quantity: 12, expiryDate: "2026-06-20" },
  { bloodUnitID: 2, bloodType: "O+", quantity: 3, expiryDate: "2026-06-02" },
  { bloodUnitID: 3, bloodType: "A+", quantity: 5, expiryDate: "2026-06-18" },
  { bloodUnitID: 4, bloodType: "B-", quantity: 1, expiryDate: "2026-06-10" },
  { bloodUnitID: 5, bloodType: "AB+", quantity: 0, expiryDate: "2026-05-25" } // expired
];

const dashboard = Dashboard.generateInventoryDashboard(allInventory);

// RESPONSE:
{
  timestamp: "2026-05-28T10:30:00.000Z",
  summary: {
    totalUnitsAcrossAllBloodTypes: 21,
    totalVolumeMl: 9450,
    totalBatches: 5,
    bloodTypeCoverage: 4,
    systemStatus: "healthy"
  },
  bloodTypeBreakdown: {
    "O+": {
      bloodType: "O+",
      totalUnits: 15,
      totalVolumeMl: 6750,
      batchCount: 2,
      stockStatus: "high",
      summary: {
        availableUnits: 15,
        nearExpiryUnits: 3,
        expiredUnits: 0
      }
    },
    // ... other blood types
  },
  stockAlerts: [
    {
      severity: "low",
      bloodType: "AB-",
      alert: "CRITICAL: No AB- blood available"
    },
    {
      severity: "medium",
      bloodType: "B-",
      alert: "LOW STOCK: Only 1 unit of B-"
    }
  ],
  expiryWarnings: [
    {
      severity: "high",
      bloodUnitID: 2,
      bloodType: "O+",
      daysUntilExpiry: 5,
      message: "3 units of O+ expiring in 5 days"
    }
  ]
}
```

---

## Integration Guide

### Step 1: Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_unit_based_inventory
```

### Step 2: Import Services in Controllers

```javascript
// controllers/bloodRequest.controller.js
const HospitalRequest = require("../services/hospitalRequest.service");
const InventoryDashboard = require("../services/inventoryDashboard.service");
const BloodUnitConverter = require("../services/bloodUnitConverter.service");

// controllers/donation.controller.js
const DonationFlow = require("../services/donationFlow.service");
```

### Step 3: Implement Hospital Request Endpoint

```javascript
// POST /api/blood-requests/submit
const submitBloodRequest = async (req, res) => {
  try {
    const { bloodType, requestedUnits, urgencyLevel, patientName } = req.body;
    const hospitalId = req.user.hospitalId;

    // 1. Validate input
    HospitalRequest.validateHospitalRequest({
      hospitalId,
      bloodType,
      requestedUnits
    });

    // 2. Get inventory for blood type
    const inventory = await prisma.bloodInventory.findMany({
      where: { bloodType, hospitalID: hospital_blood_bank_id }
    });

    // 3. Process request
    const requestResult = HospitalRequest.processHospitalRequest(
      { hospitalId, bloodType, requestedUnits, urgencyLevel, patientName },
      inventory
    );

    // 4. Save to database
    if (requestResult.requestStatus === "APPROVED") {
      const saved = await prisma.bloodRequest.create({
        data: {
          hospitalID: hospitalId,
          bloodType,
          requestedUnits,
          urgencyLevel,
          status: "approved",
          approvedUnits: requestResult.fulfillmentDetails.availableUnits
        }
      });

      // 5. Apply inventory deduction
      if (requestResult.allocation) {
        await HospitalRequest.applyInventoryDeduction(
          requestResult.allocation.allocationPlan,
          prisma
        );
      }
    }

    return res.json(requestResult);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
```

### Step 4: Implement Donation Processing Endpoint

```javascript
// POST /api/donations/process
const processDonation = async (req, res) => {
  try {
    const { donorId, bloodType, volumeMl, labTestId } = req.body;

    // 1. Process donation
    const donation = DonationFlow.processDonation({
      donorId,
      bloodType,
      volumeMl,
      labTestId
    });

    if (donation.status === "REJECTED") {
      return res.status(400).json(donation);
    }

    // 2. Save to Donation table
    const saved = await prisma.donation.create({
      data: {
        donorID: donorId,
        volumeMl,
        units: donation.inventory.unitsStored,
        labTestId
      }
    });

    // 3. Create inventory batch
    const batch = await prisma.bloodInventory.create({
      data: donation.inventoryBatch
    });

    return res.json({
      ...donation,
      savedDonationId: saved.donationID,
      savedBatchId: batch.bloodUnitID
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
```

### Step 5: Implement Dashboard Endpoint

```javascript
// GET /api/inventory/dashboard
const getInventoryDashboard = async (req, res) => {
  try {
    // Fetch all inventory
    const inventory = await prisma.bloodInventory.findMany({
      where: { status: { not: "archived" } }
    });

    // Generate dashboard
    const dashboard = InventoryDashboard.generateInventoryDashboard(inventory);

    return res.json(dashboard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

---

## Troubleshooting

### Issue 1: Unit Conversion Not Working

**Symptom**: Blood donations stored with wrong unit counts

**Solution**:
```javascript
// WRONG ❌
units = volumeMl / 450;  // Returns decimal

// CORRECT ✅
units = Math.floor(volumeMl / 450);  // Returns integer
```

### Issue 2: Hospital Request Approved But No Units Deducted

**Symptom**: Inventory shows same units after approval

**Solution**:
```javascript
// Make sure to call applyInventoryDeduction AFTER approval
const requestResult = HospitalRequest.processHospitalRequest(...);

if (requestResult.allocation) {
  // This is required!
  await HospitalRequest.applyInventoryDeduction(
    requestResult.allocation.allocationPlan,
    prisma
  );
}
```

### Issue 3: Near-Expiry Blood Not Being Used in FIFO

**Symptom**: Older batches used before near-expiry batches

**Solution**:
```javascript
// Ensure inventory is sorted by expiryDate BEFORE allocation
const sorted = BloodUnitConverter.sortByExpiryPriority(inventory);
const result = HospitalRequest.allocateUnitsFromInventory(sorted, units);
```

### Issue 4: Dashboard Showing Wrong Stock Status

**Symptom**: Stock status doesn't match thresholds

**Solution**:
```javascript
// Verify data has correct quantities
const batch = {
  bloodType: "O+",
  quantity: 5,        // Must be INTEGER ✅
  expiryDate: "..."
};

// Dashboard will classify as:
classifyStockStatus(5);  // Returns "medium" (correct)
```

---

## Testing

Run the comprehensive test suite:

```bash
cd backend/services
node bloodInventory.tests.js
```

This runs 10 test cases covering:
- ✅ Unit conversion
- ✅ Blood type validation
- ✅ Expiry calculations
- ✅ Stock classification
- ✅ Request fulfillment
- ✅ Hospital requests
- ✅ Donation processing
- ✅ Dashboard generation
- ✅ Real-world scenarios
- ✅ Edge cases & error handling

---

## Key Metrics & KPIs

### System Health Indicators

```javascript
Dashboard metrics include:
- totalUnitsAcrossAllBloodTypes
- totalVolumeMl
- utilizableUnitsPercentage
- wastePercentage
- systemEfficiency (Excellent/Good/Fair/Poor)
- batchTurnoverRate
```

### Alert Levels

```
CRITICAL: No units available for blood type
HIGH:     Only 1-3 units available
MEDIUM:   Near expiry (5-7 days)
LOW:      Normal operations
```

---

## Support & Maintenance

### Regular Operations

1. **Daily**: Monitor dashboard for alerts
2. **Weekly**: Review wastage percentages
3. **Monthly**: Analyze request fulfillment rates
4. **Quarterly**: Audit unit conversions accuracy

### Database Maintenance

```bash
# Backup before major operations
npm run backup-inventory

# Archive expired blood (optional)
npx prisma db execute --file sql/archive_expired.sql
```

---

**Last Updated**: May 28, 2026  
**Version**: 1.0.0 (Unit-Based System)  
**Status**: Production Ready ✅
