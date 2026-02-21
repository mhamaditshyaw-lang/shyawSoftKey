ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS completed_by_note TEXT;
ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS completed_by_id INTEGER REFERENCES users(id);
