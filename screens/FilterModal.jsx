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
import Slider from '@react-native-community/slider';

const FilterSection = ({ title, children }) => (
    <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const RatingFilter = ({ value, onValueChange }) => {
    const ratings = [0, 1, 2, 3, 4, 5];
    
    return (
        <View style={styles.ratingContainer}>
            <View style={styles.ratingButtons}>
                {ratings.map((rating) => (
                    <TouchableOpacity
                        key={rating}
                        style={[
                            styles.ratingButton,
                            value === rating && styles.ratingButtonSelected,
                        ]}
                        onPress={() => onValueChange(rating)}
                    >
                        <Text style={[
                            styles.ratingText,
                            value === rating && styles.ratingTextSelected,
                        ]}>
                            {rating > 0 ? `${rating}★` : 'Any'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const TimeFilter = ({ value, onValueChange }) => {
    return (
        <View style={styles.timeContainer}>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={120}
                step={5}
                value={value}
                onValueChange={onValueChange}
                minimumTrackTintColor="#4c60ff"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#4c60ff"
            />
            <Text style={styles.timeValue}>{value} min</Text>
        </View>
    );
};

const IngredientPicker = ({ ingredients, selectedIngredients, setSelectedIngredients }) => (
    <ScrollView
        horizontal
        style={{ marginBottom: 10 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
    >
        {ingredients.map((item, i) => {
            const isSelected = selectedIngredients.includes(item.id);
            return (
                <TouchableOpacity
                    key={i}
                    onPress={() => {
                        if (isSelected) {
                            setSelectedIngredients(selectedIngredients.filter(id => id !== item.id));
                        } else {
                            setSelectedIngredients([...selectedIngredients, item.id]);
                        }
                    }}
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
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [selectedRating, setSelectedRating] = useState(0);
    const [selectedTime, setSelectedTime] = useState(30);
    const [sortRecent, setSortRecent] = useState(true);

    const applyFilters = () => {
        navigation.navigate('FilteredRecipes', {
            filters: {
                ingredients: selectedIngredients,
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
                        selectedIngredients={selectedIngredients}
                        setSelectedIngredients={setSelectedIngredients}
                    />
                </FilterSection>

                <FilterSection title="Minimum Rating:">
                    <RatingFilter
                        value={selectedRating}
                        onValueChange={setSelectedRating}
                    />
                </FilterSection>

                <FilterSection title="Maximum Cooking Time:">
                    <TimeFilter
                        value={selectedTime}
                        onValueChange={setSelectedTime}
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
    container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 35, },
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
    ratingContainer: {
        marginBottom: 10,
    },
    ratingButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ratingButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    ratingButtonSelected: {
        backgroundColor: '#4c60ff',
    },
    ratingText: {
        color: '#444',
        fontWeight: '600',
        fontSize: 14,
    },
    ratingTextSelected: {
        color: '#fff',
    },
    timeContainer: {
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeValue: {
        textAlign: 'center',
        fontSize: 16,
        color: '#444',
        marginTop: 8,
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
