import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Appbar, Button, TextInput, List } from 'react-native-paper';
import { addFeed, getFeeds, removeFeed } from '../services/storage';

export default function AddFeedScreen() {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [feeds, setFeeds] = useState<{ title: string; url: string }[]>([]);

    const load = async () => setFeeds(await getFeeds());

    useEffect(() => {
        load();
    }, []);

    const onAdd = async () => {
        if (!url.trim()) {
            Alert.alert('Validation', 'Feed URL is required');
            return;
        }
        await addFeed({ title: title.trim() || url.trim(), url: url.trim() });
        setTitle('');
        setUrl('');
        await load();
    };

    const onRemove = async (u: string) => {
        await removeFeed(u);
        await load();
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.Content title="Add feed" />
            </Appbar.Header>

            <View style={{ padding: 16 }}>
                <TextInput label="Title (optional)" value={title} onChangeText={setTitle} style={{ marginBottom: 12 }} />
                <TextInput label="Feed URL" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" />
                <Button mode="contained" style={{ marginTop: 16 }} onPress={onAdd}>Add</Button>
            </View>

            <List.Section>
                <List.Subheader>Saved feeds</List.Subheader>
                {feeds.map((f, idx) => (
                    <List.Item
                        key={`${f.url}-${idx}`}
                        title={f.title}
                        description={f.url}
                        right={props => <Button onPress={() => onRemove(f.url)}>Remove</Button>}
                    />
                ))}
            </List.Section>
        </View>
    );
}
