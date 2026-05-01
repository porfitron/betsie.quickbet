-- Settlement position selected by each side in "pick your winner":
-- values mirror vote choices ("creator", "challenger", "no_contest").

ALTER TABLE bets ADD COLUMN creator_vote_choice TEXT;
ALTER TABLE bets ADD COLUMN challenger_vote_choice TEXT;
