CREATE TABLE content_editions (
  id TEXT PRIMARY KEY,
  answer_language TEXT NOT NULL CHECK(answer_language IN ('en','nl')),
  edition_date TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX content_editions_language_date ON content_editions(answer_language,edition_date);
CREATE TRIGGER content_editions_immutable_update BEFORE UPDATE ON content_editions
BEGIN SELECT RAISE(ABORT, 'Content editions are immutable'); END;
CREATE TRIGGER content_editions_immutable_delete BEFORE DELETE ON content_editions
BEGIN SELECT RAISE(ABORT, 'Content editions are immutable'); END;
ALTER TABLE runs ADD COLUMN content_edition_id TEXT REFERENCES content_editions(id);
