ALTER TABLE runs ADD COLUMN interface_language TEXT NOT NULL DEFAULT 'nl' CHECK(interface_language IN ('en','nl'));
ALTER TABLE runs ADD COLUMN answer_language TEXT NOT NULL DEFAULT 'en' CHECK(answer_language IN ('en','nl'));
UPDATE runs SET answer_language=language WHERE language IN ('en','nl');
UPDATE runs SET interface_language=CASE WHEN language='en' THEN 'en' ELSE 'nl' END;
DROP INDEX IF EXISTS one_daily_per_player;
CREATE UNIQUE INDEX IF NOT EXISTS one_daily_per_player ON runs(player,date,interface_language,answer_language) WHERE mode='daily';
