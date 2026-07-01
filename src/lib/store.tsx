'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    type Client,
    type Engagement,
    type TeamMember,
    type CommercialTerms,
    type Invoice,
    type VaultDocument,
    type ActivityLogEntry,
    type ActivityAction,
    type AppSettings,
    type IPAsset,
    type WorkshopBooking,
    createEmptyEngagement,
    DEFAULT_SETTINGS,
} from './types';

// ─── Store Shape ────────────────────────────────────────────────
interface DiagnosticStore {
    clients: Client[];
    engagements: Engagement[];
    activeEngagementId: string | null;
    team: TeamMember[];
    commercials: CommercialTerms[];
    invoices: Invoice[];
    documents: VaultDocument[];
    activityLog: ActivityLogEntry[];
    settings: AppSettings;
    ipAssets: IPAsset[];
    workshops: WorkshopBooking[];

    // Client
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
    updateClient: (updated: Client) => void;
    removeClient: (id: string) => void;

    // Engagement
    selectEngagement: (id: string) => void;
    getActiveEngagement: () => Engagement | null;
    updateEngagement: (updated: Engagement) => void;
    createEngagement: (clientId: string, clientName: string) => Engagement;

    // Team
    addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember;
    updateTeamMember: (updated: TeamMember) => void;
    removeTeamMember: (id: string) => void;

    // Commercial
    addCommercial: (terms: Omit<CommercialTerms, 'id'>) => CommercialTerms;
    updateCommercial: (updated: CommercialTerms) => void;
    addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
    updateInvoice: (updated: Invoice) => void;

    // Documents
    addDocument: (doc: Omit<VaultDocument, 'id' | 'createdAt' | 'updatedAt'>) => VaultDocument;
    updateDocument: (updated: VaultDocument) => void;
    removeDocument: (id: string) => void;

    // Activity
    log: (action: ActivityAction, entity: string, entityId: string, details: string) => void;

    // Settings
    updateSettings: (updated: AppSettings) => void;

    // IP Assets
    addIPAsset: (asset: Omit<IPAsset, 'id' | 'createdAt' | 'updatedAt'>) => IPAsset;
    updateIPAsset: (updated: IPAsset) => void;
    removeIPAsset: (id: string) => void;

    // Workshops
    addWorkshop: (ws: Omit<WorkshopBooking, 'id' | 'createdAt'>) => WorkshopBooking;
    updateWorkshop: (updated: WorkshopBooking) => void;
    removeWorkshop: (id: string) => void;
}

const StoreContext = createContext<DiagnosticStore | null>(null);

import {
    SEED_CLIENTS, SEED_ENGAGEMENTS, SEED_TEAM, SEED_INVOICES,
    SEED_DOCUMENTS, SEED_ACTIVITY, SEED_WORKSHOPS, SEED_COMMERCIALS,
} from './seed';

// ─── localStorage ───────────────────────────────────────────────
const KEYS = {
    clients: 'crelligent_clients',
    engagements: 'crelligent_engagements',
    active: 'crelligent_active_engagement',
    team: 'crelligent_team',
    commercials: 'crelligent_commercials',
    invoices: 'crelligent_invoices',
    documents: 'crelligent_documents',
    activityLog: 'crelligent_activity_log',
    settings: 'crelligent_settings',
    ipAssets: 'crelligent_ip_assets',
    workshops: 'crelligent_workshops',
};

