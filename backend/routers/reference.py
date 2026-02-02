"""Reference data endpoints (carriers, customers, products)."""

from fastapi import APIRouter, HTTPException

from database import get_db
from models import CarrierCreate, CustomerCreate, ProductCreate

router = APIRouter()


def row_to_dict(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(zip(row.keys(), row))


# Carriers
@router.get("/carriers")
async def get_carriers():
    """Get all carriers."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM carriers ORDER BY name")
        rows = cursor.fetchall()
        return [row_to_dict(row) for row in rows]


@router.post("/carriers")
async def create_carrier(carrier: CarrierCreate):
    """Create a new carrier."""
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO carriers (name) VALUES (?)", (carrier.name,))
            conn.commit()
            carrier_id = cursor.lastrowid
            return {"id": carrier_id, "name": carrier.name}
        except Exception:
            raise HTTPException(status_code=400, detail="Carrier already exists")


@router.delete("/carriers/{carrier_id}")
async def delete_carrier(carrier_id: int):
    """Delete a carrier."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM carriers WHERE id = ?", (carrier_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Carrier not found")
        cursor.execute("DELETE FROM carriers WHERE id = ?", (carrier_id,))
        conn.commit()
        return {"message": "Carrier deleted successfully"}


# Customers
@router.get("/customers")
async def get_customers():
    """Get all customers."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM customers ORDER BY name")
        rows = cursor.fetchall()
        return [row_to_dict(row) for row in rows]


@router.post("/customers")
async def create_customer(customer: CustomerCreate):
    """Create a new customer."""
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO customers (name) VALUES (?)", (customer.name,))
            conn.commit()
            customer_id = cursor.lastrowid
            return {"id": customer_id, "name": customer.name}
        except Exception:
            raise HTTPException(status_code=400, detail="Customer already exists")


@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int):
    """Delete a customer."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        cursor.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
        conn.commit()
        return {"message": "Customer deleted successfully"}


# Products
@router.get("/products")
async def get_products():
    """Get all products."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products ORDER BY item_number")
        rows = cursor.fetchall()
        return [row_to_dict(row) for row in rows]


@router.get("/products/{item_number}")
async def get_product(item_number: str):
    """Get a product by item number."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE item_number = ?", (item_number,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        return row_to_dict(row)


@router.post("/products")
async def create_product(product: ProductCreate):
    """Create a new product."""
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO products (
                    item_number, items_per_case, items_per_pallet,
                    cases_per_pallet, layers_per_pallet, cases_per_layer,
                    notes, wm_items_per_pallet, wm_cases_per_pallet,
                    wm_layers_per_pallet, wm_cases_per_layer
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                product.item_number,
                product.items_per_case,
                product.items_per_pallet,
                product.cases_per_pallet,
                product.layers_per_pallet,
                product.cases_per_layer,
                product.notes,
                product.wm_items_per_pallet,
                product.wm_cases_per_pallet,
                product.wm_layers_per_pallet,
                product.wm_cases_per_layer,
            ))
            conn.commit()
            product_id = cursor.lastrowid
            cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
            row = cursor.fetchone()
            return row_to_dict(row)
        except Exception:
            raise HTTPException(status_code=400, detail="Product already exists")


@router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    """Delete a product."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        return {"message": "Product deleted successfully"}
