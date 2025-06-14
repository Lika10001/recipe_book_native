import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../supabaseClient';

const FilteredRecipesScreen = ({ route, navigation }) => {
    const { filters } = route.params || {};
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFilteredRecipes = async () => {
        setLoading(true);
        try {
            let query = supabase.from('recipes').select('*');

            // Фильтрация по ингредиентам
            if (filters?.ingredients && Array.isArray(filters.ingredients) && filters.ingredients.length > 0) {
                const { data: recipesIngredients, error: riError } = await supabase
                    .from('recipes_ingredients')
                    .select('recipe_id')
                    .in('ingredient_id', filters.ingredients);

                if (riError) {
                    console.error('Error fetching recipes_ingredients:', riError);
                    throw riError;
                }

                if (!recipesIngredients || recipesIngredients.length === 0) {
                    setFilteredRecipes([]);
                    setLoading(false);
                    return;
                }

                const recipeIds = recipesIngredients.map(ri => ri.recipe_id);
                query = query.in('id', recipeIds);
            }

            // Фильтрация по рейтингу
            if (filters?.minRating && typeof filters.minRating === 'number') {
                query = query.gte('rating', filters.minRating);
            }

            // Фильтрация по времени приготовления
            if (filters?.maxTime && typeof filters.maxTime === 'number') {
                query = query.lte('cooking_time', filters.maxTime);
            }

            // Сортировка по дате создания
            if (filters?.recent) {
                query = query.order('created_at', { ascending: false });
            }

            const { data: recipes, error: recipesError } = await query;

            if (recipesError) {
                console.error('Error fetching recipes:', recipesError);
                throw recipesError;
            }

            setFilteredRecipes(recipes || []);
        } catch (error) {
            console.error('Error fetching filtered recipes:', error);
            setFilteredRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilteredRecipes();
    }, [filters]);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4c60ff" />
            ) : filteredRecipes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No recipes found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRecipes}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}
                        >
                            <Image source={{ uri: item.image }} style={styles.image} />
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.time}>{item.cooking_time} min</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 160,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        paddingHorizontal: 12,
    },
    time: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default FilteredRecipesScreen;
