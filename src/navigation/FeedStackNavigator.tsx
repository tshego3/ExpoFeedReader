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
