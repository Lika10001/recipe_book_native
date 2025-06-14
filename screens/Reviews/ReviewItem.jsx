import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';

export default function ReviewItem({ name, date, rating, text }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text size={40} label={name[0]} />
                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <FontAwesome
                            key={i}
                            name={i <= rating ? 'star' : 'star-o'}
                            size={16}
                            color="#FFD700"
                        />
                    ))}
                </View>
            </View>
            <Text style={styles.comment}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    header: { flexDirection: 'row', alignItems: 'center' },
    info: { flex: 1, marginLeft: 12 },
    name: { fontWeight: 'bold', fontSize: 16 },
    date: { fontSize: 12, color: '#666' },
    stars: { flexDirection: 'row' },
    comment: { marginTop: 8, fontSize: 14 },
});
