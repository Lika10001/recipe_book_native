import Navigation from "./screens/Navigation";
import { NavigationContainer } from '@react-navigation/native';
import {UserProvider} from "./context/UserContext";

console.log('App.js: started');

export default function App() {
  return (
      <UserProvider>
          <NavigationContainer>
              <Navigation/>
          </NavigationContainer>
      </UserProvider>
  );
}
