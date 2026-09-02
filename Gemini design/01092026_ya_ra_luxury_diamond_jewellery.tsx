import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Heart, Search, User, Sparkles, ShieldCheck, Truck, RefreshCw, 
  ChevronRight, ChevronDown, Filter, X, Check, Star, MapPin, Calendar, 
  CreditCard, Phone, ArrowRight, Award, Info, Lock, Eye, Menu, SlidersHorizontal, 
  ArrowUpRight, Shield, Flame, CheckCircle2
} from 'lucide-react';

// Custom Google Font & Color Palette Injection
const TypographyStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Alex+Brush&display=swap');

    :root {
      --navy-deep: #1A2536;
      --navy-[#1A2536]: #111A29;
      --rose-gold: #E5BDB0;
      --rose-accent: #B86B5A;
      --champagne-gold: #D4AF37;
      --gold-warm: #C5A059;
      --bg-cream: #FDFBF7;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-cream);
      color: var(--navy-deep);
    }

    .font-serif-luxury {
      font-family: 'Cormorant Garamond', serif;
    }

    .font-cursive {
      font-family: 'Alex Brush', cursive;
    }

    /* Beyon Organic & Architectural Shapes */
    .shape-arch {
      border-radius: 48px 48px 24px 24px;
    }

    .shape-asymmetric {
      border-radius: 48px 24px 48px 24px;
    }

    .shape-petal {
      border-radius: 24px 48px 24px 48px;
    }

    .shape-arch-inverted {
      border-radius: 24px 24px 48px 48px;
    }

    /* Apple Liquid Glass Styling with Rich Color Rims */
    .glass-card-vibrant {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px) saturate(190%);
      -webkit-backdrop-filter: blur(20px) saturate(190%);
      border: 1px solid rgba(229, 189, 176, 0.5);
      box-shadow: 0 16px 36px -12px rgba(26, 37, 54, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    .glass-card-navy {
      background: rgba(26, 37, 54, 0.92);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      box-shadow: 0 25px 50px -12px rgba(17, 26, 41, 0.4);
    }

    .glass-nav-vibrant {
      background: rgba(253, 251, 247, 0.92);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(229, 189, 176, 0.35);
    }

    /* Gold Gradient text */
    .text-gradient-gold {
      background: linear-gradient(135deg, #D4AF37 0%, #C5A059 50%, #B88E3E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Rose Gradient button */
    .bg-gradient-rose {
      background: linear-gradient(135deg, #E5BDB0 0%, #B86B5A 100%);
    }

    .bg-gradient-navy {
      background: linear-gradient(135deg, #1A2536 0%, #111A29 100%);
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #F5EFE6; }
    ::-webkit-scrollbar-thumb { background: #B86B5A; border-radius: 10px; }
  `}</style>
);

// CaratLane Mock Product Database
const MOCK_PRODUCTS = [
  {
    id: 'yara-01',
    name: 'The Solstice Diamond Ring',
    category: 'Rings',
    price14k: 45000,
    price18k: 52800,
    metalOptions: ['Yellow Gold', 'Rose Gold', 'White Gold'],
    diamondWeight: '0.40 Carat',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 3.1,
    goldWeight18k: 3.6,
    makingCharge: 4800,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
    isNew: true,
    bestseller: true,
    rating: 4.9,
    reviews: 48,
    deliveryDays: '3-4 Days'
  },
  {
    id: 'yara-02',
    name: 'Ethereal Curved Diamond Necklace',
    category: 'Necklaces',
    price14k: 89000,
    price18k: 102500,
    metalOptions: ['Rose Gold', 'Yellow Gold'],
    diamondWeight: '0.75 Carat',
    diamondClarity: 'VVS-GH Natural',
    goldWeight14k: 5.2,
    goldWeight18k: 6.0,
    makingCharge: 9500,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    isNew: false,
    bestseller: true,
    rating: 5.0,
    reviews: 72,
    deliveryDays: '2 Days (Express)'
  },
  {
    id: 'yara-03',
    name: 'Lumière Diamond Stud Earrings',
    category: 'Earrings',
    price14k: 62000,
    price18k: 71400,
    metalOptions: ['Yellow Gold', 'White Gold'],
    diamondWeight: '0.50 Carat',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 3.5,
    goldWeight18k: 4.1,
    makingCharge: 6000,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    isNew: true,
    bestseller: false,
    rating: 4.8,
    reviews: 24,
    deliveryDays: '3 Days'
  },
  {
    id: 'yara-04',
    name: 'Celestial Tennis Diamond Bracelet',
    category: 'Bracelets',
    price14k: 155000,
    price18k: 178000,
    metalOptions: ['White Gold', 'Rose Gold', 'Yellow Gold'],
    diamondWeight: '1.50 Carats',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 8.5,
    goldWeight18k: 9.8,
    makingCharge: 15000,
    image: 'https://images.unsplash.com/photo-1611591475777-233cd73220d6?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
    isNew: false,
    bestseller: true,
    rating: 4.95,
    reviews: 61,
    deliveryDays: '4-5 Days'
  },
  {
    id: 'yara-05',
    name: 'Heritage Solitaire Mangalsutra',
    category: 'Mangalsutras',
    price14k: 72400,
    price18k: 83900,
    metalOptions: ['Yellow Gold'],
    diamondWeight: '0.55 Carat',
    diamondClarity: 'VVS-GH Natural',
    goldWeight14k: 4.5,
    goldWeight18k: 5.2,
    makingCharge: 7200,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    isNew: true,
    bestseller: true,
    rating: 5.0,
    reviews: 39,
    deliveryDays: '2 Days (Express)'
  },
  {
    id: 'yara-06',
    name: 'Cascade Diamond Drop Hoops',
    category: 'Earrings',
    price14k: 81000,
    price18k: 94500,
    metalOptions: ['Rose Gold', 'Yellow Gold'],
    diamondWeight: '0.65 Carat',
    diamondClarity: 'VVS-EF Natural',
    goldWeight14k: 4.8,
    goldWeight18k: 5.6,
    makingCharge: 8000,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    isNew: false,
    bestseller: false,
    rating: 4.7,
    reviews: 18,
    deliveryDays: '3 Days'
  }
];

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [cart, setCart] = useState([
    { product: MOCK_PRODUCTS[0], karat: '18KT', metal: 'Rose Gold', qty: 1 }
  ]);
  const [wishlist, setWishlist] = useState(['yara-01', 'yara-05']);
  
  // Gold Purity Toggle (CaratLane Feature)
  const [globalKarat, setGlobalKarat] = useState('18KT'); 
  
  // Modals & Drawers
  const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(false);
  const [isTryAtHomeOpen, setIsTryAtHomeOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(300000);

  // Pincode validation
  const [pincode, setPincode] = useState('110001');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addToCart = (product, karat, metal) => {
    const existing = cart.find(c => c.product.id === product.id && c.karat === karat && c.metal === metal);
    if (existing) {
      setCart(cart.map(c => c === existing ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { product, karat, metal, qty: 1 }]);
    }
    setActiveTab('cart');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus({ valid: true, date: 'Delivered by Friday, 2 PM', cod: true });
    } else {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian Pincode' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white text-[#1A2536] selection:bg-[#E5BDB0]/40 selection:text-[#1A2536]">
      <TypographyStyles />

      {/* 1. ANNOUNCEMENT BAR (Rich Gold & Deep Navy Trust Strip) */}
      <div className="bg-[#1A2536] text-white text-[11px] py-2.5 px-4 font-semibold tracking-wider uppercase border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#E5BDB0]">
              <Sparkles className="w-3.5 h-3.5" /> 100% Certified Earth-Mined Natural Diamonds
            </span>
            <span className="hidden md:inline text-[#D4AF37]/60">•</span>
            <span className="hidden md:inline text-amber-200">No Lab-Grown • Solid 14KT & 18KT Gold Only</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#E5BDB0] font-serif-italic">✨ Free Insured Pan-India Express Delivery</span>
            <button 
              onClick={() => setIsTryAtHomeOpen(true)}
              className="text-[#D4AF37] hover:underline flex items-center gap-1 font-bold"
            >
              <MapPin className="w-3.5 h-3.5" /> Book Free Home Try-On
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo matching prompt, Glassmorphism, Dana Rebecca minimal aesthetic) */}
      <header className="sticky top-0 z-40 glass-nav-vibrant transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24">
            
            {/* Mobile Nav Button */}
            <button 
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden p-2 text-[#1A2536] hover:text-[#B86B5A]"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Category Navigation */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-widest text-[#1A2536]">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`py-1.5 border-b-2 transition-all ${activeTab === 'home' ? 'border-[#B86B5A] text-[#B86B5A]' : 'border-transparent hover:text-[#B86B5A]'}`}
              >
                Home
              </button>
              <button 
                onClick={() => { setSelectedCategory('All'); setActiveTab('shop'); }} 
                className={`py-1.5 border-b-2 transition-all ${activeTab === 'shop' ? 'border-[#B86B5A] text-[#B86B5A]' : 'border-transparent hover:text-[#B86B5A]'}`}
              >
                All Jewellery
              </button>
              <button 
                onClick={() => { setSelectedCategory('Rings'); setActiveTab('shop'); }} 
                className="py-1.5 border-b-2 border-transparent hover:text-[#B86B5A] transition-all"
              >
                Rings
              </button>
              <button 
                onClick={() => { setSelectedCategory('Earrings'); setActiveTab('shop'); }} 
                className="py-1.5 border-b-2 border-transparent hover:text-[#B86B5A] transition-all"
              >
                Earrings
              </button>
              <button 
                onClick={() => { setSelectedCategory('Mangalsutras'); setActiveTab('shop'); }} 
                className="py-1.5 border-b-2 border-transparent text-[#D4AF37] font-extrabold hover:text-[#b08c26] transition-all flex items-center gap-1"
              >
                Solitaire Mangalsutras
              </button>
            </nav>

            {/* BRAND LOGO - REPLICATED ACCURATELY FROM YOUR UPLOADED LOGO */}
            <div 
              onClick={() => setActiveTab('home')}
              className="cursor-pointer flex flex-col items-center justify-center py-2 group"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-3xl sm:text-4xl font-semibold tracking-[0.2em] text-[#1A2536] group-hover:text-[#B86B5A] transition-colors">
                  YA<span className="text-[#B86B5A]">-</span>RA
                </span>
                <span className="text-[9px] font-sans border border-[#1A2536]/40 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[#1A2536] -mt-3">®</span>
              </div>

              {/* Accent Rose-Gold Diamond SVG divider line from logo */}
              <div className="flex items-center gap-3 w-full my-0.5">
                <span className="h-[1.5px] bg-gradient-to-r from-transparent via-[#E5BDB0] to-[#E5BDB0] flex-1"></span>
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#1A2536]">
                    <path d="M12 2L3 9L12 22L21 9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="#E5BDB0" fillOpacity="0.7"/>
                    <path d="M12 2V22M3 9H21M7.5 5.5L12 9L16.5 5.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </div>
                <span className="h-[1.5px] bg-gradient-to-r from-[#E5BDB0] via-[#E5BDB0] to-transparent flex-1"></span>
              </div>

              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-bold text-[#B86B5A]">
                Diamond & Gold Jewellery
              </span>
            </div>

            {/* Header Right Actions & Karat Switcher */}
            <div className="flex items-center gap-3 sm:gap-5">
              
              {/* 14KT vs 18KT Global Switcher */}
              <div className="hidden sm:flex items-center bg-white p-1 rounded-full border border-[#E5BDB0]/60 shadow-sm text-xs">
                <button 
                  onClick={() => setGlobalKarat('14KT')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${globalKarat === '14KT' ? 'bg-[#1A2536] text-white shadow-sm' : 'text-[#1A2536]/70 hover:text-[#1A2536]'}`}
                >
                  14KT
                </button>
                <button 
                  onClick={() => setGlobalKarat('18KT')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${globalKarat === '18KT' ? 'bg-[#1A2536] text-white shadow-sm' : 'text-[#1A2536]/70 hover:text-[#1A2536]'}`}
                >
                  18KT
                </button>
              </div>

              <button 
                onClick={() => setActiveTab('shop')} 
                className="p-2.5 text-[#1A2536] hover:text-[#B86B5A] transition-colors rounded-full hover:bg-[#E5BDB0]/20"
              >
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('account')} 
                className="hidden sm:block p-2.5 text-[#1A2536] hover:text-[#B86B5A] transition-colors rounded-full hover:bg-[#E5BDB0]/20"
              >
                <User className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('cart')} 
                className="p-2.5 bg-[#1A2536] text-white rounded-full hover:bg-[#111A29] transition-all relative shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5BDB0]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B86B5A] text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cart.reduce((a, b) => a + b.qty, 0)}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT VIEWS */}

      {/* VIEW A: HOMEPAGE (Rich Colors, Clear Hero, Beyon Shapes, Dana Rebecca Editorial Luxury) */}
      {activeTab === 'home' && (
        <main className="space-y-20 pb-24">

          {/* HERO SECTION: High Clarity Image + Left Compact Glass Card + Warm Ambient Color Glows */}
          <section className="relative pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            
            {/* Ambient Background Spheres for Rich Color Glow */}
            <div className="absolute top-10 left-10 w-96 h-96 bg-[#E5BDB0]/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/25 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative rounded-[36px] overflow-hidden h-[72vh] min-h-[580px] max-h-[680px] flex items-center justify-start bg-[#1A2536] border-2 border-[#E5BDB0]/40 shadow-2xl">
              
              {/* High Resolution Product Image (Clear, Unobstructed Right & Center View) */}
              <img 
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2200&q=80" 
                alt="YA-RA Natural Diamond Jewellery Collection" 
                className="absolute inset-0 w-full h-full object-cover object-[75%_center] scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A2536]/85 via-[#1A2536]/40 to-transparent"></div>

              {/* Compact Liquid Glass Content Card (Left-aligned, leaving 60%+ of product clear) */}
              <div className="relative z-10 w-full max-w-lg mx-6 sm:mx-12 lg:mx-16 glass-card-navy p-8 sm:p-12 rounded-[32px] border border-white/20 text-white space-y-6">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5BDB0]/20 border border-[#E5BDB0]/40 text-xs font-bold tracking-widest text-[#E5BDB0]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> 
                  100% NATURAL DIAMONDS • SOLID GOLD
                </div>

                <div className="space-y-2">
                  <span className="font-cursive text-3xl sm:text-4xl text-[#E5BDB0] block -mb-2">sparkle softly everyday...</span>
                  <h1 className="font-serif-luxury text-4xl sm:text-6xl font-normal leading-[1.08] tracking-tight text-white">
                    Natural Diamond Luxury.
                  </h1>
                </div>

                <p className="text-gray-200 text-xs sm:text-sm font-light leading-relaxed">
                  Handcrafted solid 14KT & 18KT gold studded exclusively with earth-mined VVS diamonds. No lab-grown, no silver.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    onClick={() => { setSelectedCategory('All'); setActiveTab('shop'); }}
                    className="px-8 py-4 bg-gradient-rose hover:opacity-95 text-[#1A2536] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center gap-2 group"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => setIsTryAtHomeOpen(true)}
                    className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest rounded-full backdrop-blur-md transition-all border border-white/30 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-[#D4AF37]" /> Book Try At Home
                  </button>
                </div>

              </div>

            </div>
          </section>

          {/* VIBRANT TRUST BADGES SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="glass-card-vibrant p-6 rounded-3xl flex items-center gap-4 border-l-4 border-l-[#B86B5A] hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#B86B5A]/15 flex items-center justify-center text-[#B86B5A] shrink-0">
                  <Award className="w-6 h-6 text-[#B86B5A]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A2536]">100% Natural Diamonds</h4>
                  <p className="text-xs text-[#B86B5A] font-semibold">IGI & SGL Certified</p>
                </div>
              </div>

              <div className="glass-card-vibrant p-6 rounded-3xl flex items-center gap-4 border-l-4 border-l-[#D4AF37] hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A2536]">BIS Hallmarked Gold</h4>
                  <p className="text-xs text-amber-700 font-semibold">14KT & 18KT Pure Gold</p>
                </div>
              </div>

              <div className="glass-card-vibrant p-6 rounded-3xl flex items-center gap-4 border-l-4 border-l-emerald-500 hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <RefreshCw className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A2536]">Lifetime Buyback</h4>
                  <p className="text-xs text-emerald-700 font-semibold">80%-90% Guaranteed Value</p>
                </div>
              </div>

              <div className="glass-card-vibrant p-6 rounded-3xl flex items-center gap-4 border-l-4 border-l-[#1A2536] hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#1A2536]/10 flex items-center justify-center text-[#1A2536] shrink-0">
                  <Truck className="w-6 h-6 text-[#1A2536]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A2536]">Insured Delivery</h4>
                  <p className="text-xs text-gray-600 font-semibold">100% Transit Protection</p>
                </div>
              </div>

            </div>
          </section>

          {/* CURATED CATEGORIES SECTION (Subtle Beyon Architectural Shapes for Maximum Clarity + Rich Rose Borders) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5BDB0]/60 pb-4">
              <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-2">curated for you</span>
                <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                  Shop by Category
                </h2>
              </div>
              <p className="text-xs font-bold text-[#B86B5A] tracking-widest uppercase">
                100% NATURAL DIAMONDS • 14KT & 18KT GOLD
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Category 1: Rings (Subtle Architectural Top Arch) */}
              <div 
                onClick={() => { setSelectedCategory('Rings'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-96 shape-arch overflow-hidden bg-white border-2 border-[#E5BDB0] shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80" 
                    alt="Rings" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/85 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <span className="text-[10px] font-bold text-[#E5BDB0] uppercase tracking-widest block mb-1">Solitaires & Bands</span>
                    <h3 className="font-serif-luxury text-2xl font-normal">Rings</h3>
                  </div>
                </div>
              </div>

              {/* Category 2: Earrings (Subtle Asymmetric Frame) */}
              <div 
                onClick={() => { setSelectedCategory('Earrings'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-96 shape-asymmetric overflow-hidden bg-white border-2 border-[#E5BDB0] shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80" 
                    alt="Earrings" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/85 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <span className="text-[10px] font-bold text-[#E5BDB0] uppercase tracking-widest block mb-1">Studs, Drops & Hoops</span>
                    <h3 className="font-serif-luxury text-2xl font-normal">Earrings</h3>
                  </div>
                </div>
              </div>

              {/* Category 3: Necklaces (Subtle Petal Shape) */}
              <div 
                onClick={() => { setSelectedCategory('Necklaces'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-96 shape-petal overflow-hidden bg-white border-2 border-[#E5BDB0] shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" 
                    alt="Necklaces" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/85 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <span className="text-[10px] font-bold text-[#E5BDB0] uppercase tracking-widest block mb-1">Pendants & Layers</span>
                    <h3 className="font-serif-luxury text-2xl font-normal">Necklaces</h3>
                  </div>
                </div>
              </div>

              {/* Category 4: Mangalsutras (Subtle Inverted Arch) */}
              <div 
                onClick={() => { setSelectedCategory('Mangalsutras'); setActiveTab('shop'); }}
                className="group cursor-pointer space-y-3"
              >
                <div className="relative h-96 shape-arch-inverted overflow-hidden bg-white border-2 border-[#E5BDB0] shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80" 
                    alt="Mangalsutras" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/85 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                    <span className="text-[10px] font-bold text-[#E5BDB0] uppercase tracking-widest block mb-1">Modern Solitaire Heritage</span>
                    <h3 className="font-serif-luxury text-2xl font-normal">Mangalsutras</h3>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SIGNATURE COLLECTIONS (Liquid Glass Cards with Colorful Accent Highlights) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5BDB0]/60 pb-4">
              <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">bestselling pieces</span>
                <h2 className="font-serif-luxury text-4xl sm:text-5xl font-normal text-[#1A2536]">
                  Signature Designs
                </h2>
              </div>

              {/* Dynamic Karat Switcher */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase text-[#1A2536]/80">Gold Purity:</span>
                <div className="bg-white p-1 rounded-full border border-[#E5BDB0] shadow-sm flex text-xs">
                  <button 
                    onClick={() => setGlobalKarat('14KT')}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${globalKarat === '14KT' ? 'bg-[#1A2536] text-white shadow-md' : 'text-[#1A2536]/70 hover:text-[#1A2536]'}`}
                  >
                    14KT Gold
                  </button>
                  <button 
                    onClick={() => setGlobalKarat('18KT')}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${globalKarat === '18KT' ? 'bg-[#1A2536] text-white shadow-md' : 'text-[#1A2536]/70 hover:text-[#1A2536]'}`}
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
                    className="group glass-card-vibrant rounded-[32px] overflow-hidden p-4 border border-[#E5BDB0]/60 hover:shadow-2xl hover:border-[#B86B5A] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative">
                      {/* Product Image */}
                      <div 
                        onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                        className="relative h-72 rounded-[24px] overflow-hidden bg-white cursor-pointer border border-[#E5BDB0]/30"
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
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#1A2536] hover:bg-white transition-all"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B86B5A] text-[#B86B5A]' : 'text-[#1A2536]'}`} />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        {product.bestseller && (
                          <span className="px-3 py-1 rounded-full bg-[#1A2536] text-[#E5BDB0] text-[10px] font-bold uppercase tracking-wider">
                            ★ Iconic Bestseller
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold tracking-wider uppercase border border-amber-300">
                          {globalKarat} Solid Gold
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="pt-4 px-1 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 
                          onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                          className="font-serif-luxury text-xl font-medium text-[#1A2536] hover:text-[#B86B5A] cursor-pointer leading-snug"
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#B86B5A] font-bold flex items-center gap-2">
                        <span>{product.diamondWeight} Natural Diamond</span>
                        <span>•</span>
                        <span>{product.diamondClarity}</span>
                      </p>

                      <div className="pt-3 flex items-center justify-between border-t border-[#E5BDB0]/40">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Natural Diamond & Gold</p>
                          <p className="font-extrabold text-xl text-[#1A2536]">
                            {formatINR(currentPrice)}
                          </p>
                        </div>

                        <button 
                          onClick={() => addToCart(product, globalKarat, product.metalOptions[0])}
                          className="px-5 py-2.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold rounded-full transition-all shadow-md flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#E5BDB0]" /> Add
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>

          {/* CARATLANE TRY AT HOME BANNER (Vibrant Rose & Deep Navy Gradient) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-[#1A2536] via-[#223046] to-[#1A2536] text-white p-8 sm:p-14 border-2 border-[#E5BDB0]/40 shadow-2xl">
              
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5BDB0]/20 text-[#E5BDB0] text-xs font-bold uppercase tracking-wider border border-[#E5BDB0]/40">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Free Doorstep Service in 50+ Cities
                  </div>

                  <div className="space-y-2">
                    <span className="font-cursive text-3xl text-[#E5BDB0] block">experience before you decide</span>
                    <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal leading-tight">
                      Try YA-RA Natural Diamonds in Your Home.
                    </h2>
                  </div>

                  <p className="text-gray-200 font-light text-sm sm:text-base leading-relaxed max-w-xl">
                    Our certified jewellery consultants bring shortlisted 14KT & 18KT diamond rings, earrings, and necklaces right to your doorstep with zero buying obligation.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button 
                      onClick={() => setIsTryAtHomeOpen(true)}
                      className="px-8 py-4 bg-gradient-rose hover:opacity-95 text-[#1A2536] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl"
                    >
                      Book Free Home Appointment
                    </button>
                    <span className="text-xs text-[#E5BDB0] font-semibold">100% Insured • Free Cleaning Included</span>
                  </div>
                </div>

                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="w-72 sm:w-80 h-96 shape-asymmetric overflow-hidden border-4 border-[#E5BDB0] shadow-2xl relative">
                    <img 
                      src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80" 
                      alt="Try at Home" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2536]/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-center glass-card-vibrant p-3 rounded-2xl border border-white/60">
                      <p className="text-xs font-bold text-[#1A2536]">100% Sanitized & Safe Hand Carry</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

        </main>
      )}

      {/* VIEW B: PRODUCT LISTING / CATEGORY PAGE */}
      {activeTab === 'shop' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#1A2536] to-[#25364d] text-white p-8 sm:p-12 border border-[#E5BDB0]/40 shadow-xl">
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="font-cursive text-3xl text-[#E5BDB0]">fine jewellery edit</span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl font-normal">
                {selectedCategory === 'All' ? 'All Natural Diamond Jewellery' : `${selectedCategory} Collection`}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm font-light">
                Explore handcrafted solid 14KT & 18KT gold designs with certified natural earth-mined diamonds.
              </p>
            </div>
            <div className="absolute right-[-20px] top-[-20px] w-72 h-72 bg-[#E5BDB0]/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Filtering Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card-vibrant p-4 rounded-2xl border border-[#E5BDB0]">
            
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {['All', 'Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Mangalsutras'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#1A2536] text-white shadow-md' : 'bg-white text-[#1A2536] border border-gray-200 hover:border-[#B86B5A]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setIsFilterDrawerOpen(true)}
                className="px-4 py-2 bg-white text-[#1A2536] border border-[#E5BDB0] rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B86B5A]" /> Filters
              </button>

              <div className="flex items-center bg-white p-1 rounded-full border border-gray-200 text-xs">
                <button 
                  onClick={() => setGlobalKarat('14KT')}
                  className={`px-3 py-1 rounded-full font-bold ${globalKarat === '14KT' ? 'bg-[#1A2536] text-white' : 'text-gray-600'}`}
                >
                  14KT
                </button>
                <button 
                  onClick={() => setGlobalKarat('18KT')}
                  className={`px-3 py-1 rounded-full font-bold ${globalKarat === '18KT' ? 'bg-[#1A2536] text-white' : 'text-gray-600'}`}
                >
                  18KT
                </button>
              </div>
            </div>

          </div>

          {/* Product Grid */}
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
                    className="group glass-card-vibrant rounded-[32px] overflow-hidden p-4 border border-[#E5BDB0]/60 hover:shadow-2xl hover:border-[#B86B5A] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative">
                      <div 
                        onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                        className="relative h-72 rounded-[24px] overflow-hidden bg-white cursor-pointer border border-[#E5BDB0]/30"
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
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#1A2536]"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B86B5A] text-[#B86B5A]' : 'text-[#1A2536]'}`} />
                      </button>

                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold tracking-wider uppercase border border-amber-300">
                          {globalKarat} Solid Gold
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 px-1 space-y-2">
                      <h3 
                        onClick={() => { setSelectedProduct(product); setActiveTab('product'); }}
                        className="font-serif-luxury text-xl font-medium text-[#1A2536] hover:text-[#B86B5A] cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#B86B5A] font-bold">{product.diamondWeight} Natural • {product.diamondClarity}</p>
                      <p className="text-xs text-emerald-700 font-semibold">✨ Ready to Ship ({product.deliveryDays})</p>

                      <div className="pt-3 flex items-center justify-between border-t border-[#E5BDB0]/40">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Natural Diamond & Gold</p>
                          <p className="font-extrabold text-xl text-[#1A2536]">{formatINR(currentPrice)}</p>
                        </div>

                        <button 
                          onClick={() => addToCart(product, globalKarat, product.metalOptions[0])}
                          className="px-5 py-2.5 bg-[#1A2536] text-white text-xs font-bold rounded-full hover:bg-[#111A29] transition-all"
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

      {/* VIEW C: PRODUCT DETAIL PAGE (PDP) */}
      {activeTab === 'product' && selectedProduct && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-[480px] sm:h-[540px] shape-arch overflow-hidden bg-white shadow-xl border-2 border-[#E5BDB0]">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-4 left-4 glass-card-vibrant px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 text-[#1A2536] border border-[#E5BDB0]">
                  <Award className="w-4 h-4 text-[#D4AF37]" /> 100% IGI & SGL Natural Diamond Certificate
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="h-28 rounded-2xl overflow-hidden border-2 border-[#1A2536] cursor-pointer">
                  <img src={selectedProduct.image} alt="Thumb 1" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 rounded-2xl overflow-hidden border border-[#E5BDB0] opacity-80 hover:opacity-100 cursor-pointer">
                  <img src={selectedProduct.hoverImage} alt="Thumb 2" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 rounded-2xl overflow-hidden border border-[#E5BDB0] bg-[#FAF7F2] flex items-center justify-center text-xs font-bold text-[#B86B5A]">
                  + IGI Certificate
                </div>
              </div>
            </div>

            {/* Config & Buy */}
            <div className="lg:col-span-5 space-y-6">
              
              <div>
                <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">handcrafted solitaire</span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
                  {selectedProduct.name}
                </h1>
                <p className="text-xs font-semibold text-gray-500 mt-1">Product Code: {selectedProduct.id.toUpperCase()}</p>
              </div>

              {/* Price & Price Breakup */}
              <div className="glass-card-vibrant p-5 rounded-3xl border border-[#E5BDB0] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block uppercase">Final Price ({globalKarat} Solid Gold)</span>
                    <span className="text-3xl font-extrabold text-[#1A2536]">
                      {formatINR(globalKarat === '14KT' ? selectedProduct.price14k : selectedProduct.price18k)}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Includes 3% GST & Insured Express Delivery
                  </span>
                </div>

                <button 
                  onClick={() => setIsPriceBreakupOpen(true)}
                  className="w-full pt-3 border-t border-[#E5BDB0]/60 text-xs font-bold text-[#B86B5A] hover:underline flex items-center justify-between"
                >
                  <span>View Detailed Price Breakup (Gold, Diamond & Making)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Gold Purity Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A2536]">Gold Purity Options:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setGlobalKarat('14KT')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${globalKarat === '14KT' ? 'border-[#1A2536] bg-[#1A2536] text-white shadow-md' : 'border-[#E5BDB0] bg-white text-gray-800'}`}
                  >
                    <div className="font-bold text-sm">14KT Solid Gold</div>
                    <div className="text-[11px] opacity-80">{formatINR(selectedProduct.price14k)}</div>
                  </button>

                  <button 
                    onClick={() => setGlobalKarat('18KT')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${globalKarat === '18KT' ? 'border-[#1A2536] bg-[#1A2536] text-white shadow-md' : 'border-[#E5BDB0] bg-white text-gray-800'}`}
                  >
                    <div className="font-bold text-sm">18KT Solid Gold</div>
                    <div className="text-[11px] opacity-80">{formatINR(selectedProduct.price18k)}</div>
                  </button>
                </div>
              </div>

              {/* Pincode Check */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B86B5A]" /> Check Delivery & COD:
                </label>
                
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 px-4 py-2.5 rounded-full border border-[#E5BDB0] text-xs font-semibold focus:outline-none focus:border-[#1A2536] bg-white"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#1A2536] text-white text-xs font-bold rounded-full hover:bg-[#111A29]"
                  >
                    Check
                  </button>
                </form>

                {pincodeStatus && pincodeStatus.valid && (
                  <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-900 space-y-1 border border-emerald-300">
                    <p className="font-bold">✓ Insured delivery available for pincode {pincode}</p>
                    <p>• {pincodeStatus.date}</p>
                    <p>• Cash on Delivery (COD) available up to ₹50,000</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => addToCart(selectedProduct, globalKarat, selectedProduct.metalOptions[0])}
                  className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E5BDB0]" /> Add To Shopping Bag
                </button>

                <button 
                  onClick={() => setIsTryAtHomeOpen(true)}
                  className="w-full py-3.5 bg-gradient-rose hover:opacity-95 text-[#1A2536] font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MapPin className="w-4 h-4" /> Book Free Try At Home
                </button>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* VIEW D: SHOPPING BAG */}
      {activeTab === 'cart' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="border-b border-[#E5BDB0] pb-4">
            <span className="font-cursive text-3xl text-[#B86B5A]">your luxury selections</span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">
              Shopping Bag ({cart.reduce((a, b) => a + b.qty, 0)} Items)
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag className="w-16 h-16 text-[#B86B5A] mx-auto" />
              <h3 className="font-serif-luxury text-2xl text-gray-600">Your bag is empty</h3>
              <button 
                onClick={() => setActiveTab('shop')}
                className="px-6 py-3 bg-[#1A2536] text-white text-xs uppercase font-bold rounded-full"
              >
                Explore Jewellery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item, idx) => {
                  const price = item.karat === '14KT' ? item.product.price14k : item.product.price18k;

                  return (
                    <div key={idx} className="glass-card-vibrant p-4 rounded-3xl border border-[#E5BDB0] flex gap-4 items-center">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-24 h-24 rounded-2xl object-cover bg-white border border-[#E5BDB0]/40" 
                      />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536]">{item.product.name}</h3>
                        <p className="text-xs text-[#B86B5A] font-bold">Purity: {item.karat} Solid Gold | Tone: {item.metal}</p>
                        <p className="text-xs font-bold text-emerald-700">✓ 100% Natural Diamond Guaranteed</p>
                        <p className="font-extrabold text-[#1A2536] pt-1">{formatINR(price * item.qty)}</p>
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
                          className="w-8 h-8 rounded-full bg-white border border-[#E5BDB0] flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <button 
                          onClick={() => setCart(cart.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c))}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5BDB0] flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-4 glass-card-vibrant p-6 rounded-3xl border border-[#E5BDB0] space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A2536]">Order Summary</h3>
                
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatINR(cart.reduce((a, b) => a + (b.karat === '14KT' ? b.product.price14k : b.product.price18k) * b.qty, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Pan-India Express Delivery</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (3%)</span>
                    <span className="text-gray-400">Included</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5BDB0] flex justify-between items-baseline font-extrabold text-lg text-[#1A2536]">
                  <span>Total Amount</span>
                  <span>{formatINR(cart.reduce((a, b) => a + (b.karat === '14KT' ? b.product.price14k : b.product.price18k) * b.qty, 0))}</span>
                </div>

                <button 
                  onClick={() => setActiveTab('checkout')}
                  className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl"
                >
                  Proceed to Checkout
                </button>
              </div>

            </div>
          )}
        </main>
      )}

      {/* VIEW E: CHECKOUT */}
      {activeTab === 'checkout' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="border-b border-[#E5BDB0] pb-4 text-center">
            <span className="font-cursive text-3xl text-[#B86B5A]">secure Indian checkout</span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">
              Complete Your Order
            </h1>
          </div>

          <div className="glass-card-vibrant p-6 sm:p-8 rounded-3xl border border-[#E5BDB0] space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase text-[#1A2536] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B86B5A]" /> Delivery Address (India)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <input type="text" placeholder="Full Name" className="px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" defaultValue="Aditi Sharma" />
                <input type="text" placeholder="Mobile Number (+91)" className="px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" defaultValue="+91 9876543210" />
                <input type="text" placeholder="Street Address" className="sm:col-span-2 px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" defaultValue="402, Signature Towers, Golf Course Road" />
                <input type="text" placeholder="City" className="px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" defaultValue="Gurugram" />
                <input type="text" placeholder="Pincode" className="px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" defaultValue="122002" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#E5BDB0]">
              <h3 className="font-bold text-sm uppercase text-[#1A2536] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B86B5A]" /> Indian Payment Gateways
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#1A2536] bg-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" defaultChecked />
                    <span className="font-bold text-xs text-[#1A2536]">UPI Instant (GPay, PhonePe, Paytm, BHIM)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Fastest</span>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" />
                    <span className="font-bold text-xs text-[#1A2536]">Credit / Debit Cards (No Cost EMI Available)</span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={() => {
                alert('Order Placed! Thank you for choosing YA-RA.');
                setCart([]);
                setActiveTab('account');
              }}
              className="w-full py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl"
            >
              Pay & Place Order Securely
            </button>
          </div>
        </main>
      )}

      {/* VIEW F: ACCOUNT */}
      {activeTab === 'account' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="border-b border-[#E5BDB0] pb-4">
            <span className="font-cursive text-3xl text-[#B86B5A]">welcome back</span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[#1A2536]">
              My YA-RA Account
            </h1>
          </div>

          <div className="glass-card-vibrant p-6 rounded-3xl border border-[#E5BDB0] space-y-4">
            <h3 className="font-bold text-sm uppercase text-[#1A2536]">Recent Certified Jewelry Orders</h3>
            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-xs border-b pb-2">
                <span className="font-bold text-[#1A2536]">Order #YARA-94820</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Out For Insured Delivery</span>
              </div>
              <div className="flex items-center gap-4">
                <img src={MOCK_PRODUCTS[0].image} alt="Order item" className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <h4 className="font-serif-luxury font-semibold text-base">{MOCK_PRODUCTS[0].name}</h4>
                  <p className="text-xs text-[#B86B5A] font-bold">18KT Solid Gold • VVS Natural Diamond</p>
                  <p className="font-bold text-xs mt-1">{formatINR(MOCK_PRODUCTS[0].price18k)}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* MODALS & DRAWERS */}

      {/* PRICE BREAKUP MODAL */}
      {isPriceBreakupOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-vibrant max-w-lg w-full p-6 rounded-3xl space-y-6 border border-[#E5BDB0] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-[#E5BDB0] pb-3">
              <div>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Transparent Price Breakup</h3>
                <p className="text-xs text-[#B86B5A] font-bold">YA-RA Honest Indian Pricing Model</p>
              </div>
              <button onClick={() => setIsPriceBreakupOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span>Gold Component ({globalKarat === '14KT' ? selectedProduct.goldWeight14k : selectedProduct.goldWeight18k}g)</span>
                <span className="font-bold">{formatINR(globalKarat === '14KT' ? selectedProduct.price14k * 0.45 : selectedProduct.price18k * 0.48)}</span>
              </div>
              <div className="flex justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span>Natural Diamond Component ({selectedProduct.diamondWeight})</span>
                <span className="font-bold">{formatINR(globalKarat === '14KT' ? selectedProduct.price14k * 0.40 : selectedProduct.price18k * 0.40)}</span>
              </div>
              <div className="flex justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span>Making Charges</span>
                <span className="font-bold">{formatINR(selectedProduct.makingCharge)}</span>
              </div>
              <div className="flex justify-between p-3 bg-white rounded-xl border border-gray-100">
                <span>GST (3%)</span>
                <span className="font-bold">{formatINR(globalKarat === '14KT' ? selectedProduct.price14k * 0.03 : selectedProduct.price18k * 0.03)}</span>
              </div>
            </div>

            <div className="p-4 bg-[#1A2536] text-white rounded-2xl flex justify-between items-center font-bold text-sm">
              <span>Final Total ({globalKarat})</span>
              <span>{formatINR(globalKarat === '14KT' ? selectedProduct.price14k : selectedProduct.price18k)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TRY AT HOME MODAL */}
      {isTryAtHomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-vibrant max-w-lg w-full p-6 sm:p-8 rounded-3xl space-y-6 border border-[#E5BDB0]">
            <div className="flex justify-between items-center border-b border-[#E5BDB0] pb-3">
              <div>
                <span className="font-cursive text-2xl text-[#B86B5A]">doorstep luxury</span>
                <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Book Free Try At Home</h3>
              </div>
              <button onClick={() => setIsTryAtHomeOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Appointment Reserved!'); setIsTryAtHomeOpen(false); }} className="space-y-4 text-xs">
              <input type="text" placeholder="Your Name" required className="w-full px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" />
              <input type="tel" placeholder="Mobile Number (+91)" required className="w-full px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" />
              <input type="text" placeholder="Pincode & City" required className="w-full px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" defaultValue="110001 - New Delhi" />
              <input type="date" required className="w-full px-4 py-3 rounded-xl border border-[#E5BDB0] bg-white font-medium" />

              <button type="submit" className="w-full py-4 bg-[#1A2536] text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-xl">
                Confirm Free Appointment Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536]">Refine Selection</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-[#1A2536]">Maximum Price:</label>
              <input 
                type="range" 
                min="30000" 
                max="300000" 
                step="10000" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#1A2536]"
              />
              <p className="text-sm font-extrabold text-[#B86B5A]">{formatINR(priceRange)}</p>
            </div>

            <button 
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-4 bg-[#1A2536] text-white text-xs font-bold uppercase tracking-widest rounded-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="bg-[#1A2536] text-white pt-16 pb-12 border-t-2 border-[#D4AF37]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="font-serif-luxury text-3xl tracking-widest font-normal text-white">YA-RA</span>
              <p className="font-cursive text-2xl text-[#E5BDB0]">fine natural diamond jewellery</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Handcrafted solid 14KT & 18KT gold studded exclusively with earth-mined certified natural diamonds.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37]">Collections</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => { setSelectedCategory('Rings'); setActiveTab('shop'); }} className="hover:text-white">Solitaire Rings</button></li>
                <li><button onClick={() => { setSelectedCategory('Earrings'); setActiveTab('shop'); }} className="hover:text-white">Diamond Earrings</button></li>
                <li><button onClick={() => { setSelectedCategory('Necklaces'); setActiveTab('shop'); }} className="hover:text-white">Fine Necklaces</button></li>
                <li><button onClick={() => { setSelectedCategory('Mangalsutras'); setActiveTab('shop'); }} className="hover:text-white">Solitaire Mangalsutras</button></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37]">Trust Guarantees</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span>IGI & SGL Certificate Verification</span></li>
                <li><span>Lifetime 80-90% Buyback Policy</span></li>
                <li><span>BIS Hallmarking Standard</span></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm uppercase tracking-wider text-[#D4AF37]">Concierge</h4>
              <p className="text-gray-300">WhatsApp / Call: +91 98765 43210</p>
              <p className="text-gray-300">Email: concierge@yara-jewellery.in</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
            <p>© 2026 YA-RA Fine Jewellery Pvt. Ltd. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}