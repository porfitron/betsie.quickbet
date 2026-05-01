-- Track one-time re-vote and final draw reason for disagreement handling.

ALTER TABLE bets ADD COLUMN vote_round TEXT;
ALTER TABLE bets ADD COLUMN draw_reason TEXT;
