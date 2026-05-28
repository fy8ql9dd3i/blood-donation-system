# 🩸 Blood Bank Inventory System - Implementation Checklist

## Phase 1: Database Setup ✅

- [x] Updated Prisma schema with unit-based model
- [x] Added BloodInventory constraints (quantity >= 0)
- [x] Added Donation conversion tracking
- [x] Added BloodRequestFulfillment junction table
- [ ] Run migration: `npx prisma migrate dev --name add_unit_based_inventory`
- [ ] Backup current database before migration
- [ ] Verify schema applied: `npx prisma db push`

## Phase 2: Service Layer Setup ✅

- [x] Created bloodUnitConverter.service.js (Core logic)
- [x] Created hospitalRequest.service.js (Request handling)
- [x] Created donationFlow.service.js (Donation processing)
- [x] Created inventoryDashboard.service.js (Dashboard)
- [ ] Copy services to `backend/services/`
- [ ] Verify all require() paths correct
- [ ] Test services in isolation: `node backend/services/bloodInventory.tests.js`

## Phase 3: API Endpoint Implementation

### Donation Endpoints

- [ ] **POST /api/donations/process**
  - Input: { donorId, bloodType, volumeMl, labTestId }
  - Uses: DonationFlow.processDonation()
  - Output: { status, inventory, ... }

- [ ] **POST /api/donations/batch**
  - Input: [ { donorId, bloodType, volumeMl }, ... ]
  - Uses: DonationFlow.batchProcessDonations()
  - Output: { accepted, rejected, summary }

- [ ] **GET /api/donations/:donorId/eligibility**
  - Input: donorId
  - Uses: DonationFlow.validateDonationEligibility()
  - Output: { isEligible, messages, warnings }

### Hospital Request Endpoints

- [ ] **POST /api/blood-requests/submit**
  - Input: { bloodType, requestedUnits, urgencyLevel, patientName }
  - Uses: HospitalRequest.processHospitalRequest()
  - Output: { requestStatus, fulfillmentDetails, allocation, ... }

- [ ] **GET /api/blood-requests/:requestId**
  - Fetches request with fulfillment details
  - Output: Complete request object

- [ ] **GET /api/blood-requests/availability/:bloodType**
  - Shows available units for blood type
  - Uses: BloodUnitConverter.validateRequestFulfillment()
  - Output: { availableUnits, status, message }

### Inventory Endpoints

- [ ] **GET /api/inventory/dashboard**
  - Uses: InventoryDashboard.generateInventoryDashboard()
  - Output: Full dashboard JSON

- [ ] **GET /api/inventory/quick-status**
  - Uses: InventoryDashboard.generateQuickStatus()
  - Output: Lightweight mobile version

- [ ] **GET /api/inventory/blood-type/:bloodType**
  - Shows all batches for blood type
  - Output: Blood type breakdown

- [ ] **GET /api/inventory/alerts**
  - Uses: InventoryDashboard.generateStockAlerts()
  - Output: [ { severity, bloodType, alert, ... } ]

- [ ] **GET /api/inventory/expiry-warnings**
  - Uses: InventoryDashboard.generateExpiryWarnings()
  - Output: [ { severity, bloodUnitID, daysUntilExpiry, ... } ]

## Phase 4: Controller Integration

### bloodRequest.controller.js Updates

- [ ] Import HospitalRequest service
- [ ] Update submitRequest() to use processHospitalRequest()
- [ ] Add logic to call applyInventoryDeduction()
- [ ] Add FIFO allocation priority
- [ ] Test with mock inventory

### donation.controller.js Updates

- [ ] Import DonationFlow service
- [ ] Update processDonation() to use new conversion
- [ ] Remove old mL-based logic
- [ ] Validate units are integers before saving
- [ ] Test unit conversion with real volumes

### inventory.controller.js Updates (Create if not exists)

- [ ] Import InventoryDashboard service
- [ ] Implement dashboard endpoint
- [ ] Implement alerts endpoint
- [ ] Implement expiry warnings endpoint
- [ ] Add caching for dashboard (5-10 min)

## Phase 5: Data Migration

- [ ] Identify existing inventory records
- [ ] Script to convert existing mL to units
- [ ] Validate conversions (check for data loss)
- [ ] Update quantities: `quantity = Math.floor(volumeMl / 450)`
- [ ] Update stock statuses based on new quantities
- [ ] Archive old volumeMl column (optional)

```javascript
// Migration script template
const existing = await prisma.bloodInventory.findMany();
for (const batch of existing) {
  const newQuantity = Math.floor(batch.volumeMl / 450);
  await prisma.bloodInventory.update({
    where: { bloodUnitID: batch.bloodUnitID },
    data: { quantity: newQuantity }
  });
}
```

## Phase 6: Testing

### Unit Tests

- [ ] Run all test suites: `node backend/services/bloodInventory.tests.js`
- [ ] Verify all 10 tests pass
- [ ] Test real-world scenarios
- [ ] Test edge cases

### Integration Tests

- [ ] Test donation → inventory flow
- [ ] Test request → allocation → deduction flow
- [ ] Test dashboard generation with test data
- [ ] Test error handling (invalid inputs)
- [ ] Test FIFO allocation with multiple batches

### Manual Testing (Postman/Curl)

