import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    Modal,
    Pressable, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';

const mealIcons = {
    breakfast: 'coffee',
    lunch: 'silverware-fork-knife',
    dinner: 'food-variant',
};

const FoodDiary = () => {
    const { user } = useUser();

    const [date, setDate] = useState(new Date());
    const [meals, setMeals] = useState({
        breakfast: null,
        lunch: null,
        dinner: null,
    });
    const [nutrition, setNutrition] = useState({
        fiber: { current: 0, target: 30 },
        protein: { current: 0, target: 100 },
        carbs: { current: 0, target: 250 },
    });

    const [recipes, setRecipes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState(null);
    const [calories, setCalories] = useState(0);

    // Загрузка рецептов из базы
    const fetchRecipes = async () => {
        const { data, error } = await supabase.from('recipes').select('*');
        if (error) {
            console.error('Error fetching recipes:', error);
        } else {
            setRecipes(data);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    // Смена даты назад/вперед
    const changeDate = (direction) => {
        setDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + direction);
            return newDate;
        });
    };

    // Открыть модалку выбора блюда
    const openMealPicker = (mealType) => {
        setSelectedMealType(mealType);
        setModalVisible(true);
    };

    // Выбрать блюдо из списка
    const selectRecipe = (recipe) => {
        setMeals((prev) => ({
            ...prev,
            [selectedMealType]: recipe,
        }));
        setModalVisible(false);
    };

    // Рассчитать суммарные нутриенты
    const calculateNutrition = () => {
        let fiberSum = 0,
            proteinSum = 0,
            carbsSum = 0;

        Object.values(meals).forEach((meal) => {
            if (meal) {
                fiberSum += meal.fiber || 0;
                proteinSum += meal.protein || 0;
                carbsSum += meal.carbs || 0;
            }
        });

        setNutrition({
            fiber: { current: fiberSum, target: 30 },
            protein: { current: proteinSum, target: 100 },
            carbs: { current: carbsSum, target: 250 },
        });
    };

    // Рассчитать суммарные калории
    const calculateTotalCalories = () => {
        let totalCalories = 0;

        if (meals.breakfast) totalCalories += meals.breakfast.calories || 0;
        if (meals.lunch) totalCalories += meals.lunch.calories || 0;
        if (meals.dinner) totalCalories += meals.dinner.calories || 0;

        setCalories(totalCalories);
    };

    useEffect(() => {
        calculateNutrition();
        calculateTotalCalories();
    }, [meals]);

    // Сохранить приемы пищи в базу
    const handleSaveMeal = async () => {
        if (!user) {
            alert('Please log in first!');
            return;
        }

        const mealData = {
            user_id: user.id,
            date: date.toISOString().split('T')[0], // yyyy-mm-dd
            breakfast: meals.breakfast ? meals.breakfast.id : null,
            lunch: meals.lunch ? meals.lunch.id : null,
            dinner: meals.dinner ? meals.dinner.id : null,
            calories,
        };

        const { error } = await supabase.from('food_diary').insert([mealData]);
        if (error) {
            console.error('Error saving meal:', error);
            alert('Error saving meal.');
        } else {
            alert('Meal successfully saved!');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Journal</Text>

            {/* Дата с кнопками назад/вперед */}
            <View style={styles.dateRow}>
                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
                    <Icon name="chevron-left" size={30} color="#ff6347" />
                </TouchableOpacity>
                <Text style={styles.date}>
                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
                    <Icon name="chevron-right" size={30} color="#ff6347" />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Баннер с картинкой */}
            <Image
                source={{
                    uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
                }}
                style={styles.bannerImage}
                resizeMode="cover"
            />

            <View style={styles.divider} />

            {/* Питательные вещества */}
            <View style={styles.nutritionContainer}>
                <View style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>Fiber</Text>
                    <Text style={styles.nutritionLabel}>Proteins</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionRow}>
                    <Text style={styles.nutritionValue}>
                        {nutrition.fiber.current}/{nutrition.fiber.target} g
                    </Text>
                    <Text style={styles.nutritionValue}>
                        {nutrition.protein.current}/{nutrition.protein.target} g
                    </Text>
                    <Text style={styles.nutritionValue}>
                        {nutrition.carbs.current}/{nutrition.carbs.target} g
                    </Text>
                </View>
                <TouchableOpacity style={styles.ekiluButton}>
                    <Text style={styles.ekiluText}>
                        ① Get ekilu+ to see your nutritional balance based on the Healthy Plate!
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Приёмы пищи с возможностью выбора блюда */}
            {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <React.Fragment key={mealType}>
                    <View style={styles.mealSection}>
                        <View style={styles.mealTitleRow}>
                            <Icon
                                name={mealIcons[mealType]}
                                size={24}
                                color="#ff6347"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.mealTitle}>
                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                            </Text>
                        </View>
                        {meals[mealType] ? (
                            <View style={styles.mealItem}>
                                <Text style={styles.mealName}>{meals[mealType].name}</Text>
                                <Text style={styles.mealCalories}>{meals[mealType].calories} kcal</Text>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() =>
                                        setMeals((prev) => ({ ...prev, [mealType]: null }))
                                    }
                                >
                                    <Icon name="close-circle" size={24} color="#ff6347" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => openMealPicker(mealType)}
                            >
                                <Text style={styles.addButtonText}>Add meal</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.divider} />
                </React.Fragment>
            ))}

            {/* Кнопка сохранить */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {/* Модалка выбора рецепта */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select a recipe</Text>
                        <FlatList
                            data={recipes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.recipeItem}
                                    onPress={() => selectRecipe(item)}
                                >
                                    <Text style={styles.recipeName}>{item.name}</Text>
                                    <Text style={styles.recipeCalories}>{item.calories} kcal</Text>
                                </Pressable>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    dateButton: {
        paddingHorizontal: 16,
    },
    date: {
        fontSize: 18,
        color: '#444',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    bannerImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
    },
    nutritionContainer: {
        marginBottom: 16,
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    nutritionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    nutritionValue: {
        fontSize: 14,
        color: '#777',
    },
    ekiluButton: {
        marginTop: 12,
    },
    ekiluText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    mealSection: {
        marginVertical: 12,
    },
    mealTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    mealTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#444',
    },
    addButton: {
        borderWidth: 1,
        borderColor: '#4c60ff',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff5f5',
    },
    addButtonText: {
        color: '#4c60ff',
        textAlign: 'center',
        fontWeight: '600',
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#ffebeb',
        borderRadius: 8,
    },
    mealName: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    mealCalories: {
        fontSize: 16,
        color: '#4c60ff',
        fontWeight: '700',
        marginRight: 8,
    },
    removeButton: {
        padding: 4,
    },
    saveButton: {
        marginTop: 16,
        marginBottom: 25,
        backgroundColor: '#4c60ff',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: '70%',
        padding: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    recipeItem: {
        paddingVertical: 12,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    recipeName: {
        fontSize: 16,
        color: '#333',
    },
    recipeCalories: {
        fontSize: 14,
        color: '#4c60ff',
        fontWeight: '600',
    },
    modalCloseButton: {
        marginTop: 16,
        backgroundColor: '#4c60ff',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default FoodDiary;
