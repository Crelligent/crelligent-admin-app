import {
    type CapabilityAssessment,
    type CapabilityName,
    type DependencyEdge,
    type Engagement,
    type MaturityLevel,
    type MetaIndices,
    type StressScenario,
    type StructuralRisk,
    type WorkshopAgendaItem,
    CAPABILITY_NAMES,
} from './types';

// ─── Composite Score ────────────────────────────────────────────
export function compositeScore(a: CapabilityAssessment): number {
    return (a.clarityScore + a.evidenceScore + a.structureScore) / 3;
}

// ─── Maturity Level ─────────────────────────────────────────────
export function maturityLevel(score: number): MaturityLevel {
    if (score <= 2) return 'Fragile';
    if (score <= 3) return 'Developing';
    if (score <= 4) return 'Structured';
    return 'Institutionalized';
}

// ─── Meta-Index Calculations ────────────────────────────────────

function avg(...values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function findAssessment(assessments: CapabilityAssessment[], name: CapabilityName): CapabilityAssessment | undefined {
    return assessments.find(a => a.name === name);
}

export function calculateMetaIndices(engagement: Engagement): MetaIndices {
    const a = engagement.assessments;

    // Strategic Clarity Index
    const bd = findAssessment(a, 'Business Design');
    const ps = findAssessment(a, 'Product Strategy');
    const ev = findAssessment(a, 'Economics & Value Engineering');
    const strategicClarity = avg(
        bd?.clarityScore ?? 1,
        ps?.clarityScore ?? 1,
        ev?.clarityScore ?? 1,
    );

    // Structural Soundness Index
    const om = findAssessment(a, 'Operating Model & Processes');
    const gr = findAssessment(a, 'Governance, Risk & Control');
    const tp = findAssessment(a, 'Technology & Platform');
    const structuralSoundness = avg(
        om?.structureScore ?? 1,
        gr?.structureScore ?? 1,
        tp?.structureScore ?? 1,
    );

    // Execution Readiness Index
    const cx = findAssessment(a, 'Customer & Service Design');
    const ca = findAssessment(a, 'Change, Adoption & Behaviour');
    const executionReadiness = avg(
        ...a.map(c => c.evidenceScore),
        om?.structureScore ?? 1,
        ca?.clarityScore ?? 1,
    );

    // Risk Exposure Index
    const highRiskCount = a.filter(c => c.riskLevel === 'High').length;
    const criticalAssumptions = a.reduce(
        (sum, c) => sum + c.assumptions.filter(as => !as.validated && as.revenueLinked).length, 0
    );
    const stressFailures = engagement.scenarios.filter(s => s.fragilityScore >= 7).length;

    // Normalize to 1-5 scale (higher = more exposed)
    const riskExposure = Math.min(5, 1 + (highRiskCount * 0.5) + (criticalAssumptions * 0.3) + (stressFailures * 0.4));

    return {
        strategicClarity: Math.round(strategicClarity * 10) / 10,
        structuralSoundness: Math.round(structuralSoundness * 10) / 10,
        executionReadiness: Math.round(executionReadiness * 10) / 10,
        riskExposure: Math.round(riskExposure * 10) / 10,
    };
}

// ─── Top 5 Structural Risks ────────────────────────────────────

export function calculateTopRisks(engagement: Engagement): StructuralRisk[] {
    const { assessments, dependencies } = engagement;

    const riskScores = assessments.map(a => {
        // Count inbound dependency weight
        const inboundWeight = dependencies
            .filter(d => d.to === a.name)
            .reduce((sum, d) => sum + d.weight, 0);

        const score = ((5 - a.clarityScore) + (5 - a.evidenceScore) + inboundWeight) *
            (a.riskLevel === 'High' ? 2 : a.riskLevel === 'Medium' ? 1.2 : 0.8);

        return {
            capability: a.name,
            score: Math.round(score * 10) / 10,
            riskLevel: a.riskLevel,
        };
    });

    riskScores.sort((a, b) => b.score - a.score);

    return riskScores.slice(0, 5).map((r, i) => ({
        rank: i + 1,
        title: `${r.capability} vulnerability`,
        description: `Risk score ${r.score} — ${r.riskLevel} risk level with low clarity/evidence and high dependency weight.`,
        score: r.score,
        capabilities: [r.capability],
    }));
}

// ─── Workshop Agenda Generation ─────────────────────────────────

export function generateWorkshopAgenda(engagement: Engagement): WorkshopAgendaItem[] {
    const items: WorkshopAgendaItem[] = engagement.assessments
        .map(a => ({
            capability: a.name,
            score: compositeScore(a),
            riskLevel: a.riskLevel,
        }))
        .sort((a, b) => a.score - b.score) // lowest score first
        .map((item, i) => {
            // Allocate time proportional to risk
            let duration = 10;
            if (item.score < 2) duration = 25;
            else if (item.score < 3) duration = 20;
            else if (item.score < 4) duration = 15;

            return {
                capability: item.capability,
                duration,
                focus: item.score < 2
                    ? `Deep dive: ${item.capability} is critically under-developed (score: ${item.score.toFixed(1)})`
                    : item.score < 3
                        ? `Workshop: Address structural gaps in ${item.capability} (score: ${item.score.toFixed(1)})`
                        : `Review: Validate current ${item.capability} approach (score: ${item.score.toFixed(1)})`,
                priority: i + 1,
            };
        });

    // Cap total at ~120 minutes (2 hours)
    let totalMinutes = 0;
    const agenda: WorkshopAgendaItem[] = [];
    for (const item of items) {
        if (totalMinutes + item.duration > 120) break;
        totalMinutes += item.duration;
        agenda.push(item);
    }

    return agenda;
}

// ─── Structural Weakness Narrative ──────────────────────────────

export function generateWeaknessSummary(engagement: Engagement): string {
    const weakest = [...engagement.assessments].sort(
        (a, b) => compositeScore(a) - compositeScore(b)
    );

    const worst = weakest[0];
    const secondWorst = weakest[1];

    if (!worst) return 'No assessment data available.';

    const worstScore = compositeScore(worst);
    const severity = worstScore < 2 ? 'critical' : worstScore < 3 ? 'significant' : 'moderate';

    let narrative = `Primary structural vulnerability lies in ${worst.name} (composite score: ${worstScore.toFixed(1)}/5.0), representing a ${severity} gap in the system architecture.`;

    if (secondWorst) {
        const secondScore = compositeScore(secondWorst);
        narrative += ` This is compounded by weakness in ${secondWorst.name} (${secondScore.toFixed(1)}/5.0)`;

        // Check if they're interdependent
        const linked = engagement.dependencies.some(
            d => (d.from === worst.name && d.to === secondWorst.name) ||
                (d.from === secondWorst.name && d.to === worst.name)
        );

        if (linked) {
            narrative += `, which has a direct dependency relationship, creating cascading risk`;
        }

        narrative += '.';
    }

    // Add assumption risk
    const unvalidatedCritical = engagement.assessments.reduce(
        (sum, a) => sum + a.assumptions.filter(as => !as.validated && as.revenueLinked).length, 0
    );

    if (unvalidatedCritical > 0) {
        narrative += ` Additionally, ${unvalidatedCritical} revenue-linked assumption${unvalidatedCritical > 1 ? 's remain' : ' remains'} unvalidated, representing significant execution risk.`;
    }

    return narrative;
}

// ─── Phase 1 Priorities ─────────────────────────────────────────

export function generatePhase1Priorities(engagement: Engagement): string[] {
    const { assessments, dependencies } = engagement;

    // Score each capability by: risk + low maturity + high dependency
    const scored = assessments.map(a => {
        const inboundWeight = dependencies
            .filter(d => d.to === a.name)
            .reduce((sum, d) => sum + d.weight, 0);

        const urgency =
            (5 - compositeScore(a)) * 2 +
            (a.riskLevel === 'High' ? 3 : a.riskLevel === 'Medium' ? 1 : 0) +
            inboundWeight;

        return { name: a.name, urgency };
    });

    scored.sort((a, b) => b.urgency - a.urgency);

    return scored.slice(0, 4).map(s => {
        const assess = assessments.find(a => a.name === s.name)!;
        const level = maturityLevel(compositeScore(assess));
        return `${s.name} (${level} — urgency: ${s.urgency.toFixed(1)})`;
    });
}

// ─── Stress Scenario Score Computation ──────────────────────────

const impactValues: Record<string, number> = {
    'None': 0, 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4,
};

export function computeScenarioScores(
    scenario: Omit<StressScenario, 'fragilityScore' | 'resilienceRating' | 'cascadeRisk'>,
    dependencies: DependencyEdge[]
): { fragilityScore: number; resilienceRating: number; cascadeRisk: number } {
    const revImpact = impactValues[scenario.revenueImpact] ?? 0;
    const trustImpact = impactValues[scenario.trustImpact] ?? 0;

    // Fragility: how much damage
    const fragilityScore = Math.min(10, Math.round(((revImpact + trustImpact) / 8) * 10));

    // Cascade: how many downstream capabilities are affected
    const directlyAffected = new Set(scenario.affectedCapabilities);
    const downstream = new Set<string>();
    for (const cap of directlyAffected) {
        for (const dep of dependencies) {
            if (dep.from === cap) downstream.add(dep.to);
        }
    }
    const cascadeRisk = Math.min(10, Math.round(((directlyAffected.size + downstream.size) / CAPABILITY_NAMES.length) * 10));

    // Resilience: inverse of fragility, boosted by having a response
    const hasResponse = scenario.operationalResponse.trim().length > 10;
    const resilienceRating = Math.max(1, Math.min(10, 10 - fragilityScore + (hasResponse ? 2 : 0)));

    return { fragilityScore, resilienceRating, cascadeRisk };
}

// ─── Single Point of Failure Detection ──────────────────────────

export function detectSinglePointsOfFailure(dependencies: DependencyEdge[]): CapabilityName[] {
    // Capabilities that many others depend on (high inbound count with high weight)
    const inboundScores = new Map<CapabilityName, number>();

    for (const dep of dependencies) {
        const current = inboundScores.get(dep.to) ?? 0;
        inboundScores.set(dep.to, current + dep.weight);
    }

    return Array.from(inboundScores.entries())
        .filter(([, score]) => score >= 4) // threshold
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);
}
