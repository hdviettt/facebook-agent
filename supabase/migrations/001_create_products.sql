CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    nhanh_id        BIGINT UNIQUE,
    code            VARCHAR(100),
    barcode         VARCHAR(100),
    name            TEXT NOT NULL,
    other_name      TEXT,
    description     TEXT,
    category        VARCHAR(255),
    brand           VARCHAR(255),
    price           DECIMAL(15,2),
    wholesale_price DECIMAL(15,2),
    image_url       TEXT,
    status          VARCHAR(20) DEFAULT 'active',
    attributes      JSONB DEFAULT '{}',
    inventory       JSONB DEFAULT '{}',
    weight          DECIMAL(10,2),
    dimensions      JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_products_search ON products
    USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(code, '')));

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_nhanh_id ON products(nhanh_id);
