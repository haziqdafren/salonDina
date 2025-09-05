import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // Higher security
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 * @param password - Plain text password
 * @param hash - Stored password hash
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 16)
 * @returns string - Secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  
  return password
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns object - Validation result with requirements
 */
export function validatePasswordStrength(password: string) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password)
  
  const requirements = {
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
  
  const isValid = Object.values(requirements).every(req => req)
  
  return {
    isValid,
    requirements,
    score: Object.values(requirements).filter(Boolean).length,
    suggestions: [
      !requirements.minLength && `At least ${minLength} characters`,
      !requirements.hasUpperCase && 'One uppercase letter',
      !requirements.hasLowerCase && 'One lowercase letter',
      !requirements.hasNumbers && 'One number',
      !requirements.hasSpecialChar && 'One special character'
    ].filter(Boolean)
  }
}