#!/bin/bash
# Add sample operational data using curl

# Get auth token first
echo "🔐 Getting authentication token..."

TOKEN=$(curl -s -X POST http://192.168.70.10:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Add operational data entries
echo "📝 Adding operational data entries..."

# Staff Count
curl -s -X POST http://192.168.70.10:3000/api/operational-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "staffCount",
    "data": {
      "Total employees today": 45,
      "Permanent employees": 35,
      "Non-permanent employees": 10
    },
    "stats": {
      "total": 45,
      "average": 45,
      "max": 45,
      "min": 45
    }
  }' && echo "✅ Added Staff Count"

# Operations
curl -s -X POST http://192.168.70.10:3000/api/operational-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "operations",
    "data": {
      "Day - Start of work": 7,
      "Day - Giving up": 3,
      "Night - Start of work": 8,
      "Night - Giving up": 2
    },
    "stats": {
      "total": 20,
      "average": 5,
      "max": 8,
      "min": 2
    }
  }' && echo "✅ Added Operations"

# Production
curl -s -X POST http://192.168.70.10:3000/api/operational-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "yesterdayProduction",
    "data": {
      "Day - Ice cream": 150,
      "Night - Ice cream": 120,
      "Day - Albany": 80,
      "Night - Albany": 95,
      "Day - Do": 60,
      "Night - Do": 70
    },
    "stats": {
      "total": 575,
      "average": 95.8,
      "max": 150,
      "min": 60
    }
  }' && echo "✅ Added Production"

# Loading
curl -s -X POST http://192.168.70.10:3000/api/operational-data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "yesterdayLoading",
    "data": {
      "Ice cream / Loading vehicles": 5,
      "Albany / Loading vehicles": 3,
      "Do / Loading vehicles": 2,
      "VEHICLE 1 (TONS)": 25,
      "VEHICLE 2 (TONS)": 30,
      "VEHICLE 3 (TONS)": 22
    },
    "stats": {
      "total": 87,
      "average": 14.5,
      "max": 30,
      "min": 2
    }
  }' && echo "✅ Added Loading"

echo "🎉 All data added successfully!"
