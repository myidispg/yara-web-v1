import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Heart, Search, User, Sparkles, ShieldCheck, Truck, RefreshCw, 
  ChevronRight, ChevronDown, Filter, X, Check, Star, MapPin, Calendar, 
  CreditCard, Phone, ArrowRight, Award, Info, Lock, Eye, Menu, SlidersHorizontal, 
  Sliders, ArrowUpRight, Zap
} from 'lucide-react';

// Custom Google Font Styles injection for luxury typography and cursive script accents
const TypographyStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;1,400;1,600&display=swap');

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #FAFAF8;
      color: #1A2536;
    }

    .font-serif-luxury {
      font-family: 'Cormorant Garamond', serif;
    }

    .font-cursive {
      font-family: 'Alex Brush', cursive;
    }

    .font-serif-italic {
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    /* Beyon Organic Shapes */
    .shape-arch {
      border-top-left-radius: 120px;
      border-top-right-radius: 120px;
      border-bottom-left-radius: 24px;
      border-bottom-right-radius: 24px;
    }

    .shape-organic-1 {
      border-top-left-radius: 80px;
      border-top-right-radius: 24px;
      border-bottom-right-radius: 80px;
      border-bottom-left-radius: 24px;
    }

    .shape-organic-2 {
      border-top-left-radius: 32px;
      border-top-right-radius: 90px;
      border-bottom-right-radius: 32px;
      border-bottom-left-radius: 90px;
    }

    /* Apple Liquid Glass Styling */
    .glass-card {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 20px 40px -15px rgba(26, 37, 54, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    .glass-card-dark {
      background: rgba(26, 37, 54, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
    }

    .glass-pill {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(229, 189, 176, 0.4);
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #F1F1F0;
    }
    ::-webkit-scrollbar-thumb {
      background: #D4AF37;
      border-radius: 10px;
    }
  `}</style>
);

// Mock Products Database with CaratLane style specifications
const MOCK_PRODUCTS = [
  {
    id: 'yara-01',
    name: 'Luminary Solitaire Band Ring',
    category: 'Rings',
    price14k: 42500,
    price18k: 49800,
    metalOptions: ['Yellow Gold', 'Rose Gold', 'White Gold'],
    diamondWeight: '0.35 Carat',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 2.8,
    goldWeight18k: 3.2,
    makingCharge: 4500,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
    isNew: true,
    bestseller: true,
    rating: 4.9,
    reviews: 42,
    deliveryDays: '3-4 Days'
  },
  {
    id: 'yara-02',
    name: 'Serenade Curved Diamond Necklace',
    category: 'Necklaces',
    price14k: 84900,
    price18k: 97500,
    metalOptions: ['Rose Gold', 'Yellow Gold'],
    diamondWeight: '0.68 Carat',
    diamondClarity: 'VVS-GH Natural',
    goldWeight14k: 4.6,
    goldWeight18k: 5.3,
    makingCharge: 8200,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    isNew: false,
    bestseller: true,
    rating: 5.0,
    reviews: 68,
    deliveryDays: '2 Days (Express)'
  },
  {
    id: 'yara-03',
    name: 'Aura Halo Stud Diamond Earrings',
    category: 'Earrings',
    price14k: 58200,
    price18k: 66400,
    metalOptions: ['White Gold', 'Yellow Gold'],
    diamondWeight: '0.45 Carat',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 3.1,
    goldWeight18k: 3.6,
    makingCharge: 5500,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    isNew: true,
    bestseller: false,
    rating: 4.8,
    reviews: 19,
    deliveryDays: '3 Days'
  },
  {
    id: 'yara-04',
    name: 'Celestial Tennis Diamond Bracelet',
    category: 'Bracelets',
    price14k: 145000,
    price18k: 168000,
    metalOptions: ['Yellow Gold', 'Rose Gold', 'White Gold'],
    diamondWeight: '1.25 Carats',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 7.8,
    goldWeight18k: 8.9,
    makingCharge: 14000,
    image: 'https://images.unsplash.com/photo-1611591475777-233cd73220d6?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
    isNew: false,
    bestseller: true,
    rating: 4.95,
    reviews: 54,
    deliveryDays: '4-5 Days'
  },
  {
    id: 'yara-05',
    name: 'Eternal Wave Diamond Mangalsutra',
    category: 'Mangalsutras',
    price14k: 69400,
    price18k: 79900,
    metalOptions: ['Yellow Gold'],
    diamondWeight: '0.50 Carat',
    diamondClarity: 'VVS-GH Natural',
    goldWeight14k: 4.1,
    goldWeight18k: 4.8,
    makingCharge: 6800,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    isNew: true,
    bestseller: true,
    rating: 5.0,
    reviews: 31,
    deliveryDays: '2 Days (Express)'
  },
  {
    id: 'yara-06',
    name: 'Gilded Cascade Diamond Drop Earrings',
    category: 'Earrings',
    price14k: 76000,
    price18k: 88500,
    metalOptions: ['Yellow Gold', 'Rose Gold'],
    diamondWeight: '0.60 Carat',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 4.5,
    goldWeight18k: 5.1,
    makingCharge: 7500,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    isNew: false,
    bestseller: false,
    rating: 4.7,
    reviews: 14,
    deliveryDays: '3 Days'
  }
];

// Formatting Currency in INR format
const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home'); // home, shop, product, cart, checkout, account, policy
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [cart, setCart] = useState([
    { product: MOCK_PRODUCTS[0], karat: '18KT', metal: 'Rose Gold', qty: 1, size: '12 (52.4mm)' }
  ]);
  const [wishlist, setWishlist] = useState(['yara-01', 'yara-04']);
  
  // Product Configuration Global State
  const [globalKarat, setGlobalKarat] = useState('18KT'); // 14KT or 18KT
  
  // CaratLane Modals & Drawers State
  const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(false);
  const [isTryAtHomeOpen, setIsTryAtHomeOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(300000);
  const [selectedKaratFilter, setSelectedKaratFilter] = useState('All');

  // Pincode Check state
  const [pincode, setPincode] = useState('110001');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const addToCart = (product, karat, metal) => {
    const existing = cart.find(c => c.product.id === product.id && c.karat === karat && c.metal === metal);
    if (existing) {
      setCart(cart.map(c => c === existing ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { product, karat, metal, qty: 1, size: 'Standard' }]);
    }
    setActiveTab('cart');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus({
        valid: true,
        date: 'Delivered by Friday, 2 PM',
        cod: true,
        express: true
      });
    } else {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian Pincode' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A2536] relative overflow-x-hidden selection:bg-[#E5BDB0]/40 selection:text-[#1A2536]">
      <TypographyStyles />

      {/* 1. TOP ANNOUNCEMENT BAR (Indian Luxury Trust Bar) */}
      <div className="bg-[#1A2536] text-[#FAFAF8] text-xs py-2 px-4 border-b border-[#D4AF37]/30 tracking-wider font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5BDB0]" /> 100% Certified Natural Diamonds (IGI / SGL)
            </span>
            <span className="hidden md:inline text-[#D4AF37]">|</span>
            <span className="hidden md:flex items-center gap-1 text-gray-300">
              No Lab-Grown & No Silver • Solid 14KT & 18KT Gold Only
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#E5BDB0] font-serif-italic">✨ Complimentary Insured Pan-India Shipping</span>
            <button 
              onClick={() => setIsTryAtHomeOpen(true)}
              className="hover:underline font-semibold text-[#D4AF37] flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" /> Book Try At Home
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo matching prompt, Glassmorphism, Dana Rebecca minimal aesthetic) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#1A2536]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Mobile Navigation Toggle */}
            <div className="flex items-center lg:hidden">
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="p-2 text-[#1A2536] hover:text-[#C5A059]"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 font-medium text-xs uppercase tracking-widest text-[#1A2536]/80">
              <button 
                onClick={() => { setActiveTab('home'); }} 
                className={`hover:text-[#1A2536] transition-colors py-1 relative ${activeTab === 'home' ? 'text-[#1A2536] font-bold' : ''}`}
              >
                Home
                {activeTab === 'home' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A2536] rounded-full"></span>}
              </button>
              
              <button 
                onClick={() => { setSelectedCategory('All'); setActiveTab('shop'); }} 
                className={`hover:text-[#1A2536] transition-colors py-1 relative ${activeTab === 'shop' ? 'text-[#1A2536] font-bold' : ''}`}
              >
                All Jewellery
                {activeTab === 'shop' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A2536] rounded-full"></span>}
              </button>

              <button 
                onClick={() => { setSelectedCategory('Rings'); setActiveTab('shop'); }} 
                className="hover:text-[#1A2536] transition-colors py-1"
              >
                Rings
              </button>
              
              <button 
                onClick={() => { setSelectedCategory('Earrings'); setActiveTab('shop'); }} 
                className="hover:text-[#1A2536] transition-colors py-1"
              >
                Earrings
              </button>

              <button 
                onClick={() => { setSelectedCategory('Necklaces'); setActiveTab('shop'); }} 
                className="hover:text-[#1A2536] transition-colors py-1"
              >
                Necklaces & Pendants
              </button>

              <button 
                onClick={() => { setSelectedCategory('Mangalsutras'); setActiveTab('shop'); }} 
                className="hover:text-[#1A2536] transition-colors py-1 flex items-center gap-1 text-[#C5A059] font-semibold"
              >
                Solitaire Mangalsutras
              </button>
            </nav>

            {/* BRAND LOGO (EXACT REPLICATION FROM UPLOADED BRAND IMAGE) */}
            <div 
              onClick={() => setActiveTab('home')}
              className="cursor-pointer flex flex-col items-center justify-center py-2 group"
            >
              {/* Logo Title: YA-RA */}
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-3xl sm:text-4xl tracking-[0.2em] font-medium text-[#1A2536] group-hover:text-[#C5A059] transition-colors">
                  YA<span className="text-[#1A2536]">-</span>RA
                </span>
                <span className="text-[9px] font-sans border border-[#1A2536]/40 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[#1A2536] -mt-3">®</span>
              </div>

              {/* Accent Diamond SVG icon from user's logo */}
              <div className="flex items-center gap-3 w-full my-0.5">
                <span className="h-[1px] bg-gradient-to-r from-transparent via-[#E5BDB0] to-[#E5BDB0] flex-1"></span>
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#1A2536]">
                    <path d="M12 2L3 9L12 22L21 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="#E5BDB0" fillOpacity="0.4"/>
                    <path d="M12 2V22M3 9H21M7.5 5.5L12 9L16.5 5.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                  {/* Subtle shine mark above diamond */}
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#E5BDB0] rounded-full blur-[0.5px]"></span>
                </div>
                <span className="h-[1px] bg-gradient-to-r from-[#E5BDB0] via-[#E5BDB0] to-transparent flex-1"></span>
              </div>

              {/* Subtitle from logo */}
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-sans text-[#1A2536]/80 font-medium">
                Diamond & Gold Jewellery
              </span>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              
              {/* 14KT / 18KT Global Selector */}
              <div className="hidden sm:flex items-center bg-[#1A2536]/5 p-1 rounded-full border border-[#1A2536]/10 text-xs">
                <button 
                  onClick={() => setGlobalKarat('14KT')}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-all ${globalKarat === '14KT' ? 'bg-[#1A2536] text-white shadow-sm' : 'text-[#1A2536]/70 hover:text-[#1A2536]'}`}
                >
                  14KT
                </button>
                <button 
                  onClick={() => setGlobalKarat('18KT')}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-all ${globalKarat === '18KT' ? 'bg-[#1A2536] text-white shadow-sm' : 'text-[#1A2536]/70 hover:text-[#1A2536]'}`}
                >
                  18KT
                </button>
              </div>

              <button 
                onClick={() => setActiveTab('shop')} 
                className="p-2 text-[#1A2536] hover:text-[#C5A059] transition-colors"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('account')} 
                className="p-2 text-[#1A2536] hover:text-[#C5A059] transition-colors hidden sm:block"
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('cart')} 
                className="p-2 text-[#1A2536] hover:text-[#C5A059] transition-colors relative"
                title="Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 bg-[#E5BDB0] text-[#1A2536] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cart.reduce((a, b) => a + b.qty, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. CONDITIONAL MAIN BODY VIEWS */}

      {/* VIEW A: HOMEPAGE (Dana Rebecca Elegance + Apple Liquid Glass + Beyon Uneven Organic Shapes & Cursive Highlights) */}
      {activeTab === 'home' && (
        <main className="space-y-16 pb-20">

          {/* HERO SECTION: Uneven Arch Frame + Glassmorphic Hero Overlay + Cursive Script Tag */}
          <section className="relative pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="relative rounded-[40px] overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center bg-[#1A2536]">
              {/* Background Luxury Editorial Image */}
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=80" 
                  alt="YA-RA Fine Jewellery" 
                  className="w-full h-full object-cover object-center opacity-85 scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A2536]/90 via-[#1A2536]/40 to-transparent"></div>
              </div>

              {/* BEYON INSPIRED: Uneven Floating Shape Graphic Behind Text */}
              <div className="absolute top-12 left-12 w-96 h-96 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Liquid Glass Content Box */}
              <div className="relative z-10 max-w-xl ml-6 sm:ml-12 lg:ml-16 p-8 sm:p-12 glass-card-dark rounded-[36px] text-white space-y-6 border border-white/20">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-widest text-[#E5BDB0]">
                  <Sparkles className="w-3.5 h-3.5" /> 
                  <span>NATURAL DIAMONDS • 14KT / 18KT</span>
                </div>

                <div className="space-y-2">
                  <p className="font-cursive text-3xl sm:text-4xl text-[#E5BDB0] font-normal leading-tight">
                    sparkle softly everyday...
                  </p>
                  <h1 className="font-serif-luxury text-4xl sm:text-6xl font-normal leading-[1.08] tracking-tight">
                    Crafted for the Modern Connoisseur.
                  </h1>
                </div>

                <p className="text-gray-300 font-light text-sm sm:text-base leading-relaxed">
                  Everypiece is thoughtfully designed with 100% natural, conflict-free diamonds set in certified 14KT and 18KT solid gold. No silver. No synthetic stones.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    onClick={() => { setSelectedCategory('All'); setActiveTab('shop'); }}
                    className="px-8 py-4 bg-[#E5BDB0] hover:bg-[#d8ab9d] text-[#1A2536] font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setIsTryAtHomeOpen(true)}
                    className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-widest rounded-full backdrop-blur-md transition-all border border-white/20 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-[#D4AF37]" /> Try At Home
                  </button>
                </div>
              </div>

              {/* BEYON INSPIRED: Uneven Arch Highlight Badge floating top right */}
              <div className="hidden lg:flex absolute bottom-8 right-8 glass-card p-5 rounded-tr-[50px] rounded-bl-[40px] rounded-tl-2xl rounded-br-2xl max-w-xs items-center gap-4 border border-white/60">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]">
                  <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80" alt="Ring" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider">Featured Edit</span>
                  <h4 className="font-serif-luxury text-base font-semibold text-[#1A2536]">Luminary Solitaire Ring</h4>
                  <p className="text-xs font-bold text-[#1A2536] mt-0.5">{formatINR(49800)} <span className="text-[10px] font-normal text-gray-500">(18KT)</span></p>
                </div>
              </div>

            </div>
          </section>

          {/* TRUST BADGES BAR (CaratLane & Dana Rebecca Luxury Guarantee) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="glass-card p-5 rounded-3xl flex items-center gap-4 hover:border-[#E5BDB0]/60 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#1A2536]/5 flex items-center justify-center text-[#1A2536]">
                  <Award className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1A2536]">100% Natural Diamonds</h4>
                  <p className="text-xs text-gray-500">IGI & SGL Hallmarked</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-3xl flex items-center gap-4 hover:border-[#E5BDB0]/60 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#1A2536]/5 flex items-center justify-center text-[#1A2536]">
                  <RefreshCw className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1A2536]">Lifetime Buyback</h4>
                  <p className="text-xs text-gray-500">80%-90% Guaranteed Value</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-3xl flex items-center gap-4 hover:border-[#E5BDB0]/60 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#1A2536]/5 flex items-center justify-center text-[#1A2536]">
                  <Truck className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1A2536]">Free Insured Delivery</h4>
                  <p className="text-xs text-gray-500">100% Transit Protection</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-3xl flex items-center gap-4 hover:border-[#E5BDB0]/60 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#1A2536]/5 flex items-center justify-center text-[#1A2536]">
                  <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1A2536]">BIS Hallmarked Gold</h4>
                  <p className="text-xs text-gray-500">14KT & 18KT Guaranteed</p>
                </div>
              </div>

            </div>
          </section>

          {/* BEYON INSPIRED: SHOP BY CATEGORY (Uneven Shapes, Curved Top Arch Masks & Cursive Accent Labels) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-cursive text-3xl text-[#C5A059] block -mb-2">curated for you</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                  Shop by Category
                </h2>
              </div>
              <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                14KT & 18KT SOLID GOLD • 100% NATURAL DIAMONDS
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Category 1: Rings (Uneven Arch Frame) */}
              <div 
                onClick={() => { setSelectedCategory('Rings'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-80 shape-arch overflow-hidden bg-[#1A2536]/5 border border-white/80 shadow-md group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80" 
                    alt="Rings" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <h3 className="font-serif-luxury text-2xl font-normal">Rings & Bands</h3>
                    <p className="text-[11px] text-[#E5BDB0] font-sans tracking-widest uppercase mt-0.5">Solitaires & Stacking</p>
                  </div>
                </div>
              </div>

              {/* Category 2: Earrings (Uneven Organic 1 Shape) */}
              <div 
                onClick={() => { setSelectedCategory('Earrings'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-80 shape-organic-1 overflow-hidden bg-[#1A2536]/5 border border-white/80 shadow-md group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80" 
                    alt="Earrings" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <h3 className="font-serif-luxury text-2xl font-normal">Earrings</h3>
                    <p className="text-[11px] text-[#E5BDB0] font-sans tracking-widest uppercase mt-0.5">Studs, Drops & Hoops</p>
                  </div>
                </div>
              </div>

              {/* Category 3: Necklaces (Uneven Organic 2 Shape) */}
              <div 
                onClick={() => { setSelectedCategory('Necklaces'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-80 shape-organic-2 overflow-hidden bg-[#1A2536]/5 border border-white/80 shadow-md group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" 
                    alt="Necklaces" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <h3 className="font-serif-luxury text-2xl font-normal">Necklaces</h3>
                    <p className="text-[11px] text-[#E5BDB0] font-sans tracking-widest uppercase mt-0.5">Pendants & Layers</p>
                  </div>
                </div>
              </div>

              {/* Category 4: Mangalsutras (Uneven Arch Mask inverted) */}
              <div 
                onClick={() => { setSelectedCategory('Mangalsutras'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-80 rounded-b-[100px] rounded-t-2xl overflow-hidden bg-[#1A2536]/5 border border-white/80 shadow-md group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80" 
                    alt="Mangalsutras" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <h3 className="font-serif-luxury text-2xl font-normal">Solitaire Mangalsutras</h3>
                    <p className="text-[11px] text-[#E5BDB0] font-sans tracking-widest uppercase mt-0.5">Modern Heritage</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* FEATURED PRODUCTS SHOWCASE (Dana Rebecca Minimal Grid + CaratLane Karat Switcher) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="font-cursive text-3xl text-[#C5A059] block -mb-1">bestselling designs</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                  Signature Collections
                </h2>
              </div>

              {/* Global 14KT / 18KT Toggle Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase text-gray-500">Selected Karatage:</span>
                <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm flex text-xs">
                  <button 
                    onClick={() => setGlobalKarat('14KT')}
                    className={`px-3 py-1.5 rounded-full font-semibold transition-all ${globalKarat === '14KT' ? 'bg-[#1A2536] text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
                  >
                    14KT Gold
                  </button>
                  <button 
                    onClick={() => setGlobalKarat('18KT')}
                    className={`px-3 py-1.5 rounded-full font-semibold transition-all ${globalKarat === '18KT' ? 'bg-[#1A2536] text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
                  >
                    18KT Gold
                  </button>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_PRODUCTS.slice(0, 6).map((product) => {
                const currentPrice = globalKarat === '14KT' ? product.price14k : product.price18k;
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <div 
                    key={product.id}
                    className="group glass-card rounded-[32px] overflow-hidden p-4 border border-white/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative">
                      {/* Product Image Container with subtle rounded top */}
                      <div 
                        onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                        className="relative h-72 rounded-[24px] overflow-hidden bg-gray-100 cursor-pointer"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-500"
                        />
                        <img 
                          src={product.hoverImage} 
                          alt={product.name} 
                          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-105"
                        />
                      </div>

                      {/* Wishlist Button */}
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#1A2536] hover:bg-white transition-all"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E5BDB0] text-[#E5BDB0]' : ''}`} />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        {product.bestseller && (
                          <span className="px-2.5 py-1 rounded-full bg-[#1A2536] text-[#E5BDB0] text-[10px] font-semibold uppercase tracking-wider">
                            Bestseller
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1A2536] text-[10px] font-bold tracking-wider uppercase border border-white">
                          {globalKarat}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="pt-4 px-1 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 
                          onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                          className="font-serif-luxury text-xl font-normal text-[#1A2536] hover:text-[#C5A059] cursor-pointer leading-snug"
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{product.diamondWeight}</span>
                        <span>•</span>
                        <span>{product.diamondClarity}</span>
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-sans">Natural Diamond & Gold</p>
                          <p className="font-semibold text-lg text-[#1A2536]">
                            {formatINR(currentPrice)}
                          </p>
                        </div>

                        <button 
                          onClick={() => addToCart(product, globalKarat, product.metalOptions[0])}
                          className="px-4 py-2 bg-[#1A2536] hover:bg-[#2c3d59] text-white text-xs font-semibold rounded-full transition-all shadow-md flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>

          {/* CARATLANE FEATURE BANNER: BOOK TRY AT HOME (Liquid Glass Card with Beyon Arch Frame) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-[#1A2536] via-[#24334a] to-[#1A2536] text-white p-8 sm:p-14 border border-white/10 shadow-2xl">
              
              {/* Background Blob Accent */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#E5BDB0]/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/20 text-[#E5BDB0] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/30">
                    <MapPin className="w-3.5 h-3.5" /> Free Service Across 50+ Cities In India
                  </div>

                  <div className="space-y-2">
                    <span className="font-cursive text-3xl text-[#E5BDB0] block">experience before you decide</span>
                    <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal leading-tight">
                      Try YA-RA Natural Diamonds in the Comfort of Your Home.
                    </h2>
                  </div>

                  <p className="text-gray-300 font-light text-sm sm:text-base leading-relaxed max-w-xl">
                    Our certified jewellery consultants will bring your shortlisted 14KT & 18KT diamond rings, earrings, and necklaces right to your doorstep with zero buying obligation.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button 
                      onClick={() => setIsTryAtHomeOpen(true)}
                      className="px-8 py-4 bg-[#E5BDB0] hover:bg-[#d49e8f] text-[#1A2536] font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl"
                    >
                      Book Free Appointment
                    </button>
                    <span className="text-xs text-gray-400 font-medium">100% Safe & Insured • Free Cleaning Service Included</span>
                  </div>
                </div>

                <div className="lg:col-span-5 relative flex justify-center">
                  {/* Uneven Organic Frame for Showcase Image */}
                  <div className="w-72 sm:w-80 h-96 shape-organic-1 overflow-hidden border-4 border-white/20 shadow-2xl relative">
                    <img 
                      src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80" 
                      alt="Try at Home" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-center bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                      <p className="text-xs font-semibold text-white">100% Sanitized & Safe</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* CARATLANE PROMISE & GUARANTEE POLICY SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="font-cursive text-3xl text-[#C5A059]">uncompromising standard</span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                The YA-RA Assurance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="glass-card p-8 rounded-[36px] space-y-4 border border-white/80 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#E5BDB0]/20 flex items-center justify-center text-[#1A2536]">
                  <Award className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">IGI & SGL Certified</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Every natural diamond above 0.10ct comes with an individual grading certificate from top international gemological laboratories detailing color, clarity, cut, and carat weight.
                </p>
              </div>

              <div className="glass-card p-8 rounded-[36px] space-y-4 border border-white/80 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#E5BDB0]/20 flex items-center justify-center text-[#1A2536]">
                  <RefreshCw className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Lifetime Buyback & Exchange</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Enjoy 100% exchange value on prevailing gold rates and 80-90% buyback value on natural diamonds anytime in the future across India.
                </p>
              </div>

              <div className="glass-card p-8 rounded-[36px] space-y-4 border border-white/80 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#E5BDB0]/20 flex items-center justify-center text-[#1A2536]">
                  <ShieldCheck className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">100% Natural Guarantee</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  We maintain zero tolerance for lab-grown, synthetic, or treated stones. Only pure earth-mined diamonds with ethical sourcing guarantees.
                </p>
              </div>

            </div>
          </section>

        </main>
      )}

      {/* VIEW B: PRODUCT LISTING / CATEGORY PAGE WITH COMPLETE FILTER CAPABILITIES */}
      {activeTab === 'shop' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          {/* Category Banner & Cursive Title */}
          <div className="relative rounded-[32px] overflow-hidden bg-[#1A2536] text-white p-8 sm:p-12 border border-white/10 shadow-lg">
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="font-cursive text-3xl text-[#E5BDB0]">designer fine edit</span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl font-normal">
                {selectedCategory === 'All' ? 'All Natural Diamond Jewellery' : `${selectedCategory} Collection`}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm font-light">
                Handcrafted solid 14KT & 18KT gold pieces featuring certified VVS natural diamonds. Filter by carat, price, metal color, and style.
              </p>
            </div>
            {/* Uneven background graphic */}
            <div className="absolute right-[-40px] top-[-40px] w-80 h-80 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            
            <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {['All', 'Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Mangalsutras'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#1A2536] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A2536] rounded-full text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters & Refinement
              </button>

              <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs">
                <button 
                  onClick={() => setGlobalKarat('14KT')}
                  className={`px-3 py-1 rounded-full font-semibold ${globalKarat === '14KT' ? 'bg-[#1A2536] text-white' : 'text-gray-600'}`}
                >
                  14KT
                </button>
                <button 
                  onClick={() => setGlobalKarat('18KT')}
                  className={`px-3 py-1 rounded-full font-semibold ${globalKarat === '18KT' ? 'bg-[#1A2536] text-white' : 'text-gray-600'}`}
                >
                  18KT
                </button>
              </div>
            </div>

          </div>

          {/* Main Grid & Filtering Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PRODUCTS
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .filter(p => (globalKarat === '14KT' ? p.price14k : p.price18k) <= priceRange)
              .map((product) => {
                const currentPrice = globalKarat === '14KT' ? product.price14k : product.price18k;
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <div 
                    key={product.id}
                    className="group glass-card rounded-[32px] overflow-hidden p-4 border border-white/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative">
                      <div 
                        onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                        className="relative h-72 rounded-[24px] overflow-hidden bg-gray-100 cursor-pointer"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-500"
                        />
                        <img 
                          src={product.hoverImage} 
                          alt={product.name} 
                          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-105"
                        />
                      </div>

                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-md text-[#1A2536]"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E5BDB0] text-[#E5BDB0]' : ''}`} />
                      </button>

                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1A2536] text-[10px] font-bold tracking-wider uppercase">
                          {globalKarat}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 px-1 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 
                          onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                          className="font-serif-luxury text-xl font-normal text-[#1A2536] hover:text-[#C5A059] cursor-pointer"
                        >
                          {product.name}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-500">{product.diamondWeight} • {product.diamondClarity}</p>
                      <p className="text-xs text-emerald-600 font-medium">✨ Ready to Ship ({product.deliveryDays})</p>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400">Natural Diamond & Gold</p>
                          <p className="font-semibold text-lg text-[#1A2536]">{formatINR(currentPrice)}</p>
                        </div>

                        <button 
                          onClick={() => addToCart(product, globalKarat, product.metalOptions[0])}
                          className="px-4 py-2 bg-[#1A2536] text-white text-xs font-semibold rounded-full hover:bg-[#2c3d59] transition-all"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>

        </main>
      )}

      {/* VIEW C: FULL CARATLANE SPEC PRODUCT DETAIL PAGE (PDP) */}
      {activeTab === 'product' && selectedProduct && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* PDP Left: Product Images with Uneven BEYON Frame */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-[480px] sm:h-[540px] shape-arch overflow-hidden bg-gray-100 shadow-xl border border-white">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Certified Badge */}
                <div className="absolute top-4 left-4 glass-card px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#1A2536]">
                  <Award className="w-4 h-4 text-[#C5A059]" /> 100% IGI & SGL Natural Diamond Certificate
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-4">
                <div className="h-28 rounded-2xl overflow-hidden border-2 border-[#1A2536] cursor-pointer">
                  <img src={selectedProduct.image} alt="Thumb 1" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 rounded-2xl overflow-hidden border border-gray-200 opacity-70 hover:opacity-100 cursor-pointer">
                  <img src={selectedProduct.hoverImage} alt="Thumb 2" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 rounded-2xl overflow-hidden border border-gray-200 opacity-70 hover:opacity-100 cursor-pointer flex items-center justify-center bg-gray-50 text-xs font-semibold text-gray-500">
                  + Certificate View
                </div>
              </div>
            </div>

            {/* PDP Right: Configuration, Price Breakdown, Pincode Check, Add to Bag */}
            <div className="lg:col-span-5 space-y-6">
              
              <div>
                <span className="font-cursive text-3xl text-[#C5A059] block -mb-1">handcrafted design</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                  {selectedProduct.name}
                </h1>
                <p className="text-xs text-gray-500 mt-1">Product Code: {selectedProduct.id.toUpperCase()}</p>
              </div>

              {/* Price & Price Breakup Trigger */}
              <div className="glass-card p-4 rounded-2xl border border-white/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase">Final Price ({globalKarat} Solid Gold)</span>
                    <span className="text-3xl font-bold text-[#1A2536]">
                      {formatINR(globalKarat === '14KT' ? selectedProduct.price14k : selectedProduct.price18k)}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                    Includes 3% GST & Insured Shipping
                  </span>
                </div>

                {/* CaratLane Price Breakdown Button */}
                <button 
                  onClick={() => setIsPriceBreakupOpen(true)}
                  className="w-full pt-2 border-t border-gray-200/80 text-xs font-semibold text-[#C5A059] hover:underline flex items-center justify-between"
                >
                  <span>View Detailed Price Breakup (Gold, Diamond & Making)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Metal Purity Selector (14KT vs 18KT) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A2536]">Select Gold Purity:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setGlobalKarat('14KT')}
                    className={`p-3 rounded-2xl border text-left transition-all ${globalKarat === '14KT' ? 'border-[#1A2536] bg-[#1A2536] text-white shadow-md' : 'border-gray-200 bg-white text-gray-800'}`}
                  >
                    <div className="font-bold text-sm">14KT Solid Gold</div>
                    <div className="text-[11px] opacity-80">{formatINR(selectedProduct.price14k)}</div>
                  </button>

                  <button 
                    onClick={() => setGlobalKarat('18KT')}
                    className={`p-3 rounded-2xl border text-left transition-all ${globalKarat === '18KT' ? 'border-[#1A2536] bg-[#1A2536] text-white shadow-md' : 'border-gray-200 bg-white text-gray-800'}`}
                  >
                    <div className="font-bold text-sm">18KT Solid Gold</div>
                    <div className="text-[11px] opacity-80">{formatINR(selectedProduct.price18k)}</div>
                  </button>
                </div>
              </div>

              {/* Metal Tone Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A2536]">Gold Tone Finish:</label>
                <div className="flex items-center gap-3">
                  {selectedProduct.metalOptions.map((metal) => (
                    <button
                      key={metal}
                      className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-300 hover:border-[#1A2536] transition-all flex items-center gap-2 bg-white"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${metal.includes('Rose') ? 'bg-[#E5BDB0]' : metal.includes('Yellow') ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}></span>
                      {metal}
                    </button>
                  ))}
                </div>
              </div>

              {/* CaratLane Pincode Checker */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A2536] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" /> Check Delivery & COD Availability:
                </label>
                
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#1A2536] bg-white"
                  />
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[#1A2536] text-white text-xs font-semibold rounded-full hover:bg-[#2c3d59]"
                  >
                    Check
                  </button>
                </form>

                {pincodeStatus && pincodeStatus.valid && (
                  <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-800 space-y-1 border border-emerald-200">
                    <p className="font-semibold">✓ Delivery available for pincode {pincode}</p>
                    <p>• {pincodeStatus.date}</p>
                    <p>• Cash on Delivery (COD) available up to ₹50,000</p>
                  </div>
                )}
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => addToCart(selectedProduct, globalKarat, selectedProduct.metalOptions[0])}
                  className="w-full py-4 bg-[#1A2536] hover:bg-[#2c3d59] text-white font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E5BDB0]" /> Add To Shopping Bag
                </button>

                <button 
                  onClick={() => setIsTryAtHomeOpen(true)}
                  className="w-full py-3.5 bg-white hover:bg-gray-50 border-2 border-[#1A2536] text-[#1A2536] font-semibold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-[#C5A059]" /> Book Free Try At Home
                </button>
              </div>

              {/* Product Specifications Table */}
              <div className="pt-6 border-t border-gray-200 space-y-3 text-xs">
                <h4 className="font-bold text-[#1A2536] uppercase tracking-wider">Product Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div className="bg-gray-100 p-2.5 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">DIAMOND CARAT</span>
                    <span className="font-semibold text-[#1A2536]">{selectedProduct.diamondWeight}</span>
                  </div>
                  <div className="bg-gray-100 p-2.5 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">DIAMOND CLARITY</span>
                    <span className="font-semibold text-[#1A2536]">{selectedProduct.diamondClarity}</span>
                  </div>
                  <div className="bg-gray-100 p-2.5 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">GOLD WEIGHT ({globalKarat})</span>
                    <span className="font-semibold text-[#1A2536]">
                      {globalKarat === '14KT' ? `${selectedProduct.goldWeight14k}g` : `${selectedProduct.goldWeight18k}g`}
                    </span>
                  </div>
                  <div className="bg-gray-100 p-2.5 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">CERTIFICATION</span>
                    <span className="font-semibold text-[#1A2536]">IGI / SGL Hallmarked</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* VIEW D: SHOPPING CART */}
      {activeTab === 'cart' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="border-b border-gray-200 pb-4">
            <span className="font-cursive text-3xl text-[#C5A059]">your selections</span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
              Shopping Bag ({cart.reduce((a, b) => a + b.qty, 0)} Items)
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="font-serif-luxury text-2xl text-gray-600">Your bag is empty</h3>
              <button 
                onClick={() => setActiveTab('shop')}
                className="px-6 py-3 bg-[#1A2536] text-white text-xs uppercase font-semibold rounded-full"
              >
                Explore Jewellery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item, idx) => {
                  const price = item.karat === '14KT' ? item.product.price14k : item.product.price18k;

                  return (
                    <div key={idx} className="glass-card p-4 rounded-3xl border border-white flex gap-4 items-center">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-24 h-24 rounded-2xl object-cover bg-gray-100" 
                      />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">{item.product.name}</h3>
                        <p className="text-xs text-gray-500">Purity: {item.karat} | Tone: {item.metal}</p>
                        <p className="text-xs font-semibold text-emerald-600">✓ 100% Natural Diamond Guaranteed</p>
                        <p className="font-bold text-sm text-[#1A2536] pt-1">{formatINR(price * item.qty)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            if (item.qty > 1) {
                              setCart(cart.map((c, i) => i === idx ? { ...c, qty: c.qty - 1 } : c));
                            } else {
                              setCart(cart.filter((_, i) => i !== idx));
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <button 
                          onClick={() => setCart(cart.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c))}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary & Checkout */}
              <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-white space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A2536]">Order Summary</h3>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatINR(cart.reduce((a, b) => a + (b.karat === '14KT' ? b.product.price14k : b.product.price18k) * b.qty, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Pan-India Express Delivery</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated GST (3%)</span>
                    <span className="text-gray-400">Included</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline font-bold text-base text-[#1A2536]">
                  <span>Total Amount</span>
                  <span>{formatINR(cart.reduce((a, b) => a + (b.karat === '14KT' ? b.product.price14k : b.product.price18k) * b.qty, 0))}</span>
                </div>

                <button 
                  onClick={() => setActiveTab('checkout')}
                  className="w-full py-4 bg-[#1A2536] hover:bg-[#2c3d59] text-white text-xs font-semibold uppercase tracking-widest rounded-full transition-all shadow-xl"
                >
                  Proceed to Checkout
                </button>
              </div>

            </div>
          )}
        </main>
      )}

      {/* VIEW E: CHECKOUT & INDIAN PAYMENT GATEWAY */}
      {activeTab === 'checkout' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="border-b border-gray-200 pb-4 text-center">
            <span className="font-cursive text-3xl text-[#C5A059]">secure checkout</span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">
              Complete Your YA-RA Purchase
            </h1>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white space-y-6">
            
            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-[#1A2536] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059]" /> Delivery Address (India)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <input type="text" placeholder="Full Name" className="px-4 py-3 rounded-xl border border-gray-300 bg-white" defaultValue="Aditi Sharma" />
                <input type="text" placeholder="Mobile Number (+91)" className="px-4 py-3 rounded-xl border border-gray-300 bg-white" defaultValue="+91 9876543210" />
                <input type="text" placeholder="Flat, Building / Street" className="sm:col-span-2 px-4 py-3 rounded-xl border border-gray-300 bg-white" defaultValue="402, Signature Towers, Golf Course Road" />
                <input type="text" placeholder="City" className="px-4 py-3 rounded-xl border border-gray-300 bg-white" defaultValue="Gurugram" />
                <input type="text" placeholder="Pincode" className="px-4 py-3 rounded-xl border border-gray-300 bg-white" defaultValue="122002" />
              </div>
            </div>

            {/* Indian Payment Options */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-sm uppercase text-[#1A2536] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C5A059]" /> Select Payment Method
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#1A2536] bg-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" defaultChecked />
                    <span className="font-bold text-xs text-[#1A2536]">UPI Fast Checkout (GPay, PhonePe, Paytm, BHIM)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Fastest</span>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" />
                    <span className="font-bold text-xs text-[#1A2536]">Credit / Debit Card (No Cost EMI Available)</span>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" />
                    <span className="font-bold text-xs text-[#1A2536]">Cash on Delivery (Up to ₹50,000)</span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={() => {
                alert('Order Placed Successfully! Tracking details have been sent to your phone.');
                setCart([]);
                setActiveTab('account');
              }}
              className="w-full py-4 bg-[#1A2536] hover:bg-[#2c3d59] text-white text-xs font-semibold uppercase tracking-widest rounded-full transition-all shadow-xl"
            >
              Pay & Place Order Securely
            </button>

          </div>
        </main>
      )}

      {/* VIEW F: USER ACCOUNT & PAST ORDERS */}
      {activeTab === 'account' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="border-b border-gray-200 pb-4">
            <span className="font-cursive text-3xl text-[#C5A059]">welcome back</span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">
              My YA-RA Account & Order History
            </h1>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white space-y-6">
            <h3 className="font-bold text-sm uppercase text-[#1A2536]">Recent Certified Jewelry Orders</h3>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-xs border-b pb-2">
                  <span className="font-bold text-[#1A2536]">Order #YARA-94820</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Out For Delivery</span>
                </div>
                <div className="flex items-center gap-4">
                  <img src={MOCK_PRODUCTS[0].image} alt="Order item" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-serif-luxury font-semibold text-base">{MOCK_PRODUCTS[0].name}</h4>
                    <p className="text-xs text-gray-500">18KT Solid Rose Gold • VVS Natural Diamond</p>
                    <p className="font-bold text-xs mt-1">{formatINR(MOCK_PRODUCTS[0].price18k)}</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button className="px-3 py-1.5 border rounded-full font-medium">Download IGI Certificate PDF</button>
                  <button className="px-3 py-1.5 bg-[#1A2536] text-white rounded-full font-medium">Track Courier</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 4. MODALS & DRAWERS (CARATLANE FUNCTIONALITY) */}

      {/* MODAL 1: CARATLANE PRICE BREAKUP DRAWER */}
      {isPriceBreakupOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl space-y-6 border border-white/80 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Transparent Price Breakup</h3>
                <p className="text-xs text-gray-500">YA-RA Honest Indian Pricing Model</p>
              </div>
              <button onClick={() => setIsPriceBreakupOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span>Gold Component ({globalKarat === '14KT' ? selectedProduct.goldWeight14k : selectedProduct.goldWeight18k}g @ Live Metal Rate)</span>
                <span className="font-bold">{formatINR(globalKarat === '14KT' ? selectedProduct.price14k * 0.45 : selectedProduct.price18k * 0.48)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span>Natural Diamond Component ({selectedProduct.diamondWeight} VVS)</span>
                <span className="font-bold">{formatINR(globalKarat === '14KT' ? selectedProduct.price14k * 0.40 : selectedProduct.price18k * 0.40)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span>Making Charges</span>
                <span className="font-bold">{formatINR(selectedProduct.makingCharge)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span>GST (3%)</span>
                <span className="font-bold">{formatINR(globalKarat === '14KT' ? selectedProduct.price14k * 0.03 : selectedProduct.price18k * 0.03)}</span>
              </div>
            </div>

            <div className="p-4 bg-[#1A2536] text-white rounded-2xl flex justify-between items-center font-bold text-sm">
              <span>Final Total ({globalKarat})</span>
              <span>{formatINR(globalKarat === '14KT' ? selectedProduct.price14k : selectedProduct.price18k)}</span>
            </div>

            <button 
              onClick={() => setIsPriceBreakupOpen(false)}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-full uppercase"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CARATLANE TRY AT HOME APPOINTMENT MODAL */}
      {isTryAtHomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl space-y-6 border border-white/80">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="font-cursive text-2xl text-[#C5A059]">doorstep luxury</span>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Book Free Try At Home</h3>
              </div>
              <button onClick={() => setIsTryAtHomeOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Appointment Reserved! Our executive will call you within 2 hours.'); setIsTryAtHomeOpen(false); }} className="space-y-4 text-xs">
              <input type="text" placeholder="Your Name" required className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" />
              <input type="tel" placeholder="Mobile Number (+91)" required className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" />
              <input type="text" placeholder="Pincode & City" required className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" defaultValue="110001 - New Delhi" />
              
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Preferred Appointment Date:</label>
                <input type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" />
              </div>

              <button type="submit" className="w-full py-4 bg-[#1A2536] text-white font-semibold text-xs uppercase tracking-widest rounded-full shadow-xl">
                Confirm Free Appointment Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REFINEMENT & FILTER DRAWER FOR CATEGORY PAGE */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Filter Collection</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Max Price:</span>
                <span className="text-[#C5A059]">{formatINR(priceRange)}</span>
              </div>
              <input 
                type="range" 
                min="30000" 
                max="300000" 
                step="10000" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#1A2536]"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Category:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['All', 'Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Mangalsutras'].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`p-2 rounded-xl text-left font-semibold ${selectedCategory === c ? 'bg-[#1A2536] text-white' : 'bg-gray-100'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-4 bg-[#1A2536] text-white text-xs font-semibold uppercase tracking-widest rounded-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* 5. FOOTER (Dana Rebecca Clean Grid + YA-RA Branding) */}
      <footer className="bg-[#1A2536] text-white pt-16 pb-12 border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <span className="font-serif-luxury text-3xl tracking-widest font-normal text-white">YA-RA</span>
              <p className="font-cursive text-2xl text-[#E5BDB0]">fine natural diamond jewellery</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Handcrafted solid 14KT & 18KT gold jewellery studded exclusively with certified earth-mined natural diamonds. Designed in India for everyday luxury.
              </p>
            </div>

            {/* Links 1 */}
            <div className="space-y-3 text-xs">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-[#D4AF37]">Explore Collections</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => { setSelectedCategory('Rings'); setActiveTab('shop'); }} className="hover:text-white">Solitaire Rings & Bands</button></li>
                <li><button onClick={() => { setSelectedCategory('Earrings'); setActiveTab('shop'); }} className="hover:text-white">Dailywear Diamond Studs</button></li>
                <li><button onClick={() => { setSelectedCategory('Necklaces'); setActiveTab('shop'); }} className="hover:text-white">Fine Layered Necklaces</button></li>
                <li><button onClick={() => { setSelectedCategory('Mangalsutras'); setActiveTab('shop'); }} className="hover:text-white">Modern Solitaire Mangalsutras</button></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div className="space-y-3 text-xs">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-[#D4AF37]">Trust & Policies</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span className="hover:text-white cursor-pointer">IGI & SGL Diamond Verification</span></li>
                <li><span className="hover:text-white cursor-pointer">Lifetime Buyback Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">100% Insured Delivery</span></li>
                <li><span className="hover:text-white cursor-pointer">BIS Hallmarking Guide</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-3 text-xs">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-[#D4AF37]">Concierge Support</h4>
              <p className="text-gray-300">Call / WhatsApp: +91 98765 43210</p>
              <p className="text-gray-300">Email: concierge@yara-jewellery.in</p>
              <button 
                onClick={() => setIsTryAtHomeOpen(true)}
                className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs rounded-full border border-white/20 text-[#E5BDB0]"
              >
                Book Home Visit
              </button>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
            <p>© 2026 YA-RA Fine Jewellery Pvt. Ltd. All rights reserved. Solid 14KT/18KT Gold & Natural Diamonds Only.</p>
            <div className="flex gap-4">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>PAN Compliance</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}