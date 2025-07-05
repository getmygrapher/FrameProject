/*
  # Seed Initial Frame Data

  This migration populates the database with the initial frame options
  that were previously hardcoded in the application.
*/

-- Insert frame materials
INSERT INTO frame_materials (id, name, category, texture, price_multiplier) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Oak Wood', 'wood', 'wood-grain-light', 1.0),
  ('550e8400-e29b-41d4-a716-446655440002', 'Walnut Wood', 'wood', 'wood-grain-dark', 1.3),
  ('550e8400-e29b-41d4-a716-446655440003', 'Aluminum', 'metal', 'brushed-metal', 0.8)
ON CONFLICT (id) DO NOTHING;

-- Insert frame colors for Oak Wood
INSERT INTO frame_colors (material_id, name, hex_code, price_multiplier) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Natural Oak', '#D4A574', 1.0),
  ('550e8400-e29b-41d4-a716-446655440001', 'Dark Oak', '#8B4513', 1.1),
  ('550e8400-e29b-41d4-a716-446655440001', 'White Oak', '#F5F5DC', 1.05);

-- Insert frame colors for Walnut Wood
INSERT INTO frame_colors (material_id, name, hex_code, price_multiplier) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Natural Walnut', '#8B4513', 1.0),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dark Walnut', '#654321', 1.1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Ebony Walnut', '#2F1B14', 1.2);

-- Insert frame colors for Aluminum
INSERT INTO frame_colors (material_id, name, hex_code, price_multiplier) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Silver', '#C0C0C0', 1.0),
  ('550e8400-e29b-41d4-a716-446655440003', 'Black', '#2C2C2C', 1.0),
  ('550e8400-e29b-41d4-a716-446655440003', 'Gold', '#FFD700', 1.2);

-- Insert frame sizes
INSERT INTO frame_sizes (name, width, height, display_name, is_popular, price_multiplier) VALUES
  ('4x6', 4, 6, '4" × 6"', true, 1.0),
  ('5x7', 5, 7, '5" × 7"', true, 1.2),
  ('8x10', 8, 10, '8" × 10"', true, 1.5),
  ('8x12', 8, 12, '8" × 12"', false, 1.7),
  ('11x14', 11, 14, '11" × 14"', false, 2.0),
  ('12x16', 12, 16, '12" × 16"', false, 2.3),
  ('16x20', 16, 20, '16" × 20"', false, 2.8),
  ('custom', 0, 0, 'Custom Size', false, 2.0);

-- Insert frame thickness options
INSERT INTO frame_thickness (name, inches, price_multiplier) VALUES
  ('1/4"', 0.25, 0.8),
  ('1/2"', 0.5, 1.0),
  ('3/4"', 0.75, 1.2),
  ('1"', 1.0, 1.4),
  ('1 1/2"', 1.5, 1.6),
  ('2"', 2.0, 1.8);