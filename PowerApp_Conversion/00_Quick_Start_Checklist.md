# Load Board Power App - Quick Start Checklist

## Prerequisites
- [ ] Microsoft 365 account with Power Apps license (included in most business plans)
- [ ] Access to a SharePoint site where you can create lists
- [ ] Power Apps Maker portal access: https://make.powerapps.com

---

## Step-by-Step Checklist

### Phase 1: Create SharePoint Lists (15-20 min)
- [ ] Go to your SharePoint site > Site Contents > New > List
- [ ] Create **Carriers** list (just Name column)
- [ ] Create **Customers** list (just Name column)
- [ ] Create **OutboundShipments** list (see 01_SharePoint_Lists.md for columns)
- [ ] Create **InboundShipments** list (see 01_SharePoint_Lists.md for columns)
- [ ] Add some test data to Carriers and Customers lists

### Phase 2: Create Power App (5 min)
- [ ] Go to https://make.powerapps.com
- [ ] Click **+ Create** > **Blank app** > **Blank canvas app**
- [ ] Name: "Load Board", Format: **Tablet**
- [ ] Connect SharePoint data source (all 4 lists)

### Phase 3: Build Screens (30-45 min)
- [ ] Create HomeScreen with navigation buttons
- [ ] Create OutboundScreen with gallery and filters
- [ ] Create OutboundFormScreen with edit form
- [ ] Create InboundScreen with gallery and filters
- [ ] Create InboundFormScreen with edit form

### Phase 4: Add Logic (20-30 min)
- [ ] Add status badge formulas (copy from 03_PowerFx_Formulas.md)
- [ ] Add row highlighting formulas
- [ ] Add filter logic to galleries
- [ ] Add Mark Shipped/Received buttons
- [ ] Add Edit and Delete buttons

### Phase 5: Polish & Publish (10-15 min)
- [ ] Test all CRUD operations
- [ ] Add app icon and splash screen
- [ ] Click **File** > **Save** > **Publish**
- [ ] Click **Share** and add your employees

---

## Sharing Options

### Option A: Power Apps Mobile
Employees install "Power Apps" from App Store/Google Play and sign in with work account.

### Option B: Web Browser
Share link to https://apps.powerapps.com - employees find app there.

### Option C: Microsoft Teams
Add the app as a tab in a Teams channel for easy access.

---

## Files in This Folder

| File | Description |
|------|-------------|
| 00_Quick_Start_Checklist.md | This file - overview checklist |
| 01_SharePoint_Lists.md | Detailed SharePoint list schemas |
| 02_PowerApp_Build_Guide.md | Step-by-step build instructions |
| 03_PowerFx_Formulas.md | Copy/paste formulas for all logic |

---

## Need Help?

- **Power Apps Documentation**: https://docs.microsoft.com/en-us/power-apps/
- **Power Apps Community**: https://powerusers.microsoft.com/
- **YouTube**: Search "Power Apps SharePoint tutorial"

---

## Estimated Total Time: 1.5 - 2 hours

This assumes basic familiarity with Power Apps. If it's your first app, budget extra time for learning the interface.
