import { CAPABILITY_NAMES, createEmptyAssessment } from './types';
import type { Client, Engagement, TeamMember, Invoice, VaultDocument, ActivityLogEntry, WorkshopBooking, CommercialTerms } from './types';

// ─── Seed Data ──────────────────────────────────────────────────
// Realistic demo data so the PRISM dashboard never looks empty.

const now = new Date().toISOString();
const id = () => crypto.randomUUID();

// ─── Clients ────────────────────────────────────────────────────
const apexId = id();
const meridianId = id();
const novaId = id();
const atlasId = id();

export const SEED_CLIENTS: Client[] = [
    { id: apexId, name: 'Apex Logistics', industry: 'Supply Chain & Logistics', status: 'Active', tier: 'Enterprise', contacts: [{ name: 'Ade Bakare', role: 'CEO', email: 'ade@apexlogistics.ng', phone: '+234 803 555 0001' }], website: 'apexlogistics.ng', location: 'Lagos, Nigeria', notes: 'Flagship enterprise client. Route optimization engagement.', createdAt: '2026-01-15T09:00:00Z' },
    { id: meridianId, name: 'Meridian Health Systems', industry: 'Healthcare Technology', status: 'Active', tier: 'Enterprise', contacts: [{ name: 'Dr. Funke Adeyemi', role: 'CTO', email: 'funke@meridianhealth.ng', phone: '+234 802 555 0002' }], website: 'meridianhealth.ng', location: 'Abuja, Nigeria', notes: 'Patient flow optimization and data intelligence platform.', createdAt: '2026-02-10T09:00:00Z' },
    { id: novaId, name: 'Nova Financial', industry: 'Fintech', status: 'Active', tier: 'Edge', contacts: [{ name: 'Chidi Okafor', role: 'COO', email: 'chidi@novafinancial.io', phone: '+234 805 555 0003' }], website: 'novafinancial.io', location: 'Lagos, Nigeria', notes: 'Credit scoring & fraud detection overhaul.', createdAt: '2026-03-05T09:00:00Z' },
    { id: atlasId, name: 'Atlas Agritech', industry: 'Agriculture Technology', status: 'Lead', tier: 'Foundry', contacts: [{ name: 'Bola Adesanya', role: 'Founder', email: 'bola@atlasagri.com', phone: '+234 810 555 0004' }], website: 'atlasagri.com', location: 'Ibadan, Nigeria', notes: 'Early-stage diagnostics. Exploring ESRE engagement.', createdAt: '2026-05-20T09:00:00Z' },
];

// ─── Engagements ────────────────────────────────────────────────
const apexEngId = id();
const meridianEngId = id();
const novaEngId = id();

function seededAssessments(overrides: Record<string, { c: number; e: number; s: number; r: 'Low' | 'Medium' | 'High' }>) {
    return CAPABILITY_NAMES.map(name => {
        const base = createEmptyAssessment(name);
        const o = overrides[name];
        if (o) { base.clarityScore = o.c; base.evidenceScore = o.e; base.structureScore = o.s; base.riskLevel = o.r; }
        return base;
    });
}

