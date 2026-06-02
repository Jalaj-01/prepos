"use client";

import { useState } from 'react';

import { motion } from 'framer-motion';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { GoogleLogin } from '@react-oauth/google';

import axios from 'axios';

import {
    Calendar,
    Mail,
    Lock,
    User,
    ArrowRight
} from 'lucide-react';

export default function Signup() {

    const [formData, setFormData] = useState({

        name: '',
        email: '',
        password: '',
        targetCompletionDate: ''
    });

    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // =========================
    // STANDARD EMAIL/PASSWORD SIGNUP
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const { data } = await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,

                formData
            );

            localStorage.setItem(
                'userInfo',
                JSON.stringify(data)
            );

            // CRITICAL: Mark as new user for onboarding tour

            localStorage.setItem('just-signed-up', 'true');

            router.push('/dashboard');

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // GOOGLE SIGNUP LOGIC
    // =========================

    const googleSuccess = async (response) => {

        if (!formData.targetCompletionDate) {

            alert("Please select a Target Completion Date first!");

            return;
        }

        setLoading(true);

        try {

            const { data } = await axios.post(

                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,

                {
                    token: response.credential,
                    targetCompletionDate: formData.targetCompletionDate
                }
            );

            localStorage.setItem(
                'userInfo',
                JSON.stringify(data)
            );

            // CRITICAL: Mark as new user for onboarding tour

            localStorage.setItem('just-signed-up', 'true');

            router.push('/dashboard');

        } catch (err) {

            alert("Google Sign-In failed");

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full bg-white rounded-[40px] shadow-premium p-10 border border-brand-border"
            >

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-black text-brand-dark tracking-tight">

                        Join PrepOS

                    </h1>

                    <p className="text-brand-muted text-sm font-medium mt-2">

                        Initialize your systematic preparation

                    </p>

                </div>

                {/* 1. Date Picker (Must be filled for Google too) */}

                <div className="mb-8">

                    <label className="text-[10px] font-black uppercase text-brand-muted ml-1 tracking-widest flex items-center gap-2 mb-2">

                        <Calendar size={12} />

                        Target Completion Date

                    </label>

                    <input
                        required
                        type="date"
                        className="w-full p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent transition-all cursor-pointer"
                        onChange={(e) =>
                            setFormData({ ...formData, targetCompletionDate: e.target.value })
                        }
                    />

                    <p className="text-[9px] text-brand-muted mt-2 px-1 leading-relaxed italic">

                        * Required to calculate your daily MCQ targets.

                    </p>

                </div>

                {/* 2. Google Button */}

                <div className="flex justify-center mb-8">

                    <GoogleLogin
                        onSuccess={googleSuccess}
                        onError={() => alert("Google Sign-In Failed")}
                        theme="filled_black"
                        shape="pill"
                        text="signup_with"
                        width="100%"
                    />

                </div>

                <div className="flex items-center gap-4 mb-8">

                    <div className="h-[1px] bg-brand-border flex-1"></div>

                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">

                        or use email

                    </span>

                    <div className="h-[1px] bg-brand-border flex-1"></div>

                </div>

                {/* 3. Standard Form */}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="relative">

                        <User
                            className="absolute left-4 top-4 text-brand-muted"
                            size={18}
                        />

                        <input
                            required
                            type="text"
                            className="w-full pl-12 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent"
                            placeholder="Full Name"
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />

                    </div>

                    <div className="relative">

                        <Mail
                            className="absolute left-4 top-4 text-brand-muted"
                            size={18}
                        />

                        <input
                            required
                            type="email"
                            className="w-full pl-12 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent"
                            placeholder="Email Address"
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                    </div>

                    <div className="relative">

                        <Lock
                            className="absolute left-4 top-4 text-brand-muted"
                            size={18}
                        />

                        <input
                            required
                            type="password"
                            className="w-full pl-12 p-4 bg-brand-light border border-brand-border rounded-2xl font-bold outline-none focus:border-brand-accent"
                            placeholder="Create Password"
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />

                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-brand-dark text-white p-5 rounded-[24px] font-black shadow-lg hover:bg-brand-accent transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                    >
                        {loading ? "Creating Profile..." : "Initialize Preparation"}
                        <ArrowRight size={20} />
                    </button>

                </form>

                <p className="text-center text-sm text-brand-muted mt-8 font-medium">

                    Already a member?{" "}

                    <Link
                        href="/login"
                        className="text-brand-accent font-black hover:underline"
                    >
                        Sign In
                    </Link>

                </p>

            </motion.div>

        </div>
    );
}