import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Switch,
} from 'react-native';

const FilterSection = ({ title, children }) => (
    <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const FilterOptions = ({ options, selectedValue, onSelect, suffix }) => {
    return (
        <View style={styles.optionRow}>
            {options.map((option) => {
                const isSelected = selectedValue === option;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                        onPress={() => onSelect(option)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                            {option}{suffix}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const IngredientPicker = ({ ingredients, selectedIngredient, setSelectedIngredient }) => (
    <ScrollView
        horizontal
        style={{ marginBottom: 10 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
    >
        {ingredients.map((item, i) => {
            const isSelected = selectedIngredient === item.name;
            return (
                <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedIngredient(isSelected ? null : item.name)}
                    style={[
                        styles.ingredientContainer,
                        isSelected && styles.ingredientSelected,
                    ]}
                    activeOpacity={0.8}
                >
                    <Image source={{ uri: item.image_url }} style={styles.ingredientImage} />
                    <Text
                        style={[
                            styles.ingredientText,
                            isSelected && styles.ingredientTextSelected,
                        ]}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
);

const FilterModal = ({ route, navigation }) => {
    const { ingredients } = route.params;
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [selectedRating, setSelectedRating] = useState(4);
    const [selectedTime, setSelectedTime] = useState(30);
    const [sortRecent, setSortRecent] = useState(true);

    const applyFilters = () => {
        navigation.navigate('FilteredRecipes', {
            filters: {
                ingredient: selectedIngredient,
                minRating: selectedRating,
                maxTime: selectedTime,
                recent: sortRecent,
            },
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Filters</Text>
            </View>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <FilterSection title="Ingredients:">
                <IngredientPicker
                    ingredients={ingredients}
                    selectedIngredient={selectedIngredient}
                    setSelectedIngredient={setSelectedIngredient}
                />
            </FilterSection>

            <FilterSection title="Rate:">
                <FilterOptions
                    options={[3, 4, 4.5, 5]}
                    selectedValue={selectedRating}
                    onSelect={setSelectedRating}
                    suffix="★"
                />
            </FilterSection>

            <FilterSection title="Cooking time:">
                <FilterOptions
                    options={[15, 30, 45, 60]}
                    selectedValue={selectedTime}
                    onSelect={setSelectedTime}
                    suffix=" мин"
                />
            </FilterSection>

            <FilterSection title="Sort order:">
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Show newest first</Text>
                    <Switch
                        value={sortRecent}
                        onValueChange={setSortRecent}
                        trackColor={{ false: '#ccc', true: '#4c60ff' }}
                        thumbColor="#fff"
                    />
                </View>
            </FilterSection>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters} activeOpacity={0.9}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
        </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    filterSection: {
        borderWidth: 1,
        borderColor: '#4c60ff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f8faff',
        shadowColor: '#4c60ff',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#222',
    },
    header: {
        backgroundColor: '#4c60ff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
        headerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    ingredientContainer: {
        alignItems: 'center',
        marginRight: 20,
        padding: 6,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
        backgroundColor: '#fafafa',
    },
    ingredientSelected: {
        borderColor: '#4c60ff',
        backgroundColor: '#e3e8ff',
    },
    ingredientImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 6,
    },
    ingredientText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    ingredientTextSelected: {
        color: '#4c60ff',
        fontWeight: '700',
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 0,
    },
    optionButton: {
        backgroundColor: '#eee',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginRight: 10,
        marginBottom: 10,
    },
    optionButtonSelected: {
        backgroundColor: '#4c60ff',
        shadowColor: '#4c60ff',
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },
    optionText: {
        color: '#444',
        fontWeight: '600',
        fontSize: 14,
    },
    optionTextSelected: {
        color: '#fff',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    applyButton: {
        backgroundColor: '#4c60ff',
        paddingVertical: 16,
        borderRadius: 30,
        shadowColor: '#4c60ff',
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 6,
        marginTop: 10,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default FilterModal;
