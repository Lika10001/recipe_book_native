import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../supabaseClient';

export default function RecipeSection({ title, imgUrl, index, id, navigation }) {
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            navigation.navigate('RecipeDetails', { recipeId: id });
        } catch (err) {
            console.error('Ошибка при загрузке рецепта:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.section}>
            <Text style={styles.index}>{index + 1}</Text>
            <Image source={{ uri: imgUrl }} style={styles.sectionImg} />
            <View style={styles.sectionDetails}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {loading && <ActivityIndicator size="small" color="orange" />}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: '5%',
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    index: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 15,
        color: '#FF6347',
    },
    sectionImg: {
        width: 90,
        height: 90,
        borderRadius: 15,
    },
    sectionDetails: {
        flex: 1,
        paddingLeft: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});
