import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';
import RecipeForm from './RecipeForm';
import { Alert } from 'react-native';

const EditOwnRecipeScreen = ({ navigation }) => {
    const route = useRoute();
    const { recipeId } = route.params;
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            const { data, error } = await supabase
                .from('users_own_recipes')
                .select('*')
                .eq('id', recipeId)
                .single();

            if (error) {
                console.error('Error fetching recipe:', error);
                alert('Error loading recipe: ' + error.message);
            } else if (data) {
                setInitialData(data);
            }
            setLoading(false);
        };

        fetchRecipe();
    }, [recipeId]);

    const handleSave = async (recipeData) => {
        const { error } = await supabase
            .from('users_own_recipes')
            .update(recipeData)
            .eq('id', recipeId);

        if (error) {
            console.error('Update error:', error);
            alert('Error updating recipe: ' + error.message);
        } else {
            Alert.alert('Success', 'Recipe updated successfully');
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'AppTabs',
                        params: {
                            initialRouteName: 'Profile'
                        }
                    },
                    {
                        name: 'OwnRecipeDetails',
                        params: { recipeId: recipeId }
                    }
                ],
            });
        }
    };

    if (loading) {
        return null; // или можно показать индикатор загрузки
    }

    return <RecipeForm recipeId={recipeId} initialData={initialData} onSave={handleSave} />;
};

export default EditOwnRecipeScreen;

