import pandas as pd
import numpy as np
from pathlib import Path

# Configuración de visualización
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)

def analyze_dataset(file_path, dataset_name):
    """Analiza un dataset CSV y muestra información básica"""
    print(f"\n{'='*80}")
    print(f"ANÁLISIS DE: {dataset_name}")
    print(f"{'='*80}\n")
    
    try:
        # Leer CSV
        df = pd.read_csv(file_path)
        
        # Información básica
        print(f"📊 DIMENSIONES:")
        print(f"   - Filas: {df.shape[0]:,}")
        print(f"   - Columnas: {df.shape[1]}")
        
        # Columnas
        print(f"\n📋 COLUMNAS ({df.shape[1]}):")
        for i, col in enumerate(df.columns, 1):
            dtype = df[col].dtype
            nulls = df[col].isnull().sum()
            null_pct = (nulls / len(df)) * 100
            print(f"   {i}. {col} ({dtype}) - Nulos: {nulls} ({null_pct:.1f}%)")
        
        # Primeras filas
        print(f"\n🔍 PRIMERAS 5 FILAS:")
        print(df.head())
        
        # Estadísticas descriptivas
        print(f"\n📈 ESTADÍSTICAS DESCRIPTIVAS:")
        print(df.describe())
        
        # Valores únicos en columnas categóricas
        print(f"\n🏷️  VALORES ÚNICOS (columnas categóricas):")
        for col in df.select_dtypes(include=['object']).columns:
            unique_count = df[col].nunique()
            if unique_count <= 20:
                print(f"   - {col}: {unique_count} valores únicos")
                print(f"     {df[col].value_counts().to_dict()}")
            else:
                print(f"   - {col}: {unique_count} valores únicos (mostrando top 5)")
                print(f"     {df[col].value_counts().head().to_dict()}")
        
        # Problemas de calidad de datos
        print(f"\n⚠️  CALIDAD DE DATOS:")
        total_nulls = df.isnull().sum().sum()
        duplicates = df.duplicated().sum()
        print(f"   - Total de valores nulos: {total_nulls:,}")
        print(f"   - Filas duplicadas: {duplicates:,}")
        
        return df
        
    except Exception as e:
        print(f"❌ Error al leer {file_path}: {str(e)}")
        return None

if __name__ == "__main__":
    # Analizar los 3 datasets
    datasets = {
        "RETAIL SALES": "retail_sales_dataset.csv",
        "AIRLINES FLIGHTS": "airlines_flights_data.csv",
        "TELCO CUSTOMER CHURN": "WA_Fn-UseC_-Telco-Customer-Churn.csv"
    }
    
    data_frames = {}
    
    for name, file in datasets.items():
        file_path = Path(file)
        if file_path.exists():
            df = analyze_dataset(file_path, name)
            if df is not None:
                data_frames[name] = df
        else:
            print(f"\n❌ Archivo no encontrado: {file}")
    
    print(f"\n{'='*80}")
    print("✅ ANÁLISIS COMPLETADO")
    print(f"{'='*80}")
