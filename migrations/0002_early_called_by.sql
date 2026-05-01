-- Who initiated "call the bet early" (1 = creator, 2 = challenger); mirrors short key `eab` in API/URL.

ALTER TABLE bets ADD COLUMN early_called_by TEXT;
