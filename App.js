import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Linking, SectionList, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import db from './data.json';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Data access
const foodData = db.foods || [];
const diseasesData = db.diseases || [];
const dietsData = db.diets || [];

// Helper functions
const removeDiacritics = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const iconForCategory = (category) => {
  const c = category?.toLowerCase() || "";
  if (c.includes("thịt")) return "🥩";
  if (c.includes("cá") || c.includes("thủy") || c.includes("hải")) return "🐟";
  if (c.includes("trái") || c.includes("quả")) return "🍎";
  if (c.includes("rau") || c.includes("cải")) return "🥬";
  if (c.includes("tinh bột") || c.includes("củ")) return "🍠";
  if (c.includes("trứng") || c.includes("sữa")) return "🥛";
  if (c.includes("đậu") || c.includes("hạt") || c.includes("ngũ cốc")) return "🥜";
  if (c.includes("gia vị") || c.includes("thảo mộc")) return "🧄";
  if (c.includes("nấm")) return "🍄";
  return "🍲";
};

// UI Components
const FoodRow = ({ item, onPress }) => (
  <TouchableOpacity style={styles.foodRow} onPress={onPress}>
    <Text style={styles.foodIcon}>{iconForCategory(item.main_category + ' ' + item.category)}</Text>
    <View style={styles.foodInfo}>
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodSummary} numberOfLines={2}>{item.nutrition || item.category}</Text>
    </View>
  </TouchableOpacity>
);

const SectionCard = ({ title, icon, color, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionIcon, { color }]}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// Screens
function FoodsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  const sectionsData = React.useMemo(() => {
    let filteredFoods = foodData;
    
    if (searchText) {
      const searchNormalized = removeDiacritics(searchText);
      filteredFoods = foodData.filter(food => {
        return removeDiacritics(food.name).includes(searchNormalized);
      });
    }

    const grouped = filteredFoods.reduce((acc, food) => {
      const category = food.main_category || "Các món khác";
      if (!acc[category]) acc[category] = [];
      acc[category].push(food);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      title: key,
      data: grouped[key]
    }));
  }, [searchText]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm thực phẩm..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <SectionList
        sections={sectionsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodRow item={item} onPress={() => navigation.navigate('FoodDetail', { food: item })} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionListHeader}><Text style={styles.sectionListHeaderText}>{title}</Text></View>
        )}
        contentContainerStyle={styles.listContainer}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

function DiseasesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={diseasesData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('DiseaseDetail', { disease: item })}>
            <Text style={styles.cardIcon}>🩺</Text>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodSummary} numberOfLines={2}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function DietsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dietsData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('DietDetail', { diet: item })}>
            <Text style={styles.cardIcon}>🌿</Text>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodSummary} numberOfLines={2}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// Detail Screens
