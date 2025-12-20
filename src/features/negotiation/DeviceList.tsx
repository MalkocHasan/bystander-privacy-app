import React from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { Device, DeviceType, DeviceStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Eye, Lock, Lightbulb, Activity, EyeOff, Volume2, VolumeX } from 'lucide-react';

export const DeviceList: React.FC = () => {
    const currentHome = useHomeStore((state) => state.currentHome);

    if (!currentHome) return null;

    const getDeviceIcon = (type: DeviceType): React.JSX.Element => {
        const iconClass = "w-5 h-5";

        const icons: Record<DeviceType, React.JSX.Element> = {

            camera: <Eye className={iconClass} />,
            speaker: <Volume2 className={iconClass} />,
            sensor: <Activity className={iconClass} />,
            lock: <Lock className={iconClass} />,
            light: <Lightbulb className={iconClass} />,
        };

        return icons[type];
    };

    const getStatusBadge = (status: DeviceStatus) => {
        const badges: Record<DeviceStatus, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; text: string }> = {
            active: { variant: 'success', text: 'Active' },
            masked: { variant: 'warning', text: 'Masked' },
            disabled: { variant: 'danger', text: 'Disabled' },
        };

        const badge = badges[status];
        return <Badge variant={badge.variant}>{badge.text}</Badge>;
    };

    const getStatusIcon = (device: Device) => {
        if (device.type === 'camera' && device.status === 'masked') {
            return <EyeOff className="w-5 h-5 text-yellow-600" />;
        }
        if (device.type === 'speaker' && device.status === 'disabled') {
            return <VolumeX className="w-5 h-5 text-red-600" />;
        }
        return null;
    };

    // Group devices by room
    const devicesByRoom = currentHome.devices.reduce((acc, device) => {
        if (!acc[device.room]) {
            acc[device.room] = [];
        }
        acc[device.room].push(device);
        return acc;
    }, {} as Record<string, Device[]>);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Device Transparency</h3>
                <p className="text-sm text-gray-600">View all smart devices and their current status</p>
            </div>

            {Object.entries(devicesByRoom).map(([room, devices]) => (
                <Card key={room} variant="outline" className="!p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                        {room}
                    </h4>

                    <div className="space-y-2">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Device Icon with Status Overlay */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${device.status === 'active' ? 'bg-blue-100 text-blue-600' : ''}
                      ${device.status === 'masked' ? 'bg-yellow-100 text-yellow-600' : ''}
                      ${device.status === 'disabled' ? 'bg-red-100 text-red-600' : ''}
                    `}>
                                            {getStatusIcon(device) || getDeviceIcon(device.type)}
                                        </div>

                                        {/* Pulse indicator for active devices */}
                                        {device.status === 'active' && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Device Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm truncate">
                                            {device.name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {device.type}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex-shrink-0">
                                        {getStatusBadge(device.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="font-semibold text-blue-900 text-sm mb-1">
                            Full Transparency
                        </h5>
                        <p className="text-xs text-blue-800">
                            You can see all smart devices in this home. Masked cameras don't record,
                            and disabled devices are temporarily turned off for your visit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
