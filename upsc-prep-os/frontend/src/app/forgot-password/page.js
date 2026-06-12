"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowRight, KeyRound, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });
            setStep(2);
       } catch (err) { showToast.error(err.response?.data?.message || "Couldn't send OTP"); }
        finally { setLoading(false); }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, { email, otp, newPassword });
           showToast.success("Password reset successful! Please log in.");
            window.location.href = '/login';
       } catch (err) { showToast.error(err.response?.data?.message || "Invalid OTP"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-premium border border-brand-border">
                <Link href="/login" className="flex items-center gap-1 text-brand-muted hover:text-brand-dark mb-8 text-xs font-black uppercase tracking-widest"><ChevronLeft size={14}/> Back</Link>
                
                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="bg-brand-accent/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 text-brand-accent"><Mail size={32}/></div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Forgot Password?</h2>
                        <p className="text-brand-muted text-sm font-medium mb-8 leading-relaxed">No worries. We will send a 6-digit verification code to your registered email.</p>
                        <input type="email" required className="w-full p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent mb-6" placeholder="Registered Email" onChange={e => setEmail(e.target.value)} />
                        <button disabled={loading} className="w-full bg-brand-dark text-white p-5 rounded-[22px] font-black flex items-center justify-center gap-3">{loading ? "Sending..." : "Send OTP"} <ArrowRight size={20}/></button>
                    </form>
                ) : (
                    <form onSubmit={handleReset}>
                        <div className="bg-status-success/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 text-status-success"><KeyRound size={32}/></div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Reset Password</h2>
                        <p className="text-brand-muted text-sm font-medium mb-8 leading-relaxed">Enter the code we sent to <b>{email}</b></p>
                        <div className="space-y-4">
                            <input type="text" required maxLength="6" className="w-full p-4 bg-brand-light border border-brand-border rounded-2xl font-black text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-accent" placeholder="000000" onChange={e => setOtp(e.target.value)} />
                            <input type="password" required className="w-full p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent" placeholder="New Password" onChange={e => setNewPassword(e.target.value)} />
                            <button disabled={loading} className="w-full bg-brand-dark text-white p-5 rounded-[22px] font-black mt-4">{loading ? "Resetting..." : "Complete Reset"}</button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}