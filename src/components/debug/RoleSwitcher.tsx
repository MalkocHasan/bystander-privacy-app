import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import { Users, Shield } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
    const { currentUserRole, setUserRole } = useHomeStore();

    if (!currentUserRole) return null;

    const toggleRole = () => {
        setUserRole(currentUserRole === 'guest' ? 'host' : 'guest');
    };

    return (
        <button
            onClick={toggleRole}
            className={`
                fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all
                ${currentUserRole === 'host' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'}
            `}
        >
            {currentUserRole === 'host' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span className="uppercase text-xs tracking-wider">
                View: {currentUserRole}
            </span>
        </button>
    );
};
