-- ============================================================================
-- FRAUD DETECTION SCHEMAS - Optimizado para Supabase (< 200MB)
-- ============================================================================
-- Modelo compacto: ~1.7M registros vs 7.48M originales (77% reducción)
-- Estrategia: Todas las frauds + muestra estratificada de legítimas
-- ============================================================================

-- ============================================================================
-- 1. TABLA PRINCIPAL DE TRANSACCIONES (COMPACTA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_transactions (
    transaction_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    card_number BIGINT NOT NULL,
    
    -- Temporal (optimizado - sin timestamp completo)
    date DATE NOT NULL,
    hour SMALLINT NOT NULL,
    day_of_week SMALLINT NOT NULL,
    is_weekend SMALLINT DEFAULT 0,
    
    -- Merchant
    merchant_category TEXT NOT NULL,
    merchant_type TEXT NOT NULL,
    merchant TEXT NOT NULL,
    
    -- Transaction
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL,
    
    -- Location
    country TEXT NOT NULL,
    city TEXT,
    
    -- Card & Device
    card_type TEXT NOT NULL,
    card_present SMALLINT NOT NULL,
    device TEXT NOT NULL,
    channel TEXT NOT NULL,
    device_fingerprint TEXT,
    
    -- Risk Indicators
    distance_from_home SMALLINT NOT NULL,
    high_risk_merchant SMALLINT NOT NULL,
    
    -- Velocity Metrics (parsed)
    velocity_num_trans INTEGER,
    velocity_total_amount DECIMAL(15,2),
    velocity_unique_merchants SMALLINT,
    velocity_unique_countries SMALLINT,
    velocity_max_amount DECIMAL(12,2),
    
    -- Target
    is_fraud SMALLINT NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices optimizados
CREATE INDEX idx_fraud_trans_date ON fraud_transactions(date);
CREATE INDEX idx_fraud_trans_fraud ON fraud_transactions(is_fraud);
CREATE INDEX idx_fraud_trans_customer ON fraud_transactions(customer_id);
CREATE INDEX idx_fraud_trans_merchant_cat ON fraud_transactions(merchant_category);
CREATE INDEX idx_fraud_trans_country ON fraud_transactions(country);
CREATE INDEX idx_fraud_trans_amount ON fraud_transactions(amount) WHERE is_fraud = 1;

-- ============================================================================
-- 2. KPIs DIARIOS AGREGADOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_daily_kpis (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Volume
    total_transactions INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    avg_amount DECIMAL(12,2),
    median_amount DECIMAL(12,2),
    
    -- Fraud Metrics
    fraud_count INTEGER NOT NULL,
    fraud_amount DECIMAL(15,2),
    fraud_rate DECIMAL(5,2),
    
    -- Diversity
    unique_customers INTEGER,
    unique_merchants INTEGER,
    unique_countries INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_daily_date ON fraud_daily_kpis(date);
CREATE INDEX idx_fraud_daily_rate ON fraud_daily_kpis(fraud_rate);

-- ============================================================================
-- 3. KPIs POR COMERCIANTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_merchant_kpis (
    id SERIAL PRIMARY KEY,
    merchant TEXT NOT NULL,
    merchant_category TEXT NOT NULL,
    merchant_type TEXT NOT NULL,
    
    -- Metrics
    total_transactions INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    avg_amount DECIMAL(12,2),
    
    -- Fraud
    fraud_count INTEGER NOT NULL,
    fraud_rate DECIMAL(5,2) NOT NULL,
    
    -- Customers
    unique_customers INTEGER,
    
    -- Risk Classification
    risk_level TEXT NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(merchant, merchant_category)
);

CREATE INDEX idx_merchant_kpis_risk ON fraud_merchant_kpis(risk_level);
CREATE INDEX idx_merchant_kpis_fraud_rate ON fraud_merchant_kpis(fraud_rate);
CREATE INDEX idx_merchant_kpis_category ON fraud_merchant_kpis(merchant_category);

-- ============================================================================
-- 4. KPIs POR PAÍS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_country_kpis (
    id SERIAL PRIMARY KEY,
    country TEXT NOT NULL UNIQUE,
    
    -- Metrics
    total_transactions INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    avg_amount DECIMAL(12,2),
    
    -- Fraud
    fraud_count INTEGER NOT NULL,
    fraud_rate DECIMAL(5,2) NOT NULL,
    
    -- Diversity
    unique_customers INTEGER,
    unique_merchants INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_country_kpis_fraud_rate ON fraud_country_kpis(fraud_rate);

-- ============================================================================
-- 5. PATRONES HORARIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_hourly_patterns (
    id SERIAL PRIMARY KEY,
    hour SMALLINT NOT NULL UNIQUE,
    
    -- Metrics
    total_transactions INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    avg_amount DECIMAL(12,2),
    
    -- Fraud
    fraud_count INTEGER NOT NULL,
    fraud_rate DECIMAL(5,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hourly_patterns_hour ON fraud_hourly_patterns(hour);

-- ============================================================================
-- 6. VISTAS PARA DASHBOARDS
-- ============================================================================

-- Vista: Resumen Ejecutivo
CREATE OR REPLACE VIEW v_fraud_executive_summary AS
SELECT 
    COUNT(*) as total_transactions,
    SUM(amount) as total_amount,
    ROUND(AVG(amount), 2) as avg_amount,
    SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_transactions,
    SUM(CASE WHEN is_fraud = 1 THEN amount ELSE 0 END) as fraud_amount,
    ROUND(AVG(CASE WHEN is_fraud = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) as fraud_rate,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(DISTINCT merchant) as unique_merchants,
    COUNT(DISTINCT country) as unique_countries
FROM fraud_transactions;

-- Vista: Top Comerciantes de Riesgo
CREATE OR REPLACE VIEW v_fraud_high_risk_merchants AS
SELECT 
    merchant,
    merchant_category,
    total_transactions,
    fraud_count,
    fraud_rate,
    total_amount,
    risk_level
FROM fraud_merchant_kpis
WHERE risk_level IN ('high', 'critical')
ORDER BY fraud_rate DESC, total_transactions DESC
LIMIT 20;

-- Vista: Tendencias Diarias (últimos 30 días)
CREATE OR REPLACE VIEW v_fraud_daily_trends AS
SELECT 
    date,
    total_transactions,
    total_amount,
    fraud_count,
    fraud_rate,
    fraud_amount
FROM fraud_daily_kpis
ORDER BY date DESC
LIMIT 30;

-- Vista: Análisis por País
CREATE OR REPLACE VIEW v_fraud_country_analysis AS
SELECT 
    country,
    total_transactions,
    fraud_rate,
    total_amount,
    unique_customers,
    unique_merchants
FROM fraud_country_kpis
ORDER BY total_transactions DESC;

-- Vista: Patrones Temporales de Fraude
CREATE OR REPLACE VIEW v_fraud_time_patterns AS
SELECT 
    hour,
    total_transactions,
    fraud_count,
    fraud_rate,
    CASE 
        WHEN hour BETWEEN 0 AND 5 THEN 'Madrugada'
        WHEN hour BETWEEN 6 AND 11 THEN 'Mañana'
        WHEN hour BETWEEN 12 AND 17 THEN 'Tarde'
        ELSE 'Noche'
    END as period_of_day
FROM fraud_hourly_patterns
ORDER BY hour;

-- Vista: Señales de Fraude
CREATE OR REPLACE VIEW v_fraud_signals AS
SELECT 
    'Card Present' as signal,
    SUM(CASE WHEN card_present = 1 THEN 1 ELSE 0 END) as total_cases,
    SUM(CASE WHEN card_present = 1 AND is_fraud = 1 THEN 1 ELSE 0 END) as fraud_cases,
    ROUND(
        AVG(CASE WHEN card_present = 1 THEN is_fraud ELSE NULL END) * 100, 
        2
    ) as fraud_rate
FROM fraud_transactions
WHERE card_present = 1
UNION ALL
SELECT 
    'Distance from Home' as signal,
    SUM(CASE WHEN distance_from_home = 1 THEN 1 ELSE 0 END) as total_cases,
    SUM(CASE WHEN distance_from_home = 1 AND is_fraud = 1 THEN 1 ELSE 0 END) as fraud_cases,
    ROUND(
        AVG(CASE WHEN distance_from_home = 1 THEN is_fraud ELSE NULL END) * 100, 
        2
    ) as fraud_rate
FROM fraud_transactions
WHERE distance_from_home = 1
UNION ALL
SELECT 
    'High Risk Merchant' as signal,
    SUM(CASE WHEN high_risk_merchant = 1 THEN 1 ELSE 0 END) as total_cases,
    SUM(CASE WHEN high_risk_merchant = 1 AND is_fraud = 1 THEN 1 ELSE 0 END) as fraud_cases,
    ROUND(
        AVG(CASE WHEN high_risk_merchant = 1 THEN is_fraud ELSE NULL END) * 100, 
        2
    ) as fraud_rate
FROM fraud_transactions
WHERE high_risk_merchant = 1;

-- ============================================================================
-- 7. FUNCIONES ÚTILES
-- ============================================================================

-- Función: Calcular fraud rate por segmento
CREATE OR REPLACE FUNCTION get_fraud_rate_by_segment(
    segment_column TEXT,
    segment_value TEXT
) RETURNS DECIMAL AS $$
DECLARE
    fraud_rate DECIMAL;
BEGIN
    EXECUTE format('
        SELECT ROUND(AVG(CASE WHEN is_fraud = 1 THEN 1.0 ELSE 0.0 END) * 100, 2)
        FROM fraud_transactions
        WHERE %I = %L
    ', segment_column, segment_value) INTO fraud_rate;
    
    RETURN COALESCE(fraud_rate, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FIN DE SCHEMAS
-- ============================================================================

-- Comentarios sobre el tamaño esperado:
-- fraud_transactions: ~1.7M registros x ~200 bytes = ~340 MB
-- fraud_daily_kpis: ~30 registros x 100 bytes = ~3 KB
-- fraud_merchant_kpis: ~105 registros x 150 bytes = ~16 KB
-- fraud_country_kpis: ~12 registros x 150 bytes = ~2 KB
-- fraud_hourly_patterns: 24 registros x 100 bytes = ~2.4 KB
-- TOTAL ESTIMADO: ~340 MB (dentro del límite de 500 MB)
