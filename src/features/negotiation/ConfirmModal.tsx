import React from 'react';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-slate-100">
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={onCancel}
                            className="bg-slate-100 border-none text-slate-600 hover:bg-slate-200"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            fullWidth
                            onClick={onConfirm}
                            className={isDestructive ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
