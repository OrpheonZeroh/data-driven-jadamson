# 📖 Data Dictionary - Business-Driven Data Portfolio

## 📦 1. RETAIL SALES

### Dataset Original: `retail_sales_dataset.csv`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Transaction ID | String | Identificador único de la transacción |
| Date | Date | Fecha de la transacción |
| Customer ID | String | Identificador único del cliente |
| Gender | String | Género del cliente (Male/Female) |
| Age | Integer | Edad del cliente |
| Product Category | String | Categoría del producto (Beauty, Clothing, Electronics) |
| Quantity | Integer | Cantidad de unidades compradas |
| Price per Unit | Decimal | Precio unitario del producto |
| Total Amount | Decimal | Monto total de la transacción |

### Tabla Procesada: `retail_transactions`
**Tabla principal con métricas calculadas**

| Campo | Tipo | Descripción | Cálculo |
|-------|------|-------------|---------|
| transaction_id | String | ID de transacción | Original |
| date | Date | Fecha de transacción | Original |
| customer_id | String | ID del cliente | Original |
| gender | String | Género | Original |
| age | Integer | Edad | Original |
| product_category | String | Categoría del producto | Original |
| quantity | Integer | Cantidad | Original |
| price_per_unit | Decimal | Precio unitario | Original |
| total_amount | Decimal | Revenue de la transacción | Original |
| **total_cogs** | Decimal | Costo de bienes vendidos | `Price per Unit * 0.60 * Quantity` |
| **gross_profit** | Decimal | Ganancia bruta | `Total Amount - Total COGS` |
| **gross_margin_pct** | Decimal | Margen bruto (%) | `(Gross Profit / Total Amount) * 100` |
| year | Integer | Año | Extraído de Date |
| month | Integer | Mes (1-12) | Extraído de Date |
| quarter | Integer | Trimestre (1-4) | Extraído de Date |
| year_month | String | Periodo año-mes | Format: "YYYY-MM" |

### Tabla Agregada: `retail_monthly_kpis`
**KPIs mensuales por categoría**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| period | String | Periodo (YYYY-MM) |
| category | String | Categoría de producto |
| revenue | Decimal | Revenue total del periodo |
| profit | Decimal | Ganancia bruta total |
| transactions | Integer | Número de transacciones |
| units_sold | Integer | Unidades vendidas |
| margin_pct | Decimal | Margen bruto promedio (%) |

### 📊 KPIs Principales - Retail
- **Total Revenue**: Suma de Total Amount
- **Gross Margin %**: (Total Gross Profit / Total Revenue) * 100
- **AOV (Average Order Value)**: Total Revenue / Total Transactions
- **Unique Customers**: Count distinct Customer ID
- **Pareto 80/20**: Categorías que aportan 80% del revenue

---

## ✈️ 2. AIRLINES FLIGHTS

### Dataset Original: `airlines_flights_data.csv`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| index | Integer | Índice del registro |
| airline | String | Aerolínea (Vistara, Air India, Indigo, etc.) |
| flight | String | Código del vuelo |
| source_city | String | Ciudad de origen |
| departure_time | String | Hora de salida (Morning, Evening, etc.) |
| stops | String | Número de escalas (zero, one, two_or_more) |
| arrival_time | String | Hora de llegada |
| destination_city | String | Ciudad de destino |
| class | String | Clase del vuelo (Economy, Business) |
| duration | Decimal | Duración del vuelo en horas |
| days_left | Integer | Días de anticipación de la reserva |
| price | Decimal | Precio del boleto |

### Tabla Procesada: `airlines_flights`
**Tabla principal con features adicionales**

| Campo | Tipo | Descripción | Cálculo |
|-------|------|-------------|---------|
| airline | String | Aerolínea | Original |
| flight | String | Código de vuelo | Original |
| source_city | String | Ciudad origen | Original |
| destination_city | String | Ciudad destino | Original |
| **route** | String | Ruta completa | `Source → Destination` |
| departure_time | String | Hora de salida | Original |
| arrival_time | String | Hora de llegada | Original |
| stops | String | Escalas | Original |
| class | String | Clase | Original |
| duration | Decimal | Duración (horas) | Original |
| days_left | Integer | Días anticipación | Original |
| price | Decimal | Precio | Original |
| **price_per_hour** | Decimal | Precio por hora | `Price / Duration` |
| **flight_length** | String | Categoría de duración | Short/Medium/Long/Very Long |
| **booking_window** | String | Ventana de reserva | Last Minute/Short/Medium/Early |

### Tabla Agregada: `airlines_route_kpis`
**KPIs por ruta y aerolínea**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| route | String | Ruta (origen → destino) |
| airline | String | Aerolínea |
| avg_price | Decimal | Precio promedio |
| total_revenue | Decimal | Revenue total de la ruta |
| total_flights | Integer | Número de vuelos |
| avg_duration | Decimal | Duración promedio (horas) |
| direct_flights | Integer | Vuelos directos (sin escalas) |
| direct_flight_rate | Decimal | % de vuelos directos |

### 📊 KPIs Principales - Airlines
- **Total Flights**: Count de vuelos
- **Direct Flight Rate**: (Vuelos con stops='zero' / Total Flights) * 100
- **Average Duration**: Promedio de duration
- **Average Price**: Promedio de price
- **Unique Routes**: Count distinct de rutas
- **Efficiency Score**: Direct Flight Rate / Avg Duration (mayor es mejor)

---

## 📞 3. TELCO CUSTOMER CHURN

