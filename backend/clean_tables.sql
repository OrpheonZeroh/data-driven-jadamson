-- Limpiar todas las tablas antes de re-cargar datos
-- Ejecutar esto en Supabase SQL Editor si quieres empezar de cero

-- Retail
TRUNCATE TABLE retail_transactions CASCADE;
TRUNCATE TABLE retail_monthly_kpis CASCADE;

-- Airlines  
TRUNCATE TABLE airlines_flights CASCADE;
TRUNCATE TABLE airlines_route_kpis CASCADE;

-- Telco
TRUNCATE TABLE telco_customers CASCADE;
TRUNCATE TABLE telco_segment_kpis CASCADE;

-- Fraud (opcional)
TRUNCATE TABLE fraud_transactions CASCADE;
TRUNCATE TABLE fraud_daily_kpis CASCADE;
TRUNCATE TABLE fraud_merchant_kpis CASCADE;
TRUNCATE TABLE fraud_country_kpis CASCADE;
TRUNCATE TABLE fraud_hourly_patterns CASCADE;
