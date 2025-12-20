import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import { Button } from '../../components/ui/Button';
import { AlertCircle, Check, X } from 'lucide-react';

export const AdminNotification: React.FC = () => {
    const { pendingRequests, approveRequest, denyRequest, currentUserRole, currentHome } = useHomeStore();

    // Only show for hosts
    if (currentUserRole !== 'host') return null;

    const activeRequests = pendingRequests.filter(r => r.status === 'pending');

    if (activeRequests.length === 0) return null;

    return (
        <div className="fixed top-20 left-0 right-0 px-4 z-40 max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-amber-50 px-4 py-3 flex items-center gap-2 border-b border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600 animate-pulse" />
                    <span className="font-bold text-amber-800 text-sm">Action Required: {activeRequests.length} Request(s)</span>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
                    {activeRequests.map((req) => {
                        // Lookup device to get Room Name
                        const device = currentHome?.devices.find(d => d.id === req.deviceId);
                        const roomName = device?.room || 'Unknown Room';

                        return (
                            <div key={req.id} className="p-4 bg-white">
                                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                                    <span className="font-bold text-slate-800">Guest</span> is requesting
                                    <span className="block my-1 font-bold text-teal-600 text-base">
                                        {req.requestType === 'prayer' && 'Prayer Mode (Disable)'}
                                        {req.requestType === 'comfort' && 'Comfort Mode (Mask)'}
                                        {req.requestType === 'restore' && 'Restore Access (Active)'}
                                    </span>
                                    for <span className="font-bold text-slate-800">{req.deviceName}</span> in <span className="font-bold text-slate-800">{roomName}</span>.
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 !bg-teal-500 hover:!bg-teal-600 !text-white !h-9 text-xs"
                                        onClick={() => approveRequest(req.id)}
                                    >
                                        <Check className="w-3 h-3 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 !bg-slate-100 hover:!bg-slate-200 !text-slate-600 !h-9 text-xs border-0"
                                        onClick={() => denyRequest(req.id)}
                                    >
                                        <X className="w-3 h-3 mr-1" />
                                        Deny
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
