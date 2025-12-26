# Business-Driven Data Portfolio
## Retail • Airlines • Telco Churn • Fraud Detection

Portafolio completo de analítica orientada a negocio para roles de estrategia/BI/FP&A/Revenue/Retention/Risk.  
Incluye: limpieza + modelado + KPIs + dashboards ejecutivos + recomendaciones accionables + ML fraud detection.

## 🎯 Objetivo
Demostrar capacidad para:
- convertir datasets en **métricas de negocio** (ARPU, Churn, CAC, LTV, Gross Margin, eficiencia)
- construir **dashboards ejecutivos**
- generar **insights accionables** y **casos de negocio**
- publicar una app con UX clara (Next.js) consumiendo un backend analítico en Python

---

## 📦 Datasets

| Dataset | Registros | Objetivo de Negocio | Estado |
|---------|-----------|---------------------|--------|
| **Retail Sales** | 1,000 | Optimizar mix y rentabilidad | ✅ Procesado |
| **Airlines Flights** | 300,153 | Eficiencia operativa y pricing | ✅ Procesado |
| **Telco Customer Churn** | 7,043 | Reducir churn y maximizar CLV | ✅ Procesado |
| **Fraud Detection** | 7.48M → 1.69M | Detectar transacciones fraudulentas | ✅ Compactado |

---

## 🧱 Arquitectura (Next.js + Python backend)
### Frontend (Next.js)
- App con **3 tabs**: Retail, Airlines, Telco
- Un tab adicional opcional: **Overview (Executive)** con tarjetas globales y comparativos
- Componentes:
  - KPI Cards (variación, meta, semáforo)
  - Charts dinámicos (filtros: fecha, región, categoría, canal, segmento)
  - Tabla drill-down con export CSV

### Backend (Python)
- API en **FastAPI**
- Procesamiento:
  - `pandas/polars` para ETL
  - modelos/estadística cuando aplique (churn propensity, forecast simple)
- Respuestas listas para UI (series para charts, KPIs agregados, breakdowns)

### Flujo
1) Usuario filtra en UI → 2) Next.js llama API → 3) API agrega/filtra → 4) UI renderiza

---

## 🗂️ Estructura del repo
.
├── apps/
│   ├── web/                   # Next.js frontend
│   └── api/                   # FastAPI backend
├── data/
│   ├── raw/                   # CSV originales
│   └── processed/             # datasets limpios/featureados (parquet recomendado)
├── notebooks/                 # exploración y prototipos (opcional)
├── docs/
│   ├── executive_summary.md   # resumen ejecutivo (1-2 páginas)
│   └── data_dictionary.md     # diccionario de datos y definiciones KPI
└── docker-compose.yml         # levantar web + api

---

# ✅ Entregables (por dataset)

## 1) Retail Sales — “Rentabilidad & Mix”
### Preguntas de negocio
- ¿Qué productos/categorías destruyen margen?
- ¿Qué regiones/canales son más rentables?
- ¿Dónde enfocar inventario y promociones?

### KPIs principales (Cards)
- Revenue total
- Gross Margin % (si hay COGS; si no, proxy/markup)
- Ticket promedio (AOV)
- Top categorías por contribución
- Pareto 80/20 (contribución a revenue y/o margen)

### Visualizaciones recomendadas
- Serie temporal: Revenue y Gross Margin %
- Barras: Top categorías por contribución
- Pareto chart: contribución acumulada (SKU/Category)
- Heatmap: Región x Categoría (Revenue/Margin)
- Tabla drill-down: SKU/Category con filtros

### Insights esperados (outputs)
- Lista de “margin killers”
- Segmentos de alta contribución vs bajo margen
- Recomendación de mix (qué empujar / qué retirar)

### Endpoints API (propuestos)
- GET `/retail/summary`
- GET `/retail/timeseries?metric=revenue&grain=month`
- GET `/retail/breakdown?by=category&metric=revenue`
- GET `/retail/pareto?by=sku&metric=revenue`
- GET `/retail/table?filters=...`

