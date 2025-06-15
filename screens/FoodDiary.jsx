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

    // Загрузка записей дневника для выбранной даты
    const fetchDiaryEntries = async (selectedDate) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('meal_journal')
            .select(`
                *,
                recipe:recipe_id (*)
            `)
            .eq('user_id', user.id)
            .eq('journal_date', selectedDate.toISOString().split('T')[0]);

        if (error) {
            console.error('Error fetching diary entries:', error);
            return;
        }

        // Преобразуем данные в нужный формат
        const newMeals = {
            breakfast: null,
            lunch: null,
            dinner: null,
        };

        data.forEach(entry => {
            if (entry.recipe) {
                // Объединяем данные рецепта с сохраненными нутриентами
                newMeals[entry.meal_type] = {
                    ...entry.recipe,
                    calories: entry.calories,
                    proteins: entry.proteins,
                    carbs: entry.carbs,
                    fiber: entry.fiber
                };
            }
        });

        setMeals(newMeals);
    };

    const fetchRecipes = async () => {
        const { data, error } = await supabase
            .from('recipes')
            .select(`
                *,
                recipes_ingredients (
                    quantity,
                    ingredients:ingredient_id (
                        calories,
                        proteins,
                        carbs,
                        fiber,
                        unit
                    )
                )
            `);
        if (error) {
            console.error('Error fetching recipes:', error);
        } else {
            // Рассчитываем калории и нутриенты для каждого рецепта
            const recipesWithNutrition = data.map(recipe => {
                let totalCalories = 0;
                let totalProteins = 0;
                let totalCarbs = 0;
                let totalFiber = 0;

                recipe.recipes_ingredients?.forEach(item => {
                    const ingredient = item.ingredients;
                    const quantity = item.quantity;
                    
                    // Переводим количество в граммы/мл если нужно
                    let normalizedQuantity = quantity;
                    if (ingredient.unit === 'ml' || ingredient.unit === 'g') {
                        normalizedQuantity = quantity;
                    } else if (ingredient.unit === 'kg' || ingredient.unit === 'l') {
                        normalizedQuantity = quantity * 1000;
                    } else if (ingredient.unit === 'tbsp') {
                        normalizedQuantity = quantity * 15;
                    } else if (ingredient.unit === 'tsp') {
                        normalizedQuantity = quantity * 5;
                    }

                    const multiplier = normalizedQuantity / 100;
                    totalCalories += (ingredient.calories || 0) * multiplier;
                    totalProteins += (ingredient.proteins || 0) * multiplier;
                    totalCarbs += (ingredient.carbs || 0) * multiplier;
                    totalFiber += (ingredient.fiber || 0) * multiplier;
                });

                return {
                    ...recipe,
                    calories: Math.round(totalCalories),
                    proteins: Math.round(totalProteins),
                    carbs: Math.round(totalCarbs),
                    fiber: Math.round(totalFiber)
                };
            });

            setRecipes(recipesWithNutrition);
        }
    };

    useEffect(() => {
        fetchRecipes();
        fetchDiaryEntries(date);
    }, [date, user]);

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
    const selectRecipe = async (recipe) => {
        if (!user) {
            alert('Please log in first!');
            return;
        }

        try {
            // Сначала удаляем старую запись для этого приема пищи
            await supabase
                .from('meal_journal')
                .delete()
                .eq('user_id', user.id)
                .eq('journal_date', date.toISOString().split('T')[0])
                .eq('meal_type', selectedMealType);

            // Рассчитываем нутриенты для рецепта
            const { data: ingredientsData, error: ingredientsError } = await supabase
                .from('recipes_ingredients')
                .select(`
                    quantity,
                    ingredients:ingredient_id (
                        calories,
                        proteins,
                        carbs,
                        fiber,
                        unit
                    )
                `)
                .eq('recipe_id', recipe.id);

            if (ingredientsError) {
                console.error('Error fetching ingredients:', ingredientsError);
                return;
            }

            let totalCalories = 0;
            let totalProteins = 0;
            let totalCarbs = 0;
            let totalFiber = 0;

            ingredientsData.forEach(item => {
                const ingredient = item.ingredients;
                const quantity = item.quantity;
                
                // Переводим количество в граммы/мл если нужно
                let normalizedQuantity = quantity;
                if (ingredient.unit === 'ml' || ingredient.unit === 'g') {
                    normalizedQuantity = quantity;
                } else if (ingredient.unit === 'kg' || ingredient.unit === 'l') {
                    normalizedQuantity = quantity * 1000;
                } else if (ingredient.unit === 'tbsp') {
                    normalizedQuantity = quantity * 15;
                } else if (ingredient.unit === 'tsp') {
                    normalizedQuantity = quantity * 5;
                }

                const multiplier = normalizedQuantity / 100;
                totalCalories += (ingredient.calories || 0) * multiplier;
                totalProteins += (ingredient.proteins || 0) * multiplier;
                totalCarbs += (ingredient.carbs || 0) * multiplier;
                totalFiber += (ingredient.fiber || 0) * multiplier;
            });

            // Добавляем новую запись с нутриентами
            const { error } = await supabase
                .from('meal_journal')
                .insert([{
                    user_id: user.id,
                    meal_type: selectedMealType,
                    journal_date: date.toISOString().split('T')[0],
                    recipe_id: recipe.id,
                    calories: Math.round(totalCalories),
                    proteins: Math.round(totalProteins),
                    carbs: Math.round(totalCarbs),
                    fiber: Math.round(totalFiber)
                }]);

            if (error) {
                console.error('Error saving meal:', error);
                alert('Error saving meal.');
                return;
            }

            // Обновляем рецепт с рассчитанными нутриентами
            const updatedRecipe = {
                ...recipe,
                calories: Math.round(totalCalories),
                proteins: Math.round(totalProteins),
                carbs: Math.round(totalCarbs),
                fiber: Math.round(totalFiber)
            };

            setMeals((prev) => ({
                ...prev,
                [selectedMealType]: updatedRecipe,
            }));
            setModalVisible(false);
        } catch (error) {
            console.error('Error in selectRecipe:', error);
            alert('Error saving meal.');
        }
    };

    // Рассчитать суммарные нутриенты
    const calculateNutrition = async () => {
        let fiberSum = 0,
            proteinSum = 0,
            carbsSum = 0;

        for (const [mealType, meal] of Object.entries(meals)) {
            if (!meal) continue;

            // Получаем ингредиенты рецепта с их количествами
            const { data: ingredientsData, error } = await supabase
                .from('recipes_ingredients')
                .select(`
                    quantity,
                    ingredients:ingredient_id (
                        calories,
                        proteins,
                        carbs,
                        fiber,
                        unit
                    )
                `)
                .eq('recipe_id', meal.id);

            if (error) {
                console.error('Error fetching ingredients:', error);
                continue;
            }

            // Считаем нутриенты для каждого ингредиента
            ingredientsData.forEach(item => {
                const ingredient = item.ingredients;
                const quantity = item.quantity;
                
                // Переводим количество в граммы/мл если нужно
                let normalizedQuantity = quantity;
                if (ingredient.unit === 'ml' || ingredient.unit === 'g') {
                    normalizedQuantity = quantity;
                } else if (ingredient.unit === 'kg' || ingredient.unit === 'l') {
                    normalizedQuantity = quantity * 1000;
                } else if (ingredient.unit === 'tbsp') {
                    normalizedQuantity = quantity * 15; // 1 столовая ложка = 15 мл
                } else if (ingredient.unit === 'tsp') {
                    normalizedQuantity = quantity * 5; // 1 чайная ложка = 5 мл
                }

                // Считаем нутриенты на основе количества
                const multiplier = normalizedQuantity / 100; // Все значения в БД на 100г/мл
                fiberSum += (ingredient.fiber || 0) * multiplier;
                proteinSum += (ingredient.proteins || 0) * multiplier;
                carbsSum += (ingredient.carbs || 0) * multiplier;
            });
        }

        setNutrition({
            fiber: { current: Math.round(fiberSum), target: 30 },
            protein: { current: Math.round(proteinSum), target: 100 },
            carbs: { current: Math.round(carbsSum), target: 250 },
        });
    };

    // Рассчитать суммарные калории
    const calculateTotalCalories = async () => {
        let totalCalories = 0;

        for (const [mealType, meal] of Object.entries(meals)) {
            if (!meal) continue;

            // Получаем ингредиенты рецепта с их количествами
            const { data: ingredientsData, error } = await supabase
                .from('recipes_ingredients')
                .select(`
                    quantity,
                    ingredients:ingredient_id (
                        calories,
                        unit
                    )
                `)
                .eq('recipe_id', meal.id);

            if (error) {
                console.error('Error fetching ingredients:', error);
                continue;
            }

            // Считаем калории для каждого ингредиента
            ingredientsData.forEach(item => {
                const ingredient = item.ingredients;
                const quantity = item.quantity;
                
                // Переводим количество в граммы/мл если нужно
                let normalizedQuantity = quantity;
                if (ingredient.unit === 'ml' || ingredient.unit === 'g') {
                    normalizedQuantity = quantity;
                } else if (ingredient.unit === 'kg' || ingredient.unit === 'l') {
                    normalizedQuantity = quantity * 1000;
                } else if (ingredient.unit === 'tbsp') {
                    normalizedQuantity = quantity * 15; // 1 столовая ложка = 15 мл
                } else if (ingredient.unit === 'tsp') {
                    normalizedQuantity = quantity * 5; // 1 чайная ложка = 5 мл
                }

                // Считаем калории на основе количества
                const multiplier = normalizedQuantity / 100; // Все значения в БД на 100г/мл
                totalCalories += (ingredient.calories || 0) * multiplier;
            });
        }

        setCalories(Math.round(totalCalories));
    };

    useEffect(() => {
        calculateNutrition();
        calculateTotalCalories();
    }, [meals]);

    // Удалить прием пищи
    const removeMeal = async (mealType) => {
        if (!user) {
            alert('Please log in first!');
            return;
        }

        try {
            const { error } = await supabase
                .from('meal_journal')
                .delete()
                .eq('user_id', user.id)
                .eq('journal_date', date.toISOString().split('T')[0])
                .eq('meal_type', mealType);

            if (error) {
                console.error('Error removing meal:', error);
                alert('Error removing meal.');
                return;
            }

            setMeals((prev) => ({ ...prev, [mealType]: null }));
        } catch (error) {
            console.error('Error in removeMeal:', error);
            alert('Error removing meal.');
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
                <View style={styles.caloriesContainer}>
                    <Text style={styles.caloriesLabel}>Total Calories:</Text>
                    <Text style={styles.caloriesValue}>{calories} kcal</Text>
                </View>
                
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
                                color="#4c60ff"
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
                                    onPress={() => removeMeal(mealType)}
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
            <TouchableOpacity style={styles.saveButton} onPress={() => {}}>
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
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.recipeImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.recipeInfo}>
                                        <Text style={styles.recipeName}>{item.name}</Text>
                                        <Text style={styles.recipeDescription}>{item.description}</Text>
                                        <View style={styles.recipeNutrition}>
                                            <Text style={styles.recipeCalories}>{item.calories} kcal</Text>
                                            <Text style={styles.recipeMacros}>
                                                P: {item.proteins}g C: {item.carbs}g F: {item.fiber}g
                                            </Text>
                                        </View>
                                    </View>
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
    caloriesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    caloriesLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginRight: 8,
    },
    caloriesValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4c60ff',
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
        alignItems: 'center',
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    recipeInfo: {
        flex: 1,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    recipeDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    recipeNutrition: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recipeCalories: {
        fontSize: 14,
        color: '#4c60ff',
        fontWeight: '600',
        marginRight: 8,
    },
    recipeMacros: {
        fontSize: 12,
        color: '#666',
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
