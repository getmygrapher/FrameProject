/*
  Seed default frame catalog.
*/

INSERT INTO frame_materials (id, name, category, texture, price_multiplier)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Oak Wood', 'wood', 'wood-grain-light', 1.00),
  ('550e8400-e29b-41d4-a716-446655440002', 'Walnut Wood', 'wood', 'wood-grain-dark', 1.30),
  ('550e8400-e29b-41d4-a716-446655440003', 'Aluminum', 'metal', 'brushed-metal', 0.80)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  texture = EXCLUDED.texture,
  price_multiplier = EXCLUDED.price_multiplier;

INSERT INTO frame_colors (material_id, name, hex_code, price_multiplier)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Natural Oak', '#D4A574', 1.00),
  ('550e8400-e29b-41d4-a716-446655440001', 'Dark Oak', '#8B4513', 1.10),
  ('550e8400-e29b-41d4-a716-446655440001', 'White Oak', '#F5F5DC', 1.05),
  ('550e8400-e29b-41d4-a716-446655440002', 'Natural Walnut', '#8B4513', 1.00),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dark Walnut', '#654321', 1.10),
  ('550e8400-e29b-41d4-a716-446655440002', 'Ebony Walnut', '#2F1B14', 1.20),
  ('550e8400-e29b-41d4-a716-446655440003', 'Silver', '#C0C0C0', 1.00),
  ('550e8400-e29b-41d4-a716-446655440003', 'Black', '#2C2C2C', 1.00),
  ('550e8400-e29b-41d4-a716-446655440003', 'Gold', '#FFD700', 1.20)
ON CONFLICT DO NOTHING;

INSERT INTO frame_sizes (id, name, width, height, display_name, is_popular, price_multiplier)
VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '4x6', 4, 6, '4" × 6"', true, 1.00),
  ('550e8400-e29b-41d4-a716-446655440102', '5x7', 5, 7, '5" × 7"', true, 1.20),
  ('550e8400-e29b-41d4-a716-446655440103', '8x10', 8, 10, '8" × 10"', true, 1.50),
  ('550e8400-e29b-41d4-a716-446655440104', '8x12', 8, 12, '8" × 12"', false, 1.70),
  ('550e8400-e29b-41d4-a716-446655440105', '11x14', 11, 14, '11" × 14"', false, 2.00),
  ('550e8400-e29b-41d4-a716-446655440106', '12x16', 12, 16, '12" × 16"', false, 2.30),
  ('550e8400-e29b-41d4-a716-446655440107', '16x20', 16, 20, '16" × 20"', false, 2.80),
  ('550e8400-e29b-41d4-a716-446655440108', 'custom', 0, 0, 'Custom Size', false, 2.00)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  display_name = EXCLUDED.display_name,
  is_popular = EXCLUDED.is_popular,
  price_multiplier = EXCLUDED.price_multiplier;

INSERT INTO frame_thickness (id, name, inches, price_multiplier)
VALUES
  ('550e8400-e29b-41d4-a716-446655440201', '1/4"', 0.25, 0.80),
  ('550e8400-e29b-41d4-a716-446655440202', '1/2"', 0.50, 1.00),
  ('550e8400-e29b-41d4-a716-446655440203', '3/4"', 0.75, 1.20),
  ('550e8400-e29b-41d4-a716-446655440204', '1"', 1.00, 1.40),
  ('550e8400-e29b-41d4-a716-446655440205', '1 1/2"', 1.50, 1.60),
  ('550e8400-e29b-41d4-a716-446655440206', '2"', 2.00, 1.80)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  inches = EXCLUDED.inches,
  price_multiplier = EXCLUDED.price_multiplier;
