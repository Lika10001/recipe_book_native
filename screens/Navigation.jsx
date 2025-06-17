import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import BottomTabs from '../components/BottomTabs';
import ProfileScreen from "./ProfileScreen";
import EditProfileScreen from "./EditProfileScreen";
import {UserProvider, useUser} from "../context/UserContext";
import RecipeDetails from "./RecipeDetails";
import ArticleDetail from "./Articles/ArticleDetails";
import CategoryRecipesScreen from "./CategoryRecipesScreen";
import FilteredRecipesScreen from "./FilteredRecipesScreen";
import FilterModal from "./FilterModal";
import AddOwnRecipeScreen from "./OwnRecipes/AddOwnRecipe";
import EditOwnRecipeScreen from "./OwnRecipes/EditOwnRecipeScreen";
import OwnRecipeDetailsScreen from "./OwnRecipes/OwnRecipeDetailsScreen";
import SearchScreen from "./SearchScreen";
import ExerciseScreen from "./ExerciseScreen";

const Stack = createNativeStackNavigator();
console.log('Navigation component mounted');

export default function Navigation() {
    const { user } = useUser();
    console.log('user context:', user);
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="AppTabs" component={BottomTabs} />
                    <Stack.Screen name="OwnRecipeDetails" component={OwnRecipeDetailsScreen} options={{ title: 'Own Recipe' }} />
                    <Stack.Screen name="EditOwnRecipe" component={EditOwnRecipeScreen} options={{ title: 'Edit Recipe' }} />
    
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}

            <Stack.Screen name="ArticleDetails" component={ArticleDetail} options={{title: "Article Details"}}/>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{title: "Profile"}}/>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{title: "EditProfile"}}/>
            <Stack.Screen name="RecipeDetails" component={RecipeDetails} options={{title: "RecipeDetails"}}/>
            <Stack.Screen name="CategoryRecipes" component={CategoryRecipesScreen} options={{title: "CategoryRecipes"}}/>
            <Stack.Screen name="FilteredRecipes" component={FilteredRecipesScreen} options={{ title: 'Found Recipes' }} />
            <Stack.Screen name="FilterModal" component={FilterModal} options={{ title: 'Filters' }} />
            <Stack.Screen name="AddOwnRecipe" component={AddOwnRecipeScreen} options={{ title: 'Add Recipe' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Recipes' }} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ title: 'Exercise' }} />
        </Stack.Navigator>
    );
}