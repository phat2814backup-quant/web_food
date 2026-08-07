import React, { useState, useMemo } from 'react';
import { SafeAreaView, View, TextInput, ScrollView, TouchableOpacity, Text, SectionList, useColorScheme } from 'react-native';
import { getTheme, commonStyles as styles } from '../styles/theme';
import { FoodRow, FoodGridItem, removeDiacritics } from '../components/Shared';
import db from '../../data.json';

const foodData = db.foods || [];
const allSuperTags = Array.from(new Set(foodData.flatMap(f => f.super_tags || [])));
const FILTER_OPTIONS = ['Tất cả', ...allSuperTags];

export default function HomeScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showFilters, setShowFilters] = useState(false);

  const sectionsData = useMemo(() => {
    let filteredFoods = [...foodData];
    
    if (activeFilter !== 'Tất cả') {
      filteredFoods = filteredFoods.filter(f => f.super_tags?.includes(activeFilter));
      
      // Sort using the pre-calculated order from source_supper_food.md
      filteredFoods.sort((a, b) => {
        const orderA = a.super_tags_order?.[activeFilter] ?? 999;
        const orderB = b.super_tags_order?.[activeFilter] ?? 999;
        return orderA - orderB;
      });
    }

    if (searchText) {
      const searchNormalized = removeDiacritics(searchText);
      const searchRaw = searchText.toLowerCase().trim();
      
      // Dynamic Top 10 Search
      let topField = null;
      let topName = "";
      if (searchNormalized.includes("top dam") || searchNormalized.includes("nhieu dam") || searchNormalized.includes("giau dam")) { topField = "protein"; topName = "Đạm"; }
      else if (searchNormalized.includes("top canxi") || searchNormalized.includes("nhieu canxi") || searchNormalized.includes("giau canxi")) { topField = "calcium"; topName = "Canxi"; }
      else if (searchNormalized.includes("top sat") || searchNormalized.includes("nhieu sat") || searchNormalized.includes("giau sat")) { topField = "iron"; topName = "Sắt"; }
      else if (searchNormalized.includes("top kali") || searchNormalized.includes("nhieu kali") || searchNormalized.includes("giau kali")) { topField = "potassium"; topName = "Kali"; }
      else if (searchNormalized.includes("top kem") || searchNormalized.includes("nhieu kem") || searchNormalized.includes("giau kem")) { topField = "zinc"; topName = "Kẽm"; }
      else if (searchNormalized.includes("top vit") || searchNormalized.includes("nhieu vit") || searchNormalized.includes("giau vit")) { topField = "vit_c"; topName = "Vitamin C"; }
      else if (searchNormalized.includes("top xo") || searchNormalized.includes("nhieu xo") || searchNormalized.includes("giau xo")) { topField = "fiber"; topName = "Chất xơ"; }
      else if (searchNormalized.includes("top calo") || searchNormalized.includes("nhieu calo") || searchNormalized.includes("top nang luong") || searchNormalized.includes("nhieu nang luong")) { topField = "calories"; topName = "Năng lượng"; }
      
      if (topField) {
         filteredFoods.sort((a, b) => {
            const valA = a.nutrition_data?.[topField] || 0;
            const valB = b.nutrition_data?.[topField] || 0;
            return valB - valA;
         });
         return [{ title: `Top 10 thực phẩm chứa nhiều ${topName} nhất`, data: [filteredFoods.slice(0, 10)] }];
      }

      const searchWords = searchNormalized.split(' ').filter(Boolean);
      const searchRawWords = searchRaw.split(' ').filter(Boolean);
      const hasDiacritics = searchRaw !== searchNormalized;
      
      // Calculate scores
      const scoredFoods = filteredFoods.map(food => {
        const nameNormalized = removeDiacritics(food.name);
        const nameRaw = (food.name || "").toLowerCase();
        let score = 0;

        // Exact match or start match
        if (nameRaw === searchRaw) score += 200;
        else if (nameNormalized === searchNormalized) score += 100;
        else if (nameRaw.startsWith(searchRaw)) score += 90;
        else if (nameNormalized.startsWith(searchNormalized)) score += 80;
        else if (nameRaw.includes(searchRaw)) score += 60;
        else if (nameNormalized.includes(searchNormalized)) score += 50;

        // Match categories/tags
        const catNormalized = removeDiacritics(food.category || "");
        if (catNormalized.includes(searchNormalized)) {
          score += 20;
        }
        
        // Match descriptions
        const combinedDescRaw = [
          (food.super_tags?.join(" ") || ""),
          (food.nutrition || ""),
          (food.benefits?.join(" ") || ""),
          food.disease_prevention ? JSON.stringify(food.disease_prevention) : ""
        ].join(' ').toLowerCase();
        const combinedDescNorm = removeDiacritics(combinedDescRaw);
        
        if (hasDiacritics) {
           if (combinedDescRaw.includes(searchRaw)) score += 10;
        } else {
           if (combinedDescNorm.includes(searchNormalized)) score += 10;
        }
        
        // Fallback word by word
        if (score === 0) {
           if (hasDiacritics) {
             if (searchRawWords.every(word => nameRaw.includes(word) || combinedDescRaw.includes(word))) score += 5;
           } else {
             if (searchWords.every(word => nameNormalized.includes(word) || combinedDescNorm.includes(word))) score += 5;
           }
        }

        return { food, score };
      });

      // Filter out score 0 and sort by score descending
      filteredFoods = scoredFoods.filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.food);
    }

    // Since we are returning a section list, we only group if NOT searching and NO filter is active.
    // If searching or filtering, we display it as a single flat list to respect the sort order!
    if (searchText || activeFilter !== 'Tất cả') {
      const title = searchText ? 'Kết quả tìm kiếm' : `Top thực phẩm: ${activeFilter}`;
      return [{ title, data: [filteredFoods] }];
    }

    const grouped = filteredFoods.reduce((acc, food) => {
      const category = food.main_category || "Các món khác";
      if (!acc[category]) acc[category] = [];
      acc[category].push(food);
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      title: key,
      data: [grouped[key]]
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
        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: theme.cardBg, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
        >
          <Text style={{ color: theme.text, fontWeight: 'bold', flex: 1 }}>
            Bộ lọc: <Text style={{ color: theme.primary }}>{activeFilter}</Text>
          </Text>
          <Text style={{ color: theme.textMuted }}>{showFilters ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            {FILTER_OPTIONS.map(filter => (
              <TouchableOpacity 
                key={filter} 
                onPress={() => {
                  setActiveFilter(filter);
                  setShowFilters(false);
                }}
                style={{ backgroundColor: activeFilter === filter ? theme.primary : theme.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: activeFilter === filter ? theme.primary : theme.border }}
              >
                <Text style={{ color: activeFilter === filter ? '#fff' : theme.text, fontWeight: 'bold', fontSize: 13 }}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <SectionList
        sections={sectionsData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, justifyContent: 'flex-start' }}>
            {item.map(f => (
              <FoodGridItem key={f.id} item={f} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
            ))}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionListHeader}><Text style={styles.sectionListHeaderText}>{title}</Text></View>
        )}
        contentContainerStyle={styles.listContainer}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}
