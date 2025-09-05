import { supabase, isSupabaseConfigured } from './supabase'
import { hashPassword } from './auth-utils'

interface AdminUser {
  username: string
  password: string
  name: string
  email?: string
  role?: string
}

/**
 * Create admin users in the database with hashed passwords
 * @param adminUsers - Array of admin user data
 * @returns Promise<boolean> - Success status
 */
export async function seedAdminUsers(adminUsers: AdminUser[]): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase not configured')
    return false
  }

  try {
    console.log('🌱 Starting admin user seeding...')

    for (const admin of adminUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('Admin')
        .select('username')
        .eq('username', admin.username)
        .limit(1)

      if (existingUser && existingUser.length > 0) {
        console.log(`⚠️  Admin user '${admin.username}' already exists, skipping...`)
        continue
      }

      // Hash the password
      const passwordHash = await hashPassword(admin.password)

      // Insert new admin user
      const { error } = await supabase
        .from('Admin')
        .insert({
          username: admin.username,
          password: passwordHash,
          name: admin.name
        })

      if (error) {
        console.error(`❌ Failed to create admin user '${admin.username}':`, error)
        return false
      }

      console.log(`✅ Created admin user: ${admin.username}`)
    }

    console.log('🎉 Admin user seeding completed successfully!')
    return true

  } catch (error) {
    console.error('❌ Error seeding admin users:', error)
    return false
  }
}

/**
 * Create default admin users for Salon Muslimah Dina
 */
export async function createDefaultAdmins(): Promise<boolean> {
  const defaultAdmins: AdminUser[] = [
    {
      username: 'admin',
      password: 'SalonDina2024!',
      name: 'Administrator',
      email: 'admin@salondina.com',
      role: 'admin'
    },
    {
      username: 'admin_dina',
      password: 'DinaAdmin123!',
      name: 'Dina Admin',
      email: 'dina@salondina.com',
      role: 'admin'
    },
    {
      username: 'super_admin',
      password: 'SuperDina2024!',
      name: 'Super Administrator',
      email: 'superadmin@salondina.com',
      role: 'super_admin'
    }
  ]

  return await seedAdminUsers(defaultAdmins)
}

/**
 * Check if admin table exists and create it if needed
 */
export async function ensureAdminTable(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase not configured')
    return false
  }

  try {
    // Try to query the Admin table
    const { error } = await supabase
      .from('Admin')
      .select('id')
      .limit(1)

    if (error) {
      console.log('⚠️  Admins table might not exist. Please run the database setup SQL.')
      return false
    }

    console.log('✅ Admin table exists')
    return true

  } catch (error) {
    console.error('❌ Error checking admin table:', error)
    return false
  }
}

/**
 * Update admin password
 * @param username - Admin username
 * @param newPassword - New password
 * @returns Promise<boolean> - Success status
 */
export async function updateAdminPassword(username: string, newPassword: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase not configured')
    return false
  }

  try {
    const passwordHash = await hashPassword(newPassword)
    
    const { error } = await supabase
      .from('Admin')
      .update({ 
        password: passwordHash,
        updatedAt: new Date().toISOString()
      })
      .eq('username', username)

    if (error) {
      console.error(`❌ Failed to update password for '${username}':`, error)
      return false
    }

    console.log(`✅ Password updated for admin: ${username}`)
    return true

  } catch (error) {
    console.error('❌ Error updating admin password:', error)
    return false
  }
}