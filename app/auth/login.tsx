import { useAuthContext } from '@/components/AuthProvider';
import { Button, Input, Loading } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signInWithGoogle, signInWithOTP, verifyOTP, loading, error } = useAuthContext();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.data && !result.error) {
        router.replace('/(tabs)/dashboard');
      } else if (result.error) {
        Alert.alert('Login Error', result.error);
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Something went wrong');
    }
  };

  const handleEmailOTP = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const result = await signInWithOTP(email);
      if (result.data && !result.error) {
        setStep('otp');
        Alert.alert('OTP Sent', 'Please check your email for the verification code');
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');

    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    try {
      const result = await verifyOTP(email, otp);
      if (result.data && !result.error) {
        router.replace('/(tabs)/dashboard');
      } else if (result.error) {
        Alert.alert('Verification Error', result.error);
      }
    } catch (error: any) {
      Alert.alert('Verification Error', error.message || 'Invalid OTP');
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setOtpError('');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading message="Authenticating..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: colors.primary }]}>
            Ternakin
          </Text>
          <Text style={[styles.tagline, { color: colors.icon }]}>
            Livestock Management Made Simple
          </Text>
        </View>

        {step === 'email' ? (
          <View style={styles.formContainer}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={emailError}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Send OTP"
                onPress={handleEmailOTP}
                loading={loading}
              />

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.icon }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={[styles.otpTitle, { color: colors.text }]}>
              Verify Your Email
            </Text>
            <Text style={[styles.otpSubtitle, { color: colors.icon }]}>
              We sent a 6-digit code to {email}
            </Text>

            <Input
              label="Verification Code"
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              error={otpError}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Verify Code"
                onPress={handleVerifyOTP}
                loading={loading}
              />

              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToEmail}
              >
                <Text style={[styles.backButtonText, { color: colors.primary }]}>
                  Back to Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={[styles.disclaimer, { color: colors.icon }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 32,
  },
});
