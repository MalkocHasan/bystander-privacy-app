import React, { useState, useRef, useEffect } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import { Camera, ShieldCheck, VideoOff, Activity, BedDouble, Utensils, Tv, DoorOpen, Briefcase, Box, ChevronDown, ChevronUp, GripHorizontal, Maximize2, Minimize2, Lock, Unlock } from 'lucide-react';
import type { Device } from '../../types';

// Default positions within a room to avoid overlapping
const POSITIONS = [
    { top: '35%', left: '30%' },
    { top: '60%', left: '70%' },
    { top: '25%', left: '60%' },
    { top: '65%', left: '25%' },
    { top: '45%', left: '50%' },
    { top: '20%', left: '30%' },
];

const DraggableMarker: React.FC<{ device: Device; defaultPos: { top: string; left: string }; isLocked: boolean }> = ({ device, defaultPos, isLocked }) => {
    const { updateDeviceStatus } = useHomeStore();
    
    const isMasked = device.status === 'masked';
    const isDisabled = device.status === 'disabled';
    const isSensor = device.type === 'sensor';

    let colorClass = 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]';
    if (isDisabled) colorClass = 'bg-slate-700 text-slate-400 shadow-none';
    else if (isMasked) colorClass = 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]';

    const storageKey = `device_pos_${device.id}`;

    // Initialize state from local storage or fallback to default
    const [pos, setPos] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : defaultPos;
    });

    const [isDragging, setIsDragging] = useState(false);
    const markerRef = useRef<HTMLDivElement>(null);
    const startPosRef = useRef<{x: number, y: number} | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        startPosRef.current = { x: e.clientX, y: e.clientY };
        if (isLocked) return;
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !markerRef.current || isLocked) return;

        const parent = markerRef.current.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();

        // Calculate raw position relative to parent (subtract 16px to center the 32x32px marker on the cursor)
        let x = e.clientX - rect.left - 16;
        let y = e.clientY - rect.top - 16;

        // Bound strictly to the room container
        x = Math.max(0, Math.min(x, rect.width - 32));
        y = Math.max(0, Math.min(y, rect.height - 32));

        // Convert to percentage so it stays responsive when window resizes
        const leftPct = (x / rect.width) * 100;
        const topPct = (y / rect.height) * 100;

        setPos({ left: `${leftPct}%`, top: `${topPct}%` });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            setIsDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
            localStorage.setItem(storageKey, JSON.stringify(pos));
        }

        // Check if it was a click rather than a drag
        if (startPosRef.current) {
            const dx = Math.abs(e.clientX - startPosRef.current.x);
            const dy = Math.abs(e.clientY - startPosRef.current.y);
            
            // If moved less than 5 pixels, treat it as a click
            if (dx < 5 && dy < 5) {
                // Cycle the privacy status: active -> masked -> disabled -> active
                let nextStatus: Device['status'] = 'active';
                if (device.status === 'active') nextStatus = 'masked';
                else if (device.status === 'masked') nextStatus = 'disabled';
                
                updateDeviceStatus(device.id, nextStatus);
            }
        }
    };

    return (
        <div 
            ref={markerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-colors z-20 hover:scale-110 active:scale-125 ${colorClass} ${isDragging ? 'shadow-2xl z-50' : 'duration-500'} ${isLocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
            style={{ 
                top: pos.top, 
                left: pos.left,
                touchAction: 'none' // prevents scrolling on mobile while dragging
            }}
            title={isLocked ? `${device.name} (${device.status}) - Click to toggle status` : `${device.name} (${device.status}) - Drag to move, Click to toggle`}
        >
            {isDisabled ? (
                <ShieldCheck className="w-4 h-4" />
            ) : isMasked ? (
                <VideoOff className="w-4 h-4" />
            ) : isSensor ? (
                <Activity className="w-4 h-4 animate-pulse" />
            ) : (
                <Camera className="w-4 h-4" />
            )}

            {/* Ping animation if active */}
            {!isDisabled && !isMasked && !isDragging && (
                <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-20 pointer-events-none" />
            )}
        </div>
    );
};

export const FloorPlan: React.FC = () => {
    const { currentHome } = useHomeStore();
    const [isOpen, setIsOpen] = useState(false);
    
    // Layout lock state
    const [isLocked, setIsLocked] = useState(() => {
        return localStorage.getItem('floorplan_locked') !== 'false'; // Default to true if not set
    });

    if (!currentHome) return null;

    // Extract unique rooms dynamically
    const uniqueRooms = Array.from(new Set(currentHome.devices.map(d => d.room || 'Unknown')));

    // State for room ordering
    const [roomOrder, setRoomOrder] = useState<string[]>(() => {
        const saved = localStorage.getItem('floorplan_room_order');
        if (saved) {
            const parsed = JSON.parse(saved);
            const finalOrder = [...parsed];
            // Ensure any new rooms are added
            uniqueRooms.forEach(r => {
                if (!finalOrder.includes(r)) finalOrder.push(r);
            });
            // Filter out old deleted rooms
            return finalOrder.filter((r: string) => uniqueRooms.includes(r));
        }
        return uniqueRooms;
    });

    // Auto-sync if uniqueRooms changes (e.g. new device paired to new room)
    useEffect(() => {
        setRoomOrder(prev => {
            const newOrder = [...prev];
            uniqueRooms.forEach(r => {
                if (!newOrder.includes(r)) newOrder.push(r);
            });
            const finalOrder = newOrder.filter(r => uniqueRooms.includes(r));
            localStorage.setItem('floorplan_room_order', JSON.stringify(finalOrder));
            return finalOrder;
        });
    }, [uniqueRooms.length]);

    // State for room sizes (1 or 2 columns)
    const [roomSizes, setRoomSizes] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('floorplan_room_sizes');
        if (saved) return JSON.parse(saved);
        
        // Defaults: Living Room / Master span 2 cols initially
        const defaults: Record<string, number> = {};
        uniqueRooms.forEach(r => {
            defaults[r] = (r.toLowerCase().includes('liv') || r.toLowerCase().includes('master')) ? 2 : 1;
        });
        return defaults;
    });

    const toggleRoomSize = (e: React.MouseEvent, room: string) => {
        e.stopPropagation(); // prevent drag
        setRoomSizes(prev => {
            const currentSize = prev[room] || 1;
            const newSize = currentSize === 1 ? 2 : 1;
            const newSizes = { ...prev, [room]: newSize };
            localStorage.setItem('floorplan_room_sizes', JSON.stringify(newSizes));
            return newSizes;
        });
    };

    const [draggedRoom, setDraggedRoom] = useState<string | null>(null);
    const [draggableRoom, setDraggableRoom] = useState<string | null>(null);

    const handleRoomDragStart = (e: React.DragEvent, room: string) => {
        if (isLocked) return;
        setDraggedRoom(room);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            (e.target as HTMLElement).classList.add('opacity-40');
        }, 0);
    };

    const handleRoomDragEnd = (e: React.DragEvent) => {
        setDraggedRoom(null);
        (e.target as HTMLElement).classList.remove('opacity-40');
    };

    const handleRoomDrop = (e: React.DragEvent, targetRoom: string) => {
        e.preventDefault();
        if (!draggedRoom || draggedRoom === targetRoom || isLocked) return;

        setRoomOrder(prev => {
            const newOrder = [...prev];
            const draggedIdx = newOrder.indexOf(draggedRoom);
            const targetIdx = newOrder.indexOf(targetRoom);
            
            // Swap
            newOrder[draggedIdx] = targetRoom;
            newOrder[targetIdx] = draggedRoom;
            
            localStorage.setItem('floorplan_room_order', JSON.stringify(newOrder));
            return newOrder;
        });
    };

    // Helper to assign icons based on room name keywords
    const getRoomIcon = (roomName: string) => {
        const lower = roomName.toLowerCase();
        if (lower.includes('bed')) return <BedDouble className="absolute text-slate-700 w-20 h-20 opacity-20 top-4 right-4" strokeWidth={1} />;
        if (lower.includes('kitch') || lower.includes('din')) return <Utensils className="absolute text-slate-700 w-16 h-16 opacity-20 top-4 right-4" strokeWidth={1} />;
        if (lower.includes('liv') || lower.includes('fam')) return <Tv className="absolute text-slate-700 w-20 h-20 opacity-20 bottom-4 left-6" strokeWidth={1} />;
        if (lower.includes('ent') || lower.includes('door') || lower.includes('front')) return <DoorOpen className="absolute text-slate-700 w-16 h-16 opacity-20 bottom-4 right-4" strokeWidth={1} />;
        if (lower.includes('off') || lower.includes('study')) return <Briefcase className="absolute text-slate-700 w-16 h-16 opacity-20 top-4 right-4" strokeWidth={1} />;
        return <Box className="absolute text-slate-700 w-16 h-16 opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={1} />;
    };

    return (
        <section className="mb-8 card-base overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
            >
                <div className="flex flex-col items-start">
                    <h3 className="font-bold text-slate-800 text-lg">
                        House Plan
                    </h3>
                </div>

                <div className="flex items-center gap-4">
                    {/* Lock Toggle Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const newLocked = !isLocked;
                            setIsLocked(newLocked);
                            localStorage.setItem('floorplan_locked', String(newLocked));
                        }}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isLocked ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        title={isLocked ? "Unlock Layout" : "Lock Layout"}
                    >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>

                    {isOpen && (
                        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold mr-2">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Active</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Masked</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"></div> Offline</span>
                        </div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </button>

            {/* Collapsible Content */}
            <div 
                className={`transition-all duration-300 ease-in-out origin-top ${isOpen ? 'max-h-[2000px] opacity-100 p-4 border-t border-slate-100' : 'max-h-0 opacity-0 px-4 border-none'}`}
            >
                <div className="relative w-full min-h-[500px] bg-slate-800 rounded-2xl overflow-hidden shadow-inner-lg p-4 border-[10px] border-slate-700 flex flex-col">
                    {/* Subtle drafting paper grid */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                            backgroundSize: '15px 15px'
                        }}
                    />

                    {/* The House Structure (Dynamic Grid) */}
                    <div className="relative w-full flex-grow grid grid-cols-2 md:grid-cols-3 auto-rows-[minmax(150px,_1fr)] gap-4 bg-slate-600 rounded-lg">
                        {roomOrder.map((roomName, idx) => {
                            const isLarge = (roomSizes[roomName] || 1) === 2;

                            return (
                                <div
                                    key={roomName}
                                    draggable={!isLocked && draggableRoom === roomName}
                                    onDragStart={(e) => handleRoomDragStart(e, roomName)}
                                    onDragEnd={handleRoomDragEnd}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                    onDrop={(e) => handleRoomDrop(e, roomName)}
                                    className={`relative bg-slate-900 flex items-center justify-center overflow-hidden min-h-[100px] transition-transform duration-200 hover:ring-2 ring-slate-400 ${isLarge ? 'col-span-2' : 'col-span-1'} ${draggedRoom === roomName ? 'scale-95 opacity-50' : ''}`}
                                >
                                    {/* Drag Handle Icon - Room is ONLY draggable when hovering this icon */}
                                    {!isLocked && (
                                        <div 
                                            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-6 flex items-center justify-center cursor-move z-40"
                                            onMouseEnter={() => setDraggableRoom(roomName)}
                                            onMouseLeave={() => setDraggableRoom(null)}
                                            title="Drag room to rearrange layout"
                                        >
                                            <GripHorizontal className="w-4 h-4 text-slate-500 opacity-50 hover:opacity-100 hover:text-white" />
                                        </div>
                                    )}

                                    {/* Resize Toggle Button */}
                                    {!isLocked && (
                                        <button 
                                            onClick={(e) => toggleRoomSize(e, roomName)}
                                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded z-30 transition-colors"
                                            title={isLarge ? "Shrink Room" : "Expand Room"}
                                        >
                                            {isLarge ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                                        </button>
                                    )}

                                    {/* Generic doorway gap visualization to connect rooms */}
                                    <div className="absolute -bottom-3 right-8 w-12 h-3 bg-slate-900 z-0"></div>

                                    {getRoomIcon(roomName)}
                                    <span className="absolute top-2 left-3 text-slate-500 font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold z-10 break-words max-w-[80%] leading-tight pointer-events-none">
                                        {roomName}
                                    </span>

                                    {currentHome.devices
                                        .filter(d => (d.room || 'Unknown') === roomName)
                                        .map((d, i) => (
                                            <DraggableMarker
                                                key={d.id}
                                                device={d}
                                                defaultPos={POSITIONS[i % POSITIONS.length]}
                                                isLocked={isLocked}
                                            />
                                        ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
