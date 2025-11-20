import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, List, Switch } from 'react-native-paper';
import { getSettings, saveSettings, Settings } from '../services/storage';

export default function SettingsScreen() {
    const [settings, setSettings] = useState<Settings>({ showImages: true, defaultFilter: 'all' });

    useEffect(() => {
        (async () => setSettings(await getSettings()))();
    }, []);

    const toggleImages = async () => {
        const next = { ...settings, showImages: !settings.showImages };
        setSettings(next);
        await saveSettings(next);
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.Content title="Settings" />
            </Appbar.Header>

            <List.Section>
                <List.Item
                    title="Show images in content"
                    right={() => <Switch value={settings.showImages} onValueChange={toggleImages} />}
                />
            </List.Section>
        </View>
    );
}
