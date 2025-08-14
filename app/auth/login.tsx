import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Button, Input, Loading } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
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
      console.log('Starting Google login...');
      const result = await signInWithGoogle();
      console.log('Google login result:', result);

      if (result.data && !result.error) {
        console.log('Google login successful, redirecting...');
        router.replace('/(tabs)/dashboard');
      } else if (result.error) {
        console.error('Google login error:', result.error);
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error: any) {
      console.error('Google login exception:', error);
      Alert.alert(t('common.error'), error.message || 'Something went wrong');
    }
  };

  const handleEmailOTP = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError(t('auth.email_required'));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t('auth.valid_email_required'));
      return;
    }

    try {
      const result = await signInWithOTP(email);
      if (result.data && !result.error) {
        setStep('otp');
        Alert.alert(t('auth.otp_sent'), t('auth.otp_sent_message'));
      } else if (result.error) {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('auth.failed_to_send_otp'));
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');

    if (!otp.trim()) {
      setOtpError(t('auth.otp_required'));
      return;
    }

    if (otp.length !== 6) {
      setOtpError(t('auth.otp_must_be_6_digits'));
      return;
    }

    try {
      const result = await verifyOTP(email, otp);
      if (result.data && !result.error) {
        router.replace('/(tabs)/dashboard');
      } else if (result.error) {
        Alert.alert(t('auth.verification_error'), result.error);
      }
    } catch (error: any) {
      Alert.alert(t('auth.verification_error'), error.message || t('auth.invalid_otp'));
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
        <Loading message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logoContainer}>
          {/* Ternakin logo image */}
          {/* Replace the placeholder with actual optimized file: assets/images/ternakin-logo.png */}
          <Image
            source={require('@/assets/images/ternakin-logo.png')}
            style={{ width: 96, height: 96, borderRadius: 20, marginBottom: 0 }}
            resizeMode="contain"
          />
          <Text style={[styles.logo, { color: colors.primary }]}>
            {t('app.name')}
          </Text>
          <Text style={[styles.tagline, { color: colors.icon }]}>
            {t('app.tagline')}
          </Text>
        </View>

        {step === 'email' ? (
          <View style={styles.formContainer}>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.email_placeholder')}
              keyboardType="email-address"
              error={emailError}
            />

            <View style={styles.buttonContainer}>
              <Button
                title={t('auth.send_otp')}
                onPress={handleEmailOTP}
                loading={loading}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={[styles.otpTitle, { color: colors.text }]}>
              {t('auth.verify_email')}
            </Text>
            <Text style={[styles.otpSubtitle, { color: colors.icon }]}>
              {t('auth.otp_sent_to')} {email}
            </Text>

            <Input
              label="Verification Code"
              value={otp}
              onChangeText={setOtp}
              placeholder={t('auth.otp_placeholder')}
              keyboardType="numeric"
              error={otpError}
            />

            <View style={styles.buttonContainer}>
              <Button
                title={t('auth.verify_code')}
                onPress={handleVerifyOTP}
                loading={loading}
              />

              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToEmail}
              >
                <Text style={[styles.backButtonText, { color: colors.primary }]}>
                  {t('auth.back_to_email')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={[styles.disclaimer, { color: colors.icon }]}>
          {t('auth.terms_disclaimer')}
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