function loadJSON<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function saveJSON(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ───────────────────────────────────────────────────
export function DiagnosticProvider({ children }: { children: React.ReactNode }) {
    const [clients, setClients] = useState<Client[]>([]);
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [activeEngagementId, setActiveEngagementId] = useState<string | null>(null);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [commercials, setCommercials] = useState<CommercialTerms[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [documents, setDocuments] = useState<VaultDocument[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [ipAssets, setIPAssets] = useState<IPAsset[]>([]);
    const [workshops, setWorkshops] = useState<WorkshopBooking[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setClients(loadJSON(KEYS.clients, SEED_CLIENTS));
        setEngagements(loadJSON(KEYS.engagements, SEED_ENGAGEMENTS));
        setActiveEngagementId(loadJSON(KEYS.active, SEED_ENGAGEMENTS[0]?.id ?? null));
        setTeam(loadJSON(KEYS.team, SEED_TEAM));
        setCommercials(loadJSON(KEYS.commercials, SEED_COMMERCIALS));
        setInvoices(loadJSON(KEYS.invoices, SEED_INVOICES));
        setDocuments(loadJSON(KEYS.documents, SEED_DOCUMENTS));
        setActivityLog(loadJSON(KEYS.activityLog, SEED_ACTIVITY));
        setSettings(loadJSON(KEYS.settings, DEFAULT_SETTINGS));
        setIPAssets(loadJSON(KEYS.ipAssets, []));
        setWorkshops(loadJSON(KEYS.workshops, SEED_WORKSHOPS));
        setHydrated(true);
    }, []);

    useEffect(() => { if (hydrated) saveJSON(KEYS.clients, clients); }, [clients, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.engagements, engagements); }, [engagements, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.active, activeEngagementId); }, [activeEngagementId, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.team, team); }, [team, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.commercials, commercials); }, [commercials, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.invoices, invoices); }, [invoices, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.documents, documents); }, [documents, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.activityLog, activityLog); }, [activityLog, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.settings, settings); }, [settings, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.ipAssets, ipAssets); }, [ipAssets, hydrated]);
    useEffect(() => { if (hydrated) saveJSON(KEYS.workshops, workshops); }, [workshops, hydrated]);

    // ─── Activity Log ───────────────────────────────────────────
    const log = useCallback((action: ActivityAction, entity: string, entityId: string, details: string) => {
        const entry: ActivityLogEntry = { id: crypto.randomUUID(), action, entity, entityId, details, timestamp: new Date().toISOString() };
        setActivityLog(prev => [entry, ...prev].slice(0, 500)); // keep last 500
    }, []);

    // ─── Client ─────────────────────────────────────────────────
    const addClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>): Client => {
        const client: Client = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        setClients(prev => [...prev, client]);
        const engagement = createEmptyEngagement(client.id, client.name, client.tier);
        setEngagements(prev => [...prev, engagement]);
        setActiveEngagementId(engagement.id);
        log('client_created', client.name, client.id, `Created client "${client.name}" (${client.industry})`);
        return client;
    }, [log]);

    const updateClient = useCallback((updated: Client) => {
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
        log('client_updated', updated.name, updated.id, `Updated client "${updated.name}"`);
    }, [log]);

    const removeClient = useCallback((id: string) => {
        setClients(prev => { const c = prev.find(x => x.id === id); if (c) log('client_removed', c.name, id, `Removed client "${c.name}"`); return prev.filter(c => c.id !== id); });
    }, [log]);

    // ─── Engagement ─────────────────────────────────────────────
    const selectEngagement = useCallback((id: string) => setActiveEngagementId(id), []);

    const getActiveEngagement = useCallback((): Engagement | null => {
        if (!activeEngagementId) return null;
        return engagements.find(e => e.id === activeEngagementId) ?? null;
    }, [activeEngagementId, engagements]);

    const updateEngagement = useCallback((updated: Engagement) => {
        setEngagements(prev => prev.map(e => e.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : e));
    }, []);

    const createEngagement = useCallback((clientId: string, clientName: string): Engagement => {
        const engagement = createEmptyEngagement(clientId, clientName);
        setEngagements(prev => [...prev, engagement]);
        setActiveEngagementId(engagement.id);
        log('engagement_created', clientName, engagement.id, `Created engagement for "${clientName}"`);
        return engagement;
    }, [log]);

    // ─── Team ───────────────────────────────────────────────────
    const addTeamMember = useCallback((data: Omit<TeamMember, 'id'>): TeamMember => {
        const member: TeamMember = { ...data, id: crypto.randomUUID() };
        setTeam(prev => [...prev, member]);
        log('team_added', member.name, member.id, `Added team member "${member.name}" (${member.role})`);
        return member;
    }, [log]);

    const updateTeamMember = useCallback((updated: TeamMember) => {
        setTeam(prev => prev.map(m => m.id === updated.id ? updated : m));
    }, []);

    const removeTeamMember = useCallback((id: string) => {
        setTeam(prev => { const m = prev.find(x => x.id === id); if (m) log('team_removed', m.name, id, `Removed "${m.name}"`); return prev.filter(m => m.id !== id); });
    }, [log]);

    // ─── Commercial ─────────────────────────────────────────────
    const addCommercial = useCallback((data: Omit<CommercialTerms, 'id'>): CommercialTerms => {
        const terms: CommercialTerms = { ...data, id: crypto.randomUUID() };
        setCommercials(prev => [...prev, terms]);
        log('commercial_created', terms.clientName, terms.id, `Added commercial terms for "${terms.clientName}" (${terms.model})`);
        return terms;
    }, [log]);

    const updateCommercial = useCallback((updated: CommercialTerms) => {
        setCommercials(prev => prev.map(c => c.id === updated.id ? updated : c));
    }, []);

    const addInvoice = useCallback((data: Omit<Invoice, 'id'>): Invoice => {
        const invoice: Invoice = { ...data, id: crypto.randomUUID() };
        setInvoices(prev => [...prev, invoice]);
        log('invoice_created', invoice.clientName, invoice.id, `Created invoice for "${invoice.clientName}" — ${invoice.amount}`);
        return invoice;
    }, [log]);

    const updateInvoice = useCallback((updated: Invoice) => {
        setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
    }, []);

    // ─── Documents ──────────────────────────────────────────────
    const addDocument = useCallback((data: Omit<VaultDocument, 'id' | 'createdAt' | 'updatedAt'>): VaultDocument => {
        const doc: VaultDocument = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setDocuments(prev => [...prev, doc]);
        log('document_added', doc.title, doc.id, `Added document "${doc.title}" (${doc.type})`);
        return doc;
    }, [log]);

    const updateDocument = useCallback((updated: VaultDocument) => {
        setDocuments(prev => prev.map(d => d.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : d));
    }, []);

    const removeDocument = useCallback((id: string) => {
        setDocuments(prev => { const d = prev.find(x => x.id === id); if (d) log('document_removed', d.title, id, `Removed "${d.title}"`); return prev.filter(d => d.id !== id); });
    }, [log]);

    // ─── Settings ───────────────────────────────────────────────
    const updateSettings = useCallback((updated: AppSettings) => {
        setSettings(updated);
        log('settings_updated', 'Settings', 'system', 'Updated company settings');
    }, [log]);

    // ─── IP Assets ──────────────────────────────────────────────
    const addIPAsset = useCallback((data: Omit<IPAsset, 'id' | 'createdAt' | 'updatedAt'>): IPAsset => {
        const asset: IPAsset = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setIPAssets(prev => [...prev, asset]);
        return asset;
    }, []);

    const updateIPAsset = useCallback((updated: IPAsset) => {
        setIPAssets(prev => prev.map(a => a.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : a));
    }, []);

    const removeIPAsset = useCallback((id: string) => {
        setIPAssets(prev => prev.filter(a => a.id !== id));
    }, []);

    // ─── Workshops ──────────────────────────────────────────────
    const addWorkshop = useCallback((data: Omit<WorkshopBooking, 'id' | 'createdAt'>): WorkshopBooking => {
        const ws: WorkshopBooking = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        setWorkshops(prev => [...prev, ws]);
        return ws;
    }, []);

    const updateWorkshop = useCallback((updated: WorkshopBooking) => {
        setWorkshops(prev => prev.map(w => w.id === updated.id ? updated : w));
    }, []);

    const removeWorkshop = useCallback((id: string) => {
        setWorkshops(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <StoreContext.Provider
            value={{
                clients, engagements, activeEngagementId, team, commercials, invoices, documents,
                activityLog, settings, ipAssets, workshops,
                addClient, updateClient, removeClient,
                selectEngagement, getActiveEngagement, updateEngagement, createEngagement,
                addTeamMember, updateTeamMember, removeTeamMember,
                addCommercial, updateCommercial, addInvoice, updateInvoice,
                addDocument, updateDocument, removeDocument,
                log, updateSettings,
                addIPAsset, updateIPAsset, removeIPAsset,
                addWorkshop, updateWorkshop, removeWorkshop,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

export function useDiagnosticStore(): DiagnosticStore {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useDiagnosticStore must be used within DiagnosticProvider');
    return ctx;
}
