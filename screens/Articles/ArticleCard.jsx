import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ArticleCard({ title, author, avatar, image, views = 0, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.row}>
                    <View style={styles.authorContainer}>
                        <Image
                            source={{ uri: avatar }}
                            style={styles.avatar}
                        />
                        <Text style={styles.author}>{author}</Text>
                    </View>
                    <View style={styles.rightIcons}>
                        <Ionicons name="eye" size={18} color="#444" style={{ marginLeft: 8 }} />
                        <Text style={styles.views}>{views}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 1,
    },
    image: {
        width: '100%',
        height: 180,
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1C1C1E',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    author: {
        marginLeft: 6,
        fontSize: 14,
        color: '#555',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ccc',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    views: {
        marginLeft: 8,
        fontSize: 12,
        color: '#555',
    },
});
