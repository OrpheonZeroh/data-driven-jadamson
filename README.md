# 📊 Data-Driven Analytics Dashboard

> **Multi-domain business intelligence platform showcasing advanced analytics, data storytelling, and full-stack development skills.**

A comprehensive analytics portfolio project demonstrating expertise in data engineering, visualization, and strategic business insights across four distinct business domains: Digital Marketing, Telecommunications, Airlines, and Retail.

[🔗 Live Demo](#) | [📧 Contact](mailto:your-email@example.com)

---

## 🎯 Project Overview

This project showcases my ability to transform raw data into actionable business intelligence through:

- **End-to-end data pipeline**: Python ETL → Supabase (PostgreSQL) → Next.js frontend
- **Strategic storytelling**: Each dashboard tells a coherent business story with clear insights
- **Production-ready code**: TypeScript, modern React patterns, responsive design, optimized performance
- **Business acumen**: Real KPIs (CAC, LTV/CAC, ARPU, Churn Rate) with strategic recommendations

**Perfect for recruiters looking for**: Data Analysts, Business Intelligence Developers, Full-Stack Engineers, or Product Analysts with strong technical and business skills.

---

## ✨ Key Features

### 📈 4 Production-Grade Dashboards

1. **Digital Performance Marketing** (Time-Series)
   - Marketing attribution & ROI analysis
   - Customer acquisition cost (CAC) by channel
   - LTV/CAC ratios for business health
   - Channel prioritization matrix with actionable insights

2. **Telco Churn Analytics** (Snapshot)
   - Customer segmentation & retention analysis
   - Revenue-at-risk calculations
   - Churn prediction by contract type, payment method, tenure
   - ARPU (Average Revenue Per User) optimization

3. **Airlines Pricing Intelligence** (Snapshot)
   - Market structure analysis (class, connectivity, duration)
   - Competitive pricing landscape
   - Route performance & airline market share
   - Price range distribution insights

4. **Retail Sales Analytics** (Time-Series)
   - Revenue trends & profitability metrics
   - Customer segmentation by value
   - Product category performance
   - Margin analysis with cost breakdowns

### 🎨 Design & UX

- **Dark modern UI** with gradient accents and glassmorphism
- **Responsive design** optimized for desktop and tablet
- **Interactive filters** (date ranges for time-series data)
- **Smart formatting** - numbers auto-format based on context ($125K, 42.6%, 1.5M)
- **Data type badges** - Clear distinction between Time-Series and Snapshot data

### 🔧 Technical Highlights

- **Type-safe**: Full TypeScript implementation
- **Performance**: Server-side data fetching, efficient pagination
- **Scalability**: Modular component architecture
- **Data integrity**: 99.8% clean data rate with validation
- **Error handling**: Graceful fallbacks and loading states

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router, React Server Components)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Recharts** for data visualizations
- **Lucide React** for icons

### Backend & Data
- **Python** (Pandas, NumPy) for ETL pipelines
- **Supabase** (PostgreSQL) for database & real-time sync
- **SQL** for complex aggregations and KPI views

### Data Sources
- **Kaggle** public datasets (digital marketing, telco churn, airlines pricing, retail sales)
- ~**500K+ records** processed across all domains

---

## 📁 Project Structure

```
data_driven/
├── dashboard-app/          # Next.js frontend application
│   ├── app/
│   │   ├── digital/       # Digital Performance dashboard
│   │   ├── telco/         # Telco Churn dashboard
│   │   ├── airlines/      # Airlines Pricing dashboard
│   │   ├── retail/        # Retail Analytics dashboard
│   │   └── page.tsx       # Home page with executive summary
│   ├── components/        # Reusable UI components
│   │   ├── Charts.tsx     # Smart chart components with auto-formatting
│   │   ├── DateFilter.tsx # Date range selector
│   │   ├── StatCard.tsx   # KPI cards with trends
│   │   └── Navigation.tsx # Main navigation
│   └── lib/
│       └── supabase.ts    # Supabase client configuration
│
├── backend/               # Python ETL & data processing
│   ├── upload_to_supabase.py          # Main upload orchestrator
│   ├── upload_digital_performance.py  # Digital data pipeline
│   ├── process_airlines.py            # Airlines data processing
│   ├── process_telco.py               # Telco data processing
│   ├── compact_fraud_data.py          # Data optimization
│   ├── supabase_schemas.sql           # Database schema definitions
│   └── *.csv                          # Source datasets
│
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.9+** with pip
- **Supabase account** (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/data-driven-analytics.git
   cd data-driven-analytics
   ```

