import { XMLBuilder } from 'fast-xml-parser';

export const exportFDX = (jsonContent: any, titlePageData?: any) => {
    const content = jsonContent.content || [];

    const paragraphs: any[] = [];

    content.forEach((node: any) => {
        const text = node.content?.[0]?.text || "";
        let type = "Action";

        switch (node.type) {
            case 'sceneHeading': type = 'Scene Heading'; break;
            case 'action': type = 'Action'; break;
            case 'character': type = 'Character'; break;
            case 'dialogue': type = 'Dialogue'; break;
            case 'parenthetical': type = 'Parenthetical'; break;
            default: type = 'Action';
        }

        paragraphs.push({
            '@_Type': type,
            'Text': text
        });
    });

    // Build Title Page if data exists
    const titlePage = titlePageData ? [
        {
            '@_Type': 'General',
            'Content': [
                { 'Paragraph': { '@_Type': 'Title', 'Text': titlePageData.title || '' } },
                { 'Paragraph': { '@_Type': 'Credit', 'Text': titlePageData.credit || '' } },
                { 'Paragraph': { '@_Type': 'Author', 'Text': titlePageData.author || '' } },
                { 'Paragraph': { '@_Type': 'Source', 'Text': titlePageData.source || '' } },
                { 'Paragraph': { '@_Type': 'Contact', 'Text': titlePageData.contact || '' } }
            ]
        }
    ] : [];

    const fdxObj = {
        'FinalDraft': {
            '@_DocumentType': 'Script',
            '@_Template': 'No',
            '@_Version': '1',
            'Content': {
                'Paragraph': paragraphs
            },
            'TitlePage': titlePage
        }
    };

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        format: true
    });

    const xmlContent = builder.build(fdxObj);
    return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n${xmlContent}`;
};
