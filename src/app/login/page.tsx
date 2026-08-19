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
                    setSuccessMessage('Registration successful! Please check your email to verify your account, or log in if email confirmation is disabled.')
                    // Optionally auto-login if email confirmation is disabled on Supabase
                    if (data.session) {
                        document.cookie = "admin_auth=true; path=/; max-age=86400";
                        router.push('/')
                    } else {
                        setIsLoginMode(true) // Switch to login so they can log in after verifying
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
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden font-sans">
            
            {/* Topographical / Grid Overlay for internal ops vibe */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-[0.03] mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10 p-6"
            >
                {/* Security Badge */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Fingerprint className="w-8 h-8 text-white/50" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-2xl font-medium tracking-tight mb-2">Restricted Access</h2>
                    <p className="text-white/40 text-sm">Crelligent Internal Operations</p>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Amber Warning Strip */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 to-orange-500/50" />

                    <div className="space-y-4 mb-8">
                        <button className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3.5 rounded-xl text-sm font-medium" onClick={(e) => e.preventDefault()}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Authenticate via Workspace
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-[1px] flex-1 bg-white/5" />
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
