import AsyncStorage from '@react-native-async-storage/async-storage';

const FEEDS_KEY = '@feeds';
const SETTINGS_KEY = '@settings';

export type FeedSource = { title: string; url: string };
export type Settings = { showImages: boolean; defaultFilter: 'all' | 'unread' };

export async function getFeeds(): Promise<FeedSource[]> {
    const raw = await AsyncStorage.getItem(FEEDS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function saveFeeds(feeds: FeedSource[]) {
    await AsyncStorage.setItem(FEEDS_KEY, JSON.stringify(feeds));
}

export async function addFeed(feed: FeedSource) {
    const feeds = await getFeeds();
    const exists = feeds.some(f => f.url.trim() === feed.url.trim());
    if (!exists) {
        feeds.push(feed);
        await saveFeeds(feeds);
    }
}

export async function removeFeed(url: string) {
    const feeds = await getFeeds();
    const next = feeds.filter(f => f.url !== url);
    await saveFeeds(next);
}

export async function getSettings(): Promise<Settings> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { showImages: true, defaultFilter: 'all' };
}

export async function saveSettings(s: Settings) {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
