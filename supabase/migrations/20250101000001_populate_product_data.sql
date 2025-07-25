/*
  # Populate FrameCraft Database with Real Product Data
  
  This migration populates the database with:
  - Real frame products with transparent PNG overlays
  - Product images and variants
  - Sample reviews and ratings
  - Categories and tags
*/

-- Insert sample frame products with real specifications
INSERT INTO products (
  name, slug, description, short_description, sku, category_id,
  frame_overlay_url, frame_preview_url, material_type, finish_type, orientation,
  width, height, depth, base_price, b2c_price, b2b_price, cost_price,
  stock_quantity, low_stock_threshold, is_active, is_featured, is_popular,
  meta_title, meta_description
) VALUES
-- Wedding Frames
(
  'Classic Wedding Frame - Oak Wood',
  'classic-wedding-frame-oak',
  'Elegant oak wood frame perfect for wedding photos. Features premium UV-resistant glass and acid-free matting. Handcrafted with attention to detail and finished with a protective coating.',
  'Elegant oak wood frame perfect for wedding photos with premium UV-resistant glass.',
  'CWF-OAK-001',
  (SELECT id FROM categories WHERE slug = 'photo-frames'),
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
  'wood', 'natural_oak', 'any',
  8.0, 10.0, 1.5, 45.99, 64.99, 52.99, 32.00,
  50, 10, true, true, true,
  'Classic Wedding Frame - Premium Oak Wood | FrameCraft Pro',
  'Beautiful oak wood wedding frame with UV protection. Perfect for preserving your special day memories.'
),
(
  'Modern Metal Frame - Silver Finish',
  'modern-metal-frame-silver',
  'Contemporary aluminum frame with brushed silver finish. Lightweight yet durable, perfect for modern home decor. Features easy-change backing system and wall mounting hardware.',
  'Contemporary aluminum frame with brushed silver finish for modern homes.',
  'MMF-SIL-001',
  (SELECT id FROM categories WHERE slug = 'photo-frames'),
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'metal', 'brushed_silver', 'any',
  5.0, 7.0, 0.75, 29.99, 39.99, 32.99, 18.00,
  75, 15, true, false, true,
  'Modern Metal Frame - Brushed Silver | FrameCraft Pro',
  'Sleek aluminum frame with brushed silver finish. Perfect for contemporary photo display.'
),
(
  'Rustic Barn Wood Frame',
  'rustic-barn-wood-frame',
  'Authentic reclaimed barn wood frame with natural weathered finish. Each piece is unique with its own character marks and grain patterns. Eco-friendly and sustainably sourced.',
  'Authentic reclaimed barn wood frame with natural weathered finish.',
  'RBW-NAT-001',
  (SELECT id FROM categories WHERE slug = 'photo-frames'),
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80',
  'wood', 'weathered_natural', 'any',
  11.0, 14.0, 2.0, 55.99, 79.99, 64.99, 38.00,
  30, 5, true, true, false,
  'Rustic Barn Wood Frame - Reclaimed Wood | FrameCraft Pro',
  'Unique reclaimed barn wood frame. Eco-friendly with authentic weathered character.'
),
(
  'Premium Walnut Frame - Dark Finish',
  'premium-walnut-frame-dark',
  'Luxurious walnut wood frame with rich dark finish. Hand-selected premium walnut with beautiful grain patterns. Features museum-quality materials and archival backing.',
  'Luxurious walnut wood frame with rich dark finish and premium materials.',
  'PWF-WAL-001',
  (SELECT id FROM categories WHERE slug = 'photo-frames'),
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
  'wood', 'dark_walnut', 'any',
  12.0, 16.0, 1.75, 89.99, 129.99, 104.99, 65.00,
  25, 5, true, true, true,
  'Premium Walnut Frame - Dark Finish | FrameCraft Pro',
  'Luxury walnut frame with rich dark finish. Museum-quality materials for precious memories.'
),
(
  'Minimalist Black Metal Frame',
  'minimalist-black-metal-frame',
  'Clean and simple black metal frame perfect for modern photography and art. Powder-coated finish resists scratches and fingerprints. Ultra-thin profile maximizes photo visibility.',
  'Clean and simple black metal frame perfect for modern photography.',
  'MBM-BLK-001',
  (SELECT id FROM categories WHERE slug = 'art-frames'),
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'metal', 'matte_black', 'any',
  16.0, 20.0, 0.5, 34.99, 49.99, 39.99, 22.00,
  60, 12, true, false, false,
  'Minimalist Black Metal Frame | FrameCraft Pro',
  'Ultra-thin black metal frame with powder-coated finish. Perfect for modern art display.'
),
(
  'Vintage Gold Ornate Frame',
  'vintage-gold-ornate-frame',
  'Elaborate vintage-style frame with intricate gold leaf detailing. Perfect for classical portraits and formal photography. Hand-finished with traditional techniques.',
  'Elaborate vintage-style frame with intricate gold leaf detailing.',
  'VGO-GLD-001',
  (SELECT id FROM categories WHERE slug = 'art-frames'),
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80',
  'composite', 'antique_gold', 'portrait',
  8.0, 10.0, 2.5, 79.99, 119.99, 95.99, 55.00,
  20, 3, true, true, false,
  'Vintage Gold Ornate Frame - Hand Finished | FrameCraft Pro',
  'Elaborate gold leaf frame with vintage styling. Perfect for classical portraits.'
),
(
  'Baby Photo Frame - Soft Pink',
  'baby-photo-frame-soft-pink',
  'Adorable baby photo frame in soft pink with cloud and star motifs. Made from baby-safe materials with rounded edges. Perfect for nursery decoration.',
  'Adorable baby photo frame in soft pink with cloud and star motifs.',
  'BPF-PNK-001',
  (SELECT id FROM categories WHERE slug = 'photo-frames'),
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
  'wood', 'soft_pink', 'any',
  4.0, 6.0, 1.0, 24.99, 34.99, 27.99, 15.00,
  40, 8, true, false, true,
  'Baby Photo Frame - Soft Pink | FrameCraft Pro',
  'Safe and adorable baby frame in soft pink. Perfect for nursery memories.'
),
(
  'Multi-Photo Collage Frame',
  'multi-photo-collage-frame',
  'Display multiple memories in one beautiful frame. Holds 6 photos in various sizes with pre-cut matting. Available in multiple color combinations.',
  'Display multiple memories in one frame. Holds 6 photos with pre-cut matting.',
  'MPC-WHT-001',
  (SELECT id FROM categories WHERE slug = 'collage-frames'),
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80',
  'wood', 'white_wash', 'landscape',
  20.0, 16.0, 1.5, 69.99, 99.99, 79.99, 45.00,
  35, 7, true, true, true,
  'Multi-Photo Collage Frame - 6 Photos | FrameCraft Pro',
  'Beautiful collage frame for multiple photos. Perfect for family memories.'
),
(
  'Certificate Frame - Professional',
  'certificate-frame-professional',
  'Professional certificate frame with museum-quality matting. Perfect for diplomas, awards, and important documents. Includes UV protection and acid-free materials.',
  'Professional certificate frame with museum-quality matting and UV protection.',
  'CFP-BLK-001',
  (SELECT id FROM categories WHERE slug = 'certificate-frames'),
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'metal', 'professional_black', 'landscape',
  11.0, 8.5, 1.0, 39.99, 59.99, 47.99, 28.00,
  45, 10, true, false, false,
  'Professional Certificate Frame | FrameCraft Pro',
  'Museum-quality certificate frame with UV protection. Perfect for important documents.'
),
(
  'Custom Size Frame - Made to Order',
  'custom-size-frame-made-to-order',
  'Create the perfect frame for any size photo or artwork. Choose from our premium materials and finishes. Expert craftsmanship with quick turnaround time.',
  'Create the perfect frame for any size. Choose materials and finishes.',
  'CSF-CUS-001',
  (SELECT id FROM categories WHERE slug = 'custom-frames'),
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
  'wood', 'custom_finish', 'any',
  0.0, 0.0, 1.5, 0.00, 0.00, 0.00, 0.00,
  999, 0, true, true, false,
  'Custom Size Frame - Made to Order | FrameCraft Pro',
  'Custom frames made to your exact specifications. Premium materials and expert craftsmanship.'
);

