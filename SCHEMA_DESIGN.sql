-- DATABASE SCHEMA DESIGN FOR ETHIO-PHARMA (Multi-Tenant)

-- 1. TENANT MANAGEMENT
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE,
    address TEXT,
    phone_number VARCHAR(20),
    location_lat DECIMAL(9,6),
    location_lon DECIMAL(9,6),
    subscription_plan VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GLOBAL MEDICINE CATALOG (Shared across all pharmacies)
CREATE TABLE global_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generic_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100), -- 'Antibiotic', 'Analgesic', etc.
    dosage_form VARCHAR(100), -- 'Tablet', 'Syrup', 'Injection'
    strength VARCHAR(50), -- '500mg'
    manufacturer VARCHAR(255),
    search_vector tsvector -- For full-text search optimization
);

-- 3. PHARMACY SPECIFIC INVENTORY (Tenant Isolated)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES global_medicines(id),
    custom_name VARCHAR(255), -- If they call it something else
    batch_number VARCHAR(100),
    expiry_date DATE NOT NULL,
    quantity_on_hand INTEGER DEFAULT 0,
    unit_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2), -- For profit analysis
    min_stock_level INTEGER DEFAULT 10, -- For AI alerts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SALES & VAT LOGGING (Tenant Isolated)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id),
    total_amount DECIMAL(12,2) NOT NULL,
    vat_amount DECIMAL(12,2) NOT NULL, -- 15% VAT compliance
    discount_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50), -- 'Cash', 'CBE Birr', 'Telebirr'
    cashier_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

-- 5. ANALYTICS (Data Pipe for AI)
CREATE TABLE daily_pharmacy_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id),
    date DATE NOT NULL,
    total_sales DECIMAL(12,2),
    most_sold_medicine_id UUID REFERENCES global_medicines(id),
    stockout_risk_count INTEGER,
    predicted_revenue DECIMAL(12,2),
    UNIQUE(pharmacy_id, date)
);
