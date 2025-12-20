import React, { useState } from 'react';
import { Home, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useHomeStore } from '../../store/useHomeStore';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
    const [homeCode, setHomeCode] = useState('');
    const [error, setError] = useState('');
    const connectToHome = useHomeStore((state) => state.connectToHome);
    const navigate = useNavigate();

    const handleConnect = () => {
        if (homeCode.length !== 4) {
            setError('Please enter a 4-digit home code');
            return;
        }

        const success = connectToHome(homeCode);

        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid home code. Try 1234 or 5678');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-4 shadow-lg">
                        <Home className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Bystander Privacy
                    </h1>
                    <p className="text-gray-600">
                        Your privacy, your choice
                    </p>
                </div>

                {/* Main Card */}
                <Card variant="gradient" className="animate-slide-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Check-in to Home
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Enter the 4-digit code from your host to negotiate privacy settings
                    </p>

                    {/* Home Code Input */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="homeCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Home Code
                            </label>
                            <input
                                id="homeCode"
                                type="text"
                                maxLength={4}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={homeCode}
                                onChange={(e) => {
                                    setHomeCode(e.target.value.replace(/\D/g, ''));
                                    setError('');
                                }}
                                placeholder="0000"
                                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleConnect}
                            className="flex items-center justify-center gap-2"
                        >
                            <span>Connect</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Demo Hint */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            <strong>Demo:</strong> Try codes <code className="bg-gray-100 px-2 py-1 rounded">1234</code> or <code className="bg-gray-100 px-2 py-1 rounded">5678</code>
                        </p>
                    </div>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Privacy-first smart home experience</p>
                </div>
            </div>
        </div>
    );
};