-- Insert product images for each product
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) 
SELECT 
  p.id,
  CASE 
    WHEN p.slug = 'classic-wedding-frame-oak' THEN 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'
    WHEN p.slug = 'modern-metal-frame-silver' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    WHEN p.slug = 'rustic-barn-wood-frame' THEN 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80'
    WHEN p.slug = 'premium-walnut-frame-dark' THEN 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'
    WHEN p.slug = 'minimalist-black-metal-frame' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    WHEN p.slug = 'vintage-gold-ornate-frame' THEN 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80'
    WHEN p.slug = 'baby-photo-frame-soft-pink' THEN 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'
    WHEN p.slug = 'multi-photo-collage-frame' THEN 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80'
    WHEN p.slug = 'certificate-frame-professional' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    ELSE 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'
  END,
  p.name || ' - Main Image',
  0,
  true
FROM products p;

-- Insert additional product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
  p.name || ' - Detail View',
  1,
  false
FROM products p
WHERE p.slug IN ('classic-wedding-frame-oak', 'premium-walnut-frame-dark', 'multi-photo-collage-frame');

-- Insert product variants for different sizes and colors
INSERT INTO product_variants (product_id, name, sku, width, height, color_name, color_hex, price_adjustment, b2c_price, b2b_price, stock_quantity)
SELECT 
  p.id,
  '4" x 6" Size',
  p.sku || '-4X6',
  4.0, 6.0,
  'Natural', '#D4A574',
  -10.00,
  p.b2c_price - 10.00,
  p.b2b_price - 10.00,
  25
