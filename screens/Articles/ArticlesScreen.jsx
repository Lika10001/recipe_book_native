import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    ActivityIndicator,
    RefreshControl, ScrollView, TouchableOpacity,
} from 'react-native';
import { supabase } from '../../supabaseClient';
import ArticleCard from './ArticleCard';

export default function LearnScreen({navigation}) {
    const [articles, setArticles] = useState([]);
    //const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);

    const tags = ['Recipes', 'Health', 'Fitness', 'Cooking', 'Advises'];


    const fetchArticles = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            /*if (tag) {
                query = query.contains('tags', [tag]); // предполагается, что поле `tags` — массив
            }*/

            setArticles(data || []);
        } catch (err) {
            console.error('Ошибка загрузки статей:', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTagPress = (tag) => {
        setSelectedTag(tag === selectedTag ? null : tag);
        // Пока нет фильтрации — просто визуальный эффект
    };

    const fetchTags = async () => {
        try {
            const { data, error } = await supabase
                .from('tags')
                .select('name');

            if (error) throw error;
            setTags(data.map(tag => tag.name));
        } catch (err) {
            console.error('Ошибка загрузки тегов:', err.message);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchArticles();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Learn</Text>

            {/* 🔹 Муляж тегов */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagContainer}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {tags.map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        style={[
                            styles.tag,
                            selectedTag === tag && styles.tagSelected
                        ]}
                        onPress={() => handleTagPress(tag)}
                    >
                        <Text
                            style={[
                                styles.tagText,
                                selectedTag === tag && styles.tagTextSelected
                            ]}
                        >
                            {tag}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <ActivityIndicator size="large" color="#7F7FFF" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={articles}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <ArticleCard
                            title={item.title}
                            author={item.author}
                            image={item.image}
                            views={item.views}
                            avatar={item.avatar}
                            onPress={() =>
                                navigation.navigate('ArticleDetails', { article: item })
                            }
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginLeft: 16,
        marginTop: 25,
        color: '#1C1C1E',
    },
    tagContainer: {
        marginTop: 10,
        maxHeight: 150,
        marginBottom: 10,
    },
    tag: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F0F0F5',
        marginRight: 10,
        marginBottom: 8, // добавим отступ снизу
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,

        // отключаем тень
        shadowColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    tagSelected: {
        backgroundColor: '#7F7FFF',
    },
    tagText: {
        color: '#333333',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 25,
    },
    tagTextSelected: {
        color: '#FFFFFF',
    },
});
