'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldAlert, Mail, Key, Loader2, Fingerprint } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
    const router = useRouter()

    const [isLoginMode, setIsLoginMode] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            if (isLoginMode) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) {
                    setError(error.message)
                    setIsLoading(false)
                    return
                }

                if (data.session) {
                    document.cookie = "admin_auth=true; path=/; max-age=86400"; // 24 hours
                    router.push('/')
                }
            } else {
                // Sign up mode
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                })

                if (error) {
                    setError(error.message)
                } else {
                    setSuccessMessage('Registration successful! Please log in.')
                    if (data.session) {
                        document.cookie = "admin_auth=true; path=/; max-age=86400";
                        router.push('/')
                    } else {
                        setIsLoginMode(true) // Switch to login so they can log in
                    }
                }
            }
        } catch (err) {
            setError('An unexpected error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#ec4899]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ec4899]/5 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] relative z-10"
            >
                {/* Logo Area */}
                <div className="flex justify-center mb-10">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Fingerprint className="w-8 h-8 text-[#ec4899]" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ec4899]/50 to-transparent" />
                    
                    <div className="mb-8">
                        <h1 className="text-2xl text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {isLoginMode ? 'System Access' : 'Register Admin'}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {isLoginMode ? 'Authenticate to enter the Crelligent OS environment.' : 'Create a new administrative account.'}
                        </p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm"
                        >
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    {successMessage && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-3 text-green-400 text-sm"
                        >
                            <p>{successMessage}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[#ec4899] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@crelligent.com"
                                    required
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#ec4899]/50 focus:ring-1 focus:ring-[#ec4899]/50 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Key className="w-5 h-5 text-gray-500 group-focus-within:text-[#ec4899] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your security key"
                                    required
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#ec4899]/50 focus:ring-1 focus:ring-[#ec4899]/50 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white rounded-xl py-4 flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLoginMode ? 'Authenticate' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <button 
                            type="button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setError(null);
                                setSuccessMessage(null);
                            }} 
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            {isLoginMode ? "Need an account? Sign up" : "Already have an account? Log in"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">
                        Secured by ESRE OS Intelligence
                    </p>
                </div>
            </motion.div>
        </main>
    )
}