FROM products p
WHERE p.material_type = 'wood';

INSERT INTO product_variants (product_id, name, sku, width, height, color_name, color_hex, price_adjustment, b2c_price, b2b_price, stock_quantity)
SELECT 
  p.id,
  '5" x 7" Size',
  p.sku || '-5X7',
  5.0, 7.0,
  'Natural', '#D4A574',
  0.00,
  p.b2c_price,
  p.b2b_price,
  30
FROM products p
WHERE p.material_type = 'wood';

INSERT INTO product_variants (product_id, name, sku, width, height, color_name, color_hex, price_adjustment, b2c_price, b2b_price, stock_quantity)
SELECT 
  p.id,
  '8" x 10" Size',
  p.sku || '-8X10',
  8.0, 10.0,
  'Natural', '#D4A574',
  15.00,
  p.b2c_price + 15.00,
  p.b2b_price + 15.00,
  20
FROM products p
WHERE p.material_type = 'wood';

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count)
SELECT 
  p.id,
  NULL, -- We'll handle user association later
  5,
  'Beautiful Quality Frame',
  'Absolutely love this frame! The quality is exceptional and it looks perfect in our living room. The craftsmanship is evident in every detail.',
  true,
  true,
  12
FROM products p
WHERE p.slug = 'classic-wedding-frame-oak';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count)
SELECT 
  p.id,
  NULL,
  5,
  'Perfect for Modern Decor',
  'This frame fits perfectly with our modern home aesthetic. The silver finish is elegant and the quality is outstanding.',
  true,
  true,
  8
FROM products p
WHERE p.slug = 'modern-metal-frame-silver';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count)
SELECT 
  p.id,
  NULL,
  4,
  'Unique Character',
  'Love the rustic look! Each piece is truly unique. Great for our farmhouse style home.',
  true,
  true,
  15
FROM products p
WHERE p.slug = 'rustic-barn-wood-frame';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count)
SELECT 
  p.id,
  NULL,
  5,
  'Premium Quality',
  'This walnut frame is absolutely gorgeous. The wood grain is beautiful and the finish is flawless. Worth every penny!',
  true,
  true,
  20
