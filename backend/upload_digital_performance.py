#!/usr/bin/env python3
"""
Script específico para subir datos de Digital Performance a Supabase
Incluye cálculo automático de KPIs de marketing digital
"""
import pandas as pd
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class DigitalPerformanceUploader:
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("❌ ERROR: SUPABASE_URL y SUPABASE_KEY deben estar configurados en .env")
        
        self.supabase: Client = create_client(self.url, self.key)
        print("✅ Conectado a Supabase")
    
    def upload_digital_data(self, csv_file_path: str):
        """Sube datos de performance digital desde CSV"""
        print("\n" + "="*80)
        print("📊 SUBIENDO DATOS DE DIGITAL PERFORMANCE")
        print("="*80)
        
        try:
            # Leer CSV
            df = pd.read_csv(csv_file_path)
            print(f"   📦 Archivo: {csv_file_path}")
            print(f"   📦 Registros encontrados: {len(df):,}")
            print(f"   📦 Columnas: {list(df.columns)}")
            
            # Verificar columnas requeridas
            required_columns = [
                'Date', 'Channel', 'Spend', 'Impressions', 'Clicks', 
                'Leads', 'New_Customers', 'Revenue', 'Churned_Customers', 
                'Active_Customers_Start_of_Day'
            ]
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                print(f"❌ Columnas faltantes: {missing_columns}")
                return False
            
            # Mapear nombres de columnas
            column_mapping = {
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
            
            df = df.rename(columns=column_mapping)
            
            # Convertir tipos de datos
            df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
            
            # Convertir a lista de diccionarios y limpiar NaN
            records = df.to_dict('records')
            for record in records:
                for key, value in record.items():
                    if pd.isna(value):
                        record[key] = None
            
            # Subir en lotes
            batch_size = 5000
            total_uploaded = 0
            errors = []
            
            print(f"   🚀 Iniciando carga en lotes de {batch_size:,} registros...")
            
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                try:
                    response = self.supabase.table('digital_performance_data').upsert(batch).execute()
                    total_uploaded += len(batch)
                    print(f"   ✅ Lote {i//batch_size + 1}: {len(batch)} registros subidos ({total_uploaded:,}/{len(records):,})")
                except Exception as e:
                    error_msg = f"Error en lote {i//batch_size + 1}: {str(e)}"
                    errors.append(error_msg)
                    print(f"   ❌ {error_msg}")
            
            if errors:
                print(f"\n⚠️  Se encontraron {len(errors)} errores durante la carga")
                for error in errors[:3]:
                    print(f"   - {error}")
                return False
            else:
                print(f"   ✅ Todos los registros subidos exitosamente: {total_uploaded:,}")
                return True
                
        except FileNotFoundError:
            print(f"❌ Archivo no encontrado: {csv_file_path}")
            return False
        except Exception as e:
            print(f"❌ Error inesperado: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def calculate_and_upload_kpis(self):
        """Calcula y sube KPIs agregados de Digital Performance"""
        print("\n" + "="*80)
        print("📈 CALCULANDO Y SUBIENDO KPIs DE DIGITAL PERFORMANCE")
        print("="*80)
        
        try:
            # Leer datos desde Supabase
            print("   📥 Descargando datos desde Supabase...")
            response = self.supabase.table('digital_performance_data').select('*').execute()
            
            if not response.data:
                print("❌ No hay datos en digital_performance_data para calcular KPIs")
                return False
            
            df = pd.DataFrame(response.data)
            df['date'] = pd.to_datetime(df['date'])
            print(f"   📦 Registros procesados: {len(df):,}")
            
            # Calcular KPIs mensuales por canal
            monthly_kpis = []
            
            print("   🧮 Calculando KPIs por canal y mes...")
            
            for channel in df['channel'].unique():
                channel_data = df[df['channel'] == channel].copy()
                
                # Agrupar por mes
                channel_data['year_month'] = channel_data['date'].dt.to_period('M')
                
                for period, group in channel_data.groupby('year_month'):
                    period_start = period.start_time.strftime('%Y-%m-%d')
                    period_end = period.end_time.strftime('%Y-%m-%d')
                    
                    # Calcular métricas agregadas
                    total_spend = float(group['spend'].sum())
                    total_impressions = int(group['impressions'].sum())
                    total_clicks = int(group['clicks'].sum())
                    total_leads = int(group['leads'].sum())
                    total_new_customers = int(group['new_customers'].sum())
                    total_revenue = float(group['revenue'].sum())
                    total_churned = int(group['churned_customers'].sum())
                    avg_active_customers = float(group['active_customers_start_of_day'].mean())
                    
                    # Calcular KPIs según las fórmulas que mencionaste
                    cac = total_spend / total_new_customers if total_new_customers > 0 else None
                    arpu = total_revenue / avg_active_customers if avg_active_customers > 0 else None
                    conv_clicks_leads = total_leads / total_clicks if total_clicks > 0 else None
                    conv_leads_customers = total_new_customers / total_leads if total_leads > 0 else None
                    churn_rate = total_churned / avg_active_customers if avg_active_customers > 0 else None
                    
                    # LTV = ARPU / Churn Rate (como mencionaste)
                    ltv = arpu / churn_rate if arpu and churn_rate and churn_rate > 0 else None
                    
                    # LTV/CAC Ratio (KPI de salud del negocio)
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
                print(f"   📊 KPIs calculados: {len(monthly_kpis)} registros")
                
                # Mostrar algunos KPIs de ejemplo
                print("\n   📈 Ejemplo de KPIs calculados:")
                for kpi in monthly_kpis[:3]:
                    print(f"      {kpi['channel']} ({kpi['period_start']}): CAC=${kpi['cac']}, ARPU=${kpi['arpu']}, LTV/CAC={kpi['ltv_cac_ratio']}")
                
                # Subir KPIs
                try:
                    response = self.supabase.table('digital_performance_kpis').upsert(monthly_kpis).execute()
                    print(f"   ✅ KPIs subidos exitosamente")
                    return True
                except Exception as e:
                    print(f"   ❌ Error subiendo KPIs: {str(e)}")
                    return False
            else:
                print("❌ No se pudieron calcular KPIs")
                return False
                
        except Exception as e:
            print(f"❌ Error calculando KPIs: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def verify_upload(self):
        """Verifica que los datos se hayan subido correctamente"""
        print("\n" + "="*80)
        print("🔍 VERIFICANDO CARGA DE DATOS")
        print("="*80)
        
        tables = ['digital_performance_data', 'digital_performance_kpis']
        
        for table in tables:
            try:
                response = self.supabase.table(table).select("*", count='exact').limit(1).execute()
                count = response.count if hasattr(response, 'count') else 'N/A'
                print(f"   ✅ {table}: {count} registros")
            except Exception as e:
                print(f"   ❌ {table}: Error - {str(e)}")
        
        # Mostrar resumen por canal
        try:
            print("\n   📊 Resumen por canal:")
            response = self.supabase.table('v_digital_performance_summary').select('*').execute()
            if response.data:
                for row in response.data:
                    print(f"      {row['channel']}: CAC=${row['cac']}, ARPU=${row['arpu']}, Conv.Rate={row['conversion_rate_clicks_to_leads']}%")
        except Exception as e:
            print(f"   ⚠️  No se pudo obtener resumen: {str(e)}")

def main():
    """Función principal"""
    print("""
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║              DIGITAL PERFORMANCE DATA UPLOADER - Supabase                ║
    ║                                                                          ║
    ║  ESTE SCRIPT SUBE TUS DATOS DE MARKETING DIGITAL Y CALCULA:             ║
    ║  • CAC (Customer Acquisition Cost)                                      ║
    ║  • ARPU (Average Revenue Per User)                                      ║
    ║  • LTV (Lifetime Value)                                                 ║
    ║  • LTV/CAC Ratio (Salud del negocio)                                   ║
    ║  • Conversion Rates (Clicks→Leads→Customers)                           ║
    ║                                                                          ║
    ║  ANTES DE EJECUTAR:                                                      ║
    ║  1. Ejecutar el schema SQL en Supabase SQL Editor                       ║
    ║  2. Configurar .env con credenciales de Supabase                        ║
    ║  3. Tener el archivo digital_performance_data.csv listo                 ║
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar archivo CSV
    csv_file = 'digital_performance_data.csv'
    if not os.path.exists(csv_file):
        print(f"❌ Archivo no encontrado: {csv_file}")
        print("   Verifica que el archivo esté en el directorio actual")
        return
    
    print(f"✅ Archivo encontrado: {csv_file}")
    print("\nPresiona ENTER para continuar o Ctrl+C para cancelar")
    
    try:
        input()
    except KeyboardInterrupt:
        print("\n\n❌ Carga cancelada por el usuario")
        return
    
    try:
        uploader = DigitalPerformanceUploader()
        
        # 1. Subir datos principales
        success = uploader.upload_digital_data(csv_file)
        if not success:
            print("\n❌ Error en la carga de datos. Abortando.")
            return
        
        # 2. Calcular y subir KPIs
        success = uploader.calculate_and_upload_kpis()
        if not success:
            print("\n⚠️  Error calculando KPIs, pero los datos principales se subieron correctamente")
        
        # 3. Verificar carga
        uploader.verify_upload()
        
        print("\n" + "="*80)
        print("✅ PROCESO COMPLETADO")
        print("="*80)
        print("🎉 Tus datos de Digital Performance están listos en Supabase!")
        print("💡 Ahora puedes usar estos datos en tu dashboard para mostrar:")
        print("   • Análisis de CAC por canal")
        print("   • Evolución del ARPU")
        print("   • Salud del negocio (LTV/CAC > 3)")
        print("   • Optimización de conversión por canal")
        
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
