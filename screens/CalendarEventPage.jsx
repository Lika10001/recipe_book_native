import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Platform } from 'react-native';
import { useAuthRequest } from 'expo-auth-session';
import { GOOGLE_CLIENT_ID } from '../client_config.json';

const CalendarEventPage = () => {
    const [eventDetails, setEventDetails] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
    });

    const [accessToken, setAccessToken] = useState(null);

    // Аутентификация с Google
    const [request, response, promptAsync] = useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri:
            Platform.select({
                ios: 'com.googleusercontent.apps.YOUR_APP_ID:/oauth2redirect',
                android: 'com.googleusercontent.apps.YOUR_APP_ID:/oauth2redirect',
            }),
        scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    });

    // Обработка ответа от Google
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response.params;
            setAccessToken(authentication.access_token); // Сохраняем access_token
        }
    }, [response]);

    // Функция для создания события в Google Calendar
    const createEvent = async () => {
        if (!accessToken) {
            alert('Please log in first');
            return;
        }

        const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        const body = JSON.stringify({
            summary: eventDetails.title,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.startTime,
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventDetails.endTime,
                timeZone: 'UTC',
            },
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            const data = await response.json();
            if (response.ok) {
                alert('Event created successfully!');
                console.log(data);
            } else {
                alert('Error creating event');
                console.log(data);
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Create Event in Google Calendar</Text>

            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                placeholder="Event Title"
                value={eventDetails.title}
                onChangeText={(text) => setEventDetails({ ...eventDetails, title: text })}
            />

            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                placeholder="Event Description"
                value={eventDetails.description}
                onChangeText={(text) => setEventDetails({ ...eventDetails, description: text })}
            />

            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                placeholder="Start Time (ISO Format)"
                value={eventDetails.startTime}
                onChangeText={(text) => setEventDetails({ ...eventDetails, startTime: text })}
            />

            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
                placeholder="End Time (ISO Format)"
                value={eventDetails.endTime}
                onChangeText={(text) => setEventDetails({ ...eventDetails, endTime: text })}
            />

            {/* Кнопка для авторизации через Google */}
            <Button
                title="Login with Google"
                disabled={!request}
                onPress={() => promptAsync()}
            />

            {/* Кнопка для создания события в Google Calendar */}
            <Button title="Create Event" onPress={createEvent} />
        </View>
    );
};

export default CalendarEventPage;
