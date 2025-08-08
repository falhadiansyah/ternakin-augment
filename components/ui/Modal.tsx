import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { ModalProps } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal as RNModal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Modal({ visible, onClose, title, children }: ModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </RNModal>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
});
