import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PageHeader = ({ title, leftComponent, rightComponent }) => {
    const insets = useSafeAreaInsets();
    const statusBarHeight = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight;

    return (
        <View style={[styles.container, { paddingTop: statusBarHeight }]}>
            <View style={styles.header}>
                {leftComponent && (
                    <View style={styles.leftComponent}>
                        {leftComponent}
                    </View>
                )}
                <Text style={styles.title}>{title}</Text>
                {rightComponent && (
                    <View style={styles.rightComponent}>
                        {rightComponent}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    leftComponent: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    rightComponent: {
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },
});

export default PageHeader; 