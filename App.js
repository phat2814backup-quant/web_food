import React from 'react';
import { useColorScheme, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MealProvider } from './src/context/MealContext';
import HomeScreen from './src/screens/HomeScreen';
import MealScreen from './src/screens/MealScreen';
import { DiseasesScreen, CausesScreen, DietsScreen, FoodDetailScreen, DiseaseDetailScreen, CauseDetailScreen, DietDetailScreen, CompareScreen } from './src/screens/OtherScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? '#1e272e' : '#fff';
  const border = isDark ? '#1e272e' : '#eee';
  return (
    <Tab.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: '#2ecc71' },
      headerTintColor: '#fff',
      tabBarActiveTintColor: '#2ecc71',
      tabBarStyle: { backgroundColor: bg, borderTopColor: border }
    }}>
      <Tab.Screen name="FoodsTab" component={HomeScreen} options={{ title: 'Thực Phẩm', tabBarIcon: () => <Text>🍲</Text> }} />
      <Tab.Screen name="MealTab" component={MealScreen} options={{ title: 'Giỏ Thực Đơn', tabBarIcon: () => <Text>🛒</Text> }} />
      <Tab.Screen name="DiseasesTab" component={DiseasesScreen} options={{ title: 'Trị Bệnh', tabBarIcon: () => <Text>🩺</Text> }} />
      <Tab.Screen name="CausesTab" component={CausesScreen} options={{ title: 'Gây Bệnh', tabBarIcon: () => <Text>⚠️</Text> }} />
      <Tab.Screen name="DietsTab" component={DietsScreen} options={{ title: 'Trường Thọ', tabBarIcon: () => <Text>🌿</Text> }} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <MealProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2ecc71' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: 'Chi Tiết Món Ăn' }} />
            <Stack.Screen name="DiseaseDetail" component={DiseaseDetailScreen} options={{ title: 'Lời khuyên Bệnh Lý' }} />
            <Stack.Screen name="CauseDetail" component={CauseDetailScreen} options={{ title: 'Thực Phẩm Cần Tránh' }} />
            <Stack.Screen name="DietDetail" component={DietDetailScreen} options={{ title: 'Chế Độ Ăn' }} />
            <Stack.Screen name="Compare" component={CompareScreen} options={{ title: 'So Sánh Trực Tiếp' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </MealProvider>
  );
}
