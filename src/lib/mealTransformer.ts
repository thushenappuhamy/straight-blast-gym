// Utility functions to transform meal data from API to component format

export interface TransformedMeal {
  type: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: Array<{
    item?: string;
    name?: string;
    quantity?: string;
    notes?: string;
  }>;
  recipe?: string;
  notes?: string;
}

export interface TransformedDay {
  day: string;
  meals: TransformedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

/**
 * Transform meal data from API response to component format
 */
export function transformMeal(meal: any): TransformedMeal {
  return {
    type: meal.type || meal.mealType || 'Meal',
    time: meal.time,
    calories: meal.calories || 0,
    protein: meal.protein || 0,
    carbs: meal.carbs || 0,
    fat: meal.fat || meal.fats || 0,
    items: meal.items || [],
    recipe: meal.recipe,
    notes: meal.notes,
  };
}

/**
 * Transform day data from API response to component format
 */
export function transformDay(day: any): TransformedDay {
  const meals = (day.meals || []).map(transformMeal);

  // Support all field variants: top-level, dayTotal nested, and fat/fats aliases
  const totalCalories =
    day.totalCalories ?? day.dayTotal?.calories ?? day.calories ?? 0;
  const totalProtein =
    day.totalProtein ?? day.protein ?? day.dayTotal?.protein ?? 0;
  const totalCarbs =
    day.totalCarbs ?? day.carbs ?? day.dayTotal?.carbs ?? 0;
  const totalFat =
    day.totalFat ?? day.fat ?? day.fats ?? day.dayTotal?.fats ?? day.dayTotal?.fat ?? 0;

  return {
    day: day.day || day.name || 'Day',
    meals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  };
}

/**
 * Transform weekly plan from API response
 */
export function transformWeeklyPlan(weeklyPlan: any[]): TransformedDay[] {
  if (!Array.isArray(weeklyPlan)) {
    return [];
  }
  return weeklyPlan.map(transformDay);
}

/**
 * Transform full meal plan from API response
 */
export function transformMealPlan(mealPlan: any) {
  // weeklyPlan may come from top-level field or derived from weeks[0].days
  const rawWeeklyPlan =
    mealPlan.weeklyPlan?.length
      ? mealPlan.weeklyPlan
      : mealPlan.weeks?.[0]?.days || [];

  return {
    title: mealPlan.title || mealPlan.goal || 'Your Meal Plan',
    goal: mealPlan.goal || mealPlan.description || '',
    dailyCalories:
      mealPlan.dailyCalories ?? mealPlan.calories ?? 0,
    dailyProtein:
      mealPlan.dailyProtein ?? mealPlan.protein ?? 0,
    dailyCarbs:
      mealPlan.dailyCarbs ?? mealPlan.carbs ?? 0,
    dailyFat:
      mealPlan.dailyFat ?? mealPlan.fats ?? mealPlan.fat ?? 0,
    weeklyPlan: transformWeeklyPlan(rawWeeklyPlan),
    nutritionTips: mealPlan.nutritionTips,
    shoppingList: mealPlan.shoppingList,
    notes: mealPlan.notes,
  };
}
