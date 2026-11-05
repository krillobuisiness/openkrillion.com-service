ALTER TABLE runs ADD COLUMN language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en','nl'));
CREATE INDEX IF NOT EXISTS runs_language_date ON runs(language,date,mode);
