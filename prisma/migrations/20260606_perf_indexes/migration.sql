-- Performance indexes — non-destructive, online-safe.
-- Adds:
--   (1) TcasScore(year, minScore): supports getLatestTcasYear aggregate and
--       getMinScoresLatest(WHERE year = $1 ORDER BY minScore ASC LIMIT N).
--   (2) PredictionHistory(userId, createdAt): supports dashboard + profile
--       stats queries that filter by userId and sort by createdAt.

CREATE INDEX IF NOT EXISTS "TcasScore_year_minScore_idx"
  ON "TcasScore" ("year", "minScore");

CREATE INDEX IF NOT EXISTS "PredictionHistory_userId_createdAt_idx"
  ON "PredictionHistory" ("userId", "createdAt");
