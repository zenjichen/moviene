
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Heart, Clock, Film, Tv, Star, Clapperboard, User, Phone, Play, Filter, Loader2, Zap, Library, ChevronRight, Sparkles, LayoutGrid, ChevronUp, Mail, Send, ShieldCheck, FileText, Info as InfoIcon } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { Movie } from '../types';
import { storage } from '../utils/storage';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Badge counts
  const [favCount, setFavCount] = useState(0);
  const [histCount, setHistCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSuggestions(false);
    
    // Update badge counts on location change
    setFavCount(storage.getFavorites().length);
    setHistCount(Object.keys(storage.getHistory()).length);
  }, [location]);

  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchMovies(query, 6);
      const items = res.data?.items || res.items || [];
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
      navigate(`/tim-kiem?k=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeSearchMenus = () => {
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  // Improved navigation for suggestions to prevent focus issues
  const navigateTo = (path: string) => {
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
      navigate(path);
  };

  const navLinks = [
    { name: 'Phim Bộ', path: '/danh-sach/phim-bo', icon: Tv, color: 'text-blue-400' },
    { name: 'Phim Lẻ', path: '/danh-sach/phim-le', icon: Film, color: 'text-indigo-400' },
    { name: 'Hoạt Hình', path: '/danh-sach/hoat-hinh', icon: Library, color: 'text-emerald-400' },
    { name: 'Phim Mới', path: '/danh-sach/phim-moi', icon: Sparkles, color: 'text-yellow-400' },
  ];

  const personalLinks = [
    { name: 'Yêu Thích', path: '/yeu-thich', icon: Heart, bg: 'bg-rose-500/10 border-rose-500/30', activeBg: 'bg-rose-600', textColor: 'text-rose-400', count: favCount },
    { name: 'Lịch Sử', path: '/lich-su', icon: Clock, bg: 'bg-amber-500/10 border-amber-500/30', activeBg: 'bg-amber-600', textColor: 'text-amber-400', count: histCount },
  ];

  const headerBgClass = isMobileMenuOpen 
    ? 'bg-slate-950' 
    : (isScrolled ? 'bg-slate-950/95 shadow-2xl border-b border-white/5 backdrop-blur-xl' : 'bg-gradient-to-b from-slate-950/90 to-transparent');

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group z-50" onClick={closeSearchMenus}>
          <div className="p-1.5 bg-indigo-600 rounded-lg group-hover:rotate-6 transition-transform">
            <Clapperboard size={24} className="text-white" />
          </div>
          <span className="font-black italic tracking-[-0.075em] text-2xl uppercase text-white">
              HÀ<span className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]">MOVIE</span><span className="text-slate-300 text-lg ml-1">HOUSE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/40 p-1 rounded-full border border-white/5 backdrop-blur-md">
            {[...navLinks, ...personalLinks].map((link) => (
               <Link 
                key={link.path} 
                to={link.path} 
                className={`h-10 px-4 lg:px-5 flex items-center justify-center gap-2 rounded-full text-sm font-bold transition-all ${
                  location.pathname === link.path 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
               >
                 <span>{link.name}</span>
                 {'count' in link && link.count > 0 && (
                   <span className={`px-1.5 py-0.5 min-w-[1.25rem] text-center rounded-full text-[10px] font-black ${location.pathname === link.path ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white'}`}>
                     {link.count}
                   </span>
                 )}
               </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative group mb-0">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm phim..." 
                    className="h-10 bg-black/40 border border-slate-700/50 text-slate-100 text-sm rounded-full pl-10 pr-4 w-44 lg:w-56 focus:w-72 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300 placeholder:text-slate-500 backdrop-blur-md mb-0"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => searchQuery.length >= 2 && fetchSuggestions(searchQuery)}
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  {isSearching ? <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full"></div> : <Search size={16} className="text-slate-500" />}
                </div>
                
                {showSuggestions && (
                  <div className="absolute top-full mt-3 left-0 right-0 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden min-w-[320px] animate-in fade-in slide-in-from-top-2 z-[110]">
                    <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gợi ý kết quả</span>
                        <button 
                            onMouseDown={() => navigateTo(`/tim-kiem?k=${encodeURIComponent(searchQuery.trim())}`)}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Xem tất cả
                        </button>
                    </div>
                    {suggestions.map((movie) => (
                      <button 
                        key={movie._id} 
                        onMouseDown={() => navigateTo(`/phim/${movie.slug}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-indigo-600/10 group transition-all border-b border-slate-800/30 last:border-0 text-left"
                      >
                        <img src={getImageUrl(movie.thumb_url)} alt={movie.name} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 truncate">{movie.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{movie.year}</p>
                        </div>
                        <Play size={14} className="text-indigo-500 opacity-0 group-hover:opacity-100" fill="currentColor" />
                      </button>
                    ))}
                  </div>
                )}
            </form>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className={`md:hidden flex items-center justify-center transition-all p-2 ${isMobileMenuOpen ? 'text-indigo-500 scale-110' : 'text-slate-300 hover:text-white'}`}
            >
                {isMobileMenuOpen ? <X size={26} /> : <LayoutGrid size={26} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-x-0 top-16 bottom-0 bg-slate-950 z-[90] md:hidden overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-6 flex flex-col gap-8 pb-12">
                  {/* Search Section */}
                  <div className="relative">
                      <form onSubmit={handleSearch} className="relative group mb-0">
                          <input 
                              type="text" 
                              placeholder="Nhập tên phim bạn muốn tìm..." 
                              className="relative w-full h-14 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder:text-slate-500 mb-0"
                              value={searchQuery}
                              onChange={handleInputChange}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                             {isSearching ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full"></div> : <Search size={20} />}
                          </div>
                      </form>

                      {/* Mobile Search Suggestions */}
                      {showSuggestions && searchQuery.length >= 2 && (
                          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                             <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gợi ý kết quả</span>
                                <button 
                                    onMouseDown={() => navigateTo(`/tim-kiem?k=${encodeURIComponent(searchQuery.trim())}`)}
                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Xem tất cả
                                </button>
                             </div>
                             {suggestions.map(movie => (
                                <button 
                                    key={movie._id} 
                                    onMouseDown={() => navigateTo(`/phim/${movie.slug}`)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 text-left"
                                >
                                    <img src={getImageUrl(movie.thumb_url)} className="w-12 h-16 object-cover rounded-lg shadow-md" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{movie.name}</p>
                                        <p className="text-xs text-slate-500">{movie.year}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600" />
                                </button>
                             ))}
                          </div>
                      )}
                  </div>

                  {/* Navigation Section */}
                  <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Khám phá</h3>
                      <div className="grid grid-cols-2 gap-3">
                          {navLinks.map(link => (
                              <Link 
                                key={link.path} 
                                to={link.path} 
                                className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[2rem] border transition-all duration-300 ${
                                    location.pathname === link.path 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' 
                                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                  <div className={`p-3 rounded-2xl ${location.pathname === link.path ? 'bg-white/20' : 'bg-slate-800'}`}>
                                      <link.icon size={24} className={location.pathname === link.path ? 'text-white' : link.color} />
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-wider">{link.name}</span>
                              </Link>
                          ))}
                      </div>
                  </div>

                  {/* Personal Section */}
                  <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Cá nhân</h3>
                      <div className="grid grid-cols-2 gap-3">
                          {personalLinks.map(link => (
                              <Link 
                                key={link.path} 
                                to={link.path} 
                                className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[2rem] border transition-all duration-300 ${
                                    location.pathname === link.path 
                                    ? `${link.activeBg} border-transparent text-white shadow-xl` 
                                    : `${link.bg} text-slate-300 hover:brightness-125`
                                }`}
                              >
                                  <div className="relative">
                                      <div className={`p-3 rounded-2xl ${location.pathname === link.path ? 'bg-white/20' : 'bg-slate-900/50'}`}>
                                          <link.icon size={24} className={location.pathname === link.path ? 'text-white' : link.textColor} />
                                      </div>
                                      {link.count > 0 && (
                                        <span className={`absolute -top-1.5 -right-1.5 min-w-[1.5rem] h-6 flex items-center justify-center rounded-full text-[10px] font-black border-2 ${
                                            location.pathname === link.path 
                                            ? 'bg-white text-slate-900 border-indigo-600' 
                                            : 'bg-indigo-600 text-white border-slate-900'
                                        } shadow-lg`}>
                                            {link.count}
                                        </span>
                                      )}
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-wider">{link.name}</span>
                              </Link>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        </>
      )}
    </header>
  );
};

export const Footer = () => (
  <footer className="bg-slate-950 pt-16 pb-12 border-t border-slate-900 relative z-10 overflow-hidden">
    {/* Background Glow */}
    <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full h-64 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
    
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        {/* Column 1: Brand */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-6 transition-transform">
              <Clapperboard size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-[-0.075em] uppercase text-white">
              HÀ<span className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">MOVIE</span><span className="text-slate-300 text-lg ml-1">HOUSE</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Nền tảng xem phim trực tuyến hàng đầu Việt Nam. Chất lượng cao, trải nghiệm mượt mà, nội dung cập nhật liên tục 24/7.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/NguyenManhHaOfficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all hover:-translate-y-1 text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Facebook
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Hub (Combined Explore & Categories) */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Khám Phá</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Phim Mới', path: '/danh-sach/phim-moi' },
                  { name: 'Phim Lẻ', path: '/danh-sach/phim-le' },
                  { name: 'Phim Bộ', path: '/danh-sach/phim-bo' },
                  { name: 'Hoạt Hình', path: '/danh-sach/hoat-hinh' }
                ].map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-slate-500 hover:text-indigo-400 text-sm transition-colors flex items-center gap-2 group">
                      <div className="w-1 h-1 bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Danh Mục</h4>
              <ul className="space-y-3">
                {[
                  { name: 'TV Shows', path: '/danh-sach/tv-shows' },
                  { name: 'Hành Động', path: '/danh-sach/phim-le?genre=hanh-dong' },
                  { name: 'Cổ Trang', path: '/danh-sach/phim-bo?genre=co-trang' },
                  { name: 'Yêu Thích', path: '/yeu-thich' }
                ].map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-slate-500 hover:text-indigo-400 text-sm transition-colors flex items-center gap-2 group">
                      <div className="w-1 h-1 bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} <span className="text-slate-500">HÀ MOVIE HOUSE</span>. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              Liên hệ: <a href="https://www.facebook.com/NguyenManhHaOfficial" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">facebook.com/NguyenManhHaOfficial</a>
            </p>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">Made with ❤️ for Movie Lovers</p>
        </div>
      </div>
    </div>
  </footer>
);

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-[80] p-3 rounded-full bg-slate-900/40 backdrop-blur-md text-indigo-500 border border-white/5 opacity-30 active:opacity-100 transition-all duration-300 shadow-2xl"
      aria-label="Scroll to top"
    >
      <ChevronUp size={24} />
    </button>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 font-sans">
            <Header />
            <main className={`flex-1 w-full ${isHomePage ? '' : 'pt-20 md:pt-24 px-4 max-w-7xl mx-auto'}`}>
                {children}
            </main>
            <Footer />
            <ScrollToTop />
        </div>
    );
};
