import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import AccountPage from "./pages/Account";
import AuthPage from "./pages/Auth";
import CartPage from "./pages/Cart";
import CategoryPage from "./pages/Category";
import CheckoutPage from "./pages/Checkout";
import Home from "./pages/Home";
import ProductPage from "./pages/Product";

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => window.scrollTo(0, 0), [pathname]);
    return null;
}

function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <CategoryProvider>
                        <ScrollToTop />
                        <div className="grain" aria-hidden="true" />
                        <div className="flex min-h-screen flex-col">
                            <Navbar />
                            <main className="flex-1">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/category/:slug" element={<CategoryPage />} />
                                    <Route path="/product/:slug" element={<ProductPage />} />
                                    <Route path="/login" element={<AuthPage />} />
                                    <Route path="/register" element={<AuthPage />} />
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
                                    <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                    </CategoryProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}