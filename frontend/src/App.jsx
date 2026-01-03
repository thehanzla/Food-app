import { useState } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import NavBar from './components/NavBar.jsx'
import Home from './pages/home/Home.jsx'
import Login from './pages/auth/Login.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import { useAuth } from './context/AuthContext.jsx'
import RestaurantSignUp from './pages/auth/RestaurantSignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard.jsx';
import CreateDeal from './pages/restaurant/CreateDeal.jsx';
import DealsPage from './pages/deals/DealsPage.jsx';
import PublicMenu from './pages/PublicMenu';
import AIChat from './pages/ai/AIChat';
import AllRestaurants from './pages/restaurant/AllRestaurants';
import UserProfile from './pages/user/UserProfile';
import CreateMenuItem from './pages/restaurant/CreateMenuItem';
import AboutUs from './pages/AboutUs';
import ProtectedRoute from './components/ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC ROUTES */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/deals' element={<DealsPage />} />
        <Route path='/restaurants' element={<AllRestaurants />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path="/menu/:restaurantId" element={<PublicMenu />} />

        {/* PROTECTED ROUTES - ANY AUTHENTICATED USER */}
        <Route element={<ProtectedRoute />}>
          <Route path='/ai-chat' element={<AIChat />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path="/restaurant-signup" element={<RestaurantSignUp />} />
        </Route>

        {/* RESTAURANT ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['restaurant']} />}>
          <Route path="/dashboard" element={<RestaurantDashboard />} />
          <Route path="/create-deal" element={<CreateDeal />} />
          <Route path="/restaurant/menu/create" element={<CreateMenuItem />} />
          <Route path="/restaurant/menu/edit/:itemId" element={<CreateMenuItem />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

import Footer from './components/Footer';

// ... (other imports)

// ...

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app min-h-screen bg-[var(--bg-body)] text-[var(--text-main)] flex flex-col">
      {!location.pathname.startsWith('/menu/') && <NavBar />}
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      {!location.pathname.startsWith('/menu/') && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App