import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';
import { useUser } from '../../context/UserContext';

const RecipeForm = ({ recipeId, onSave, initialData = null }) => {
    const { user } = useUser();
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [ingredients, setIngredients] = useState(initialData?.ingredients?.join(', ') || '');
    const [steps, setSteps] = useState(initialData?.steps || ['']);
    const [servings, setServings] = useState(initialData?.servings || 2);
    const [tips, setTips] = useState(initialData?.tips || '');
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || '');
    const [time, setTime] = useState(initialData?.cooking_time || 0);
    const [occasion, setOccasion] = useState(initialData?.occasion || '');
    const [imageUri, setImageUri] = useState(initialData?.image_url || null);
    const [uploading, setUploading] = useState(false);

    const handleAddStep = () => setSteps([...steps, '']);
    const handleStepChange = (text, index) => {
        const updated = [...steps];
        updated[index] = text;
        setSteps(updated);
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!imageUri) return null;
        
        // Если это URL, а не локальный файл, значит изображение уже загружено
        if (imageUri.startsWith('http')) {
            return imageUri;
        }

        try {
            setUploading(true);
            console.log('Starting image upload for URI:', imageUri);

            // Создаем временный файл
            const tempFileUri = `${FileSystem.cacheDirectory}temp_${Date.now()}.jpg`;
            await FileSystem.copyAsync({
                from: imageUri,
                to: tempFileUri
            });

            console.log('Copied to temp file:', tempFileUri);

            // Читаем файл как base64
            const base64 = await FileSystem.readAsStringAsync(tempFileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Удаляем временный файл
            await FileSystem.deleteAsync(tempFileUri);

            const fileName = `${user.id}/${Date.now()}-recipe.jpg`;
            console.log('Uploading image:', fileName);

            // Конвертируем base64 в Uint8Array
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const { data, error } = await supabase.storage
                .from('ownrecipes')
                .upload(fileName, bytes, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }

            console.log('Upload successful:', data);

            const { data: { publicUrl } } = supabase.storage
                .from('ownrecipes')
                .getPublicUrl(fileName);

            console.log('Public URL:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image: ' + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            alert('You must be logged in to create a recipe');
            return;
        }

        if (!title || !ingredients.trim()) {
            alert('Please fill required fields.');
            return;
        }

        try {
            setUploading(true);
            let imageUrl = initialData?.image_url || null;
            
            // Загружаем новое изображение только если оно было изменено
            if (imageUri && imageUri !== initialData?.image_url) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    throw new Error('Failed to upload image');
                }
            }

            const recipeData = {
                user_id: user.id,
                title,
                description,
                servings,
                ingredients: ingredients.split(',').map((i) => i.trim()),
                steps,
                tips,
                difficulty,
                cooking_time: time,
                occasion,
                image_url: imageUrl
            };

            if (onSave) {
                await onSave(recipeData);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="titleLarge">{recipeId ? 'Edit Recipe' : 'Add Own Recipe'}</Text>
            <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput label="Description (optional)" value={description} onChangeText={setDescription} style={styles.input} />

            <Button icon="image" mode="outlined" onPress={pickImage} style={{ marginTop: 16 }}>
                {imageUri ? 'Change Image' : 'Add Image'}
            </Button>

            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 12 }}
                    resizeMode="cover"
                />
            )}

            <View style={styles.row}>
                <Button mode="outlined" onPress={() => setServings(Math.max(1, servings - 1))}>-</Button>
                <Text style={{ marginHorizontal: 12 }}>{servings} servings</Text>
                <Button mode="outlined" onPress={() => setServings(servings + 1)}>+</Button>
            </View>

            <TextInput
                label="Ingredients (comma separated)"
                value={ingredients}
                onChangeText={setIngredients}
                style={styles.input}
            />
            <Text style={styles.warning}>This field is required to create your recipe</Text>

            <Text variant="titleMedium">Instructions</Text>
            {steps.map((step, index) => (
                <TextInput
                    key={index}
                    label={`Step ${index + 1}`}
                    value={step}
                    onChangeText={(text) => handleStepChange(text, index)}
                    style={styles.input}
                />
            ))}
            <Button icon="plus" onPress={handleAddStep}>Add Step</Button>

            <TextInput label="Tips & Tricks (optional)" value={tips} onChangeText={setTips} style={styles.input} />

            <Text variant="titleMedium">Difficulty</Text>
            <View style={styles.chipRow}>
                {['Easy', 'Medium', 'High'].map((level) => (
                    <Chip
                        key={level}
                        selected={difficulty === level}
                        onPress={() => setDifficulty(level)}
                        style={styles.chip}
                    >
                        {level}
                    </Chip>
                ))}
            </View>

            <View style={styles.row}>
                <Button mode="outlined" onPress={() => setTime(Math.max(0, time - 5))}>-</Button>
                <Text style={{ marginHorizontal: 12 }}>{time} minutes</Text>
                <Button mode="outlined" onPress={() => setTime(time + 5)}>+</Button>
            </View>

            <Text variant="titleMedium">Occasion</Text>
            <View style={styles.chipRow}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map((item) => (
                    <Chip
                        key={item}
                        selected={occasion === item}
                        onPress={() => setOccasion(item)}
                        style={styles.chip}
                    >
                        {item}
                    </Chip>
                ))}
            </View>

            <Button 
                mode="contained" 
                style={styles.saveButton} 
                onPress={handleSubmit}
                loading={uploading}
                disabled={uploading}
            >
                {recipeId ? 'Save Changes' : 'Save Recipe'}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 30,
        paddingBottom: 50,
    },
    input: {
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginVertical: 8,
    },
    chip: {
        marginRight: 8,
        marginVertical: 4,
    },
    warning: {
        color: 'red',
        marginBottom: 8,
    },
    saveButton: {
        marginTop: 24,
    },
});

export default RecipeForm; 