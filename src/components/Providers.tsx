'use client';

import { DiagnosticProvider } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
    return <DiagnosticProvider>{children}</DiagnosticProvider>;
}
