import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity, FlatList,
    TextInput,
} from 'react-native';
import {Button, Card, Chip} from 'react-native-paper';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { IconButton } from 'react-native-paper';
import {Feather, FontAwesome, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import { RecipeReviews } from "./Reviews/RecipeReviews";

export default function RecipeDetails({ route }) {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [bookmarksCount, setBookmarksCount] = useState(0);
    const { user } = useUser();
    const [selectedQuantity, setSelectedQuantity] = useState({});

    console.log('Full user object:', user);

    useEffect(() => {
        console.log('User data in RecipeDetails:', user);
        console.log('User ID:', user?.id);
        console.log('User user ID:', user?.user?.id);
    }, [user]);

    useEffect(() => {
        async function checkTables() {
            // Проверяем таблицу recipes
            const { data: recipesData, error: recipesError } = await supabase
                .from('recipes')
                .select('*')
                .limit(1);
            console.log('Recipes table structure:', recipesData);

            // Проверяем таблицу ingredients
            const { data: ingredientsData, error: ingredientsError } = await supabase
                .from('ingredients')
                .select('*');

            // Проверяем таблицу recipes_ingredients
            const { data: recipesIngredientsData, error: recipesIngredientsError } = await supabase
                .from('recipes_ingredients')
                .select('*');
        }

        checkTables();
    }, []);

    const updateRecipeRating = async () => {
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews_recipes')
            .select('rating')
            .eq('recipe_id', recipeId);

        if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError);
            return;
        }

        if (reviewsData.length > 0) {
            const averageRating = reviewsData.reduce((acc, curr) => acc + curr.rating, 0) / reviewsData.length;
            
            const { error: updateError } = await supabase
                .from('recipes')
                .update({ rating: averageRating })
                .eq('id', recipeId);

            if (updateError) {
                console.error('Error updating recipe rating:', updateError);
            } else {
                setRecipe(prev => ({ ...prev, rating: averageRating }));
            }
        }
    };

    const updateBookmarksCount = async () => {
        const { data, error } = await supabase
            .from('favorites')
            .select('user_id')
            .eq('recipe_id', recipeId);

        if (error) {
            console.error('Error fetching bookmarks:', error);
            return;
        }

        setBookmarksCount(data.length);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                console.log('Fetching data for recipe:', recipeId);
                console.log('Current user:', user);
                
                const [recipeRes, ingredientsRes, favoriteRes] = await Promise.all([
                    supabase.from('recipes').select('*').eq('id', recipeId).single(),
                    supabase.from('recipes_ingredients')
                        .select(`
                            quantity,
                            ingredients:ingredient_id (
                                id,
                                name,
                                image_url,
                                calories,
                                category,
                                unit
                            )
                        `)
                        .eq('recipe_id', recipeId),
                    supabase.from('favorites').select('*').eq('user_id', user?.id).eq('recipe_id', recipeId),
                ]);

                console.log('Favorite response:', favoriteRes);

                if (recipeRes.error) throw recipeRes.error;
                if (ingredientsRes.error) throw ingredientsRes.error;

                setRecipe(recipeRes.data);
                if (ingredientsRes.data?.length) {
                    const mappedIngredients = ingredientsRes.data.map(item => ({
                        ...item.ingredients,
                        quantity: item.quantity
                    }));
                    setIngredients(mappedIngredients);
                }

                // Проверяем избранное
                if (favoriteRes.data) {
                    console.log('Favorite data:', favoriteRes.data);
                    const isRecipeFavorite = favoriteRes.data.length > 0;
                    console.log('Is recipe favorite:', isRecipeFavorite);
                    setIsFavorite(isRecipeFavorite);
                } else {
                    console.log('No favorite data found');
                    setIsFavorite(false);
                }

                // Получаем количество закладок
                await updateBookmarksCount();
            } catch (err) {
                console.error('Error in fetchData:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (recipeId && user?.id) {
            console.log('Starting fetchData with recipeId:', recipeId, 'and user:', user);
            fetchData();
        } else {
            console.log('Missing recipeId or user:', { recipeId, user });
        }
    }, [recipeId, user]);

    useEffect(() => {
        async function addIngredients() {
            const ingredients = [
                { ingredient_id: "123e4567-e89b-12d3-a456-426614174015", quantity: 2 }, // Egg
                { ingredient_id: "123e4567-e89b-12d3-a456-426614174016", quantity: 100 }, // Cheese
                { ingredient_id: "123e4567-e89b-12d3-a456-426614174037", quantity: 1 }, // Pepper
                { ingredient_id: "123e4567-e89b-12d3-a456-426614174038", quantity: 200 }, // Pasta
                { ingredient_id: "123e4567-e89b-12d3-a456-426614174036", quantity: 1 }, // Salt
            ];

            const { data, error } = await supabase
                .from('recipes_ingredients')
                .insert(
                    ingredients.map(ing => ({
                        ...ing,
                        recipe_id: recipeId
                    }))
                );

            if (error) {
                console.error('Error adding ingredients:', error);
            } else {
                console.log('Ingredients added successfully');
                // Перезагружаем данные после добавления
                fetchData();
            }
        }

        // Проверяем, есть ли уже ингредиенты для этого рецепта
        const checkIngredients = async () => {
            const { data, error } = await supabase
                .from('recipes_ingredients')
                .select('*')
                .eq('recipe_id', recipeId);

            if (error) {
                console.error('Error checking ingredients:', error);
                return;
            }

            if (!data || data.length === 0) {
                // Если ингредиентов нет, добавляем их
                await addIngredients();
            }
        };

        checkIngredients();
    }, [recipeId]);

    const handleAddToCart = async (ingredient) => {
        if (!user?.id) {
            alert('Войдите в систему');
            return;
        }

        const quantity = selectedQuantity[ingredient.id] || ingredient.quantity || 1;

        try {
            console.log('Adding to cart:', { 
                user_id: user.id, 
                ingredient_id: ingredient.id,
                quantity: quantity 
            });

            const { data, error } = await supabase
                .from('ingredient_cart')
                .insert([{ 
                    user_id: user.id, 
                    ingredient_id: ingredient.id,
                    quantity: quantity
                }]);

            if (error) {
                console.error('Ошибка добавления в корзину:', error);
                alert('Не удалось добавить в корзину');
                return;
            }

            alert('Добавлено в корзину');
            setSelectedQuantity(prev => ({ ...prev, [ingredient.id]: undefined }));
        } catch (err) {
            console.error('Ошибка при добавлении в корзину:', err);
            alert('Произошла ошибка');
        }
    };

    const handleQuantityChange = (ingredientId, value) => {
        const numValue = parseInt(value) || 0;
        if (numValue > 0) {
            setSelectedQuantity(prev => ({ ...prev, [ingredientId]: numValue }));
        }
    };

    const handleFavorite = async () => {
        if (!user?.id) {
            alert('Войдите в систему');
            return;
        }

        try {
            console.log('Handling favorite for recipe:', recipeId);
            console.log('Current favorite state:', isFavorite);
            
            if (isFavorite) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('recipe_id', recipeId);
                if (error) throw error;
                setIsFavorite(false);
                setBookmarksCount(prev => prev - 1);
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: user.id, recipe_id: recipeId }]);
                if (error) throw error;
                setIsFavorite(true);
                setBookmarksCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Favorite error:', err);
            alert('Ошибка: ' + err.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="orange" />
            </View>
        );
    }

    if (error || !recipe) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Рецепт не найден</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={ingredients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <Card style={{ marginBottom: 12, marginHorizontal: 20, borderRadius: 16, backgroundColor: '#FFF' }}>
                    <Card.Content>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={{ uri: item.image_url }}
                                style={{ width: 40, height: 40, borderRadius: 8, marginRight: 10 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16 }}>{item.name}</Text>
                                <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                                    {item.quantity} {item.unit}
                                </Text>
                            </View>
                            <View style={styles.addToCartContainer}>
                                <TextInput
                                    style={styles.quantityInput}
                                    keyboardType="numeric"
                                    value={selectedQuantity[item.id]?.toString() || item.quantity?.toString()}
                                    onChangeText={(value) => handleQuantityChange(item.id, value)}
                                    placeholder={item.quantity?.toString()}
                                />
                                <Button 
                                    mode="contained" 
                                    compact 
                                    onPress={() => handleAddToCart(item)}
                                    style={styles.addButton}
                                >
                                    +
                                </Button>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            )}
            ListHeaderComponent={
                <>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: recipe.image }} style={styles.image} />
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            style={styles.backButton}
                            iconColor="#4B3D69"
                        />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{recipe.name}</Text>

                            <View style={styles.rowBetween}>
                                <View style={styles.row}>
                                    {Array(5).fill().map((_, i) => (
                                        <MaterialCommunityIcons
                                            key={i}
                                            name={i < Math.floor(recipe.rating) ? "star" : i < recipe.rating ? "star-half-full" : "star-outline"}
                                            size={28}
                                            color="#FFD700"
                                        />
                                    ))}
                                    <Text style={{ marginLeft: 8, fontSize: 16 }}>{recipe.rating?.toFixed(1) || '0.0'}</Text>
                                </View>

                                <View style={styles.iconRow}>
                                    <View style={styles.bookmarkContainer}>
                                        <Feather name="bookmark" size={22} color="#231942" />
                                        <Text style={styles.bookmarkText}>{bookmarksCount}</Text>
                                    </View>
                                    <IconButton
                                        icon={isFavorite ? 'heart' : 'heart-outline'}
                                        color={isFavorite ? 'red' : 'gray'}
                                        size={28}
                                        onPress={handleFavorite}
                                    />
                                </View>
                            </View>

                            <Text style={styles.description}>{recipe.description}</Text>

                            <View style={styles.infoBlock}>
                                {[
                                    { icon: 'carrot', label: 'Ingredients', value: ingredients.length.toString() },
                                    { icon: 'meditation', label: 'Difficulty', value: 'Easy' },
                                    { icon: 'clock-outline', label: 'Time', value: "50'" },
                                    { icon: 'lightning-bolt', label: 'Calories', value: '340' },
                                ].map((item, index) => (
                                    <View key={index} style={styles.infoItem}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color="#231942" />
                                        <Text style={styles.infoLabel}>{item.label}</Text>
                                        <Text style={styles.infoValue}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>
                            Ingredients
                        </Text>
                    </View>
                </>
            }
            ListFooterComponent={
                <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Preparación</Text>
                    <Card style={{ borderRadius: 16, backgroundColor: '#FFF' }}>
                        <Card.Content>
                            {recipe.steps.map((step, index) => (
                                <View key={index} style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#999' }}>Paso {index + 1}</Text>
                                    <Text style={{ fontSize: 16 }}>{step}</Text>
                                </View>
                            ))}
                        </Card.Content>
                    </Card>

                    <RecipeReviews 
                        recipeId={recipeId} 
                        onReviewAdded={updateRecipeRating}
                    />
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 290,
    },
    playButton: {
        position: 'absolute',
        top: '40%',
        left: '42%',
    },
    playIconCircle: {
        backgroundColor: '#4B3D69',
        borderRadius: 999,
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#231942',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginHorizontal: 6,
    },
    bookmarkContainer: {
        alignItems: 'center',
        marginLeft: 6,
    },
    bookmarkText: {
        fontSize: 10,
        color: '#777',
        marginTop: 2,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    authorCircle: {
        backgroundColor: '#FEE440',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    authorText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#231942',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#231942',
    },
    description: {
        fontSize: 16,
        color: '#4B3D69',
        marginTop: 10,
        lineHeight: 20,
    },
    infoBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
    },
    infoItem: {
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#231942',
        fontWeight: '600',
        marginTop: 2,
    },
    addToCartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    quantityInput: {
        width: 50,
        height: 36,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        paddingHorizontal: 8,
        textAlign: 'center',
        marginRight: 8,
    },
    addButton: {
        backgroundColor: '#4c60ff',
        borderRadius: 4,
    },
});