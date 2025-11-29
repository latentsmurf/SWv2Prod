// ============================================================================
// SHARED STYLE CONSTANTS
// Reusable Tailwind class combinations for consistency
// ============================================================================

// ============================================================================
// BACKGROUNDS
// ============================================================================

export const BG = {
    /** Primary background - page level */
    page: 'bg-gray-50 dark:bg-[#050505]',
    /** Secondary background - cards, panels */
    card: 'bg-white dark:bg-[#0a0a0a]',
    /** Tertiary background - nested elements */
    nested: 'bg-gray-100 dark:bg-[#121212]',
    /** Interactive background */
    interactive: 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10',
    /** Accent background */
    accent: 'bg-yellow-500',
    /** Muted accent */
    accentMuted: 'bg-yellow-500/10',
} as const;

// ============================================================================
// BORDERS
// ============================================================================

export const BORDER = {
    /** Default border */
    default: 'border-gray-200 dark:border-white/5',
    /** Subtle border */
    subtle: 'border-gray-100 dark:border-white/[0.02]',
    /** Strong border */
    strong: 'border-gray-300 dark:border-white/10',
    /** Interactive border */
    interactive: 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10',
    /** Focus border */
    focus: 'focus:border-yellow-500 dark:focus:border-yellow-500/50',
} as const;

// ============================================================================
// TEXT
// ============================================================================

export const TEXT = {
    /** Primary text */
    primary: 'text-gray-900 dark:text-white',
    /** Secondary text */
    secondary: 'text-gray-700 dark:text-gray-300',
    /** Muted text */
    muted: 'text-gray-500 dark:text-gray-400',
    /** Very muted text */
    faded: 'text-gray-400 dark:text-gray-600',
    /** Accent text */
    accent: 'text-yellow-600 dark:text-yellow-400',
    /** Interactive text */
    interactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOW = {
    /** Small shadow */
    sm: 'shadow-sm',
    /** Default shadow */
    default: 'shadow',
    /** Large shadow */
    lg: 'shadow-lg',
    /** Card shadow */
    card: 'shadow-sm dark:shadow-none',
} as const;

// ============================================================================
// LAYOUT COMBINATIONS
// ============================================================================

export const CARD = {
    /** Standard card */
    default: `${BG.card} ${BORDER.default} border rounded-xl ${SHADOW.card}`,
    /** Interactive card */
    interactive: `${BG.card} ${BORDER.interactive} border rounded-xl ${SHADOW.card} transition-colors cursor-pointer`,
    /** Highlighted card */
    highlight: `${BG.card} border border-yellow-500/20 rounded-xl`,
} as const;

export const INPUT = {
    /** Standard input */
    default: `
        w-full px-3 py-2 rounded-lg
        bg-gray-50 dark:bg-white/5
        border border-gray-200 dark:border-white/10
        text-gray-900 dark:text-white
        placeholder:text-gray-400 dark:placeholder:text-gray-600
        focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500
        transition-colors
    `.trim().replace(/\s+/g, ' '),
    /** Search input */
    search: `
        w-full pl-10 pr-4 py-2 rounded-xl
        bg-gray-50 dark:bg-white/5
        border border-gray-200 dark:border-white/10
        text-gray-900 dark:text-white
        placeholder:text-gray-400 dark:placeholder:text-gray-600
        focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500
        transition-colors
    `.trim().replace(/\s+/g, ' '),
} as const;

export const BUTTON = {
    /** Primary button */
    primary: `
        px-4 py-2 rounded-lg font-semibold
        bg-yellow-500 hover:bg-yellow-400
        text-black
        transition-colors
    `.trim().replace(/\s+/g, ' '),
    /** Secondary button */
    secondary: `
        px-4 py-2 rounded-lg font-medium
        bg-gray-100 dark:bg-white/10
        hover:bg-gray-200 dark:hover:bg-white/15
        text-gray-900 dark:text-white
        transition-colors
    `.trim().replace(/\s+/g, ' '),
    /** Ghost button */
    ghost: `
        px-4 py-2 rounded-lg font-medium
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-white
        hover:bg-gray-100 dark:hover:bg-white/5
        transition-colors
    `.trim().replace(/\s+/g, ' '),
    /** Icon button */
    icon: `
        p-2 rounded-lg
        text-gray-500 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-white
        hover:bg-gray-100 dark:hover:bg-white/5
        transition-colors
    `.trim().replace(/\s+/g, ' '),
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENT = {
    /** Yellow/Orange accent gradient */
    accent: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    /** Purple accent gradient */
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    /** Blue accent gradient */
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    /** Green accent gradient */
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    /** Subtle background gradient */
    subtle: 'bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5',
} as const;

// ============================================================================
// STATUS COLORS (for badges, indicators)
// ============================================================================

export const STATUS = {
    success: { bg: 'bg-green-500/20', text: 'text-green-500 dark:text-green-400' },
    error: { bg: 'bg-red-500/20', text: 'text-red-500 dark:text-red-400' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-500 dark:text-yellow-400' },
    info: { bg: 'bg-blue-500/20', text: 'text-blue-500 dark:text-blue-400' },
    neutral: { bg: 'bg-gray-500/20', text: 'text-gray-500 dark:text-gray-400' },
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const ANIMATION = {
    /** Fade in */
    fadeIn: 'animate-fadeIn',
    /** Slide up */
    slideUp: 'animate-slideUp',
    /** Spin */
    spin: 'animate-spin',
    /** Pulse */
    pulse: 'animate-pulse',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combine multiple class strings, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Create conditional class string
 */
export function conditionalClass(
    condition: boolean, 
    trueClass: string, 
    falseClass: string = ''
): string {
    return condition ? trueClass : falseClass;
}
