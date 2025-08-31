# 🚀 Production Deployment Guide - Salon Dina

This guide will help you deploy Salon Dina to Vercel with Neon database in production.

## ✅ Prerequisites

- [x] GitHub repository with your code
- [x] Vercel account (free tier is fine)
- [x] Neon database account (free tier is fine)

## 📋 Step-by-Step Deployment

### 1. Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project (choose closest region to Indonesia - Singapore)
3. Copy your connection string from the dashboard
4. It should look like: `postgresql://username:password@host/dbname?sslmode=require`

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **IMPORTANT:** Set these environment variables:

```bash
DATABASE_URL=your_neon_connection_string
DIRECT_URL=your_neon_connection_string
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

5. Deploy the project

### 3. Set Up Database Schema & Data

After deployment, you have **3 options**:

#### Option A: Automatic Setup (Recommended)
```bash
# From your local project folder
node scripts/setup-production-db.js https://your-app-name.vercel.app
```

#### Option B: Manual Setup via Browser
1. Go to `https://your-app-name.vercel.app/admin/database-manager`
2. Click "Force Migrate Database" 
3. Click "Populate Database"
4. Wait for completion

#### Option C: Manual Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon database  
npx prisma db push

# Seed the database
npx prisma db seed
```

### 4. Verify Everything Works

1. **Test Homepage**: Visit `https://your-app-name.vercel.app`
   - Should show treatments and booking system
   
2. **Test Admin**: Visit `https://your-app-name.vercel.app/admin/masuk`
   - Login: `admin` / `admin123`
   - Should show dashboard with data
   
3. **Test Database Manager**: Visit `https://your-app-name.vercel.app/admin/database-manager`
   - Should show database statistics
   - Should show healthy status

## 🔧 Troubleshooting

### Problem: Homepage shows no treatments
**Solution:**
```bash
# Run database setup again
node scripts/setup-production-db.js https://your-app-name.vercel.app
```

### Problem: Can't login to admin
**Possible causes:**
1. Database not populated → Run setup script
2. Wrong environment variables → Check Vercel settings
3. Database connection issues → Check Neon status

### Problem: Database errors
1. Check your Neon database is active
2. Verify `DATABASE_URL` in Vercel environment variables
3. Check Vercel function logs for specific errors

### Problem: Manifest.json 404 error
This is now fixed - the manifest.json file has been created.

## 📊 Database Management

### Accessing Database Manager
- URL: `https://your-app-name.vercel.app/admin/database-manager`
- Shows real-time statistics
- Allows database operations
- Similar to Supabase table editor

### Manual Database Operations
If you need to manually manage data:

1. Use the Database Manager UI (recommended)
2. Use Neon's SQL Editor in their dashboard
3. Use Prisma Studio locally: `npx prisma studio`

## 🛡️ Security Notes

1. **Change default admin password** after first login
2. **Use strong NEXTAUTH_SECRET** (generate with: `openssl rand -hex 32`)
3. **Enable Neon IP allowlist** if needed for extra security

## 📱 Mobile Optimization

The app is already optimized for Indonesian users:
- Mobile-first design
- WhatsApp integration
- Indonesian payment methods
- Prayer time widget
- Responsive on all devices

## 🎯 Next Steps After Deployment

1. **Change admin credentials**
2. **Add real therapist data** 
3. **Update service prices**
4. **Test booking flow end-to-end**
5. **Train staff on the system**

## 📞 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Neon database logs  
3. Use the Database Manager to verify data
4. Contact support with specific error messages

---

**🎉 Congratulations!** Your Salon Dina management system is now live in production!
