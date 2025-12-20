import React, { useState, useEffect } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { PrivacyMode } from '../../types';
import { Button } from '../../components/ui/Button';
import { X, Save, Camera, Mic, Volume2, Video, Home } from 'lucide-react';

interface ModeConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: PrivacyMode;
}

export const ModeConfigModal: React.FC<ModeConfigModalProps> = ({
    isOpen,
    onClose,
    mode
}) => {
    const { updateModeRules, currentHome } = useHomeStore();

    // Local state for form
    const [disableCameras, setDisableCameras] = useState(false);
    const [disableSpeakers, setDisableSpeakers] = useState(false);
    const [disableSensors, setDisableSensors] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

    // Load initial values from mode when opened
    useEffect(() => {
        if (isOpen && mode) {
            setDisableCameras(!!mode.rules.disableCameras);
            setDisableSpeakers(!!mode.rules.disableSpeakers);
            setDisableSensors(!!mode.rules.disableSensors);
            setSelectedRooms(mode.rules.affectedRooms || []);
        }
    }, [isOpen, mode]);

    if (!isOpen || !currentHome) return null;

    // Derive unique rooms from devices
    const allRooms = Array.from(new Set(currentHome.devices.map(d => d.room)));

    const handleSave = () => {
        updateModeRules(mode.id, {
            disableCameras,
            disableSpeakers,
            disableSensors,
            affectedRooms: selectedRooms
        });
        onClose();
    };

    const toggleRoom = (room: string) => {
        if (selectedRooms.includes(room)) {
            setSelectedRooms(selectedRooms.filter(r => r !== room));
        } else {
            setSelectedRooms([...selectedRooms, room]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl animate-slide-up border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Settings: <span className={`text-${mode.color}-600 dark:text-${mode.color === 'private' ? 'teal' : mode.color === 'social' ? 'blue' : 'amber'}-400`}>{mode.name}</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 space-y-6">

                    {/* Device Rules Section */}
                    <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Device Rules</h4>
                        <div className="space-y-3">
                            {/* Toggle: Cameras */}
                            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${disableCameras ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                        <Video className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Disable Cameras</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={disableCameras}
                                    onChange={(e) => setDisableCameras(e.target.checked)}
                                    className="w-5 h-5 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                            </label>

                            {/* Toggle: Speakers */}
                            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${disableSpeakers ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                        <Volume2 className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Disable Speakers</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={disableSpeakers}
                                    onChange={(e) => setDisableSpeakers(e.target.checked)}
                                    className="w-5 h-5 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                            </label>

                            {/* Toggle: Sensors */}
                            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${disableSensors ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Disable Sensors</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={disableSensors}
                                    onChange={(e) => setDisableSensors(e.target.checked)}
                                    className="w-5 h-5 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                            </label>
                        </div>
                    </section>

                    {/* Room Selection Section */}
                    <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Affected Rooms</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {allRooms.map(room => {
                                const isSelected = selectedRooms.includes(room);
                                return (
                                    <button
                                        key={room}
                                        onClick={() => toggleRoom(room)}
                                        className={`
                                            p-2 rounded-lg text-sm font-medium flex items-center gap-2 border transition-all text-left
                                            ${isSelected
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300'
                                                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                                        {room}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        fullWidth
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 !bg-slate-800 hover:!bg-slate-900 dark:!bg-indigo-600 dark:hover:!bg-indigo-700"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};
