"""
Script para subir datos procesados a Supabase
Asegúrate de haber ejecutado supabase_schemas.sql primero
"""
import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Cargar variables de entorno
load_dotenv()

class SupabaseUploader:
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("❌ ERROR: SUPABASE_URL y SUPABASE_KEY deben estar configurados en .env")
        
        self.supabase: Client = create_client(self.url, self.key)
        print("✅ Conectado a Supabase")
    
    def upload_data(self, df: pd.DataFrame, table_name: str, batch_size: int = 5000) -> bool:
        """Upload data to Supabase table in batches"""
        print(f"\n📤 Subiendo datos a tabla: {table_name}")
        print(f"   Total de registros: {len(df):,}")
        
        # Mapeo de nombres de columnas (CSV → SQL)
        column_mappings = {
            'retail_transactions': {
                'Transaction ID': 'transaction_id',
                'Date': 'date',
                'Customer ID': 'customer_id',
                'Gender': 'gender',
                'Age': 'age',
                'Product Category': 'product_category',
                'Quantity': 'quantity',
                'Price per Unit': 'price_per_unit',
                'Total Amount': 'total_amount',
                'Total_COGS': 'total_cogs',
                'Gross_Profit': 'gross_profit',
                'Gross_Margin_Pct': 'gross_margin_pct',
                'Year': 'year',
                'Month': 'month',
                'Quarter': 'quarter',
                'YearMonth': 'year_month'
            },
            'telco_customers': {
                'customerID': 'customer_id',
                'SeniorCitizen': 'senior_citizen',
                'Tenure_Segment': 'tenure_segment',
                'PhoneService': 'phone_service',
                'MultipleLines': 'multiple_lines',
                'InternetService': 'internet_service',
                'OnlineSecurity': 'online_security',
                'OnlineBackup': 'online_backup',
                'DeviceProtection': 'device_protection',
                'TechSupport': 'tech_support',
                'StreamingTV': 'streaming_tv',
                'StreamingMovies': 'streaming_movies',
                'Contract': 'contract',
                'PaperlessBilling': 'paperless_billing',
                'PaymentMethod': 'payment_method',
                'MonthlyCharges': 'monthly_charges',
                'TotalCharges': 'total_charges',
                'Churn': 'churn',
                'Churn_Binary': 'churn_binary',
                'ARPU_Segment': 'arpu_segment',
                'Estimated_CLV': 'estimated_clv',
                'Total_Services': 'total_services'
            },
            'digital_performance_data': {
                'Date': 'date',
                'Channel': 'channel',
                'Spend': 'spend',
                'Impressions': 'impressions',
                'Clicks': 'clicks',
                'Leads': 'leads',
                'New_Customers': 'new_customers',
                'Revenue': 'revenue',
                'Churned_Customers': 'churned_customers',
                'Active_Customers_Start_of_Day': 'active_customers_start_of_day'
            }
        }
        
        # Aplicar mapeo de columnas si existe
        if table_name in column_mappings:
            df = df.rename(columns=column_mappings[table_name])
        
        # Convertir booleanos a int para fraud_transactions
        if table_name == 'fraud_transactions':
            bool_columns = ['card_present', 'distance_from_home', 'high_risk_merchant', 'is_fraud', 'is_weekend']
            for col in bool_columns:
                if col in df.columns:
                    # Manejar strings, Python bools, y números
                    df[col] = df[col].replace({
                        'true': 1, 'false': 0, 'True': 1, 'False': 0,
                        True: 1, False: 0, '1': 1, '0': 0
                    })
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        
        total_rows = len(df)
        errors = []
        
        # Convertir DataFrame a lista de diccionarios
        records = df.to_dict('records')
        
        # Limpiar valores NaN (Supabase no acepta NaN)
        for record in records:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
        
        # Subir en lotes
        total_uploaded = 0
        errors = []
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                response = self.supabase.table(table_name).upsert(batch).execute()
                total_uploaded += len(batch)
                print(f"   ✅ Lote {i//batch_size + 1}: {len(batch)} registros subidos ({total_uploaded:,}/{len(records):,})")
            except Exception as e:
                error_msg = f"Error en lote {i//batch_size + 1}: {str(e)}"
                errors.append(error_msg)
                print(f"   ❌ {error_msg}")
        
        if errors:
            print(f"\n⚠️  Se encontraron {len(errors)} errores durante la carga")
            for error in errors[:5]:  # Mostrar solo los primeros 5 errores
                print(f"   - {error}")
        else:
            print(f"   ✅ Todos los registros subidos exitosamente")
        
        return total_uploaded, errors
    
    def upload_retail_data(self):
        """Sube datos de Retail a Supabase"""
        print("\n" + "="*80)
        print("📦 SUBIENDO DATOS DE RETAIL")
        print("="*80)
        
        # Transacciones
        try:
            df_trans = pd.read_csv('processed_retail_transactions.csv')
            self.upload_data(df_trans, 'retail_transactions')
        except FileNotFoundError:
            print("❌ Archivo processed_retail_transactions.csv no encontrado")
        
        # KPIs mensuales
        try:
            df_kpis = pd.read_csv('processed_retail_monthly_kpis.csv')
            self.upload_data(df_kpis, 'retail_monthly_kpis')
        except FileNotFoundError:
            print("❌ Archivo processed_retail_monthly_kpis.csv no encontrado")
    
    def upload_airlines_data(self):
        """Sube datos de Airlines a Supabase"""
        print("\n" + "="*80)
        print("✈️  SUBIENDO DATOS DE AIRLINES")
        print("="*80)
        
        # Vuelos
        try:
            df_flights = pd.read_csv('processed_airlines_flights.csv')
            self.upload_data(df_flights, 'airlines_flights', batch_size=5000)
        except FileNotFoundError:
            print("❌ Archivo processed_airlines_flights.csv no encontrado")
        
        # KPIs por ruta
        try:
            df_route_kpis = pd.read_csv('processed_airlines_route_kpis.csv')
            self.upload_data(df_route_kpis, 'airlines_route_kpis')
        except FileNotFoundError:
            print("❌ Archivo processed_airlines_route_kpis.csv no encontrado")
    
    def upload_telco_data(self):
        """Sube datos de Telco a Supabase"""
        print("\n" + "="*80)
        print("📞 SUBIENDO DATOS DE TELCO")
        print("="*80)
        
        # Clientes
        try:
            df_customers = pd.read_csv('processed_telco_customers.csv')
            self.upload_data(df_customers, 'telco_customers')
        except FileNotFoundError:
            print("❌ Archivo processed_telco_customers.csv no encontrado")
        
        # KPIs por segmento
        try:
            df_seg_kpis = pd.read_csv('processed_telco_segment_kpis.csv')
            self.upload_data(df_seg_kpis, 'telco_segment_kpis')
        except FileNotFoundError:
            print("❌ Archivo processed_telco_segment_kpis.csv no encontrado")
    
    def upload_fraud_data(self):
        """Sube datos de Fraude (compactados) a Supabase"""
        print("\n" + "="*80)
        print("🔒 SUBIENDO DATOS DE FRAUDE (COMPACTADOS)")
        print("="*80)
        
        # Transacciones compactadas
        try:
            df_trans = pd.read_csv('processed_fraud_transactions.csv')
            print(f"   📦 Transacciones a cargar: {len(df_trans):,}")
            self.upload_data(df_trans, 'fraud_transactions', batch_size=10000)
        except FileNotFoundError:
            print("❌ Archivo processed_fraud_transactions.csv no encontrado")
            print("   Ejecuta primero: python compact_fraud_data.py")
        
        # KPIs diarios
        try:
            df_daily = pd.read_csv('processed_fraud_daily_kpis.csv')
            self.upload_data(df_daily, 'fraud_daily_kpis')
        except FileNotFoundError:
            print("❌ Archivo processed_fraud_daily_kpis.csv no encontrado")
        
        # KPIs por comerciante
        try:
            df_merchant = pd.read_csv('processed_fraud_merchant_kpis.csv')
            self.upload_data(df_merchant, 'fraud_merchant_kpis')
        except FileNotFoundError:
            print("❌ Archivo processed_fraud_merchant_kpis.csv no encontrado")
        
        # KPIs por país
        try:
            df_country = pd.read_csv('processed_fraud_country_kpis.csv')
            self.upload_data(df_country, 'fraud_country_kpis')
        except FileNotFoundError:
            print("❌ Archivo processed_fraud_country_kpis.csv no encontrado")
        
        # Patrones horarios
        try:
            df_hourly = pd.read_csv('processed_fraud_hourly_patterns.csv')
            self.upload_data(df_hourly, 'fraud_hourly_patterns')
        except FileNotFoundError:
            print("❌ Archivo processed_fraud_hourly_patterns.csv no encontrado")
    
    def upload_digital_performance_data(self):
        """Sube datos de Digital Performance a Supabase"""
        print("\n" + "="*80)
        print("📊 SUBIENDO DATOS DE DIGITAL PERFORMANCE")
        print("="*80)
        
        # Datos principales de performance digital
        try:
            df_digital = pd.read_csv('digital_performance_data.csv')
            print(f"   📦 Registros de performance digital: {len(df_digital):,}")
            self.upload_data(df_digital, 'digital_performance_data', batch_size=5000)
        except FileNotFoundError:
            print("❌ Archivo digital_performance_data.csv no encontrado")
            print("   Verifica que el archivo esté en el directorio actual")
    
    def calculate_and_upload_digital_kpis(self):
        """Calcula y sube KPIs agregados de Digital Performance"""
        print("\n" + "="*80)
        print("📈 CALCULANDO Y SUBIENDO KPIs DE DIGITAL PERFORMANCE")
        print("="*80)
        
        try:
            # Leer datos desde Supabase
            response = self.supabase.table('digital_performance_data').select('*').execute()
            if not response.data:
                print("❌ No hay datos en digital_performance_data para calcular KPIs")
                return
            
            df = pd.DataFrame(response.data)
            df['date'] = pd.to_datetime(df['date'])
            
            # Calcular KPIs mensuales por canal
            monthly_kpis = []
            
            for channel in df['channel'].unique():
                channel_data = df[df['channel'] == channel]
                
                # Agrupar por mes
                channel_data['year_month'] = channel_data['date'].dt.to_period('M')
                
                for period, group in channel_data.groupby('year_month'):
                    period_start = period.start_time.date()
                    period_end = period.end_time.date()
                    
                    # Calcular métricas agregadas
                    total_spend = group['spend'].sum()
                    total_impressions = group['impressions'].sum()
                    total_clicks = group['clicks'].sum()
                    total_leads = group['leads'].sum()
                    total_new_customers = group['new_customers'].sum()
                    total_revenue = group['revenue'].sum()
                    total_churned = group['churned_customers'].sum()
                    avg_active_customers = group['active_customers_start_of_day'].mean()
                    
                    # Calcular KPIs
                    cac = total_spend / total_new_customers if total_new_customers > 0 else None
                    arpu = total_revenue / avg_active_customers if avg_active_customers > 0 else None
                    conv_clicks_leads = total_leads / total_clicks if total_clicks > 0 else None
                    conv_leads_customers = total_new_customers / total_leads if total_leads > 0 else None
                    churn_rate = total_churned / avg_active_customers if avg_active_customers > 0 else None
                    ltv = arpu / churn_rate if arpu and churn_rate and churn_rate > 0 else None
                    ltv_cac_ratio = ltv / cac if ltv and cac and cac > 0 else None
                    
                    monthly_kpis.append({
                        'channel': channel,
                        'period_start': period_start,
                        'period_end': period_end,
                        'period_type': 'monthly',
                        'total_spend': total_spend,
                        'total_impressions': total_impressions,
                        'total_clicks': total_clicks,
                        'total_leads': total_leads,
                        'total_new_customers': total_new_customers,
                        'total_revenue': total_revenue,
                        'total_churned_customers': total_churned,
                        'avg_active_customers': int(avg_active_customers),
                        'cac': round(cac, 2) if cac else None,
                        'arpu': round(arpu, 2) if arpu else None,
                        'conversion_rate_clicks_to_leads': round(conv_clicks_leads, 4) if conv_clicks_leads else None,
                        'conversion_rate_leads_to_customers': round(conv_leads_customers, 4) if conv_leads_customers else None,
                        'churn_rate': round(churn_rate, 4) if churn_rate else None,
                        'ltv': round(ltv, 2) if ltv else None,
                        'ltv_cac_ratio': round(ltv_cac_ratio, 2) if ltv_cac_ratio else None
                    })
            
            if monthly_kpis:
                kpis_df = pd.DataFrame(monthly_kpis)
                print(f"   📦 KPIs mensuales calculados: {len(kpis_df):,}")
                self.upload_data(kpis_df, 'digital_performance_kpis')
            else:
                print("❌ No se pudieron calcular KPIs")
                
        except Exception as e:
            print(f"❌ Error calculando KPIs: {str(e)}")
            import traceback
            traceback.print_exc()
    
    def verify_upload(self):
        """Verifica que los datos se hayan subido correctamente"""
        print("\n" + "="*80)
        print("🔍 VERIFICANDO CARGA DE DATOS")
        print("="*80)
        
        tables = [
            'retail_transactions',
            'retail_monthly_kpis',
            'airlines_flights',
            'airlines_route_kpis',
            'telco_customers',
            'telco_segment_kpis',
            'fraud_transactions',
            'fraud_daily_kpis',
            'fraud_merchant_kpis',
            'fraud_country_kpis',
            'fraud_hourly_patterns',
            'digital_performance_data',
            'digital_performance_kpis'
        ]
        
        for table in tables:
            try:
                response = self.supabase.table(table).select("*", count='exact').limit(1).execute()
                count = response.count if hasattr(response, 'count') else 'N/A'
                print(f"   ✅ {table}: {count} registros")
            except Exception as e:
                print(f"   ❌ {table}: Error - {str(e)}")
    
    def run_full_upload(self, include_fraud=False):
        """Ejecuta la carga completa de todos los datasets"""
        print("\n" + "="*80)
        print("🚀 INICIANDO CARGA COMPLETA A SUPABASE")
        print("="*80)
        print(f"URL: {self.url}")
        print("="*80)
        
        self.upload_retail_data()
        self.upload_airlines_data()
        self.upload_telco_data()
        
        if include_fraud:
            self.upload_fraud_data()
        
        self.verify_upload()
        
        print("\n" + "="*80)
        print("✅ CARGA COMPLETA FINALIZADA")
        print("="*80)