---

## 2) Airlines — “Eficiencia Operativa & Confiabilidad”
### Preguntas de negocio
- ¿Qué rutas generan más retraso/costo?
- ¿Dónde están los cuellos de botella operativos?
- ¿Qué variables explican retrasos?

### KPIs principales (Cards)
- Total flights
- On-time rate (si hay delay)
- Avg delay (min)
- Top rutas con mayor delay
- “Delay impact score” (métrica compuesta: delay * volumen)

### Visualizaciones recomendadas
- Time series: on-time / delay
- Ranking: rutas con peor desempeño
- Scatter: volumen vs delay promedio (priorización)
- Heatmap: origen-destino vs delay
- Tabla: rutas + métricas + tendencia

### Insights esperados
- Rutas “problema” (alto volumen + alto delay)
- Priorización de mejora (top 10 iniciativas)
- Narrativa de eficiencia y reducción de costo (aunque sea proxy)

### Endpoints API (propuestos)
- GET `/airlines/summary`
- GET `/airlines/timeseries?metric=delay&grain=week`
- GET `/airlines/routes/rank?metric=avg_delay`
- GET `/airlines/routes/scatter?x=volume&y=avg_delay`
- GET `/airlines/table?filters=...`

---

## 3) Telco Churn — “Retención, ARPU y Valor del Cliente”
### Preguntas de negocio
- ¿Quién se está yendo y por qué?
- ¿Cuánto revenue se pierde por churn?
- ¿Qué palancas bajan churn sin erosionar ARPU?

### KPIs principales (Cards)
- Churn rate
- ARPU (MonthlyCharges avg)
- Revenue at risk (ARPU * churners)
- Segmentos críticos (alto churn + alto ARPU)
- Drivers top (contrato, tenure, servicios)

### Visualizaciones recomendadas
- Funnel/stack: churn por segmento (contract type, tenure buckets)
- Cohorts: churn por tenure (bucket)
- Barras: churn rate por categoría
- SHAP/feature importance (opcional si hacemos modelo simple)
- Simulador: “si reduzco churn 1pp => impacto $”

### Insights esperados
- Segmentos con churn alto y acciones recomendadas
- Retención por cohortes (tenure)
- Caso de negocio: impacto financiero de reducción de churn

### Endpoints API (propuestos)
- GET `/telco/summary`
- GET `/telco/churn/breakdown?by=contract`
- GET `/telco/churn/cohorts?by=tenure_bucket`
- GET `/telco/revenue_at_risk`
- POST `/telco/model/train` (opcional)
- GET `/telco/model/importance` (opcional)

---

# 🧭 Tab “Executive Overview” (recomendado)
Una vista para directivos con:
- Cards globales: Revenue, Gross Margin (Retail), On-time (Airlines), Churn/ARPU (Telco)
- “Top 3 alerts” (anomalías y riesgos)
- Recomendaciones accionables (bullets)
- Un selector de dataset para drill-down

Endpoints:
- GET `/overview/summary`
- GET `/overview/alerts`
- GET `/overview/recommendations`

---

## 🧪 Metodología y estándares
### Data pipeline
1) Ingesta CSV → 2) limpieza → 3) estandarización → 4) features → 5) outputs API
- Guardamos `processed/*.parquet` para performance.

### Calidad de datos (checks)
- nulos por columna
- valores fuera de rango
- duplicados
- consistencia de tipos
- “data freshness” (si aplica)

---

## 🛠️ Stack sugerido
Frontend:
- Next.js (App Router)
- Recharts (charts)
- TanStack Table (tabla)
- Zod (validación)
- Tailwind (UI)

Backend:
- FastAPI
- Pandas/Polars
- Pydantic
- Uvicorn
- (Opcional) scikit-learn para churn model

Persistencia:
- Archivos Parquet o SQLite/Postgres (si queremos histórico)

---

