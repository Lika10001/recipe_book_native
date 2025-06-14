import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useUser } from '../../context/UserContext';
import { FontAwesome } from '@expo/vector-icons';

const defaultAvatar = require('../../img/BlankAvatar.png');
const starIcon = require('../../icons/star.png');

export default function ArticleDetail({ route }) {
    const { article } = route.params;
    const { user } = useUser();
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([

        { userId: 'user1', username: 'Анна', avatar: null, rating: 5, text: 'Отличная статья, очень полезно!' },
        { userId: 'user2', username: 'Иван', avatar: null, rating: 4, text: 'Интересно, но хотелось бы больше деталей.' },
    ]);

    const handleRating = (selectedRating) => {
        setRating(selectedRating);
    };

    const handleAddReview = () => {
        if (!user) {
            Alert.alert('Авторизация необходима', 'Пожалуйста, войдите в свой аккаунт, чтобы оставить отзыв.');
            return;
        }
        if (rating === 0) {
            Alert.alert('Пожалуйста, оцените статью', 'Выберите количество звезд.');
            return;
        }
        if (!reviewText.trim()) {
            Alert.alert('Пожалуйста, напишите отзыв', 'Ваш отзыв не может быть пустым.');
            return;
        }

        const newReview = {
            userId: user.id || 'guest',
            username: user.username || 'Гость',
            avatar: user.avatar || null,
            rating: rating,
            text: reviewText,
            timestamp: new Date().toLocaleString(),
        };

        setReviews([...reviews, newReview]);
        setRating(0);
        setReviewText('');
        Alert.alert('Thank you!', 'Your review saved.');
    };

    const renderStars = (currentRating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => handleRating(i)}>
                    <FontAwesome
                        name={i <= currentRating ? 'star' : 'star-o'}
                        size={24}
                        color="#FFD700"
                        style={styles.star}
                    />
                </TouchableOpacity>
            );
        }
        return <View style={styles.ratingContainer}>{stars}</View>;
    };

    const renderReviewItem = (review) => (
        <View key={review.timestamp} style={styles.reviewItem}>
            <Image source={review.avatar ? { uri: review.avatar } : defaultAvatar} style={styles.reviewAvatar} />
            <View style={styles.reviewDetails}>
                <Text style={styles.reviewAuthor}>{review.username}</Text>
                <View style={styles.reviewRating}>
                    {Array(review.rating).fill().map((_, index) => (
                        <FontAwesome key={index} name="star" size={16} color="#FFD700" />
                    ))}
                    {Array(5 - review.rating).fill().map((_, index) => (
                        <FontAwesome key={index + review.rating} name="star-o" size={16} color="#FFD700" />
                    ))}
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewTimestamp}>{review.timestamp}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: article.image }} style={styles.image} />

            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.articleHeader}>
                <View style={styles.authorInfo}>
                    <Image source={article.avatar ? { uri: article.avatar } : defaultAvatar} style={styles.avatar} />
                    <Text style={styles.authorName}>{article.authorName || article.author || 'Автор не указан'}</Text>
                </View>
                <View>
                    {article.rating && (
                        <View style={styles.articleRating}>
                            {renderStars(article.rating)}
                            <Text style={styles.ratingCount}>({reviews.length} reviews)</Text>
                        </View>
                    )}
                </View>
            </View>
            <Text style={styles.content}>{article.text || 'Текст статьи скоро будет доступен.'}</Text>

            <View style={styles.reviewsSection}>
                <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                {reviews.map(renderReviewItem)}
            </View>

            {user && (
                <View style={styles.addReviewSection}>
                    <Text style={styles.sectionTitle}>Add review</Text>
                    {renderStars(rating)}
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Ваш отзыв..."
                        multiline
                        value={reviewText}
                        onChangeText={setReviewText}
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleAddReview}>
                        <Text style={styles.submitButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 250,
    },
    articleHeader: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        marginTop: 5,
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    authorName: {
        fontSize: 16,
        color: '#333',
    },
    articleRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        marginRight: 5,
    },
    star: {
        marginRight: 2,
    },
    ratingCount: {
        fontSize: 14,
        color: '#888',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 8,
    },
    content: {
        fontSize: 16,
        paddingHorizontal: 16,
        lineHeight: 24,
        color: '#333',
    },
    reviewsSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    reviewItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    reviewAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    reviewDetails: {
        flex: 1,
    },
    reviewAuthor: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    reviewRating: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
    },
    reviewTimestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    addReviewSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 32,
    },
    reviewInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loginMessage: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
    },
});
