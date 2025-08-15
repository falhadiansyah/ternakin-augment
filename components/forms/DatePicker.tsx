import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeToLocalDate, toYMDLocal } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  mode = 'date',
}: DatePickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      return toYMDLocal(date);
    } else if (mode === 'time') {
      return date.toLocaleTimeString();
    } else {
      return date.toLocaleString();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      onChange(normalizeToLocalDate(selectedDate));
    }
  };

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
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.inputText, { color: colors.text }]}>
          {formatDate(value)}
        </Text>
        <Ionicons name="calendar" size={20} color={colors.icon} />
      </TouchableOpacity>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={[styles.iosPickerButton, { color: colors.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
  iosPicker: {
    backgroundColor: 'white',
  },
  iosPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
});
