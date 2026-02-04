"""Dashboard and analytics endpoints."""

from datetime import datetime, date, timedelta
from fastapi import APIRouter

from database import get_db
from models import DashboardStats

router = APIRouter()


def row_to_dict(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(zip(row.keys(), row))


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics."""
    today = date.today().isoformat()
    week_ago = (date.today() - timedelta(days=7)).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()

        # Today's inbound
        cursor.execute(
            "SELECT COUNT(*) FROM inbound_shipments WHERE ship_date = ?",
            (today,)
        )
        total_inbound_today = cursor.fetchone()[0]

        # Today's outbound
        cursor.execute(
            "SELECT COUNT(*) FROM outbound_shipments WHERE ship_date = ?",
            (today,)
        )
        total_outbound_today = cursor.fetchone()[0]

        # Pending inbound (today, not received)
        cursor.execute(
            "SELECT COUNT(*) FROM inbound_shipments WHERE ship_date = ? AND received = 0",
            (today,)
        )
        pending_inbound = cursor.fetchone()[0]

        # Pending outbound (today, not shipped)
        cursor.execute(
            "SELECT COUNT(*) FROM outbound_shipments WHERE ship_date = ? AND shipped = 0",
            (today,)
        )
        pending_outbound = cursor.fetchone()[0]

        # Completed inbound today
        cursor.execute(
            "SELECT COUNT(*) FROM inbound_shipments WHERE ship_date = ? AND received = 1",
            (today,)
        )
        completed_inbound_today = cursor.fetchone()[0]

        # Completed outbound today
        cursor.execute(
            "SELECT COUNT(*) FROM outbound_shipments WHERE ship_date = ? AND shipped = 1",
            (today,)
        )
        completed_outbound_today = cursor.fetchone()[0]

        # Overdue inbound (past date, not received)
        cursor.execute(
            "SELECT COUNT(*) FROM inbound_shipments WHERE ship_date < ? AND received = 0",
            (today,)
        )
        overdue_inbound = cursor.fetchone()[0]

        # Overdue outbound (past date, not shipped)
        cursor.execute(
            "SELECT COUNT(*) FROM outbound_shipments WHERE ship_date < ? AND shipped = 0",
            (today,)
        )
        overdue_outbound = cursor.fetchone()[0]

        # This week's shipments
        cursor.execute(
            """SELECT COUNT(*) FROM (
                SELECT id FROM inbound_shipments WHERE ship_date >= ?
                UNION ALL
                SELECT id FROM outbound_shipments WHERE ship_date >= ?
            )""",
            (week_ago, week_ago)
        )
        shipments_this_week = cursor.fetchone()[0]

        return DashboardStats(
            total_inbound_today=total_inbound_today,
            total_outbound_today=total_outbound_today,
            pending_inbound=pending_inbound,
            pending_outbound=pending_outbound,
            completed_inbound_today=completed_inbound_today,
            completed_outbound_today=completed_outbound_today,
            overdue_inbound=overdue_inbound,
            overdue_outbound=overdue_outbound,
            shipments_this_week=shipments_this_week,
        )


@router.get("/shipments-by-carrier")
async def get_shipments_by_carrier():
    """Get shipment counts grouped by carrier for charts."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Combined inbound and outbound by carrier
        cursor.execute("""
            SELECT carrier, COUNT(*) as count FROM (
                SELECT carrier FROM inbound_shipments WHERE carrier IS NOT NULL
                UNION ALL
                SELECT carrier FROM outbound_shipments WHERE carrier IS NOT NULL
            )
            GROUP BY carrier
            ORDER BY count DESC
            LIMIT 10
        """)
        rows = cursor.fetchall()

        return [{"name": row[0] or "Unknown", "value": row[1]} for row in rows]


@router.get("/shipments-by-customer")
async def get_shipments_by_customer():
    """Get outbound shipment counts grouped by customer."""
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT customer, COUNT(*) as count
            FROM outbound_shipments
            WHERE customer IS NOT NULL
            GROUP BY customer
            ORDER BY count DESC
            LIMIT 10
        """)
        rows = cursor.fetchall()

        return [{"name": row[0] or "Unknown", "value": row[1]} for row in rows]


@router.get("/weekly-volume")
async def get_weekly_volume():
    """Get shipment volume by day for the last 7 days."""
    with get_db() as conn:
        cursor = conn.cursor()

        result = []
        for i in range(6, -1, -1):
            day = date.today() - timedelta(days=i)
            day_str = day.isoformat()
            day_name = day.strftime("%a")

            cursor.execute(
                "SELECT COUNT(*) FROM inbound_shipments WHERE ship_date = ?",
                (day_str,)
            )
            inbound = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COUNT(*) FROM outbound_shipments WHERE ship_date = ?",
                (day_str,)
            )
            outbound = cursor.fetchone()[0]

            result.append({
                "name": day_name,
                "date": day_str,
                "inbound": inbound,
                "outbound": outbound,
            })

        return result


@router.get("/today")
async def get_todays_shipments():
    """Get all shipments scheduled for today."""
    today = date.today().isoformat()

    with get_db() as conn:
        cursor = conn.cursor()

        # Inbound shipments today
        cursor.execute(
            "SELECT * FROM inbound_shipments WHERE ship_date = ? ORDER BY received, id",
            (today,)
        )
        inbound = [row_to_dict(row) for row in cursor.fetchall()]

        # Outbound shipments today
        cursor.execute(
            "SELECT * FROM outbound_shipments WHERE ship_date = ? ORDER BY shipped, pickup_time, id",
            (today,)
        )
        outbound = [row_to_dict(row) for row in cursor.fetchall()]

        return {
            "date": today,
            "inbound": inbound,
            "outbound": outbound,
        }


@router.get("/overdue")
async def get_overdue_shipments():
    """Get all overdue shipments (past date, not completed)."""
    today = date.today().isoformat()

    with get_db() as conn:
        cursor = conn.cursor()

        # Overdue inbound
        cursor.execute(
            "SELECT * FROM inbound_shipments WHERE ship_date < ? AND received = 0 ORDER BY ship_date",
            (today,)
        )
        inbound = [row_to_dict(row) for row in cursor.fetchall()]

        # Overdue outbound
        cursor.execute(
            "SELECT * FROM outbound_shipments WHERE ship_date < ? AND shipped = 0 ORDER BY ship_date",
            (today,)
        )
        outbound = [row_to_dict(row) for row in cursor.fetchall()]

        return {
            "inbound": inbound,
            "outbound": outbound,
        }


@router.get("/autozone-pallets")
async def get_autozone_pallets():
    """Get AutoZone pallet counts for current and previous month."""
    today = date.today()

    # Current month boundaries
    current_month_start = today.replace(day=1).isoformat()
    current_month_name = today.strftime("%B")

    # Previous month boundaries
    first_of_current = today.replace(day=1)
    last_of_previous = first_of_current - timedelta(days=1)
    previous_month_start = last_of_previous.replace(day=1).isoformat()
    previous_month_end = last_of_previous.isoformat()
    previous_month_name = last_of_previous.strftime("%B")

    with get_db() as conn:
        cursor = conn.cursor()

        # Current month AutoZone pallets (shipped only)
        cursor.execute("""
            SELECT COALESCE(SUM(pallets), 0)
            FROM outbound_shipments
            WHERE LOWER(customer) LIKE '%autozone%'
              AND shipped = 1
              AND (actual_date >= ? OR (actual_date IS NULL AND ship_date >= ?))
        """, (current_month_start, current_month_start))
        current_month_pallets = cursor.fetchone()[0] or 0

        # Previous month AutoZone pallets (shipped only)
        cursor.execute("""
            SELECT COALESCE(SUM(pallets), 0)
            FROM outbound_shipments
            WHERE LOWER(customer) LIKE '%autozone%'
              AND shipped = 1
              AND (
                (actual_date >= ? AND actual_date <= ?)
                OR (actual_date IS NULL AND ship_date >= ? AND ship_date <= ?)
              )
        """, (previous_month_start, previous_month_end, previous_month_start, previous_month_end))
        previous_month_pallets = cursor.fetchone()[0] or 0

        return {
            "current_month_name": current_month_name,
            "current_month_pallets": float(current_month_pallets),
            "previous_month_name": previous_month_name,
            "previous_month_pallets": float(previous_month_pallets),
        }
