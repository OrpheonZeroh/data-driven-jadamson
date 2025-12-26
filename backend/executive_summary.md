# 📊 Executive Summary - Business-Driven Data Portfolio

## 🎯 Objetivo del Proyecto

Este portafolio demuestra capacidades end-to-end en **analítica orientada a negocio**, desde la ingesta de datos hasta insights accionables y dashboards ejecutivos. El proyecto está diseñado para roles de:

- **Business Intelligence / Data Analytics**
- **Strategy & Operations**
- **FP&A (Financial Planning & Analysis)**
- **Revenue Management**
- **Customer Retention & Growth**

---

## 📦 Datasets Analizados

### 1. **Retail Sales** (1,000 transacciones)
**Objetivo de negocio**: Optimizar mix de productos y rentabilidad

**Hallazgos clave**:
- 💰 **Revenue Total**: $456,000
- 📈 **Gross Margin**: 40.0% (consistente en todas las categorías)
- 🛒 **AOV (Ticket Promedio)**: $456
- 📦 **Mix de Productos**: Electronics (34.4%), Clothing (34.1%), Beauty (31.5%)

**Insights accionables**:
1. **Balance perfecto de categorías** - No hay categorías subyacentes ni dominantes
2. **Margen consistente** - Política de pricing bien estructurada (40% gross margin)
3. **Oportunidad de segmentación** - Diferencias por edad y género para personalización

**Segmentos de alto valor**:
- Clientes 46-55 años: Mayor spend ($100,690)
- Mujeres: Ligeramente mayor revenue ($232,840 vs $223,160)

---

### 2. **Airlines Flights** (300,153 vuelos)
**Objetivo de negocio**: Mejorar eficiencia operativa y rentabilidad por ruta

**Hallazgos clave**:
- ✈️ **Total Vuelos**: 300,153
- ⏱️ **Duración Promedio**: 12.22 horas
- 💰 **Precio Promedio**: $20,890
- 🎯 **Vuelos Directos**: Solo 12% (oportunidad de mejora)
- 💼 **Business Class**: 78% del revenue total

**Insights accionables**:
1. **Dependencia de Business Class** - 78% del revenue viene de solo 31% de pasajeros
2. **Baja tasa de vuelos directos** - 88% de vuelos tienen escalas (afecta experiencia)
3. **Premium pricing de Vistara** - Precio promedio 5.7x más que low-cost carriers

**Rutas críticas para optimización**:
- **Delhi → Mumbai**: Mayor volumen (20K+ vuelos), precio competitivo
- **Mumbai → Kolkata**: Mayor duración promedio (necesita optimización)

**Segmentación de precios por anticipación**:
- Last Minute (0-7 días): $26,451 (+37% vs Early booking)
- Early (30+ días): $19,261 (mejor precio)

---

### 3. **Telco Customer Churn** (7,043 clientes)
**Objetivo de negocio**: Reducir churn y maximizar Customer Lifetime Value

**Hallazgos clave**:
- 📉 **Churn Rate**: 26.54% (1,869 clientes)
- 💰 **ARPU**: $64.76/mes
- ⚠️ **Revenue at Risk**: $139,131/mes ($1.67M/año)
- 💎 **CLV Promedio**: $2,280
- 📅 **Tenure Promedio**: 32.4 meses

**Insights accionables**:

### 🔴 **Segmentos Críticos** (Alto ARPU + Alto Churn)
1. **High ARPU ($70-90) × 0-12 meses tenure**:
   - Churn: 429 clientes
   - Revenue at Risk: $33,711/mes
   - **Acción**: Programa de retención early-stage

2. **Premium ARPU ($90+) × 0-12 meses tenure**:
   - Churn: 165 clientes
   - Revenue at Risk: $15,944/mes
   - **Acción**: White-glove onboarding + incentivos

### 💡 **Drivers de Churn**
- **Contratos Month-to-Month**: 42.7% churn rate (vs 11% en contratos anuales)
- **Electronic Check**: Mayor churn rate (método de pago menos confiable)
- **Fiber Optic**: 41.9% churn (problemas de servicio o expectativas)
- **Nuevos clientes (0-12m)**: 50.4% churn rate

### 💵 **Impacto Financiero de Reducir Churn**
| Reducción | Nuevo Churn Rate | Revenue Recuperado/Mes | Impacto Anual |
|-----------|------------------|------------------------|---------------|
| -1pp      | 25.54%           | $5,242                 | $62,908       |
| -2pp      | 24.54%           | $10,485                | $125,815      |
| -5pp      | 21.54%           | $26,212                | $314,538      |
| -10pp     | 16.54%           | $52,423                | **$629,077**  |

