import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

const CategoryRecipesScreen = ({ route, navigation }) => {
    const { categoryId, categoryName } = route.params;
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        const fetchCategoryRecipes = async () => {
            const { data, error } = await supabase
                .from('recipe_categories')
                .select('*, recipe_id(*)')
                .eq('category_id', categoryId);

            if (error) {
                console.error(error);
                return;
            }

            setRecipes(data.map(item => item.recipe_id));
        };

        fetchCategoryRecipes();
    }, []);

    const renderRecipe = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}>
            <Image source={{ uri: item.image }} style={styles.image} />
            {/* Icons overlay */}
            <View style={styles.overlayIcons}>
                <View style={styles.iconRow}>
                    <Ionicons name="time-outline" size={16} color="white" />
                    <Text style={styles.iconText}>{item.time || '30'}’</Text>
                </View>
                <View style={styles.iconRow}>
                    <Ionicons name="leaf-outline" size={16} color="white" />
                    <Text style={styles.iconText}>{item.ingredients?.length || 7}</Text>
                </View>
            </View>
            {/* Bottom info */}
            <View style={styles.cardInfo}>
                <Text style={styles.recipeName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
            </View>

            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRecipe}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default CategoryRecipesScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        position: 'relative',
        paddingTop: 30,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    image: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    overlayIcons: {
        position: 'absolute',
        top: 10,
        right: 10,
        alignItems: 'flex-end',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        marginBottom: 4,
    },
    iconText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 12,
    },
    cardInfo: {
        padding: 12,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
