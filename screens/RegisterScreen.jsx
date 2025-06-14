import React, { useState } from "react";
import {Image, Alert, TouchableOpacity} from "react-native";
import styled from "styled-components/native";
import {supabase} from "../supabaseClient.js";
import { useUser } from '../context/UserContext';
import NavigationLink from "../components/NavigationLink";

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState("");
    const { setUser } = useUser();

    const validateLogin = (login) => {
        return login.length >= 6 && login.length <= 10;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleRegister = async () => {
        if (!email || !password || !login) {
            Alert.alert("Ошибка", "Введите email, логин и пароль");
            return;
        }

        if (!validateLogin(login)) {
            Alert.alert("Ошибка!", "Введите логин длиной минимум 6 символов");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Ошибка", "Введите корректный email!");
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert("Ошибка", "Пароль должен содержать минимум 6 символов!");
            return;
        }
        try {
            const { data: existingUsers, error: checkError } = await supabase
                .from('users')
                .select('*')
                .eq('username', login);

            if (checkError) {
                throw checkError;
            }

            if (existingUsers.length > 0) {
                Alert.alert('Ошибка', 'Такой логин уже используется. Попробуйте другой.');
                return;
            }

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    Alert.alert("Ошибка", "Пользователь с таким email уже существует!");
                } else {
                    Alert.alert("Ошибка", signUpError.message);
                }
                return;
            }

            const userId = signUpData.user.id;
            const user = {
                id: userId,
                username: login,
                email: email,
                created_at: new Date().toISOString(),
                avatar: '',
                bio: '',
            };

            const { error: insertError } = await supabase
                .from('users')
                .insert([user]);

            if (insertError) {
                throw insertError;
            }

            Alert.alert("Успех!", "Вы зарегистрированы");
            setUser(user);
            navigation.navigate("AppTabs");

        } catch (error) {
            Alert.alert("Ошибка", error.message);
        }
    };

    return (
        <Container>
            <ImageContainer>
                <Image source={require("../assets/register.png")} style={{ width: 150, height: 150 }} resizeMode="contain" />
            </ImageContainer>

            <Title>Register</Title>

            <InputLabel>Login</InputLabel>
            <InputField
                placeholder="Enter your login"
                value={login}
                onChangeText={setLogin}
                keyboardType="login"
            />

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

            <ContinueButton onPress={handleRegister}>
                <ContinueButtonText>Create an account</ContinueButtonText>
            </ContinueButton>

            <FooterText>
                Already have an account?
                    <NavigationLink screenName={"Login"}> Login here</NavigationLink>
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

const RegisterText = styled.Text`
  font-weight: bold;
  color: #000;
`;

const ForgotPasswordText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #000;
  margin-top: 5px;
`;

export default RegisterScreen;
