import React, { useState } from 'react';
import { type Device, type RequestType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Shield, Sparkles, X, Power } from 'lucide-react';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: Device | null;
    mode?: 'request' | 'restore';
    onSubmit: (type: RequestType) => void;
    onRestore?: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
    isOpen,
    onClose,
    device,
    mode = 'request',
    onSubmit,
    onRestore
}) => {
    const [selectedType, setSelectedType] = useState<RequestType | null>(null);

    if (!isOpen || !device) return null;

    const handleSubmit = () => {
        if (mode === 'restore' && onRestore) {
            onRestore();
            onClose();
        } else if (selectedType) {
            onSubmit(selectedType);
            onClose();
            setSelectedType(null);
        }
    };

    // --- RESTORE MODE UI ---
    if (mode === 'restore') {
        return (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                            <Power className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Restore Access?</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            This will turn <span className="font-bold text-slate-700">{device.name}</span> back on.
                            It will be fully visible and active.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            fullWidth
                            variant="primary"
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                        >
                            Turn On
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- REQUEST MODE UI (Default) ---
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Privacy Request</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Requesting privacy for <span className="font-bold text-slate-700">{device.name}</span>
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => setSelectedType('prayer')}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${selectedType === 'prayer'
                            ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 shadow-teal-100 shadow-lg'
                            : 'border-slate-100 hover:border-teal-200 bg-white'
                            }`}
                    >
                        <div className={`p-3 rounded-full ${selectedType === 'prayer' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-700">Prayer / Modesty</h4>
                            <p className="text-xs text-slate-400">High priority. Disables device.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedType('comfort')}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${selectedType === 'comfort'
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-blue-100 shadow-lg'
                            : 'border-slate-100 hover:border-blue-200 bg-white'
                            }`}
                    >
                        <div className={`p-3 rounded-full ${selectedType === 'comfort' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-700">Comfort</h4>
                            <p className="text-xs text-slate-400">Standard request. Masks recording.</p>
                        </div>
                    </button>
                </div>

                <Button
                    fullWidth
                    variant="primary"
                    disabled={!selectedType}
                    onClick={handleSubmit}
                >
                    Notify Host
                </Button>
            </div>
        </div>
    );
};
