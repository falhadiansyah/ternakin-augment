// Business logic calculations for livestock management

export const livestockCalculations = {
  // Calculate current age in weeks from entry date
  calculateAgeInWeeks(entryDate: string): number {
    const entry = new Date(entryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entry.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  },

  // Calculate expected weight based on animal type and age
  calculateExpectedWeight(animalType: string, ageInWeeks: number): number {
    // These are example calculations - should be based on actual livestock data
    const weightGrowthRates = {
      chicken: { baseWeight: 0.05, weeklyGrowth: 0.15 }, // kg
      cattle: { baseWeight: 30, weeklyGrowth: 5 },
      goat: { baseWeight: 2, weeklyGrowth: 0.8 },
      sheep: { baseWeight: 3, weeklyGrowth: 1.2 },
      pig: { baseWeight: 1.5, weeklyGrowth: 1.8 },
    };

    const rates = weightGrowthRates[animalType.toLowerCase()] || 
                  weightGrowthRates.chicken;

    return rates.baseWeight + (rates.weeklyGrowth * ageInWeeks);
  },

  // Calculate feed requirements based on animal count and type
  calculateFeedRequirement(
    animalType: string, 
    count: number, 
    ageInWeeks: number
  ): { dailyFeed: number; dailyWater: number } {
    // Feed requirements per animal per day (kg)
    const feedRates = {
      chicken: { feedPerDay: 0.12, waterPerDay: 0.25 },
      cattle: { feedPerDay: 8, waterPerDay: 40 },
      goat: { feedPerDay: 1.5, waterPerDay: 4 },
      sheep: { feedPerDay: 2, waterPerDay: 5 },
      pig: { feedPerDay: 2.5, waterPerDay: 8 },
    };

    const rates = feedRates[animalType.toLowerCase()] || feedRates.chicken;
    
    // Adjust for age (younger animals eat less)
    const ageFactor = Math.min(1, ageInWeeks / 20); // Full requirement at 20 weeks
    const adjustedFeedRate = rates.feedPerDay * (0.3 + 0.7 * ageFactor);
    const adjustedWaterRate = rates.waterPerDay * (0.3 + 0.7 * ageFactor);

    return {
      dailyFeed: adjustedFeedRate * count,
      dailyWater: adjustedWaterRate * count,
    };
  },

  // Calculate mortality rate
  calculateMortalityRate(initialCount: number, currentCount: number): number {
    if (initialCount === 0) return 0;
    return ((initialCount - currentCount) / initialCount) * 100;
  },

  // Calculate profit per animal
  calculateProfitPerAnimal(
    totalPurchaseCost: number,
    totalSaleRevenue: number,
    feedCosts: number,
    otherCosts: number,
    animalCount: number
  ): number {
    if (animalCount === 0) return 0;
    const totalCosts = totalPurchaseCost + feedCosts + otherCosts;
    const totalProfit = totalSaleRevenue - totalCosts;
    return totalProfit / animalCount;
  },
};

export const feedCalculations = {
  // Calculate total weight of a custom feed mix
  calculateMixTotalWeight(recipes: Array<{ percentage: number; weight_per_unit: number }>): number {
    return recipes.reduce((total, recipe) => {
      return total + (recipe.percentage / 100) * recipe.weight_per_unit;
    }, 0);
  },

  // Calculate ingredient breakdown for a given total weight
  calculateIngredientBreakdown(
    recipes: Array<{ ingredient_id: string; percentage: number; weight_per_unit: number }>,
    totalWeight: number
  ): Array<{ ingredient_id: string; weight: number; percentage: number }> {
    return recipes.map(recipe => ({
      ingredient_id: recipe.ingredient_id,
      weight: (recipe.percentage / 100) * totalWeight,
      percentage: recipe.percentage,
    }));
  },

  // Validate feed recipe percentages
  validateRecipePercentages(recipes: Array<{ percentage: number }>): boolean {
    const totalPercentage = recipes.reduce((sum, recipe) => sum + recipe.percentage, 0);
    return Math.abs(totalPercentage - 100) < 0.01; // Allow for small floating point errors
  },

  // Calculate cost per kg of custom feed mix
  calculateMixCostPerKg(
    recipes: Array<{ percentage: number; ingredient: { cost_per_kg: number } }>
  ): number {
    return recipes.reduce((totalCost, recipe) => {
      return totalCost + (recipe.percentage / 100) * recipe.ingredient.cost_per_kg;
    }, 0);
  },
};

export const financialCalculations = {
  // Calculate net profit for a period
  calculateNetProfit(income: number, expenses: number): number {
    return income - expenses;
  },

  // Calculate profit margin percentage
  calculateProfitMargin(income: number, expenses: number): number {
    if (income === 0) return 0;
    return ((income - expenses) / income) * 100;
  },

  // Calculate return on investment
  calculateROI(profit: number, investment: number): number {
    if (investment === 0) return 0;
    return (profit / investment) * 100;
  },

  // Calculate break-even point
  calculateBreakEven(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): number {
    const contributionMargin = pricePerUnit - variableCostPerUnit;
    if (contributionMargin <= 0) return Infinity;
    return fixedCosts / contributionMargin;
  },

  // Calculate cash flow for a period
  calculateCashFlow(
    transactions: Array<{ type: 'income' | 'expense'; amount: number; transaction_date: string }>
  ): Array<{ date: string; income: number; expense: number; netFlow: number; runningBalance: number }> {
    // Group transactions by date
    const dailyTransactions = transactions.reduce((acc, transaction) => {
      const date = transaction.transaction_date.split('T')[0]; // Get date part only
      if (!acc[date]) {
        acc[date] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Convert to array and calculate running balance
    let runningBalance = 0;
    return Object.entries(dailyTransactions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { income, expense }]) => {
        const netFlow = income - expense;
        runningBalance += netFlow;
        return {
          date,
          income,
          expense,
          netFlow,
          runningBalance,
        };
      });
  },
};

export const dateHelpers = {
  // Get date range for filter periods
  getDateRange(period: 'today' | 'this_month' | 'this_year'): { start_date: string; end_date: string } {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        return { start_date: today, end_date: today };
      
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start_date: monthStart.toISOString().split('T')[0],
          end_date: monthEnd.toISOString().split('T')[0],
        };
      
      case 'this_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        return {
          start_date: yearStart.toISOString().split('T')[0],
          end_date: yearEnd.toISOString().split('T')[0],
        };
      
      default:
        return { start_date: today, end_date: today };
    }
  },

  // Format date for display
  formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
    const date = new Date(dateString);
    
    if (format === 'long') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Check if date is within range
  isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return checkDate >= start && checkDate <= end;
  },
};
