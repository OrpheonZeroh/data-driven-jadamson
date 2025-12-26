-- ============================================================================
-- SUPABASE SCHEMAS - Data-Driven Portfolio
-- ============================================================================
-- Este archivo contiene los schemas SQL para crear las tablas en Supabase
-- Ejecutar en el SQL Editor de Supabase antes de usar upload_to_supabase.py
-- ============================================================================

-- ============================================================================
-- 1. RETAIL SALES TABLES
-- ============================================================================

-- Tabla principal de transacciones de retail
CREATE TABLE IF NOT EXISTS retail_transactions (
    transaction_id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    customer_id TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    product_category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    total_cogs DECIMAL(10,2),
    gross_profit DECIMAL(10,2),
    gross_margin_pct DECIMAL(5,2),
    year INTEGER,
    month INTEGER,
    quarter INTEGER,
    year_month TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de KPIs mensuales agregados de retail
CREATE TABLE IF NOT EXISTS retail_monthly_kpis (
    id SERIAL PRIMARY KEY,
    period TEXT NOT NULL,
    category TEXT NOT NULL,
    revenue DECIMAL(12,2) NOT NULL,
    profit DECIMAL(12,2),
    transactions INTEGER,
    units_sold INTEGER,
    margin_pct DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(period, category)
);

-- Índices para retail
CREATE INDEX IF NOT EXISTS idx_retail_trans_date ON retail_transactions(date);
CREATE INDEX IF NOT EXISTS idx_retail_trans_customer ON retail_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_retail_trans_category ON retail_transactions(product_category);
CREATE INDEX IF NOT EXISTS idx_retail_monthly_period ON retail_monthly_kpis(period);

-- ============================================================================
-- 2. AIRLINES FLIGHTS TABLES
-- ============================================================================

-- Tabla principal de vuelos
CREATE TABLE IF NOT EXISTS airlines_flights (
    id SERIAL PRIMARY KEY,
    airline TEXT NOT NULL,
    flight TEXT NOT NULL,
    source_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    route TEXT NOT NULL,
    departure_time TEXT,
    arrival_time TEXT,
    stops TEXT,
    class TEXT NOT NULL,
    duration DECIMAL(6,2) NOT NULL,
    days_left INTEGER,
    price DECIMAL(10,2) NOT NULL,
    price_per_hour DECIMAL(10,2),
    flight_length TEXT,
    booking_window TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de KPIs por ruta
CREATE TABLE IF NOT EXISTS airlines_route_kpis (
    id SERIAL PRIMARY KEY,
    route TEXT NOT NULL,
    airline TEXT NOT NULL,
    avg_price DECIMAL(10,2),
    total_revenue DECIMAL(15,2),
    total_flights INTEGER,
    avg_duration DECIMAL(6,2),
    direct_flights INTEGER,
    direct_flight_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(route, airline)
);

-- Índices para airlines
CREATE INDEX IF NOT EXISTS idx_airlines_route ON airlines_flights(route);
CREATE INDEX IF NOT EXISTS idx_airlines_airline ON airlines_flights(airline);
CREATE INDEX IF NOT EXISTS idx_airlines_source ON airlines_flights(source_city);
CREATE INDEX IF NOT EXISTS idx_airlines_dest ON airlines_flights(destination_city);
CREATE INDEX IF NOT EXISTS idx_airlines_route_kpis_route ON airlines_route_kpis(route);

-- ============================================================================
-- 3. TELCO CUSTOMER CHURN TABLES
-- ============================================================================

-- Tabla principal de clientes telco
CREATE TABLE IF NOT EXISTS telco_customers (
    customer_id TEXT PRIMARY KEY,
    gender TEXT,
    senior_citizen INTEGER,
    partner TEXT,
    dependents TEXT,
    tenure INTEGER NOT NULL,
    tenure_segment TEXT,
    phone_service TEXT,
    multiple_lines TEXT,
    internet_service TEXT,
    online_security TEXT,
    online_backup TEXT,
    device_protection TEXT,
    tech_support TEXT,
    streaming_tv TEXT,
    streaming_movies TEXT,
    contract TEXT NOT NULL,
    paperless_billing TEXT,
    payment_method TEXT,
    monthly_charges DECIMAL(8,2) NOT NULL,
    total_charges DECIMAL(10,2),
    churn TEXT NOT NULL,
    churn_binary INTEGER,
    arpu_segment TEXT,
    estimated_clv DECIMAL(10,2),
    total_services INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de KPIs por segmento
CREATE TABLE IF NOT EXISTS telco_segment_kpis (
    id SERIAL PRIMARY KEY,
    contract TEXT NOT NULL,
    tenure_segment TEXT NOT NULL,
    arpu_segment TEXT NOT NULL,
    churned_count INTEGER,
    churn_rate DECIMAL(5,2),
    total_customers INTEGER,
    avg_monthly_charges DECIMAL(8,2),
    avg_total_charges DECIMAL(10,2),
    revenue_at_risk DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(contract, tenure_segment, arpu_segment)
);

-- Índices para telco
CREATE INDEX IF NOT EXISTS idx_telco_churn ON telco_customers(churn);
CREATE INDEX IF NOT EXISTS idx_telco_contract ON telco_customers(contract);
CREATE INDEX IF NOT EXISTS idx_telco_tenure_seg ON telco_customers(tenure_segment);
CREATE INDEX IF NOT EXISTS idx_telco_arpu_seg ON telco_customers(arpu_segment);
CREATE INDEX IF NOT EXISTS idx_telco_seg_kpis_contract ON telco_segment_kpis(contract);

-- ============================================================================
-- 4. VIEWS PARA DASHBOARDS (OPCIONAL)
-- ============================================================================

-- Vista: Resumen ejecutivo de Retail
CREATE OR REPLACE VIEW v_retail_executive_summary AS
SELECT 
    SUM(total_amount) as total_revenue,
    SUM(gross_profit) as total_profit,
    ROUND(AVG(gross_margin_pct), 2) as avg_margin_pct,
    COUNT(*) as total_transactions,
    COUNT(DISTINCT customer_id) as unique_customers,
    ROUND(SUM(total_amount) / COUNT(*), 2) as aov
FROM retail_transactions;

-- Vista: Resumen ejecutivo de Airlines
CREATE OR REPLACE VIEW v_airlines_executive_summary AS
SELECT 
    COUNT(*) as total_flights,
    SUM(price) as total_revenue,
    ROUND(AVG(price), 2) as avg_price,
    ROUND(AVG(duration), 2) as avg_duration,
    COUNT(DISTINCT route) as unique_routes,
    ROUND(SUM(CASE WHEN stops = 'zero' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100, 2) as direct_flight_rate
FROM airlines_flights;

-- Vista: Resumen ejecutivo de Telco
CREATE OR REPLACE VIEW v_telco_executive_summary AS
SELECT 
    COUNT(*) as total_customers,
    SUM(churn_binary) as churned_customers,
    ROUND(AVG(churn_binary) * 100, 2) as churn_rate,
    ROUND(AVG(monthly_charges), 2) as arpu,
    SUM(monthly_charges) as total_monthly_revenue,
    ROUND(AVG(estimated_clv), 2) as avg_clv,
    ROUND(AVG(tenure), 1) as avg_tenure
FROM telco_customers;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (OPCIONAL - Para producción)
-- ============================================================================
-- Si quieres habilitar RLS, descomenta estas líneas:

-- ALTER TABLE retail_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE retail_monthly_kpis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE airlines_flights ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE airlines_route_kpis ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE telco_customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE telco_segment_kpis ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. DIGITAL PERFORMANCE DATA TABLES
-- ============================================================================

-- Tabla principal de datos de performance digital
CREATE TABLE IF NOT EXISTS digital_performance_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    channel TEXT NOT NULL,
    spend DECIMAL(10,2) NOT NULL,
    impressions INTEGER NOT NULL,
    clicks INTEGER NOT NULL,
    leads INTEGER NOT NULL,
    new_customers INTEGER NOT NULL,
    revenue DECIMAL(10,2) NOT NULL,
    churned_customers INTEGER NOT NULL,
    active_customers_start_of_day INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de KPIs calculados por canal y período
CREATE TABLE IF NOT EXISTS digital_performance_kpis (
    id SERIAL PRIMARY KEY,
    channel TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    total_spend DECIMAL(12,2),
    total_impressions BIGINT,
    total_clicks INTEGER,
    total_leads INTEGER,
    total_new_customers INTEGER,
    total_revenue DECIMAL(12,2),
    total_churned_customers INTEGER,
    avg_active_customers INTEGER,
    -- KPIs calculados
    cac DECIMAL(10,2), -- Customer Acquisition Cost
    arpu DECIMAL(10,2), -- Average Revenue Per User
    conversion_rate_clicks_to_leads DECIMAL(5,4), -- Clicks to Leads
    conversion_rate_leads_to_customers DECIMAL(5,4), -- Leads to Customers
    churn_rate DECIMAL(5,4), -- Churn Rate
    ltv DECIMAL(10,2), -- Lifetime Value
    ltv_cac_ratio DECIMAL(6,2), -- LTV/CAC Ratio
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(channel, period_start, period_end, period_type)
);

-- Índices para digital performance
CREATE INDEX IF NOT EXISTS idx_digital_perf_date ON digital_performance_data(date);
CREATE INDEX IF NOT EXISTS idx_digital_perf_channel ON digital_performance_data(channel);
CREATE INDEX IF NOT EXISTS idx_digital_perf_kpis_channel ON digital_performance_kpis(channel);
CREATE INDEX IF NOT EXISTS idx_digital_perf_kpis_period ON digital_performance_kpis(period_start, period_end);

-- Vista: Resumen ejecutivo de Digital Performance
CREATE OR REPLACE VIEW v_digital_performance_summary AS
SELECT 
    channel,
    SUM(spend) as total_spend,
    SUM(impressions) as total_impressions,
    SUM(clicks) as total_clicks,
    SUM(leads) as total_leads,
    SUM(new_customers) as total_new_customers,
    SUM(revenue) as total_revenue,
    SUM(churned_customers) as total_churned_customers,
    -- KPIs calculados
    ROUND(SUM(spend) / NULLIF(SUM(new_customers), 0), 2) as cac,
    ROUND(SUM(revenue) / NULLIF(AVG(active_customers_start_of_day), 0), 2) as arpu,
    ROUND(SUM(leads)::DECIMAL / NULLIF(SUM(clicks), 0) * 100, 2) as conversion_rate_clicks_to_leads,
    ROUND(SUM(new_customers)::DECIMAL / NULLIF(SUM(leads), 0) * 100, 2) as conversion_rate_leads_to_customers,
    ROUND(SUM(churned_customers)::DECIMAL / NULLIF(AVG(active_customers_start_of_day), 0) * 100, 2) as churn_rate
FROM digital_performance_data
GROUP BY channel;

-- ============================================================================
-- FIN DE SCHEMAS
-- ============================================================================
