declare module 'react-native-rss-parser' {
    export type RSSFeed = {
        title: string;
        description: string;
        link: string;
        items: RSSItem[];
    };

    export type RSSItem = {
        title: string;
        link: string;
        description: string;
        content: string;
        'content:encoded'?: string;
        pubDate?: string;
        [key: string]: any;
    };

    export function parse(xml: string): Promise<RSSFeed>;
}
