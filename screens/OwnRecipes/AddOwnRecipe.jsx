import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, Chip } from 'react-native-paper';
import { supabase } from '../../supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const AddOwnRecipeScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [steps, setSteps] = useState(['']);
    const [servings, setServings] = useState(2);
    const [tips, setTips] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [time, setTime] = useState(0);
    const [occasion, setOccasion] = useState('');
    const [imageUri, setImageUri] = useState(null);
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

        try {
            setUploading(true);
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const fileName = `${Date.now()}-recipe.jpg`;
            const { data, error } = await supabase.storage
                .from('recipes')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                });

            if (error) {
                throw error;
            }

            const { data: publicUrlData } = supabase.storage
                .from('recipes')
                .getPublicUrl(fileName);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !ingredients.trim()) return alert('Please fill required fields.');

        const imageUrl = await uploadImage();

        const { error } = await supabase.from('users_own_recipes').insert([
            {
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
            }
        ]);

        if (error) {
            console.error(error);
            alert('Error saving recipe');
        } else {
            alert('Recipe saved!');
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="titleLarge">Add Own Recipe</Text>
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

            <Button mode="contained" style={styles.saveButton} onPress={handleSubmit}>
                Save
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
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

export default AddOwnRecipeScreen;
