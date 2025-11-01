# 🔧 OCR DATA FIX - CAPEX Recurring Configuration

## Issue Identified:
The OCR has failed to preserve table structure, mixing up columns and losing row relationships.

## Raw OCR Data (Corrupted):
```
1. Buildings & Facilities
2. Furniture, Fixtures & Equipment (FF&E) 
3. IT & Digital Learning
4. Transportation
5. Strategic/Safety
Furniture & Equipment
Computer Equipment/Intangibles
Vehicles/Equipment
Specialized Assets / Intangibles
Asset Type (FAR)
Reccurence
Depreciation
Amount
Buildings/Leasehold improvements
2
10
2
4
```

## Fixed Table Structure:

Based on the original table layout, here's the corrected data:

| Category | Asset Type (FAR) | Recurrence | Depreciation | Amount |
|----------|------------------|------------|--------------|--------|
| 1. Buildings & Facilities | Buildings/Leasehold improvements | Every 2 years | 10 | |
| 2. Furniture, Fixtures & Equipment (FF&E) | Furniture & Equipment | Every 2 years | 10 | |
| 3. IT & Digital Learning | Computer Equipment/Intangibles | Every 2 years | 2 | |
| 4. Transportation | Vehicles/Equipment | Every 4 years | 2 | |
| 5. Strategic/Safety | Specialized Assets / Intangibles | Every 4 years | 4 | |

## Structured JSON Data (Ready for Implementation):

```json
{
  "capexCategories": [
    {
      "category": "1. Buildings & Facilities",
      "assetType": "Buildings/Leasehold improvements",
      "recurrence": 2,
      "depreciation": 10,
      "amount": null
    },
    {
      "category": "2. Furniture, Fixtures & Equipment (FF&E)", 
      "assetType": "Furniture & Equipment",
      "recurrence": 2,
      "depreciation": 10,
      "amount": null
    },
    {
      "category": "3. IT & Digital Learning",
      "assetType": "Computer Equipment/Intangibles", 
      "recurrence": 2,
      "depreciation": 2,
      "amount": null
    },
    {
      "category": "4. Transportation",
      "assetType": "Vehicles/Equipment",
      "recurrence": 4, 
      "depreciation": 2,
      "amount": null
    },
    {
      "category": "5. Strategic/Safety",
      "assetType": "Specialized Assets / Intangibles",
      "recurrence": 4,
      "depreciation": 4, 
      "amount": null
    }
  ]
}
```

## Next Steps:
1. ✅ Fixed data structure created
2. ⏳ Need to implement this corrected data in the recurring CAPEX system
3. ⏳ Verify the auto-generation logic works with the correct structure

Would you like me to implement this fixed data structure in your recurring CAPEX system?