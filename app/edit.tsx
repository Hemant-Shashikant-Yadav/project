import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import useTimerStore from '@/store/timerStore';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB',
];

export default function EditScreen() {
  const { id } = useLocalSearchParams(); // Get the timer id from params
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { timers, updateTimer } = useTimerStore(); // Store for timers

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Load timer data when the component is mounted
  useEffect(() => {
    const timer = timers.find((t) => t.id === id); // Find the timer by id
    if (!timer) {
      router.back(); // If the timer doesn't exist, go back
      return;
    }

    setName(timer.name);
    setDescription(timer.description || '');
    setHours(Math.floor(timer.duration / 3600).toString());
    setMinutes(Math.floor((timer.duration % 3600) / 60).toString());
    setSeconds(Math.floor(timer.duration % 60).toString());
    setSelectedColor(timer.color);
    setIsLoading(false);
  }, [id]); // Remove timers dependency

  // Handle input changes
  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
  };

  const handleHoursChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    setHours(numericValue);
  };

  const handleMinutesChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (parseInt(numericValue) < 60) {
      // Limit to 59 minutes
      setMinutes(numericValue);
    }
  };

  const handleSecondsChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (parseInt(numericValue) < 60) {
      // Limit to 59 seconds
      setSeconds(numericValue);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert('Please enter a timer name');
      return;
    }

    // Calculate total seconds from hours, minutes, and seconds
    const totalSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    if (totalSeconds === 0) {
      alert('Please set a duration for the timer');
      return;
    }

    const timer = timers.find((t) => t.id === id);
    if (!timer) {
      alert('Timer not found');
      return;
    }

    // Update the timer in the store
    await updateTimer(timer.id, {
      name: name.trim(),
      description: description.trim(),
      duration: totalSeconds,
      remainingTime: totalSeconds, // Reset remaining time when updating
      color: selectedColor,
    });

    router.back(); // Navigate back after updating
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Timer',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
              },
            ]}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Timer name"
            placeholderTextColor="#666"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Description (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Add a description"
            placeholderTextColor="#666"
            multiline
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Duration</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                  },
                ]}
                value={hours}
                onChangeText={handleHoursChange}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                hours
              </Text>
            </View>

            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                  },
                ]}
                value={minutes}
                onChangeText={handleMinutesChange}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                min
              </Text>
            </View>

            <View style={styles.durationInput}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                  },
                ]}
                value={seconds}
                onChangeText={handleSecondsChange}
                keyboardType="number-pad"
                maxLength={2}
                editable={!isLoading}
              />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                sec
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.updateButton, { backgroundColor: selectedColor }]}
          onPress={handleUpdate}
        >
          <Text style={styles.updateButtonText}>Update Timer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  timeLabel: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: 'white',
  },
  updateButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
