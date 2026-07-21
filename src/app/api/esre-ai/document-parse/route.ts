import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const maxDuration = 60 // Allow longer processing for documents

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('document') as File

    if (!file) {
      return NextResponse.json({ error: 'No document uploaded' }, { status: 400 })
    }

    // In a full implementation, we would extract text from the PDF/DOCX here.
    // Anthropic Claude 3.5 Sonnet supports vision/document parsing natively in some SDKs,
    // but for text files we can read directly. For this MVP, we simulate reading the text:
    const fileText = await file.text().catch(() => "Simulated extracted text from binary file.");

    // Check if we have an API key. If not, return a highly realistic mock response
    // to demonstrate the structural accelerant to the client immediately.
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('No ANTHROPIC_API_KEY found. Returning simulated ESRE Schema population.')
      await new Promise(resolve => setTimeout(resolve, 2500)) // Simulate LLM latency
      
      return NextResponse.json({
        capabilities: [
          {
            name: "Governance & Operating Model",
            score: 4,
            finding: "Board minutes reveal significant deviation between documented financial approval thresholds and operational reality. Approvals are frequently bypassed via executive override.",
            evidenceQuote: "Resolution 4A (Dec 12): Emergency procurement limit bypassed by MD without prior board approval for 3rd consecutive quarter."
          },
          {
            name: "Data & Systems Architecture",
            score: 5,
            finding: "The policy manual dictates centralized ERP usage, but department headers indicate heavy reliance on siloed Excel trackers for procurement.",
            evidenceQuote: "Section 2.1 ERP Mandate: All POs must be generated in Sage. (However, HR reported using spreadsheets for vendor onboarding)."
          },
          {
            name: "Financial Operations",
            score: 3,
            finding: "Payables cycle policy is 30 days, but extracted ledger reports indicate an average latency of 52 days.",
            evidenceQuote: "Finance Policy V2: Net-30 standard terms. (Audit log shows 52 days average settlement)."
          }
        ]
      })
    }

    // Real AI Extraction Logic (Year 1 Priority)
    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20240620'),
      schema: z.object({
        capabilities: z.array(z.object({
          name: z.string().describe("Which of the 9 ESRE Capabilities this finding relates to"),
          score: z.number().min(1).max(10).describe("The health score out of 10 based on the evidence"),
          finding: z.string().describe("The analytical finding comparing documented policy to operational reality"),
          evidenceQuote: z.string().describe("An exact quote or data point extracted from the document as proof")
        }))
      }),
      prompt: `
        You are the ESRE Document Intelligence Module. 
        Read the following document and map its contents to the ESRE Diagnostic Schema. 
        Focus on extracting governance structures, decision authorities, process definitions, and strategic commitments.
        Identify the gap between what the organisation says it does (policy) and what it actually does (reality).
        
        Document Text:
        ${fileText.substring(0, 50000)} // Truncate for safety in MVP
      `
    })

    return NextResponse.json(object)

  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json({ error: 'Internal server error processing document' }, { status: 500 })
  }
}
