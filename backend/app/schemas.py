from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime
from app.enums import NodeStatus, SubscriptionTier, UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.CLIENT_MASTER

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None

class ProjectCreate(ProjectBase):
    client_id: int

class ProjectResponse(ProjectBase):
    id: int
    client_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ZoneBase(BaseModel):
    name: str
    label: Optional[str] = None

class ZoneCreate(ZoneBase):
    project_id: int

class ZoneResponse(ZoneBase):
    id: int
    project_id: int
    model_config = ConfigDict(from_attributes=True)

class NodeBase(BaseModel):
    zone_id: int

class NodeCreate(NodeBase):
    pass

class NodeResponse(NodeBase):
    id: int
    battery_level: float
    signal_strength: float
    status: NodeStatus
    last_ping: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SensorBase(BaseModel):
    type: str
    unit: str

class SensorCreate(SensorBase):
    node_id: int

class SensorResponse(SensorBase):
    id: int
    node_id: int
    last_value: Optional[float] = None
    last_reading_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class SubscriptionBase(BaseModel):
    tier: SubscriptionTier = SubscriptionTier.BASIC

class SubscriptionCreate(SubscriptionBase):
    client_id: int
    expires_at: Optional[datetime] = None

class SubscriptionResponse(SubscriptionBase):
    id: int
    client_id: int
    starts_at: datetime
    expires_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DataFileBase(BaseModel):
    filename: str
    file_path: str
    file_size: Optional[int] = None

class DataFileCreate(DataFileBase):
    project_id: int

class DataFileResponse(DataFileBase):
    id: int
    project_id: int
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)
