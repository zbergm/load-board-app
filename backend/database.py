"""Database connection and setup for SQLite."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from config import DATABASE_PATH


def get_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(str(DATABASE_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    """Initialize the database with all required tables."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Inbound shipments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inbound_shipments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL CHECK(source IN ('TP', 'OTHER')),
                item_number TEXT,
                cases INTEGER,
                po TEXT,
                carrier TEXT,
                bol_number TEXT,
                tp_receipt_number TEXT,
                ship_date DATE,
                received INTEGER DEFAULT 0,
                pallets REAL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                synced_at TIMESTAMP,
                excel_row INTEGER
            )
        """)

        # Outbound shipments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS outbound_shipments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL CHECK(source IN ('TP', 'OTHER')),
                reference_number TEXT,
                order_number TEXT,
                customer TEXT,
                ship_date DATE,
                carrier TEXT,
                shipped INTEGER DEFAULT 0,
                delayed INTEGER DEFAULT 0,
                actual_date DATE,
                pallets REAL,
                pro TEXT,
                seal TEXT,
                notes TEXT,
                pickup_time TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                synced_at TIMESTAMP,
                excel_row INTEGER
            )
        """)

        # Add delayed column if it doesn't exist (migration for existing databases)
        try:
            cursor.execute("ALTER TABLE outbound_shipments ADD COLUMN delayed INTEGER DEFAULT 0")
        except sqlite3.OperationalError:
            pass  # Column already exists

        # Carriers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS carriers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            )
        """)

        # Customers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            )
        """)

        # Products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_number TEXT UNIQUE NOT NULL,
                items_per_case INTEGER,
                items_per_pallet INTEGER,
                cases_per_pallet INTEGER,
                layers_per_pallet INTEGER,
                cases_per_layer INTEGER,
                notes TEXT,
                wm_items_per_pallet INTEGER,
                wm_cases_per_pallet INTEGER,
                wm_layers_per_pallet INTEGER,
                wm_cases_per_layer INTEGER
            )
        """)

        # Sync log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sync_type TEXT CHECK(sync_type IN ('import', 'export')),
                status TEXT,
                records_processed INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details TEXT
            )
        """)

        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_inbound_date ON inbound_shipments(ship_date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_inbound_source ON inbound_shipments(source)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_outbound_date ON outbound_shipments(ship_date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_outbound_source ON outbound_shipments(source)")

        conn.commit()


if __name__ == "__main__":
    init_database()
    print(f"Database initialized at {DATABASE_PATH}")
