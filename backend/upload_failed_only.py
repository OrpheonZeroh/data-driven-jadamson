#!/usr/bin/env python3
"""
Script para cargar SOLO las tablas que fallaron
- telco_customers (0 registros)
- fraud_transactions (0 registros)
"""

import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class FailedTablesUploader:
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
        
        # Mapeo de columnas para telco
        if table_name == 'telco_customers':
            column_mappings = {
                'customerID': 'customer_id',
                'gender': 'gender',
                'SeniorCitizen': 'senior_citizen',
                'Partner': 'partner',
                'Dependents': 'dependents',
                'tenure': 'tenure',
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
            }
            df = df.rename(columns=column_mappings)
        
        # Convertir booleanos para fraud
        if table_name == 'fraud_transactions':
            bool_columns = ['card_present', 'distance_from_home', 'high_risk_merchant', 'is_fraud', 'is_weekend']
            for col in bool_columns:
                if col in df.columns:
                    df[col] = df[col].replace({
                        'true': 1, 'false': 0, 'True': 1, 'False': 0,
                        True: 1, False: 0, '1': 1, '0': 0
                    })
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        
        total_rows = len(df)
        errors = []
        
        # Convertir DataFrame a lista de diccionarios
        records = df.to_dict('records')
        
        # Limpiar valores NaN
        for record in records:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
        
        # Subir en lotes
        for i in range(0, total_rows, batch_size):
            batch = records[i:i + batch_size]
            batch_num = i // batch_size + 1
            
            try:
                response = self.supabase.table(table_name).upsert(batch).execute()
                print(f"   ✅ Lote {batch_num}: {len(batch)} registros subidos ({min(i + batch_size, total_rows):,}/{total_rows:,})")
            except Exception as e:
                error_msg = str(e)
                print(f"   ❌ Error en lote {batch_num}: {error_msg}")
                errors.append(f"Error en lote {batch_num}: {error_msg}")
        
        if errors:
            print(f"\n⚠️  Se encontraron {len(errors)} errores durante la carga")
            for error in errors[:5]:
                print(f"   - {error}")
            return False
        else:
            print(f"   ✅ Todos los registros subidos exitosamente")
            return True
    
    def upload_failed_tables(self):
        """Sube solo las tablas que fallaron"""
        print("\n" + "="*80)
        print("🔄 CARGANDO TABLAS QUE FALLARON")
        print("="*80)
        
        # TELCO CUSTOMERS
        print("\n📞 TELCO CUSTOMERS")
        try:
            df_customers = pd.read_csv('processed_telco_customers.csv')
            print(f"   📦 Registros a cargar: {len(df_customers):,}")
            self.upload_data(df_customers, 'telco_customers')
        except FileNotFoundError:
            print("❌ Archivo processed_telco_customers.csv no encontrado")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # FRAUD TRANSACTIONS
        print("\n🔒 FRAUD TRANSACTIONS")
        try:
            df_fraud = pd.read_csv('processed_fraud_transactions.csv')
            print(f"   📦 Registros a cargar: {len(df_fraud):,}")
            self.upload_data(df_fraud, 'fraud_transactions', batch_size=10000)
        except FileNotFoundError:
            print("❌ Archivo processed_fraud_transactions.csv no encontrado")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def verify_upload(self):
        """Verifica que los datos se hayan subido correctamente"""
        print("\n" + "="*80)
        print("🔍 VERIFICANDO CARGA")
        print("="*80)
        
        tables = ['telco_customers', 'fraud_transactions']
        
        for table in tables:
            try:
                result = self.supabase.table(table).select("*", count="exact").limit(1).execute()
                count = result.count
                print(f"   ✅ {table}: {count:,} registros")
            except Exception as e:
                print(f"   ❌ {table}: Error al verificar - {e}")

def main():
    print("""
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║               CARGA DE TABLAS FALLIDAS - Telco + Fraud                   ║
    ║                                                                          ║
    ║  Este script cargará SOLO:                                               ║
    ║  • telco_customers (7,043 registros)                                    ║
    ║  • fraud_transactions (1,694,245 registros)                             ║
    ║                                                                          ║
    ║  Tiempo estimado: ~10-15 minutos                                         ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    """)
    
    input("Presiona ENTER para continuar o Ctrl+C para cancelar\n")
    
    try:
        uploader = FailedTablesUploader()
        uploader.upload_failed_tables()
        uploader.verify_upload()
        
        print("\n" + "="*80)
        print("✅ CARGA DE TABLAS FALLIDAS COMPLETADA")
        print("="*80)
        
    except KeyboardInterrupt:
        print("\n❌ Carga cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
