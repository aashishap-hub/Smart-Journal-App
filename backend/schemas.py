from pydantic import BaseModel
from datetime import datetime

# creating or updating an entry
class EntryBase(BaseModel):
    title: str
    content: str

# creating a new entry (inherits from EntryBase)
class EntryCreate(EntryBase):
    pass 

# reading an entry (includes ID and timestamp)
class Entry(EntryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 

# creating or updating an entry
class EntryBase(BaseModel):
    title: str
    content: str
    