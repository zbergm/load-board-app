"""Inbound shipment endpoints."""

from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from database import get_db
from models import (
    InboundShipment,
    InboundShipmentCreate,
    InboundShipmentUpdate,
)

router = APIRouter()


def row_to_dict(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(zip(row.keys(), row))


@router.get("/", response_model=dict)
async def get_inbound_shipments(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    source: Optional[str] = None,
    carrier: Optional[str] = None,
    received: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
):
    """Get all inbound shipments with filtering and pagination."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Build query
        query = "SELECT * FROM inbound_shipments WHERE 1=1"
        count_query = "SELECT COUNT(*) FROM inbound_shipments WHERE 1=1"
        params = []

        if source:
            query += " AND source = ?"
            count_query += " AND source = ?"
            params.append(source)

        if carrier:
            query += " AND carrier LIKE ?"
            count_query += " AND carrier LIKE ?"
            params.append(f"%{carrier}%")

        if received is not None:
            query += " AND received = ?"
            count_query += " AND received = ?"
            params.append(1 if received else 0)

        if start_date:
            query += " AND ship_date >= ?"
            count_query += " AND ship_date >= ?"
            params.append(start_date.isoformat())

        if end_date:
            query += " AND ship_date <= ?"
            count_query += " AND ship_date <= ?"
            params.append(end_date.isoformat())

        if search:
            search_clause = """ AND (
                item_number LIKE ? OR
                po LIKE ? OR
                carrier LIKE ? OR
                bol_number LIKE ? OR
                notes LIKE ?
            )"""
            query += search_clause
            count_query += search_clause
            search_param = f"%{search}%"
            params.extend([search_param] * 5)

        # Get total count
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]

        # Add pagination
        query += " ORDER BY ship_date DESC, id DESC LIMIT ? OFFSET ?"
        params.extend([page_size, (page - 1) * page_size])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        items = [row_to_dict(row) for row in rows]
        total_pages = (total + page_size - 1) // page_size

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }


@router.get("/{shipment_id}")
async def get_inbound_shipment(shipment_id: int):
    """Get a single inbound shipment by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        return row_to_dict(row)


@router.post("/", response_model=dict)
async def create_inbound_shipment(shipment: InboundShipmentCreate):
    """Create a new inbound shipment."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO inbound_shipments (
                source, item_number, cases, po, carrier, bol_number,
                tp_receipt_number, ship_date, received, pallets, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            shipment.source,
            shipment.item_number,
            shipment.cases,
            shipment.po,
            shipment.carrier,
            shipment.bol_number,
            shipment.tp_receipt_number,
            shipment.ship_date.isoformat() if shipment.ship_date else None,
            1 if shipment.received else 0,
            shipment.pallets,
            shipment.notes,
            datetime.now().isoformat(),
            datetime.now().isoformat(),
        ))

        shipment_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()
        return row_to_dict(row)


@router.put("/{shipment_id}")
async def update_inbound_shipment(shipment_id: int, shipment: InboundShipmentUpdate):
    """Update an existing inbound shipment."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if shipment exists
        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Shipment not found")

        # Build update query with only provided fields
        update_data = shipment.model_dump(exclude_unset=True)
        if not update_data:
            return row_to_dict(existing)

        # Handle date conversion
        if "ship_date" in update_data and update_data["ship_date"]:
            update_data["ship_date"] = update_data["ship_date"].isoformat()

        # Handle boolean conversion
        if "received" in update_data:
            update_data["received"] = 1 if update_data["received"] else 0

        update_data["updated_at"] = datetime.now().isoformat()

        set_clause = ", ".join([f"{k} = ?" for k in update_data.keys()])
        values = list(update_data.values())
        values.append(shipment_id)

        cursor.execute(f"UPDATE inbound_shipments SET {set_clause} WHERE id = ?", values)
        conn.commit()

        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()
        return row_to_dict(row)


@router.delete("/{shipment_id}")
async def delete_inbound_shipment(shipment_id: int):
    """Delete an inbound shipment."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Shipment not found")

        cursor.execute("DELETE FROM inbound_shipments WHERE id = ?", (shipment_id,))
        conn.commit()

        return {"message": "Shipment deleted successfully"}


@router.post("/{shipment_id}/mark-received")
async def mark_as_received(shipment_id: int):
    """Mark a shipment as received."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Shipment not found")

        cursor.execute("""
            UPDATE inbound_shipments
            SET received = 1, updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), shipment_id))
        conn.commit()

        cursor.execute("SELECT * FROM inbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()
        return row_to_dict(row)
