import React, { useState, useMemo } from 'react';
import { SafeAreaView, View, TextInput, ScrollView, TouchableOpacity, Text, SectionList, useColorScheme } from 'react-native';
import { getTheme, commonStyles as styles } from '../styles/theme';
import { FoodRow, removeDiacritics } from '../components/Shared';
import db from '../../data.json';

const foodData = db.foods || [];
const allSuperTags = Array.from(new Set(foodData.flatMap(f => f.super_tags || [])));
const FILTER_OPTIONS = ['Tất cả', ...allSuperTags];

export default function HomeScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const sectionsData = useMemo(() => {
    let filteredFoods = [...foodData];
    
    if (activeFilter !== 'Tất cả') {
      filteredFoods = filteredFoods.filter(f => f.super_tags?.includes(activeFilter));
      
      // Sort specific tags from highest to lowest if numeric data is available
      if (activeFilter.includes('Siêu Sắt')) {
        filteredFoods.sort((a, b) => (b.numIron || 0) - (a.numIron || 0));
      } else if (activeFilter.includes('Siêu Canxi')) {
        filteredFoods.sort((a, b) => (b.numCalcium || 0) - (a.numCalcium || 0));
      } else if (activeFilter.includes('Siêu Protein')) {
        filteredFoods.sort((a, b) => (b.numProtein || 0) - (a.numProtein || 0));
      } else if (activeFilter.includes('Siêu Vitamin C')) {
        filteredFoods.sort((a, b) => (b.numVitC || 0) - (a.numVitC || 0));
      }
    }

    if (searchText) {
      const searchNormalized = removeDiacritics(searchText);
      const searchRaw = searchText.toLowerCase().trim();
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
      return [{ title, data: filteredFoods }];
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