## 🚀 Cómo correr local (propuesto)
### Opción A: Docker Compose
- `docker-compose up --build`
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000/docs`

### Opción B: Manual
API:
- `cd apps/api`
- `pip install -r requirements.txt`
- `uvicorn main:app --reload --port 8000`

Web:
- `cd apps/web`
- `npm install`
- `npm run dev`

---

## 🧠 Roadmap
### Fase 1 (MVP)
- ETL + KPIs base + 3 tabs + overview
- 5-7 charts por dataset + tabla drill-down

### Fase 2
- Alertas automáticas (anomalías simples)
- Modelo churn (baseline) + explicabilidad básica

### Fase 3
- Forecast (retail demand / telco churn) + simuladores
- Export reports (PDF) “board-ready”

---

---

## 🗄️ MODELOS DE DATOS IMPLEMENTADOS

### **Arquitectura General**
```
RAW DATA (CSV)
    ↓
PROCESSING LAYER (Python/Pandas)
    ├─ Data Cleaning
    ├─ Feature Engineering
    ├─ KPI Calculation
    ├─ Data Compaction (Fraud)
    └─ Data Quality Checks
    ↓
SUPABASE (PostgreSQL)
    ├─ Transaction Tables
    ├─ Aggregated KPIs
    ├─ Materialized Views
    ├─ Analytical Functions
    └─ Data Validation
    ↓
