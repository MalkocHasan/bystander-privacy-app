import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { DeviceType, DeviceStatus } from '../../types';
import { Eye, EyeOff, MicOff, Lock, Zap, ZapOff } from 'lucide-react';

export const DeviceList: React.FC = () => {
    const currentHome = useHomeStore((state) => state.currentHome);

    if (!currentHome) return null;

    const getStatusConfig = (type: DeviceType, status: DeviceStatus) => {
        // Dynamic status configuration for friendly UI
        if (status === 'masked') {
            return {
                icon: type === 'camera' ? EyeOff : MicOff,
                label: 'Private',
                color: 'text-slate-400',
                bgColor: 'bg-slate-100',
                desc: 'Not recording'
            };
        }
        if (status === 'disabled') {
            return {
                icon: ZapOff,
                label: 'Off',
                color: 'text-slate-300',
                bgColor: 'bg-slate-50',
                desc: 'Powered down'
            };
        }
        // Active
        if (type === 'camera') {
            return {
                icon: Eye,
                label: 'Live',
                color: 'text-amber-500',
                bgColor: 'bg-amber-50',
                desc: 'Recording'
            };
        }
        if (type === 'lock') {
            return {
                icon: Lock,
                label: 'Locked',
                color: 'text-teal-600',
                bgColor: 'bg-teal-50',
                desc: 'Secure'
            };
        }
        return {
            icon: Zap,
            label: 'On',
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            desc: 'Active'
        };
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {currentHome.devices.map((device) => {
                const config = getStatusConfig(device.type, device.status);
                const StatusIcon = config.icon;

                return (
                    <div
                        key={device.id}
                        className="card-base p-4 flex flex-col gap-3 card-hover"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor} ${config.color}`}>
                                <StatusIcon className="w-5 h-5" />
                            </div>

                            {/* Status Badge */}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${config.bgColor} ${config.color}`}>
                                {config.label}
                            </span>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-700 text-sm leading-tight">
                                {device.name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                {device.room}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
