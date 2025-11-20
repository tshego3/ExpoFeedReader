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
