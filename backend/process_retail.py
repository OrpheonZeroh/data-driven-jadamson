"""
Procesamiento y análisis del dataset de Retail Sales
Calcula KPIs principales: Revenue, Gross Margin, AOV, Pareto
"""
import pandas as pd
import numpy as np
from datetime import datetime

class RetailProcessor:
    def __init__(self, csv_path='retail_sales_dataset.csv'):
        self.csv_path = csv_path
        self.df = None
        self.kpis = {}
        
    def load_data(self):
        """Carga y limpia el dataset"""
        print("📥 Cargando datos de Retail Sales...")
        self.df = pd.read_csv(self.csv_path)
        
        # Convertir fecha
        self.df['Date'] = pd.to_datetime(self.df['Date'])
        
        # Crear columnas adicionales
        self.df['Year'] = self.df['Date'].dt.year
        self.df['Month'] = self.df['Date'].dt.month
        self.df['Quarter'] = self.df['Date'].dt.quarter
        self.df['YearMonth'] = self.df['Date'].dt.to_period('M').astype(str)
        
        # Calcular COGS estimado (asumiendo 60% del precio como costo)
        self.df['COGS_per_Unit'] = self.df['Price per Unit'] * 0.60
        self.df['Total_COGS'] = self.df['COGS_per_Unit'] * self.df['Quantity']
        self.df['Gross_Profit'] = self.df['Total Amount'] - self.df['Total_COGS']
        self.df['Gross_Margin_Pct'] = (self.df['Gross_Profit'] / self.df['Total Amount']) * 100
        
        print(f"✅ Datos cargados: {len(self.df):,} transacciones")
        return self
    
    def calculate_kpis(self):
        """Calcula KPIs principales"""
        print("\n📊 Calculando KPIs de Retail...")
        
        # KPIs globales
        total_revenue = self.df['Total Amount'].sum()
        total_profit = self.df['Gross_Profit'].sum()
        gross_margin_pct = (total_profit / total_revenue) * 100
        total_transactions = len(self.df)
        aov = total_revenue / total_transactions
        
        self.kpis = {
            'total_revenue': total_revenue,
            'total_profit': total_profit,
            'gross_margin_pct': gross_margin_pct,
            'total_transactions': total_transactions,
            'aov': aov,
            'unique_customers': self.df['Customer ID'].nunique(),
            'unique_products': self.df['Product Category'].nunique()
        }
        
        print(f"   💰 Revenue Total: ${total_revenue:,.2f}")
        print(f"   📈 Gross Margin: {gross_margin_pct:.2f}%")
        print(f"   🛒 AOV (Average Order Value): ${aov:.2f}")
        print(f"   👥 Clientes Únicos: {self.kpis['unique_customers']:,}")
        
        return self.kpis
    
    def category_analysis(self):
        """Análisis por categoría de producto"""
        print("\n📦 Análisis por Categoría:")
        
        category_metrics = self.df.groupby('Product Category').agg({
            'Total Amount': ['sum', 'mean', 'count'],
            'Gross_Profit': 'sum',
            'Quantity': 'sum'
        }).round(2)
        
        category_metrics.columns = ['Revenue', 'Avg_Transaction', 'Transactions', 'Gross_Profit', 'Units_Sold']
        category_metrics['Revenue_Pct'] = (category_metrics['Revenue'] / category_metrics['Revenue'].sum() * 100).round(2)
        category_metrics['Margin_Pct'] = (category_metrics['Gross_Profit'] / category_metrics['Revenue'] * 100).round(2)
        
        # Ordenar por revenue
        category_metrics = category_metrics.sort_values('Revenue', ascending=False)
        
        print(category_metrics)
        return category_metrics
    
    def time_series_analysis(self):
        """Análisis temporal"""
        print("\n📅 Análisis Temporal (Top 5 meses):")
        
        monthly = self.df.groupby('YearMonth').agg({
            'Total Amount': 'sum',
            'Gross_Profit': 'sum',
            'Transaction ID': 'count'
        }).round(2)
        
        monthly.columns = ['Revenue', 'Profit', 'Transactions']
        monthly['Margin_Pct'] = (monthly['Profit'] / monthly['Revenue'] * 100).round(2)
        monthly = monthly.sort_values('Revenue', ascending=False)
        
        print(monthly.head())
        return monthly
    
    def pareto_analysis(self):
        """Análisis de Pareto 80/20"""
        print("\n📊 Análisis Pareto (80/20):")
        
        # Por categoría
        category_revenue = self.df.groupby('Product Category')['Total Amount'].sum().sort_values(ascending=False)
        category_revenue_pct = (category_revenue / category_revenue.sum() * 100).round(2)
        category_cumsum = category_revenue_pct.cumsum()
        
        print("\nContribución acumulada por categoría:")
        for cat, pct, cumsum in zip(category_revenue.index, category_revenue_pct, category_cumsum):
            print(f"   {cat}: {pct:.2f}% (Acumulado: {cumsum:.2f}%)")
        
        return category_revenue
    
    def demographic_analysis(self):
        """Análisis demográfico"""
        print("\n👥 Análisis Demográfico:")
        
        # Por género
        gender_metrics = self.df.groupby('Gender').agg({
            'Total Amount': ['sum', 'mean'],
            'Transaction ID': 'count'
        }).round(2)
        print("\nPor Género:")
        print(gender_metrics)
        
        # Por edad (crear buckets)
        self.df['Age_Group'] = pd.cut(self.df['Age'], 
                                       bins=[0, 25, 35, 45, 55, 100],
                                       labels=['18-25', '26-35', '36-45', '46-55', '56+'])
        
        age_metrics = self.df.groupby('Age_Group').agg({
            'Total Amount': ['sum', 'mean'],
            'Transaction ID': 'count'
        }).round(2)
        print("\nPor Grupo de Edad:")
        print(age_metrics)
        
        return gender_metrics, age_metrics
    
    def export_for_supabase(self):
        """Prepara datos para Supabase"""
        print("\n💾 Preparando datos para Supabase...")
        
        # Tabla principal de transacciones
        transactions_table = self.df[[
            'Transaction ID', 'Date', 'Customer ID', 'Gender', 'Age', 
            'Product Category', 'Quantity', 'Price per Unit', 'Total Amount',
            'Total_COGS', 'Gross_Profit', 'Gross_Margin_Pct',
            'Year', 'Month', 'Quarter', 'YearMonth'
        ]].copy()
        
        transactions_table.to_csv('processed_retail_transactions.csv', index=False)
        print(f"   ✅ Transacciones exportadas: processed_retail_transactions.csv")
        
        # Tabla de KPIs agregados por mes
        monthly_kpis = self.df.groupby(['YearMonth', 'Product Category']).agg({
            'Total Amount': 'sum',
            'Gross_Profit': 'sum',
            'Transaction ID': 'count',
            'Quantity': 'sum'
        }).reset_index()
        
        monthly_kpis.columns = ['period', 'category', 'revenue', 'profit', 'transactions', 'units_sold']
        monthly_kpis['margin_pct'] = (monthly_kpis['profit'] / monthly_kpis['revenue'] * 100).round(2)
        
        monthly_kpis.to_csv('processed_retail_monthly_kpis.csv', index=False)
        print(f"   ✅ KPIs mensuales exportados: processed_retail_monthly_kpis.csv")
        
        return transactions_table, monthly_kpis
    
    def run_full_analysis(self):
        """Ejecuta el análisis completo"""
        self.load_data()
        self.calculate_kpis()
        self.category_analysis()
        self.time_series_analysis()
        self.pareto_analysis()
        self.demographic_analysis()
        self.export_for_supabase()
        
        print("\n" + "="*80)
        print("✅ ANÁLISIS RETAIL COMPLETADO")
        print("="*80)

if __name__ == "__main__":
    processor = RetailProcessor()
    processor.run_full_analysis()
