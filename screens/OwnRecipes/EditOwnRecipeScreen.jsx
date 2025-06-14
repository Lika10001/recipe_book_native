import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import { supabase } from '../../supabaseClient';

const EditOwnRecipeScreen = () => {
    const route = useRoute();
    const { recipeId } = route.params;

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [steps, setSteps] = useState(['']);
    const [servings, setServings] = useState(2);
    const [tips, setTips] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [time, setTime] = useState(0);
    const [occasion, setOccasion] = useState('');

    useEffect(() => {
        const fetchRecipe = async () => {
            const { data, error } = await supabase
                .from('users_own_recipes')
                .select('*')
                .eq('id', recipeId)
                .single();

            if (error) {
                console.error(error);
            } else if (data) {
                setTitle(data.title);
                setDescription(data.description || '');
                setIngredients(data.ingredients?.join(', ') || '');
                setSteps(data.steps || ['']);
                setServings(data.servings || 2);
                setTips(data.tips || '');
                setDifficulty(data.difficulty || '');
                setTime(data.cooking_time || 0);
                setOccasion(data.occasion || '');
            }
            setLoading(false);
        };

        fetchRecipe();
    }, [recipeId]);

    const handleSave = async () => {
        const { error } = await supabase
            .from('users_own_recipes')
            .update({
                title,
                description,
                servings,
                ingredients: ingredients.split(',').map((i) => i.trim()),
                steps,
                tips,
                difficulty,
                cooking_time: time,
                occasion
            })
            .eq('id', recipeId);

        if (error) {
            alert('Error updating recipe');
            console.error(error);
        } else {
            alert('Recipe updated!');
        }
    };

    if (loading) return <Text>Loading...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} />
            {/* остальные поля такие же как в AddOwnRecipe */}
            <TextInput
                label="Ingredients"
                value={ingredients}
                onChangeText={setIngredients}
                style={styles.input}
            />
            {/* аналогично для steps, tips, difficulty, etc. */}
            <Button mode="contained" style={styles.saveButton} onPress={handleSave}>
                Save Changes
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    input: { marginVertical: 8 },
    saveButton: { marginTop: 24 },
});

export default EditOwnRecipeScreen;
