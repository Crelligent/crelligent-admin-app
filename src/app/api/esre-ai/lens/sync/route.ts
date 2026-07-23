import { NextResponse } from 'next/server';
import { extractOdooData } from '@/lib/connectors/odoo';
import { extractSageData } from '@/lib/connectors/sage';
import { extractSapB1Data } from '@/lib/connectors/sap-b1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, credentials } = body;

    if (!platform || !credentials) {
      return NextResponse.json({ error: 'Missing platform or credentials' }, { status: 400 });
    }

    let data;

    switch (platform.toLowerCase()) {
      case 'odoo':
        data = await extractOdooData(credentials);
        break;
      case 'sage':
        data = await extractSageData(credentials);
        break;
      case 'sap-b1':
        data = await extractSapB1Data(credentials);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported ERP platform' }, { status: 400 });
    }

    // ESRE Engine Algorithmic Synthesis (v0.1 Mock)
    // We aggregate the scores based on the new schema weights
    const { capitalLockup, liquidityBuffer, supplyChainFriction, macroEconomicExposure } = data.metrics;
    
    // Weightings: Lockup (15%), Liquidity (20%), Friction (10%), Macro (15%), others assumed 100% compliant for v0.1
    // For simplicity in v0.1, we'll calculate a localized Vitals Score based purely on the 4 extracted dimensions
    const totalWeight = 0.15 + 0.20 + 0.10 + 0.15;
    
    const weightedScore = (
      (capitalLockup.score * 0.15) +
      (liquidityBuffer.score * 0.20) +
      (supplyChainFriction.score * 0.10) +
      (macroEconomicExposure.score * 0.15)
    ) / totalWeight;

    const finalVitalsScore = parseFloat(weightedScore.toFixed(1));

    return NextResponse.json({
      success: true,
      vitalsScore: finalVitalsScore,
      extractedData: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ESRE Lens Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error during ERP synchronization' }, { status: 500 });
  }
}
