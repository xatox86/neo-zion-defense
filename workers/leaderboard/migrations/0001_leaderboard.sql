CREATE TABLE IF NOT EXISTS players (
  telegram_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES players(telegram_id),
  request_id TEXT NOT NULL,
  season TEXT NOT NULL,
  balance_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  cleared INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'finished')),
  reached INTEGER,
  finished_at INTEGER,
  UNIQUE(telegram_id, request_id)
);

CREATE TABLE IF NOT EXISTS results (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id),
  telegram_id TEXT NOT NULL REFERENCES players(telegram_id),
  season TEXT NOT NULL,
  balance_version TEXT NOT NULL,
  cleared INTEGER NOT NULL,
  reached INTEGER NOT NULL,
  finished_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS results_ranking ON results(season, balance_version, finished_at, telegram_id, cleared);
CREATE INDEX IF NOT EXISTS sessions_rate_limit ON sessions(telegram_id, created_at);
