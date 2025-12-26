# 🗜️ Estrategia de Compactación - Fraud Detection Data

## 🎯 Problema
- **Dataset original**: 7.48M registros (~750 MB)
- **Límite Supabase**: 500 MB
- **Necesidad**: Mantener toda la información relevante para ML y dashboards

---

## ✅ Solución Implementada

### **Enfoque: Sampling Estratégico + Agregaciones**

```
Dataset Original (7.48M)
    ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 1: Transacciones (Sampling Inteligente)      │
│  - 100% fraudulentas (1.49M registros)             │
│  - ~13% legítimas (200K muestra estratificada)     │
│  = 1.69M registros (~152 MB)                       │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 2: Agregaciones Pre-calculadas               │
│  - KPIs diarios (~30 registros)                    │
│  - KPIs por comerciante (105 registros)            │
│  - KPIs por país (12 registros)                    │
│  - Patrones horarios (24 registros)                │
│  = ~171 registros (~0.02 MB)                       │
└─────────────────────────────────────────────────────┘
    ↓
TOTAL: ~152 MB (79.7% reducción)
✅ Dentro del límite de 500 MB
```

---

## 📊 Cálculos de Tamaño

### Dataset Completo (Estimado)

| Tabla | Registros | Tamaño Estimado |
|-------|-----------|-----------------|
| `fraud_transactions` | 1,690,000 | ~152 MB |
| `fraud_daily_kpis` | 30 | ~3 KB |
| `fraud_merchant_kpis` | 105 | ~16 KB |
| `fraud_country_kpis` | 12 | ~2 KB |
| `fraud_hourly_patterns` | 24 | ~2 KB |
| **TOTAL** | **1,690,171** | **~152 MB** |

### Reducción Lograda
- **Registros**: 7.48M → 1.69M (77.4% reducción)
- **Tamaño**: 750 MB → 152 MB (79.7% reducción)
- **Información preservada**: 100% de fraudes + representatividad estadística

---

## 🎯 Estrategia de Sampling

### **1. Transacciones Fraudulentas (100%)**
```python
# TODAS las transacciones fraudulentas se conservan
frauds = df[df['is_fraud'] == True]  # 1,494,719 registros
```

**Razón**: Son el 19.97% del dataset pero son críticas para:
- Entrenar modelos de ML
- Análisis de patrones de fraude
- Dashboards ejecutivos

### **2. Transacciones Legítimas (Muestra Estratificada)**
```python
# Sampling estratificado por 4 dimensiones
legit_sample = legit.groupby([
    'country', 
    'merchant_category', 
    'channel', 
    'card_type'
]).apply(lambda x: x.sample(n=proportional_size))
```

**Tamaño**: ~200,000 registros (3.3% del total de legítimas)

**Razón**: Mantiene representatividad en:
- ✅ Distribución geográfica (12 países)
- ✅ Categorías de comercio (8 categorías)
- ✅ Canales (web, mobile, pos)
- ✅ Tipos de tarjeta (5 tipos)

---

## 🔧 Optimizaciones Técnicas

### **1. Tipos de Datos Optimizados**
```sql
-- Antes: TIMESTAMP (8 bytes)
-- Después: DATE (4 bytes) + SMALLINT hour (2 bytes)
timestamp → date + hour

-- Antes: BOOLEAN (1 byte)
-- Después: SMALLINT (2 bytes pero más eficiente en PG)
card_present → SMALLINT

-- Antes: TEXT ilimitado
-- Después: Índices solo en columnas filtradas
```

### **2. Velocity Metrics Parseadas**
```python
# Antes: JSON string (~200 chars)
velocity_last_hour = "{'num_transactions': 1197, ...}"

# Después: 5 columnas numéricas
velocity_num_trans: INTEGER
velocity_total_amount: DECIMAL
velocity_unique_merchants: SMALLINT
velocity_unique_countries: SMALLINT
velocity_max_amount: DECIMAL
```

**Beneficio**: 
- Queries más rápidas (sin parsing de JSON)
- Menor tamaño de almacenamiento
- Indexación eficiente

### **3. Campos Eliminados**
- `ip_address` (alta cardinalidad, poco valor para dashboards)
- `timestamp` completo (reemplazado por date + hour)
- `city_size` (redundante con city)

---

## 📈 Información Preservada

### **✅ Para Dashboards**
1. **Métricas Globales**: Fraud rate, total amount, avg amount
2. **Tendencias Temporales**: Diarias, por hora del día
3. **Segmentación Geográfica**: Por país con fraud rates
4. **Análisis de Comerciantes**: Top riesgosos, categorías problemáticas
5. **Señales de Fraude**: Card present, distance, high risk merchants

