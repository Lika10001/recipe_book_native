import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../supabaseClient';

const FilteredRecipesScreen = ({ route, navigation }) => {
    const { filters } = route.params;
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFilteredRecipes = async () => {
        setLoading(true);

        let query = supabase.from('recipes').select('*');

        if (filters.minRating) query = query.gte('rating', filters.minRating);
        if (filters.maxTime) query = query.lte('cooking_time', filters.maxTime);
        if (filters.ingredient) query = query.contains('ingredients', [filters.ingredient]);
        if (filters.recent) query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) console.error(error);
        else setFilteredRecipes(data);

        setLoading(false);
    };

    useEffect(() => {
        fetchFilteredRecipes();
    }, [filters]);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" />
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
                            <Text style={styles.time}>{item.cooking_time} мин</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    card: { marginBottom: 20 },
    image: { width: '100%', height: 160, borderRadius: 12 },
    name: { fontSize: 16, fontWeight: '600', marginTop: 8 },
    time: { fontSize: 14, color: '#666' },
});

export default FilteredRecipesScreen;
