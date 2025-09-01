# 🚀 Vercel Environment Variables Setup Guide
## For Salon Muslimah Dina Production Deployment

### ⚠️ CRITICAL: Required Environment Variables

These environment variables MUST be set in your Vercel project dashboard:

---

## 🔧 How to Set Environment Variables in Vercel:

1. **Go to**: https://vercel.com/dashboard
2. **Select your project**: `salon-dina`  
3. **Go to**: Settings → Environment Variables
4. **Add each variable below**:

---

## 📋 Required Environment Variables:

### **1. Supabase Database Configuration**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://krcezovcddlxyuuvlrny.supabase.co
```

```bash  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyY2V6b3ZjZGRseHl1dXZscm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzgzMTksImV4cCI6MjA3MjIxNDMxOX0.UCNjlRsYezQpbr8b1T8NU4medbjbHWkz_Et-wZrXG-8
```

```bash
DATABASE_URL=postgresql://postgres.krcezovcddlxyuuvlrny:salonDinaMedan@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### **2. NextAuth Configuration**
```bash
NEXTAUTH_URL=https://salon-dina-iota.vercel.app
```

```bash
NEXTAUTH_SECRET=salon-dina-production-secret-key-2024-barakallahu-fiki-bismillah
```

### **3. Additional Settings** 
```bash
NODE_ENV=production
```

---

## ✅ Verification Steps:

After setting these variables:

1. **Trigger a new deployment** by pushing any commit
2. **Test the API**: https://salon-dina-iota.vercel.app/api/health
3. **Expected result**: `{"status":"healthy","database":"connected"}`
4. **Test services**: https://salon-dina-iota.vercel.app/api/services?active=true
5. **Expected result**: Real service data from Supabase (not fallback data)

---

## 🚨 Previous Issues Caused By:

- ❌ **Base .env**: Was using SQLite instead of Supabase
- ❌ **Production .env**: Had placeholder values `[YOUR_PASSWORD]`
- ❌ **Vercel Environment**: Missing `NEXT_PUBLIC_SUPABASE_*` variables
- ❌ **Inconsistent Data**: API switching between fallback and real data

## ✅ After This Fix:

- ✅ **Consistent Database**: Always connects to Supabase
- ✅ **Real Data Loading**: Services load from database
- ✅ **Authentication**: Works with `admin_dina` / `DinaAdmin123!`
- ✅ **No More Fallbacks**: Production uses real data

---

## 🔐 Authentication Credentials:

**Production Login:**
- Username: `admin_dina`
- Password: `DinaAdmin123!`

**Fallback (Development Only):**
- Username: `admin`  
- Password: `admin123`

---

**🎯 This MUST be done to fix the inconsistent data loading issue!**