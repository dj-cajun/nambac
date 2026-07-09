CREATE TABLE IF NOT EXISTS site_daily_visitors (
  visit_date TEXT NOT NULL,
  visitor_key TEXT NOT NULL,
  is_logged_in INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (visit_date, visitor_key)
);

CREATE INDEX IF NOT EXISTS idx_site_visitors_date ON site_daily_visitors(visit_date);
