# Expo React Native RSS Reader App

* [React Cheatsheet](https://gist.github.com/tshego3/159bd9cebe9dcb0ae2e48393e0f5fe74)
* [React Documentation](https://react.dev/learn)
  * [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
  * [Async Storage Documentation](https://react-native-async-storage.github.io/2.0/)
* [React Native Documentation](https://reactnative.dev/docs/getting-started)
  * [React Native Directory](https://reactnative.directory) 
* [Expo Documentation](https://docs.expo.dev)

## Project setup and dependencies

- **Expo:** Managed workflow
- **Storage:** `@react-native-async-storage/async-storage`
- **Navigation:** `@react-navigation/native`, `@react-navigation/drawer`, `@react-navigation/stack`
- **Parsing:** `react-native-rss-parser`
- **WebView:** `react-native-webview`
- **UI helpers:** `react-native-paper` (optional but used below)
- **Sharing/Linking:** Built-in `Share` and `Linking`

```bash
npx create-expo-app@latest ExpoFeedReader --template blank-typescript
cd ExpoFeedReader

# Navigation
npm i @react-navigation/native @react-navigation/drawer @react-navigation/stack
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-masked-view/masked-view

# Storage, parsing, UI, react-dom, react-native-web, react-native-webview
npm i @react-native-async-storage/async-storage react-native-paper
npx expo install react-dom react-native-web react-native-webview 

# If you prefer, you can switch to a package like react-native-rss-parser, which is designed to work in RN without Node modules
npm install react-native-rss-parser

# (Optional) Icons
npx expo install @expo/vector-icons

# Start
npx expo start
```

> The drawer and tab concepts are inspired by the Flutter repo’s “Updated drawer logic” and “Tab view bug fix” commits, while storage and link sharing reflect “Added shared preferences, url launcher and updated UI,” and “Added HTML rendering and link share”.

## App structure

```
rss-reader/
  app.json
  babel.config.js
  package.json
  App.tsx
  src/
    navigation/
      DrawerNavigator.tsx
      FeedStackNavigator.tsx
    screens/
      FeedListScreen.tsx
      FeedDetailScreen.tsx
      AddFeedScreen.tsx
      SettingsScreen.tsx
    components/
      FeedItem.tsx
      EmptyState.tsx
    services/
      storage.ts
      rss.ts
    types/
      react-native-rss-parser.d.ts
    theme.ts
```

## Core files

### App.tsx

```tsx
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import theme from './src/theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
```

### src/theme.ts

```ts
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export default {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3f51b5',
    secondary: '#ff4081',
  },
};
```

### src/navigation/DrawerNavigator.tsx

```tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FeedStackNavigator from './FeedStackNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import AddFeedScreen from '../screens/AddFeedScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Feeds">
      <Drawer.Screen name="Feeds" component={FeedStackNavigator} />
      <Drawer.Screen name="Add feed" component={AddFeedScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
```

### src/navigation/FeedStackNavigator.tsx

```tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeedListScreen from '../screens/FeedListScreen';
import FeedDetailScreen from '../screens/FeedDetailScreen';

export type FeedStackParamList = {
  FeedList: undefined;
  FeedDetail: { item: any };
};

const Stack = createStackNavigator<FeedStackParamList>();

export default function FeedStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FeedList" component={FeedListScreen} options={{ title: 'RSS Reader' }} />
      <Stack.Screen name="FeedDetail" component={FeedDetailScreen} options={{ title: 'Article' }} />
    </Stack.Navigator>
  );
}
```

## Services

### src/services/storage.ts

```ts
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
```

### src/types/react-native-rss-parser.d.ts

```ts
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
```

### src/services/rss.ts

```ts
import * as rssParser from 'react-native-rss-parser';

export async function fetchFeed(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  const feed = await rssParser.parse(text);
  return feed;
}

export function getItemHtml(item: rssParser.RSSItem) {
    return item['content:encoded'] || item.content || '';
}
```

## Screens and components

### src/screens/FeedListScreen.tsx

```tsx
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
```

### src/screens/FeedDetailScreen.tsx

```tsx
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
        <p>Open with the top-right button to view full article.</p>
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
```

### src/screens/AddFeedScreen.tsx

```tsx
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
```

### src/screens/SettingsScreen.tsx

```tsx
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
```

### src/components/FeedItem.tsx (optional richer card)

```tsx
import React from 'react';
import { Card, Text } from 'react-native-paper';

export default function FeedItem({ title, source, onPress }: { title: string; source?: string; onPress: () => void }) {
  return (
    <Card style={{ marginHorizontal: 12, marginVertical: 6 }} onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium">{title}</Text>
        {source ? <Text variant="bodySmall" style={{ opacity: 0.7 }}>{source}</Text> : null}
      </Card.Content>
    </Card>
  );
}
```