### Dataset Original: `WA_Fn-UseC_-Telco-Customer-Churn.csv`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| customerID | String | ID único del cliente |
| gender | String | Género (Male/Female) |
| SeniorCitizen | Integer | Es adulto mayor (0/1) |
| Partner | String | Tiene pareja (Yes/No) |
| Dependents | String | Tiene dependientes (Yes/No) |
| tenure | Integer | Meses como cliente |
| PhoneService | String | Tiene servicio telefónico |
| MultipleLines | String | Tiene múltiples líneas |
| InternetService | String | Tipo de internet (DSL/Fiber optic/No) |
| OnlineSecurity | String | Servicio de seguridad online |
| OnlineBackup | String | Servicio de backup online |
| DeviceProtection | String | Protección de dispositivos |
| TechSupport | String | Soporte técnico |
| StreamingTV | String | Servicio de streaming TV |
| StreamingMovies | String | Servicio de streaming Movies |
| Contract | String | Tipo de contrato (Month-to-month/One year/Two year) |
| PaperlessBilling | String | Facturación sin papel |
| PaymentMethod | String | Método de pago |
| MonthlyCharges | Decimal | Cargo mensual |
| TotalCharges | Decimal | Cargos totales acumulados |
| Churn | String | Cliente hizo churn (Yes/No) |

### Tabla Procesada: `telco_customers`
**Tabla principal con features calculadas**

| Campo | Tipo | Descripción | Cálculo |
|-------|------|-------------|---------|
| customer_id | String | ID del cliente | Original |
| gender | String | Género | Original |
| senior_citizen | Integer | Adulto mayor (0/1) | Original |
| partner | String | Tiene pareja | Original |
| dependents | String | Tiene dependientes | Original |
| tenure | Integer | Meses como cliente | Original (limpio) |
| **tenure_segment** | String | Segmento de tenure | 0-12/13-24/25-48/48+ meses |
| phone_service | String | Servicio telefónico | Original |
| multiple_lines | String | Múltiples líneas | Original |
| internet_service | String | Tipo de internet | Original |
| online_security | String | Seguridad online | Original |
| online_backup | String | Backup online | Original |
| device_protection | String | Protección dispositivo | Original |
| tech_support | String | Soporte técnico | Original |
| streaming_tv | String | Streaming TV | Original |
| streaming_movies | String | Streaming Movies | Original |
| contract | String | Tipo de contrato | Original |
| paperless_billing | String | Facturación digital | Original |
| payment_method | String | Método de pago | Original |
| monthly_charges | Decimal | ARPU (cargo mensual) | Original (limpio) |
| total_charges | Decimal | Cargos totales | Original (nulos rellenados) |
| churn | String | Hizo churn (Yes/No) | Original |
| **churn_binary** | Integer | Churn binario (0/1) | 1 si Churn='Yes', 0 si 'No' |
| **arpu_segment** | String | Segmento de ARPU | Low/Medium/High/Premium |
| **estimated_clv** | Decimal | Customer Lifetime Value | `Monthly Charges * Tenure` |
| **total_services** | Integer | Servicios contratados | Count de servicios = 'Yes' |

### Tabla Agregada: `telco_segment_kpis`
**KPIs por segmento (Contract × Tenure × ARPU)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| contract | String | Tipo de contrato |
| tenure_segment | String | Segmento de tenure |
| arpu_segment | String | Segmento de ARPU |
| churned_count | Integer | Clientes que hicieron churn |
| churn_rate | Decimal | Tasa de churn (%) |
| total_customers | Integer | Total de clientes en el segmento |
| avg_monthly_charges | Decimal | ARPU promedio |
| avg_total_charges | Decimal | Total charges promedio |
| revenue_at_risk | Decimal | Revenue mensual en riesgo |

### 📊 KPIs Principales - Telco
- **Churn Rate**: (Churned Customers / Total Customers) * 100
- **ARPU (Average Revenue Per User)**: Promedio de Monthly Charges
- **Revenue at Risk**: Sum(Monthly Charges) de clientes con Churn='Yes'
- **Average CLV**: Promedio de Estimated CLV
- **Average Tenure**: Promedio de tenure en meses

---

## 🔢 Definiciones de Métricas de Negocio

### Retail
- **Gross Margin %**: Rentabilidad bruta. Objetivo: >35%
- **AOV**: Ticket promedio. Útil para estrategias de upselling
- **Pareto 80/20**: Identifica categorías más importantes

### Airlines
- **Direct Flight Rate**: Eficiencia operativa. Mayor = mejor
- **Price per Hour**: Métrica de valor para el cliente
- **Booking Window**: Indica comportamiento de compra

### Telco
- **Churn Rate**: KPI crítico de retención. Benchmark: 15-25%
- **ARPU**: Revenue promedio por usuario
- **CLV**: Valor de por vida del cliente
- **Revenue at Risk**: Impacto financiero del churn

---

## 📝 Notas de Calidad de Datos

### Retail
- ✅ Sin valores nulos
- ✅ Sin duplicados
- ℹ️ COGS estimado en 60% del precio (ajustar según negocio real)

### Airlines
- ✅ Sin valores nulos
- ✅ Sin duplicados
- ℹ️ No hay columna explícita de delay, se usa "eficiencia" como proxy

### Telco
- ⚠️ TotalCharges tenía 11 valores vacíos (0.16%)
- ✅ Corregidos: rellenados con MonthlyCharges
- ✅ Sin duplicados

---

**Última actualización**: 2025-12-22
