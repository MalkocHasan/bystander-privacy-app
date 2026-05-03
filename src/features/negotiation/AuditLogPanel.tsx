import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { AuditLogEntry, AuditLogType } from '../../types';
import { ClipboardList, Wifi, ShieldCheck, Bell, Settings } from 'lucide-react';

const getTypeConfig = (type: AuditLogType) => {
    switch (type) {
        case 'connection':
            return { icon: Wifi, label: 'Connection', color: 'text-teal-600 bg-teal-50' };
        case 'mode':
            return { icon: ShieldCheck, label: 'Mode', color: 'text-blue-600 bg-blue-50' };
        case 'request':
            return { icon: Bell, label: 'Request', color: 'text-amber-600 bg-amber-50' };
        case 'admin':
            return { icon: Settings, label: 'Admin', color: 'text-indigo-600 bg-indigo-50' };
        default:
            return { icon: ClipboardList, label: 'Device', color: 'text-slate-600 bg-slate-100' };
    }
};

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const renderEntry = (entry: AuditLogEntry) => {
    const config = getTypeConfig(entry.type);
    const Icon = config.icon;

    return (
        <div key={entry.id} className="flex items-start gap-3 py-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{config.label}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{formatTimestamp(entry.timestamp)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">{entry.message}</p>
                {entry.actorRole && (
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Actor: {entry.actorRole}</p>
                )}
            </div>
        </div>
    );
};

export const AuditLogPanel: React.FC = () => {
    const auditLog = useHomeStore((state) => state.auditLog);

    return (
        <section className="card-base p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Audit Log</h3>
                        <p className="text-xs text-slate-400 font-medium">Recent activity (client-only)</p>
                    </div>
                </div>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {auditLog.length}
                </span>
            </div>

            {auditLog.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400">No activity yet.</div>
            ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {auditLog.map(renderEntry)}
                </div>
            )}
        </section>
    );
};
