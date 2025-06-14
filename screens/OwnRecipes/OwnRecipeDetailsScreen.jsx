import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, ActivityIndicator, Chip, Button } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import { useNavigation } from '@react-navigation/native';

const OwnRecipeDetailsScreen = ({route}) => {
    console.log('route.params:', route.params);
    if (!route.params || !route.params.recipeId) {
        console.log("No id provided");
    }
    const { recipeId } = route.params;
    const navigation = useNavigation();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            const { data, error } = await supabase
                .from('users_own_recipes')
                .select('*')
                .eq('id', recipeId)
                .single();

            if (error) {
                console.error(error);
            } else {
                setRecipe(data);
            }
            setLoading(false);
        };

        fetchRecipe();
    }, [recipeId]);

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

    if (!recipe) return <Text style={{ margin: 16 }}>Recipe not found.</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {recipe.image_url && (
                <Image source={{ uri: recipe.image_url }} style={styles.image} />
            )}
            <Text variant="headlineMedium" style={styles.title}>{recipe.title}</Text>

            <View style={styles.infoRow}>
                <Chip icon="account-group">{recipe.servings} servings</Chip>
                <Chip icon="clock-outline">{recipe.cooking_time} min</Chip>
                {recipe.difficulty && <Chip icon="fire">{recipe.difficulty}</Chip>}
            </View>

            <Text variant="titleMedium" style={styles.section}>Ingredients</Text>
            {recipe.ingredients?.map((item, index) => (
                <Text key={index} style={styles.bullet}>• {item}</Text>
            ))}

            <Text variant="titleMedium" style={styles.section}>Instructions</Text>
            {recipe.steps?.map((step, index) => (
                <Text key={index} style={styles.step}>{index + 1}. {step}</Text>
            ))}

            {recipe.tips?.trim() && (
                <>
                    <Text variant="titleMedium" style={styles.section}>Tips & Tricks</Text>
                    <Text>{recipe.tips}</Text>
                </>
            )}

            {recipe.occasion && (
                <>
                    <Text variant="titleMedium" style={styles.section}>Occasion</Text>
                    <Chip>{recipe.occasion}</Chip>
                </>
            )}

            {/* Edit */}
            <Button icon="pencil" mode="outlined" style={{ marginTop: 24 }} onPress={() => {navigation.navigate("EditOwnRecipe", {recipe: recipe})}}>Edit</Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 50,
    },
    image: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    section: {
        marginTop: 16,
        marginBottom: 4,
    },
    bullet: {
        marginLeft: 8,
        marginVertical: 2,
    },
    step: {
        marginVertical: 4,
    },
});

export default OwnRecipeDetailsScreen;
