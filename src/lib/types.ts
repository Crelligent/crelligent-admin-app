// ─── Capability Constants (Canonical 9 — exact order matters) ───
export const CAPABILITY_NAMES = [
    'Business Design',
    'Product Strategy',
    'Customer & Service Design',
    'Data & Intelligence',
    'Operating Model & Processes',
    'Technology & Platform',
    'Governance, Risk & Control',
    'Economics & Value Engineering',
    'Change, Adoption & Behaviour',
] as const;

export type CapabilityName = (typeof CAPABILITY_NAMES)[number];

// ─── Diagnostic Questions per Capability ────────────────────────
export const CAPABILITY_QUESTIONS: Record<CapabilityName, string[]> = {
    'Business Design': [
        'Is the ecosystem structure coherent?',
        'Is platform positioning clear?',
        'Is power concentration intentional?',
        'What structural lock-in exists?',
    ],
    'Product Strategy': [
        'Is MVP sequenced strategically?',
        'Is advantage engineered?',
        'Is roadmap defensibility-oriented?',
    ],
    'Customer & Service Design': [
        'Is trust engineered?',
        'Is failure handling designed?',
        'Is journey aligned to economics?',
    ],
    'Data & Intelligence': [
        'Is data structured as advantage?',
        'Is predictive capability defined?',
        'Is governance over data clear?',
    ],
    'Operating Model & Processes': [
        'Who owns what?',
        'How are disputes resolved?',
        'Is accountability documented?',
    ],
    'Technology & Platform': [
        'Is architecture modular?',
        'Is scale considered?',
        'Is integration strategy defined?',
    ],
    'Governance, Risk & Control': [
        'Liability model defined?',
        'Fraud prevention designed?',
        'Compliance exposure mapped?',
    ],
    'Economics & Value Engineering': [
        'Unit economics modeled?',
        'Sensitivity analysis run?',
        'Margin durability tested?',
    ],
    'Change, Adoption & Behaviour': [
        'Incentive alignment designed?',
        'Behavioural resistance mapped?',
        'Onboarding friction assessed?',
    ],
};

// ─── Risk Level ─────────────────────────────────────────────────
export type RiskLevel = 'Low' | 'Medium' | 'High';

// ─── Maturity Level ─────────────────────────────────────────────
export type MaturityLevel = 'Fragile' | 'Developing' | 'Structured' | 'Institutionalized';

// ─── Capability Assessment ──────────────────────────────────────
export interface CapabilityAssessment {
    name: CapabilityName;
    clarityScore: number;    // 1–5
    evidenceScore: number;   // 1–5
    structureScore: number;  // 1–5
    riskLevel: RiskLevel;
    assumptions: Assumption[];
    dependencies: CapabilityName[];
    notes: string;
}

export interface Assumption {
    id: string;
    text: string;
    validated: boolean;
    revenueLinked: boolean;
    highDependency: boolean;
}

// ─── Dependency Edge ────────────────────────────────────────────
export interface DependencyEdge {
    from: CapabilityName;
    to: CapabilityName;
    weight: number; // 1–3 (low, medium, critical)
    description: string;
}

// ─── Stress Scenario ────────────────────────────────────────────
export type ScenarioTemplate =
    | 'Operator Bypass Surge'
    | 'Regulatory Restriction'
    | 'Payment Outage'
    | 'Fraud Spike'
    | 'Demand Shock'
    | 'Custom';

export interface StressScenario {
    id: string;
    template: ScenarioTemplate;
    customName: string;
    whatBreaks: string;
    revenueImpact: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
    trustImpact: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
    operationalResponse: string;
    timeToRecovery: string;
    affectedCapabilities: CapabilityName[];
    fragilityScore: number;   // 1–10, computed
    resilienceRating: number; // 1–10, computed
    cascadeRisk: number;      // 1–10, computed
}

// ─── Meta Indices ───────────────────────────────────────────────
export interface MetaIndices {
    strategicClarity: number;
    structuralSoundness: number;
    executionReadiness: number;
    riskExposure: number;
}

// ─── Report Outputs ─────────────────────────────────────────────
export interface WorkshopAgendaItem {
    capability: CapabilityName;
    duration: number; // minutes
    focus: string;
    priority: number;
}

export interface StructuralRisk {
    rank: number;
    title: string;
    description: string;
    score: number;
    capabilities: CapabilityName[];
}

// ─── Client & Engagement ────────────────────────────────────────
export type ClientStatus = 'Lead' | 'Active' | 'Paused' | 'Completed' | 'Churned';
export type EngagementTier = 'Foundry' | 'Edge' | 'Enterprise';
export type EngagementPhase = 'Define' | 'Build' | 'Launch' | 'Sustain';

export interface ClientContact {
    name: string;
    role: string;
    email: string;
    phone: string;
}

export interface Client {
    id: string;
    name: string;
    industry: string;
    status: ClientStatus;
    tier: EngagementTier;
    contacts: ClientContact[];
    website: string;
    location: string;
    notes: string;
    createdAt: string;
}

