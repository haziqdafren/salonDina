// Performance optimization specifically for Indonesian internet infrastructure
// Targeting mobile-first usage patterns and varying connection speeds

export interface IndonesianNetworkConditions {
  connectionType: '4G' | '3G' | '2G' | 'wifi'
  estimatedSpeed: 'fast' | 'moderate' | 'slow'
  region: 'medan' | 'jakarta' | 'other_indonesia'
}

export interface OptimizationConfig {
  imageQuality: number
  enableLazyLoading: boolean
  prefetchCritical: boolean
  useWebP: boolean
  compressionLevel: 'high' | 'medium' | 'low'
  offlineCapabilities: boolean
}

// Indonesian mobile usage patterns (primary device for salon bookings)
export const INDONESIA_MOBILE_STATS = {
  mobileUsagePercentage: 85, // High mobile usage in Indonesia
  averageConnectionSpeed: '15Mbps', // 4G average in major cities
  peakUsageHours: ['19:00-22:00', '12:00-14:00'], // Evening and lunch time
  popularDevices: ['Samsung', 'Oppo', 'Vivo', 'Xiaomi'],
  operatingSystem: { android: 78, ios: 22 }
}

/**
 * Detect user's network conditions for adaptive loading
 */
export function detectNetworkConditions(): IndonesianNetworkConditions {
  // Check if running in browser
  if (typeof navigator === 'undefined') {
    return {
      connectionType: '4G',
      estimatedSpeed: 'moderate',
      region: 'medan'
    }
  }

  // Use Network Information API if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (connection) {
    const effectiveType = connection.effectiveType
    const downlink = connection.downlink

    let connectionType: '4G' | '3G' | '2G' | 'wifi' = '4G'
    let estimatedSpeed: 'fast' | 'moderate' | 'slow' = 'moderate'

    // Map connection types
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        connectionType = '2G'
        estimatedSpeed = 'slow'
        break
      case '3g':
        connectionType = '3G' 
        estimatedSpeed = 'moderate'
        break
      case '4g':
        connectionType = '4G'
        estimatedSpeed = downlink > 10 ? 'fast' : 'moderate'
        break
      default:
        connectionType = 'wifi'
        estimatedSpeed = 'fast'
    }

    return {
      connectionType,
      estimatedSpeed,
      region: 'medan' // Default to Medan for our primary market
    }
  }

  // Fallback detection based on user agent and timing
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return {
    connectionType: isMobile ? '4G' : 'wifi',
    estimatedSpeed: 'moderate',
    region: 'medan'
  }
}

/**
 * Get optimization configuration based on network conditions
 */
export function getOptimizationConfig(conditions: IndonesianNetworkConditions): OptimizationConfig {
  const baseConfig: OptimizationConfig = {
    imageQuality: 80,
    enableLazyLoading: true,
    prefetchCritical: true,
    useWebP: true,
    compressionLevel: 'medium',
    offlineCapabilities: true
  }

  // Adjust based on connection speed
  switch (conditions.estimatedSpeed) {
    case 'slow':
      return {
        ...baseConfig,
        imageQuality: 60,
        compressionLevel: 'high',
        prefetchCritical: false,
        useWebP: true // WebP has better compression
      }
    
    case 'moderate':
      return {
        ...baseConfig,
        imageQuality: 75,
        compressionLevel: 'medium'
      }
    
    case 'fast':
      return {
        ...baseConfig,
        imageQuality: 90,
        compressionLevel: 'low',
        prefetchCritical: true
      }
    
    default:
      return baseConfig
  }
}

/**
 * Image optimization for Indonesian mobile users
 */
export function optimizeImageForIndonesia(
  src: string, 
  conditions: IndonesianNetworkConditions,
  options: {
    width?: number
    height?: number
    alt: string
    priority?: boolean
  }
) {
  const config = getOptimizationConfig(conditions)
  
  // Generate optimized image URL (would integrate with image CDN)
  const optimizedSrc = generateOptimizedImageUrl(src, {
    quality: config.imageQuality,
    format: config.useWebP ? 'webp' : 'jpg',
    width: options.width,
    height: options.height
  })

  return {
    src: optimizedSrc,
    alt: options.alt,
    loading: options.priority ? 'eager' : 'lazy',
    decoding: 'async',
    // Add Indonesian mobile-optimized attributes
    style: {
      maxWidth: '100%',
      height: 'auto',
      objectFit: 'cover' as const
    }
  }
}

/**
 * Generate optimized image URL (placeholder implementation)
 */
function generateOptimizedImageUrl(
  src: string, 
  options: {
    quality: number
    format: string
    width?: number
    height?: number
  }
): string {
  // This would integrate with a CDN like Cloudinary, ImageKit, or AWS CloudFront
  // For now, return the original src with query parameters
  const params = new URLSearchParams()
  params.set('q', options.quality.toString())
  params.set('f', options.format)
  
  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  
  return `${src}?${params.toString()}`
}