FROM products p
WHERE p.slug = 'premium-walnut-frame-dark';

-- Tag products appropriately
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p, tags t
WHERE p.is_popular = true AND t.slug = 'popular';

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p, tags t
WHERE p.is_featured = true AND t.slug = 'best-seller';

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p, tags t
WHERE p.material_type = 'wood' AND p.finish_type LIKE '%natural%' AND t.slug = 'eco-friendly';

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p, tags t
WHERE p.b2c_price > 100 AND t.slug = 'premium';

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p, tags t
WHERE p.finish_type LIKE '%rustic%' OR p.finish_type LIKE '%barn%' AND t.slug = 'rustic';

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM products p, tags t
WHERE p.material_type = 'metal' AND p.finish_type LIKE '%black%' AND t.slug = 'minimalist';

-- Update product statistics based on reviews
UPDATE products 
SET 
  -- Calculate average rating (mock calculation since we have limited reviews)
  meta_description = meta_description || ' Average rating: ' || 
    CASE 
      WHEN slug = 'classic-wedding-frame-oak' THEN '4.9/5'
      WHEN slug = 'modern-metal-frame-silver' THEN '4.8/5'
      WHEN slug = 'rustic-barn-wood-frame' THEN '4.6/5'
      WHEN slug = 'premium-walnut-frame-dark' THEN '4.9/5'
      WHEN slug = 'minimalist-black-metal-frame' THEN '4.7/5'
      WHEN slug = 'vintage-gold-ornate-frame' THEN '4.5/5'
      WHEN slug = 'baby-photo-frame-soft-pink' THEN '4.8/5'
      WHEN slug = 'multi-photo-collage-frame' THEN '4.7/5'
      WHEN slug = 'certificate-frame-professional' THEN '4.6/5'
      ELSE '4.5/5'
    END || ' stars.'
WHERE slug IN (
  'classic-wedding-frame-oak', 'modern-metal-frame-silver', 'rustic-barn-wood-frame',
  'premium-walnut-frame-dark', 'minimalist-black-metal-frame', 'vintage-gold-ornate-frame',
  'baby-photo-frame-soft-pink', 'multi-photo-collage-frame', 'certificate-frame-professional'
);

-- Create some sample B2B accounts for testing
INSERT INTO b2b_accounts (
  user_id, company_name, business_type, contact_person, contact_email, 
  credit_limit, discount_percentage, status
) VALUES
(
  NULL, -- Will be linked to actual users later
  'Photo Studio Pro',
  'Photography Studio',
  'John Smith',
  'john@photostudiopro.com',
  5000.00,
  15.00,
  'approved'
),
(
  NULL,
  'Art Gallery Central',
  'Art Gallery',
  'Sarah Johnson',
  'sarah@artgallerycentral.com',
  10000.00,
  20.00,
  'approved'
),
(
  NULL,
  'Wedding Planners Inc',
  'Event Planning',
  'Mike Davis',
  'mike@weddingplanners.com',
  3000.00,
  12.00,
  'pending'
);

-- Add some inventory alerts for low stock items
UPDATE products 
SET stock_quantity = 8
WHERE slug IN ('vintage-gold-ornate-frame', 'premium-walnut-frame-dark')
AND stock_quantity > low_stock_threshold;

-- Create search-friendly indexes
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, '')));
CREATE INDEX IF NOT EXISTS idx_products_material_type ON products(material_type);
CREATE INDEX IF NOT EXISTS idx_products_finish_type ON products(finish_type);
CREATE INDEX IF NOT EXISTS idx_products_orientation ON products(orientation);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(b2c_price);

-- Add some promotional pricing
UPDATE products 
SET 
  b2c_price = b2c_price * 0.85,
  b2b_price = b2b_price * 0.85
WHERE slug IN ('modern-metal-frame-silver', 'baby-photo-frame-soft-pink')
AND is_popular = true;

COMMIT;