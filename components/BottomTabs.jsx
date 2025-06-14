import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import MainScreen from '../screens/MainScreen';
import PlanScreen from '../screens/PlanScreen';
import LearnScreen from '../screens/Articles/ArticlesScreen';
import { Ionicons } from '@expo/vector-icons';
import FoodDiary from "../screens/FoodDiary";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case 'Cook': iconName = 'restaurant'; break;
                        case 'Plan': iconName = 'calendar'; break;
                        case 'Journal': iconName = 'document-text'; break;
                        case 'Articles': iconName = 'book'; break;
                        case 'Profile': iconName = 'person'; break;
                        default: iconName = 'help-circle';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                },
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 5,
                    paddingTop: 5,
                },
                tabBarActiveTintColor: '#4c60ff',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen 
                name="Cook" 
                component={MainScreen}
                options={{
                    title: 'Cook'
                }}
            />
            <Tab.Screen 
                name="Plan" 
                component={PlanScreen}
                options={{
                    title: 'Plan'
                }}
            />
            <Tab.Screen 
                name="Journal" 
                component={FoodDiary}
                options={{
                    title: 'Journal'
                }}
            />
            <Tab.Screen 
                name="Articles" 
                component={LearnScreen}
                options={{
                    title: 'Articles'
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                    title: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabs;
