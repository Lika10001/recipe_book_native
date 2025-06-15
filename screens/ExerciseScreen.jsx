import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExerciseScreen({ route, navigation }) {
  const { exercise } = route.params;
  const [started, setStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(exercise?.duration_minutes * 60); 

  const getAdvices = () => {
    const intensity = exercise?.intensity?.toLowerCase();
    const advices = {
      low: [
        "Start with a light warm-up for 5 minutes",
        "Keep your breathing steady and controlled",
        "Take breaks if needed, but try to maintain a consistent pace",
        "Stay hydrated throughout the exercise",
        "Focus on proper form rather than speed"
      ],
      medium: [
        "Warm up properly for 7-10 minutes before starting",
        "Maintain a moderate pace that challenges you but doesn't exhaust you",
        "Take short breaks between sets if needed",
        "Keep track of your heart rate to ensure you're in the target zone",
        "Stay hydrated and consider electrolyte replacement if sweating heavily"
      ],
      high: [
        "Ensure a thorough warm-up of 10-15 minutes",
        "Push yourself but listen to your body's signals",
        "Take strategic breaks to maintain intensity",
        "Focus on proper breathing techniques",
        "Stay hydrated and consider energy supplements for longer sessions",
        "Cool down properly after the workout"
      ]
    };

    return advices[intensity] || [
      "Start with a proper warm-up",
      "Maintain good form throughout the exercise",
      "Stay hydrated",
      "Listen to your body and take breaks when needed",
      "Cool down after the workout"
    ];
  };

  useEffect(() => {
    let timer;
    if (started && remainingTime > 0) {
      timer = setInterval(() => setRemainingTime(prev => prev - 1), 1000);
    } else if (remainingTime === 0) {
      setStarted(false);
    }
    return () => clearInterval(timer);
  }, [started, remainingTime]);

  const getIntensityColor = () => {
    switch (exercise?.intensity?.toLowerCase()) {
      case 'low': return '#90BE6D';
      case 'medium': return '#F9C74F';
      case 'high': return '#F94144';
      default: return '#ccc';
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: exercise?.image_url }} style={styles.image} />
        <IconButton
          icon="arrow-left"
          size={24}
          style={styles.backButton}
          iconColor="#4B3D69"
          onPress={() => navigation.goBack()}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{exercise?.name}</Text>
        <Text style={styles.description}>{exercise?.description}</Text>

        <View style={styles.infoBlock}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#231942" />
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{exercise?.duration_minutes} min</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="fire" size={20} color="#E63946" />
            <Text style={styles.infoLabel}>Calories</Text>
            <Text style={styles.infoValue}>{exercise?.calories_burnt} kcal</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="pulse" size={20} color={getIntensityColor()} />
            <Text style={styles.infoLabel}>Intensity</Text>
            <Text style={[styles.infoValue, { color: getIntensityColor() }]}>
              {exercise?.intensity?.charAt(0).toUpperCase() + exercise?.intensity?.slice(1) || 'Unknown'}
            </Text>
          </View>
        </View>

        {started && (
          <View style={styles.timerBox}>
            <MaterialCommunityIcons name="timer-outline" size={24} color="#4B3D69" />
            <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            if (!started) setRemainingTime(exercise?.duration_minutes * 60);
            setStarted(!started);
          }}
          style={[styles.startButton, started && styles.stopButton]}
        >
          <Text style={styles.buttonText}>{started ? 'Stop' : 'Start exercise'}</Text>
        </TouchableOpacity>

        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Advices</Text>
            {getAdvices().map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    imageContainer: { position: 'relative' },
    image: { width: '100%', height: 280 },
    backButton: { position: 'absolute', top: 35, left: 16, backgroundColor: '#fff' },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '700', color: '#231942', marginBottom: 10 },
    description: { fontSize: 16, color: '#4B3D69', lineHeight: 20, marginBottom: 16 },
    infoBlock: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 16,
    },
    infoItem: { alignItems: 'center', flex: 1 },
    infoLabel: { fontSize: 14, color: '#999', marginTop: 4 },
    infoValue: { fontSize: 16, fontWeight: '600', marginTop: 2 },
    tipsCard: {
      borderRadius: 16,
      backgroundColor: '#FFF',
      marginTop: 24,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#231942' },
    tipText: { fontSize: 16, color: '#4B3D69', marginBottom: 6 },
    startButton: {
      backgroundColor: '#4c60ff',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    stopButton: {
      backgroundColor: '#e63946',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    timerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f2f2f2',
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    timerText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
      color: '#231942',
    },
  });
  