/**
 * Lazy loading configuration for Indonesian mobile patterns
 */
export const INDONESIA_LAZY_LOADING_CONFIG = {
  // Load images when they're close to viewport (accounting for mobile scrolling speed)
  rootMargin: '50px 0px 100px 0px',
  
  // Indonesian users tend to scroll quickly on mobile
  threshold: [0, 0.1, 0.5],
  
  // Prioritize above-the-fold content
  prioritySelectors: [
    '.hero-image',
    '.logo',
    '.service-highlight',
    '.prayer-time-widget'
  ]
}

/**
 * Service Worker configuration for offline capabilities
 * Important for areas with inconsistent internet in Indonesia
 */
export const INDONESIA_OFFLINE_CONFIG = {
  // Cache critical pages
  staticAssets: [
    '/',
    '/globals.css',
    '/logo.jpeg',
    '/manifest.json'
  ],
  
  // Cache API responses for booking system
  apiCacheDuration: 5 * 60 * 1000, // 5 minutes
  
  // Cache images for offline viewing
  imageCacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  
  // Essential features that work offline
  offlineFeatures: [
    'view_services',
    'view_prices', 
    'view_contact_info',
    'view_business_hours'
  ]
}

/**
 * Critical resource hints for Indonesian CDN optimization
 */
export function generateIndonesiaCDNHints() {
  return [
    // Preconnect to Indonesian CDN nodes
    { rel: 'preconnect', href: 'https://cdn.jakarta.example.com' },
    { rel: 'preconnect', href: 'https://cdn.singapore.example.com' },
    
    // DNS prefetch for common Indonesian services
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://api.whatsapp.com' },
    
    // Prefetch critical resources
    { rel: 'prefetch', href: '/api/prayer-times' },
    { rel: 'prefetch', href: '/api/business-hours' }
  ]
}

/**
 * Bundle splitting strategy for Indonesian mobile users
 */
export const INDONESIA_BUNDLE_STRATEGY = {
  // Prioritize essential features first
  critical: [
    'business-hours',
    'contact-info', 
    'prayer-times',
    'basic-booking'
  ],
  
  // Load on interaction
  secondary: [
    'advanced-booking',
    'payment-methods',
    'service-details'
  ],
  
  // Load on route change
  nonCritical: [
    'admin-features',
    'analytics',
    'marketing-widgets'
  ]
}

/**
 * Performance monitoring specifically for Indonesian users
 */
export function trackIndonesianPerformance() {
  if (typeof window === 'undefined') return

  // Track Core Web Vitals with Indonesian context
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const conditions = detectNetworkConditions()
      
      // Send metrics with Indonesian context
      const metrics = {
        name: entry.name,
        value: (entry as any).value || (entry as any).processingStart || entry.duration,
        networkConditions: conditions,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        region: 'indonesia-medan'
      }
      
      // Log or send to analytics (implement based on your analytics solution)
      console.log('Indonesian Performance Metric:', metrics)
    })
  })

  // Observe Core Web Vitals
  observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
}

/**
 * Adaptive loading for Indonesian mobile users
 */
export class IndonesianAdaptiveLoader {
  private conditions: IndonesianNetworkConditions
  private config: OptimizationConfig

  constructor() {
    this.conditions = detectNetworkConditions()
    this.config = getOptimizationConfig(this.conditions)
  }

  /**
   * Load component based on network conditions
   */
  async loadComponent(componentName: string): Promise<any> {
    // Implement dynamic imports based on network speed
    if (this.conditions.estimatedSpeed === 'slow') {
      // Load minimal version
      return import(`../components/minimal/${componentName}`)
    } else {
      // Load full version
      return import(`../components/full/${componentName}`)
    }
  }

  /**
   * Preload critical resources for Indonesian users
   */
  preloadCriticalResources() {
    if (this.config.prefetchCritical) {
      // Preload essential API endpoints
      fetch('/api/business-hours').catch(() => {})
      fetch('/api/prayer-times').catch(() => {})
      
      // Preload critical images
      const criticalImages = ['/logo.jpeg']
      criticalImages.forEach(src => {
        const img = new Image()
        img.src = src
      })
    }
  }
}

/**
 * Initialize Indonesian performance optimizations
 */
export function initializeIndonesianOptimizations() {
  if (typeof window === 'undefined') return

  // Start performance tracking
  trackIndonesianPerformance()
  
  // Initialize adaptive loader
  const adaptiveLoader = new IndonesianAdaptiveLoader()
  adaptiveLoader.preloadCriticalResources()
  
  // Register service worker for offline capabilities
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Indonesian SW registered:', registration)
      })
      .catch(error => {
        console.log('Indonesian SW registration failed:', error)
      })
  }
  
  return adaptiveLoader
}