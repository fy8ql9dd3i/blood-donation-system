# 🩸 Blood Bank Inventory System - Quick Reference

## Core Formula

```javascript
// ✅ UNIT CONVERSION (Only rule you need to remember)
units = Math.floor(volumeMl / 450);

// Example:
500 mL → Math.floor(500 / 450) = 1 unit ✅
350 mL → Math.floor(350 / 450) = 0 units ❌
1350 mL → Math.floor(1350 / 450) = 3 units ✅
```

---

## Service Quick Reference

### 1. Blood Unit Converter

```javascript
const converter = require('./services/bloodUnitConverter.service');

// Convert mL to units
converter.convertMlToUnits(500);
// → { units: 1, wastedMl: 50, ... }

// Validate blood type
converter.validateBloodType("O+");
// → true or throws error

// Check expiry status
converter.calculateExpiryStatus("2026-06-01");
// → { status: "near_expiry", daysUntilExpiry: 4, ... }

// Classify stock
converter.classifyStockStatus(5);
// → "medium"

// Validate request
converter.validateRequestFulfillment(10, 15);
// → { canFulfill: true, shortage: 0, ... }
```

### 2. Hospital Request Service

```javascript
const hospitalReq = require('./services/hospitalRequest.service');

// Process hospital request
hospitalReq.processHospitalRequest(
  {
    hospitalId: 201,
    bloodType: "O+",
    requestedUnits: 10,
    urgencyLevel: "emergency"
  },
  inventoryBatches
);
// → { requestStatus: "APPROVED", allocation: {...}, ... }

// Allocate units (FIFO)
hospitalReq.allocateUnitsFromInventory(batches, 10);
// → { totalAllocated: 10, allocationPlan: [...], ... }

// Apply deduction
await hospitalReq.applyInventoryDeduction(allocations, prisma);
// → Updates database
```

### 3. Donation Flow Service

```javascript
const donation = require('./services/donationFlow.service');

// Process donation
donation.processDonation({
  donorId: 101,
  bloodType: "A+",
  volumeMl: 500
});
// → { status: "ACCEPTED", inventory: {...}, ... }

// Batch process donations
donation.batchProcessDonations([...donations]);
// → { accepted: [...], rejected: [...], summary: {...}, ... }

// Validate eligibility
donation.validateDonationEligibility(donor, donation);
// → { isEligible: true, messages: [...], warnings: [...] }
```

### 4. Dashboard Service

```javascript
const dashboard = require('./services/inventoryDashboard.service');

// Full dashboard
dashboard.generateInventoryDashboard(allInventory);
// → Complete dashboard with all metrics

// Quick status (mobile)
dashboard.generateQuickStatus(allInventory);
// → Lightweight version

// Blood type breakdown
dashboard.generateBloodTypeBreakdown(records);
// → Per-blood-type metrics

// Stock alerts
dashboard.generateStockAlerts(records);
// → Critical/high/medium/low alerts

// Expiry warnings
dashboard.generateExpiryWarnings(records);
// → Near-expiry units with recommendations
```

---

## Common Use Cases

### Use Case 1: Process Morning Donations

```javascript
const donations = [
  { donorId: 1, bloodType: "O+", volumeMl: 500 },
  { donorId: 2, bloodType: "A+", volumeMl: 1350 },
  { donorId: 3, bloodType: "B-", volumeMl: 350 } // Will be rejected
];

const result = DonationFlow.batchProcessDonations(donations);
console.log(`${result.accepted.length} accepted, ${result.rejected.length} rejected`);
console.log(`Total units created: ${result.summary.totalUnitsStored}`);
```

### Use Case 2: Handle Emergency Hospital Request

```javascript
// Get inventory for blood type
const inventory = await prisma.bloodInventory.findMany({
  where: { bloodType: "O+" }
});

// Process request
const request = HospitalRequest.processHospitalRequest(
  { hospitalId: 201, bloodType: "O+", requestedUnits: 10 },
  inventory
);

if (request.requestStatus === "APPROVED") {
  // Deduct from inventory
  await HospitalRequest.applyInventoryDeduction(
    request.allocation.allocationPlan,
    prisma
  );
  
  // Send notification
  io.emit("request_approved", { ...request });
} else {
  // Send shortage alert
  io.emit("request_rejected", { ...request });
}
```

### Use Case 3: Generate Dashboard

```javascript
// Fetch all inventory
const inventory = await prisma.bloodInventory.findMany();

// Generate dashboard
const dashboard = InventoryDashboard.generateInventoryDashboard(inventory);

// Use for display
res.json({
  summary: dashboard.summary,
  bloodTypes: dashboard.bloodTypeBreakdown,
  alerts: dashboard.stockAlerts,
  warnings: dashboard.expiryWarnings
});
```