export const SEED_ENGAGEMENTS: Engagement[] = [
    {
        id: apexEngId, clientId: apexId, clientName: 'Apex Logistics', tier: 'Enterprise', currentPhase: 'Build',
        startDate: '2026-01-20', targetEndDate: '2026-09-15',
        milestones: [
            { id: id(), title: 'Diagnostic & Blueprint', phase: 'Define', dueDate: '2026-03-01', completed: true, notes: 'Completed and approved.' },
            { id: id(), title: 'Routing Algorithm Build', phase: 'Build', dueDate: '2026-06-30', completed: false, notes: 'Week 4 of 12. Sarah J. embedded.' },
            { id: id(), title: 'Go-Live Handover', phase: 'Launch', dueDate: '2026-09-15', completed: false, notes: 'Target delivery date.' },
        ],
        createdAt: '2026-01-20T09:00:00Z', updatedAt: now, version: 3,
        assessments: seededAssessments({
            'Business Design': { c: 5, e: 4, s: 4, r: 'Low' },
            'Data & Intelligence': { c: 5, e: 5, s: 4, r: 'Low' },
            'Technology & Platform': { c: 4, e: 3, s: 4, r: 'Medium' },
            'Operating Model & Processes': { c: 3, e: 3, s: 3, r: 'Medium' },
            'Change, Adoption & Behaviour': { c: 2, e: 2, s: 2, r: 'High' },
            'Governance, Risk & Control': { c: 3, e: 2, s: 3, r: 'High' },
            'Economics & Value Engineering': { c: 4, e: 4, s: 3, r: 'Low' },
            'Product Strategy': { c: 4, e: 4, s: 4, r: 'Low' },
            'Customer & Service Design': { c: 4, e: 5, s: 4, r: 'Low' },
        }),
        dependencies: [], scenarios: [],
    },
    {
        id: meridianEngId, clientId: meridianId, clientName: 'Meridian Health Systems', tier: 'Enterprise', currentPhase: 'Define',
        startDate: '2026-04-01', targetEndDate: '2026-12-31',
        milestones: [
            { id: id(), title: 'Initial Diagnostic', phase: 'Define', dueDate: '2026-05-15', completed: true, notes: 'Diagnostic complete.' },
            { id: id(), title: 'Blueprint Approval', phase: 'Define', dueDate: '2026-06-30', completed: false, notes: 'Awaiting board sign-off.' },
        ],
        createdAt: '2026-04-01T09:00:00Z', updatedAt: now, version: 1,
        assessments: seededAssessments({
            'Business Design': { c: 4, e: 3, s: 3, r: 'Medium' },
            'Data & Intelligence': { c: 3, e: 2, s: 2, r: 'High' },
            'Technology & Platform': { c: 3, e: 3, s: 3, r: 'Medium' },
            'Governance, Risk & Control': { c: 4, e: 4, s: 4, r: 'Low' },
        }),
        dependencies: [], scenarios: [],
    },
    {
        id: novaEngId, clientId: novaId, clientName: 'Nova Financial', tier: 'Edge', currentPhase: 'Build',
        startDate: '2026-03-15', targetEndDate: '2026-08-30',
        milestones: [
            { id: id(), title: 'Fraud Detection Blueprint', phase: 'Define', dueDate: '2026-04-15', completed: true, notes: '' },
            { id: id(), title: 'ML Model Training', phase: 'Build', dueDate: '2026-07-01', completed: false, notes: 'In progress.' },
            { id: id(), title: 'Production Deployment', phase: 'Launch', dueDate: '2026-08-30', completed: false, notes: '' },
        ],
        createdAt: '2026-03-15T09:00:00Z', updatedAt: now, version: 2,
        assessments: seededAssessments({
            'Business Design': { c: 4, e: 4, s: 3, r: 'Low' },
            'Data & Intelligence': { c: 5, e: 4, s: 4, r: 'Low' },
            'Governance, Risk & Control': { c: 3, e: 2, s: 2, r: 'High' },
        }),
        dependencies: [], scenarios: [],
    },
];

// ─── Team ───────────────────────────────────────────────────────
export const SEED_TEAM: TeamMember[] = [
    { id: id(), name: 'Sarah Jibril', role: 'Engineer', email: 'sarah@crelligent.com', allocation: 85, assignedEngagements: [apexEngId], rate: 150000, notes: 'Embedded at Apex Logistics. Routing algorithm lead.' },
    { id: id(), name: 'Kunle Adebayo', role: 'Strategist', email: 'kunle@crelligent.com', allocation: 70, assignedEngagements: [meridianEngId], rate: 180000, notes: 'Leading Meridian Health diagnostic.' },
    { id: id(), name: 'Amara Okwu', role: 'Lead', email: 'amara@crelligent.com', allocation: 60, assignedEngagements: [apexEngId, novaEngId], rate: 250000, notes: 'Partner. Overseeing Enterprise portfolio.' },
    { id: id(), name: 'Dami Oluwole', role: 'Analyst', email: 'dami@crelligent.com', allocation: 90, assignedEngagements: [novaEngId], rate: 120000, notes: 'Data science. Nova Financial ML pipeline.' },
    { id: id(), name: 'Tolu Fashola', role: 'Designer', email: 'tolu@crelligent.com', allocation: 45, assignedEngagements: [meridianEngId], rate: 130000, notes: 'Service design. Patient journey mapping.' },
];

