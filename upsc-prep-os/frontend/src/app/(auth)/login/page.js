"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-premium p-8 border border-brand-border"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">Welcome Back</h1>
                    <p className="text-brand-muted mt-2">Resume your systematic preparation.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-brand-dark ml-1">Email</label>
                        <input 
                            required
                            type="email" 
                            className="w-full mt-1 p-4 bg-brand-light border border-brand-border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all"
                            placeholder="email@example.com"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-brand-dark ml-1">Password</label>
                        <input 
                            required
                            type="password" 
                            className="w-full mt-1 p-4 bg-brand-light border border-brand-border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all"
                            placeholder="••••••••"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        disabled={loading}
                        className="w-full bg-brand-dark text-white p-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg mt-4 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-brand-muted mt-8 font-medium">
                    New to the platform? <Link href="/signup" className="text-brand-accent font-bold hover:underline">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
}