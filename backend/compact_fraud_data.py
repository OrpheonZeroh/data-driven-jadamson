"""
Compacta el dataset de fraude de 7.48M a ~300K registros
Mantiene TODA la información relevante para dashboards y ML
"""
import pandas as pd
import numpy as np
import ast
from datetime import datetime

class FraudDataCompactor:
    def __init__(self, csv_path='synthetic_fraud_data.csv'):
        self.csv_path = csv_path
        self.df = None
        
    def load_data(self, sample_size=None):
        """Carga datos con sampling opcional"""
        print("📥 Cargando datos de fraude...")
        
        if sample_size:
            # Para testing: cargar solo una muestra
            self.df = pd.read_csv(self.csv_path, nrows=sample_size)
        else:
            # Cargar todo el dataset
            self.df = pd.read_csv(self.csv_path)
        
        print(f"✅ Cargados: {len(self.df):,} registros")
        return self
    
    def parse_velocity_metrics(self):
        """Parsea el campo velocity_last_hour de JSON string a columnas"""
        print("\n📊 Parseando métricas de velocity...")
        
        def parse_velocity(velocity_str):
            try:
                return ast.literal_eval(velocity_str)
            except:
                return {}
        
        velocity_data = self.df['velocity_last_hour'].apply(parse_velocity)
        
        self.df['velocity_num_trans'] = velocity_data.apply(lambda x: x.get('num_transactions', 0))
        self.df['velocity_total_amount'] = velocity_data.apply(lambda x: x.get('total_amount', 0))
        self.df['velocity_unique_merchants'] = velocity_data.apply(lambda x: x.get('unique_merchants', 0))
        self.df['velocity_unique_countries'] = velocity_data.apply(lambda x: x.get('unique_countries', 0))
        self.df['velocity_max_amount'] = velocity_data.apply(lambda x: x.get('max_single_amount', 0))
        
        # Eliminar columna original
        self.df.drop('velocity_last_hour', axis=1, inplace=True)
        
        print(f"✅ Velocity metrics parseadas: 5 nuevas columnas")
        return self
    
    def create_compact_transactions(self):
        """
        Estrategia de Sampling Inteligente:
        1. TODAS las transacciones fraudulentas (1.49M)
        2. Muestra estratificada de legítimas (~200K)
        """
        print("\n🎯 Creando dataset compacto de transacciones...")
        
        # Separar fraudes y legítimas
        frauds = self.df[self.df['is_fraud'] == True].copy()
        legit = self.df[self.df['is_fraud'] == False].copy()
        
        print(f"   - Fraudulentas: {len(frauds):,} (100% conservadas)")
        print(f"   - Legítimas: {len(legit):,}")
        
        # Sampling estratificado de legítimas
        # Mantener representatividad por: país, merchant_category, channel, card_type
        sample_size = min(200000, len(legit))
        
        # Sampling estratificado
        legit_sample = legit.groupby(
            ['country', 'merchant_category', 'channel', 'card_type'],
            group_keys=False
        ).apply(lambda x: x.sample(
            n=max(1, int(len(x) * sample_size / len(legit))),
            random_state=42
        )).reset_index(drop=True)
        
        print(f"   - Muestra legítimas: {len(legit_sample):,} ({len(legit_sample)/len(legit)*100:.2f}%)")
        
        # Combinar
        compact_df = pd.concat([frauds, legit_sample], ignore_index=True)
        
        # Optimizar tipos de datos
        compact_df['timestamp'] = pd.to_datetime(compact_df['timestamp'], format='mixed', utc=True)
        compact_df['date'] = compact_df['timestamp'].dt.date
        compact_df['hour'] = compact_df['timestamp'].dt.hour
        compact_df['day_of_week'] = compact_df['timestamp'].dt.dayofweek
        compact_df['is_weekend'] = compact_df['day_of_week'].isin([5, 6])
        
        # Convertir booleanos a int (más eficiente en storage)
        bool_cols = ['card_present', 'high_risk_merchant', 'weekend_transaction', 'is_fraud']
        for col in bool_cols:
            compact_df[col] = compact_df[col].astype(int)
        
        # Redondear amounts para reducir precision innecesaria
        compact_df['amount'] = compact_df['amount'].round(2)
        compact_df['velocity_total_amount'] = compact_df['velocity_total_amount'].round(2)
        compact_df['velocity_max_amount'] = compact_df['velocity_max_amount'].round(2)
        
        # Seleccionar solo columnas necesarias
        columns_to_keep = [
            'transaction_id', 'customer_id', 'card_number', 'date', 'hour', 'day_of_week',
            'merchant_category', 'merchant_type', 'merchant', 'amount', 'currency',
            'country', 'city', 'card_type', 'card_present', 'device', 'channel',
            'device_fingerprint', 'distance_from_home', 'high_risk_merchant',
            'is_weekend', 'is_fraud',
            'velocity_num_trans', 'velocity_total_amount', 'velocity_unique_merchants',
            'velocity_unique_countries', 'velocity_max_amount'
        ]
        
        compact_df = compact_df[columns_to_keep]
        
        print(f"\n✅ Dataset compacto creado: {len(compact_df):,} registros")
        print(f"   Reducción: {(1 - len(compact_df)/len(self.df))*100:.1f}%")
        
        return compact_df
    
    def create_daily_aggregations(self):
        """Crea agregaciones diarias para dashboards"""
        print("\n📅 Creando agregaciones diarias...")
        
        self.df['date'] = pd.to_datetime(self.df['timestamp']).dt.date
        
        daily_agg = self.df.groupby('date').agg({
            'transaction_id': 'count',
            'amount': ['sum', 'mean', 'median'],
            'is_fraud': ['sum', 'mean'],
            'customer_id': 'nunique',
            'merchant': 'nunique',
            'country': 'nunique'
        }).reset_index()
        
        daily_agg.columns = [
            'date', 'total_transactions', 'total_amount', 'avg_amount', 'median_amount',
            'fraud_count', 'fraud_rate', 'unique_customers', 'unique_merchants', 'unique_countries'
        ]
        
        # Calcular métricas adicionales
        daily_agg['fraud_amount'] = self.df[self.df['is_fraud'] == True].groupby(
            pd.to_datetime(self.df['timestamp']).dt.date
        )['amount'].sum().values
        
        daily_agg['fraud_rate'] = (daily_agg['fraud_rate'] * 100).round(2)
        daily_agg['total_amount'] = daily_agg['total_amount'].round(2)
        daily_agg['avg_amount'] = daily_agg['avg_amount'].round(2)
        daily_agg['median_amount'] = daily_agg['median_amount'].round(2)
        daily_agg['fraud_amount'] = daily_agg['fraud_amount'].round(2)
        
        print(f"✅ Agregaciones diarias creadas: {len(daily_agg):,} días")
        
        return daily_agg
    
    def create_merchant_aggregations(self):
        """Crea agregaciones por comerciante"""
        print("\n🏪 Creando agregaciones por comerciante...")
        
        merchant_agg = self.df.groupby(['merchant', 'merchant_category', 'merchant_type']).agg({
            'transaction_id': 'count',
            'amount': ['sum', 'mean'],
            'is_fraud': ['sum', 'mean'],
            'customer_id': 'nunique'
        }).reset_index()
        
        merchant_agg.columns = [
            'merchant', 'merchant_category', 'merchant_type',
            'total_transactions', 'total_amount', 'avg_amount',
            'fraud_count', 'fraud_rate', 'unique_customers'
        ]
        
        merchant_agg['fraud_rate'] = (merchant_agg['fraud_rate'] * 100).round(2)
        merchant_agg['total_amount'] = merchant_agg['total_amount'].round(2)
        merchant_agg['avg_amount'] = merchant_agg['avg_amount'].round(2)
        
        # Calcular risk level
        def get_risk_level(fraud_rate):
            if fraud_rate >= 50:
                return 'critical'
            elif fraud_rate >= 30:
                return 'high'
            elif fraud_rate >= 15:
                return 'medium'
            else:
                return 'low'
        
        merchant_agg['risk_level'] = merchant_agg['fraud_rate'].apply(get_risk_level)
        
        print(f"✅ Agregaciones por comerciante: {len(merchant_agg):,} comerciantes")
        
        return merchant_agg
    
    def create_country_aggregations(self):
        """Crea agregaciones por país"""
        print("\n🌍 Creando agregaciones por país...")
        
        country_agg = self.df.groupby('country').agg({
            'transaction_id': 'count',
            'amount': ['sum', 'mean'],
            'is_fraud': ['sum', 'mean'],
            'customer_id': 'nunique',
            'merchant': 'nunique'
        }).reset_index()
        
        country_agg.columns = [
            'country', 'total_transactions', 'total_amount', 'avg_amount',
            'fraud_count', 'fraud_rate', 'unique_customers', 'unique_merchants'
        ]
        
        country_agg['fraud_rate'] = (country_agg['fraud_rate'] * 100).round(2)
        country_agg['total_amount'] = country_agg['total_amount'].round(2)
        country_agg['avg_amount'] = country_agg['avg_amount'].round(2)
        
        country_agg = country_agg.sort_values('total_transactions', ascending=False)
        
        print(f"✅ Agregaciones por país: {len(country_agg):,} países")
        
        return country_agg
    
    def create_hourly_patterns(self):
        """Crea patrones por hora del día"""
        print("\n🕐 Creando patrones horarios...")
        
        hourly_agg = self.df.groupby('transaction_hour').agg({
            'transaction_id': 'count',
            'amount': ['sum', 'mean'],
            'is_fraud': ['sum', 'mean']
        }).reset_index()
        
        hourly_agg.columns = [
            'hour', 'total_transactions', 'total_amount', 'avg_amount',
            'fraud_count', 'fraud_rate'
        ]
        
        hourly_agg['fraud_rate'] = (hourly_agg['fraud_rate'] * 100).round(2)
        hourly_agg['total_amount'] = hourly_agg['total_amount'].round(2)
        hourly_agg['avg_amount'] = hourly_agg['avg_amount'].round(2)
        
        print(f"✅ Patrones horarios creados: 24 horas")
        
        return hourly_agg
    
    def export_compact_data(self):
        """Exporta todos los datasets compactos"""
        print("\n💾 Exportando datos compactados...")
        
        # 1. Transacciones compactas
        compact_trans = self.create_compact_transactions()
        compact_trans.to_csv('processed_fraud_transactions.csv', index=False)
        size_mb = compact_trans.memory_usage(deep=True).sum() / 1024 / 1024
        print(f"   ✅ Transacciones: {len(compact_trans):,} registros (~{size_mb:.1f} MB)")
        
        # 2. Agregaciones diarias
        daily_agg = self.create_daily_aggregations()
        daily_agg.to_csv('processed_fraud_daily_kpis.csv', index=False)
        print(f"   ✅ KPIs diarios: {len(daily_agg):,} registros")
        
        # 3. Agregaciones por comerciante
        merchant_agg = self.create_merchant_aggregations()
        merchant_agg.to_csv('processed_fraud_merchant_kpis.csv', index=False)
        print(f"   ✅ KPIs comerciantes: {len(merchant_agg):,} registros")
        
        # 4. Agregaciones por país
        country_agg = self.create_country_aggregations()
        country_agg.to_csv('processed_fraud_country_kpis.csv', index=False)
        print(f"   ✅ KPIs países: {len(country_agg):,} registros")
        
        # 5. Patrones horarios
        hourly_agg = self.create_hourly_patterns()
        hourly_agg.to_csv('processed_fraud_hourly_patterns.csv', index=False)
        print(f"   ✅ Patrones horarios: {len(hourly_agg):,} registros")
        
        # Resumen
        total_records = len(compact_trans) + len(daily_agg) + len(merchant_agg) + len(country_agg) + len(hourly_agg)
        reduction = (1 - total_records / len(self.df)) * 100
        
        print(f"\n📊 RESUMEN DE COMPACTACIÓN:")
        print(f"   Original: {len(self.df):,} registros")
        print(f"   Compactado: {total_records:,} registros")
        print(f"   Reducción: {reduction:.1f}%")
        print(f"   Tamaño estimado: ~{size_mb:.1f} MB (de ~750 MB)")
        
        return {
            'transactions': compact_trans,
            'daily': daily_agg,
            'merchant': merchant_agg,
            'country': country_agg,
            'hourly': hourly_agg
        }
    
    def run_compaction(self, sample_for_testing=None):
        """Ejecuta el proceso completo de compactación"""
        print("\n" + "="*80)
        print("🗜️  INICIANDO COMPACTACIÓN DE DATOS DE FRAUDE")
        print("="*80)
        
        self.load_data(sample_size=sample_for_testing)
        self.parse_velocity_metrics()
        results = self.export_compact_data()
        
        print("\n" + "="*80)
        print("✅ COMPACTACIÓN COMPLETADA")
        print("="*80)
        
        return results

if __name__ == "__main__":
    import sys
    
    # Opción: ejecutar con muestra pequeña para testing
    # python compact_fraud_data.py test
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        print("⚠️  MODO TEST: Procesando solo 100,000 registros\n")
        compactor = FraudDataCompactor()
        compactor.run_compaction(sample_for_testing=100000)
    else:
        print("⚠️  MODO COMPLETO: Procesando 7.48M registros")
        print("   Esto puede tomar 5-10 minutos...\n")
        
        response = input("¿Continuar? (y/n): ")
        if response.lower() == 'y':
            compactor = FraudDataCompactor()
            compactor.run_compaction()
        else:
            print("Cancelado por el usuario")
