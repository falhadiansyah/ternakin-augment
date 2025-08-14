import { Radii, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionWarningProps {
  subscriptionLevel: string;
  currentCount: number;
  maxAllowed: number;
  dataType: 'batches' | 'recipes';
  onUpgrade?: () => void;
}

export default function SubscriptionWarning({
  subscriptionLevel,
  currentCount,
  maxAllowed,
  dataType,
  onUpgrade
}: SubscriptionWarningProps) {
  const isPro = subscriptionLevel === 'pro';
  const isNearLimit = currentCount >= maxAllowed * 0.8; // Show warning at 80% capacity
  
  if (isPro) return null;
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isNearLimit ? '#fff3cd' : '#d1ecf1',
        borderColor: isNearLimit ? '#ffeaa7' : '#bee5eb'
      }
    ]}>
      <View style={styles.content}>
        <Ionicons 
          name={isNearLimit ? 'warning' : 'information-circle'} 
          size={20} 
          color={isNearLimit ? '#856404' : '#0c5460'} 
        />
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            { color: isNearLimit ? '#856404' : '#0c5460' }
          ]}>
            {isNearLimit ? 'Approaching Limit' : 'Subscription Limit'}
          </Text>
          <Text style={[
            styles.description,
            { color: isNearLimit ? '#856404' : '#0c5460' }
          ]}>
            {subscriptionLevel === 'freetrial' ? 'Free Trial' : 'Basic Plan'}: {currentCount}/{maxAllowed} {dataType}
          </Text>
        </View>
      </View>
      {onUpgrade && (
        <TouchableOpacity 
          style={[
            styles.upgradeButton,
            { backgroundColor: isNearLimit ? '#856404' : '#0c5460' }
          ]}
          onPress={onUpgrade}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.bold,
    marginBottom: 2,
  },
  description: {
    fontSize: Typography.caption,
  },
  upgradeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },
});
