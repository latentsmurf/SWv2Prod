import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Courier font (standard for screenplays)
Font.register({
    family: 'Courier',
    src: 'https://fonts.gstatic.com/s/courierprime/v9/u-450q2lgwslOqpF_6gQ8kM.ttf'
});

Font.register({
    family: 'Courier-Bold',
    src: 'https://fonts.gstatic.com/s/courierprime/v9/u-4n0q2lgwslOqpF_6gQ8kM.ttf',
    fontWeight: 'bold'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        paddingTop: 72, // 1 inch
        paddingBottom: 72,
        paddingLeft: 108, // 1.5 inch
        paddingRight: 72, // 1 inch
        fontFamily: 'Courier',
        fontSize: 12,
    },
    sceneHeading: {
        fontFamily: 'Courier-Bold',
        textTransform: 'uppercase',
        marginTop: 24,
        marginBottom: 12,
    },
    action: {
        marginBottom: 12,
        lineHeight: 1.2,
    },
    character: {
        fontFamily: 'Courier',
        textTransform: 'uppercase',
        marginTop: 12,
        marginBottom: 0,
        marginLeft: 144, // ~2 inches
        marginRight: 72,
    },
    dialogue: {
        marginBottom: 12,
        marginLeft: 72, // ~1 inch
        marginRight: 108, // ~1.5 inch
    },
    parenthetical: {
        marginLeft: 108, // ~1.5 inch
        marginRight: 108,
        marginBottom: 0,
    },
});

interface ScriptPDFProps {
    content: any; // Tiptap JSON content
    titlePage?: {
        title: string;
        credit: string;
        author: string;
        source: string;
        contact: string;
    };
}

export const ScriptPDF = ({ content, titlePage }: ScriptPDFProps) => (
    <Document>
        {titlePage && (titlePage.title || titlePage.author) && (
            <Page size="A4" style={{ ...styles.page, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ marginBottom: 200, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Courier-Bold', fontSize: 24, textTransform: 'uppercase', marginBottom: 12 }}>{titlePage.title}</Text>
                    <Text style={{ fontFamily: 'Courier', fontSize: 12, marginBottom: 12 }}>{titlePage.credit}</Text>
                    <Text style={{ fontFamily: 'Courier', fontSize: 12 }}>{titlePage.author}</Text>
                    {titlePage.source && <Text style={{ fontFamily: 'Courier', fontSize: 12, marginTop: 12 }}>{titlePage.source}</Text>}
                </View>

                <View style={{ position: 'absolute', bottom: 72, right: 72, alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Courier', fontSize: 12 }}>{titlePage.contact}</Text>
                </View>
            </Page>
        )}
        <Page size="A4" style={styles.page}>
            <Text style={{ position: 'absolute', top: 36, right: 72, fontFamily: 'Courier', fontSize: 12 }} render={({ pageNumber }) => `${pageNumber}`} />
            {content?.content?.map((node: any, index: number) => {
                const text = node.content?.[0]?.text || "";

                if (node.type === 'sceneHeading') {
                    return <Text key={index} style={styles.sceneHeading}>{text}</Text>;
                }
                if (node.type === 'action') {
                    return <Text key={index} style={styles.action}>{text}</Text>;
                }
                if (node.type === 'character') {
                    return <Text key={index} style={styles.character}>{text}</Text>;
                }
                if (node.type === 'dialogue') {
                    return <Text key={index} style={styles.dialogue}>{text}</Text>;
                }
                if (node.type === 'parenthetical') {
                    return <Text key={index} style={styles.parenthetical}>{text}</Text>;
                }
                return <Text key={index} style={styles.action}>{text}</Text>;
            })}
        </Page>
    </Document>
);
