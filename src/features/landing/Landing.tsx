import React, { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useHomeStore } from '../../store/useHomeStore';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
    const [homeCode, setHomeCode] = useState('');
    const [error, setError] = useState('');
    const connectToHome = useHomeStore((state) => state.connectToHome);
    const navigate = useNavigate();

    const handleConnect = async () => {
        if (homeCode.length !== 4) {
            setError('Please enter a 4-digit home code');
            return;
        }

        try {
            const success = await connectToHome(homeCode);

            if (success) {
                navigate('/dashboard');
            } else {
                setError('Code not found. Is the server running?');
            }
        } catch (e) {
            setError('Connection failed. Server might be offline.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-sm animate-fade-in text-center">

                {/* Brand Hero */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-teal-500 text-white flex items-center justify-center shadow-teal-500/30 shadow-xl mb-6">
                        <LockKeyhole className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Bystander
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Smart home privacy, simplified.
                    </p>
                </div>

                {/* Interaction Card */}
                <div className="card-base p-8 space-y-6">
                    <div className="space-y-4">
                        <label htmlFor="homeCode" className="block text-sm font-bold text-slate-700">
                            Enter Home Code
                        </label>
                        <input
                            id="homeCode"
                            type="text"
                            maxLength={4}
                            inputMode="numeric"
                            value={homeCode}
                            onChange={(e) => {
                                setHomeCode(e.target.value.replace(/\D/g, ''));
                                setError('');
                            }}
                            placeholder="0 0 0 0"
                            className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-200"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {error}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleConnect}
                        className="py-4 text-lg shadow-xl shadow-teal-500/20"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span>Connect Securely</span>
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </Button>
                </div>

                {/* Footer Help */}
                <p className="mt-8 text-xs text-slate-400 font-medium">
                    Try demo codes <span className="text-slate-600 font-bold bg-slate-200 px-1 py-0.5 rounded">1234</span> or <span className="text-slate-600 font-bold bg-slate-200 px-1 py-0.5 rounded">5678</span>
                </p>
            </div>
        </div>
    );
};
