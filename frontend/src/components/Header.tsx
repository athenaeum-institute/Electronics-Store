import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Menu, X, LogOut, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal';
import SearchPanel from './SearchPanel';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAdmin, cart, setUser, setIsAdmin } = useStore();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (currentUser: any) => {
    if (!currentUser?.id) {
      setIsAdmin(false);
      return;
    }

    if (currentUser.email === 'allirajput23@gmail.com') {
      setIsAdmin(true);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', currentUser.id)
      .single();
    setIsAdmin(data ? (data as any).is_admin : false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    setIsProfileDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Cart', path: '/checkout' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-white text-xs sm:text-sm font-medium py-2.5 text-center tracking-wide flex justify-center items-center w-full relative z-[60]">
        <span className="mr-2 text-base leading-none">🔥</span> Summer Sale: Special Discounts on Haier DC Inverter ACs
      </div>

      <nav className={`fixed left-0 right-0 w-full z-50 bg-white/20 backdrop-blur-2xl backdrop-saturate-200 border-b border-white/40 transition-all duration-300 ${scrolled ? 'top-0 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)]' : 'top-[36px] sm:top-[40px] py-5'}`}>
        <div className="w-full flex justify-between items-center px-6 md:px-12">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-900 active:scale-95 transition-transform"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="font-bold text-xl md:text-2xl tracking-tight text-neutral-900 mx-auto md:mx-0">
            Ali Electronics
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.name}
                to={link.path}
                className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchPanelOpen(true)}
              className="scale-95 hover:scale-100 active:scale-90 transition-all text-neutral-600 hover:text-neutral-900"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link to="/checkout" className="scale-95 hover:scale-100 active:scale-90 transition-all relative text-neutral-600 hover:text-neutral-900">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Auth / Dropdown */}
            {user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-neutral-100 mb-2">
                      <p className="text-xs text-neutral-500 font-medium truncate">{user.email}</p>
                    </div>
                    
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-left">
                      <Package className="w-4 h-4" /> My Orders
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:flex bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-[300px] bg-white shadow-2xl md:hidden transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <span className="font-bold text-xl text-neutral-900">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link 
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-semibold text-neutral-600 hover:text-neutral-900 py-3 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-neutral-900 truncate">My Account</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                </div>
              </div>
              
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-semibold text-neutral-700 hover:text-primary transition-colors">
                  <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <button className="flex items-center gap-3 py-2 text-sm font-semibold text-neutral-700 hover:text-primary transition-colors text-left w-full">
                <Package className="w-4 h-4" /> My Orders
              </button>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 py-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors text-left w-full mt-2 border-t border-neutral-200/60 pt-4">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full bg-neutral-900 text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20"
            >
              <User className="w-4 h-4" /> Log in / Sign up
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Search Panel */}
      <SearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} />
    </>
  );
}