**Recomendaciones prioritarias**:
1. **Migrar a contratos anuales** - Incentivos para convertir Month-to-Month
2. **Mejorar onboarding (primeros 12 meses)** - Donde ocurre 50%+ del churn
3. **Revisar calidad Fiber Optic** - Mayor ARPU pero también mayor churn
4. **Cambiar métodos de pago** - Migrar de Electronic Check a auto-pay

---

## 🎯 ROI Estimado del Proyecto

### Retail
- **Optimización de mix**: Potencial 5-10% mejora en margen
- **Segmentación de clientes**: +15% en conversión de campañas

### Airlines
- **Aumentar vuelos directos**: Reducción de costos operativos 8-12%
- **Optimización de pricing dinámico**: +3-5% revenue

### Telco (Mayor Impacto)
- **Reducir churn 5pp**: **$314K/año** en revenue recuperado
- **Aumentar CLV 20%**: +$456 por cliente = **$3.2M** en base actual

---

## 🛠️ Stack Técnico Utilizado

### Data Processing
- **Python**: pandas, numpy
- **ETL**: Limpieza, feature engineering, cálculo de KPIs
- **Calidad de datos**: Validación de nulos, duplicados, tipos

### Database
- **Supabase (PostgreSQL)**: 6 tablas + 3 vistas ejecutivas
- **Indexación**: Optimizada para queries de dashboard
- **Schemas**: Normalizados para joins eficientes

### Análisis
- Análisis de Pareto (80/20)
- Segmentación multidimensional
- Análisis de cohortes (tenure)
- Simulación de impacto (what-if)

---

## 📁 Entregables del Proyecto

### Scripts de Procesamiento
- ✅ `analyze_datasets.py` - EDA inicial
- ✅ `process_retail.py` - Pipeline Retail + KPIs
- ✅ `process_airlines.py` - Pipeline Airlines + KPIs
- ✅ `process_telco.py` - Pipeline Telco + KPIs + Churn Analysis

### Datos Procesados (6 archivos CSV)
- ✅ `processed_retail_transactions.csv` (1,000 rows)
- ✅ `processed_retail_monthly_kpis.csv` (36 rows)
- ✅ `processed_airlines_flights.csv` (300,153 rows)
- ✅ `processed_airlines_route_kpis.csv` (180 rows)
- ✅ `processed_telco_customers.csv` (7,043 rows)
- ✅ `processed_telco_segment_kpis.csv` (180 rows)

### Infraestructura
- ✅ `supabase_schemas.sql` - DDL para 6 tablas + vistas
- ✅ `upload_to_supabase.py` - Script de carga automatizada
- ✅ `.env.example` - Template de configuración

### Documentación
- ✅ `data_dictionary.md` - Diccionario completo de datos
- ✅ `executive_summary.md` - Este documento
- ✅ `readme.md` - Arquitectura y roadmap

---

## 🚀 Próximos Pasos

### Fase 1: Dashboard Frontend (Recomendado)
- **Next.js app** con 3 tabs (Retail, Airlines, Telco)
- KPI cards con tendencias y semáforos
- Charts interactivos (Recharts)
- Filtros dinámicos por fecha/categoría/segmento

### Fase 2: FastAPI Backend
- Endpoints RESTful para cada dataset
- Agregaciones on-demand
- Cache de queries frecuentes
- Rate limiting y autenticación

### Fase 3: Advanced Analytics
- **Modelo de Churn** (scikit-learn, XGBoost)
- **Forecast de Revenue** (Prophet, ARIMA)
- **Simuladores interactivos** (what-if scenarios)
- **Alertas automáticas** (anomaly detection)

### Fase 4: Producción
- Docker containers (web + api)
- CI/CD pipeline
- Monitoring (logs, performance)
- Data refresh automatizado

---

## 💼 Casos de Uso por Rol

### BI Analyst
- Dashboards ejecutivos con drill-down
- Automatización de reportes mensuales
- Data quality monitoring

### Strategy Analyst
- Análisis de Pareto y priorización
- Segmentación de mercado
- Business cases con ROI calculado

### FP&A
- Forecast de revenue
- Análisis de márgenes
- Escenarios what-if

### Retention Manager (Telco)
- Identificación de clientes en riesgo
- Impacto financiero de iniciativas
- Segmentación para campañas

### Revenue Manager (Airlines)
- Pricing dinámico por ruta
- Optimización de mix (Economy/Business)
- Análisis de booking windows

---

## 📈 Resultados Demostrados

✅ **Datos → Métricas de Negocio** (no solo SQL)  
✅ **Insights Accionables** (con ROI calculado)  
✅ **Calidad de Código** (modular, documentado, reutilizable)  
✅ **Orientación a Negocio** (KPIs que importan a stakeholders)  
✅ **Pensamiento Estratégico** (priorización, segmentación, impacto)

---

**Preparado por**: Data Analytics Portfolio  
**Fecha**: Diciembre 2025  
**Contacto**: Para demostración del dashboard y discusión de casos de uso
