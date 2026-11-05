DROP INDEX IF EXISTS one_daily_per_player;
CREATE UNIQUE INDEX IF NOT EXISTS one_daily_per_player ON runs(player,date,language) WHERE mode='daily';
