import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeStore } from '../../store/useHomeStore';
import { ModeSelector } from './ModeSelector';
import { DeviceList } from './DeviceList';
import { AuditLogPanel } from './AuditLogPanel';
import { Button } from '../../components/ui/Button';
import { Home, ShieldCheck, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AdminNotification } from './AdminNotification';
import { RoleSwitcher } from '../../components/debug/RoleSwitcher';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentHome, disconnect, currentUserRole } = useHomeStore();

    const handleDisconnect = () => {
        disconnect();
        navigate('/');
    };

    if (!currentHome) return null;

    // Determine Hero State based on active mode
    const getHeroState = () => {
        const mode = currentHome.activeMode;
        switch (mode) {
            case 'private':
                return {
                    icon: ShieldCheck,
                    title: "You are fully protected",
                    subtitle: "Sensors & cameras are disabled for your privacy.",
                    color: "text-teal-700 bg-teal-50 border-teal-100",
                    iconColor: "text-teal-500 bg-teal-100"
                };
            case 'social':
                return {
                    icon: CheckCircle2,
                    title: "Standard Privacy Active",
                    subtitle: "Cameras are masked, but audio is available.",
                    color: "text-blue-700 bg-blue-50 border-blue-100",
                    iconColor: "text-blue-500 bg-blue-100"
                };
            case 'security':
                return {
                    icon: ShieldAlert,
                    title: "Security System Active",
                    subtitle: "Cameras are recording for your safety.",
                    color: "text-amber-700 bg-amber-50 border-amber-100",
                    iconColor: "text-amber-500 bg-amber-100"
                };
            default:
                return {
                    icon: Home,
                    title: "Welcome Home",
                    subtitle: "Select a mode to begin.",
                    color: "text-slate-600 bg-white border-slate-100",
                    iconColor: "text-slate-400 bg-slate-100"
                };
        }
    };

    const hero = getHeroState();
    const HeroIcon = hero.icon;

    return (
        <div className="min-h-screen px-6 py-8 max-w-lg mx-auto space-y-8 animate-fade-in pb-20">

            {/* Host Notifications */}
            <AdminNotification />

            {/* Header / Nav */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-soft-sm border border-slate-100 flex items-center justify-center text-slate-500">
                        <Home className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 text-lg leading-tight">
                            {currentHome.homeName}
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center">
                            Host: {currentHome.ownerName}
                            {currentUserRole === 'host' && (
                                <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    Admin View
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDisconnect}
                    className="!rounded-full !w-10 !h-10 !p-0 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-soft-sm"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </header>

            {/* Status Hero Card */}
            <section className={`
                relative overflow-hidden rounded-[2rem] p-8 text-center flex flex-col items-center gap-4 transition-all duration-500 border
                ${hero.color} shadow-soft-lg
            `}>
                <div className={`p-5 rounded-full shadow-inner-soft ${hero.iconColor} mb-2`}>
                    <HeroIcon className="w-12 h-12" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        {hero.title}
                    </h2>
                    <p className="text-sm opacity-90 font-medium max-w-[200px] mx-auto leading-relaxed">
                        {hero.subtitle}
                    </p>
                </div>
            </section>

            {/* Connection Pucks (Mode Selector) - ADMIN ONLY */}
            {currentUserRole === 'host' && (
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="font-bold text-slate-800 text-lg">Privacy Modes</h3>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase tracking-wider">
                            Admin Control
                        </span>
                    </div>
                    <ModeSelector />
                </section>
            )}

            {/* Device List (Smart Home Grid) */}
            <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold text-slate-800 text-lg">Devices</h3>
                    <span className="text-xs font-bold bg-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                        {currentHome.devices.length} Connected
                    </span>
                </div>
                <DeviceList />
            </section>

            {/* Audit Log */}
            <AuditLogPanel />

            {/* Footer */}
            <div className="text-center pt-8 border-t border-slate-100 mt-8 mb-12">
                <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Bystander Privacy &bull; Consumer Edition
                </p>
            </div>

            {/* Debug Role Switcher */}
            <RoleSwitcher />
        </div>
    );
};
