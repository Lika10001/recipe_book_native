import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NavigationLink = ({ screenName, children }) => {
    const navigation = useNavigation();

    return (
        <Text style={styles.link} onPress={() => navigation.navigate(screenName)}>{children}</Text>
    );
};

const styles = StyleSheet.create({
    link: {
        color: "#4F46E5", // Цвет ссылки
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
});

export default NavigationLink;
