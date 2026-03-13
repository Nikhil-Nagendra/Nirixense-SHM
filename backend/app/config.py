from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql://nirixense:nirixense_password@db:5432/nirixense_db"
    redis_url: str = "redis://redis:6379/0"
    secret_key: str = "yoursecretkey_changeme"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
