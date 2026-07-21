DROP DATABASE IF EXISTS tea_cake_shop;

CREATE DATABASE tea_cake_shop
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
##
USE tea_cake_shop;

SHOW TABLES;
##
DESCRIBE categories;
DESCRIBE products;
#
USE tea_cake_shop;

SELECT *
FROM categories;
#
SELECT *
FROM categories
WHERE active = true;
##
USE tea_cake_shop;

SHOW TABLES;
##
DESCRIBE combos;
DESCRIBE combo_items;
##
USE tea_cake_shop;

SELECT *
FROM combos;
#kiem tra tong gia combo
SELECT
    c.id,
    c.name,
    c.original_price,
    c.combo_price,
    c.original_price - c.combo_price AS saving_amount
FROM combos c;
#kiemtra
USE tea_cake_shop;
#kiemtracautruc
SHOW TABLES;
##
USE tea_cake_shop;

SELECT *
FROM product_suggestions;
#xem day du
SELECT
    ps.id,
    source_product.name AS source_product,
    source_product.product_type AS source_type,
    suggested_product.name AS suggested_product,
    suggested_product.product_type AS suggested_type,
    ps.reason,
    ps.priority,
    ps.active
FROM product_suggestions ps
JOIN products source_product
    ON source_product.id = ps.source_product_id
JOIN products suggested_product
    ON suggested_product.id = ps.suggested_product_id
ORDER BY ps.priority ASC, ps.id ASC;

#kiemtra

SELECT
    ci.id,
    ci.cart_id,
    ci.product_id,
    ci.combo_id,
    ci.quantity,
    ci.created_at,
    ci.updated_at
FROM cart_items ci
ORDER BY ci.cart_id, ci.id;
#xem day du
SELECT
    ci.id AS cart_item_id,
    c.token AS cart_token,
    p.name AS product_name,
    cb.name AS combo_name,
    ci.quantity
FROM cart_items ci
JOIN carts c ON c.id = ci.cart_id
LEFT JOIN products p ON p.id = ci.product_id
LEFT JOIN combos cb ON cb.id = ci.combo_id
ORDER BY ci.id;
USE tea_cake_shop;
DESCRIBE orders;
DESCRIBE order_items;

SHOW TABLES;
USE tea_cake_shop;

SHOW TABLES;
DESCRIBE payments;
USE tea_cake_shop;

ALTER TABLE orders
MODIFY COLUMN order_type
ENUM(
    'NORMAL',
    'TAKEAWAY_PREORDER',
    'RESERVATION_COMBO'
) NOT NULL;
SHOW COLUMNS FROM orders LIKE 'order_type';
USE tea_cake_shop;

SHOW TABLES;

DESCRIBE reservations;
USE tea_cake_shop;

SHOW TABLES;
DESCRIBE discount_campaigns;
USE tea_cake_shop;

SELECT DATABASE();

SHOW TABLES LIKE 'order_items';
DESCRIBE order_items;
DESCRIBE order_items;
USE tea_cake_shop;

SHOW TABLES LIKE 'orders';
SHOW TABLES LIKE 'order_items';
USE tea_cake_shop;

DESCRIBE order_items;
SHOW TABLES LIKE 'discount_campaigns';

DESCRIBE discount_campaigns;
SELECT
    id,
    item_name,
    original_unit_price,
    discount_amount,
    unit_price,
    quantity,
    line_total,
    discount_code,
    discount_name
FROM order_items
ORDER BY id DESC;
###
USE tea_cake_shop;

SELECT
    id,
    item_name,
    original_unit_price,
    discount_amount,
    unit_price,
    quantity,
    line_total,
    discount_code,
    discount_name
FROM order_items
ORDER BY id DESC
LIMIT 5;
###
USE tea_cake_shop;

SELECT
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM orders
WHERE status = 'COMPLETED';
###
SELECT
    status,
    COUNT(*) AS total
FROM orders
GROUP BY status;
###
SELECT
    oi.product_id,
    oi.item_name,
    SUM(oi.quantity) AS sold_quantity,
    SUM(oi.line_total) AS revenue
FROM order_items oi
JOIN orders o
    ON o.id = oi.order_id
WHERE oi.item_type = 'PRODUCT'
  AND o.status = 'COMPLETED'
GROUP BY
    oi.product_id,
    oi.item_name
ORDER BY sold_quantity DESC
LIMIT 5;