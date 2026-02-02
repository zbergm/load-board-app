# Power App Build Guide - Load Board

## Step 1: Create the App

1. Go to https://make.powerapps.com
2. Click **+ Create** > **Blank app** > **Blank canvas app**
3. Name: "Load Board"
4. Format: **Tablet** (recommended for data-heavy apps)
5. Click **Create**

---

## Step 2: Connect Data Sources

1. Click **Data** in left panel
2. Click **Add data**
3. Search for **SharePoint**
4. Select your SharePoint site
5. Select these lists:
   - OutboundShipments
   - InboundShipments
   - Carriers
   - Customers

---

## Step 3: Create Screens

Create these screens (Insert > New screen > Blank):

1. **HomeScreen** - Dashboard/navigation
2. **OutboundScreen** - Outbound shipments list
3. **OutboundFormScreen** - Add/Edit outbound shipment
4. **InboundScreen** - Inbound shipments list
5. **InboundFormScreen** - Add/Edit inbound shipment

---

## Step 4: Build HomeScreen

### Navigation Buttons
Add two buttons:

**Outbound Button:**
- Text: `"Outbound Shipments"`
- OnSelect: `Navigate(OutboundScreen, ScreenTransition.Fade)`
- Fill: `RGBA(220, 38, 38, 1)` (red)

**Inbound Button:**
- Text: `"Inbound Shipments"`
- OnSelect: `Navigate(InboundScreen, ScreenTransition.Fade)`
- Fill: `RGBA(37, 99, 235, 1)` (blue)

### Stats Cards (Optional)
Add labels with these formulas:

```
// Pending Outbound Today
CountRows(
    Filter(OutboundShipments,
        ShipDate = Today() && !Shipped
    )
)

// Pending Inbound Today
CountRows(
    Filter(InboundShipments,
        ShipDate = Today() && !Received
    )
)
```

---

## Step 5: Build OutboundScreen

### Header
- Add a label: "Outbound Shipments"
- Add button: Text = "+ Add", OnSelect = `Navigate(OutboundFormScreen, ScreenTransition.Cover)`

### Filter Controls

**Search Box (TextInput):**
- Name: `txtSearch`
- HintText: `"Search..."`

**Status Dropdown:**
- Name: `ddStatus`
- Items: `["All", "Pending Routing", "Pending", "Shipped", "Overdue"]`
- Default: `"All"`

**Source Dropdown:**
- Name: `ddSource`
- Items: `["All", "TP", "OTHER"]`
- Default: `"All"`

### Gallery (Shipments List)

1. Insert > Gallery > **Blank vertical**
2. Name: `galOutbound`
3. Set **Items** property to:

```
Sort(
    Filter(
        OutboundShipments,
        // Search filter
        (IsBlank(txtSearch.Text) ||
         txtSearch.Text in Title ||
         txtSearch.Text in OrderNumber ||
         txtSearch.Text in Customer.Value ||
         txtSearch.Text in Notes),
        // Source filter
        (ddSource.Selected.Value = "All" || Source.Value = ddSource.Selected.Value),
        // Status filter
        (ddStatus.Selected.Value = "All" ||
         (ddStatus.Selected.Value = "Shipped" && Shipped) ||
         (ddStatus.Selected.Value = "Pending" && !Shipped && !IsBlank(Title) && !IsBlank(ShipDate) && !IsBlank(Carrier)) ||
         (ddStatus.Selected.Value = "Pending Routing" && !Shipped && (IsBlank(Title) || IsBlank(ShipDate) || IsBlank(Carrier))) ||
         (ddStatus.Selected.Value = "Overdue" && !Shipped && ShipDate < Today())
        )
    ),
    ShipDate,
    SortOrder.Descending
)
```

### Inside the Gallery - Add these controls:

**Status Badge (Label):**
```
// Text property:
If(
    ThisItem.Shipped && ThisItem.Delayed, "Shipped/Late",
    ThisItem.Shipped, "Shipped",
    IsBlank(ThisItem.Title) || IsBlank(ThisItem.ShipDate) || IsBlank(ThisItem.Carrier), "Pending Routing",
    ThisItem.ShipDate < Today(), "Overdue",
    "Pending"
)

// Fill property:
Switch(
    Self.Text,
    "Shipped", RGBA(34, 197, 94, 0.2),
    "Shipped/Late", RGBA(34, 197, 94, 0.2),
    "Pending Routing", RGBA(168, 85, 247, 0.2),
    "Overdue", RGBA(239, 68, 68, 0.2),
    "Pending", RGBA(234, 179, 8, 0.2)
)

// Color property:
Switch(
    Self.Text,
    "Shipped", RGBA(21, 128, 61, 1),
    "Shipped/Late", RGBA(21, 128, 61, 1),
    "Pending Routing", RGBA(107, 33, 168, 1),
    "Overdue", RGBA(185, 28, 28, 1),
    "Pending", RGBA(161, 98, 7, 1)
)
```

