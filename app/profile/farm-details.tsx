import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

export default function FarmDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [farmName, setFarmName] = useState('Green Valley Farm');
  const [location, setLocation] = useState('Rural County, State');
  const [description, setDescription] = useState('A sustainable livestock farm focused on quality animal care and environmental stewardship.');

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save farm details');
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Farm Details</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Farm Name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={farmName}
            onChangeText={setFarmName}
            placeholder="Enter farm name"
            placeholderTextColor={colors.icon}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter farm location"
            placeholderTextColor={colors.icon}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your farm"
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Farm Statistics</Text>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Total Livestock</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>245</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Active Batches</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>8</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Farm Age</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>3 years</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  statsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
