import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SuggestedWorkoutCard({ workout, onPress }) {
    if (!workout) return null;

    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Image source={{ uri: workout.image_url }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.title}>🔥 Burn calories with: {workout.name}</Text>
                <View style={styles.detailsRow}>
                    <View style={styles.detail}>
                        <MaterialCommunityIcons name="fire" size={20} color="#E63946" />
                        <Text style={styles.detailText}>{workout.calories_burnt} kcal</Text>
                    </View>
                    <View style={styles.detail}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#4B3D69" />
                        <Text style={styles.detailText}>{workout.duration_minutes} min</Text>
                    </View>
                    <View style={styles.detail}>
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#4B3D69" />
                        <Text style={styles.detailText}>{workout.intensity}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 20,
        marginVertical: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    image: {
        width: '100%',
        height: 160,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#231942',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#555',
    },
});
