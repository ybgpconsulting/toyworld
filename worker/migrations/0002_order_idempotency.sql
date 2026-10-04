CREATE TABLE IF NOT EXISTS order_idempotency_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT NOT NULL UNIQUE,
  order_id INTEGER NOT NULL,
  order_number TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_idempotency_key ON order_idempotency_keys(idempotency_key);
