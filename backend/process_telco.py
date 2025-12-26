"""
Procesamiento y análisis del dataset de Telco Customer Churn
Calcula KPIs principales: Churn Rate, ARPU, Revenue at Risk, CLV
"""
import pandas as pd
import numpy as np

class TelcoProcessor:
    def __init__(self, csv_path='WA_Fn-UseC_-Telco-Customer-Churn.csv'):
        self.csv_path = csv_path
        self.df = None
        self.kpis = {}
        
    def load_data(self):
        """Carga y limpia el dataset"""
        print("📥 Cargando datos de Telco Customer Churn...")
        self.df = pd.read_csv(self.csv_path)
        
        # Limpiar TotalCharges (tiene espacios en blanco)
        self.df['TotalCharges'] = pd.to_numeric(self.df['TotalCharges'], errors='coerce')
        
        # Rellenar nulos en TotalCharges (probablemente clientes nuevos)
        self.df['TotalCharges'].fillna(self.df['MonthlyCharges'], inplace=True)
        
        # Convertir Churn a binario
        self.df['Churn_Binary'] = (self.df['Churn'] == 'Yes').astype(int)
        self.df['SeniorCitizen'] = self.df['SeniorCitizen'].astype(int)
        
        # Crear segmentos de tenure
        self.df['Tenure_Segment'] = pd.cut(self.df['tenure'],
                                            bins=[-1, 12, 24, 48, 72],
                                            labels=['0-12 months', '13-24 months', '25-48 months', '48+ months'])
        
        # Crear segmentos de ARPU (Monthly Charges)
        self.df['ARPU_Segment'] = pd.cut(self.df['MonthlyCharges'],
                                          bins=[0, 35, 70, 90, 120],
                                          labels=['Low (<$35)', 'Medium ($35-70)', 'High ($70-90)', 'Premium ($90+)'])
        
        # Calcular Customer Lifetime Value estimado
        self.df['Estimated_CLV'] = self.df['MonthlyCharges'] * self.df['tenure']
        
        # Identificar servicios adicionales
        service_cols = ['PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup', 
                       'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']
        
        self.df['Total_Services'] = 0
        for col in service_cols:
            self.df['Total_Services'] += (self.df[col] == 'Yes').astype(int)
        
        print(f"✅ Datos cargados: {len(self.df):,} clientes")
        print(f"   🧹 Valores nulos en TotalCharges corregidos")
        
        return self
    
    def calculate_kpis(self):
        """Calcula KPIs principales"""
        print("\n📊 Calculando KPIs de Telco...")
        
        total_customers = len(self.df)
        churned_customers = self.df['Churn_Binary'].sum()
        churn_rate = (churned_customers / total_customers) * 100
        
        arpu = self.df['MonthlyCharges'].mean()
        total_monthly_revenue = self.df['MonthlyCharges'].sum()
        
        # Revenue at risk (clientes que hicieron churn)
        churned_arpu = self.df[self.df['Churn_Binary'] == 1]['MonthlyCharges'].mean()
        revenue_at_risk = churned_customers * churned_arpu
        
        # Lifetime value
        avg_clv = self.df['Estimated_CLV'].mean()
        
        self.kpis = {
            'total_customers': total_customers,
            'churned_customers': churned_customers,
            'churn_rate': round(churn_rate, 2),
            'arpu': round(arpu, 2),
            'total_monthly_revenue': round(total_monthly_revenue, 2),
            'revenue_at_risk': round(revenue_at_risk, 2),
            'avg_clv': round(avg_clv, 2),
            'avg_tenure': round(self.df['tenure'].mean(), 2)
        }
        
        print(f"   👥 Total de Clientes: {total_customers:,}")
        print(f"   📉 Churn Rate: {churn_rate:.2f}%")
        print(f"   💰 ARPU (Avg Revenue Per User): ${arpu:.2f}")
        print(f"   ⚠️  Revenue at Risk (mensual): ${revenue_at_risk:,.2f}")
        print(f"   💎 Avg Customer Lifetime Value: ${avg_clv:,.2f}")
        print(f"   📅 Tenure Promedio: {self.kpis['avg_tenure']:.1f} meses")
        
        return self.kpis
    
    def churn_by_contract(self):
        """Análisis de churn por tipo de contrato"""
        print("\n📋 Churn por Tipo de Contrato:")
        
        contract_analysis = self.df.groupby('Contract').agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean',
            'tenure': 'mean'
        }).round(2)
        
        contract_analysis.columns = ['Churned_Count', 'Churn_Rate', 'Total_Customers', 'Avg_ARPU', 'Avg_Tenure']
        contract_analysis['Churn_Rate'] = (contract_analysis['Churn_Rate'] * 100).round(2)
        contract_analysis['Revenue_at_Risk'] = (contract_analysis['Churned_Count'] * contract_analysis['Avg_ARPU']).round(2)
        
        print(contract_analysis)
        return contract_analysis
    
    def churn_by_tenure(self):
        """Análisis de churn por segmento de tenure"""
        print("\n⏱️  Churn por Segmento de Tenure:")
        
        tenure_analysis = self.df.groupby('Tenure_Segment').agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean'
        }).round(2)
        
        tenure_analysis.columns = ['Churned_Count', 'Churn_Rate', 'Total_Customers', 'Avg_ARPU']
        tenure_analysis['Churn_Rate'] = (tenure_analysis['Churn_Rate'] * 100).round(2)
        
        print(tenure_analysis)
        return tenure_analysis
    
    def churn_by_services(self):
        """Análisis de churn por servicios contratados"""
        print("\n📦 Churn por Servicios Contratados:")
        
        # Análisis por tipo de Internet
        internet_analysis = self.df.groupby('InternetService').agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean'
        }).round(2)
        
        internet_analysis.columns = ['Churned_Count', 'Churn_Rate', 'Total_Customers', 'Avg_ARPU']
        internet_analysis['Churn_Rate'] = (internet_analysis['Churn_Rate'] * 100).round(2)
        
        print("\nPor Tipo de Internet:")
        print(internet_analysis)
        
        # Análisis por número total de servicios
        services_analysis = self.df.groupby('Total_Services').agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean'
        }).round(2)
        
        services_analysis.columns = ['Churned_Count', 'Churn_Rate', 'Total_Customers', 'Avg_ARPU']
        services_analysis['Churn_Rate'] = (services_analysis['Churn_Rate'] * 100).round(2)
        
        print("\nPor Número de Servicios:")
        print(services_analysis)
        
        return internet_analysis, services_analysis
    
    def churn_by_payment_method(self):
        """Análisis de churn por método de pago"""
        print("\n💳 Churn por Método de Pago:")
        
        payment_analysis = self.df.groupby('PaymentMethod').agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean'
        }).round(2)
        
        payment_analysis.columns = ['Churned_Count', 'Churn_Rate', 'Total_Customers', 'Avg_ARPU']
        payment_analysis['Churn_Rate'] = (payment_analysis['Churn_Rate'] * 100).round(2)
        payment_analysis = payment_analysis.sort_values('Churn_Rate', ascending=False)
        
        print(payment_analysis)
        return payment_analysis
    
    def high_value_churn_segments(self):
        """Identifica segmentos de alto valor con alto churn"""
        print("\n🎯 Segmentos Críticos (Alto ARPU + Alto Churn):")
        
        # Crear matriz de segmentación
        segment_matrix = self.df.groupby(['ARPU_Segment', 'Tenure_Segment']).agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean'
        }).round(2)
        
        segment_matrix.columns = ['Churned_Count', 'Churn_Rate', 'Total_Customers', 'Avg_ARPU']
        segment_matrix['Churn_Rate'] = (segment_matrix['Churn_Rate'] * 100).round(2)
        segment_matrix['Revenue_at_Risk'] = (segment_matrix['Churned_Count'] * segment_matrix['Avg_ARPU']).round(2)
        
        # Filtrar segmentos críticos (churn > 30% y ARPU > $70)
        critical_segments = segment_matrix[
            (segment_matrix['Churn_Rate'] > 30) & 
            (segment_matrix['Avg_ARPU'] > 70)
        ].sort_values('Revenue_at_Risk', ascending=False)
        
        print(critical_segments)
        return critical_segments
    
    def churn_impact_simulation(self):
        """Simula impacto de reducción de churn"""
        print("\n💡 Simulación de Impacto (Reducción de Churn):")
        
        current_churn = self.kpis['churn_rate']
        monthly_revenue = self.kpis['total_monthly_revenue']
        revenue_at_risk = self.kpis['revenue_at_risk']
        
        scenarios = [1, 2, 5, 10]  # Reducción en puntos porcentuales
        
        print(f"\nChurn actual: {current_churn:.2f}%")
        print(f"Revenue mensual at risk: ${revenue_at_risk:,.2f}")
        print("\nEscenarios de reducción:")
        
        for reduction in scenarios:
            new_churn = current_churn - reduction
            saved_revenue = revenue_at_risk * (reduction / current_churn)
            annual_impact = saved_revenue * 12
            
            print(f"   - Reducir churn a {new_churn:.2f}% (-{reduction}pp):")
            print(f"     • Revenue recuperado/mes: ${saved_revenue:,.2f}")
            print(f"     • Impacto anual: ${annual_impact:,.2f}")
        
        return None
    
    def export_for_supabase(self):
        """Prepara datos para Supabase"""
        print("\n💾 Preparando datos para Supabase...")
        
        # Tabla principal de clientes
        customers_table = self.df[[
            'customerID', 'gender', 'SeniorCitizen', 'Partner', 'Dependents',
            'tenure', 'Tenure_Segment', 'PhoneService', 'MultipleLines', 
            'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection',
            'TechSupport', 'StreamingTV', 'StreamingMovies', 'Contract',
            'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges', 'TotalCharges',
            'Churn', 'Churn_Binary', 'ARPU_Segment', 'Estimated_CLV', 'Total_Services'
        ]].copy()
        
        customers_table.to_csv('processed_telco_customers.csv', index=False)
        print(f"   ✅ Clientes exportados: processed_telco_customers.csv")
        
        # Tabla de KPIs agregados por segmento
        segment_kpis = self.df.groupby(['Contract', 'Tenure_Segment', 'ARPU_Segment']).agg({
            'Churn_Binary': ['sum', 'mean', 'count'],
            'MonthlyCharges': 'mean',
            'TotalCharges': 'mean'
        }).reset_index()
        
        segment_kpis.columns = ['contract', 'tenure_segment', 'arpu_segment', 
                                'churned_count', 'churn_rate', 'total_customers', 
                                'avg_monthly_charges', 'avg_total_charges']
        segment_kpis['churn_rate'] = (segment_kpis['churn_rate'] * 100).round(2)
        segment_kpis['revenue_at_risk'] = (segment_kpis['churned_count'] * segment_kpis['avg_monthly_charges']).round(2)
        
        segment_kpis.to_csv('processed_telco_segment_kpis.csv', index=False)
        print(f"   ✅ KPIs por segmento exportados: processed_telco_segment_kpis.csv")
        
        return customers_table, segment_kpis
    
    def run_full_analysis(self):
        """Ejecuta el análisis completo"""
        self.load_data()
        self.calculate_kpis()
        self.churn_by_contract()
        self.churn_by_tenure()
        self.churn_by_services()
        self.churn_by_payment_method()
        self.high_value_churn_segments()
        self.churn_impact_simulation()
        self.export_for_supabase()
        
        print("\n" + "="*80)
        print("✅ ANÁLISIS TELCO COMPLETADO")
        print("="*80)

if __name__ == "__main__":
    processor = TelcoProcessor()
    processor.run_full_analysis()
