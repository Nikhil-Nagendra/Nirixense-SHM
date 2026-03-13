import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CLIENT_MASTER = "CLIENT_MASTER"

class SubscriptionTier(str, enum.Enum):
    BASIC = "BASIC"
    PLUS = "PLUS"
    PRO = "PRO"
    PREMIUM = "PREMIUM"

class NodeStatus(str, enum.Enum):
    NOT_CONFIGURED = "NOT_CONFIGURED"
    CONFIGURED = "CONFIGURED"
    MONITOR = "MONITOR"
    SLEEP = "SLEEP"