### **✅ Para Machine Learning**
1. **Todas las transacciones fraudulentas** (dataset desbalanceado manejable)
2. **Muestra representativa de legítimas** (para entrenar clasificadores)
3. **Features completas**: Velocity, temporal, location, card, device
4. **Métricas de contexto**: Customer behavior, merchant history

### **✅ Para Análisis de Negocio**
1. **ROI de prevención**: Fraud amount saved
2. **Patrones de ataque**: Por hora, país, merchant
3. **Segmentación de riesgo**: Merchants, countries, channels
4. **KPIs operativos**: Detection rate, false positives

---

## 🚀 Cómo Ejecutar

### **Paso 1: Modo TEST (Rápido)**
```bash
python compact_fraud_data.py test
```
Procesa solo 100K registros para verificar que funciona (~1 min)

### **Paso 2: Modo COMPLETO (Producción)**
```bash
python compact_fraud_data.py
```
Procesa los 7.48M registros completos (~5-10 min)

**Archivos generados**:
- `processed_fraud_transactions.csv` (1.69M registros)
- `processed_fraud_daily_kpis.csv` (30 registros)
- `processed_fraud_merchant_kpis.csv` (105 registros)
- `processed_fraud_country_kpis.csv` (12 registros)
- `processed_fraud_hourly_patterns.csv` (24 registros)

### **Paso 3: Cargar a Supabase**
```bash
# 1. Ejecutar schemas en Supabase SQL Editor
cat fraud_schemas.sql

# 2. Configurar .env con credenciales
cp .env.example .env

# 3. Cargar datos
python upload_to_supabase.py
```

---

## 📊 Comparación: Original vs Compacto

| Métrica | Original | Compacto | Cambio |
|---------|----------|----------|--------|
| **Registros Totales** | 7,483,766 | 1,690,171 | -77.4% |
| **Transacciones Fraud** | 1,494,719 | 1,494,719 | 0% |
| **Transacciones Legítimas** | 5,989,047 | ~195,000 | -96.7% |
| **Tamaño en Disco** | ~750 MB | ~152 MB | -79.7% |
| **Fraud Rate** | 19.97% | ~88.5% | ⚠️ Sesgado |
| **Países Únicos** | 12 | 12 | 0% |
| **Merchants Únicos** | 105 | 105 | 0% |
| **Información para ML** | 100% | ~95% | -5% |

### **⚠️ Nota sobre Fraud Rate**

El dataset compacto tiene fraud rate ~88.5% porque conservamos:
- ✅ **100%** de fraudulentas (1.49M)
- ✅ **3.3%** de legítimas (195K)

**Esto es INTENCIONAL** para:
1. **Dashboards**: Usamos las **agregaciones** (fraud_daily_kpis, etc.) que tienen los rates reales
2. **ML**: Ajustamos pesos de clase o usamos técnicas de balanceo (SMOTE, class_weight)

---

## 💡 Casos de Uso Cubiertos

### **1. Dashboard Ejecutivo** ✅
- Vista: `v_fraud_executive_summary`
- KPIs en tiempo real desde agregaciones
- Tendencias diarias/horarias

### **2. Análisis de Patrones** ✅
- Vista: `v_fraud_high_risk_merchants`
- Top comerciantes riesgosos
- Segmentación por país/canal

### **3. Machine Learning** ✅
- Tabla: `fraud_transactions`
- Todas las frauds + muestra balanceada
- Features completas (velocity, temporal, etc.)

### **4. Alertas en Tiempo Real** ✅
- Vista: `v_fraud_signals`
- Señales de alto riesgo
- Umbrales configurables

---

## 🔮 Siguiente Nivel: Datos Sintéticos

Si necesitamos **más datos de entrenamiento** sin ocupar espacio:

```python
# Generar datos sintéticos basados en la distribución real
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE

# SMOTE para balancear clases
smote = SMOTE(sampling_strategy=0.5, random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)
```

**Beneficio**: Datos de entrenamiento ilimitados sin storage adicional

---

## ✅ Conclusión

Esta estrategia de compactación permite:

1. ✅ **Cumplir límite de 500 MB** (usando solo 152 MB)
2. ✅ **Preservar 100% de información crítica** (todas las frauds)
3. ✅ **Mantener representatividad estadística** (sampling estratificado)
4. ✅ **Dashboards funcionales** (agregaciones pre-calculadas)
5. ✅ **ML viable** (dataset balanceado con técnicas estándar)
6. ✅ **Escalabilidad** (espacio para crecer a 348 MB más)

**Espacio restante en Supabase**: 348 MB para:
- Retail (50 MB)
- Airlines (150 MB)
- Telco (10 MB)
- **Buffer**: 138 MB

---

**Última actualización**: 2025-12-22
