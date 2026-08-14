import { Link, useParams } from "react-router-dom";
import usePageTitle from "../utils/usePageTitle";

export default function OrderConfirmedPage() {
    const { orderNumber } = useParams();
    usePageTitle("Order Confirmed");

    return (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-ink flex items-center justify-center text-blush">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <p className="eyebrow mb-3">Order Confirmed</p>
            <h1 className="font-serif text-5xl mb-4">Thank You For Your Order!</h1>
            <p className="text-sm text-ink/70 mb-10 leading-relaxed max-w-md mx-auto">
                Your order <span className="font-semibold text-ink">{orderNumber ?? "#YARA-892341"}</span> has been confirmed and is fully insured. A confirmation email with tracking details will be sent shortly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/account" className="btn-solid">Track Order</Link>
                <Link to="/" className="btn-outline">Continue Shopping</Link>
            </div>
        </div>
    );
}