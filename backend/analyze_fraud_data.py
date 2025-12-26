"""
Análisis del dataset de fraude para diseñar modelos de datos
"""
import pandas as pd
import json
import ast

print("📥 Cargando datos de fraude...")
df = pd.read_csv('synthetic_fraud_data.csv')

print(f"\n{'='*80}")
print(f"ANÁLISIS DE SYNTHETIC FRAUD DATA")
print(f"{'='*80}\n")

print(f"📊 DIMENSIONES:")
print(f"   - Filas: {len(df):,}")
print(f"   - Columnas: {df.shape[1]}")

print(f"\n📋 COLUMNAS ({df.shape[1]}):")
for i, col in enumerate(df.columns, 1):
    dtype = df[col].dtype
    nulls = df[col].isnull().sum()
    unique = df[col].nunique()
    print(f"   {i:2d}. {col:25s} ({str(dtype):10s}) - Nulos: {nulls:6d} | Únicos: {unique:,}")

print(f"\n🎯 VARIABLE OBJETIVO (is_fraud):")
fraud_counts = df['is_fraud'].value_counts()
fraud_rate = (fraud_counts.get(True, 0) / len(df)) * 100
print(f"   - Transacciones legítimas: {fraud_counts.get(False, 0):,} ({100-fraud_rate:.2f}%)")
print(f"   - Transacciones fraudulentas: {fraud_counts.get(True, 0):,} ({fraud_rate:.2f}%)")
print(f"   - Ratio de desbalance: 1:{int((100-fraud_rate)/fraud_rate)}")

print(f"\n💰 ANÁLISIS DE MONTOS:")
print(df[['amount']].describe())
print(f"\n   Por fraude:")
print(df.groupby('is_fraud')['amount'].agg(['count', 'mean', 'median', 'std', 'min', 'max']))

print(f"\n🌍 DISTRIBUCIÓN GEOGRÁFICA:")
print(f"\n   Top 10 países:")
print(df['country'].value_counts().head(10))

print(f"\n💳 TIPOS DE TARJETA:")
print(df['card_type'].value_counts())

print(f"\n📱 CANALES DE TRANSACCIÓN:")
print(df['channel'].value_counts())

print(f"\n🏪 CATEGORÍAS DE COMERCIO (Top 10):")
print(df['merchant_category'].value_counts().head(10))

print(f"\n⚠️  HIGH RISK MERCHANTS:")
high_risk = df['high_risk_merchant'].value_counts()
print(f"   - High Risk: {high_risk.get(True, 0):,} ({high_risk.get(True, 0)/len(df)*100:.2f}%)")
print(f"   - Normal: {high_risk.get(False, 0):,} ({high_risk.get(False, 0)/len(df)*100:.2f}%)")

print(f"\n🕐 DISTRIBUCIÓN TEMPORAL:")
print(f"   Horas del día (Top 5):")
print(df['transaction_hour'].value_counts().head())

print(f"\n📊 CARD PRESENT vs NOT PRESENT:")
card_present = df['card_present'].value_counts()
print(f"   - Card Present: {card_present.get(True, 0):,} ({card_present.get(True, 0)/len(df)*100:.2f}%)")
print(f"   - Card Not Present: {card_present.get(False, 0):,} ({card_present.get(False, 0)/len(df)*100:.2f}%)")

print(f"\n📍 DISTANCE FROM HOME:")
print(df['distance_from_home'].value_counts().head(10))

print(f"\n📈 CORRELACIÓN CON FRAUDE:")
print("\nFraude por Card Present:")
print(pd.crosstab(df['card_present'], df['is_fraud'], normalize='index') * 100)

print("\nFraude por High Risk Merchant:")
print(pd.crosstab(df['high_risk_merchant'], df['is_fraud'], normalize='index') * 100)

print("\nFraude por Distance from Home:")
print(pd.crosstab(df['distance_from_home'], df['is_fraud'], normalize='index') * 100)

print(f"\n🔍 VELOCITY METRICS (ejemplo - primera transacción):")
try:
    # El campo velocity_last_hour es un string que parece JSON
    velocity_sample = df['velocity_last_hour'].iloc[0]
    print(f"   Tipo: {type(velocity_sample)}")
    print(f"   Contenido: {velocity_sample}")
    
    # Intentar parsearlo
    if isinstance(velocity_sample, str):
        velocity_dict = ast.literal_eval(velocity_sample)
        print(f"\n   Métricas de velocity incluyen:")
        for key, value in velocity_dict.items():
            print(f"      - {key}: {value}")
except Exception as e:
    print(f"   Error al parsear velocity: {e}")

print(f"\n{'='*80}")
print("✅ ANÁLISIS COMPLETADO")
print(f"{'='*80}")
