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
