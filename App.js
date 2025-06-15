import Navigation from "./screens/Navigation";
import { NavigationContainer } from '@react-navigation/native';
import {UserProvider} from "./context/UserContext";
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

console.log('App.js: started');

export default function App() {
    const colorScheme = useColorScheme();
  return (
      <UserProvider>
          <NavigationContainer>
          <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
              <Navigation/>
          </NavigationContainer>
      </UserProvider>
  );
}
