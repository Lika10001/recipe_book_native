import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';

import {Text, FlatList, Image, View, ScrollView, ActivityIndicator} from 'react-native';
import {TextInput} from 'react-native-paper';
import { supabase } from '../supabaseClient';
import RecipeSection from '../components/RecipeSection.jsx';
import CategorySection from '../components/Category';
import { useUser } from '../context/UserContext';

const MainScreen = ({navigation}) => {
    const [trending, setTrending] = useState([]);
    const {user} = useUser();
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRecipes = async () => {
        setLoading(true);
        const {data, error} = await supabase.from('recipes').select('*');
        if (error) {
            console.error('Ошибка загрузки рецептов:', error);
        } else {
            setRecipes(data);
        }
        setLoading(false);
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchRecipes();
        const getTrending = async () => {
            const {data: recipesData, error} = await supabase
                .from('recipes')
                .select('*')
                .gt('rating', 3.0)
                .limit(10);

            if (error) {
                console.error('Ошибка получения трендовых рецептов:', error.message);
                return;
            }
            setTrending(recipesData);
        };

        const getIngredients = async () => {
            const { data, error } = await supabase
                .from('ingredients')
                .select('name, image_url')
                .limit(10);

            if (error) {
                console.error('Ошибка при загрузке ингредиентов:', error);
            } else {
                setIngredients(data);
            }
        };

        const getCategories = async () => {
            const {data: categoriesData, error} = await supabase
                .from('categories')
                .select('*');

            if (error) {
                console.error('Ошибка получения категорий:', error.message);
                return;
            }
            setCategories(categoriesData);
        };

        const getMostCategoriesWithRecipes = async () => {
            const {data: categoriesData, error: catError} = await supabase
                .from('categories')
                .select('*');

            if (catError) {
                console.error('Ошибка получения категорий:', catError.message);
                return;
            }

            const categoriesWithRecipes = await Promise.all(
                categoriesData.map(async (category) => {
                    const {data: recipesData, error: recError} = await supabase
                        .from('recipe_categories')
                        .select('*')
                        .eq('category_id', category.id);

                    return {
                        ...category,
                        recipes: recipesData || [],
                    };
                })
            );
            setMostCategories(categoriesWithRecipes.slice(0, 3));
        };

        getTrending();
        getCategories();
        getIngredients();
        getMostCategoriesWithRecipes();

    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator color="#4c60ff" size={40}/>
                </View>
            ) : (
                <ScrollView>
                    <SafeAreaView>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{flex: 1}}>
                                <Text style={styles.greeting}>Hello, {user?.username}!</Text>
                                <Text style={styles.subtitle}>What’s in your fridge?</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <Image
                                    source={user?.avatar ? {uri: user.avatar} : require('../img/BlankAvatar.png')}
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View>
                            <View style={styles.searchContainer}>
                                <MaterialCommunityIcons name="magnify" size={24} color="#999"/>
                                <TextInput
                                    placeholder="Search recipes"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholderTextColor="#aaa"
                                    style={styles.searchInput}
                                    underlineColor="transparent"
                                />
                            </View>
                            <TouchableOpacity
                                style={{ margin: 20, padding: 12, backgroundColor: '#4c60ff', borderRadius: 10 }}
                                onPress={() => navigation.navigate('FilterModal', { ingredients })}
                            >
                                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Filters</Text>
                            </TouchableOpacity>

                        </View>
                        {/* Ingredient icons */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.ingredientsRow}
                        >
                            {ingredients.map((item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.ingredientItem}
                                    onPress={() => navigation.navigate('FilteredRecipes', { ingredient: item.id })}
                                >
                                    <Image
                                        source={{ uri: item.image_url }}
                                        style={styles.ingredientImage}
                                    />
                                    <Text style={styles.ingredientText}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* New recipes */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>New recipes</Text>
                            <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                            {filteredRecipes.slice(0, 3).map((recipe, index) => (
                                <TouchableOpacity key={index} style={styles.recipeCard}
                                                  onPress={() => {navigation.navigate('RecipeDetails', {recipeId: recipe.id})}}>
                                    <Image source={{uri: recipe.image}} style={styles.recipeImage}/>
                                    <View style={styles.recipeOverlay}>
                                        <AntDesign name="clockcircleo" size={14} color="#fff"/>
                                        <Text style={styles.recipeMeta}>{recipe.cooking_time || 15}’</Text>
                                    </View>
                                    <Text style={styles.recipeName}>{recipe.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Video recipes */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Get Inspired</Text>
                            <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                            {filteredRecipes.slice(3, 6).map((recipe, index) => (
                                <TouchableOpacity key={index} style={styles.recipeCard}
                                                  onPress={() => {navigation.navigate('RecipeDetails', {recipeId: recipe.id})}}>
                                    <Image source={{uri: recipe.image}} style={styles.recipeImage}/>
                                    <View style={styles.recipeOverlay}>
                                        <AntDesign name="clockcircleo" size={14} color="#fff"/>
                                        <Text style={styles.recipeMeta}>{recipe.cooking_time || 20}’</Text>
                                    </View>
                                    <Text style={styles.recipeName}>{recipe.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </SafeAreaView>
                    {/* Categories */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesRow}
                    >
                        {categories.map((category) => (
                            <CategorySection
                                key={String(category.id)}
                                id={category.id}
                                img={category.image_url}
                                name={category.name}
                                navigation={navigation}
                            />
                        ))}
                    </ScrollView>
                    {/* Trending */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Trending</Text>
                        <Text style={styles.lengthText}>{trending.length}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 24 }}>
                        {trending.map((item, index) => (
                            <RecipeSection
                                key={String(item.id)}
                                id={item.id}
                                title={item.name}
                                imgUrl={item.image}
                                navigation={navigation}
                                index={index}
                            />
                        ))}
                    </View>

                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 30,
        alignItems: 'center',
        marginBottom: 12,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginTop: 6,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#4c60ff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        paddingLeft: 10,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        marginTop: 10,
    },
    searchInput: {
        marginLeft: 10,
        fontSize: 16,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    ingredientsRow: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    ingredientItem: {
        alignItems: 'center',
        marginRight: 20,
    },
    ingredientImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 6,
        backgroundColor: '#eee',
    },
    ingredientText: {
        fontSize: 12,
        color: '#444',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 28,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    seeAll: {
        fontSize: 14,
        color: '#7c3aed',
    },
    horizontalList: {
        paddingLeft: 24,
    },
    recipeCard: {
        width: 160,
        height: 180,
        marginRight: 16,
    },
    recipeImage: {
        width: '100%',
        height: 110,
        borderRadius: 14,
        resizeMode: 'cover',
    },
    recipeOverlay: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        paddingVertical: 2,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    recipeMeta: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },
    recipeName: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    categoriesRow: {
        paddingLeft: 24,
        paddingRight: 12,
        gap: 12,
        paddingBottom: 10,
    },
    lengthText: {
        fontSize: 14,
        color: '#888',
    },
});

export default MainScreen;

