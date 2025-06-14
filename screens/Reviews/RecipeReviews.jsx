import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import RatingForm from './RatingForm';
import ReviewItem from './ReviewItem';
import {useUser} from "../../context/UserContext";

export function RecipeReviews({ recipeId, onReviewAdded }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    const updateRecipeRating = async () => {
        console.log('Updating recipe rating...');
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews_recipes')
            .select('rating')
            .eq('recipe_id', recipeId);

        if (reviewsError) {
            console.error('Error fetching reviews for rating:', reviewsError);
            return;
        }

        if (reviewsData.length > 0) {
            const averageRating = reviewsData.reduce((acc, curr) => acc + curr.rating, 0) / reviewsData.length;
            console.log('New average rating:', averageRating);
            
            const { error: updateError } = await supabase
                .from('recipes')
                .update({ rating: averageRating })
                .eq('id', recipeId);

            if (updateError) {
                console.error('Error updating recipe rating:', updateError);
            } else {
                console.log('Recipe rating updated successfully');
                if (onReviewAdded) {
                    onReviewAdded();
                }
            }
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews_recipes')
            .select(`
                *,
                profiles:user_id (
                    username,
                    avatar
                )
            `)
            .eq('recipe_id', recipeId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            setReviews(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (rating, comment) => {
        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        console.log('Submitting review with user ID:', user.id);
        const { error } = await supabase.from('reviews_recipes').insert({
            recipe_id: recipeId,
            user_id: user.id,
            rating,
            comment,
        });

        if (error) {
            console.error('Failed to submit review:', error);
        } else {
            await fetchReviews();
            await updateRecipeRating();
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
                    keyExtractor={(item) => `${item.id}-${item.created_at}`}
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
