from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.enums import UserRole, SubscriptionTier, NodeStatus

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.CLIENT_MASTER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="clients")
    projects = relationship("Project", back_populates="client", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="client", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="projects")
    zones = relationship("Zone", back_populates="project", cascade="all, delete-orphan")
    data_files = relationship("DataFile", back_populates="project", cascade="all, delete-orphan")

class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    label = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    project = relationship("Project", back_populates="zones")
    nodes = relationship("Node", back_populates="zone", cascade="all, delete-orphan")

class Node(Base):
    __tablename__ = "nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    battery_level = Column(Float, default=100.0)
    signal_strength = Column(Float, default=0.0)
    status = Column(SAEnum(NodeStatus), default=NodeStatus.NOT_CONFIGURED, index=True)
    last_ping = Column(DateTime(timezone=True), nullable=True)
    
    zone = relationship("Zone", back_populates="nodes")
    sensors = relationship("Sensor", back_populates="node", cascade="all, delete-orphan")

class Sensor(Base):
    __tablename__ = "sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    type = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    last_value = Column(Float, nullable=True)
    last_reading_at = Column(DateTime(timezone=True), nullable=True)
    
    node = relationship("Node", back_populates="sensors")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    tier = Column(SAEnum(SubscriptionTier), default=SubscriptionTier.BASIC)
    starts_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    client = relationship("Client", back_populates="subscriptions")

class DataFile(Base):
    __tablename__ = "data_files"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship("Project", back_populates="data_files")
