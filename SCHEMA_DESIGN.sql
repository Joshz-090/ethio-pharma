-- SMART MED TRACKER: DATABASE SCHEMA DESIGN (Arba Minch Localized)
-- This schema represents the simplified 11-Model structure for a 1-week build.

-- 1. USER & PROFILES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'patient', -- 'patient', 'pharmacist', 'admin'
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'am'
    phone_number VARCHAR(20)
);

-- 2. PHARMACIES & GEOGRAPHY
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    contact_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE, -- Admin approval system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pharmacy_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    address_text TEXT, -- "Near Arba Minch University Main Gate"
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    city_sector VARCHAR(100) -- "Secha", "Sikela"
);

-- 3. MEDICINE CATALOG
CREATE TABLE global_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generic_name VARCHAR(255) NOT NULL, -- e.g. "Paracetamol"
    brand_name VARCHAR(255),
    category VARCHAR(100), -- "Painkiller", "Antibiotic"
    dosage_form VARCHAR(50), -- "Tablet", "Syrup"
    description_en TEXT,
    description_am TEXT
);

-- 4. INVENTORY (Pharmacy-Specific)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES global_medicines(id),
    quantity_on_hand INTEGER DEFAULT 0,
    unit_price DECIMAL(12,2) NOT NULL,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE -- Fast toggle
);

-- 5. RESERVATIONS (No Payments)
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    pharmacy_id UUID REFERENCES pharmacies(id),
    inventory_id UUID REFERENCES inventory(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'fulfilled', 'expired', 'cancelled'
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- Usually reserved_at + 2 hours
);

-- 6. PATIENT ADHERENCE
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255),
    dosage_instruction TEXT,
    frequency_hours INTEGER, -- e.g. every 8 hours
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. SMART ANALYTICS (No AI)
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id), -- Nullable for guest search
    latitude DECIMAL(9,6), -- Location at time of search
    longitude DECIMAL(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medicine_popularity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES global_medicines(id) UNIQUE,
    search_count INTEGER DEFAULT 0,
    reservation_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. COMMUNICATION
CREATE TABLE chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    message_text TEXT,
    response_text TEXT, -- Response from FAQ-base
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
