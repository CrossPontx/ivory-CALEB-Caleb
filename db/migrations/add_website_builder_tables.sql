-- Website Builder Tables Migration
-- Run with: yarn db:migrate

-- Tech websites
CREATE TABLE IF NOT EXISTS tech_websites (
  id SERIAL PRIMARY KEY,
  tech_profile_id INTEGER REFERENCES tech_profiles(id) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL, -- yourname.ivoryschoice.com
  custom_domain VARCHAR(255), -- optional custom domain
  v0_chat_id VARCHAR(255) NOT NULL, -- v0 chat session ID
  v0_project_id VARCHAR(255), -- v0 project ID for deployments
  demo_url TEXT NOT NULL, -- v0 demo URL
  deployment_url TEXT, -- production deployment URL
  is_published BOOLEAN DEFAULT false,
  ssl_enabled BOOLEAN DEFAULT true,
  theme_settings JSONB, -- colors, fonts, layout preferences
  seo_settings JSONB, -- meta tags, descriptions
  analytics_enabled BOOLEAN DEFAULT false,
  google_analytics_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Website pages/sections
CREATE TABLE IF NOT EXISTS website_sections (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES tech_websites(id) NOT NULL,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'services', 'gallery', 'booking', 'contact'
  content JSONB NOT NULL, -- section-specific content
  is_enabled BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Website customization history
CREATE TABLE IF NOT EXISTS website_customizations (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES tech_websites(id) NOT NULL,
  v0_message_id VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  changes_applied JSONB, -- what was changed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tech_websites_tech_profile_id ON tech_websites(tech_profile_id);
CREATE INDEX IF NOT EXISTS idx_tech_websites_subdomain ON tech_websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_tech_websites_custom_domain ON tech_websites(custom_domain);
CREATE INDEX IF NOT EXISTS idx_website_sections_website_id ON website_sections(website_id);
CREATE INDEX IF NOT EXISTS idx_website_customizations_website_id ON website_customizations(website_id);