import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StatusBar,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import EditIcon from '../icons/EditIcon.js';
import {borderRadius} from "styled-system";

export default function ProfileScreen({ navigation }) {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('lists');
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [ownRecipes, setOwnRecipes] = useState([]);

    const fetchOwnRecipes = async () => {
        const { data, error } = await supabase
            .from('users_own_recipes')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error(error);
            return;
        }
        setOwnRecipes(data || []);
    };

    const fetchFavoriteRecipes = async () => {
        const { data, error } = await supabase
            .from('favorites')
            .select('recipe_id')
            .eq('user_id', user.id);

        if (error) {
            console.error(error);
            return;
        }

        const ids = data.map(item => item.recipe_id);
        if (ids.length > 0) {
            const { data: recipes } = await supabase
                .from('recipes')
                .select('*')
                .in('id', ids);
            setFavoriteRecipes(recipes || []);
        }
    };
    const handleFavoritePress = (recipeId) => {
        navigation.navigate('RecipeDetails', { recipeId });
    };

    const handleOwnRecipePress = (recipeId) => {
        navigation.navigate('OwnRecipeDetails', { recipeId });
    };

    const handleAddRecipe = () => {
        navigation.navigate('AddOwnRecipe');
    };

    const handleDeleteRecipe = async (recipeId) => {
        const { error } = await supabase
            .from('users_own_recipes')
            .delete()
            .eq('id', recipeId);

        if (error) {
            console.error(error);
        } else {
            fetchOwnRecipes();
        }
    };

    const renderFavoriteRecipe = ({ item }) => (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => handleFavoritePress(item.id)}
        >
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <Text style={styles.recipeName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderOwnRecipe = ({ item }) => (
        <View style={styles.ownRecipeCard}>
            <TouchableOpacity
                style={styles.recipeContent}
                onPress={() => handleOwnRecipePress(item.id)}
            >
                <Image source={{ uri: item.image_url }} style={styles.ownRecipeImage} />
                <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName}>{item.title}</Text>
                </View>

                <View style={styles.verticalButtons}>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteRecipe(item.id)}
                    >
                        <Text style={styles.deleteButtonText}>Delete🗑️</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );

    useEffect(() => {
        fetchFavoriteRecipes();
        fetchOwnRecipes();
    }, [user]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.profileContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>Profile</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                        <EditIcon width={50} height={50} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileRow}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user.username?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.username}>{user.username || 'User Name'}</Text>
                        <Text style={styles.email}>{user.email || 'email@example.com'}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.preferences}>
                    <Text style={styles.preferencesText}>{user.bio}</Text>
                </TouchableOpacity>

                <View style={styles.tabBar}>
                    <TouchableOpacity onPress={() => setActiveTab('lists')}>
                        <Text style={[styles.tabText, activeTab === 'lists' && styles.activeTab]}>
                            My Favourites
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('recipes')}>
                        <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTab]}>
                            My Recipes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {activeTab === 'lists' ? (
                <FlatList
                    data={favoriteRecipes}
                    renderItem={renderFavoriteRecipe}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.flatListContent}
                />
            ) : (
                <View style={styles.recipeListContainer}>

                    <FlatList
                        data={ownRecipes}
                        renderItem={renderOwnRecipe}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.flatListContent}
                        ListHeaderComponent={
                            <TouchableOpacity
                                style={styles.newRecipeButton}
                                onPress={handleAddRecipe}
                            >
                                <Text style={styles.newRecipeButtonText}>＋ Add New Recipe</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1
    },
    header: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 20,
        marginTop: 5,
        flex: 1
    },
    profileContainer: {
        padding: 20,
        paddingBottom: 10
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#4c60ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    avatarText: {
        fontSize: 26,
        color: 'white',
        fontWeight: '600'
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    infoContainer: {
        flexShrink: 1
    },
    username: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000'
    },
    email: {
        fontSize: 18,
        color: '#888',
        marginTop: 4
    },
    preferences: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10
    },
    preferencesText: {
        fontWeight: '600',
        fontSize: 16
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20
    },
    tabText: {
        fontSize: 16,
        color: '#999'
    },
    activeTab: {
        fontWeight: '700',
        color: '#000',
        borderBottomWidth: 2,
        borderBottomColor: '#4c60ff'
    },
    flatListContent: {
        padding: 20,
        paddingBottom: 50
    },
    recipeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10
    },
    recipeImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600'
    },
    recipeListContainer: {
        flex: 1
    },
    newRecipeButton: {
        backgroundColor: '#4c60ff',
        padding: 12,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 10,
        alignItems: 'center'
    },
    newRecipeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    ownRecipeCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden'
    },
    recipeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    ownRecipeImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: '#ddd'
    },
    recipeInfo: {
        flex: 1
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 10
    },
    editButton: {
        backgroundColor: '#ffd966',
        padding: 8,
        borderRadius: 8
    },
    deleteButton: {
        backgroundColor: '#ff4d4d',
        padding: 8,
        borderRadius: 8
    },
    editButtonText: {
        color: '#000',
        fontWeight: '600'
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: '600'
    }
});