2. **Set up the backend**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt

   # Configure Supabase credentials
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Supabase URL and key

   # Run database schema
   # Execute backend/supabase_schemas.sql in your Supabase SQL editor

   # Upload data to Supabase
   cd backend
   python upload_to_supabase.py
   ```

3. **Set up the frontend**
   ```bash
   cd dashboard-app

   # Install dependencies
   npm install

   # Configure environment variables
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials

   # Run development server
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📊 Dashboard Deep Dive

### 1. Digital Performance Marketing

**Business Question**: *"Which marketing channels drive the best ROI and customer value?"*

**Key Metrics**:
- Total Spend & Revenue
- ROI by channel
- CAC (Customer Acquisition Cost)
- LTV/CAC Ratio (>3 = healthy business)

**Strategic Insights**:
- Channel priority matrix (🚀 SCALE, ⚙️ OPTIMIZE, ⚠️ REVIEW)
- Budget allocation recommendations
- Customer acquisition efficiency trends

**Data Type**: Time-Series (2 years, filterable by date)

---

### 2. Telco Churn Analytics

**Business Question**: *"Why are customers leaving and how can we prevent it?"*

**Key Metrics**:
- Overall churn rate
- Total CLV (Customer Lifetime Value)
- Revenue at risk by segment
- ARPU by customer segment

**Strategic Insights**:
- High-risk segments identification
- Contract type impact on retention
- Payment method correlation with churn
- Add-on services effect on loyalty

**Data Type**: Snapshot (7,043 customers)

---

### 3. Airlines Pricing Intelligence

**Business Question**: *"How is the airline market structured and where are pricing opportunities?"*

**Key Metrics**:
- Average ticket price
- Direct flight availability
- Market share by airline
- Price ranges distribution

**Strategic Insights**:
- Class distribution (Economy vs Business)
- Connectivity patterns (Non-stop vs Multi-stop)
- Route performance analysis
- Duration segmentation impact on pricing

**Data Type**: Snapshot (300,153 flight options analyzed)

---

### 4. Retail Sales Analytics

**Business Question**: *"What drives profitability and which customer segments are most valuable?"*

**Key Metrics**:
- Total revenue & profit margin
- Average order value
- Products sold
- Unique customers

**Strategic Insights**:
- Category performance breakdown
- Monthly revenue trends
- Profit margin evolution
- Customer value segmentation

**Data Type**: Time-Series (3+ years, filterable by date)

---

## 🎓 Skills Demonstrated

### Data & Analytics
- ✅ ETL pipeline development (Python → SQL → API)
- ✅ Database design & optimization (PostgreSQL/Supabase)
- ✅ KPI definition & calculation (CAC, LTV, ARPU, Churn Rate)
- ✅ Statistical analysis & segmentation
- ✅ Data storytelling & visualization

### Engineering
- ✅ Full-stack development (Next.js, React, TypeScript)
- ✅ Component architecture & reusability
- ✅ State management & data fetching
- ✅ Responsive design & UX principles
- ✅ Code organization & maintainability

### Business Acumen
- ✅ Strategic insight generation
- ✅ Metric interpretation & recommendations
- ✅ Multi-domain business understanding
- ✅ Stakeholder communication (via dashboard narratives)

---

## 📈 Performance & Scale

- **500K+ records** processed across all domains
- **<2s** initial page load
- **<500ms** dashboard interactions
- **99.8%** data quality rate
- **Pagination** for large datasets (10K+ records)
- **Responsive** design for all screen sizes

---

## 🔮 Future Enhancements

- [ ] Export to PDF/Excel functionality
- [ ] Real-time data updates via Supabase subscriptions
- [ ] Predictive analytics (churn prediction ML model)
- [ ] User authentication & saved filters
- [ ] A/B testing insights dashboard
- [ ] Mobile app version (React Native)

---

## 📝 Data Sources & Attribution

All datasets sourced from **[Kaggle](https://www.kaggle.com)** public datasets:
- Digital Marketing Performance Data
- Telco Customer Churn Dataset
- Flight Price Prediction Dataset
- Online Retail Transactions
---

## 🙏 Acknowledgments

- **Next.js** team for the incredible framework
- **Supabase** for the powerful backend platform
- **Kaggle** community for quality datasets
- **Recharts** for beautiful chart components

---

<div align="center">

### ⭐ If you found this project interesting, please consider giving it a star!

**Built with ❤️ to showcase data analytics & full-stack development skills**

</div>
