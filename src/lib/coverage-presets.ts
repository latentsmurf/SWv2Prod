import { CoveragePreset, CoveragePresetType, ShotType } from '@/types';

export const COVERAGE_PRESETS: Record<CoveragePresetType, CoveragePreset> = {
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Quick coverage with essential shots only. Best for simple dialogue scenes or rapid prototyping.',
        shotCount: { min: 3, max: 5 },
        shotTypes: ['wide', 'medium', 'close_up'],
        icon: '⚡'
    },
    standard: {
        id: 'standard',
        name: 'Standard',
        description: 'Classic film coverage with master, mediums, and close-ups. Good balance of efficiency and options.',
        shotCount: { min: 5, max: 8 },
        shotTypes: ['establishing', 'master', 'medium', 'close_up', 'over_the_shoulder', 'two_shot'],
        icon: '🎬'
    },
    heavy: {
        id: 'heavy',
        name: 'Heavy',
        description: 'Comprehensive coverage with multiple angles, inserts, and cutaways. For important scenes.',
        shotCount: { min: 8, max: 15 },
        shotTypes: ['establishing', 'master', 'medium', 'medium_close_up', 'close_up', 'extreme_close_up', 'over_the_shoulder', 'two_shot', 'insert', 'cutaway'],
        icon: '🎥'
    },
    commercial: {
        id: 'commercial',
        name: 'Commercial',
        description: 'Fast-paced coverage optimized for ads and branded content. Many inserts and product shots.',
        shotCount: { min: 10, max: 20 },
        shotTypes: ['wide', 'medium', 'close_up', 'extreme_close_up', 'insert', 'cutaway', 'tracking', 'dolly'],
        icon: '📺'
    },
    documentary: {
        id: 'documentary',
        name: 'Documentary',
        description: 'Observational style with handheld feel and natural framing. Interviews and B-roll focused.',
        shotCount: { min: 6, max: 12 },
        shotTypes: ['wide', 'medium', 'close_up', 'handheld', 'tracking', 'cutaway'],
        icon: '📹'
    }
};

export const SHOT_TYPE_LABELS: Record<ShotType, { label: string; abbrev: string; description: string }> = {
    wide: { label: 'Wide Shot', abbrev: 'WS', description: 'Shows the entire scene and environment' },
    establishing: { label: 'Establishing Shot', abbrev: 'EST', description: 'Sets up the location and context' },
    master: { label: 'Master Shot', abbrev: 'MS', description: 'Covers the entire action in one take' },
    medium: { label: 'Medium Shot', abbrev: 'MED', description: 'Frames subject from waist up' },
    medium_close_up: { label: 'Medium Close-Up', abbrev: 'MCU', description: 'Frames subject from chest up' },
    close_up: { label: 'Close-Up', abbrev: 'CU', description: 'Focuses on face or specific detail' },
    extreme_close_up: { label: 'Extreme Close-Up', abbrev: 'ECU', description: 'Very tight framing on eyes or detail' },
    over_the_shoulder: { label: 'Over-the-Shoulder', abbrev: 'OTS', description: 'Shot from behind one character looking at another' },
    two_shot: { label: 'Two Shot', abbrev: '2S', description: 'Frames two characters in the same shot' },
    insert: { label: 'Insert', abbrev: 'INS', description: 'Close-up of an object or detail' },
    cutaway: { label: 'Cutaway', abbrev: 'CUT', description: 'Shot of something outside the main action' },
    pov: { label: 'Point of View', abbrev: 'POV', description: 'Shows what a character sees' },
    drone: { label: 'Drone/Aerial', abbrev: 'DRN', description: 'High angle aerial perspective' },
    tracking: { label: 'Tracking Shot', abbrev: 'TRK', description: 'Camera moves alongside subject' },
    dolly: { label: 'Dolly Shot', abbrev: 'DLY', description: 'Camera moves toward or away from subject' },
    handheld: { label: 'Handheld', abbrev: 'HH', description: 'Natural, documentary-style movement' }
};

export const STYLE_MODES = {
    storyboard: {
        id: 'storyboard',
        name: 'Storyboard',
        description: 'Line art or grayscale storyboard look. Focus on framing and storytelling.',
        promptModifier: 'storyboard style, line art, grayscale, pencil sketch, clean lines, cinematic framing'
    },
    cinematic: {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Photorealistic or stylized cinematic look with full color and lighting.',
        promptModifier: 'cinematic, photorealistic, dramatic lighting, film grain, movie still, 35mm film'
    }
};

export function getCoveragePreset(type: CoveragePresetType): CoveragePreset {
    return COVERAGE_PRESETS[type] || COVERAGE_PRESETS.standard;
}

export function getShotTypeLabel(type: ShotType): string {
    return SHOT_TYPE_LABELS[type]?.label || type;
}

export function getShotTypeAbbrev(type: ShotType): string {
    return SHOT_TYPE_LABELS[type]?.abbrev || type.toUpperCase().slice(0, 3);
}