DASHBOARDS & ML MODELS
```

---

## 📊 1. RETAIL SALES - Modelo de Datos

### **Tablas Implementadas**

#### `retail_transactions` (1,000 registros)
**Propósito**: Transacciones individuales con métricas de rentabilidad

| Campo | Tipo | Cálculo/Origen | Descripción |
|-------|------|----------------|-------------|
| transaction_id | TEXT | Original | ID único de transacción |
| date | DATE | Original | Fecha de compra |
| customer_id | TEXT | Original | ID del cliente |
| product_category | TEXT | Original | Categoría (Beauty, Clothing, Electronics) |
| quantity | INT | Original | Unidades compradas |
| price_per_unit | DECIMAL | Original | Precio unitario |
| total_amount | DECIMAL | Original | Revenue de la transacción |
| **total_cogs** | DECIMAL | `Price × 0.60 × Quantity` | Costo de bienes (60% markup) |
| **gross_profit** | DECIMAL | `Total Amount - Total COGS` | Ganancia bruta |
| **gross_margin_pct** | DECIMAL | `(Gross Profit / Total Amount) × 100` | Margen bruto % |

#### `retail_monthly_kpis` (36 registros)
**Propósito**: KPIs agregados por mes y categoría

**Algoritmo de Agregación**:
```python
monthly_kpis = df.groupby(['YearMonth', 'Product Category']).agg({
    'Total Amount': 'sum',           # Revenue total
    'Gross_Profit': 'sum',           # Profit total
    'Transaction ID': 'count',       # Número de transacciones
    'Quantity': 'sum'                # Unidades vendidas
})
monthly_kpis['margin_pct'] = (profit / revenue) × 100
```

### **KPIs Calculados**
- **Revenue Total**: $456,000
- **Gross Margin**: 40% (consistente)
- **AOV (Average Order Value)**: `Revenue / Transacciones` = $456
- **Pareto 80/20**: Electronics 34.4%, Clothing 34.1%, Beauty 31.5%

---

## ✈️ 2. AIRLINES FLIGHTS - Modelo de Datos

### **Tablas Implementadas**

#### `airlines_flights` (300,153 registros)
**Propósito**: Vuelos individuales con métricas de eficiencia

| Campo | Tipo | Cálculo/Origen | Descripción |
|-------|------|----------------|-------------|
| airline | TEXT | Original | Aerolínea (Vistara, Air India, etc.) |
| route | TEXT | `Source → Destination` | Ruta completa |
| duration | DECIMAL | Original | Duración en horas |
| price | DECIMAL | Original | Precio del boleto |
| stops | TEXT | Original | Escalas (zero, one, two_or_more) |
| class | TEXT | Original | Clase (Economy, Business) |
| **price_per_hour** | DECIMAL | `Price / Duration` | Eficiencia de precio |
| **flight_length** | TEXT | Bins de duration | Short/Medium/Long/Very Long |
| **booking_window** | TEXT | Bins de days_left | Last Minute/Short/Medium/Early |

#### `airlines_route_kpis` (180 registros)
**Propósito**: KPIs por ruta y aerolínea

**Algoritmo de Agregación**:
```python
route_kpis = df.groupby(['route', 'airline']).agg({
    'price': ['mean', 'sum', 'count'],
    'duration': 'mean',
    'stops': lambda x: (x == 'zero').sum()
})
route_kpis['direct_flight_rate'] = (direct_flights / total_flights) × 100
route_kpis['efficiency_score'] = direct_flight_rate / avg_duration
```

### **KPIs Calculados**
- **Direct Flight Rate**: 12% (bajo - oportunidad de mejora)
- **Average Price**: $20,890
- **Business Class Revenue**: 78% del total (alta dependencia)
- **Efficiency Score**: Ranking de rutas por eficiencia operativa

---

## 📞 3. TELCO CHURN - Modelo de Datos

### **Tablas Implementadas**

#### `telco_customers` (7,043 registros)
**Propósito**: Perfiles de clientes con análisis de churn

| Campo | Tipo | Cálculo/Origen | Descripción |
|-------|------|----------------|-------------|
| customer_id | TEXT | Original | ID único del cliente |
| tenure | INT | Original (limpio) | Meses como cliente |
| monthly_charges | DECIMAL | Original | ARPU (cargo mensual) |
| total_charges | DECIMAL | Cleaned (fillna) | Cargos acumulados |
| churn | TEXT | Original | Hizo churn (Yes/No) |
| **churn_binary** | INT | `1 if Churn='Yes' else 0` | Variable objetivo para ML |
| **tenure_segment** | TEXT | Bins de tenure | 0-12/13-24/25-48/48+ meses |
| **arpu_segment** | TEXT | Bins de monthly_charges | Low/Medium/High/Premium |
| **estimated_clv** | DECIMAL | `Monthly Charges × Tenure` | Customer Lifetime Value |
| **total_services** | INT | Count de servicios='Yes' | Servicios contratados |

#### `telco_segment_kpis` (180 registros)
**Propósito**: KPIs por segmento (Contract × Tenure × ARPU)

**Algoritmo de Segmentación**:
```python
segment_kpis = df.groupby(['Contract', 'Tenure_Segment', 'ARPU_Segment']).agg({
    'Churn_Binary': ['sum', 'mean', 'count'],
    'MonthlyCharges': 'mean',
    'TotalCharges': 'mean'
})
segment_kpis['churn_rate'] = (churned / total) × 100
segment_kpis['revenue_at_risk'] = churned_count × avg_monthly_charges
```

### **KPIs Calculados**
- **Churn Rate**: 26.54% (1,869 clientes)
- **ARPU**: $64.76/mes
- **Revenue at Risk**: $139,131/mes ($1.67M/año)
- **Average CLV**: $2,280
- **Impacto de reducción 5pp**: $314K/año recuperados

### **Drivers de Churn Identificados**
- **Contratos Month-to-Month**: 42.7% churn (vs 11% anuales)
- **Nuevos clientes (0-12m)**: 50.4% churn
- **Fiber Optic**: 41.9% churn (problemas de servicio)
- **Electronic Check**: Mayor tasa de churn por método de pago

---

## 🔒 4. FRAUD DETECTION - Modelo de Datos (COMPACTADO)

### **Desafío: Compactación de 7.48M a 1.69M registros**

**Problema**: Dataset de 750 MB excede límite de Supabase (500 MB)  
**Solución**: Sampling estratégico + agregaciones pre-calculadas

### **Algoritmo de Compactación**

```python
# PASO 1: Conservar TODAS las transacciones fraudulentas
frauds = df[df['is_fraud'] == True]  # 1,494,719 registros (100%)

