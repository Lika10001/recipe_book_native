import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

// Constants
const GOOGLE_CLIENT_ID = '1050883308908-mqvj2bu729dhbvar1tdgjnp543gme7sk.apps.googleusercontent.com';
const REDIRECT_URI = Platform.select({
    web: 'http://localhost:8081',
    default: 'exp://localhost:8081',
});
const BASE_URL = 'http://localhost:8081';
const APP_SCHEME = 'recipebook';

// Заглушка корзины
const dummyCart = [
    { id: '1', name: 'Tomatoes', qty: 3 },
    { id: '2', name: 'Cheese', qty: 1 },
    { id: '3', name: 'Chicken Breast', qty: 2 },
];

function getCurrentWeekDays() {
    const daysOfWeekLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = new Date();

    // Найдем текущий понедельник (в JS воскресенье = 0, понедельник = 1)
    const dayOfWeek = today.getDay(); // 0-6
    // Если сегодня воскресенье (0), понедельник будет -6 дней назад
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDays.push({
            label: daysOfWeekLabels[date.getDay()],
            day: date.getDate(),
            fullDate: date.toISOString().slice(0, 10) // опционально: полный формат YYYY-MM-DD
        });
    }
    return weekDays;
}

// Auth Status Component
const AuthStatus = ({ accessToken, onPress }) => {
    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={styles.authButton}
        >
            <View style={styles.authContent}>
                <Ionicons 
                    name={accessToken ? "checkmark-circle" : "log-in"} 
                    size={24} 
                    color={accessToken ? "#4CAF50" : "#FF7A5C"} 
                />
                <Text style={styles.authText}>
                    {accessToken ? "Connected to Google Calendar" : "Connect Google Calendar"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default function PlanScreen() {
    const { user } = useUser();
    const [selectedDay, setSelectedDay] = useState(9);
    const [modalVisible, setModalVisible] = useState(false);

    const [cartVisible, setCartVisible] = useState(false);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [accessToken, setAccessToken] = useState(null);

    const [eventType, setEventType] = useState(null);
    const [eventFilter, setEventFilter] = useState('all'); // 'all', 'cook', 'shopping'

    // Данные события
    const [eventDetails, setEventDetails] = useState({
        title: '',
        description: '',
        startDate: null,
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // +1 час по умолчанию
    });

    // Для показа DateTimePicker
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // События, созданные на странице
    const [createdEvents, setCreatedEvents] = useState([]);

    // Google OAuth configuration
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: [
            'openid',
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar',
        ],
        redirectUri: REDIRECT_URI,
        responseType: 'token',
        usePKCE: true,
        useProxy: Platform.OS !== 'web',
    });

    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation();

    const fetchCartItems = async () => {
        try {
            const { data, error } = await supabase
                .from('ingredient_cart')
                .select(`
                    ingredient_id,
                    quantity,
                    ingredients:ingredient_id (
                        id,
                        name,
                        image_url,
                        unit
                    )
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching cart:', error);
                return;
            }

            console.log('Cart items:', data); // Добавим для отладки
            setCartItems(data || []);
        } catch (err) {
            console.error('Error in fetchCartItems:', err);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchCartItems();
        }
    }, [user]);

    // Добавим обновление корзины при фокусе на экране
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (user?.id) {
                fetchCartItems();
            }
        });

        return unsubscribe;
    }, [navigation, user]);

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            setAccessToken(authentication.accessToken);
            Alert.alert('Success', 'Successfully connected to Google Calendar!');
        } else if (response?.type === 'error') {
            console.error('Auth Error:', response.error);
            Alert.alert(
                'Authentication Error',
                `Failed to connect to Google Calendar: ${response.error?.message || 'Unknown error'}`
            );
        }
    }, [response]);

    // Обновляем дату начала события при выборе дня
    useEffect(() => {
        const now = new Date();
        const baseDate = new Date(now.getFullYear(), now.getMonth(), selectedDay);

        setEventDetails((prev) => {
            const startTime = prev.startTime || new Date();
            const endTime = prev.endTime || new Date(startTime.getTime() + 60 * 60 * 1000);

            const newStartTime = new Date(baseDate);
            newStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

            const newEndTime = new Date(baseDate);
            newEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

            return {
                ...prev,
                startDate: baseDate,
                startTime: newStartTime,
                endTime: newEndTime,
            };
        });
    }, [selectedDay]);

    // Объединяем дату и время в ISO строку для Google Calendar
    const buildISODateTime = (date, time) => {
        if (!date || !time) return null;
        const combined = new Date(date);
        combined.setHours(time.getHours());
        combined.setMinutes(time.getMinutes());
        combined.setSeconds(time.getSeconds());
        return combined.toISOString();
    };

    // Create shopping event from cart
    const createShoppingEventFromCart = () => {
        const cartItemsList = cartItems.map(item => 
            `${item.ingredients.name} (${item.quantity} ${item.ingredients.unit})`
        ).join('\n');
        
        setEventDetails(prev => ({
            ...prev,
            title: 'Shopping List',
            description: `Items to buy:\n${cartItemsList}`,
            type: 'shopping'
        }));
        setCartVisible(false);
        setEventModalVisible(true);
    };

    // Create event with loading state
    const createEvent = async () => {
        if (!accessToken) {
            Alert.alert('Authorization required', 'Please log in with Google first.');
            return;
        }
        if (!eventDetails.title) {
            Alert.alert('Fill title', 'Please enter event title.');
            return;
        }
        if (!eventDetails.startDate || !eventDetails.startTime || !eventDetails.endTime) {
            Alert.alert('Fill time', 'Please select start and end times.');
            return;
        }

        setIsLoading(true);
        try {
            const startDateTime = buildISODateTime(eventDetails.startDate, eventDetails.startTime);
            const endDateTime = buildISODateTime(eventDetails.startDate, eventDetails.endTime);

            const response = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        summary: eventDetails.title,
                        description: eventDetails.description,
                        start: { dateTime: startDateTime, timeZone: 'UTC' },
                        end: { dateTime: endDateTime, timeZone: 'UTC' },
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Event created successfully!');
                setEventModalVisible(false);

                setCreatedEvents((prev) => [
                    ...prev,
                    {
                        id: data.id || Math.random().toString(),
                        title: eventDetails.title,
                        description: eventDetails.description,
                        start: startDateTime,
                        end: endDateTime,
                        type: eventType,
                    },
                ]);

                setEventDetails({
                    title: '',
                    description: '',
                    startDate: null,
                    startTime: new Date(),
                    endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
                });
            } else {
                Alert.alert('Error', data.error?.message || 'Failed to create event');
            }
        } catch (e) {
            Alert.alert('Error', 'Network or API error');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Открыть модал для создания события
    const openEventModal = (type) => {
        setEventType(type);
        setEventModalVisible(true);
        setEventDetails((prev) => ({
            ...prev,
            title: type === 'cook' ? 'Cook meal' : 'Shopping planning',
            startDate: prev.startDate || new Date(),
            startTime: prev.startTime || new Date(),
            endTime: prev.endTime || new Date(new Date().getTime() + 60 * 60 * 1000),
            description: '',
        }));
    };

    // Обработчики для DateTimePicker
    const onChangeStartTime = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowStartPicker(false);
            return;
        }
        setShowStartPicker(false);
        if (selectedDate) {
            setEventDetails((prev) => {
                // Обновляем endTime если он меньше startTime
                let newEndTime = prev.endTime;
                if (prev.endTime <= selectedDate) {
                    newEndTime = new Date(selectedDate.getTime() + 60 * 60 * 1000);
                }
                return {
                    ...prev,
                    startTime: selectedDate,
                    endTime: newEndTime,
                };
            });
        }
    };

    const onChangeEndTime = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowEndPicker(false);
            return;
        }
        setShowEndPicker(false);
        if (selectedDate) {
            setEventDetails((prev) => {
                if (selectedDate > prev.startTime) {
                    return { ...prev, endTime: selectedDate };
                } else {
                    Alert.alert('Invalid time', 'End time must be after start time');
                    return prev;
                }
            });
        }
    };


    // Форматируем дату/время для отображения
    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleString();
    };

    // Filter events based on selected filter
    const filteredEvents = createdEvents.filter(event => {
        if (eventFilter === 'all') return true;
        return event.type === eventFilter;
    });

    // Group events by type
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        const type = event.type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(event);
        return acc;
    }, {});

    // Handle Google Calendar authentication
    const handleGoogleAuth = async () => {
        try {
            setIsLoading(true);
            const result = await promptAsync({
                useProxy: true,
                showInRecents: true,
            });
            
            if (result.type === 'error') {
                console.error('Auth Error:', result.error);
                Alert.alert(
                    'Authentication Error',
                    `Failed to connect to Google Calendar: ${result.error?.message || 'Unknown error'}`
                );
            }
        } catch (error) {
            console.error('Auth Exception:', error);
            Alert.alert(
                'Authentication Error',
                'An unexpected error occurred while connecting to Google Calendar'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromCart = async (ingredientId) => {
        try {
            const { error } = await supabase
                .from('ingredient_cart')
                .delete()
                .match({ 
                    user_id: user.id,
                    ingredient_id: ingredientId
                });
            
            if (error) {
                console.error('Error removing item from cart:', error);
                Alert.alert('Ошибка', 'Не удалось удалить ингредиент из корзины');
                return;
            }

            // Обновляем список после удаления
            setCartItems(prev => 
                prev.filter(item => item.ingredient_id !== ingredientId)
            );
        } catch (err) {
            console.error('Error in handleRemoveFromCart:', err);
            Alert.alert('Ошибка', 'Произошла ошибка при удалении ингредиента');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Meal Plan</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => openEventModal('cook')}>
                        <Ionicons name="calendar" size={38} color="#FF7A5C" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEventModal('shopping')} style={{ marginLeft: 16 }}>
                        <Ionicons name="cart" size={38} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setCartVisible(true)} style={{ marginLeft: 16 }}>
                        <Ionicons name="basket" size={38} color="#2196F3" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Auth Status */}
            <AuthStatus 
                accessToken={accessToken} 
                onPress={handleGoogleAuth} 
            />

            {/* Days selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.days}>
                {getCurrentWeekDays().map((day) => (
                    <TouchableOpacity
                        key={day.day}
                        onPress={() => setSelectedDay(day.day)}
                        style={[
                            styles.day,
                            day.day === selectedDay && styles.selectedDay,
                        ]}
                    >
                        <Text style={day.day === selectedDay ? styles.selectedDayText : styles.dayText}>
                            {day.label}
                        </Text>
                        <Text style={day.day === selectedDay ? styles.selectedDayText : styles.dayText}>
                            {day.day}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Events Container */}
            <View style={styles.eventsContainer}>
                <View style={styles.filterContainer}>
                    <Text style={styles.sectionTitle}>Events</Text>
                    <View style={styles.filterButtons}>
                        <TouchableOpacity
                            style={[styles.filterButton, eventFilter === 'all' && styles.activeFilter]}
                            onPress={() => setEventFilter('all')}
                        >
                            <Text style={[styles.filterText, eventFilter === 'all' && styles.activeFilterText]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, eventFilter === 'cook' && styles.activeFilter]}
                            onPress={() => setEventFilter('cook')}
                        >
                            <Text style={[styles.filterText, eventFilter === 'cook' && styles.activeFilterText]}>Cooking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, eventFilter === 'shopping' && styles.activeFilter]}
                            onPress={() => setEventFilter('shopping')}
                        >
                            <Text style={[styles.filterText, eventFilter === 'shopping' && styles.activeFilterText]}>Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {Object.keys(groupedEvents).length === 0 ? (
                    <Text style={styles.noEventsText}>No events yet</Text>
                ) : (
                    Object.entries(groupedEvents).map(([type, events]) => (
                        <View key={type} style={styles.eventGroup}>
                            <Text style={styles.eventGroupTitle}>
                                {type === 'cook' ? 'Cooking Events' : 'Shopping Events'}
                            </Text>
                            {events.map((evt) => (
                                <View
                                    key={evt.id}
                                    style={[
                                        styles.eventItem,
                                        evt.type === 'cook' ? styles.cookEvent : styles.shoppingEvent,
                                    ]}
                                >
                                    <View style={styles.eventHeader}>
                                        <Text style={styles.eventTitle}>{evt.title}</Text>
                                        <TouchableOpacity onPress={() => {
                                            // TODO: Implement event deletion
                                            Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
                                                { text: 'Cancel', style: 'cancel' },
                                                { 
                                                    text: 'Delete', 
                                                    style: 'destructive',
                                                    onPress: () => {
                                                        setCreatedEvents(prev => 
                                                            prev.filter(e => e.id !== evt.id)
                                                        );
                                                    }
                                                }
                                            ]);
                                        }}>
                                            <Ionicons name="trash-outline" size={20} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.eventTime}>
                                        {formatDate(evt.start)} — {formatDate(evt.end)}
                                    </Text>
                                    {evt.description ? (
                                        <Text style={styles.eventDescription}>{evt.description}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </View>

            {/* Модалка создания события */}
            <Modal visible={eventModalVisible} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>
                            {eventType === 'cook' ? 'Add Cooking Event' : 'Add Shopping Event'}
                        </Text>
                        <TextInput
                            placeholder="Event Title"
                            value={eventDetails.title}
                            onChangeText={(text) => setEventDetails((prev) => ({ ...prev, title: text }))}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description"
                            value={eventDetails.description}
                            onChangeText={(text) => setEventDetails((prev) => ({ ...prev, description: text }))}
                            style={[styles.input, { height: 60 }]}
                            multiline
                        />

                        {/* Дата не меняется, только время */}
                        <Text style={{ marginTop: 8 }}>
                            Date: {eventDetails.startDate ? eventDetails.startDate.toDateString() : ''}
                        </Text>

                        {/* Время начала */}
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timePickerBtn}>
                            <Text>Start Time: {formatTime(eventDetails.startTime)}</Text>
                        </TouchableOpacity>

                        {/* Время окончания */}
                        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timePickerBtn}>
                            <Text>End Time: {formatTime(eventDetails.endTime)}</Text>
                        </TouchableOpacity>

                        {/* DateTimePicker для времени */}
                        {showStartPicker && (
                            <DateTimePicker
                                value={eventDetails.startTime || new Date()}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={onChangeStartTime}
                            />
                        )}
                        {showEndPicker && (
                            <DateTimePicker
                                value={eventDetails.endTime || new Date()}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={onChangeEndTime}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.btn, 
                                    { backgroundColor: '#4CAF50' },
                                    isLoading && styles.disabledButton
                                ]}
                                onPress={createEvent}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Create</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: '#f44336' }]}
                                onPress={() => setEventModalVisible(false)}
                                disabled={isLoading}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Модалка корзины */}
            <Modal visible={cartVisible} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modal, { maxHeight: 400 }]}>
                        <Text style={styles.modalTitle}>Your Shopping List</Text>
                        <ScrollView style={styles.cartScrollView}>
                            {cartItems.map((item) => (
                                <View key={item.ingredient_id} style={styles.cartItem}>
                                    <Image 
                                        source={{ uri: item.ingredients.image_url }} 
                                        style={styles.cartItemImage}
                                    />
                                    <View style={styles.cartItemInfo}>
                                        <Text style={styles.cartItemName}>{item.ingredients.name}</Text>
                                        <Text style={styles.cartItemQty}>
                                            {item.quantity} {item.ingredients.unit}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => handleRemoveFromCart(item.ingredient_id)}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.cartActions}>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: '#4CAF50' }]}
                                onPress={createShoppingEventFromCart}
                                disabled={cartItems.length === 0}
                            >
                                <Text style={styles.btnText}>Create Shopping Event</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: '#2196F3' }]}
                                onPress={() => setCartVisible(false)}
                            >
                                <Text style={styles.btnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 30, backgroundColor: '#fff', paddingHorizontal: 24 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 10, },
    title: { fontSize: 26, fontWeight: 'bold', flex: 1 },
    days: { flexGrow: 0, marginBottom: 12 },
    day: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 10,
    },
    selectedDay: { backgroundColor: '#FF7A5C' },
    dayText: { color: '#666', fontWeight: '600' },
    selectedDayText: { color: '#fff', fontWeight: '700' },

    eventsContainer: {
        flex: 1,
        marginTop: 8,
    },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    eventItem: {
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    cookEvent: { backgroundColor: '#FFEBE6' },
    shoppingEvent: { backgroundColor: '#E6FFEB' },
    eventTitle: { fontWeight: '700', marginBottom: 4 },
    eventTime: { fontSize: 12, color: '#555', marginBottom: 4 },

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    timePickerBtn: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginTop: 6,
    },
    modalButtons: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        flex: 1,
        marginHorizontal: 6,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: { color: 'white', fontWeight: '700', fontSize: 16 },

    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    cartItemImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    cartItemQty: {
        fontSize: 14,
        color: '#666',
    },
    cartItemRecipe: {
        fontSize: 12,
        color: '#666',
    },
    cartActions: {
        marginTop: 16,
        gap: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authButton: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    authContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
    activeFilter: {
        backgroundColor: '#FF7A5C',
    },
    filterText: {
        color: '#666',
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#fff',
    },
    eventGroup: {
        marginBottom: 20,
    },
    eventGroupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    eventDescription: {
        color: '#666',
        marginTop: 4,
        fontSize: 14,
    },
    noEventsText: {
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    cartScrollView: {
        maxHeight: 250,
    },
    removeButton: {
        padding: 8,
        marginLeft: 8,
    },
});
