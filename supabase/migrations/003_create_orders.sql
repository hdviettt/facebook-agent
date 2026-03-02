CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    sender_id       VARCHAR(100) NOT NULL,
    nhanh_order_id  BIGINT,
    app_order_id    VARCHAR(100) UNIQUE NOT NULL,
    tracking_url    TEXT,
    status          VARCHAR(50) DEFAULT 'created',
    order_data      JSONB NOT NULL,
    response_data   JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_sender ON orders(sender_id);
CREATE INDEX idx_orders_nhanh ON orders(nhanh_order_id);
