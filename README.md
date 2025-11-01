# 🎓 School Financial Planner

**A comprehensive 25-year financial planning and analysis application for educational institutions**

## 🚀 **LIVE APPLICATION**
**URL**: https://school-financial-planner.vercel.app

## ✅ **Status: FULLY FUNCTIONAL**

All authentication issues have been resolved and the application is production-ready!

### **Test Account**
- **Email**: `ewqzvcdf@minimax.com`
- **Password**: `pMJkvsvYkW`

---

## 📋 **Features**

### **🎯 Financial Planning**
- **25-Year Strategic Forecasting** (2024-2052)
- **P&L, Balance Sheet & Cash Flow** projections
- **Scenario Analysis**: Base Case, Optimistic, Downside
- **Dual Curriculum Tracking**: French & IB programs
- **Revenue Streams**: Multiple income sources with growth planning

### **📊 Version Management**
- **Multiple Scenario Planning** with unlimited versions
- **Property Metadata**: Land/building size and comments
- **Assumptions Workspace**: Comprehensive input interface
- **Version Comparison**: Side-by-side analysis tools

### **📈 CAPEX & Investment Planning**
- **Recurring CAPEX Automation**: 5 asset categories with lifecycle management
- **Manual CAPEX Entries**: Custom investment planning for 2025-2027
- **Depreciation Management**: Automated calculation across asset types
- **Strategic Investment Tracking**: Long-term asset planning

### **💼 Working Capital Management**
- **Days Outstanding Tracking**: AR/AP/Inventory management
- **Cash Flow Optimization**: Operating, investing, and financing activities
- **Financial Controls**: Balance sheet parity and cash flow reconciliation

### **📋 Reports & Analysis**
- **Executive Dashboard**: KPI overview with trend analysis
- **Financial Ratios**: Profitability, liquidity, and growth metrics
- **Export Capabilities**: PDF/Excel framework ready
- **Audit Trail System**: Complete change tracking

---

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 15** with React 19 and TypeScript
- **Tailwind CSS** for responsive design
- **Shadcn/ui** for modern UI components
- **Dark Mode** support throughout

### **Backend**
- **Supabase** for database, authentication, and API
- **PostgreSQL** with JSONB for flexible data storage
- **Row Level Security** for secure multi-tenant access
- **Edge Functions** for financial calculations

### **Financial Engine**
- **25-Year Calculation Engine** with multiple revenue streams
- **Scenario Modeling** with parameter-based analysis
- **Financial Controls** for data validation and accuracy
- **Automated Depreciation** and asset lifecycle management

---

## 🚀 **Getting Started**

### **Quick Start**
1. **Visit**: https://school-financial-planner.vercel.app
2. **Login**: Use test account or register new account
3. **Create Model**: Click "New Model" from dashboard
4. **Configure Assumptions**: Set up financial parameters
5. **Run Model**: Click "Run Model" for calculations
6. **Analyze Results**: Review projections and compare scenarios

### **For Development**

```bash
# Clone the repository
git clone https://github.com/helalifaker/school-financial-planner

# Navigate to project
cd school-financial-planner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

### **Environment Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📊 **Data Structure**

### **Database Tables**
- **profiles**: User management and roles
- **versions**: Financial planning scenarios
- **assumptions**: Configuration and input parameters
- **results**: Calculated financial projections
- **audit_trails**: Change tracking and history

### **Financial Model Output**
- **Revenue Streams**: Tuition (French/IB), Other income
- **Profit & Loss**: 25-year P&L with detailed breakdowns
- **Balance Sheet**: Assets, Liabilities, Equity roll-forward
- **Cash Flow**: Operating, Investing, Financing activities
- **Financial Controls**: Data validation and accuracy checks

---

## 🔒 **Security & Authentication**

- **JWT/OAuth2 Authentication** via Supabase Auth
- **Row Level Security** on all database tables
- **Role-based Access Control**: Admin, Analyst, Viewer
- **Input Validation** on all user forms
- **Secure API Endpoints** with proper authorization

---

## 🎯 **Use Cases**

### **Financial Planning**
- **Budget Forecasting**: 25-year strategic financial planning
- **Scenario Analysis**: Test optimistic vs. conservative assumptions
- **Revenue Planning**: Multiple curriculum revenue streams
- **Cost Management**: Staff, operational, and capital expense planning

### **Strategic Decision Making**
- **Investment Planning**: CAPEX and infrastructure decisions
- **Enrollment Strategy**: Growth planning across curricula
- **Risk Assessment**: Downside scenario planning
- **Stakeholder Reporting**: Executive dashboards and exports

### **Compliance & Tracking**
- **Audit Trails**: Complete change tracking and history
- **Version Control**: Multiple scenario management
- **Data Validation**: Financial controls and reconciliation
- **Export Capabilities**: Audit-ready reports

---

## 📈 **Financial Capabilities**

### **Revenue Modeling**
- **Dual Tuition Structure**: French (33,213 SAR) & IB (44,284 SAR)
- **Enrollment Growth**: Year-over-year student projections
- **Price Inflation**: Configurable growth rates and frequency
- **Other Income**: Additional revenue stream modeling

### **Expense Management**
- **Staff Costs**: Percentage-based expense planning
- **Operational Expenses**: Percentage-based OEX planning
- **Rent Modeling**: Fixed+Inflation vs. Revenue-based options
- **CAPEX Planning**: Manual entries + recurring automation

### **Financial Controls**
- **Balance Sheet Parity**: Assets = Liabilities + Equity
- **Cash Flow Reconciliation**: Operating + Investing + Financing
- **Data Validation**: Multiple checkpoint verification
- **Error Detection**: Automated financial control checks

---

## 🌟 **Recent Updates**

### **✅ Authentication System**
- Fixed email validation and profile creation
- Enhanced error handling and user feedback
- Seamless registration and login flow
- Automatic user profile management

### **✅ User Experience**
- Added success notifications for version creation
- Improved form validation and error messages
- Enhanced loading states and visual feedback
- Smooth auto-redirect after model completion

### **✅ Financial Engine**
- Completed 25-year calculation engine
- Implemented recurring CAPEX automation
- Added property metadata tracking
- Enhanced scenario comparison tools

---

## 🆘 **Support & Troubleshooting**

### **Common Issues**
1. **Login Problems**: Check browser console for API errors
2. **Model Creation**: Ensure all required fields are filled
3. **Calculation Errors**: Verify assumptions are valid ranges
4. **Performance**: Large scenarios may take 10-30 seconds to calculate

### **Getting Help**
- Check the application logs for error details
- Verify environment variables are set correctly
- Test with the provided test account first
- Review browser console for JavaScript errors

---

## 📄 **License**

This project is proprietary software for educational institution financial planning.

---

## 🎉 **Live Demo**

**Application URL**: https://school-financial-planner.vercel.app

**Test Account**:
- Email: `ewqzvcdf@minimax.com`
- Password: `pMJkvsvYkW`

**Experience the complete 25-year financial planning solution!**

---

*Built with ❤️ for comprehensive educational institution financial planning and strategic decision-making.*
