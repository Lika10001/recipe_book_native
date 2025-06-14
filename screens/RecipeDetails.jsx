import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity, FlatList,
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
    const user = useUser();

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [recipeRes, ingredientsRes, favoriteRes] = await Promise.all([
                    supabase.from('recipes').select('*').eq('id', recipeId).single(),
                    supabase.from('recipes_ingredients')
                        .select('ingredient:ingredient_id(*)')
                        .eq('recipe_id', recipeId),
                    supabase.from('favorites').select('*').eq('user_id', user.id).eq('recipe_id', recipeId),
                ]);

                console.log('recipe data ', ingredientsRes);
                if (recipeRes.error) throw recipeRes.error;
                if (ingredientsRes.error) throw ingredientsRes.error;

                setRecipe(recipeRes.data);
                setIngredients(ingredientsRes.data.map(item => item.ingredient));

                if (ingredientsRes.data?.length) {
                    setIngredients(ingredientsRes.data.map(item => item.ingredient));
                }
                if (favoriteRes.data) {
                    const favoriteRecipeIds = favoriteRes.data.map(item => item.recipe_id);
                    setIsFavorite(favoriteRecipeIds.includes(recipeId));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        const checkIfFavorite = async () => {
            if (!user?.user?.id) return;

            const { data: userData, error: userError } = await supabase
                .from("favorites")
                .select("user_id")
                .eq("user_id", user.user.id)
                .maybeSingle();

            if (userError || !userData) return;

            const { data: favoriteData, error: favoriteError } = await supabase
                .from("favorites")
                .select("*")
                .eq("user_id", user.user.id)
                .eq("recipe_id", recipeId)
                .maybeSingle();

            if (favoriteError) return;

            setIsFavorite(!!favoriteData);
        };

        checkIfFavorite();
        if (recipeId && user) fetchData();
    }, [recipeId, user]);

    const handleAddToCart = async (ingredientId) => {
        const { data, error } = await supabase
            .from('ingredients_cart')
            .insert([{ user_id: user.id, ingredient_id: ingredientId }]);

        if (error) {
            console.error('Ошибка добавления в корзину:', error);
        }
    };

    const handleFavorite = async () => {
        if (!user) {
            alert('Войдите в систему');
            return;
        }

        try {
            if (isFavorite) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.user.id)
                    .eq('recipe_id', recipeId);
                if (error) throw error;
                setIsFavorite(false);
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: user.user.id, recipe_id: recipeId }]);
                if (error) throw error;
                setIsFavorite(true);
            }
        } catch (err) {
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
                            <Text style={{ fontSize: 16, flex: 1 }}>{item.name}</Text>
                            <Button mode="outlined" compact onPress={() => handleAddToCart(item.id)}>+</Button>
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
                                    {Array(4).fill().map((_, i) => (
                                        <MaterialCommunityIcons
                                            key={i}
                                            name="star"
                                            size={20}
                                            color="#FFD700"
                                        />
                                    ))}
                                    <MaterialCommunityIcons
                                        name="star-half-full"
                                        size={20}
                                        color="#FFD700"
                                    />
                                </View>

                                <View style={styles.iconRow}>
                                    <Feather name="share-2" size={22} color="#231942" style={styles.icon} />
                                    <Feather name="plus-square" size={22} color="#231942" style={styles.icon} />
                                    <View style={styles.bookmarkContainer}>
                                        <Feather name="bookmark" size={22} color="#231942" />
                                        <Text style={styles.bookmarkText}>1.8 K</Text>
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

                    <RecipeReviews recipeId={recipe.id} />
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
        fontSize: 20,
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
        fontSize: 14,
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
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#231942',
        fontWeight: '600',
        marginTop: 2,
    },
});