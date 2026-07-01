import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getDbPath = () => path.join(process.cwd(), 'src', 'lib', 'data', 'leads.json');

export async function GET() {
    try {
        const dbPath = getDbPath();
        
        let leads = [];
        if (fs.existsSync(dbPath)) {
            const fileData = fs.readFileSync(dbPath, 'utf8');
            try {
                leads = JSON.parse(fileData);
            } catch (e) {
                leads = [];
            }
        }
        
        return NextResponse.json(leads);
    } catch (error) {
        console.error('Failed to fetch leads:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
