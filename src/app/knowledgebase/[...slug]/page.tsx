import React from 'react'
import { getKnowledgeBaseContent } from '@/lib/content'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function DocumentPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const [folder, file] = slug;
    const content = getKnowledgeBaseContent(folder, file)

    if (!content) {
        notFound()
    }

    return (
        <div className="relative min-h-screen bg-[#04060D]">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-[#7B61FF]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#38BDF8]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative py-12 px-12 lg:py-20 lg:px-24 max-w-3xl mx-auto">
                {/* Premium Glassmorphic Article Container */}
                <article className="prose prose-invert max-w-none 
                    /* Typography Base */
                    font-outfit font-light prose-p:text-white/60 prose-p:leading-loose prose-p:text-[15px] prose-p:tracking-wide
                    
                    /* Headings */
                    prose-headings:font-extralight prose-headings:tracking-wider
                    prose-h1:text-4xl prose-h1:font-light prose-h1:mb-12 prose-h1:bg-gradient-to-br prose-h1:from-white prose-h1:to-white/40 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:pb-6 prose-h1:border-b prose-h1:border-white/5
                    prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-white/90 prose-h2:font-light
                    prose-h3:text-lg prose-h3:text-white/80 prose-h3:font-light prose-h3:mt-12
                    
                    /* Links */
                    prose-a:text-[#38BDF8] hover:prose-a:text-[#7B61FF] prose-a:transition-colors prose-a:font-normal prose-a:decoration-white/20 hover:prose-a:decoration-[#7B61FF]
                    
                    /* Bold & Strong */
                    prose-strong:text-white/90 prose-strong:font-normal
                    
                    /* Lists */
                    prose-ul:text-white/60 prose-ul:text-[15px] prose-li:my-2 prose-li:marker:text-[#7B61FF]/60
                    
                    /* Tables (Glassmorphic) */
                    prose-table:w-full prose-table:text-[14px] prose-table:text-left prose-table:rounded-xl prose-table:overflow-hidden prose-table:border-collapse
                    prose-th:bg-white/[0.02] prose-th:backdrop-blur-md prose-th:p-4 prose-th:font-normal prose-th:text-white/80 prose-th:border-b prose-th:border-white/5 prose-th:uppercase prose-th:tracking-widest prose-th:text-[11px]
                    prose-td:p-4 prose-td:border-b prose-td:border-white/5 prose-td:text-white/60 hover:prose-tr:bg-white/[0.015] prose-tr:transition-colors
                    
                    /* Blockquotes (Premium Callouts) */
                    prose-blockquote:border-none prose-blockquote:bg-gradient-to-r prose-blockquote:from-[#7B61FF]/5 prose-blockquote:to-transparent prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:text-white/70 prose-blockquote:not-italic prose-blockquote:rounded-2xl prose-blockquote:my-10 prose-blockquote:font-light prose-blockquote:text-[15px] prose-blockquote:leading-loose
                    
                    /* Inline Code & HR */
                    prose-code:bg-white/5 border border-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-[#38BDF8]/80 prose-code:font-mono prose-code:text-[12px] prose-code:font-light prose-code:before:content-none prose-code:after:content-none
                    prose-hr:border-white/5 prose-hr:my-16
                ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </article>
            </div>
        </div>
    )
}
