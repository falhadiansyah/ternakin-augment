import { Alert, Platform, ToastAndroid } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

export function showToast(message: string, type: ToastType = 'info') {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // Fallback for iOS/web: quick alert. Could be replaced with a custom toast later
    Alert.alert(type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info', message);
  }
}

