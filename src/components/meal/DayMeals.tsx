'use client';

import React from 'react';
import MealCard from './MealCard';

interface Meal {
  type: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: any[];
  recipe?: string;
  notes?: string;
}

interface DayMealsProps {
  day: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export default function DayMeals({
  day,
  meals,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
}: DayMealsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-2">
          {day}
        </h3>
      </div>

      <div className="space-y-3">
        {meals.map((meal, idx) => (
          <MealCard
            key={idx}
            type={meal.type}
            time={meal.time}
            calories={meal.calories}
            protein={meal.protein}
            carbs={meal.carbs}
            fat={meal.fat}
            items={meal.items}
            recipe={meal.recipe}
            notes={meal.notes}
          />
        ))}
      </div>
    </div>
  );
}
