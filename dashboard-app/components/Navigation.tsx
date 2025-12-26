'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, ShoppingCart, Plane, Phone, Home, TrendingUp } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Digital', href: '/digital', icon: TrendingUp },
  { name: 'Telco', href: '/telco', icon: Phone },
  { name: 'Airlines', href: '/airlines', icon: Plane },
  { name: 'Retail', href: '/retail', icon: ShoppingCart },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Data Analytics
            </span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
