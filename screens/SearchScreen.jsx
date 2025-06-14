import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const SearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (debouncedQuery) {
            searchRecipes();
        } else {
            setRecipes([]);
        }
    }, [debouncedQuery]);

    const searchRecipes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .ilike('name', `%${debouncedQuery}%`);

            if (error) {
                console.error('Error searching recipes:', error);
                return;
            }

            setRecipes(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={24} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4c60ff" style={styles.loader} />
            ) : recipes.length === 0 && debouncedQuery ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No recipes found</Text>
                </View>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.recipeCard}
                            onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}
                        >
                            <Image source={{ uri: item.image }} style={styles.recipeImage} />
                            <View style={styles.recipeInfo}>
                                <Text style={styles.recipeName}>{item.name}</Text>
                                <Text style={styles.recipeTime}>{item.cooking_time} min</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        margin: 16,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 16,
    },
    recipeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recipeImage: {
        width: 100,
        height: 100,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    recipeInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    recipeTime: {
        fontSize: 14,
        color: '#666',
    },
});

export default SearchScreen; 