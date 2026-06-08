"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { showToast } from "@/components/ui/Toast";

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {   
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/dashboard';
        } catch (err) { showToast.error(err .response?.data?.message || "Login failed"); }
        finally { setLoading(false); }
    };

    const googleSuccess = async (response) => {
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, { token: response.credential });
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/dashboard';
        } catch (err) { showToast.error("Google Sign-In failed. Please try again."); }
    };

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration: 0.3}} className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-premium border border-brand-border">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-brand-dark tracking-tight">Welcome Back</h1>
                    <p className="text-brand-muted text-sm font-medium mt-2">Resume your systematic preparation</p>
                </div>

                <div className="flex justify-center mb-8">
                    <GoogleLogin
    onSuccess={googleSuccess}
    onError={() =>
        showToast.error("Google sign-in failed. Please try again.")
    }
    theme="filled_black"
    shape="pill"
    text="continue_with"
/>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] bg-brand-border flex-1"></div>
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">or email</span>
                    <div className="h-[1px] bg-brand-border flex-1"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-brand-muted" size={18} />
                        <input type="email" required className="w-full pl-12 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-brand-muted" size={18} />
                        <input type="password" required className="w-full pl-12 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    <div className="flex justify-end px-2">
                        <Link href="/forgot-password" size={18} className="text-xs font-bold text-brand-accent hover:underline">Forgot Password?</Link>
                    </div>

                    <button disabled={loading} className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black shadow-lg hover:bg-brand-accent transition-all flex items-center justify-center gap-3">
                        {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={20}/>
                    </button>
                </form>

                <p className="text-center mt-10 text-sm font-medium text-brand-muted">
                    New here? <Link href="/signup" className="text-brand-accent font-black">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
}