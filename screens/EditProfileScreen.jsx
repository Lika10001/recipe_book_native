import React, { useState } from 'react';
import {
    View, TextInput, Image, Alert, TouchableOpacity, Text, StyleSheet, Platform
} from 'react-native';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }) {
    const { user, setUser } = useUser();

    const SUPABASE_URL = 'https://bxueeprixycxsqyzdmqk.supabase.co';
    const STORAGE_BUCKET = 'avatars';

    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');

    const pickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Разрешение нужно', 'Доступ к галерее обязателен');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            const uri = asset.uri;
            const fileName = `${user.id}/${Date.now()}.jpg`;

            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: fileName,
                type: 'image/jpeg',
            });

            console.log('Uploading file:', fileName);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, formData, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                Alert.alert('Ошибка загрузки', uploadError.message);
                return;
            }

            console.log('Upload successful:', uploadData);

            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);

            console.log('Public URL:', publicUrl);

            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar: publicUrl })
                .eq('id', user.id);

            if (updateError) {
                console.error('Update error:', updateError);
                Alert.alert('Ошибка БД', updateError.message);
                return;
            }

            setAvatar(publicUrl);
            setUser({ ...user, avatar: publicUrl });
            Alert.alert('Успех', 'Аватар успешно обновлен');
        } catch (err) {
            console.error('Error in pickAvatar:', err);
            Alert.alert('Ошибка', err.message);
        }
    };

    const handleSave = async () => {
        const { error } = await supabase
            .from('users')
            .update({ username, bio, avatar })
            .eq('id', user.id);

        if (error) {
            Alert.alert('Ошибка', error.message);
        } else {
            setUser({ ...user, username, bio, avatar });
            navigation.goBack();
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Удалить аккаунт',
            'Вы точно хотите удалить аккаунт? Это действие необратимо.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.auth.admin.deleteUser(user.id);
                        if (error) {
                            Alert.alert('Ошибка удаления', error.message);
                        } else {
                            setUser(null);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        }
                    },
                },
            ]
        );
    };

    const getInitial = () => username?.charAt(0)?.toUpperCase() || '?';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Account</Text>
            </View>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>{getInitial()}</Text>
                    </View>
                )}
                <TouchableOpacity onPress={pickAvatar}>
                    <Text style={styles.changePicture}>Change picture</Text>
                </TouchableOpacity>
            </View>

            {/* Inputs */}
            <Text style={styles.label}>User Name</Text>
            <TextInput value={username} onChangeText={setUsername} style={styles.input} />

            <Text style={styles.label}>About (Bio)</Text>
            <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={[styles.input, { height: 80 }]}
            />

            <TouchableOpacity onPress={handleDeleteAccount}>
                <Text style={styles.deleteText}>Delete account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingLeft: 24,
        paddingTop: 35,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 12,
        color: '#1C1C1E',
    },
    avatarWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#7F7FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 40,
        color: '#fff',
        fontWeight: '600',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    changePicture: {
        marginTop: 10,
        color: '#333',
        fontSize: 16,
    },
    label: {
        fontSize: 14,
        color: '#6F6F6F',
        marginBottom: 4,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 20,
        paddingVertical: 8,
        fontSize: 16,
    },
    deleteText: {
        color: '#B277FF',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 30,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#EAE5FF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#1C1C1E',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
