from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, database
from .schemas import EntryBase, Entry, EntryCreate
from .summarizer import rule_based_summarize
from fastapi.middleware.cors import CORSMiddleware 

# --- Database Initialization ---
database.init_db()

app = FastAPI()


# -----------------------------------------------------
#                CORS Configuration
# -----------------------------------------------------

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# -----------------------------------------------------
# --- Dependency to get a database session ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------------------------------
#                CRUD Endpoints
# -----------------------------------------------------

# --- Endpoint 1: Create New Journal Entry (POST /entries) ---
@app.post("/entries/", response_model=Entry)
def create_entry(entry: EntryCreate, db: Session = Depends(get_db)):
    db_entry = models.JournalEntry(title=entry.title, content=entry.content)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

# --- Endpoint 2: List/Search Entries (GET /entries) ---
@app.get("/entries/", response_model=List[Entry])
def list_entries(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.JournalEntry).order_by(models.JournalEntry.created_at.desc())
    
    if search:
        search_filter = models.JournalEntry.title.contains(search) | models.JournalEntry.content.contains(search)
        query = query.filter(search_filter)
        
    return query.all()

# --- Endpoint 3: Fetch Single Entry (GET /entries/{id}) ---
@app.get("/entries/{entry_id}", response_model=Entry)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if db_entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with ID {entry_id} not found"
        )
        
    return db_entry

# --- Endpoint 4: Update Entry (PUT /entries/{id}) ---
@app.put("/entries/{entry_id}", response_model=Entry)
def update_entry(
    entry_id: int, 
    entry: EntryBase,
    db: Session = Depends(get_db)
):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if db_entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with ID {entry_id} not found"
        )
        
    db_entry.title = entry.title
    db_entry.content = entry.content
    
    db.commit()
    db.refresh(db_entry)
    
    return db_entry

# --- Endpoint 5: Delete Entry (DELETE /entries/{id}) ---
@app.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if db_entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with ID {entry_id} not found"
        )
        
    db.delete(db_entry)
    db.commit()
    
    return

# -----------------------------------------------------
#                AI Summary Endpoint
# -----------------------------------------------------

# --- Endpoint 6: AI-Generated Summary (POST /entries/{id}/summary) ---
@app.post("/entries/{entry_id}/summary")
def get_ai_summary(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if db_entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with ID {entry_id} not found"
        )
        
    content = db_entry.content
    summary = rule_based_summarize(content)
    
    return {
        "entry_id": entry_id, 
        "title": db_entry.title,
        "summary": summary
    }