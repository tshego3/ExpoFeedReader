import React, { useEffect, useState } from 'react';
import { View, Share, Alert, Linking } from 'react-native';
import { Appbar } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FeedStackParamList } from '../navigation/FeedStackNavigator';
import { WebView } from 'react-native-webview';

type DetailRoute = RouteProp<FeedStackParamList, 'FeedDetail'>;

export default function FeedDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<DetailRoute>();
    const { item } = route.params;
    const [html, setHtml] = useState<string>('');

    useEffect(() => {
        // Minimal HTML shell; content is remote when opening link
        setHtml(`
            <!DOCTYPE html>
            <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
            <body style="font-family: -apple-system, Roboto, Arial; padding: 16px;">
                <h2>${escapeHtml(item.title)}</h2>
                <p><a href="${item.link}">${item.link}</a></p>
                <div>${item.content}</div>
            </body>
            </html>
        `);
    }, [item]);

    const shareItem = async () => {
        try {
            await Share.share({ title: item.title, message: `${item.title}\n${item.link}`, url: item.link });
        } catch (e) {
            Alert.alert('Share failed', (e as Error).message);
        }
    };

    const openExternal = () => {
        if (item.link) Linking.openURL(item.link);
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Article" />
                <Appbar.Action icon="share-variant" onPress={shareItem} />
                <Appbar.Action icon="open-in-new" onPress={openExternal} />
            </Appbar.Header>
            <WebView originWhitelist={['*']} source={{ html }} />
        </View>
    );
}

function escapeHtml(s: string) {
    return s
        ?.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;') || '';
}