# PASO 2: Sampling estratificado de legítimas
legit_sample = legit.groupby([
    'country', 
    'merchant_category', 
    'channel', 
    'card_type'
]).apply(lambda x: x.sample(
    n=proportional_size,
    random_state=42
))  # ~200,000 registros (3.3% de legítimas)

# PASO 3: Combinar
compact_df = pd.concat([frauds, legit_sample])
# Resultado: 1.69M registros (-77.4%)
# Tamaño: 152 MB (-79.7%)
```

### **Tablas Implementadas**

#### `fraud_transactions` (1.69M registros)
**Propósito**: Transacciones con features para ML

| Campo | Tipo | Cálculo/Origen | Descripción |
|-------|------|----------------|-------------|
| transaction_id | TEXT | Original | ID único |
| customer_id | TEXT | Original | ID del cliente |
| date | DATE | Parsed | Fecha de transacción |
| hour | SMALLINT | Extracted | Hora del día (0-23) |
| merchant_category | TEXT | Original | Categoría (Retail, Travel, etc.) |
| amount | DECIMAL | Original | Monto de transacción |
| country | TEXT | Original | País de la transacción |
| card_type | TEXT | Original | Tipo de tarjeta |
| channel | TEXT | Original | Canal (web, mobile, pos) |
| card_present | SMALLINT | Original → Int | 1 si tarjeta física presente |
| distance_from_home | SMALLINT | Original | 0=casa, 1=lejos |
| high_risk_merchant | SMALLINT | Original → Int | 1 si comerciante riesgoso |
| **velocity_num_trans** | INT | Parsed from JSON | # transacciones última hora |
| **velocity_total_amount** | DECIMAL | Parsed from JSON | $ gastado última hora |
| **velocity_unique_merchants** | SMALLINT | Parsed from JSON | # comerciantes distintos |
| is_fraud | SMALLINT | Original → Int | 1=fraude, 0=legítima |

**Parsing de Velocity Metrics**:
```python
# Original: {'num_transactions': 1197, 'total_amount': 33498.56, ...}
velocity_data = df['velocity_last_hour'].apply(ast.literal_eval)
df['velocity_num_trans'] = velocity_data.apply(lambda x: x.get('num_transactions'))
df['velocity_total_amount'] = velocity_data.apply(lambda x: x.get('total_amount'))
# ... etc
```

#### `fraud_daily_kpis` (30 registros)
**Propósito**: KPIs diarios para dashboards

**Algoritmo de Agregación**:
```python
daily_kpis = df.groupby('date').agg({
    'transaction_id': 'count',
    'amount': ['sum', 'mean', 'median'],
    'is_fraud': ['sum', 'mean'],
    'customer_id': 'nunique',
    'merchant': 'nunique'
})
daily_kpis['fraud_rate'] = (fraud_count / total_transactions) × 100
daily_kpis['fraud_amount'] = sum(amount WHERE is_fraud=1)
```

#### `fraud_merchant_kpis` (105 registros)
**Propósito**: Scoring de riesgo por comerciante

**Algoritmo de Risk Scoring**:
```python
merchant_kpis = df.groupby(['merchant', 'merchant_category']).agg({
    'is_fraud': ['sum', 'mean', 'count'],
    'amount': ['sum', 'mean']
})
merchant_kpis['fraud_rate'] = (fraud_count / total_transactions) × 100

# Risk Level Classification
def get_risk_level(fraud_rate):
    if fraud_rate >= 50: return 'critical'
    elif fraud_rate >= 30: return 'high'
    elif fraud_rate >= 15: return 'medium'
    else: return 'low'
