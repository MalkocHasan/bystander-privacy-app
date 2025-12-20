import React, { useState } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { DeviceType, DeviceStatus, Device, RequestType } from '../../types';
import { Eye, EyeOff, MicOff, Lock, Zap, ZapOff, Clock } from 'lucide-react';
import { RequestModal } from './RequestModal';

export const DeviceList: React.FC = () => {
    const {
        currentHome,
        currentUserRole,
        addRequest,
        pendingRequests,
        updateDeviceStatus
    } = useHomeStore();

    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [modalMode, setModalMode] = useState<'request' | 'restore'>('request');

    if (!currentHome) return null;

    const handleDeviceClick = (device: Device) => {
        // HOST: Full Control (Toggle)
        if (currentUserRole === 'host') {
            if (device.status === 'active') {
                updateDeviceStatus(device.id, 'disabled');
            } else {
                updateDeviceStatus(device.id, 'active');
            }
            return;
        }

        // GUEST: Request Privacy OR Restore Access
        if (device.status === 'active') {
            // Requesting Privacy
            setModalMode('request');
            setSelectedDevice(device);
        } else {
            // Device is semi-private or off -> Restore Access
            setModalMode('restore');
            setSelectedDevice(device);
        }
    };

    const handleRequestSubmit = (type: RequestType) => {
        if (selectedDevice) {
            addRequest(selectedDevice.id, type);
        }
    };

    const handleRestore = () => {
        if (selectedDevice) {
            updateDeviceStatus(selectedDevice.id, 'active');
        }
    };

    // Helper to see if a device has a pending request
    const getRequestStatus = (deviceId: number) => {
        const req = pendingRequests.find(r => r.deviceId === deviceId && r.status === 'pending');
        return req ? 'pending' : null;
    };

    const getStatusConfig = (type: DeviceType, status: DeviceStatus, requestStatus: string | null) => {
        // Priority: Pending Request > Actual Status
        if (requestStatus === 'pending') {
            return {
                icon: Clock,
                label: 'Pending',
                color: 'text-amber-600',
                bgColor: 'bg-amber-100',
                desc: 'Waiting for Host'
            };
        }

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
                color: 'text-rose-500',
                bgColor: 'bg-rose-50',
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
        <>
            <div className="grid grid-cols-2 gap-3">
                {currentHome.devices.map((device) => {
                    const requestStatus = getRequestStatus(device.id);
                    const config = getStatusConfig(device.type, device.status, requestStatus);
                    const StatusIcon = config.icon;

                    return (
                        <div
                            key={device.id}
                            onClick={() => handleDeviceClick(device)}
                            className={`
                                card-base p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-95
                                ${requestStatus === 'pending' ? 'ring-2 ring-amber-200' : ''}
                            `}
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

            {/* Negotiation Modal (Handles both Request & Restore) */}
            <RequestModal
                isOpen={!!selectedDevice}
                onClose={() => setSelectedDevice(null)}
                device={selectedDevice}
                mode={modalMode}
                onSubmit={handleRequestSubmit}
                onRestore={handleRestore}
            />
        </>
    );
};
