import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple mock data - always works
  const mockServices = [
    { 
      id: 1, 
      name: 'Facial Acne', 
      category: 'facial', 
      price: 35000, 
      duration: 60, 
      description: 'Perawatan wajah untuk kulit berjerawat', 
      therapistFee: 15000, 
      isActive: true 
    },
    { 
      id: 2, 
      name: 'Facial Brightening', 
      category: 'facial', 
      price: 40000, 
      duration: 60, 
      description: 'Facial pencerah wajah alami', 
      therapistFee: 15000, 
      isActive: true 
    },
    { 
      id: 3, 
      name: 'Facial Anti Aging', 
      category: 'facial', 
      price: 50000, 
      duration: 75, 
      description: 'Perawatan anti penuaan dini', 
      therapistFee: 20000, 
      isActive: true 
    },
    { 
      id: 4, 
      name: 'Hair Spa Creambath', 
      category: 'hair_spa', 
      price: 25000, 
      duration: 45, 
      description: 'Creambath dengan vitamin rambut', 
      therapistFee: 10000, 
      isActive: true 
    },
    { 
      id: 5, 
      name: 'Hair Spa Protein', 
      category: 'hair_spa', 
      price: 35000, 
      duration: 60, 
      description: 'Perawatan protein untuk rambut rusak', 
      therapistFee: 15000, 
      isActive: true 
    },
    { 
      id: 6, 
      name: 'Hair Spa Smoothing', 
      category: 'hair_spa', 
      price: 150000, 
      duration: 120, 
      description: 'Perawatan pelurus rambut alami', 
      therapistFee: 50000, 
      isActive: true 
    },
    { 
      id: 7, 
      name: 'Full Body Massage', 
      category: 'body_treatment', 
      price: 60000, 
      duration: 90, 
      description: 'Pijat seluruh tubuh relaksasi', 
      therapistFee: 25000, 
      isActive: true 
    },
    { 
      id: 8, 
      name: 'Aromatherapy Massage', 
      category: 'body_treatment', 
      price: 70000, 
      duration: 90, 
      description: 'Pijat aromaterapi dengan essential oil', 
      therapistFee: 30000, 
      isActive: true 
    },
    { 
      id: 9, 
      name: 'Body Scrub', 
      category: 'body_treatment', 
      price: 50000, 
      duration: 60, 
      description: 'Lulur seluruh tubuh', 
      therapistFee: 20000, 
      isActive: true 
    }
  ]
  
  const mockCategories = [
    { name: 'facial', count: 3 },
    { name: 'hair_spa', count: 3 },
    { name: 'body_treatment', count: 3 }
  ]
  
  return res.status(200).json({
    success: true,
    data: mockServices,
    categories: mockCategories,
    total: mockServices.length,
    message: 'Simple API working perfectly!'
  })
}