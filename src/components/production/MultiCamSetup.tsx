'use client';

import React, { useState, useEffect } from 'react';
import { Video, Plus, Trash2, X, Camera, Settings, Eye, Grid, Link2 } from 'lucide-react';

interface CameraUnit {
    id: string;
    name: string;
    letter: string;
    camera_body?: string;
    lens?: string;
    operator?: string;
    assistant?: string;
    position?: string;
    angle?: string;
    is_primary: boolean;
    sync_timecode: boolean;
    recording_format?: string;
    notes?: string;
}

interface MultiCamSetup {
    id: string;
    name: string;
    scene_id?: string;
    cameras: CameraUnit[];
    sync_method: 'timecode' | 'clap' | 'genlock' | 'manual';
    master_camera?: string;
    created_at: string;
}

interface MultiCamSetupProps {
    projectId: string;
    sceneId?: string;
}

const CAMERA_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function MultiCamSetup({ projectId, sceneId }: MultiCamSetupProps) {
    const [setups, setSetups] = useState<MultiCamSetup[]>([]);
    const [activeSetup, setActiveSetup] = useState<MultiCamSetup | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);

    const [setupForm, setSetupForm] = useState({
        name: '',
        sync_method: 'timecode' as MultiCamSetup['sync_method']
    });

    const [cameraForm, setCameraForm] = useState({
        name: '',
        camera_body: '',
        lens: '',
        operator: '',
        position: '',
        notes: ''
    });

    useEffect(() => {
        // Mock data
        setSetups([
            {
                id: '1',
                name: 'Main Coverage',
                cameras: [
                    { id: 'a', name: 'A Cam - Wide', letter: 'A', camera_body: 'ARRI ALEXA Mini', lens: 'Cooke 25mm', operator: 'John Smith', is_primary: true, sync_timecode: true },
                    { id: 'b', name: 'B Cam - Close', letter: 'B', camera_body: 'RED Komodo', lens: 'Zeiss 85mm', operator: 'Jane Doe', is_primary: false, sync_timecode: true }
                ],
                sync_method: 'timecode',
                master_camera: 'a',
                created_at: new Date().toISOString()
            }
        ]);
    }, []);

    const createSetup = () => {
        const newSetup: MultiCamSetup = {
            id: crypto.randomUUID(),
            name: setupForm.name,
            scene_id: sceneId,
            cameras: [],
            sync_method: setupForm.sync_method,
            created_at: new Date().toISOString()
        };
        setSetups(prev => [...prev, newSetup]);
        setActiveSetup(newSetup);
        setShowAddModal(false);
    };

    const addCamera = () => {
        if (!activeSetup) return;
        const nextLetter = CAMERA_LETTERS[activeSetup.cameras.length] || 'X';
        const newCamera: CameraUnit = {
            id: crypto.randomUUID(),
            name: cameraForm.name || `${nextLetter} Camera`,
            letter: nextLetter,
            camera_body: cameraForm.camera_body,
            lens: cameraForm.lens,
            operator: cameraForm.operator,
            position: cameraForm.position,
            notes: cameraForm.notes,
            is_primary: activeSetup.cameras.length === 0,
            sync_timecode: true
        };

        const updatedSetup = { ...activeSetup, cameras: [...activeSetup.cameras, newCamera] };
        setActiveSetup(updatedSetup);
        setSetups(prev => prev.map(s => s.id === activeSetup.id ? updatedSetup : s));
        setShowCameraModal(false);
        setCameraForm({ name: '', camera_body: '', lens: '', operator: '', position: '', notes: '' });
    };

    const removeCamera = (cameraId: string) => {
        if (!activeSetup) return;
        const updatedSetup = { ...activeSetup, cameras: activeSetup.cameras.filter(c => c.id !== cameraId) };
        setActiveSetup(updatedSetup);
        setSetups(prev => prev.map(s => s.id === activeSetup.id ? updatedSetup : s));
    };

    const setPrimaryCamera = (cameraId: string) => {
        if (!activeSetup) return;
        const updatedSetup = {
            ...activeSetup,
            master_camera: cameraId,
            cameras: activeSetup.cameras.map(c => ({ ...c, is_primary: c.id === cameraId }))
        };
        setActiveSetup(updatedSetup);
        setSetups(prev => prev.map(s => s.id === activeSetup.id ? updatedSetup : s));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Grid className="text-yellow-500" />
                        Multi-Cam Setup
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure multi-camera shoots</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
                    <Plus size={18} />
                    New Setup
                </button>
            </div>

            {/* Setups List */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {setups.map(setup => (
                    <button
                        key={setup.id}
                        onClick={() => setActiveSetup(setup)}
                        className={`px-4 py-2 rounded-xl whitespace-nowrap ${
                            activeSetup?.id === setup.id
                                ? 'bg-yellow-500 text-black'
                                : 'bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {setup.name} ({setup.cameras.length} cam)
                    </button>
                ))}
            </div>

            {activeSetup ? (
                <div className="space-y-6">
                    {/* Setup Info */}
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-white font-bold text-lg">{activeSetup.name}</h3>
                                <p className="text-sm text-gray-500">
                                    Sync: {activeSetup.sync_method.charAt(0).toUpperCase() + activeSetup.sync_method.slice(1)}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCameraModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                <Plus size={16} />
                                Add Camera
                            </button>
                        </div>

                        {/* Camera Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {activeSetup.cameras.map(camera => (
                                <div
                                    key={camera.id}
                                    className={`bg-white/5 border rounded-xl p-4 ${
                                        camera.is_primary ? 'border-yellow-500/50' : 'border-white/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 bg-yellow-500/10 text-yellow-400 rounded-lg flex items-center justify-center font-bold">
                                                {camera.letter}
                                            </span>
                                            <div>
                                                <p className="text-white font-medium">{camera.name}</p>
                                                {camera.is_primary && (
                                                    <span className="text-xs text-yellow-400">Primary</span>
                                                )}
                                            </div>
                                        </div>
                                        {camera.sync_timecode && (
                                            <Link2 size={14} className="text-green-400" />
                                        )}
                                    </div>

                                    <div className="space-y-1 text-sm">
                                        {camera.camera_body && (
                                            <p className="text-gray-400 flex items-center gap-1">
                                                <Camera size={12} /> {camera.camera_body}
                                            </p>
                                        )}
                                        {camera.lens && (
                                            <p className="text-gray-500">{camera.lens}</p>
                                        )}
                                        {camera.operator && (
                                            <p className="text-gray-500">{camera.operator}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                        {!camera.is_primary && (
                                            <button
                                                onClick={() => setPrimaryCamera(camera.id)}
                                                className="text-xs text-gray-500 hover:text-yellow-400"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeCamera(camera.id)}
                                            className="p-1 text-gray-500 hover:text-red-400 ml-auto"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {activeSetup.cameras.length === 0 && (
                                <div className="col-span-4 text-center text-gray-500 py-8">
                                    No cameras added yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sync Diagram */}
                    {activeSetup.cameras.length > 1 && (
                        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                            <h4 className="text-white font-medium mb-3">Sync Configuration</h4>
                            <div className="flex items-center justify-center gap-8">
                                {activeSetup.cameras.map((cam, i) => (
                                    <React.Fragment key={cam.id}>
                                        <div className={`text-center ${cam.is_primary ? 'scale-110' : ''}`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                                                cam.is_primary ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'
                                            }`}>
                                                {cam.letter}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{cam.is_primary ? 'Master' : 'Slave'}</p>
                                        </div>
                                        {i < activeSetup.cameras.length - 1 && (
                                            <div className="flex items-center text-gray-600">
                                                <div className="w-8 h-px bg-gray-600" />
                                                <Link2 size={16} />
                                                <div className="w-8 h-px bg-gray-600" />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                    Select or create a multi-cam setup
                </div>
            )}

            {/* Add Setup Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Multi-Cam Setup</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={setupForm.name} onChange={(e) => setSetupForm({...setupForm, name: e.target.value})} placeholder="Setup name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white" />
                            <select value={setupForm.sync_method} onChange={(e) => setSetupForm({...setupForm, sync_method: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white">
                                <option value="timecode">Timecode Sync</option>
                                <option value="genlock">Genlock</option>
                                <option value="clap">Clap/Slate</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                            <button onClick={createSetup} disabled={!setupForm.name} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Camera Modal */}
            {showCameraModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Camera</h3>
                            <button onClick={() => setShowCameraModal(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={cameraForm.name} onChange={(e) => setCameraForm({...cameraForm, name: e.target.value})} placeholder="Camera name (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white" />
                            <input type="text" value={cameraForm.camera_body} onChange={(e) => setCameraForm({...cameraForm, camera_body: e.target.value})} placeholder="Camera body" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white" />
                            <input type="text" value={cameraForm.lens} onChange={(e) => setCameraForm({...cameraForm, lens: e.target.value})} placeholder="Lens" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white" />
                            <input type="text" value={cameraForm.operator} onChange={(e) => setCameraForm({...cameraForm, operator: e.target.value})} placeholder="Operator" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white" />
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowCameraModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                            <button onClick={addCamera} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">Add Camera</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
