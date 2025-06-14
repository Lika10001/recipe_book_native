import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';

export default function CategorySection({ navigation, id, img, name }) {
    return (
        <TouchableOpacity onPress={() => navigation.navigate('CategoryRecipes', { categoryId: id, categoryName: name })}>
            <View style={{ ...styles.section }}>
                <ImageBackground
                    source={{ uri: img }}
                    style={styles.imgBg}
                    imageStyle={{ borderRadius: 25 }}
                >
                    <View style={styles.transBg}>
                        <Text style={styles.title}>{name}</Text>
                    </View>
                </ImageBackground>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    section: {
        width: 170,
        height: 170,
        borderRadius: 25,
        marginRight: 5,
    },
    imgBg: {width: '100%', height: 150, justifyContent: 'flex-end'},
    transBg: {
        width: '100%',
        height: '25%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        paddingHorizontal: 25,
        justifyContent: 'center',
    },
    likeSect: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    text: {fontSize: 18, color: 'white'},
});