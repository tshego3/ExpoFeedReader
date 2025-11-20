import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

type Props = {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function EmptyState({
    title = 'No items',
    message = 'There is nothing to show here yet.',
    actionLabel,
    onAction,
}: Props) {
    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                {title}
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
                {message}
            </Text>
            {actionLabel && onAction && (
                <Button mode="contained" style={styles.button} onPress={onAction}>
                    {actionLabel}
                </Button>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        marginBottom: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
    button: {
        marginTop: 8,
    },
});
