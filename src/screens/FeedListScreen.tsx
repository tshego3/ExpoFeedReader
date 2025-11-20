import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, RefreshControl } from 'react-native';
import { Appbar, Chip, List, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getFeeds } from '../services/storage';
import { fetchFeed } from '../services/rss';

type CombinedItem = {
    title: string;
    link: string;
    isoDate?: string;
    sourceTitle: string;
};

export default function FeedListScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<CombinedItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const sources = await getFeeds();
            const results = await Promise.all(
                sources.map(async s => {
                    const feed = await fetchFeed(s.url);
                    return (feed.items || []).map(it => ({
                        title: it.title || '',
                        link: it.link || '',
                        isoDate: it.isoDate,
                        sourceTitle: feed.title || s.title || s.url,
                    }));
                })
            );
            setItems(results.flat());
        } catch (e) {
            console.warn(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (filter === 'all') return items;
        const now = new Date();
        return items.filter(i => {
            if (!i.isoDate) return false;
            const d = new Date(i.isoDate);
            const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
            return filter === 'today' ? diffDays <= 1 : diffDays <= 7;
        });
    }, [items, filter]);

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.Action icon="menu" onPress={() => (navigation as any).openDrawer()} />
                <Appbar.Content title="RSS Reader" />
                <Appbar.Action icon="refresh" onPress={load} />
            </Appbar.Header>

            <View style={{ paddingHorizontal: 12, paddingTop: 8, flexDirection: 'row', gap: 8 }}>
                <Chip selected={filter === 'all'} onPress={() => setFilter('all')}>All</Chip>
                <Chip selected={filter === 'today'} onPress={() => setFilter('today')}>Today</Chip>
                <Chip selected={filter === 'week'} onPress={() => setFilter('week')}>This week</Chip>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <List.Section>
                    <List.Subheader>{filtered.length} items</List.Subheader>
                    {filtered.map((item, idx) => (
                        <List.Item
                            key={`${item.link}-${idx}`}
                            title={item.title}
                            description={item.sourceTitle}
                            onPress={() => (navigation as any).navigate('FeedDetail', { item })}
                            right={() => (
                                <IconButton icon="open-in-new" onPress={() => (navigation as any).navigate('FeedDetail', { item })} />
                            )}
                        />
                    ))}
                </List.Section>
            )}
        </View>
    );
}