export interface Milestone {
    id: string;
    title: string;
    phase: EngagementPhase;
    dueDate: string;
    completed: boolean;
    notes: string;
}

export interface Engagement {
    id: string;
    clientId: string;
    clientName: string;
    tier: EngagementTier;
    currentPhase: EngagementPhase;
    startDate: string;
    targetEndDate: string;
    milestones: Milestone[];
    createdAt: string;
    updatedAt: string;
    version: number;
    assessments: CapabilityAssessment[];
    dependencies: DependencyEdge[];
    scenarios: StressScenario[];
}

// ─── Team & Resourcing ──────────────────────────────────────────
export type TeamRole = 'Lead' | 'Strategist' | 'Engineer' | 'Designer' | 'Analyst' | 'Advisor';

export interface TeamMember {
    id: string;
    name: string;
    role: TeamRole;
    email: string;
    allocation: number; // 0–100 percent
    assignedEngagements: string[]; // engagement IDs
    rate: number; // hourly or daily rate
    notes: string;
}

// ─── Commercial & Billing ───────────────────────────────────────
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface CommercialTerms {
    id: string;
    engagementId: string;
    clientName: string;
    model: 'Equity + Cost' | 'Fixed Fee' | 'Retainer' | 'Success Fee';
    equityPercent: number;
    costPerPhase: Record<EngagementPhase, number>;
    totalValue: number;
    currency: string;
    notes: string;
}

export interface Invoice {
    id: string;
    engagementId: string;
    clientName: string;
    phase: EngagementPhase;
    amount: number;
    currency: string;
    status: InvoiceStatus;
    issuedDate: string;
    dueDate: string;
    paidDate: string;
}

// ─── Document Vault ─────────────────────────────────────────────
export type DocumentType = 'Proposal' | 'SOW' | 'Case Study' | 'Report' | 'Deliverable' | 'Contract' | 'Other';

export interface VaultDocument {
    id: string;
    clientId: string;
    clientName: string;
    engagementId: string;
    title: string;
    type: DocumentType;
    description: string;
    filePath: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

// ─── Activity Log ───────────────────────────────────────────────
export type ActivityAction =
    | 'client_created' | 'client_updated' | 'client_removed'
    | 'engagement_created' | 'engagement_updated' | 'engagement_phase_changed'
    | 'assessment_updated' | 'dependency_updated' | 'scenario_created'
    | 'team_added' | 'team_removed' | 'invoice_created' | 'invoice_status_changed'
    | 'document_added' | 'document_removed' | 'commercial_created'
    | 'milestone_added' | 'milestone_completed' | 'settings_updated';

export interface ActivityLogEntry {
    id: string;
    action: ActivityAction;
    entity: string;
    entityId: string;
    details: string;
    timestamp: string;
}

// ─── Settings ───────────────────────────────────────────────────
export interface AppSettings {
    companyName: string;
    companyTagline: string;
    currency: string;
    defaultTier: EngagementTier;
    defaultPhase: EngagementPhase;
    brandColor: string;
    logo: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
}

// ─── IP Asset Tracker ───────────────────────────────────────────
export type IPAssetType = 'Framework' | 'Methodology' | 'Tool' | 'Template' | 'Model' | 'Research';

export interface IPAsset {
    id: string;
    name: string;
    type: IPAssetType;
    description: string;
    version: string;
    linkedCapabilities: CapabilityName[];
    status: 'Draft' | 'Active' | 'Deprecated';
    createdAt: string;
    updatedAt: string;
}

// ─── Workshop Booking ───────────────────────────────────────────
export type WorkshopStatus = 'Requested' | 'Scheduled' | 'Completed' | 'Cancelled';
export type WorkshopType = 'Diagnostic' | 'Design Sprint' | 'Architecture Review' | 'Risk Workshop' | 'Custom';

export interface WorkshopBooking {
    id: string;
    clientId: string;
    clientName: string;
    engagementId: string;
    type: WorkshopType;
    title: string;
    date: string;
    duration: number; // minutes
    facilitator: string;
    attendees: string[];
    agenda: string;
    status: WorkshopStatus;
    notes: string;
    createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────
export function createEmptyAssessment(name: CapabilityName): CapabilityAssessment {
    return {
        name,
        clarityScore: 1,
        evidenceScore: 1,
        structureScore: 1,
        riskLevel: 'Medium',
        assumptions: [],
        dependencies: [],
        notes: '',
    };
}

export function createEmptyEngagement(clientId: string, clientName: string, tier: EngagementTier = 'Foundry'): Engagement {
    return {
        id: crypto.randomUUID(),
        clientId,
        clientName,
        tier,
        currentPhase: 'Define',
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: '',
        milestones: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        assessments: CAPABILITY_NAMES.map(createEmptyAssessment),
        dependencies: [],
        scenarios: [],
    };
}

export const DEFAULT_SETTINGS: AppSettings = {
    companyName: 'Crelligent & Co.',
    companyTagline: 'Systems Design & Engineering',
    currency: 'NGN',
    defaultTier: 'Foundry',
    defaultPhase: 'Define',
    brandColor: '#3b82f6',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
};

