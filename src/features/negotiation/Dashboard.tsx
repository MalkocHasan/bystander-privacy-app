import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeStore } from '../../store/useHomeStore';
import { ModeSelector } from './ModeSelector';
import { DeviceList } from './DeviceList';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Home, LogOut, Shield } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const currentHome = useHomeStore((state) => state.currentHome);
    const disconnect = useHomeStore((state) => state.disconnect);

    // Redirect if not connected
    React.useEffect(() => {
        if (!currentHome) {
            navigate('/');
        }
    }, [currentHome, navigate]);

    const handleDisconnect = () => {
        disconnect();
        navigate('/');
    };

    if (!currentHome) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 text-lg">
                                    {currentHome.homeName}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Host: {currentHome.ownerName}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDisconnect}
                            className="!px-3 !py-2"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
                {/* Welcome Card */}
                <Card variant="gradient" className="animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-gray-900 mb-1">
                                Welcome, Guest! 👋
                            </h2>
                            <p className="text-sm text-gray-600">
                                You're connected to <strong>{currentHome.homeName}</strong>.
                                Choose a privacy mode below that makes you comfortable.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Mode Selector */}
                <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <ModeSelector />
                </div>

                {/* Device List */}
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <DeviceList />
                </div>
            </main>

            {/* Footer Info */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>🔒 Privacy-first connection</span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></span>
                            Connected
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
