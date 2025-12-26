"""
Procesamiento y análisis del dataset de Airlines Flights
Calcula KPIs principales: On-time rate, Delay metrics, Route efficiency
"""
import pandas as pd
import numpy as np

class AirlinesProcessor:
    def __init__(self, csv_path='airlines_flights_data.csv'):
        self.csv_path = csv_path
        self.df = None
        self.kpis = {}
        
    def load_data(self):
        """Carga y limpia el dataset"""
        print("📥 Cargando datos de Airlines Flights...")
        self.df = pd.read_csv(self.csv_path)
        
        # Crear features adicionales
        # Calcular delay estimado (asumiendo que duration vs optimal puede indicar delay)
        # Como no tenemos columna de delay explícita, crearemos métricas de eficiencia
        
        # Crear columna de ruta
        self.df['route'] = self.df['source_city'] + ' → ' + self.df['destination_city']
        
        # Categorizar duración de vuelo
        self.df['flight_length'] = pd.cut(self.df['duration'], 
                                           bins=[0, 3, 6, 12, 50],
                                           labels=['Short (<3h)', 'Medium (3-6h)', 'Long (6-12h)', 'Very Long (12h+)'])
        
        # Calcular precio por hora de vuelo
        self.df['price_per_hour'] = (self.df['price'] / self.df['duration']).round(2)
        
        # Categorizar días de anticipación
        self.df['booking_window'] = pd.cut(self.df['days_left'],
                                            bins=[0, 7, 14, 30, 50],
                                            labels=['Last Minute (0-7d)', 'Short (8-14d)', 'Medium (15-30d)', 'Early (30d+)'])
        
        print(f"✅ Datos cargados: {len(self.df):,} vuelos")
        return self
    
    def calculate_kpis(self):
        """Calcula KPIs principales"""
        print("\n📊 Calculando KPIs de Airlines...")
        
        total_flights = len(self.df)
        avg_duration = self.df['duration'].mean()
        avg_price = self.df['price'].mean()
        total_revenue = self.df['price'].sum()
        
        # Métricas de stops (eficiencia operativa)
        direct_flights = len(self.df[self.df['stops'] == 'zero'])
        direct_flight_rate = (direct_flights / total_flights) * 100
        
        self.kpis = {
            'total_flights': total_flights,
            'avg_duration_hours': round(avg_duration, 2),
            'avg_price': round(avg_price, 2),
            'total_revenue': total_revenue,
            'direct_flight_rate': round(direct_flight_rate, 2),
            'unique_routes': self.df['route'].nunique(),
            'unique_airlines': self.df['airline'].nunique()
        }
        
        print(f"   ✈️  Total de Vuelos: {total_flights:,}")
        print(f"   ⏱️  Duración Promedio: {avg_duration:.2f} horas")
        print(f"   💰 Precio Promedio: ${avg_price:,.2f}")
        print(f"   🎯 Tasa de Vuelos Directos: {direct_flight_rate:.2f}%")
        print(f"   🗺️  Rutas Únicas: {self.kpis['unique_routes']:,}")
        
        return self.kpis
    
    def airline_analysis(self):
        """Análisis por aerolínea"""
        print("\n✈️  Análisis por Aerolínea:")
        
        airline_metrics = self.df.groupby('airline').agg({
            'price': ['mean', 'sum', 'count'],
            'duration': 'mean',
            'stops': lambda x: (x == 'zero').sum()
        }).round(2)
        
        airline_metrics.columns = ['Avg_Price', 'Total_Revenue', 'Total_Flights', 'Avg_Duration', 'Direct_Flights']
        airline_metrics['Direct_Flight_Rate'] = (airline_metrics['Direct_Flights'] / airline_metrics['Total_Flights'] * 100).round(2)
        airline_metrics['Market_Share'] = (airline_metrics['Total_Flights'] / airline_metrics['Total_Flights'].sum() * 100).round(2)
        
        airline_metrics = airline_metrics.sort_values('Total_Revenue', ascending=False)
        print(airline_metrics)
        
        return airline_metrics
    
    def route_analysis(self):
        """Análisis por ruta (top rutas)"""
        print("\n🗺️  Análisis de Rutas (Top 10 por volumen):")
        
        route_metrics = self.df.groupby('route').agg({
            'price': ['mean', 'sum', 'count'],
            'duration': 'mean',
            'stops': lambda x: (x == 'zero').sum()
        }).round(2)
        
        route_metrics.columns = ['Avg_Price', 'Total_Revenue', 'Total_Flights', 'Avg_Duration', 'Direct_Flights']
        route_metrics['Direct_Flight_Rate'] = (route_metrics['Direct_Flights'] / route_metrics['Total_Flights'] * 100).round(2)
        
        # Calcular "efficiency score" (menor duración y mayor tasa de vuelos directos = mejor)
        route_metrics['Efficiency_Score'] = (route_metrics['Direct_Flight_Rate'] / route_metrics['Avg_Duration']).round(2)
        
        route_metrics = route_metrics.sort_values('Total_Flights', ascending=False)
        print(route_metrics.head(10))
        
        return route_metrics
    
    def class_analysis(self):
        """Análisis por clase"""
        print("\n🎫 Análisis por Clase de Vuelo:")
        
        class_metrics = self.df.groupby('class').agg({
            'price': ['mean', 'sum', 'count'],
            'duration': 'mean'
        }).round(2)
        
        class_metrics.columns = ['Avg_Price', 'Total_Revenue', 'Total_Flights', 'Avg_Duration']
        class_metrics['Revenue_Share'] = (class_metrics['Total_Revenue'] / class_metrics['Total_Revenue'].sum() * 100).round(2)
        
        print(class_metrics)
        return class_metrics
    
    def booking_window_analysis(self):
        """Análisis por ventana de reserva"""
        print("\n📅 Análisis por Ventana de Reserva:")
        
        booking_metrics = self.df.groupby('booking_window').agg({
            'price': ['mean', 'count'],
            'duration': 'mean'
        }).round(2)
        
        booking_metrics.columns = ['Avg_Price', 'Total_Bookings', 'Avg_Duration']
        booking_metrics['Booking_Share'] = (booking_metrics['Total_Bookings'] / booking_metrics['Total_Bookings'].sum() * 100).round(2)
        
        print(booking_metrics)
        return booking_metrics
    
    def stops_analysis(self):
        """Análisis por número de escalas"""
        print("\n🔄 Análisis por Número de Escalas:")
        
        stops_metrics = self.df.groupby('stops').agg({
            'price': ['mean', 'count'],
            'duration': 'mean'
        }).round(2)
        
        stops_metrics.columns = ['Avg_Price', 'Total_Flights', 'Avg_Duration']
        stops_metrics['Flight_Share'] = (stops_metrics['Total_Flights'] / stops_metrics['Total_Flights'].sum() * 100).round(2)
        
        # Ordenar por número de stops
        stops_order = {'zero': 0, 'one': 1, 'two_or_more': 2}
        stops_metrics['sort_order'] = stops_metrics.index.map(stops_order)
        stops_metrics = stops_metrics.sort_values('sort_order').drop('sort_order', axis=1)
        
        print(stops_metrics)
        return stops_metrics
    
    def export_for_supabase(self):
        """Prepara datos para Supabase"""
        print("\n💾 Preparando datos para Supabase...")
        
        # Tabla principal de vuelos
        flights_table = self.df[[
            'airline', 'flight', 'source_city', 'destination_city', 'route',
            'departure_time', 'arrival_time', 'stops', 'class', 
            'duration', 'days_left', 'price', 'price_per_hour',
            'flight_length', 'booking_window'
        ]].copy()
        
        flights_table.to_csv('processed_airlines_flights.csv', index=False)
        print(f"   ✅ Vuelos exportados: processed_airlines_flights.csv")
        
        # Tabla de KPIs agregados por ruta
        route_kpis = self.df.groupby(['route', 'airline']).agg({
            'price': ['mean', 'sum', 'count'],
            'duration': 'mean',
            'stops': lambda x: (x == 'zero').sum()
        }).reset_index()
        
        route_kpis.columns = ['route', 'airline', 'avg_price', 'total_revenue', 'total_flights', 'avg_duration', 'direct_flights']
        route_kpis['direct_flight_rate'] = (route_kpis['direct_flights'] / route_kpis['total_flights'] * 100).round(2)
        
        route_kpis.to_csv('processed_airlines_route_kpis.csv', index=False)
        print(f"   ✅ KPIs por ruta exportados: processed_airlines_route_kpis.csv")
        
        return flights_table, route_kpis
    
    def run_full_analysis(self):
        """Ejecuta el análisis completo"""
        self.load_data()
        self.calculate_kpis()
        self.airline_analysis()
        self.route_analysis()
        self.class_analysis()
        self.booking_window_analysis()
        self.stops_analysis()
        self.export_for_supabase()
        
        print("\n" + "="*80)
        print("✅ ANÁLISIS AIRLINES COMPLETADO")
        print("="*80)

if __name__ == "__main__":
    processor = AirlinesProcessor()
    processor.run_full_analysis()