def main():
    """Función principal"""
    print("""
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                  SUPABASE UPLOADER - Data-Driven Portfolio               ║
    ║                                                                          ║
    ║  DATASETS DISPONIBLES:                                                   ║
    ║  • Retail Sales (1,000 transacciones)                                   ║
    ║  • Airlines Flights (300K vuelos)                                        ║
    ║  • Telco Churn (7K clientes)                                            ║
    ║  • Fraud Detection (1.7M transacciones compactadas) [OPCIONAL]          ║
    ║                                                                          ║
    ║  ANTES DE EJECUTAR:                                                      ║
    ║  1. Crear proyecto en Supabase (https://supabase.com)                   ║
    ║  2. Ejecutar schemas SQL en SQL Editor:                                  ║
    ║     - supabase_schemas.sql (Retail, Airlines, Telco)                    ║
    ║     - fraud_schemas.sql (Solo si incluyes Fraud)                        ║
    ║  3. Copiar .env.example a .env y configurar credenciales               ║
    ║  4. Ejecutar scripts de procesamiento:                                   ║
    ║     - process_retail.py                                                  ║
    ║     - process_airlines.py                                                ║
    ║     - process_telco.py                                                   ║
    ║     - compact_fraud_data.py (opcional, para Fraud)                      ║
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    """)
    
    # Preguntar si incluir datos de fraude
    include_fraud = False
    try:
        response = input("¿Incluir datos de FRAUDE? (y/n) [n]: ").strip().lower()
        include_fraud = response == 'y'
        
        if include_fraud:
            print("\n⚠️  ADVERTENCIA: Datos de fraude ocupan ~150 MB")
            print("   Asegúrate de haber ejecutado: python compact_fraud_data.py")
    except KeyboardInterrupt:
        print("\n\n❌ Carga cancelada por el usuario")
        return
    
    print("\nPresiona ENTER para continuar o Ctrl+C para cancelar")
    try:
        input()
    except KeyboardInterrupt:
        print("\n\n❌ Carga cancelada por el usuario")
        return
    
    try:
        uploader = SupabaseUploader()
        uploader.run_full_upload(include_fraud=include_fraud)
    except ValueError as e:
        print(f"\n{e}")
        print("\n💡 SOLUCIÓN:")
        print("   1. Copia .env.example a .env: cp .env.example .env")
        print("   2. Edita .env y agrega tus credenciales de Supabase")
        print("   3. Ejecuta este script nuevamente")
    except Exception as e:
        print(f"\n❌ Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
