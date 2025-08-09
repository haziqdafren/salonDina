const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Username: admin')
      console.log('Password: admin123')
      return
    }
    
    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator Salon Muslimah Dina'
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('📋 Login credentials:')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('🔗 Login URL: http://localhost:3000/admin/masuk')
    console.log('')
    console.log('After login, you can access the dashboard at: http://localhost:3000/admin/dashboard')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()