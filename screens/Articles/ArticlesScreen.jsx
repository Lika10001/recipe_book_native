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
    const [tags, setTags] = useState(['Recipes', 'Health', 'Fitness', 'Cooking', 'Advises']); // Временные теги
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);

    const fetchArticles = async () => {
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (selectedTag) {
                query = query.contains('tags', [selectedTag]);
            }

            const { data, error } = await query;

            if (error) throw error;
            
            // Получаем все уникальные теги из статей
            const allTags = new Set();
            data?.forEach(article => {
                if (article.tags && Array.isArray(article.tags)) {
                    article.tags.forEach(tag => allTags.add(tag));
                }
            });
            ;
            // Обновляем список тегов
            //setTags(Array.from(allTags));
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
    };

    useEffect(() => {
        fetchArticles();
    }, [selectedTag]);

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
                <View style={styles.listContainer}>
                    <FlatList
                        data={articles}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        contentContainerStyle={{
                            paddingBottom: 20,
                        }}
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
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Нет статей для отображения</Text>
                            </View>
                        }
                    />
                </View>
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
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    tagContainer: {
        marginTop: 10,
        maxHeight: 60,
        marginBottom: 0,
    },
    tag: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F0F0F5',
        marginRight: 10,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