```bash
# Test donation processing
curl -X POST http://localhost:3000/api/donations/process \
  -H "Content-Type: application/json" \
  -d '{"donorId": 1, "bloodType": "O+", "volumeMl": 500}'

# Test hospital request
curl -X POST http://localhost:3000/api/blood-requests/submit \
  -H "Content-Type: application/json" \
  -d '{"bloodType": "O+", "requestedUnits": 5, "urgencyLevel": "emergency"}'

# Test dashboard
curl http://localhost:3000/api/inventory/dashboard

# Test alerts
curl http://localhost:3000/api/inventory/alerts
```

## Phase 7: Validation

### Business Logic Validation

- [ ] Verify: units = Math.floor(volumeMl / 450) for all donations
- [ ] Verify: Only full units stored (no fractions)
- [ ] Verify: Request approved only if available >= requested
- [ ] Verify: FIFO allocation (earliest expiry first)
- [ ] Verify: Expired blood excluded from availability
- [ ] Verify: Near-expiry units counted correctly

### Data Integrity Checks

- [ ] All quantities are integers ≥ 0
- [ ] All blood types are valid (A+, A-, B+, etc.)
- [ ] All expiry dates are in future for available blood
- [ ] No negative quantities in inventory
- [ ] No orphaned blood requests

```sql
-- SQL validation queries
SELECT COUNT(*) FROM "BloodInventory" WHERE quantity < 0;  -- Should be 0
SELECT COUNT(*) FROM "BloodInventory" WHERE "bloodType" NOT IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');  -- Should be 0
SELECT COUNT(*) FROM "Donation" WHERE units != FLOOR("volumeMl" / 450);  -- Should be 0
```

## Phase 8: Performance Optimization

- [ ] Add database indexes on frequently queried columns
  ```sql
  CREATE INDEX idx_bloodtype ON "BloodInventory"("bloodType");
  CREATE INDEX idx_expiry ON "BloodInventory"("expiryDate");
  CREATE INDEX idx_status ON "BloodInventory"("status");
  ```

- [ ] Implement dashboard caching (Redis/In-memory)
- [ ] Add query optimization for batch operations
- [ ] Monitor database query performance
- [ ] Profile donationFlow and hospitalRequest endpoints

## Phase 9: Documentation & Training

- [ ] Create developer guide (BLOOD_INVENTORY_SYSTEM.md) ✅
- [ ] Create quick reference (QUICK_REFERENCE.md) ✅
- [ ] Create API documentation
- [ ] Train team on unit-based logic
- [ ] Document error codes and messages
- [ ] Create operational runbook for DBAs

## Phase 10: Deployment

- [ ] Code review: All services reviewed ✅
- [ ] Security audit: Validate input sanitization
- [ ] Performance test: Load test with 100+ concurrent requests
- [ ] Staging deployment: Test in staging environment
- [ ] Backup production database
- [ ] Run migration in production: `npx prisma migrate deploy`
- [ ] Monitor for errors post-deployment
- [ ] Create rollback plan if needed

## Phase 11: Post-Deployment

- [ ] Monitor dashboard accuracy
- [ ] Track donation → unit conversion success rate
- [ ] Monitor hospital request fulfillment rate
- [ ] Check stock alert accuracy
- [ ] Verify FIFO allocation working correctly
- [ ] Collect user feedback
- [ ] Fix any reported issues
- [ ] Document lessons learned

## Key Validation Points

### Critical Checks Before Going Live

```javascript
// 1. Unit conversion is exact
assert(Math.floor(500 / 450) === 1);
assert(Math.floor(1350 / 450) === 3);
assert(Math.floor(350 / 450) === 0);

// 2. Request fulfillment is correct
assert(validateRequestFulfillment(10, 15).canFulfill === true);
assert(validateRequestFulfillment(10, 5).canFulfill === false);

// 3. Expiry status is accurate
const expired = calculateExpiryStatus(pastDate);
assert(expired.status === "expired");

// 4. Dashboard aggregation is accurate
const dashboard = generateInventoryDashboard(mockRecords);
assert(dashboard.summary.totalUnitsAcrossAllBloodTypes > 0);

// 5. FIFO allocation is correct
const allocated = allocateUnitsFromInventory(sortedBatches, 10);
assert(allocated.totalAllocated === 10);
```

## Success Criteria

✅ All unit conversions use Math.floor  
✅ All inventory quantities are integers  
✅ All requests validated with unit logic  
✅ All dashboards show accurate counts  
✅ All allocations follow FIFO  
✅ All tests pass (10/10)  
✅ All endpoints respond correctly  
✅ Zero data integrity issues  
✅ Zero negative quantities  
✅ 100% blood type validation  

---

## Timeline Estimate

- **Phase 1**: 1 hour (Database setup)
- **Phase 2**: 1 hour (Services already created)
- **Phase 3-4**: 4 hours (API implementation)
- **Phase 5**: 2 hours (Data migration & validation)
- **Phase 6-7**: 3 hours (Testing & validation)
- **Phase 8-10**: 2 hours (Performance & deployment prep)
- **Phase 11**: Ongoing (Monitoring)

**Total**: ~13 hours for full implementation

---

## Support Resources

- 📖 Full Documentation: [BLOOD_INVENTORY_SYSTEM.md](./BLOOD_INVENTORY_SYSTEM.md)
- ⚡ Quick Reference: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- 🧪 Test Suite: `backend/services/bloodInventory.tests.js`
- 💬 Service Code: All services are fully documented with JSDoc comments

---

**Status**: Ready for Implementation  
**Date Created**: May 28, 2026  
**Last Updated**: May 28, 2026  
**Version**: 1.0.0
