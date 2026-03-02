# Supabase Setup

Run these queries in **Supabase Dashboard → SQL Editor**, one at a time.

## 1. Products table

```sql
CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    category    VARCHAR(255),
    price       DECIMAL(15,2),
    image_url   TEXT,
    status      VARCHAR(20) DEFAULT 'active',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## 2. Conversations table

```sql
CREATE TABLE conversations (
    id          BIGSERIAL PRIMARY KEY,
    sender_id   VARCHAR(100) NOT NULL,
    role        VARCHAR(20) NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_sender ON conversations(sender_id, created_at DESC);
```

## 3. Orders table

```sql
CREATE TABLE orders (
    id              BIGSERIAL PRIMARY KEY,
    sender_id       VARCHAR(100) NOT NULL,
    app_order_id    VARCHAR(100) UNIQUE NOT NULL,
    status          VARCHAR(50) DEFAULT 'created',
    order_data      JSONB NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Sample test products

```sql
INSERT INTO products (name, description, category, price) VALUES
('Áo thun trắng basic', 'Áo thun cotton 100%, form regular fit, màu trắng', 'Áo thun', 189000),
('Áo thun đen basic', 'Áo thun cotton 100%, form regular fit, màu đen', 'Áo thun', 189000),
('Quần jeans slim fit', 'Quần jeans co giãn, form slim fit, màu xanh đậm', 'Quần', 450000);
```