function FoodDetailScreen({ route, navigation }) {
  const { food } = route.params;

  // Resolve diets and diseases
  const cures = (food.cures || []).map(dId => diseasesData.find(d => d.id === dId)).filter(Boolean);
  const avoids = (food.avoids || []).map(dId => diseasesData.find(d => d.id === dId)).filter(Boolean);
  const diets = (food.diets || []).map(dId => dietsData.find(d => d.id === dId)).filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.detailContent}>
      <Text style={styles.detailTitle}>{food.name}</Text>
      {food.main_category && <Text style={styles.categoryBadge}>{food.main_category}</Text>}

      {food.nutrition && (
        <SectionCard title="Dinh dưỡng & Lợi ích" icon="❤️" color="#e74c3c">
          <Text style={styles.boldText}>Thành phần: <Text style={styles.normalText}>{food.nutrition}</Text></Text>
          {food.benefits && food.benefits.map((b, i) => <Text key={i} style={styles.bulletPoint}>• {b}</Text>)}
        </SectionCard>
      )}

      {cures.length > 0 && (
        <SectionCard title="Tốt cho sức khỏe" icon="🩺" color="#2980b9">
          <View style={styles.tagContainer}>
            {cures.map((d, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate('DiseaseDetail', { disease: d })}>
                <Text style={styles.tagGood}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>
      )}

      {avoids.length > 0 && (
        <SectionCard title="Cần thận trọng với" icon="⚠️" color="#d35400">
          <View style={styles.tagContainer}>
            {avoids.map((d, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate('DiseaseDetail', { disease: d })}>
                <Text style={styles.tagBad}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>
      )}

      {diets.length > 0 && (
        <SectionCard title="Phù hợp Chế độ ăn" icon="🌿" color="#27ae60">
          <View style={styles.tagContainer}>
            {diets.map((d, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate('DietDetail', { diet: d })}>
                <Text style={styles.tagDiet}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>
      )}

      {/* Legacy Combos */}
      {food.good_combinations && food.good_combinations.length > 0 && (
        <SectionCard title="Nên kết hợp" icon="✅" color="#2ecc71">
          {food.good_combinations.map((c, i) => (
            <View key={i} style={styles.comboItem}>
              <Text style={styles.comboFoodGood}>{c.food}</Text>
              <Text style={styles.comboReason}>{c.reason}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {food.bad_combinations && food.bad_combinations.length > 0 && (
        <SectionCard title="Không nên kết hợp" icon="❌" color="#e67e22">
          {food.bad_combinations.map((c, i) => (
            <View key={i} style={styles.comboItem}>
              <Text style={styles.comboFoodBad}>{c.food}</Text>
              <Text style={styles.comboReason}>{c.reason}</Text>
            </View>
          ))}
        </SectionCard>
      )}
    </ScrollView>
  );
}

function DiseaseDetailScreen({ route, navigation }) {
  const { disease } = route.params;
  const goodFoods = foodData.filter(f => f.cures?.includes(disease.id));
  const badFoods = foodData.filter(f => f.avoids?.includes(disease.id));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerHero}>
        <Text style={styles.heroTitle}>{disease.name}</Text>
        <Text style={styles.heroDesc}>{disease.desc}</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionListHeaderText}>🟢 NÊN ĂN</Text>
        {goodFoods.map(f => (
          <FoodRow key={f.id} item={f} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}

        <Text style={[styles.sectionListHeaderText, { color: '#e74c3c', marginTop: 16 }]}>🔴 HẠN CHẾ / KHÔNG NÊN</Text>
        {badFoods.length === 0 && <Text style={styles.normalText}>Chưa có dữ liệu kiêng kỵ.</Text>}
        {badFoods.map(f => (
          <FoodRow key={f.id} item={f} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

function DietDetailScreen({ route, navigation }) {
  const { diet } = route.params;
  const approvedFoods = foodData.filter(f => f.diets?.includes(diet.id));

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.headerHero, { backgroundColor: '#27ae60' }]}>
        <Text style={styles.heroTitle}>{diet.name}</Text>
        <Text style={styles.heroDesc}>{diet.desc}</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionListHeaderText}>Thực phẩm phù hợp tiêu chuẩn</Text>
        {approvedFoods.map(f => (
          <FoodRow key={f.id} item={f} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

function CauseDetailScreen({ route, navigation }) {
  const { disease } = route.params;
  const badFoods = foodData.filter(f => f.avoids?.includes(disease.id));

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.headerHero, { backgroundColor: '#e74c3c' }]}>
        <Text style={styles.heroTitle}>{disease.name}</Text>
        <Text style={styles.heroDesc}>Thực phẩm cần tránh / có nguy cơ gây bệnh</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={[styles.sectionListHeaderText, { color: '#e74c3c', marginTop: 0 }]}>🔴 THỰC PHẨM CẦN TRÁNH / NGUY CƠ GÂY BỆNH</Text>
        {badFoods.length === 0 && <Text style={[styles.normalText, { marginTop: 8 }]}>Chưa có dữ liệu thực phẩm gây bệnh này trong danh sách hiện tại.</Text>}
        {badFoods.map(f => (
          <FoodRow key={f.id} item={f} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

function CausesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={diseasesData}
        keyExtractor={item => item.id + '_cause'}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('CauseDetail', { disease: item })}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodSummary} numberOfLines={2}>Tìm hiểu các món ăn có thể gây ra hoặc làm trầm trọng thêm bệnh này.</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// Navigators
const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ 
    headerStyle: { backgroundColor: '#2ecc71' },
    headerTintColor: '#fff',
    tabBarActiveTintColor: '#2ecc71'
  }}>
    <Tab.Screen name="FoodsTab" component={FoodsScreen} options={{ title: 'Thực Phẩm', tabBarIcon: () => <Text>🍲</Text> }} />
    <Tab.Screen name="DiseasesTab" component={DiseasesScreen} options={{ title: 'Trị Bệnh', tabBarIcon: () => <Text>🩺</Text> }} />
    <Tab.Screen name="CausesTab" component={CausesScreen} options={{ title: 'Gây Bệnh', tabBarIcon: () => <Text>⚠️</Text> }} />
    <Tab.Screen name="DietsTab" component={DietsScreen} options={{ title: 'Trường Thọ', tabBarIcon: () => <Text>🌿</Text> }} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2ecc71' }, headerTintColor: '#fff' }}>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: 'Chi Tiết Món Ăn' }} />
          <Stack.Screen name="DiseaseDetail" component={DiseaseDetailScreen} options={{ title: 'Lời khuyên Bệnh Lý' }} />
          <Stack.Screen name="CauseDetail" component={CauseDetailScreen} options={{ title: 'Thực Phẩm Cần Tránh' }} />
          <Stack.Screen name="DietDetail" component={DietDetailScreen} options={{ title: 'Chế Độ Ăn' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  searchContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#dcdde1' },
  searchInput: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 8, fontSize: 16 },
  listContainer: { padding: 16, paddingTop: 16 },
  sectionListHeader: { backgroundColor: '#e8f8f5', padding: 10, borderRadius: 8, marginBottom: 8 },
  sectionListHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#1abc9c' },
  foodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginBottom: 8, borderRadius: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#eee' },
  foodIcon: { fontSize: 32, marginRight: 16 },
  cardIcon: { fontSize: 40, marginRight: 16 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 18, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
  foodSummary: { fontSize: 14, color: '#7f8fa6', lineHeight: 20 },
  detailContent: { padding: 16, paddingBottom: 40 },
  detailTitle: { fontSize: 28, fontWeight: 'bold', color: '#2f3640', marginBottom: 8, textAlign: 'center' },
  categoryBadge: { alignSelf: 'center', backgroundColor: '#e8f8f5', color: '#1abc9c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontWeight: 'bold', marginBottom: 20 },
  sectionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { fontSize: 20, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2f3640' },
  boldText: { fontSize: 16, fontWeight: 'bold', color: '#353b48' },
  normalText: { color: '#2f3640', lineHeight: 24 },
  bulletPoint: { fontSize: 16, color: '#2f3640', lineHeight: 24, marginLeft: 8, marginBottom: 4 },
  comboItem: { marginBottom: 12 },
  comboFoodGood: { fontSize: 16, fontWeight: 'bold', color: '#27ae60', marginBottom: 4 },
  comboFoodBad: { fontSize: 16, fontWeight: 'bold', color: '#d35400', marginBottom: 4 },
  comboReason: { fontSize: 15, color: '#2f3640', lineHeight: 22 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagGood: { backgroundColor: '#e1f5fe', color: '#0277bd', padding: 8, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  tagBad: { backgroundColor: '#fbe9e7', color: '#d84315', padding: 8, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  tagDiet: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: 8, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  headerHero: { backgroundColor: '#3498db', padding: 24, alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroDesc: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24 },
});
