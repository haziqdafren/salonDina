# 🗄️ Database Management Guide - Salon Muslimah Dina

## 📊 Database Overview

Your salon management system uses **SQLite** with **Prisma ORM** - a local file-based database perfect for small businesses.

### 🔧 Database Location & Structure

```
prisma/
├── dev.db              # Your actual database file (SQLite)
├── schema.prisma       # Database structure definition
├── seed.ts            # Initial data setup
└── migrations/        # Database version history
```

## 📈 Database Tables Overview

### 👥 **Customer Management**
- `customers` - Customer profiles, VIP status, visit history
- `bookings` - Appointment bookings from website
- `customer_feedback` - Ratings and reviews

### 👩‍⚕️ **Staff Management** 
- `therapists` - Staff data, fees, performance
- `therapist_monthly_stats` - Monthly performance analytics

### 💆‍♀️ **Service Management**
- `services` - Available treatments and pricing
- `service_categories` - Organization of services
- `daily_treatments` - Actual treatment records

### 💰 **Financial Management**
- `monthly_bookkeeping` - Daily revenue and expenses
- `settings` - Business configuration

### 🏢 **Operations**
- `business_hours` - Operating hours (7 days a week)
- `special_dates` - Holidays, closures, promotions
- `admins` - Admin login credentials

## 🚀 Essential Database Commands

### 1. **View Database Structure**
```bash
# See all tables and their data
npx prisma studio
```
This opens a visual interface at http://localhost:5555

### 2. **Reset & Refresh Database**
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Apply new changes to database
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate
```

### 3. **Backup Database**
```bash
# Copy database file for backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# Or copy to different location
cp prisma/dev.db ~/Desktop/salon-backup-$(date +%Y%m%d).db
```

### 4. **Restore Database**
```bash
# Restore from backup
cp prisma/backup-20250109.db prisma/dev.db
```

### 5. **Seed Initial Data**
```bash
# Add sample data (therapists, services, admin user)
npx prisma db seed
```

## 📊 Data Management via Admin Panel

### 🖥️ **Web Interface Management**
Access your admin panel at: `http://localhost:3000/admin/masuk`

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

**Available Management Pages:**
1. **Dashboard** - Overview and analytics
2. **Bookings** - Manage customer appointments
3. **Customers** - Customer database with VIP management
4. **Services** - Treatment pricing and categories
5. **Therapists** - Staff management and performance
6. **Daily Bookkeeping** - Financial record keeping
7. **Monthly Reports** - Business analytics

### 💾 **Direct Database Access**

**Option 1: Prisma Studio (Recommended)**
```bash
npx prisma studio
```
- Visual interface
- Safe editing
- Relationship management
- Data import/export

**Option 2: SQLite Browser**
```bash
# Install DB Browser for SQLite (GUI application)
# Then open: prisma/dev.db
```

**Option 3: Command Line**
```bash
# Direct SQLite access (advanced users)
sqlite3 prisma/dev.db
```

## ⚠️ **Important Safety Practices**

### 🔒 **Before Making Changes:**
1. **Always Backup First:**
   ```bash
   cp prisma/dev.db prisma/backup-$(date +%Y%m%d-%H%M).db
   ```

2. **Test Changes Locally:**
   - Never edit production database directly
   - Use development environment first

### 🛡️ **Data Protection:**
```bash
# Create automated daily backups
echo "0 2 * * * cp /path/to/prisma/dev.db /path/to/backups/salon-\$(date +\%Y\%m\%d).db" | crontab -
```

## 🔄 **Database Migration Process**

### When You Modify Schema:

1. **Edit schema.prisma**
2. **Create migration:**
   ```bash
   npx prisma migrate dev --name "describe_your_change"
   ```
3. **Apply changes:**
   ```bash
   npx prisma generate
   ```

### 📈 **Scaling Considerations**

**Current Setup (SQLite) Good For:**
- ✅ Single location salon
- ✅ Up to ~1000 customers
- ✅ Daily transactions < 100
- ✅ Simple backup/restore needs

**Future Scaling (PostgreSQL/MySQL):**
If you grow larger, easy migration to:
- 🚀 Multiple locations
- 🚀 Thousands of customers  
- 🚀 High transaction volume
- 🚀 Cloud hosting

## 🛠️ **Common Maintenance Tasks**

### Weekly Tasks:
```bash
# Backup database
cp prisma/dev.db ~/backups/salon-$(date +%Y%m%d).db

# Check database health
npx prisma validate
```

### Monthly Tasks:
```bash
# Update dependencies
npm update

# Clean old backups (keep last 3 months)
find ~/backups -name "salon-*.db" -mtime +90 -delete
```

## 🆘 **Troubleshooting**

### Database Locked Error:
```bash
# Stop all Node processes
pkill -f "next dev"
pkill -f "prisma studio"
# Then restart
```

### Schema Sync Issues:
```bash
# Reset and resync
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed
```

### Performance Issues:
```bash
# Analyze database
sqlite3 prisma/dev.db "ANALYZE;"
sqlite3 prisma/dev.db "VACUUM;"
```

## 📞 **Support Resources**

- **Prisma Docs**: https://prisma.io/docs
- **SQLite Docs**: https://sqlite.org/docs.html
- **Your Schema**: `/prisma/schema.prisma`
- **Admin Panel**: `http://localhost:3000/admin`