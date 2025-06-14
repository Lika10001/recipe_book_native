import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import RatingForm from './RatingForm';
import ReviewItem from './ReviewItem';
import {useUser} from "../../context/UserContext";

export function RecipeReviews({ recipeId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useUser();

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews_recipes')
            .select('*')
            .eq('recipe_id', recipeId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setReviews(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (rating, comment) => {
        const { error } = await supabase.from('reviews_recipes').insert({
            recipe_id: recipeId,
            user_id: user.id,
            rating,
            comment,
        });
        if (error) {
            console.error('Failed to submit review:', error);
        } else {
            fetchReviews();
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [recipeId]);

    return (
        <View style={{ marginTop: 32 }}>
            <RatingForm onSubmit={handleSubmit} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Ratings</Text>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ReviewItem
                            name={item.profiles?.username || 'Anonymous'}
                            date={new Date(item.created_at).toLocaleDateString()}
                            rating={item.rating}
                            text={item.comment}
                        />
                    )}
                />
            )}
        </View>
    );
}