// ─── Invoices ───────────────────────────────────────────────────
export const SEED_INVOICES: Invoice[] = [
    { id: id(), engagementId: apexEngId, clientName: 'Apex Logistics', phase: 'Define', amount: 12000000, currency: 'NGN', status: 'Paid', issuedDate: '2026-02-01', dueDate: '2026-02-28', paidDate: '2026-02-25' },
    { id: id(), engagementId: apexEngId, clientName: 'Apex Logistics', phase: 'Build', amount: 18000000, currency: 'NGN', status: 'Paid', issuedDate: '2026-04-01', dueDate: '2026-04-30', paidDate: '2026-04-28' },
    { id: id(), engagementId: meridianEngId, clientName: 'Meridian Health Systems', phase: 'Define', amount: 8500000, currency: 'NGN', status: 'Sent', issuedDate: '2026-05-15', dueDate: '2026-06-15', paidDate: '' },
    { id: id(), engagementId: novaEngId, clientName: 'Nova Financial', phase: 'Define', amount: 6000000, currency: 'NGN', status: 'Paid', issuedDate: '2026-04-01', dueDate: '2026-04-30', paidDate: '2026-04-20' },
    { id: id(), engagementId: novaEngId, clientName: 'Nova Financial', phase: 'Build', amount: 9500000, currency: 'NGN', status: 'Overdue', issuedDate: '2026-05-15', dueDate: '2026-06-10', paidDate: '' },
];

// ─── Documents ──────────────────────────────────────────────────
export const SEED_DOCUMENTS: VaultDocument[] = [
    { id: id(), clientId: apexId, clientName: 'Apex Logistics', engagementId: apexEngId, title: 'ESRE Diagnostic Report — Apex Logistics', type: 'Report', description: 'Full 9-capability diagnostic with risk synthesis.', filePath: '', tags: ['diagnostic', 'esre'], createdAt: '2026-03-01T09:00:00Z', updatedAt: now },
    { id: id(), clientId: apexId, clientName: 'Apex Logistics', engagementId: apexEngId, title: 'Target Operating Model v2.1', type: 'Deliverable', description: 'Engineered operating model blueprint.', filePath: '', tags: ['blueprint', 'operating-model'], createdAt: '2026-04-15T09:00:00Z', updatedAt: now },
    { id: id(), clientId: meridianId, clientName: 'Meridian Health Systems', engagementId: meridianEngId, title: 'Meridian SOW — Diagnostic Phase', type: 'SOW', description: 'Statement of Work for diagnostic engagement.', filePath: '', tags: ['sow', 'contract'], createdAt: '2026-04-01T09:00:00Z', updatedAt: now },
    { id: id(), clientId: novaId, clientName: 'Nova Financial', engagementId: novaEngId, title: 'Fraud Detection Architecture Spec', type: 'Deliverable', description: 'Technical spec for ML-based fraud detection system.', filePath: '', tags: ['architecture', 'ml', 'fraud'], createdAt: '2026-05-01T09:00:00Z', updatedAt: now },
    { id: id(), clientId: apexId, clientName: 'Apex Logistics', engagementId: apexEngId, title: 'Data Architecture Topology', type: 'Deliverable', description: 'System integration data flow topology.', filePath: '', tags: ['data', 'architecture'], createdAt: '2026-05-10T09:00:00Z', updatedAt: now },
];

