import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import type { Device, DeviceType } from '../../types';
import { X, Plus, Save } from 'lucide-react';

interface DeviceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Device>) => void;
    initialData?: Device;
}

const DEVICE_TYPES: DeviceType[] = ['camera', 'speaker', 'sensor', 'lock', 'light'];

export const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [type, setType] = useState<DeviceType>('light');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setRoom(initialData.room);
                setType(initialData.type);
            } else {
                setName('');
                setRoom('');
                setType('light');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, room, type });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">
                        {initialData ? 'Edit Device' : 'Add New Device'}
                    </h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Device Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Living Room Lamp"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                        />
                    </div>

                    {/* Room */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Room</label>
                        <input
                            type="text"
                            required
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            placeholder="e.g. Kitchen"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Device Type</label>
                        <div className="flex flex-wrap gap-2">
                            {DEVICE_TYPES.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalized
                                        ${type === t
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" fullWidth variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                            {initialData ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {initialData ? 'Save Changes' : 'Create Device'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