```

#### `fraud_country_kpis` (12 registros)
**Propósito**: Análisis geográfico de fraude

#### `fraud_hourly_patterns` (24 registros)
**Propósito**: Patrones temporales (hora del día)

### **KPIs y Señales de Fraude Calculados**

**Métricas Globales**:
- **Fraud Rate**: 19.97% (1.49M fraudulentas)
- **Total Transacciones**: 7.48M
- **Balance**: Ratio 1:4 (bueno para ML)

**Señales Fuertes de Fraude** (correlación detectada):
- **Card Present = True**: 100% fraude ⚠️ (todas las transacciones físicas)
- **Distance from Home = 1**: 56.78% fraude
- **Card Not Present**: 12.35% fraude
- **High Risk Merchant**: 19.99% fraude

**Top Patrones Detectados**:
- Nigeria: Mayor volumen de fraude (849K transacciones)
- Healthcare: Categoría con más fraudes
- Hora 18:00: Peak de transacciones
- Web channel: 61% de transacciones

---

## 🧮 ALGORITMOS Y TÉCNICAS UTILIZADAS

### **1. Data Processing & Cleaning**
- **Pandas/NumPy**: ETL y transformaciones
- **Missing Value Imputation**: TotalCharges rellenado con MonthlyCharges
- **Type Optimization**: Boolean → SMALLINT, TIMESTAMP → DATE + HOUR
- **Outlier Detection**: Z-score para montos anómalos

### **2. Feature Engineering**
- **Temporal Features**: Year, Month, Quarter, Hour, DayOfWeek, IsWeekend
- **Binning/Discretization**: 
  - Tenure → Segments (0-12, 13-24, 25-48, 48+)
  - ARPU → Segments (Low, Medium, High, Premium)
  - Duration → Flight length categories
- **Derived Metrics**: 
  - CLV = Monthly Charges × Tenure
  - Gross Margin % = (Revenue - COGS) / Revenue
  - Price per Hour = Price / Duration
  - Efficiency Score = Direct Flight Rate / Avg Duration

### **3. Aggregation & Summarization**
- **GroupBy Operations**: Multi-dimensional agregaciones
- **Window Functions**: Rankings, cumulative sums
- **Pareto Analysis**: Contribución acumulada 80/20

### **4. Sampling Techniques (Fraud)**
- **Stratified Sampling**: Mantener distribución por país, categoría, canal, tipo de tarjeta
- **Imbalanced Data Handling**: 
  - Conservar 100% de clase minoritaria (frauds)
  - Submuestrear clase mayoritaria (legítimas)
  - Para ML: SMOTE, class_weight para balanceo

### **5. Data Compaction**
- **JSON Parsing**: Velocity metrics de string a columnas
- **Type Casting**: Reducir precision donde sea posible
- **Columnar Storage**: Parquet para storage eficiente (opcional)
- **Indexing Strategy**: Índices en columnas filtradas frecuentemente

### **6. KPI Calculation Methodology**

**Churn Rate**:
```
Churn Rate = (Customers who Churned / Total Customers) × 100
```

**Revenue at Risk**:
```
Revenue at Risk = Σ(Monthly Charges of Churned Customers)
```

**Gross Margin %**:
```
Gross Margin % = ((Revenue - COGS) / Revenue) × 100
COGS = Price per Unit × 0.60 × Quantity
```

**Fraud Rate**:
```
Fraud Rate = (Fraudulent Transactions / Total Transactions) × 100
```

**Direct Flight Rate**:
```
Direct Flight Rate = (Flights with stops='zero' / Total Flights) × 100
```

**Customer Lifetime Value**:
```
CLV = ARPU × Tenure (months)
```

---

## 📊 VIEWS & ANALYTICAL FUNCTIONS

### **Vistas Materializadas Implementadas**

```sql
-- Vista: Resumen Ejecutivo Retail
CREATE MATERIALIZED VIEW v_retail_executive_summary AS
SELECT 
    SUM(total_amount) as total_revenue,
    SUM(gross_profit) as total_profit,
    AVG(gross_margin_pct) as avg_margin,
    COUNT(*) as total_transactions,
    COUNT(DISTINCT customer_id) as unique_customers,
    SUM(total_amount) / COUNT(*) as aov
