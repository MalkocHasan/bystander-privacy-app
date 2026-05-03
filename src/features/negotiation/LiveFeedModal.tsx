import React, { useState, useEffect } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import type { Device } from '../../types';
import { X, Maximize2, Mic, MicOff, Video, VideoOff, Activity, ShieldCheck, Wifi } from 'lucide-react';

interface LiveFeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: Device | null;
}

export const LiveFeedModal: React.FC<LiveFeedModalProps> = ({
    isOpen,
    onClose,
    device
}) => {
    // Mock signal strength fluctuating
    const [signal, setSignal] = useState(90);
    const liveSensorData = useHomeStore(state => 
        device ? state.deviceStreams[device.id] : undefined
    );

    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setSignal(prev => Math.max(60, Math.min(100, prev + (Math.random() * 10 - 5))));
        }, 2000);
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen || !device) return null;

    const isCamera = device.type === 'camera';
    const isSensor = device.type === 'sensor';

    // Privacy Logic: What can the host actually see?
    const isMasked = device.status === 'masked';
    const isDisabled = device.status === 'disabled';
    const isActive = device.status === 'active';

    // Mock Footage Sources (Static + Overlay)
    const getFootageSrc = () => {
        if (device.room === 'Living Room') return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        if (device.room === 'Kitchen') return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        if (device.room === 'Bedroom') return 'https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        if (device.room === 'Entrance') return 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        if (device.room === 'Office') return 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1558002038-10914cbaeb7d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">

                {/* Header (Overlay) */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            {isCamera ? <Video className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-green-500" />}
                            {device.name}
                        </h3>
                        <p className="text-white/60 text-xs font-mono">{device.room} • {new Date().toLocaleTimeString()} • Signal: {Math.round(signal)}%</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Live Feed Viewport */}
                <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">

                    {/* Scenario 1: Active Camera */}
                    {isActive && isCamera && (
                        <>
                            <img
                                src={getFootageSrc()}
                                alt="Live Feed"
                                className="w-full h-full object-cover opacity-80"
                            />
                            {/* REC Indicator */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-red-600/80 px-2 py-1 rounded text-xs font-bold text-white animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                REC
                            </div>
                        </>
                    )}

                    {/* Scenario 2: Privacy Mode (Masked/Disabled) */}
                    {(isMasked || isDisabled) && isCamera && (
                        <div className="flex flex-col items-center text-center p-8">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700">
                                {isMasked ? <VideoOff className="w-8 h-8 text-slate-500" /> : <ShieldCheck className="w-8 h-8 text-indigo-500" />}
                            </div>
                            <h4 className="text-white font-bold text-xl">
                                {isMasked ? 'Camera Privacy Mask Enabled' : 'Device Disabled'}
                            </h4>
                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                                {isMasked
                                    ? "Visual feed is obscured for privacy. Audio implies presence only."
                                    : "This device has been completely powered down by the Privacy Protocol."
                                }
                            </p>

                            {/* Privacy Pattern Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                        </div>
                    )}

                    {/* Scenario 3: Sensor Data Mock */}
                    {isSensor && (
                        <div className="w-full h-full p-8 flex flex-col justify-end">
                            {/* Overlay if disabled */}
                            {(!isActive) && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/50 backdrop-blur-sm">
                                    <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                        Sensor {isMasked ? 'Masked' : 'Disabled'}
                                    </div>
                                </div>
                            )}

                            {/* Real Server Data Graph via CSS Bars */}
                            <div className={`flex justify-between items-end h-32 gap-1 mb-8 ${!isActive ? 'opacity-30' : ''}`}>
                                {(liveSensorData && liveSensorData.length > 0) ? (
                                    liveSensorData.map((val, i) => (
                                        <div
                                            key={i}
                                            className="w-full bg-green-500/50 rounded-t-sm transition-all duration-300"
                                            style={{
                                                height: isActive ? `${val}%` : '2%' // Flatline if inactive
                                            }}
                                        />
                                    ))
                                ) : (
                                    // Fallback / Loading Mock Graph if server stream not connected
                                    [...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-full bg-green-500/20 rounded-t-sm"
                                            style={{
                                                height: isActive ? `${20 + Math.random() * 80}%` : '2%', // Flatline
                                                animation: isActive ? `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` : 'none',
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="flex justify-between text-xs font-mono text-green-400 border-t border-green-500/30 pt-2">
                                <span>{isActive ? 'Activity Detected' : 'No Signal'}</span>
                                <span>Sensitivity: {isActive ? 'High' : 'Off'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls / Footer */}
                <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex gap-4">
                        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                            <div className="p-2 bg-slate-800 rounded-full">
                                <Mic className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] uppercase font-bold">Talk</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
                            <div className="p-2 bg-slate-800 rounded-full">
                                <Video className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] uppercase font-bold">Record</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Wifi className="w-3 h-3 text-green-500" />
                        Online
                    </div>
                </div>

            </div>
        </div>
    );
};
