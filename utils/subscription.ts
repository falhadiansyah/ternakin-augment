export type SubscriptionLevel = 'freetrial' | 'basic' | 'pro';

export interface SubscriptionLimits {
  maxBatches: number;
  maxRecipes: number;
  canAddMore: boolean;
}

export function getSubscriptionLimits(subscriptionLevel: SubscriptionLevel): SubscriptionLimits {
  switch (subscriptionLevel) {
    case 'freetrial':
      return {
        maxBatches: 50,
        maxRecipes: 50,
        canAddMore: false
      };
    case 'basic':
      return {
        maxBatches: 200,
        maxRecipes: 200,
        canAddMore: false
      };
    case 'pro':
      return {
        maxBatches: Infinity,
        maxRecipes: Infinity,
        canAddMore: true
      };
    default:
      return {
        maxBatches: 50,
        maxRecipes: 50,
        canAddMore: false
      };
  }
}

export function canAddBatch(currentCount: number, subscriptionLevel: SubscriptionLevel): boolean {
  const limits = getSubscriptionLimits(subscriptionLevel);
  return currentCount < limits.maxBatches;
}

export function canAddRecipe(currentCount: number, subscriptionLevel: SubscriptionLevel): boolean {
  const limits = getSubscriptionLimits(subscriptionLevel);
  return currentCount < limits.maxRecipes;
}

export function getMaxDisplayCount(subscriptionLevel: SubscriptionLevel, dataType: 'batches' | 'recipes'): number {
  const limits = getSubscriptionLimits(subscriptionLevel);
  return dataType === 'batches' ? limits.maxBatches : limits.maxRecipes;
}