---

## Validation Checklist

### Before Approving a Request

- [ ] Blood type is valid (A+, A-, B+, B-, AB+, AB-, O+, O-)
- [ ] Requested units is positive integer
- [ ] Available units >= requested units
- [ ] Inventory batches are not expired
- [ ] Using FIFO (earliest expiry first)

### Before Storing Donation

- [ ] Volume >= 400 mL (minimum viable)
- [ ] Volume <= 550 mL (safety limit)
- [ ] Donor blood type matches donation
- [ ] Conversion: units = Math.floor(volumeMl / 450)
- [ ] Only integer units stored

### Before Display on Dashboard

- [ ] All blood types initialized
- [ ] Units aggregated correctly
- [ ] Expiry status calculated
- [ ] Near-expiry units counted
- [ ] Expired units excluded from available
- [ ] Stock status classified

---

## Constants You Need

```javascript
// Valid blood types
VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Conversion
ML_PER_UNIT = 450;

// Expiry
BLOOD_EXPIRY_DAYS = 42;
NEAR_EXPIRY_DAYS = 7;

// Stock thresholds
STOCK_THRESHOLDS = {
  empty: { min: 0, max: 0 },
  low: { min: 1, max: 3 },
  medium: { min: 4, max: 10 },
  high: { min: 11, max: Infinity }
};
```

---

## Error Handling

### Common Errors

```javascript
// ❌ Insufficient volume
try {
  DonationFlow.processDonation({ volumeMl: 300, ... });
} catch (e) {
  // "volumeMl must be at least 400 mL"
}

// ❌ Invalid blood type
try {
  converter.validateBloodType("XX");
} catch (e) {
  // "Invalid blood type 'XX'"
}

// ❌ Negative units
try {
  converter.classifyStockStatus(-5);
} catch (e) {
  // "Must be non-negative integer"
}

// ❌ Request not fulfilled
try {
  hospital.allocateUnitsFromInventory([], 10);
} catch (e) {
  // "Failed to allocate 10 units"
}
```

---

## Testing

```bash
# Run all tests
node backend/services/bloodInventory.tests.js

# Run specific test
node backend/services/bloodInventory.tests.js | grep "TEST 1"
```

---

## API Response Examples

### ✅ Donation Accepted

```json
{
  "status": "ACCEPTED",
  "inventory": {
    "unitsStored": 1,
    "volumeMlStored": 450,
    "expiryDate": "2026-07-09"
  }
}
```

### ❌ Donation Rejected (Insufficient)

```json
{
  "status": "REJECTED",
  "reason": "INSUFFICIENT_VOLUME",
  "message": "Minimum 450 mL needed for 1 unit"
}
```

### ✅ Request Approved

```json
{
  "requestStatus": "APPROVED",
  "fulfillmentDetails": {
    "requestedUnits": 10,
    "availableUnits": 15,
    "shortage": 0
  },
  "allocation": {
    "allocationPlan": [
      { "bloodUnitID": 1, "unitsAllocated": 10 }
    ]
  }
}
```

### ❌ Request Rejected (Shortage)

```json
{
  "requestStatus": "REJECTED",
  "fulfillmentDetails": {
    "requestedUnits": 10,
    "availableUnits": 4,
    "shortage": 6,
    "fulfillmentPercentage": 40
  }
}
```

---

## Troubleshooting Quick Fix

| Issue | Cause | Fix |
|-------|-------|-----|
| Units = 0 when volume > 0 | Using `/` instead of `Math.floor` | Use `Math.floor(volume / 450)` |
| Request approved but inventory not changed | Forgot to call `applyInventoryDeduction` | Call it after approval |
| Wrong stock status | Quantity not integer | Ensure quantity is `Math.floor` result |
| Expired blood in dashboard | Not filtering by status | Filter where `status !== "expired"` |
| FIFO not working | Not sorting batches | Call `sortByExpiryPriority(batches)` first |

---

## Performance Tips

1. **Cache dashboard**: Regenerate every 5-10 minutes, not per request
2. **Index queries**: Add indexes on `bloodType`, `expiryDate`, `status`
3. **Batch operations**: Process multiple donations at once
4. **Archive expired**: Move expired blood to archive table monthly

---

**Last Updated**: May 28, 2026  
**Status**: Production Ready ✅  
**Support**: See BLOOD_INVENTORY_SYSTEM.md for full documentation
