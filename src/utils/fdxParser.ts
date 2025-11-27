import { XMLParser } from 'fast-xml-parser';

export const parseFDX = (xmlContent: string) => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(xmlContent);

    const content: any[] = [];

    // Basic FDX structure traversal
    // Final Draft XML usually has <FinalDraft> <Content> <Paragraph> ...

    const paragraphs = jsonObj?.FinalDraft?.Content?.Paragraph;

    if (Array.isArray(paragraphs)) {
        paragraphs.forEach((p: any) => {
            const type = p['@_Type'];
            const text = p?.Text || "";

            // Handle Text object which might be an array or object with formatting
            let cleanText = "";
            if (typeof text === 'string') {
                cleanText = text;
            } else if (Array.isArray(text)) {
                cleanText = text.map((t: any) => t['#text'] || t).join('');
            } else if (typeof text === 'object') {
                cleanText = text['#text'] || "";
            }

            if (!cleanText) return;

            if (type === 'Scene Heading') {
                content.push({
                    type: 'sceneHeading',
                    content: [{ type: 'text', text: cleanText }]
                });
            } else if (type === 'Action') {
                content.push({
                    type: 'action',
                    content: [{ type: 'text', text: cleanText }]
                });
            } else if (type === 'Character') {
                content.push({
                    type: 'character',
                    content: [{ type: 'text', text: cleanText }]
                });
            } else if (type === 'Dialogue') {
                content.push({
                    type: 'dialogue',
                    content: [{ type: 'text', text: cleanText }]
                });
            } else if (type === 'Parenthetical') {
                content.push({
                    type: 'parenthetical',
                    content: [{ type: 'text', text: cleanText }]
                });
            } else {
                // Default to Action for unknown types
                content.push({
                    type: 'action',
                    content: [{ type: 'text', text: cleanText }]
                });
            }
        });
    }

    return {
        type: 'doc',
        content: content
    };
};
