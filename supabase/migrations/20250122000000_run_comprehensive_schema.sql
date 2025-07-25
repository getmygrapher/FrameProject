-- Run the comprehensive product schema migration
-- This ensures all tables and data are properly set up

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Now run the comprehensive schema
\i 20250101000000_comprehensive_product_schema.sql
\i 20250101000001_populate_product_data.sql
