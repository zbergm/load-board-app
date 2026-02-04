# Load Board Power App - Import Guide

Your actual Load Board data has been exported. Follow these steps to create the Power App.

---

## Step 1: Create SharePoint Lists from CSV Files

### Import Order (important - do reference data first):

**1. Carriers List:**
1. Go to your SharePoint site → **Site Contents** → **+ New** → **List**
2. Select **From CSV**
3. Upload `Carriers.csv`
4. Name it: **Carriers**
5. Click **Create**

**2. Customers List:**
1. **+ New** → **List** → **From CSV**
2. Upload `Customers.csv`
3. Name it: **Customers**
4. Click **Create**

**3. OutboundShipments List:**
1. **+ New** → **List** → **From CSV**
2. Upload `OutboundShipments.csv`
3. Name it: **OutboundShipments**
4. Click **Create**

**4. InboundShipments List:**
1. **+ New** → **List** → **From CSV**
2. Upload `InboundShipments.csv`
3. Name it: **InboundShipments**
4. Click **Create**

---

## Step 2: Create the Power App

1. Go to **https://make.powerapps.com**
2. Click **+ Create** in the left sidebar
3. Click **Start with data**
4. Select **SharePoint**
5. Connect to your SharePoint site
6. Select **OutboundShipments**
7. Click **Create app**

This creates a basic 3-screen app automatically.

---

## Step 3: Customize the Browse Screen (Outbound List)

### Add Status Badge
1. In the gallery, add a **Label**
2. Set **Text** property:
```
If(
    ThisItem.shipped = 1 && ThisItem.delayed = 1,
    "Shipped/Late",
    ThisItem.shipped = 1,
    "Shipped",
    IsBlank(ThisItem.reference_number) || IsBlank(ThisItem.ship_date) || IsBlank(ThisItem.carrier),
    "Pending Routing",
    DateValue(ThisItem.ship_date) < Today(),
    "Overdue",
    "Pending"
)
```

3. Set **Fill** property (badge background):
```
Switch(
    Self.Text,
    "Shipped", RGBA(220, 252, 231, 1),
    "Shipped/Late", RGBA(220, 252, 231, 1),
    "Pending Routing", RGBA(243, 232, 255, 1),
    "Overdue", RGBA(254, 226, 226, 1),
    "Pending", RGBA(254, 249, 195, 1),
    White
)
```

4. Set **Color** property (badge text):
```
Switch(
    Self.Text,
    "Shipped", RGBA(21, 128, 61, 1),
    "Shipped/Late", RGBA(21, 128, 61, 1),
    "Pending Routing", RGBA(107, 33, 168, 1),
    "Overdue", RGBA(185, 28, 28, 1),
    "Pending", RGBA(161, 98, 7, 1),
    Black
)
```

---

## Step 4: Add Row Highlighting

Set the gallery's **TemplateFill** property:
```
If(
    ThisItem.shipped = 1,
    White,
    IsBlank(ThisItem.reference_number) || IsBlank(ThisItem.ship_date) || IsBlank(ThisItem.carrier),
    RGBA(250, 245, 255, 1),
    DateValue(ThisItem.ship_date) < Today(),
    RGBA(254, 242, 242, 1),
    DateValue(ThisItem.ship_date) = Today(),
    RGBA(254, 252, 232, 1),
    White
)
```

---

## Step 5: Add Inbound Screen

1. Click **New screen** → **Blank**
2. Add a **Gallery** → Connect to **InboundShipments**
3. Add navigation button on home screen

### Inbound Status Formula:
```
If(
    ThisItem.received = 1,
    "Received",
    DateValue(ThisItem.ship_date) < Today(),
    "Overdue",
    "Pending"
)
```

---

## Step 6: Add Filter Dropdown

1. Add a **Dropdown** above the gallery
2. Set **Items**: `["All", "Pending Routing", "Pending", "Shipped", "Overdue"]`
3. Update gallery **Items** to filter:
```
If(
    Dropdown1.Selected.Value = "All",
    OutboundShipments,
    Dropdown1.Selected.Value = "Shipped",
    Filter(OutboundShipments, shipped = 1),
    Dropdown1.Selected.Value = "Pending Routing",
    Filter(OutboundShipments, shipped = 0 && (IsBlank(reference_number) || IsBlank(ship_date) || IsBlank(carrier))),
    Dropdown1.Selected.Value = "Overdue",
    Filter(OutboundShipments, shipped = 0 && DateValue(ship_date) < Today()),
    Filter(OutboundShipments, shipped = 0)
)
```

---

## Step 7: Add Mark as Shipped Button

1. Add an **Icon** (checkmark) in the gallery
2. Set **Visible**: `ThisItem.shipped = 0`
3. Set **OnSelect**:
```
Patch(
    OutboundShipments,
    ThisItem,
    {
        shipped: 1,
        actual_date: Today(),
        pickup_time: Text(Now(), "hh:mm"),
        delayed: If(DateValue(ThisItem.ship_date) < Today(), 1, 0)
    }
)
```

---

## Step 8: Save and Share

1. **File** → **Save** → Name your app "Load Board"
2. **Publish**
3. **Share** → Add your employees

---

## Data Exported

| File | Records |
|------|---------|
| Carriers.csv | 141 carriers |
| Customers.csv | 7 customers |
| OutboundShipments.csv | 75 shipments |
| InboundShipments.csv | 43 shipments |

---

## Column Reference

### OutboundShipments
- reference_number, order_number, customer, ship_date, carrier
- shipped (0/1), delayed (0/1), actual_date
- pallets, pro, seal, notes, pickup_time

### InboundShipments
- item_number, cases, po, carrier, bol_number
- tp_receipt_number, ship_date, received (0/1)
- pallets, notes
