import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to get path to local DB mock
const getDbPath = () => path.join(process.cwd(), 'src', 'lib', 'data', 'leads.json');

export async function POST(req: Request) {
    try {
        // 1. Verify secret key
        const secret = process.env.CRELLIGENT_SECRET || 'your_secret_key'; // Using 'your_secret_key' as default for testing
        const authHeader = req.headers.get('x-crelligent-secret');
        
        if (authHeader !== secret) {
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
        }

        // 2. Parse payload
        const lead = await req.json();

        // 3. Save to database mock
        const dbPath = getDbPath();
        
        // Ensure directory exists just in case
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Read existing leads
        let leads = [];
        if (fs.existsSync(dbPath)) {
            const fileData = fs.readFileSync(dbPath, 'utf8');
            try {
                leads = JSON.parse(fileData);
            } catch (e) {
                leads = [];
            }
        }

        // Add admin fields to track in panel
        const newLead = {
            ...lead,
            assigned_to: null,
            admin_status: 'new', // new, contacting, qualified, disqualified
            created_at: new Date().toISOString()
        };

        // Add to beginning of array so newest is first
        leads.unshift(newLead);

        // Write back to file
        fs.writeFileSync(dbPath, JSON.stringify(leads, null, 2));

        // 4. Return expected response
        return NextResponse.json({ status: 'ok', lead_id: lead.lead_id });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
