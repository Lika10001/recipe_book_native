import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../supabaseClient';

export default function IngredientsCart() {
    const { user } = useUser();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('ingredients_cart')
                .select(`
                    id,
                    quantity,
                    ingredients (
                        id,
                        name,
                        image_url,
                        unit
                    )
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching cart:', error);
                return;
            }

            setCartItems(data || []);
        } catch (err) {
            console.error('Error in fetchCart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchCart();
        }
    }, [user]);

    const handleRemove = async (id) => {
        try {
            const { error } = await supabase
                .from('ingredients_cart')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error removing item:', error);
                return;
            }

            setCartItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error in handleRemove:', err);
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.row}>
                <Image 
                    source={{ uri: item.ingredients.image_url }} 
                    style={styles.image} 
                />
                <View style={styles.itemInfo}>
                    <Text style={styles.name}>{item.ingredients.name}</Text>
                    <Text style={styles.quantity}>
                        {item.quantity} {item.ingredients.unit}
                    </Text>
                </View>
                <Button 
                    mode="text" 
                    onPress={() => handleRemove(item.id)}
                    style={styles.removeButton}
                >
                    Удалить
                </Button>
            </Card.Content>
        </Card>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4c60ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Корзина ингредиентов</Text>
            {cartItems.length === 0 ? (
                <Text style={styles.emptyText}>Корзина пуста</Text>
            ) : (
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    quantity: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    removeButton: {
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
});
