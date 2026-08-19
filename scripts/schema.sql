CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  location_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  author_name TEXT CHECK (author_name IS NULL OR char_length(author_name) <= 80),
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_location_id_idx ON reviews (location_id);
CREATE INDEX IF NOT EXISTS reviews_ip_created_idx ON reviews (ip_address, created_at);
