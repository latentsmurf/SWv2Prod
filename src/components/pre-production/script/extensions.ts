import { Node, mergeAttributes } from '@tiptap/core';

export const SceneHeading = Node.create({
    name: 'sceneHeading',
    group: 'block',
    content: 'text*',

    parseHTML() {
        return [
            { tag: 'h1.scene-heading' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['h1', mergeAttributes(HTMLAttributes, { class: 'scene-heading uppercase font-bold text-lg mb-4 mt-8 tracking-wider' }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                return this.editor.commands.insertContent({ type: 'action', content: [] });
            },
            'Tab': () => {
                return this.editor.commands.setNode('action');
            },
        };
    },
});

export const Action = Node.create({
    name: 'action',
    group: 'block',
    content: 'text*',

    parseHTML() {
        return [
            { tag: 'p.action' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['p', mergeAttributes(HTMLAttributes, { class: 'action mb-4 text-base leading-relaxed' }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                // Default behavior is new paragraph (action)
                return false;
            },
            'Tab': () => {
                return this.editor.commands.setNode('character');
            },
            'Shift-Tab': () => {
                return this.editor.commands.setNode('sceneHeading');
            }
        };
    },
});

export const Character = Node.create({
    name: 'character',
    group: 'block',
    content: 'text*',

    parseHTML() {
        return [
            { tag: 'div.character' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'character uppercase font-bold text-center mt-6 mb-0 tracking-wide w-2/3 mx-auto' }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                return this.editor.commands.insertContent({ type: 'dialogue', content: [] });
            },
            'Tab': () => {
                return this.editor.commands.insertContent({ type: 'parenthetical', content: [] });
            },
            'Shift-Tab': () => {
                return this.editor.commands.setNode('action');
            }
        };
    },
});

export const Dialogue = Node.create({
    name: 'dialogue',
    group: 'block',
    content: 'text*',

    parseHTML() {
        return [
            { tag: 'div.dialogue' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'dialogue text-center mb-4 w-1/2 mx-auto leading-relaxed' }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                return this.editor.commands.insertContent({ type: 'character', content: [] });
            },
            'Shift-Enter': () => {
                return this.editor.commands.insertContent({ type: 'parenthetical', content: [] });
            },
            'Mod-Enter': () => {
                return this.editor.commands.insertContent({ type: 'action', content: [] });
            },
            'Tab': () => {
                return this.editor.commands.insertContent({ type: 'parenthetical', content: [] });
            },
            'Shift-Tab': () => {
                return this.editor.commands.setNode('character');
            }
        };
    },
});

export const Parenthetical = Node.create({
    name: 'parenthetical',
    group: 'block',
    content: 'text*',

    parseHTML() {
        return [
            { tag: 'div.parenthetical' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'parenthetical text-center italic text-sm mb-1 w-1/3 mx-auto' }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                return this.editor.commands.insertContent({ type: 'dialogue', content: [] });
            },
            'Tab': () => {
                return this.editor.commands.setNode('dialogue');
            },
            'Shift-Tab': () => {
                return this.editor.commands.setNode('character');
            }
        };
    },
});
