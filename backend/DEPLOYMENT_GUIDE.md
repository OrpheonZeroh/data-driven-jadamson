# 🚀 Guía de Deployment a Supabase

## 📋 Orden de Ejecución Completo

---

## PASO 1️⃣: Ejecutar Scripts SQL en Supabase

### **A. Ir a Supabase SQL Editor**
1. Abrir tu proyecto en https://supabase.com
2. Ir a **SQL Editor** (menú lateral izquierdo)
3. Click en **"+ New query"**

### **B. Ejecutar Schemas en ESTE ORDEN**

#### **1. Schemas Principales (PRIMERO)**
```sql
-- Copiar y pegar TODO el contenido de:
supabase_schemas.sql
```

**Qué crea**:
- ✅ `retail_transactions` + `retail_monthly_kpis`
- ✅ `airlines_flights` + `airlines_route_kpis`
- ✅ `telco_customers` + `telco_segment_kpis`
- ✅ Vistas ejecutivas (v_retail_executive_summary, etc.)
- ✅ Índices optimizados

**Tiempo estimado**: 10-15 segundos

---

#### **2. Schemas de Fraude (SEGUNDO - OPCIONAL)**
```sql
-- Copiar y pegar TODO el contenido de:
fraud_schemas.sql
```

**Qué crea**:
- ✅ `fraud_transactions` + 4 tablas de KPIs
- ✅ Vistas de análisis (v_fraud_high_risk_merchants, etc.)
- ✅ Índices optimizados

**Tiempo estimado**: 10-15 segundos

**Nota**: Solo ejecutar si vas a cargar datos de fraude (ocupan ~150 MB)

---

### **C. Verificar que se crearon las tablas**

En Supabase, ir a **Table Editor** y verificar que existan:

**Tablas Principales** (6):
- ✅ retail_transactions
- ✅ retail_monthly_kpis
- ✅ airlines_flights
- ✅ airlines_route_kpis
- ✅ telco_customers
- ✅ telco_segment_kpis

**Tablas Fraud** (5 - opcional):
- ✅ fraud_transactions
- ✅ fraud_daily_kpis
- ✅ fraud_merchant_kpis
- ✅ fraud_country_kpis
- ✅ fraud_hourly_patterns

---

## PASO 2️⃣: Configurar Credenciales

### **A. Copiar archivo de ejemplo**
```bash
cp .env.example .env
```

### **B. Obtener credenciales de Supabase**

1. En tu proyecto Supabase, ir a **Settings** → **API**
2. Copiar:
   - **Project URL** (ej: `https://abc123.supabase.co`)
   - **anon public** key (el key largo que empieza con `eyJ...`)

### **C. Editar .env**
```bash
# Abrir con tu editor
nano .env

# O
code .env
```

**Contenido del .env**:
```
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

---

## PASO 3️⃣: Procesar Datos (si no están procesados)

### **A. Verificar qué archivos existen**
```bash
ls -lh processed_*.csv
```

**Archivos esperados** (11 total):
- `processed_retail_transactions.csv`
- `processed_retail_monthly_kpis.csv`
- `processed_airlines_flights.csv`
- `processed_airlines_route_kpis.csv`
- `processed_telco_customers.csv`
- `processed_telco_segment_kpis.csv`
- `processed_fraud_transactions.csv` (opcional)
- `processed_fraud_daily_kpis.csv` (opcional)
- `processed_fraud_merchant_kpis.csv` (opcional)
- `processed_fraud_country_kpis.csv` (opcional)
- `processed_fraud_hourly_patterns.csv` (opcional)

### **B. Si faltan archivos, ejecutar scripts en ESTE ORDEN**

#### **1. Retail** (rápido - 1 segundo)
```bash
python process_retail.py
```

#### **2. Airlines** (lento - 30-60 segundos)
```bash
python process_airlines.py
```

#### **3. Telco** (rápido - 2 segundos)
```bash
python process_telco.py
```

#### **4. Fraud - OPCIONAL** (muy lento - 5-10 minutos)
```bash
python compact_fraud_data.py
# Cuando pregunte: ¿Continuar? (y/n): 
# Escribir: y
```

**Tamaños esperados**:
- Retail: ~0.2 MB
- Airlines: ~50 MB
- Telco: ~2 MB
- Fraud: ~150 MB (compactado)

---

## PASO 4️⃣: Cargar Datos a Supabase

### **A. Ejecutar script de upload**
```bash
python upload_to_supabase.py
```

### **B. Responder preguntas del script**

**Pregunta 1**: `¿Incluir datos de FRAUDE? (y/n) [n]:`
- Si tienes espacio (204 MB total) → `y`
- Si prefieres solo Retail+Airlines+Telco (54 MB) → `n`

**Pregunta 2**: `Presiona ENTER para continuar o Ctrl+C para cancelar`
- Presionar **ENTER**

### **C. Proceso de carga**

El script cargará en este orden:
1. ✅ Retail (1,000 registros) - ~2 segundos
2. ✅ Airlines (300,153 registros) - ~60 segundos
3. ✅ Telco (7,043 registros) - ~5 segundos
4. ✅ Fraud (1.69M registros) - ~10 minutos [OPCIONAL]

**Tiempo total estimado**:
- Sin Fraud: ~70 segundos
- Con Fraud: ~11 minutos

### **D. Verificación automática**

Al final, el script mostrará:
```
🔍 VERIFICANDO CARGA DE DATOS
   ✅ retail_transactions: 1000 registros
   ✅ retail_monthly_kpis: 36 registros
   ✅ airlines_flights: 300153 registros
   ✅ airlines_route_kpis: 180 registros
   ✅ telco_customers: 7043 registros
   ✅ telco_segment_kpis: 180 registros
   ✅ fraud_transactions: 1694245 registros [si incluiste fraud]
   ...
