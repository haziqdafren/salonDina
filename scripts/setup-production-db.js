#!/usr/bin/env node

/**
 * Production Database Setup Script for Salon Dina
 * 
 * This script helps you set up your Neon database on Vercel
 * 
 * Usage:
 * 1. Make sure your Vercel app is deployed
 * 2. Run: node scripts/setup-production-db.js YOUR_VERCEL_URL
 * 
 * Example:
 * node scripts/setup-production-db.js https://salon-dina-iota.vercel.app
 */

const https = require('https')
const http = require('http')

const baseUrl = process.argv[2]

if (!baseUrl) {
  console.log('❌ Please provide your Vercel app URL')
  console.log('Usage: node scripts/setup-production-db.js https://your-app.vercel.app')
  process.exit(1)
}

console.log('🚀 Setting up production database...')
console.log(`📍 Target: ${baseUrl}`)

// Helper function to make HTTP requests
function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https')
    const lib = isHttps ? https : http
    
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    
    const req = lib.request(url, options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          resolve({ status: res.statusCode, data: result })
        } catch (error) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })
    
    req.on('error', reject)
    
    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function setupDatabase() {
  try {
    // Step 1: Test connection
    console.log('\n📡 Testing connection...')
    const testResponse = await makeRequest(`${baseUrl}/api/database/stats`)
    
    if (testResponse.status !== 200) {
      console.log('❌ Cannot connect to your app. Make sure it\'s deployed and accessible.')
      console.log('Response:', testResponse.data)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Step 2: Force database migration
    console.log('\n🔧 Running database migration...')
    const migrateResponse = await makeRequest(`${baseUrl}/api/database/migrate`, {
      authorization: 'force-migrate-salon-2024'
    })
    
    if (migrateResponse.status !== 200) {
      console.log('❌ Migration failed:', migrateResponse.data)
      return
    }
    
    console.log('✅ Migration completed!')
    console.log('📊 Tables found:', migrateResponse.data.data?.tableCount || 'Unknown')
    
    // Step 3: Populate database with sample data
    console.log('\n📥 Populating database with sample data...')
    const populateResponse = await makeRequest(`${baseUrl}/api/database/populate`, {
      authorization: 'populate-salon-database-2024',
      forceOverwrite: false
    })
    
    if (populateResponse.status !== 200) {
      console.log('❌ Population failed:', populateResponse.data)
      return
    }
    
    console.log('✅ Database populated successfully!')
    
    // Step 4: Get final stats
    console.log('\n📈 Getting final database stats...')
    const finalStats = await makeRequest(`${baseUrl}/api/database/stats`)
    
    if (finalStats.status === 200 && finalStats.data.success) {
      const stats = finalStats.data.stats
      console.log('\n🎉 DATABASE SETUP COMPLETE!')
      console.log('═══════════════════════════════════')
      console.log(`📊 Total Tables: ${stats.tables}`)
      console.log(`📋 Total Records: ${stats.totalRecords}`)
      console.log(`👤 Admins: ${stats.counts.admins}`)
      console.log(`👩‍⚕️ Therapists: ${stats.counts.therapists}`)
      console.log(`💆‍♀️ Services: ${stats.counts.services}`)
      console.log(`📅 Bookings: ${stats.counts.bookings}`)
      console.log(`💬 Feedback: ${stats.counts.feedback}`)
      console.log('═══════════════════════════════════')
      
      if (stats.status.isHealthy) {
        console.log('✅ Database is healthy and ready!')
        console.log(`\n🔗 Admin Login: ${baseUrl}/admin/masuk`)
        console.log('👤 Default Admin: admin / admin123')
        console.log(`\n🗄️ Database Manager: ${baseUrl}/admin/database-manager`)
      } else {
        console.log('⚠️  Database setup incomplete. Check the logs.')
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

setupDatabase()