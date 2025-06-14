import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';

export default function RatingForm({ onSubmit }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleRating = (value) => {
        setRating(value);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Did you like this recipe?</Text>
            <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((num) => (
                    <FontAwesome
                        key={num}
                        name={num <= rating ? 'star' : 'star-o'}
                        size={32}
                        color="#FFD700"
                        onPress={() => handleRating(num)}
                    />
                ))}
            </View>
            <TextInput
                placeholder="Leave your comment..."
                style={styles.input}
                multiline
                value={comment}
                onChangeText={setComment}
            />
            <Button
                mode="contained"
                onPress={() => {
                    onSubmit(rating, comment);
                    setRating(0);
                    setComment('');
                }}
                disabled={rating === 0 || comment.trim() === ''}
                style={styles.button}
            >
                Submit
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    stars: { flexDirection: 'row', marginBottom: 12 },
    input: {
        borderColor: '#CCC',
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
    },
    button: { marginTop: 12 },
});
