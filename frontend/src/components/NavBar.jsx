import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Utensils,
  LogOut,
  MessageSquare,
  Tag,
  Store,
  LayoutDashboard,
  Menu,
  X,
  User,
  ChevronDown,
  ShieldCheck
} from 'lucide-react'

const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Utensils },
    { path: '/restaurants', label: 'Restaurants', icon: Store },
    { path: '/deals', label: 'Deals', icon: Tag },
    { path: '/ai-chat', label: 'AI Assistant', icon: MessageSquare },
  ]

  // Dynamic Dashboard Link
  if (user?.role === 'restaurant') {
    navItems.push({ path: '/dashboard', label: 'Rest. Dashboard', icon: LayoutDashboard })
  } else if (user?.role === 'admin') {
    navItems.push({ path: '/admin/dashboard', label: 'Admin Panel', icon: ShieldCheck })
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${scrolled ? 'glass-strong py-2 shadow-lg' : 'bg-transparent py-4'
      }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`p-2 rounded-2xl shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 ${scrolled ? 'bg-brand' : 'bg-white'}`}>
              <Utensils className={`size-6 ${scrolled ? 'text-white' : 'text-brand'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold tracking-tight font-display leading-none ${scrolled ? 'text-stone-900' : 'text-stone-900 drop-shadow-sm'}`}>
                Foodie<span className="text-brand">AI</span>
              </span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Smart Dining</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border transition-all duration-300 ${scrolled ? 'bg-stone-100/50 border-stone-200' : 'bg-white/40 border-white/50 backdrop-blur-md shadow-sm'}`}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                    ? 'bg-white text-brand shadow-sm ring-1 ring-stone-100'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                    }`}
                >
                  <Icon size={16} className={isActive ? 'text-brand' : 'text-stone-400'} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* AUTH SECTION */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-3 pl-3 pr-2 py-1.5 border rounded-full transition-all group ${scrolled ? 'bg-white border-stone-200 hover:border-brand/30' : 'bg-white/60 border-white/50 backdrop-blur hover:bg-white'}`}
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-bold group-hover:text-brand transition-colors">{user?.role}</p>
                    <p className="text-sm font-bold text-stone-900 leading-none">{user?.fullName?.split(' ')[0]}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 overflow-hidden">
                    {user?.fullName ? (
                      <span className="text-brand font-bold text-lg">{user.fullName[0]}</span>
                    ) : <User className="text-stone-400" />}
                  </div>
                  <ChevronDown size={16} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
                </button>

                {/* Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                    <div className="px-4 py-4 border-b border-stone-100 mb-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                          <span className="text-brand font-bold">{user?.fullName?.[0]}</span>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-stone-900 font-bold text-sm truncate">{user?.fullName}</p>
                          <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 rounded-xl transition-colors mb-1 group" onClick={() => setShowProfileMenu(false)}>
                      <div className="p-2 bg-stone-100 rounded-lg group-hover:bg-brand/10 group-hover:text-brand text-stone-500 transition-colors">
                        <User size={18} />
                      </div>
                      My Profile
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors group">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 text-red-500 transition-colors">
                        <LogOut size={18} />
                      </div>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary shadow-lg shadow-brand/20 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BTN */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 bg-stone-100/50 backdrop-blur rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-100 p-4 flex flex-col gap-2 shadow-xl animate-in slide-in-from-top-5 min-h-[50vh]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-4 rounded-xl text-base font-bold ${location.pathname === item.path ? 'bg-brand/10 text-brand' : 'text-stone-600 hover:bg-stone-50'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-stone-100"></div>
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link to="/login" className="flex justify-center p-3 rounded-xl bg-stone-100 text-stone-900 font-bold">Login</Link>
                <Link to="/register" className="flex justify-center p-3 rounded-xl bg-brand text-white font-bold shadow-lg shadow-brand/20">Sign Up</Link>
              </div>
            )}
            {isAuthenticated && (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-xl text-base font-medium text-stone-600 hover:bg-stone-50">
                  <User size={20} /> My Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-600 mt-2 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut size={20} /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavBar