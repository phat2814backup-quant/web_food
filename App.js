import React, { useState, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Linking, SectionList, FlatList, useColorScheme } from 'react-native';
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

// Collect all unique super tags
const allSuperTags = Array.from(new Set(foodData.flatMap(f => f.super_tags || [])));
const FILTER_OPTIONS = ['Tất cả', ...allSuperTags];

// Context for Meal Planner
const MealContext = createContext();

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

// Theme Helper
const getTheme = (isDark) => ({
  bg: isDark ? '#1e272e' : '#f5f6fa',
  cardBg: isDark ? '#2f3542' : '#fff',
  text: isDark ? '#f1f2f6' : '#2f3640',
  textMuted: isDark ? '#a4b0be' : '#7f8fa6',
  border: isDark ? '#57606f' : '#dcdde1',
  primary: '#2ecc71'
});

// Helper functions
const removeDiacritics = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const iconForCategory = (category) => {
  const c = " " + (category?.toLowerCase().replace(/[,\-\.\(\)]/g, " ").replace(/\s+/g, " ") || "") + " ";
  if (c.includes(" thịt ") || c.includes(" bò ") || c.includes(" heo ") || c.includes(" gà ")) return "🥩";
  if (c.includes(" cá ") || c.includes(" thủy sản ") || c.includes(" hải sản ") || c.includes(" tôm ")) return "🐟";
  if (c.includes(" trái ") || c.includes(" quả ") || c.includes(" trái cây ")) return "🍎";
  if (c.includes(" rau ") || c.includes(" cải ") || c.includes(" xà lách ")) return "🥬";
  if (c.includes(" củ ") || c.includes(" khoai ")) return "🍠";
  if (c.includes(" trứng ") || c.includes(" sữa ")) return "🥛";
  if (c.includes(" đậu ") || c.includes(" hạt ") || c.includes(" ngũ cốc ")) return "🥜";
  if (c.includes(" gia vị ") || c.includes(" thảo mộc ") || c.includes(" hành ") || c.includes(" tỏi ")) return "🧄";
  if (c.includes(" nấm ")) return "🍄";
  if (c.includes(" đồ uống ") || c.includes(" trà ") || c.includes(" boba ")) return "🥤";
  return "🍲";
};

// UI Components
const FoodRow = ({ item, onPress, theme }) => (
  <TouchableOpacity style={[styles.foodRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={onPress}>
    <Text style={styles.foodIcon}>{iconForCategory(item.main_category + ' ' + item.category)}</Text>
    <View style={styles.foodInfo}>
      <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
      <Text style={[styles.foodSummary, { color: theme.textMuted }]} numberOfLines={2}>{item.nutrition || item.category}</Text>
      {item.super_tags && item.super_tags.length > 0 && (
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4}}>
          {item.super_tags.slice(0, 2).map((tag, i) => (
             <Text key={i} style={{fontSize: 10, backgroundColor: '#f39c12', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden'}}>{tag}</Text>
          ))}
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const SectionCard = ({ title, icon, color, children, theme }) => (
  <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionIcon, { color }]}>{icon}</Text>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </View>
);

// Screens
function FoodsScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const sectionsData = React.useMemo(() => {
    let filteredFoods = foodData;
    
    if (activeFilter !== 'Tất cả') {
      filteredFoods = filteredFoods.filter(f => f.super_tags?.includes(activeFilter));
    }

    if (searchText) {
      const searchNormalized = removeDiacritics(searchText);
      const searchWords = searchNormalized.split(' ').filter(Boolean);
      
      filteredFoods = filteredFoods.filter(food => {
        const nameNormalized = removeDiacritics(food.name);
        const nameMatch = nameNormalized.includes(searchNormalized) || searchNormalized.includes(nameNormalized);
        const catMatch = removeDiacritics(food.category || "").includes(searchNormalized);
        const nutMatch = removeDiacritics(food.nutrition || "").includes(searchNormalized);
        const benMatch = removeDiacritics(food.benefits?.join(" ") || "").includes(searchNormalized);
        const prevMatch = food.disease_prevention ? removeDiacritics(JSON.stringify(food.disease_prevention)).includes(searchNormalized) : false;
        
        // Fallback: Check if all search words are found ANYWHERE in the combined text
        const combinedText = [nameNormalized, removeDiacritics(food.category), removeDiacritics(food.nutrition)].join(' ');
        const allWordsMatch = searchWords.every(word => combinedText.includes(word));

        return nameMatch || catMatch || nutMatch || benMatch || prevMatch || allWordsMatch;
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
  }, [searchText, activeFilter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.bg, color: theme.text }]}
          placeholder="Tìm kiếm thông minh..."
          placeholderTextColor={theme.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {FILTER_OPTIONS.map(filter => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setActiveFilter(filter)}
              style={{ backgroundColor: activeFilter === filter ? theme.primary : theme.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: activeFilter === filter ? theme.primary : theme.border }}
            >
              <Text style={{ color: activeFilter === filter ? '#fff' : theme.text, fontWeight: 'bold' }}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <SectionList
        sections={sectionsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodRow item={item} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: item })} />}
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
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={diseasesData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.cardRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => navigation.navigate('DiseaseDetail', { disease: item })}>
            <Text style={styles.cardIcon}>🩺</Text>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.foodSummary, { color: theme.textMuted }]} numberOfLines={2}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function DietsScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={dietsData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.cardRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => navigation.navigate('DietDetail', { diet: item })}>
            <Text style={styles.cardIcon}>🌿</Text>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.foodSummary, { color: theme.textMuted }]} numberOfLines={2}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function CausesScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={diseasesData}
        keyExtractor={item => item.id + '_cause'}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.cardRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => navigation.navigate('CauseDetail', { disease: item })}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.foodSummary, { color: theme.textMuted }]} numberOfLines={2}>Thực phẩm kỵ với bệnh này</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}


function MealScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { meal, removeFromMeal } = useContext(MealContext);

  // Check for clashes
  const clashes = [];
  for (let i = 0; i < meal.length; i++) {
    for (let j = i + 1; j < meal.length; j++) {
      const f1 = meal[i];
      const f2 = meal[j];
      const name1 = removeDiacritics(f1.name);
      const name2 = removeDiacritics(f2.name);
      
      const f1Bad = f1.bad_combinations?.find(c => removeDiacritics(c.food).includes(name2));
      const f2Bad = f2.bad_combinations?.find(c => removeDiacritics(c.food).includes(name1));
      
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

function CompareScreen({ route }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { food1, food2 } = route.params;

  const renderSide = (food) => (
    <ScrollView style={{ flex: 1, padding: 8, borderRightWidth: 1, borderColor: theme.border }}>
       <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.primary, textAlign: 'center' }}>{food.name}</Text>
       <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', marginBottom: 16 }}>{food.category}</Text>
       
       <View style={{ marginBottom: 16 }}>
          {food.super_tags?.map((t, i) => (
            <Text key={i} style={{ backgroundColor: '#f39c12', color: '#fff', fontSize: 12, padding: 4, borderRadius: 4, overflow: 'hidden', textAlign: 'center', marginBottom: 4 }}>{t}</Text>
          ))}
       </View>

       <Text style={{ fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>❤️ Dinh dưỡng:</Text>
       <Text style={{ color: theme.text, fontSize: 13, marginBottom: 16 }}>{food.nutrition}</Text>
       
       <Text style={{ fontWeight: 'bold', color: '#8e44ad', marginBottom: 4 }}>🔬 Số bệnh phòng ngừa:</Text>
       <Text style={{ color: theme.text, fontSize: 13, marginBottom: 16 }}>{food.disease_prevention?.length || 0} bệnh</Text>
       
       <Text style={{ fontWeight: 'bold', color: '#2980b9', marginBottom: 4 }}>🩺 Chữa bệnh tốt nhất:</Text>
       {food.disease_prevention?.slice(0, 2).map((dp, i) => (
         <Text key={i} style={{ color: theme.text, fontSize: 12, marginBottom: 4 }}>• {dp.disease}</Text>
       ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ flexDirection: 'row', flex: 1, paddingTop: 16 }}>
        {renderSide(food1)}
        {renderSide(food2)}
      </View>
    </SafeAreaView>
  );
}

// ... Detail Screens ...
function FoodDetailScreen({ route, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { food } = route.params;
  const { meal, addToMeal, removeFromMeal } = useContext(MealContext);
  const inMeal = meal.find(f => f.id === food.id);

  // Resolve diets and diseases
  const cures = (food.cures || []).map(dId => diseasesData.find(d => d.id === dId)).filter(Boolean);
  const avoids = (food.avoids || []).map(dId => diseasesData.find(d => d.id === dId)).filter(Boolean);
  const diets = (food.diets || []).map(dId => dietsData.find(d => d.id === dId)).filter(Boolean);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.detailContent}>
      <Text style={[styles.detailTitle, { color: theme.text }]}>{food.name}</Text>
      
      {food.super_tags && food.super_tags.length > 0 && (
        <View style={{flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16}}>
          {food.super_tags.map((tag, i) => (
            <Text key={i} style={{backgroundColor: '#f39c12', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontWeight: 'bold', overflow: 'hidden'}}>{tag}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={{ backgroundColor: inMeal ? '#e74c3c' : theme.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
        onPress={() => inMeal ? removeFromMeal(food.id) : addToMeal(food)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {inMeal ? '❌ Xóa khỏi Thực đơn' : '🛒 Thêm vào Thực đơn'}
        </Text>
      </TouchableOpacity>

      {food.nutrition && (
        <SectionCard title="Dinh dưỡng & Lợi ích" icon="❤️" color="#e74c3c" theme={theme}>
          <Text style={[styles.boldText, { color: theme.text }]}>Thành phần: <Text style={[styles.normalText, { color: theme.text }]}>{food.nutrition}</Text></Text>
          {food.benefits && food.benefits.map((b, i) => <Text key={i} style={[styles.bulletPoint, { color: theme.text }]}>• {b}</Text>)}
        </SectionCard>
      )}

      {food.disease_prevention && food.disease_prevention.length > 0 && (
        <SectionCard title="Nghiên cứu & Bệnh lý" icon="🔬" color="#8e44ad" theme={theme}>
          {food.disease_prevention.map((dp, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <Text style={[styles.boldText, { color: '#8e44ad', fontSize: 16 }]}>{dp.disease}</Text>
              <Text style={[styles.comboReason, { color: theme.text }]}><Text style={{ fontWeight: 'bold' }}>Tác dụng:</Text> {dp.effect}</Text>
              <Text style={[styles.comboReason, { color: theme.text }]}><Text style={{ fontWeight: 'bold' }}>Bằng chứng:</Text> {dp.evidence_level}</Text>
              <Text style={[styles.comboReason, { fontStyle: 'italic', marginTop: 4, color: theme.text }]}>"{dp.explanation}"</Text>
              {dp.references && dp.references.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 13, color: theme.textMuted }}>Nguồn tham khảo:</Text>
                  {dp.references.map((ref, rIdx) => (
                    <TouchableOpacity key={rIdx} onPress={() => Linking.openURL(ref)}>
                      <Text style={{ color: '#2980b9', textDecorationLine: 'underline', fontSize: 13, marginTop: 2 }}>{ref}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </SectionCard>
      )}

      {cures.length > 0 && (
        <SectionCard title="Tốt cho sức khỏe" icon="🩺" color="#2980b9" theme={theme}>
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
        <SectionCard title="Cần thận trọng với" icon="⚠️" color="#d35400" theme={theme}>
          <View style={styles.tagContainer}>
            {avoids.map((d, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate('DiseaseDetail', { disease: d })}>
                <Text style={styles.tagBad}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>
      )}

      {/* Legacy Combos */}
      {food.good_combinations && food.good_combinations.length > 0 && (
        <SectionCard title="Nên kết hợp" icon="✅" color="#2ecc71" theme={theme}>
          {food.good_combinations.map((c, i) => (
            <View key={i} style={styles.comboItem}>
              <Text style={styles.comboFoodGood}>{c.food}</Text>
              <Text style={[styles.comboReason, { color: theme.text }]}>{c.reason}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {food.bad_combinations && food.bad_combinations.length > 0 && (
        <SectionCard title="Không nên kết hợp" icon="❌" color="#e67e22" theme={theme}>
          {food.bad_combinations.map((c, i) => (
            <View key={i} style={styles.comboItem}>
              <Text style={styles.comboFoodBad}>{c.food}</Text>
              <Text style={[styles.comboReason, { color: theme.text }]}>{c.reason}</Text>
            </View>
          ))}
        </SectionCard>
      )}
    </ScrollView>
  );
}

function DiseaseDetailScreen({ route, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { disease } = route.params;
  const goodFoods = foodData.filter(f => f.cures?.includes(disease.id));
  const badFoods = foodData.filter(f => f.avoids?.includes(disease.id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.headerHero}>
        <Text style={styles.heroTitle}>{disease.name}</Text>
        <Text style={styles.heroDesc}>{disease.desc}</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionListHeaderText}>🟢 NÊN ĂN</Text>
        {goodFoods.map(f => (
          <FoodRow key={f.id} item={f} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}

        <Text style={[styles.sectionListHeaderText, { color: '#e74c3c', marginTop: 16 }]}>🔴 HẠN CHẾ / KHÔNG NÊN</Text>
        {badFoods.length === 0 && <Text style={[styles.normalText, { color: theme.text }]}>Chưa có dữ liệu kiêng kỵ.</Text>}
        {badFoods.map(f => (
          <FoodRow key={f.id} item={f} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

function DietDetailScreen({ route, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { diet } = route.params;
  const approvedFoods = foodData.filter(f => f.diets?.includes(diet.id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerHero, { backgroundColor: '#27ae60' }]}>
        <Text style={styles.heroTitle}>{diet.name}</Text>
        <Text style={styles.heroDesc}>{diet.desc}</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionListHeaderText}>Thực phẩm phù hợp tiêu chuẩn</Text>
        {approvedFoods.map(f => (
          <FoodRow key={f.id} item={f} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

function CauseDetailScreen({ route, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { disease } = route.params;
  const badFoods = foodData.filter(f => f.avoids?.includes(disease.id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerHero, { backgroundColor: '#e74c3c' }]}>
        <Text style={styles.heroTitle}>{disease.name}</Text>
        <Text style={styles.heroDesc}>Thực phẩm cần tránh / có nguy cơ gây bệnh</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={[styles.sectionListHeaderText, { color: '#e74c3c', marginTop: 0 }]}>🔴 THỰC PHẨM CẦN TRÁNH / NGUY CƠ GÂY BỆNH</Text>
        {badFoods.length === 0 && <Text style={[styles.normalText, { color: theme.text, marginTop: 8 }]}>Chưa có dữ liệu thực phẩm gây bệnh này trong danh sách hiện tại.</Text>}
        {badFoods.map(f => (
          <FoodRow key={f.id} item={f} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

// Navigators
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
      <Tab.Screen name="FoodsTab" component={FoodsScreen} options={{ title: 'Thực Phẩm', tabBarIcon: () => <Text>🍲</Text> }} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  searchContainer: { padding: 16, borderBottomWidth: 1 },
  searchInput: { padding: 12, borderRadius: 8, fontSize: 16 },
  listContainer: { padding: 16, paddingTop: 16 },
  sectionListHeader: { backgroundColor: '#e8f8f5', padding: 10, borderRadius: 8, marginBottom: 8 },
  sectionListHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#1abc9c' },
  foodRow: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, elevation: 2, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 12, elevation: 3, borderWidth: 1 },
  foodIcon: { fontSize: 32, marginRight: 16 },
  cardIcon: { fontSize: 40, marginRight: 16 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  foodSummary: { fontSize: 14, lineHeight: 20 },
  detailContent: { padding: 16, paddingBottom: 40 },
  detailTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  sectionCard: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { fontSize: 20, marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  boldText: { fontSize: 16, fontWeight: 'bold' },
  normalText: { lineHeight: 24 },
  bulletPoint: { fontSize: 16, lineHeight: 24, marginLeft: 8, marginBottom: 4 },
  comboItem: { marginBottom: 12 },
  comboFoodGood: { fontSize: 16, fontWeight: 'bold', color: '#27ae60', marginBottom: 4 },
  comboFoodBad: { fontSize: 16, fontWeight: 'bold', color: '#d35400', marginBottom: 4 },
  comboReason: { fontSize: 15, lineHeight: 22 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagGood: { backgroundColor: '#e1f5fe', color: '#0277bd', padding: 8, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  tagBad: { backgroundColor: '#fbe9e7', color: '#d84315', padding: 8, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  tagDiet: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: 8, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  headerHero: { backgroundColor: '#3498db', padding: 24, alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroDesc: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24 },
});
