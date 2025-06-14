import React, { useState } from "react";
import { Image, Alert, Text} from "react-native";
import  NavigationLink from "../components/NavigationLink";
import styled from "styled-components/native";
import { useUser } from '../context/UserContext';
import { supabase } from "../supabaseClient.js";

const LoginScreen = ({ navigation }) => {
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) {
                if (error.message.includes("Email not confirmed")) {
                    Alert.alert("Confirm Email", "Please confirm your email before start");
                } else {
                    Alert.alert("Login Failed", error.message);
                }

            } else {
                const userId = data.user.id;

                const { data: userData, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (fetchError) {
                    Alert.alert("Error", "Could not fetch user data: " + fetchError.message);
                    return;
                }

                const user = {
                    email: data.user.email,
                    id: data.user.id,
                    username: userData?.username || '',
                    avatar: userData?.avatar || '',
                    bio: userData?.bio || '',
                };
                console.log('Setting user data:', user);
                setUser(user);
                navigation.navigate("AppTabs");
            }
        } catch (error) {
            Alert.alert("Login Failed", error.message);
        }
    };

    return (
        <Container>
            <ImageContainer>
                <Image source={require("../assets/login.png")} style={{ width: 150, height: 150 }} resizeMode="contain" />
            </ImageContainer>

            <Title>Login</Title>

            <InputLabel>Email</InputLabel>
            <InputField
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <InputLabel>Password</InputLabel>
            <InputField
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <ContinueButton onPress={handleLogin}>
                <ContinueButtonText>Continue</ContinueButtonText>
            </ContinueButton>

            <FooterText>
                <Text>
                    Don't have an account? <NavigationLink screenName={"Register"}> Register here </NavigationLink>
                </Text>
            </FooterText>
        </Container>
    );
};

const Container = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  padding: 40px 20px;
`;

const ImageContainer = styled.View`
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 26px;
  font-weight: bold;
  color: #222;
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  align-self: flex-start;
  font-size: 16px;
  color: #555;
  margin-bottom: 5px;
`;

const InputField = styled.TextInput`
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 15px;
`;

const ContinueButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: #4c60ff;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

const ContinueButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const FooterText = styled.Text`
  margin-top: 15px;
  font-size: 14px;
  color: #333;
`;

export default LoginScreen;