```

---

## PASO 5️⃣: Verificación Manual en Supabase

### **A. Verificar datos en Table Editor**

1. Ir a **Table Editor** en Supabase
2. Seleccionar cada tabla
3. Verificar que haya registros

### **B. Probar queries en SQL Editor**

```sql
-- 1. Verificar retail
SELECT COUNT(*), SUM(total_amount), AVG(gross_margin_pct) 
FROM retail_transactions;
-- Esperado: 1000 registros, $456,000, 40%

-- 2. Verificar airlines
SELECT COUNT(*), AVG(price), COUNT(DISTINCT route) 
FROM airlines_flights;
-- Esperado: 300,153 registros, ~$20,890, 180 rutas

-- 3. Verificar telco
SELECT COUNT(*), 
       SUM(CASE WHEN churn='Yes' THEN 1 ELSE 0 END) as churned,
       AVG(monthly_charges) as arpu
FROM telco_customers;
-- Esperado: 7,043 registros, 1,869 churned, $64.76 ARPU

-- 4. Verificar vistas ejecutivas
SELECT * FROM v_retail_executive_summary;
SELECT * FROM v_telco_executive_summary;
SELECT * FROM v_airlines_executive_summary;
```

---

## 📊 Uso de Espacio Final

| Dataset | Registros | Espacio |
|---------|-----------|---------|
| Retail | 1,036 | ~0.2 MB |
| Airlines | 300,333 | ~50 MB |
| Telco | 7,223 | ~2 MB |
| **Subtotal** | **308,592** | **~52 MB** |
| Fraud (opcional) | 1,694,245 | ~152 MB |
| **TOTAL** | **2,002,837** | **~204 MB** |

**Límite Supabase**: 500 MB  
**Espacio usado**: 204 MB (41%)  
**Espacio libre**: 296 MB (59%)

---

## ⚠️ Troubleshooting

### **Error: "SUPABASE_URL y SUPABASE_KEY deben estar configurados"**
**Solución**: Revisar que `.env` tenga las credenciales correctas

### **Error: "Table does not exist"**
**Solución**: Ejecutar primero los scripts SQL en Supabase SQL Editor

### **Error: "Archivo processed_*.csv no encontrado"**
**Solución**: Ejecutar primero los scripts `process_*.py`

### **Error: "Timeout" o "Connection error"**
**Solución**: 
- Verificar conexión a internet
- Revisar que Supabase project esté activo
- Reducir batch_size en upload_to_supabase.py

### **Compactación de fraud tarda mucho**
**Solución**: Es normal, procesa 7.48M registros. Tiempo esperado: 5-10 minutos

---

## ✅ Checklist de Deployment

- [ ] 1. Proyecto creado en Supabase
- [ ] 2. `supabase_schemas.sql` ejecutado en SQL Editor
- [ ] 3. `fraud_schemas.sql` ejecutado (opcional)
- [ ] 4. `.env` configurado con credenciales
- [ ] 5. `process_retail.py` ejecutado
- [ ] 6. `process_airlines.py` ejecutado
- [ ] 7. `process_telco.py` ejecutado
- [ ] 8. `compact_fraud_data.py` ejecutado (opcional)
- [ ] 9. `upload_to_supabase.py` ejecutado
- [ ] 10. Verificación manual en Supabase completada

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tus datos estarán en Supabase y listos para:
- 📊 Dashboards (Next.js + Recharts)
- 🔌 API (FastAPI endpoints)
- 📈 Análisis SQL directo
- 🤖 Modelos ML (con datos ya preparados)

**Próximo paso**: Crear dashboard frontend o API backend