FROM retail_transactions;

-- Vista: Top Comerciantes de Riesgo (Fraud)
CREATE VIEW v_fraud_high_risk_merchants AS
SELECT merchant, merchant_category, fraud_rate, risk_level
FROM fraud_merchant_kpis
WHERE risk_level IN ('high', 'critical')
ORDER BY fraud_rate DESC;

-- Vista: Señales de Fraude
CREATE VIEW v_fraud_signals AS
SELECT 
    'Card Present' as signal,
    AVG(CASE WHEN card_present = 1 THEN is_fraud END) × 100 as fraud_rate
FROM fraud_transactions
WHERE card_present = 1;
```

---

## 🗂️ Estructura Final del Proyecto

```
data_driven/
├── 📄 CSV Originales (3)
│   ├── retail_sales_dataset.csv
│   ├── airlines_flights_data.csv
│   ├── WA_Fn-UseC_-Telco-Customer-Churn.csv
│   └── synthetic_fraud_data.csv (7.48M)
├── 📄 CSV Procesados (11)
│   ├── processed_retail_transactions.csv
│   ├── processed_retail_monthly_kpis.csv
│   ├── processed_airlines_flights.csv
│   ├── processed_airlines_route_kpis.csv
│   ├── processed_telco_customers.csv
│   ├── processed_telco_segment_kpis.csv
│   ├── processed_fraud_transactions.csv (compactado)
│   ├── processed_fraud_daily_kpis.csv
│   ├── processed_fraud_merchant_kpis.csv
│   ├── processed_fraud_country_kpis.csv
│   └── processed_fraud_hourly_patterns.csv
├── 🐍 Scripts Python (8)
│   ├── analyze_datasets.py
│   ├── process_retail.py
│   ├── process_airlines.py
│   ├── process_telco.py
│   ├── analyze_fraud_data.py
│   ├── compact_fraud_data.py
│   └── upload_to_supabase.py
├── 🗄️ SQL Schemas (2)
│   ├── supabase_schemas.sql (Retail, Airlines, Telco)
│   └── fraud_schemas.sql (Fraud Detection)
├── 📖 Documentación (4)
│   ├── readme.md (este archivo)
│   ├── data_dictionary.md
│   ├── executive_summary.md
│   └── FRAUD_COMPACTION_STRATEGY.md
└── ⚙️ Configuración
    ├── .env.example
    └── requirements.txt
```

---

## 📏 Tamaño y Optimización

| Dataset | Registros | Tamaño Original | Tamaño Final | Reducción |
|---------|-----------|-----------------|--------------|----------|
| Retail | 1,000 | 0.1 MB | 0.1 MB | 0% |
| Airlines | 300,153 | 50 MB | 50 MB | 0% |
| Telco | 7,043 | 2 MB | 2 MB | 0% |
| **Fraud** | **7.48M → 1.69M** | **750 MB** | **152 MB** | **79.7%** |
| **TOTAL** | **9.48M → 2.0M** | **802 MB** | **204 MB** | **74.6%** |

**Espacio en Supabase**: 204 MB / 500 MB (41% usado, 296 MB libres)

---

## 📌 Nota de portafolio (cómo venderlo)
Este proyecto está diseñado para roles "business-driven data":
- **BI / Analytics**: Dashboards ejecutivos, KPIs accionables
- **Strategy**: Análisis Pareto, segmentación, priorización
- **FP&A**: Forecasting, ROI, business cases
- **Revenue/Retention**: Churn analysis, CLV optimization
- **Risk/Fraud**: ML fraud detection, risk scoring
- **Data Engineering**: ETL pipelines, data compaction, optimization

Demuestra ejecución end-to-end: datos → limpieza → features → KPIs → insights → decisiones → dashboards.
