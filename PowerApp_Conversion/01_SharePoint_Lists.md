# SharePoint Lists Setup for Load Board Power App

Create these lists in your SharePoint site. Go to Site Contents > New > List.

---

## 1. Outbound Shipments List

**List Name:** `OutboundShipments`

| Column Name | Type | Settings |
|-------------|------|----------|
| Title | Single line of text | (rename to "ReferenceNumber", not required) |
| Source | Choice | Choices: TP, OTHER. Required. |
| OrderNumber | Single line of text | |
| Customer | Lookup | Lookup to Customers list, Name column |
| ShipDate | Date only | |
| Carrier | Lookup | Lookup to Carriers list, Name column |
| Shipped | Yes/No | Default: No |
| Delayed | Yes/No | Default: No |
| ActualDate | Date only | |
| Pallets | Number | Decimal places: 1 |
| Pro | Single line of text | |
| Seal | Single line of text | |
| PickupTime | Single line of text | |
| Notes | Multiple lines of text | Plain text |

---

## 2. Inbound Shipments List

**List Name:** `InboundShipments`

| Column Name | Type | Settings |
|-------------|------|----------|
| Title | Single line of text | (rename to "ItemNumber", not required) |
| Source | Choice | Choices: TP, OTHER. Required. |
| Cases | Number | Decimal places: 0 |
| PO | Single line of text | |
| Carrier | Lookup | Lookup to Carriers list, Name column |
| BOLNumber | Single line of text | |
| TPReceiptNumber | Single line of text | |
| ShipDate | Date only | |
| Received | Yes/No | Default: No |
| Pallets | Number | Decimal places: 1 |
| Notes | Multiple lines of text | Plain text |

---

## 3. Carriers List

**List Name:** `Carriers`

| Column Name | Type | Settings |
|-------------|------|----------|
| Title | Single line of text | Rename to "Name". Required, Unique. |

---

## 4. Customers List

**List Name:** `Customers`

| Column Name | Type | Settings |
|-------------|------|----------|
| Title | Single line of text | Rename to "Name". Required, Unique. |

---

## 5. Products List (Optional)

**List Name:** `Products`

| Column Name | Type | Settings |
|-------------|------|----------|
| Title | Single line of text | Rename to "ItemNumber". Required, Unique. |
| ItemsPerCase | Number | |
| CasesPerPallet | Number | |
| LayersPerPallet | Number | |
| CasesPerLayer | Number | |
| Notes | Multiple lines of text | |
| WM_CasesPerPallet | Number | |
| WM_LayersPerPallet | Number | |
| WM_CasesPerLayer | Number | |

---

## Setup Order

1. Create Carriers list first
2. Create Customers list
3. Create Products list (optional)
4. Create InboundShipments list (with Carrier lookup)
5. Create OutboundShipments list (with Carrier and Customer lookups)