**Other Labels:**
- Ship Date: `Text(ThisItem.ShipDate, "mm/dd/yyyy")`
- Reference #: `ThisItem.Title`
- Customer: `ThisItem.Customer.Value`
- Carrier: `ThisItem.Carrier.Value`
- Pallets: `ThisItem.Pallets`

**Edit Button (Icon):**
- Icon: `Icon.Edit`
- OnSelect:
```
Set(varEditShipment, ThisItem);
Navigate(OutboundFormScreen, ScreenTransition.Cover)
```

**Mark Shipped Button (Icon):**
- Icon: `Icon.Check`
- Visible: `!ThisItem.Shipped`
- OnSelect:
```
Patch(
    OutboundShipments,
    ThisItem,
    {
        Shipped: true,
        ActualDate: Today(),
        PickupTime: Text(Now(), "hh:mm")
    }
)
```

**Delete Button (Icon):**
- Icon: `Icon.Trash`
- OnSelect:
```
If(
    Confirm("Delete this shipment?"),
    Remove(OutboundShipments, ThisItem)
)
```

---

## Step 6: Build OutboundFormScreen

### Form Control

1. Insert > **Edit form**
2. DataSource: `OutboundShipments`
3. Item: `varEditShipment`
4. DefaultMode: `If(IsBlank(varEditShipment), FormMode.New, FormMode.Edit)`

### Fields to Include:
- Source (dropdown)
- Title (rename label to "Reference Number")
- OrderNumber
- Customer (lookup dropdown)
- ShipDate
- Carrier (lookup dropdown)
- Pallets
- Pro
- Seal
- PickupTime
- Notes

### Buttons:

**Save Button:**
```
OnSelect:
SubmitForm(Form1);
Set(varEditShipment, Blank());
Navigate(OutboundScreen, ScreenTransition.UnCover)
```

**Cancel Button:**
```
OnSelect:
ResetForm(Form1);
Set(varEditShipment, Blank());
Navigate(OutboundScreen, ScreenTransition.UnCover)
```

---

## Step 7: Build InboundScreen

Same pattern as OutboundScreen but with:
- Data source: `InboundShipments`
- Different columns: ItemNumber, Cases, PO, BOLNumber, etc.
- "Mark Received" instead of "Mark Shipped"
- Status logic without "Pending Routing"

### Gallery Items Formula:
```
Sort(
    Filter(
        InboundShipments,
        (IsBlank(txtSearchInbound.Text) ||
         txtSearchInbound.Text in Title ||
         txtSearchInbound.Text in PO ||
         txtSearchInbound.Text in BOLNumber),
        (ddSourceInbound.Selected.Value = "All" || Source.Value = ddSourceInbound.Selected.Value),
        (ddStatusInbound.Selected.Value = "All" ||
         (ddStatusInbound.Selected.Value = "Received" && Received) ||
         (ddStatusInbound.Selected.Value = "Pending" && !Received)
        )
    ),
    ShipDate,
    SortOrder.Descending
)
```

---

## Step 8: Row Highlighting

For gallery row background colors, set the **TemplateFill** property:

```
If(
    ThisItem.Shipped, RGBA(255, 255, 255, 1),
    ThisItem.ShipDate < Today(), RGBA(254, 242, 242, 1),
    ThisItem.ShipDate = Today(), RGBA(254, 252, 232, 1),
    RGBA(255, 255, 255, 1)
)
```

---

## Step 9: Publish and Share

1. Click **File** > **Save**
2. Click **Publish**
3. Click **Share**
4. Add users or security groups
5. Users can access via:
   - Power Apps mobile app
   - https://apps.powerapps.com
   - Teams (if you add it as a tab)

---

## Tips

- **Performance**: Use `ShowColumns()` to limit data if lists get large
- **Offline**: Enable offline mode in app settings for mobile use
- **Delegation**: SharePoint supports delegation for Filter/Sort up to 5000 items
- **Refresh**: Add a refresh button with `Refresh(OutboundShipments)`
