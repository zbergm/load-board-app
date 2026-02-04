"""Outbound shipment endpoints."""

from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from database import get_db
from models import (
    OutboundShipmentCreate,
    OutboundShipmentUpdate,
)

router = APIRouter()


def row_to_dict(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(zip(row.keys(), row))


@router.get("/", response_model=dict)
async def get_outbound_shipments(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    source: Optional[str] = None,
    carrier: Optional[str] = None,
    customer: Optional[str] = None,
    shipped: Optional[bool] = None,
    pending_routing: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
):
    """Get all outbound shipments with filtering and pagination."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Build query
        query = "SELECT * FROM outbound_shipments WHERE 1=1"
        count_query = "SELECT COUNT(*) FROM outbound_shipments WHERE 1=1"
        params = []

        if source:
            query += " AND source = ?"
            count_query += " AND source = ?"
            params.append(source)

        if carrier:
            query += " AND carrier LIKE ?"
            count_query += " AND carrier LIKE ?"
            params.append(f"%{carrier}%")

        if customer:
            query += " AND customer LIKE ?"
            count_query += " AND customer LIKE ?"
            params.append(f"%{customer}%")

        if shipped is not None:
            query += " AND shipped = ?"
            count_query += " AND shipped = ?"
            params.append(1 if shipped else 0)

        if pending_routing is not None:
            if pending_routing:
                # Filter for shipments missing reference_number, ship_date, or carrier
                # Must have order_number to be considered Pending Routing
                routing_clause = " AND order_number IS NOT NULL AND order_number != '' AND (reference_number IS NULL OR reference_number = '' OR ship_date IS NULL OR carrier IS NULL OR carrier = '')"
            else:
                # Filter for shipments that have all routing info
                routing_clause = " AND reference_number IS NOT NULL AND reference_number != '' AND ship_date IS NOT NULL AND carrier IS NOT NULL AND carrier != ''"
            query += routing_clause
            count_query += routing_clause

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
                reference_number LIKE ? OR
                order_number LIKE ? OR
                customer LIKE ? OR
                carrier LIKE ? OR
                notes LIKE ?
            )"""
            query += search_clause
            count_query += search_clause
            search_param = f"%{search}%"
            params.extend([search_param] * 5)

        # Get total count
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]

        # Add pagination - sort non-shipped items first, then by ship date
        query += " ORDER BY shipped ASC, ship_date DESC, id DESC LIMIT ? OFFSET ?"
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
async def get_outbound_shipment(shipment_id: int):
    """Get a single outbound shipment by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        return row_to_dict(row)


@router.post("/", response_model=dict)
async def create_outbound_shipment(shipment: OutboundShipmentCreate):
    """Create a new outbound shipment."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO outbound_shipments (
                source, reference_number, order_number, customer, ship_date,
                carrier, shipped, delayed, actual_date, pallets, pro, seal, notes,
                pickup_time, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            shipment.source,
            shipment.reference_number,
            shipment.order_number,
            shipment.customer,
            shipment.ship_date.isoformat() if shipment.ship_date else None,
            shipment.carrier,
            1 if shipment.shipped else 0,
            1 if shipment.delayed else 0,
            shipment.actual_date.isoformat() if shipment.actual_date else None,
            shipment.pallets,
            shipment.pro,
            shipment.seal,
            shipment.notes,
            shipment.pickup_time,
            datetime.now().isoformat(),
            datetime.now().isoformat(),
        ))

        shipment_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()
        return row_to_dict(row)


@router.put("/{shipment_id}")
async def update_outbound_shipment(shipment_id: int, shipment: OutboundShipmentUpdate):
    """Update an existing outbound shipment."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if shipment exists
        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
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
        if "actual_date" in update_data and update_data["actual_date"]:
            update_data["actual_date"] = update_data["actual_date"].isoformat()

        # Handle boolean conversion
        if "shipped" in update_data:
            update_data["shipped"] = 1 if update_data["shipped"] else 0
        if "delayed" in update_data:
            update_data["delayed"] = 1 if update_data["delayed"] else 0

        update_data["updated_at"] = datetime.now().isoformat()

        set_clause = ", ".join([f"{k} = ?" for k in update_data.keys()])
        values = list(update_data.values())
        values.append(shipment_id)

        cursor.execute(f"UPDATE outbound_shipments SET {set_clause} WHERE id = ?", values)
        conn.commit()

        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()
        return row_to_dict(row)


@router.delete("/{shipment_id}")
async def delete_outbound_shipment(shipment_id: int):
    """Delete an outbound shipment."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Shipment not found")

        cursor.execute("DELETE FROM outbound_shipments WHERE id = ?", (shipment_id,))
        conn.commit()

        return {"message": "Shipment deleted successfully"}


@router.post("/{shipment_id}/mark-shipped")
async def mark_as_shipped(shipment_id: int):
    """Mark a shipment as shipped with current timestamp."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Shipment not found")

        now = datetime.now()
        cursor.execute("""
            UPDATE outbound_shipments
            SET shipped = 1,
                actual_date = ?,
                pickup_time = ?,
                updated_at = ?
            WHERE id = ?
        """, (
            now.date().isoformat(),
            now.strftime("%H:%M"),
            now.isoformat(),
            shipment_id
        ))
        conn.commit()

        cursor.execute("SELECT * FROM outbound_shipments WHERE id = ?", (shipment_id,))
        row = cursor.fetchone()
        return row_to_dict(row)
