import React, { useContext } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { getTheme, commonStyles as styles } from '../styles/theme';
import { FoodRow, removeDiacritics } from '../components/Shared';
import { MealContext } from '../context/MealContext';

export default function MealScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { meal, removeFromMeal } = useContext(MealContext);

  // Check for clashes
  const clashes = [];
  for (let i = 0; i < meal.length; i++) {
    for (let j = i + 1; j < meal.length; j++) {
      const f1 = meal[i];
      const f2 = meal[j];
      
      const f1Bad = f1.bad_combinations?.find(c => c.food_id === f2.id);
      const f2Bad = f2.bad_combinations?.find(c => c.food_id === f1.id);
      
      if (f1Bad) clashes.push(`Cảnh báo: ${f1.name} kỵ ${f2.name} (${f1Bad.reason})`);
      if (f2Bad) clashes.push(`Cảnh báo: ${f2.name} kỵ ${f1.name} (${f2Bad.reason})`);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>Giỏ Thực Đơn ({meal.length})</Text>
        
        {clashes.length > 0 && (
          <View style={{ backgroundColor: '#fbe9e7', padding: 12, borderRadius: 8, marginBottom: 16 }}>
             <Text style={{ color: '#d84315', fontWeight: 'bold', marginBottom: 4 }}>⚠️ PHÁT HIỆN KỴ NHAU</Text>
             {clashes.map((c, i) => <Text key={i} style={{ color: '#d84315', fontSize: 13 }}>• {c}</Text>)}
          </View>
        )}

        {meal.length === 2 && (
          <TouchableOpacity 
            style={{ backgroundColor: '#9b59b6', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}
            onPress={() => navigation.navigate('Compare', { food1: meal[0], food2: meal[1] })}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>⚖️ Lên bàn cân so sánh 2 món này</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={meal}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <FoodRow item={item} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: item })} />
            </View>
            <TouchableOpacity onPress={() => removeFromMeal(item.id)} style={{ padding: 16 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
           <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 40 }}>Giỏ thực đơn trống. Hãy thêm món ăn từ chi tiết món nhé!</Text>
        )}
      />
    </SafeAreaView>
  );
}
