import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Modal from '@/components/ui/Modal';

interface PickerOption {
  label: string;
  value: string;
}

interface PickerProps {
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function Picker({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select an option',
  error,
}: PickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setShowModal(false);
  };

  const renderOption = ({ item }: { item: PickerOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        { borderBottomColor: colors.border },
        item.value === value && { backgroundColor: colors.secondary },
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[styles.optionText, { color: colors.text }]}>
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        onPress={() => setShowModal(true)}
      >
        <Text
          style={[
            styles.inputText,
            { color: selectedOption ? colors.text : colors.icon },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.icon} />
      </TouchableOpacity>
      
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={label}
      >
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item) => item.value}
          style={styles.optionsList}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
