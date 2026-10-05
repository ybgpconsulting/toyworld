ALTER TABLE orders ADD COLUMN inventory_restored_at DATETIME;

CREATE TRIGGER IF NOT EXISTS order_items_validate_and_deduct_inventory
BEFORE INSERT ON order_items
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM products
      WHERE id = NEW.product_id AND is_active = 1
    ) THEN RAISE(ABORT, 'PRODUCT_UNAVAILABLE')
    WHEN NEW.variant_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM product_variants
      WHERE id = NEW.variant_id
        AND product_id = NEW.product_id
        AND is_available = 1
        AND stock_quantity >= NEW.quantity
    ) THEN RAISE(ABORT, 'INSUFFICIENT_VARIANT_STOCK')
    WHEN NEW.variant_id IS NULL AND EXISTS (
      SELECT 1 FROM product_variants WHERE product_id = NEW.product_id
    ) THEN RAISE(ABORT, 'VARIANT_REQUIRED')
    WHEN NEW.variant_id IS NULL AND NOT EXISTS (
      SELECT 1 FROM products
      WHERE id = NEW.product_id AND stock_quantity >= NEW.quantity
    ) THEN RAISE(ABORT, 'INSUFFICIENT_PRODUCT_STOCK')
  END;
END;

CREATE TRIGGER IF NOT EXISTS order_items_deduct_inventory
AFTER INSERT ON order_items
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.variant_id
    AND is_available = 1
    AND stock_quantity >= NEW.quantity;

  SELECT CASE
    WHEN NEW.variant_id IS NOT NULL AND changes() != 1
      THEN RAISE(ABORT, 'INSUFFICIENT_VARIANT_STOCK')
  END;

  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id
    AND NEW.variant_id IS NULL
    AND stock_quantity >= NEW.quantity;

  SELECT CASE
    WHEN NEW.variant_id IS NULL AND changes() != 1
      THEN RAISE(ABORT, 'INSUFFICIENT_PRODUCT_STOCK')
  END;

  INSERT INTO inventory_logs (product_id, variant_id, change_amount, reason, order_id)
  VALUES (NEW.product_id, NEW.variant_id, -NEW.quantity, 'order_placed', NEW.order_id);
END;

CREATE TRIGGER IF NOT EXISTS orders_validate_coupon
BEFORE INSERT ON orders
WHEN NEW.coupon_code IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM coupons
    WHERE code = NEW.coupon_code
      AND is_active = 1
      AND (start_date IS NULL OR datetime(start_date) <= datetime('now'))
      AND (end_date IS NULL OR datetime(end_date) >= datetime('now'))
      AND (usage_limit IS NULL OR used_count < usage_limit)
      AND NEW.subtotal >= COALESCE(min_order_value, 0)
  ) THEN RAISE(ABORT, 'COUPON_UNAVAILABLE') END;
END;

CREATE TRIGGER IF NOT EXISTS orders_consume_coupon
AFTER INSERT ON orders
WHEN NEW.coupon_code IS NOT NULL
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = NEW.coupon_code;
END;

CREATE TRIGGER IF NOT EXISTS orders_restore_inventory_on_cancel
AFTER UPDATE OF order_status ON orders
WHEN NEW.order_status = 'cancelled'
  AND OLD.order_status != 'cancelled'
  AND NEW.inventory_restored_at IS NULL
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + (
    SELECT COALESCE(SUM(quantity), 0)
    FROM order_items
    WHERE order_id = NEW.id AND variant_id = product_variants.id
  )
  WHERE id IN (
    SELECT DISTINCT variant_id FROM order_items
    WHERE order_id = NEW.id AND variant_id IS NOT NULL
  );

  UPDATE products
  SET stock_quantity = stock_quantity + (
    SELECT COALESCE(SUM(quantity), 0)
    FROM order_items
    WHERE order_id = NEW.id
      AND variant_id IS NULL
      AND product_id = products.id
  )
  WHERE id IN (
    SELECT DISTINCT product_id FROM order_items
    WHERE order_id = NEW.id AND variant_id IS NULL
  );

  INSERT INTO inventory_logs (product_id, variant_id, change_amount, reason, order_id)
  SELECT product_id, variant_id, quantity, 'order_cancellation', NEW.id
  FROM order_items
  WHERE order_id = NEW.id;

  UPDATE orders SET inventory_restored_at = datetime('now') WHERE id = NEW.id;
END;
