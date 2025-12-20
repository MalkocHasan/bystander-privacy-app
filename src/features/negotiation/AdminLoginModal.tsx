import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Lock, X, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === 'admin') {
            onSuccess();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('Incorrect password. Access denied.');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        <span>Admin Access</span>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner-soft">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Host View Locked
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Please enter the admin password to verify your identity.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <input
                            autoFocus
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter password"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-center font-bold tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal"
                        />
                        {error && (
                            <p className="text-xs text-rose-500 font-bold text-center animate-shake">
                                {error}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                    >
                        Unlock Admin Mode
                    </Button>
                </form>
            </div>
        </div>
    );
};