// ─── Activity Log ───────────────────────────────────────────────
export const SEED_ACTIVITY: ActivityLogEntry[] = [
    { id: id(), action: 'assessment_updated', entity: 'Apex Logistics', entityId: apexEngId, details: 'Updated Behavioural Capability assessment — risk escalated to High.', timestamp: '2026-06-24T14:30:00Z' },
    { id: id(), action: 'milestone_completed', entity: 'Apex Logistics', entityId: apexEngId, details: 'Milestone "Diagnostic & Blueprint" marked complete.', timestamp: '2026-06-23T10:00:00Z' },
    { id: id(), action: 'invoice_created', entity: 'Nova Financial', entityId: novaEngId, details: 'Created invoice for Nova Financial — ₦9,500,000 (Build phase).', timestamp: '2026-06-22T09:00:00Z' },
    { id: id(), action: 'team_added', entity: 'Dami Oluwole', entityId: '', details: 'Added Dami Oluwole (Analyst) to the team. Assigned to Nova Financial.', timestamp: '2026-06-20T11:00:00Z' },
    { id: id(), action: 'engagement_created', entity: 'Meridian Health Systems', entityId: meridianEngId, details: 'Created engagement for "Meridian Health Systems" (Enterprise tier).', timestamp: '2026-06-18T09:00:00Z' },
    { id: id(), action: 'client_created', entity: 'Atlas Agritech', entityId: atlasId, details: 'Created lead client "Atlas Agritech" (Agriculture Technology).', timestamp: '2026-06-15T09:00:00Z' },
    { id: id(), action: 'document_added', entity: 'Fraud Detection Architecture Spec', entityId: '', details: 'Added "Fraud Detection Architecture Spec" for Nova Financial.', timestamp: '2026-06-12T09:00:00Z' },
    { id: id(), action: 'invoice_status_changed', entity: 'Apex Logistics', entityId: apexEngId, details: 'Invoice for Apex Logistics Build phase marked as Paid.', timestamp: '2026-06-10T09:00:00Z' },
];

// ─── Workshops ──────────────────────────────────────────────────
export const SEED_WORKSHOPS: WorkshopBooking[] = [
    { id: id(), clientId: apexId, clientName: 'Apex Logistics', engagementId: apexEngId, type: 'Risk Workshop', title: 'Behavioural Constraint Deep-Dive', date: '2026-07-05', duration: 180, facilitator: 'Amara Okwu', attendees: ['Ade Bakare', 'Sarah Jibril', 'Amara Okwu'], agenda: 'Address siloed data hoarding between procurement and last-mile teams.', status: 'Scheduled', notes: '', createdAt: now },
    { id: id(), clientId: meridianId, clientName: 'Meridian Health Systems', engagementId: meridianEngId, type: 'Diagnostic', title: 'Data Intelligence Assessment', date: '2026-07-12', duration: 240, facilitator: 'Kunle Adebayo', attendees: ['Dr. Funke Adeyemi', 'Kunle Adebayo', 'Tolu Fashola'], agenda: 'Assess data maturity and predictive capability readiness.', status: 'Scheduled', notes: '', createdAt: now },
];

// ─── Commercials ────────────────────────────────────────────────
export const SEED_COMMERCIALS: CommercialTerms[] = [
    { id: id(), engagementId: apexEngId, clientName: 'Apex Logistics', model: 'Retainer', equityPercent: 0, costPerPhase: { Define: 12000000, Build: 18000000, Launch: 15000000, Sustain: 8000000 }, totalValue: 53000000, currency: 'NGN', notes: 'Monthly retainer with phase-based billing.' },
    { id: id(), engagementId: novaEngId, clientName: 'Nova Financial', model: 'Fixed Fee', equityPercent: 0, costPerPhase: { Define: 6000000, Build: 9500000, Launch: 7000000, Sustain: 0 }, totalValue: 22500000, currency: 'NGN', notes: 'Fixed fee engagement.' },
];
