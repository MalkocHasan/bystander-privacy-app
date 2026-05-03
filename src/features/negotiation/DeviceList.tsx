import React, { useEffect, useMemo, useState } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { DeviceType, DeviceStatus, Device, RequestType, DeviceHealth } from '../../types';
import { Eye, EyeOff, MicOff, Lock, Zap, ZapOff, Clock, LayoutGrid, Play, Pencil, Trash2, Plus, KeyRound } from 'lucide-react';
import { RequestModal } from './RequestModal';
import { LiveFeedModal } from './LiveFeedModal';
import { DeviceFormModal } from './DeviceFormModal';
import { ConfirmModal } from './ConfirmModal';

export const DeviceList: React.FC = () => {
    const {
        currentHome,
        currentUserRole,
        addRequest,
        pendingRequests,
        updateDeviceStatus,
        addDevice,
        editDevice,
        removeDevice,
        generatePairingCode,
        deviceTelemetry
    } = useHomeStore();

    // State
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
    const [modalMode, setModalMode] = useState<'request' | 'restore'>('request');
    const [groupMode, setGroupMode] = useState<'room' | 'scene'>('room');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    // CRUD State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | undefined>(undefined);
    const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isPairingOpen, setIsPairingOpen] = useState(false);

    if (!currentHome) return null;

    // --- Grouping Logic ---
    const groups = useMemo(() => {
        const base = [{ id: 'all', label: 'All' }];

        if (groupMode === 'room') {
            const rooms = Array.from(new Set(currentHome.devices.map(d => d.room)));
            return [...base, ...rooms.map(room => ({ id: room, label: room }))];
        }

        const scenes = currentHome.scenes.map(scene => ({ id: scene.id, label: scene.name }));
        const hasUnassigned = currentHome.devices.some(device => !device.sceneIds || device.sceneIds.length === 0);
        return hasUnassigned ? [...base, ...scenes, { id: 'unassigned', label: 'Unassigned' }] : [...base, ...scenes];
    }, [currentHome.devices, currentHome.scenes, groupMode]);

    const filteredDevices = currentHome.devices.filter((device) => {
        if (selectedGroup === 'all') return true;
        if (groupMode === 'room') return device.room === selectedGroup;
        if (selectedGroup === 'unassigned') return !device.sceneIds || device.sceneIds.length === 0;
        return !!device.sceneIds?.includes(selectedGroup);
    });

    const rooms = Array.from(new Set(currentHome.devices.map(d => d.room)));

    const selectedGroupLabel = groups.find((group) => group.id === selectedGroup)?.label || 'All';

    useEffect(() => {
        const isValid = groups.some((group) => group.id === selectedGroup);
        if (!isValid) {
            setSelectedGroup('all');
        }
    }, [groups, selectedGroup]);

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
            setModalMode('request');
            setSelectedDevice(device);
        } else {
            setModalMode('restore');
            setSelectedDevice(device);
        }
    };

    const handleViewFeed = (e: React.MouseEvent, device: Device) => {
        e.stopPropagation();
        setViewingDevice(device);
    };

    const handleRequestSubmit = (type: RequestType) => {
        if (selectedDevice) {
            addRequest(selectedDevice.id, type);
        }
    };

    const handleRestore = () => {
        if (selectedDevice) {
            addRequest(selectedDevice.id, 'restore');
        }
    };

    // CRUD Handlers
    const handleAddClick = () => {
        setEditingDevice(undefined);
        setIsFormOpen(true);
    };

    const handlePairClick = async () => {
        const code = await generatePairingCode();
        if (code) {
            setPairingCode(code);
            setIsPairingOpen(true);
        }
    };

    const handleEditClick = (e: React.MouseEvent, device: Device) => {
        e.stopPropagation();
        setEditingDevice(device);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, device: Device) => {
        e.stopPropagation();
        setDeviceToDelete(device);
    };

    const confirmDelete = () => {
        if (deviceToDelete) {
            removeDevice(deviceToDelete.id);
            setDeviceToDelete(null);
        }
    };

    const handleFormSubmit = (data: Partial<Device>) => {
        if (editingDevice) {
            editDevice(editingDevice.id, data);
        } else {
            // @ts-ignore
            addDevice(data);
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

    const getHealthConfig = (health?: DeviceHealth) => {
        if (health === 'offline') {
            return { label: 'Offline', color: 'text-rose-500', dot: 'bg-rose-500' };
        }
        if (health === 'degraded') {
            return { label: 'Degraded', color: 'text-amber-600', dot: 'bg-amber-500' };
        }
        return { label: 'Healthy', color: 'text-emerald-600', dot: 'bg-emerald-500' };
    };

    const formatLastSeen = (lastSeen?: number) => {
        if (!lastSeen) return 'Unknown';
        const seconds = Math.max(0, Math.floor((Date.now() - lastSeen) / 1000));
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
    };

    return (
        <>
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {(['room', 'scene'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setGroupMode(mode);
                                    setSelectedGroup('all');
                                }}
                                className={`
                                    px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border
                                    ${groupMode === mode
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Add Device Button (Host Only) */}
                    {currentUserRole === 'host' && (
                        <div className="flex gap-2 ml-2">
                            <button
                                onClick={handlePairClick}
                                className="w-8 h-8 flex items-center justify-center bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors"
                                title="Pair New Device"
                            >
                                <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleAddClick}
                                className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
                                title="Add Mock Device"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide -mx-2 px-2">
                    {groups.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => setSelectedGroup(group.id)}
                            className={`
                                px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                                ${selectedGroup === group.id
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md dark:bg-indigo-500 dark:text-white dark:border-indigo-500'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                                }
                            `}
                        >
                            {group.id === 'all' && <LayoutGrid className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />}
                            {group.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Device Grid */}
            <div className="grid grid-cols-2 gap-3 min-h-[300px] content-start">
                {filteredDevices.map((device) => {
                    const requestStatus = getRequestStatus(device.id);
                    const config = getStatusConfig(device.type, device.status, requestStatus);
                    const StatusIcon = config.icon;
                    const canViewFeed = currentUserRole === 'host' && (device.type === 'camera' || device.type === 'sensor');
                    const isHost = currentUserRole === 'host';
                    const telemetry = deviceTelemetry[device.id];
                    const healthConfig = getHealthConfig(telemetry?.health);

                    return (
                        <div
                            key={device.id}
                            onClick={() => handleDeviceClick(device)}
                            className={`
                                relative card-base p-4 flex flex-col gap-3 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-95 group
                                ${requestStatus === 'pending' ? 'ring-2 ring-amber-200 dark:ring-amber-500/50' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor} ${config.color}`}>
                                    <StatusIcon className="w-5 h-5" />
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* View Feed - Cameras see it (Host Only) */}
                                    {canViewFeed && (
                                        <button
                                            onClick={(e) => handleViewFeed(e, device)}
                                            className="p-1.5 bg-slate-100 hover:bg-white text-teal-600 hover:text-teal-700 rounded-full transition-all shadow-sm border border-slate-200"
                                            title="View Live Feed"
                                        >
                                            <Play className="w-2.5 h-2.5 fill-current" />
                                        </button>
                                    )}

                                    {/* Host Actions: Edit/Delete */}
                                    {isHost && (
                                        <>
                                            <button
                                                onClick={(e) => handleEditClick(e, device)}
                                                className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-full transition-all"
                                            >
                                                <Pencil className="w-2.5 h-2.5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, device)}
                                                className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-all"
                                            >
                                                <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                        </>
                                    )}

                                    {/* Status Badge */}
                                    {!isHost && (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${config.bgColor} ${config.color}`}>
                                            {config.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-tight pr-4">
                                    {device.name}
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                                    {device.room}
                                </p>
                                <div className={`mt-2 text-[10px] font-semibold flex items-center gap-2 ${healthConfig.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${healthConfig.dot}`} />
                                    <span>{healthConfig.label}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-400">Last seen {formatLastSeen(telemetry?.lastSeen)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredDevices.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400 dark:text-slate-600">
                        <p className="text-sm">
                            {selectedGroup === 'all'
                                ? 'No devices found.'
                                : `No devices found in ${selectedGroupLabel}.`
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <RequestModal
                isOpen={!!selectedDevice && currentUserRole === 'guest'}
                onClose={() => setSelectedDevice(null)}
                device={selectedDevice}
                mode={modalMode}
                onSubmit={handleRequestSubmit}
                onRestore={handleRestore}
            />

            <LiveFeedModal
                isOpen={!!viewingDevice}
                onClose={() => setViewingDevice(null)}
                device={viewingDevice}
            />

            <DeviceFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingDevice}
                scenes={currentHome.scenes}
                rooms={rooms}
            />

            <ConfirmModal
                isOpen={!!deviceToDelete}
                title="Delete Device"
                message={`Are you sure you want to remove "${deviceToDelete?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeviceToDelete(null)}
                confirmText="Delete"
                isDestructive
            />

            {/* Pairing Code Modal */}
            <ConfirmModal
                isOpen={isPairingOpen}
                title="Device Pairing Code"
                message={`Enter this 6-digit code on the device simulator to securely pair it with this home network:\n\n${pairingCode}\n\nThis code expires in 5 minutes.`}
                onConfirm={() => setIsPairingOpen(false)}
                onCancel={() => setIsPairingOpen(false)}
                confirmText="Close"
            />
        </>
    );
};
