# Power Fx Formulas Reference - Load Board

Copy/paste these formulas into your Power App.

---

## Status Calculation (Outbound)

### Status Text
```
If(
    ThisItem.Shipped && ThisItem.Delayed,
    "Shipped/Late",
    ThisItem.Shipped,
    "Shipped",
    IsBlank(ThisItem.Title) || IsBlank(ThisItem.ShipDate) || IsBlank(ThisItem.Carrier),
    "Pending Routing",
    ThisItem.ShipDate < Today(),
    "Overdue",
    "Pending"
)
```

### Status Badge Fill Color
```
Switch(
    Self.Text,
    "Shipped", RGBA(220, 252, 231, 1),
    "Shipped/Late", RGBA(220, 252, 231, 1),
    "Pending Routing", RGBA(243, 232, 255, 1),
    "Overdue", RGBA(254, 226, 226, 1),
    "Pending", RGBA(254, 249, 195, 1),
    RGBA(243, 244, 246, 1)
)
```

### Status Badge Text Color
```
Switch(
    Self.Text,
    "Shipped", RGBA(21, 128, 61, 1),
    "Shipped/Late", RGBA(21, 128, 61, 1),
    "Pending Routing", RGBA(107, 33, 168, 1),
    "Overdue", RGBA(185, 28, 28, 1),
    "Pending", RGBA(161, 98, 7, 1),
    RGBA(75, 85, 99, 1)
)
```

---

## Status Calculation (Inbound)

### Status Text
```
If(
    ThisItem.Received,
    "Received",
    ThisItem.ShipDate < Today(),
    "Overdue",
    "Pending"
)
```

---

## Row Background Colors

### Outbound Gallery TemplateFill
```
If(
    ThisItem.Shipped,
    RGBA(255, 255, 255, 1),
    IsBlank(ThisItem.Title) || IsBlank(ThisItem.ShipDate) || IsBlank(ThisItem.Carrier),
    RGBA(250, 245, 255, 1),
    ThisItem.ShipDate < Today(),
    RGBA(254, 242, 242, 1),
    ThisItem.ShipDate = Today(),
    RGBA(254, 252, 232, 1),
    RGBA(255, 255, 255, 1)
)
```

### Inbound Gallery TemplateFill
```
If(
    ThisItem.Received,
    RGBA(255, 255, 255, 1),
    ThisItem.ShipDate < Today(),
    RGBA(254, 242, 242, 1),
    ThisItem.ShipDate = Today(),
    RGBA(254, 252, 232, 1),
    RGBA(255, 255, 255, 1)
)
```

---

## Filtering

### Outbound Gallery Items
```
Sort(
    Filter(
        OutboundShipments,
        // Search
        IsBlank(txtSearch.Text) ||
        txtSearch.Text in Title ||
        txtSearch.Text in OrderNumber ||
        txtSearch.Text in Notes,
        // Source
        ddSource.Selected.Value = "All" ||
        Source.Value = ddSource.Selected.Value,
        // Status
        ddStatus.Selected.Value = "All" ||
        (ddStatus.Selected.Value = "Shipped" && Shipped) ||
        (ddStatus.Selected.Value = "Pending" && !Shipped && !IsBlank(Title) && !IsBlank(ShipDate) && !IsBlank(Carrier) && ShipDate >= Today()) ||
        (ddStatus.Selected.Value = "Pending Routing" && !Shipped && (IsBlank(Title) || IsBlank(ShipDate) || IsBlank(Carrier))) ||
        (ddStatus.Selected.Value = "Overdue" && !Shipped && !IsBlank(ShipDate) && ShipDate < Today())
    ),
    Shipped,
    SortOrder.Ascending,
    ShipDate,
    SortOrder.Descending
)
```

### Inbound Gallery Items
```
Sort(
    Filter(
        InboundShipments,
        IsBlank(txtSearchInbound.Text) ||
        txtSearchInbound.Text in Title ||
        txtSearchInbound.Text in PO ||
        txtSearchInbound.Text in BOLNumber,
        ddSourceInbound.Selected.Value = "All" ||
        Source.Value = ddSourceInbound.Selected.Value,
        ddStatusInbound.Selected.Value = "All" ||
        (ddStatusInbound.Selected.Value = "Received" && Received) ||
        (ddStatusInbound.Selected.Value = "Pending" && !Received)
    ),
    Received,
    SortOrder.Ascending,
    ShipDate,
    SortOrder.Descending
)
```

---

## Actions

### Mark Outbound as Shipped
```
Patch(
    OutboundShipments,
    ThisItem,
    {
        Shipped: true,
        ActualDate: Today(),
        PickupTime: Text(Now(), "hh:mm"),
        Delayed: If(ThisItem.ShipDate < Today(), true, false)
    }
)
```

### Mark Inbound as Received
```
Patch(
    InboundShipments,
    ThisItem,
    {
        Received: true
    }
)
```

### Delete with Confirmation
```
If(
    Confirm("Are you sure you want to delete this shipment?", ConfirmButton.No),
    Remove(OutboundShipments, ThisItem)
)
```

---

## Navigation

### Edit Button OnSelect
```
Set(varEditShipment, ThisItem);
Navigate(OutboundFormScreen, ScreenTransition.Cover)
```

### Add New Button OnSelect
```
Set(varEditShipment, Blank());
Navigate(OutboundFormScreen, ScreenTransition.Cover)
```

### Back/Cancel Button OnSelect
```
ResetForm(frmOutbound);
Set(varEditShipment, Blank());
Back()
```

### Save Button OnSelect
```
SubmitForm(frmOutbound);
Notify("Shipment saved!", NotificationType.Success);
Set(varEditShipment, Blank());
Back()
```

---

## Dashboard Stats

### Pending Outbound Today
```
CountRows(
    Filter(OutboundShipments, ShipDate = Today() && !Shipped)
)
```

### Pending Inbound Today
```
CountRows(
    Filter(InboundShipments, ShipDate = Today() && !Received)
)
```

### Overdue Outbound
```
CountRows(
    Filter(OutboundShipments, ShipDate < Today() && !Shipped)
)
```

### Pending Routing Count
```
CountRows(
    Filter(
        OutboundShipments,
        !Shipped && (IsBlank(Title) || IsBlank(ShipDate) || IsBlank(Carrier))
    )
)
```

### Shipped This Week
```
CountRows(
    Filter(
        OutboundShipments,
        Shipped &&
        ActualDate >= DateAdd(Today(), -7, TimeUnit.Days)
    )
)
```

---

## Form Configuration

### Form DefaultMode
```
If(IsBlank(varEditShipment), FormMode.New, FormMode.Edit)
```

### Form Item
```
varEditShipment
```

---

## Date Formatting

### Display Date
```
Text(ThisItem.ShipDate, "mm/dd/yyyy")
```

### Display with Day Name
```
Text(ThisItem.ShipDate, "ddd mm/dd/yyyy")
```

### Time Display
```
If(IsBlank(ThisItem.PickupTime), "-", ThisItem.PickupTime)
```
