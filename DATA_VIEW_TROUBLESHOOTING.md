# Data-View Troubleshooting Guide

## Issue: Data Not Fetching in Data-View Page

### Step 1: Check Browser Console Logs
1. Open the data-view page: `http://192.168.70.10:3000/data-view`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for messages starting with `[DataView]`, `[DataView Query]`, `[Filter]`

### Expected Log Output:
```
[DataView Query] Starting fetch...
[DataView Query] Response status: 200
[DataView Query] Response data: { entries: [ ... ] }
[DataView Query] Entries count: 5
[DataView] operationalDataResponse: { entries: [ ... ] }
[DataView] Total entries received: 5
[DataView] User info: { id: 1, username: 'admin', role: 'admin' }
[DataView] First entry: { id: 1, type: 'staffCount', data: { ... }, ... }
```

### Step 2: Check Server Logs
1. Look at the console output where the server is running
2. Search for `[Storage.getOperationalData]` messages
3. Search for `[Operational Data]` messages

### Expected Server Logs:
```
[Storage.getOperationalData] Raw entries from DB: 5
[Storage.getOperationalData] First entry: { id: 1, type: 'staffCount', ... }
[Storage.getOperationalData] Mapped entries: 5
[Operational Data] Total entries from DB: 5
[Operational Data] User role: admin, User ID: 1
[Operational Data] Admin user - returning all 5 entries
```

### Step 3: Check Database Directly
Run this SQL query to verify data exists:
```sql
SELECT COUNT(*) as total FROM operational_data;
SELECT * FROM operational_data ORDER BY created_at DESC LIMIT 1;
```

### Step 4: Test API Endpoint Directly
Open your browser and navigate to (with authentication):
```
GET /api/operational-data
```

Expected response:
```json
{
  "entries": [
    {
      "id": 1,
      "type": "staffCount",
      "data": { ... },
      "stats": { ... },
      "createdById": 1,
      "createdAt": "2025-12-28T...",
      "timestamp": "2025-12-28T...",
      "createdBy": { ... }
    }
  ]
}
```

### Common Issues and Solutions:

#### Issue A: API returns 401 Unauthorized
- **Cause**: User not authenticated
- **Fix**: Make sure you're logged in as admin before accessing data-view
- **Check**: Look at the error message in the UI - it should show an error card

#### Issue B: API returns empty entries []
- **Cause**: No data in database OR user doesn't have permission to see the data
- **Fix**: 
  - Create operational data first (via metrics page)
  - Verify user role is admin
  - Check manager assignments for non-admin users

#### Issue C: API returns 500 error
- **Cause**: Server error fetching from database
- **Fix**: 
  - Check server logs for error messages
  - Verify database connection is working
  - Check if operational_data table exists

#### Issue D: Data appears in database but doesn't show in UI
- **Cause**: Date filtering is removing all entries
- **Fix**: 
  - Click "All Dates" filter
  - Check the console logs to see how dates are being compared
  - Verify createdAt field is a valid date string

#### Issue E: Browser shows "Error Fetching Data"
- **Cause**: Network error or API error
- **Fix**:
  - Check browser console for exact error message
  - Verify server is running
  - Check network tab in DevTools for API response
  - Try the "Retry" button

### Quick Debug Checklist:
- [ ] Browser console shows successful API response
- [ ] Server logs show entries being returned
- [ ] Database has operational_data records
- [ ] User is logged in as admin
- [ ] No error card is showing in the UI
- [ ] Date filter is set to "All Dates"
- [ ] RefreshData button returns fresh data

### If None of the Above Works:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart the server
3. Re-login to the application
4. Check all server logs for errors
5. Verify database credentials are correct
