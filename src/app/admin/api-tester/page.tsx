'use client';

import React, { useState } from 'react';
import {
    Play, Loader2, CheckCircle, XCircle, Clock, Copy, ChevronDown,
    ChevronRight, Save, Trash2, Plus, RefreshCw, Download, History,
    Zap, Globe, Database, Bot, CreditCard
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface APIEndpoint {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    category: string;
    description: string;
    sampleBody?: string;
    headers?: Record<string, string>;
}

interface TestResult {
    endpoint_id: string;
    status: 'success' | 'error' | 'pending';
    statusCode?: number;
    responseTime?: number;
    response?: any;
    error?: string;
    timestamp: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const API_ENDPOINTS: APIEndpoint[] = [
    // Projects
    { id: 'projects-list', name: 'List Projects', method: 'GET', path: '/api/projects', category: 'Projects', description: 'Get all projects' },
    { id: 'projects-get', name: 'Get Project', method: 'GET', path: '/api/projects/{id}', category: 'Projects', description: 'Get single project by ID' },
    { id: 'projects-create', name: 'Create Project', method: 'POST', path: '/api/projects', category: 'Projects', description: 'Create new project', sampleBody: '{"name": "Test Project", "genre": "drama"}' },
    
    // Users
    { id: 'users-list', name: 'List Users', method: 'GET', path: '/api/users', category: 'Users', description: 'Get all users (admin)' },
    { id: 'users-me', name: 'Get Current User', method: 'GET', path: '/api/users/me', category: 'Users', description: 'Get current authenticated user' },
    
    // AI Services
    { id: 'ai-generate', name: 'Generate Shot', method: 'POST', path: '/api/generate/shot', category: 'AI', description: 'Generate AI shot', sampleBody: '{"prompt": "cinematic shot", "aspect_ratio": "16:9"}' },
    { id: 'ai-captions', name: 'Generate Captions', method: 'POST', path: '/api/ai/captions', category: 'AI', description: 'Generate AI captions' },
    { id: 'ai-script', name: 'AI Script Assist', method: 'POST', path: '/api/ai/script-assist', category: 'AI', description: 'Get AI script suggestions' },
    { id: 'ai-translate', name: 'Translate', method: 'POST', path: '/api/ai/translate', category: 'AI', description: 'Translate text', sampleBody: '{"text": "Hello world", "target_language": "Spanish"}' },
    
    // Style Presets
    { id: 'presets-list', name: 'List Presets', method: 'GET', path: '/api/style_presets', category: 'Content', description: 'Get style presets' },
    { id: 'presets-category', name: 'Presets by Category', method: 'GET', path: '/api/style_presets?category=directors', category: 'Content', description: 'Filter presets by category' },
    
    // System
    { id: 'health', name: 'Health Check', method: 'GET', path: '/api/health', category: 'System', description: 'System health status' },
];

const CATEGORIES = ['All', 'Projects', 'Users', 'AI', 'Content', 'System'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function APITesterPage() {
    const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [customPath, setCustomPath] = useState('');
    const [customMethod, setCustomMethod] = useState<APIEndpoint['method']>('GET');
    const [requestBody, setRequestBody] = useState('');
    const [requestHeaders, setRequestHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

    const filteredEndpoints = activeCategory === 'All' 
        ? API_ENDPOINTS 
        : API_ENDPOINTS.filter(e => e.category === activeCategory);

    const runTest = async (endpoint: APIEndpoint | null, path?: string, method?: string, body?: string) => {
        const testPath = path || endpoint?.path || customPath;
        const testMethod = method || endpoint?.method || customMethod;
        const testBody = body || requestBody;
        const endpointId = endpoint?.id || 'custom';

        if (!testPath) return;

        setLoading(endpointId);
        const startTime = Date.now();

        try {
            const headers: Record<string, string> = JSON.parse(requestHeaders);
            
            const options: RequestInit = {
                method: testMethod,
                headers,
            };

            if (['POST', 'PUT', 'PATCH'].includes(testMethod) && testBody) {
                options.body = testBody;
            }

            const response = await fetch(testPath, options);
            const responseTime = Date.now() - startTime;
            
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            const result: TestResult = {
                endpoint_id: endpointId,
                status: response.ok ? 'success' : 'error',
                statusCode: response.status,
                responseTime,
                response: responseData,
                timestamp: new Date()
            };

            setResults(prev => [result, ...prev.slice(0, 49)]);
            setExpandedResults(prev => new Set([...prev, endpointId]));
        } catch (error: any) {
            const result: TestResult = {
                endpoint_id: endpointId,
                status: 'error',
                responseTime: Date.now() - startTime,
                error: error.message,
                timestamp: new Date()
            };
            setResults(prev => [result, ...prev.slice(0, 49)]);
        } finally {
            setLoading(null);
        }
    };

    const runAllTests = async () => {
        for (const endpoint of filteredEndpoints) {
            await runTest(endpoint);
            await new Promise(r => setTimeout(r, 500)); // Delay between tests
        }
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'text-gray-500';
        if (status === 'success') return 'text-green-400';
        return 'text-red-400';
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-green-400 bg-green-500/10';
            case 'POST': return 'text-blue-400 bg-blue-500/10';
            case 'PUT': return 'text-yellow-400 bg-yellow-500/10';
            case 'PATCH': return 'text-purple-400 bg-purple-500/10';
            case 'DELETE': return 'text-red-400 bg-red-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    const latestResult = (endpointId: string) => results.find(r => r.endpoint_id === endpointId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">API Tester</h1>
                    <p className="text-sm text-gray-500">Test and debug API endpoints</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={runAllTests}
                        disabled={loading !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                        <Zap size={16} />
                        Test All ({filteredEndpoints.length})
                    </button>
                    <button
                        onClick={() => setResults([])}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white"
                    >
                        <Trash2 size={16} />
                        Clear Results
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Endpoints List */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    activeCategory === cat
                                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Endpoints */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-3 border-b border-white/5">
                            <h3 className="text-sm font-medium text-white">Endpoints</h3>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {filteredEndpoints.map((endpoint) => {
                                const result = latestResult(endpoint.id);
                                return (
                                    <div
                                        key={endpoint.id}
                                        onClick={() => {
                                            setSelectedEndpoint(endpoint);
                                            setCustomPath(endpoint.path);
                                            setCustomMethod(endpoint.method);
                                            setRequestBody(endpoint.sampleBody || '');
                                        }}
                                        className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors ${
                                            selectedEndpoint?.id === endpoint.id ? 'bg-white/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodColor(endpoint.method)}`}>
                                                    {endpoint.method}
                                                </span>
                                                <span className="text-sm font-medium text-white">{endpoint.name}</span>
                                            </div>
                                            {result && (
                                                result.status === 'success' 
                                                    ? <CheckCircle size={14} className="text-green-400" />
                                                    : <XCircle size={14} className="text-red-400" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono truncate">{endpoint.path}</div>
                                        {result?.responseTime && (
                                            <div className="text-[10px] text-gray-600 mt-1">{result.responseTime}ms</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Request/Response */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Request Builder */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white">Request</h3>
                            <button
                                onClick={() => runTest(selectedEndpoint, customPath, customMethod, requestBody)}
                                disabled={loading !== null || !customPath}
                                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-xs disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                Send Request
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* URL */}
                            <div className="flex gap-2">
                                <select
                                    value={customMethod}
                                    onChange={(e) => setCustomMethod(e.target.value as any)}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="PATCH">PATCH</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                                <input
                                    type="text"
                                    value={customPath}
                                    onChange={(e) => setCustomPath(e.target.value)}
                                    placeholder="/api/..."
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono placeholder-gray-500"
                                />
                            </div>

                            {/* Headers */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Headers (JSON)</label>
                                <textarea
                                    value={requestHeaders}
                                    onChange={(e) => setRequestHeaders(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono resize-none"
                                />
                            </div>

                            {/* Body */}
                            {['POST', 'PUT', 'PATCH'].includes(customMethod) && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Body (JSON)</label>
                                    <textarea
                                        value={requestBody}
                                        onChange={(e) => setRequestBody(e.target.value)}
                                        rows={6}
                                        placeholder='{"key": "value"}'
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono resize-none placeholder-gray-600"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white">Results ({results.length})</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <History size={12} />
                                History
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {results.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Globe size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No results yet</p>
                                    <p className="text-xs">Select an endpoint and click "Send Request"</p>
                                </div>
                            ) : (
                                results.map((result, i) => (
                                    <div key={i} className="border-b border-white/5">
                                        <div
                                            onClick={() => {
                                                const newExpanded = new Set(expandedResults);
                                                if (newExpanded.has(`${result.endpoint_id}-${i}`)) {
                                                    newExpanded.delete(`${result.endpoint_id}-${i}`);
                                                } else {
                                                    newExpanded.add(`${result.endpoint_id}-${i}`);
                                                }
                                                setExpandedResults(newExpanded);
                                            }}
                                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedResults.has(`${result.endpoint_id}-${i}`) 
                                                    ? <ChevronDown size={14} className="text-gray-500" />
                                                    : <ChevronRight size={14} className="text-gray-500" />
                                                }
                                                {result.status === 'success' 
                                                    ? <CheckCircle size={14} className="text-green-400" />
                                                    : <XCircle size={14} className="text-red-400" />
                                                }
                                                <span className="text-sm text-white">{result.endpoint_id}</span>
                                                {result.statusCode && (
                                                    <span className={`text-xs ${result.statusCode < 400 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {result.statusCode}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                {result.responseTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {result.responseTime}ms
                                                    </span>
                                                )}
                                                <span>{result.timestamp.toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                        {expandedResults.has(`${result.endpoint_id}-${i}`) && (
                                            <div className="px-4 pb-4">
                                                <div className="relative">
                                                    <pre className="p-3 bg-black rounded-lg text-xs text-gray-300 font-mono overflow-x-auto max-h-[200px]">
                                                        {result.error || JSON.stringify(result.response, null, 2)}
                                                    </pre>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(
                                                            result.error || JSON.stringify(result.response, null, 2)
                                                        )}
                                                        className="absolute top-2 right-2 p-1 bg-white/10 rounded text-gray-500 hover:text-white"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
