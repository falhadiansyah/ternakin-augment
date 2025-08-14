# Subscription Features

## Overview
The Ternakin app now includes subscription-based data limits to provide different service tiers for users.

## Subscription Levels

### Free Trial
- **Batches/Livestock**: Maximum 50 data entries
- **Feed Recipes**: Maximum 50 data entries
- **Features**: Basic functionality with data limitations
- **Upgrade Path**: Available to Basic or Pro plans

### Basic Plan
- **Batches/Livestock**: Maximum 200 data entries
- **Feed Recipes**: Maximum 200 data entries
- **Features**: Enhanced functionality with moderate data limitations
- **Upgrade Path**: Available to Pro plan

### Pro Plan
- **Batches/Livestock**: Unlimited data entries
- **Feed Recipes**: Unlimited data entries
- **Features**: Full functionality with no data limitations
- **Upgrade Path**: Top tier plan

## Implementation Details

### Database Schema
The subscription level is stored in the `farms` table:
```sql
subscription_level varchar(100) not null default 'freetrial'
```

### API Functions
- `canAddBatch()`: Checks if user can add new batches based on subscription
- `canAddRecipe()`: Checks if user can add new recipes based on subscription
- `listBatches()`: Returns limited data based on subscription level
- `listRecipes()`: Returns limited data based on subscription level

### Frontend Components
- **SubscriptionWarning**: Displays current usage and upgrade prompts
- **Livestock Screen**: Shows subscription info and limits add button
- **Feeding Screen**: Shows subscription info and limits add button
- **Form Screens**: Prevents creation when limits are reached

### User Experience Features
1. **Visual Indicators**: Clear display of current usage vs. limits
2. **Proactive Warnings**: Shows warnings when approaching limits (80% capacity)
3. **Disabled Actions**: Add buttons are disabled when limits are reached
4. **Upgrade Prompts**: Easy access to upgrade information
5. **Toast Messages**: Clear feedback when limits prevent actions

## Usage Examples

### Checking Subscription Limits
```typescript
const subscriptionCheck = await canAddBatch();
if (!subscriptionCheck.canAdd) {
  showToast('Cannot add more batches. Upgrade to Pro plan.', 'error');
  return;
}
```

### Displaying Subscription Info
```typescript
<SubscriptionWarning
  subscriptionLevel={subscriptionInfo.subscriptionLevel}
  currentCount={subscriptionInfo.currentCount}
  maxAllowed={subscriptionInfo.maxAllowed}
  dataType="batches"
  onUpgrade={() => handleUpgrade()}
/>
```

## Migration Notes
- Existing users default to 'freetrial' subscription level
- Data limits are enforced at the API level
- Existing data beyond limits is preserved but not displayed
- Users can upgrade to access all their data

## Future Enhancements
- Payment integration for plan upgrades
- Usage analytics and reporting
- Custom plan configurations
- Bulk data import/export limits
- Team collaboration features by plan
