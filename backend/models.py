"""Pydantic models for request/response validation."""

from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# Inbound Shipment Models
class InboundShipmentBase(BaseModel):
    source: Literal["TP", "OTHER"]
    item_number: Optional[str] = None
    cases: Optional[int] = None
    po: Optional[str] = None
    carrier: Optional[str] = None
    bol_number: Optional[str] = None
    tp_receipt_number: Optional[str] = None
    ship_date: Optional[date] = None
    received: bool = False
    pallets: Optional[float] = None
    notes: Optional[str] = None


class InboundShipmentCreate(InboundShipmentBase):
    pass


class InboundShipmentUpdate(BaseModel):
    source: Optional[Literal["TP", "OTHER"]] = None
    item_number: Optional[str] = None
    cases: Optional[int] = None
    po: Optional[str] = None
    carrier: Optional[str] = None
    bol_number: Optional[str] = None
    tp_receipt_number: Optional[str] = None
    ship_date: Optional[date] = None
    received: Optional[bool] = None
    pallets: Optional[float] = None
    notes: Optional[str] = None


class InboundShipment(InboundShipmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Outbound Shipment Models
class OutboundShipmentBase(BaseModel):
    source: Literal["TP", "OTHER"]
    reference_number: Optional[str] = None
    order_number: Optional[str] = None
    customer: Optional[str] = None
    ship_date: Optional[date] = None
    carrier: Optional[str] = None
    shipped: bool = False
    delayed: bool = False  # True if shipped late (Yes,Delayed)
    actual_date: Optional[date] = None
    pallets: Optional[float] = None
    pro: Optional[str] = None
    seal: Optional[str] = None
    notes: Optional[str] = None
    pickup_time: Optional[str] = None


class OutboundShipmentCreate(OutboundShipmentBase):
    pass


class OutboundShipmentUpdate(BaseModel):
    source: Optional[Literal["TP", "OTHER"]] = None
    reference_number: Optional[str] = None
    order_number: Optional[str] = None
    customer: Optional[str] = None
    ship_date: Optional[date] = None
    carrier: Optional[str] = None
    shipped: Optional[bool] = None
    delayed: Optional[bool] = None  # True if shipped late (Yes,Delayed)
    actual_date: Optional[date] = None
    pallets: Optional[float] = None
    pro: Optional[str] = None
    seal: Optional[str] = None
    notes: Optional[str] = None
    pickup_time: Optional[str] = None


class OutboundShipment(OutboundShipmentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Reference Data Models
class CarrierBase(BaseModel):
    name: str


class CarrierCreate(CarrierBase):
    pass


class Carrier(CarrierBase):
    id: int

    class Config:
        from_attributes = True


class CustomerBase(BaseModel):
    name: str


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    item_number: str
    items_per_case: Optional[int] = None
    items_per_pallet: Optional[int] = None
    cases_per_pallet: Optional[int] = None
    layers_per_pallet: Optional[int] = None
    cases_per_layer: Optional[int] = None
    notes: Optional[str] = None
    wm_items_per_pallet: Optional[int] = None
    wm_cases_per_pallet: Optional[int] = None
    wm_layers_per_pallet: Optional[int] = None
    wm_cases_per_layer: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


# Dashboard/Stats Models
class DashboardStats(BaseModel):
    total_inbound_today: int = 0
    total_outbound_today: int = 0
    pending_inbound: int = 0
    pending_outbound: int = 0
    completed_inbound_today: int = 0
    completed_outbound_today: int = 0
    overdue_inbound: int = 0
    overdue_outbound: int = 0
    shipments_this_week: int = 0


class ChartDataPoint(BaseModel):
    name: str
    value: int


class SyncStatus(BaseModel):
    last_sync: Optional[datetime] = None
    sync_type: Optional[str] = None
    status: Optional[str] = None
    records_processed: Optional[int] = None


class SyncResult(BaseModel):
    success: bool
    message: str
    records_processed: int = 0
    errors: list[str] = []


# Pagination
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
