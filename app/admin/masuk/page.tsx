'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LoginForm {
  username: string
  password: string
}

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error, {
          duration: 4000,
        })
      } else {
        toast.success('Login berhasil! Selamat datang kembali.', {
          duration: 3000,
        })
        
        const session = await getSession()
        if (session) {
          router.push('/admin')
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
      reset()
    }
  }

  return (
    <div className="min-h-screen salon-gradient-bg salon-pattern flex items-center justify-center p-4">
      {/* Islamic Greeting */}
      <div className="absolute top-8 left-0 right-0">
        <div className="bismillah-elegant">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="font-kalam text-lg text-salon-islamic mb-4">
              Assalamu&apos;alaikum wa rahmatullahi wa barakatuh
            </p>
          </motion.div>

          <h1 className="salon-header-lg mb-2">
            Salon Muslimah Dina
          </h1>
          <p className="font-dancing text-2xl text-salon-primary mb-6">
            Portal Admin
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          className="salon-card p-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="salon-header-md text-salon-text mb-2">
                Masuk Admin
              </h2>
              <p className="font-inter text-salon-text-muted">
                Silakan masuk untuk mengakses dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="salon-form-group">
                <label htmlFor="username" className="salon-label">
                  Nama Pengguna
                </label>
                <input
                  {...register('username', {
                    required: 'Nama pengguna wajib diisi',
                    minLength: {
                      value: 3,
                      message: 'Nama pengguna minimal 3 karakter'
                    }
                  })}
                  type="text"
                  id="username"
                  placeholder="Masukkan nama pengguna"
                  className="salon-input"
                  disabled={isLoading}
                />
                {errors.username && (
                  <motion.p
                    className="salon-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </div>

              <div className="salon-form-group">
                <label htmlFor="password" className="salon-label">
                  Kata Sandi
                </label>
                <input
                  {...register('password', {
                    required: 'Kata sandi wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Kata sandi minimal 6 karakter'
                    }
                  })}
                  type="password"
                  id="password"
                  placeholder="Masukkan kata sandi"
                  className="salon-input"
                  disabled={isLoading}
                />
                {errors.password && (
                  <motion.p
                    className="salon-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-3">
                    <div className="salon-skeleton w-8 h-8 rounded-full mr-3"></div>
                    <span className="font-inter text-salon-text">Memproses login...</span>
                  </div>
                ) : (
                  <motion.button
                    type="submit"
                    className="salon-button-primary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Masuk ke Dashboard
                  </motion.button>
                )}
              </div>
            </form>

            <div className="salon-divider"></div>
            
            <div className="text-center">
              <p className="font-inter text-sm text-salon-text-muted">
                Salon Muslimah Dina - Kecantikan Islami untuk Wanita Muslimah
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="font-dancing text-salon-islamic text-lg">
            &ldquo;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu 
            isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya&rdquo;
          </p>
          <p className="font-inter text-salon-text-muted text-sm mt-2">
            - QS. Ar-Rum: 21
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 pointer-events-none">
        <motion.div
          className="text-salon-primary text-3xl opacity-20"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          🌸
        </motion.div>
      </div>

      <div className="fixed bottom-10 left-10 pointer-events-none">
        <motion.div
          className="text-salon-islamic text-xl opacity-20"
          animate={{ 
            y: [-5, 5, -5],
            x: [-2, 2, -2]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        >
          ☪️
        </motion.div>
      </div>
    </div>
  )
}