import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../supabaseClient';

export default function IngredientsCart() {
    const user = useUser();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchCart = async () => {
            const { data, error } = await supabase
                .from('ingredients_cart')
                .select('id, ingredients (*)')
                .eq('user_id', user.id);

            if (!error) {
                setCartItems(data);
            }
        };

        if (user) fetchCart();
    }, [user]);

    const handleRemove = async (id) => {
        await supabase.from('ingredients_cart').delete().eq('id', id);
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.row}>
                <Image source={{ uri: item.ingredients.image_url }} style={styles.image} />
                <Text style={styles.name}>{item.ingredients.name}</Text>
                <Button mode="text" onPress={() => handleRemove(item.id)}>Удалить</Button>
            </Card.Content>
        </Card>
    );

    return (
        <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Корзина ингредиентов</Text>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 10,
    },
    name: {
        flex: 1,
        fontSize: 16,
    },
});
