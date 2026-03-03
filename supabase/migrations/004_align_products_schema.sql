-- Migration: Align products table with full Sot Dung Mama schema
-- Run this in Supabase Dashboard > SQL Editor

-- Add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS code VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS other_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(15,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Remove phantom quantity column (Nhanh.vn is source of truth for inventory)
ALTER TABLE products DROP COLUMN IF EXISTS quantity;

-- Add unique constraint on name for upsert support
ALTER TABLE products ADD CONSTRAINT products_name_unique UNIQUE (name);

-- Delete old test/demo products (clothing items etc.)
DELETE FROM products WHERE brand IS NULL OR brand != 'Sot Dung Mama';
