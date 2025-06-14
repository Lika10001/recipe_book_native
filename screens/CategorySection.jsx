import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

const CategorySection = ({ img, name, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image source={{ uri: img }} style={styles.image} />
            <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 100,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        resizeMode: 'cover',
        marginBottom: 6,
        backgroundColor: '#eee',
    },
    name: {
        fontSize: 12,
        color: '#444',
        textAlign: 'center',
    },
});

export default CategorySection;
