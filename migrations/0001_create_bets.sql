-- Bet rows mirror URL/query state keys used by index.html (short keys in JSON API map to these columns).

CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  mode TEXT,
  title TEXT,
  creator_name TEXT,
  challenger_name TEXT,
  p1 TEXT,
  p2 TEXT,
  deadline TEXT,
  creator_trash TEXT,
  challenger_trash TEXT,
  winner TEXT,
  source TEXT,
  creator_step TEXT,
  invited TEXT,
  challenger_responded TEXT,
  handoff_flash TEXT,
  early_vote TEXT,
  early_ended_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_bets_updated_at ON bets(updated_at);
