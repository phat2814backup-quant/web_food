import React, { useState, createContext } from 'react';

export const MealContext = createContext();

export const MealProvider = ({ children }) => {
  const [meal, setMeal] = useState([]);
  
  const addToMeal = (food) => {
    if (!meal.find(f => f.id === food.id)) setMeal([...meal, food]);
  };
  
  const removeFromMeal = (id) => {
    setMeal(meal.filter(f => f.id !== id));
  };

  return (
    <MealContext.Provider value={{ meal, addToMeal, removeFromMeal, clearMeal: () => setMeal([]) }}>
      {children}
    </MealContext.Provider>
  );
};
