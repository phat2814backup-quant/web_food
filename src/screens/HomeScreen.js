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
    let filteredFoods = foodData;
    
    if (activeFilter !== 'Tất cả') {
      filteredFoods = filteredFoods.filter(f => f.super_tags?.includes(activeFilter));
    }

    if (searchText) {
      const searchNormalized = removeDiacritics(searchText);
      const searchWords = searchNormalized.split(' ').filter(Boolean);
      
      // Calculate scores
      const scoredFoods = filteredFoods.map(food => {
        const nameNormalized = removeDiacritics(food.name);
        let score = 0;

        // Exact match or start match
        if (nameNormalized === searchNormalized) {
          score += 100;
        } else if (nameNormalized.startsWith(searchNormalized)) {
          score += 80;
        } else if (nameNormalized.includes(searchNormalized)) {
          score += 50;
        }

        // Match categories/tags
        const catNormalized = removeDiacritics(food.category || "");
        if (catNormalized.includes(searchNormalized)) {
          score += 20;
        }
        
        // Match descriptions
        const combinedDesc = [
          removeDiacritics(food.nutrition || ""),
          removeDiacritics(food.benefits?.join(" ") || ""),
          food.disease_prevention ? removeDiacritics(JSON.stringify(food.disease_prevention)) : ""
        ].join(' ');
        
        if (combinedDesc.includes(searchNormalized)) {
          score += 10;
        }
        
        // Fallback word by word
        if (score === 0 && searchWords.every(word => nameNormalized.includes(word) || combinedDesc.includes(word))) {
          score += 5;
        }

        return { food, score };
      });

      // Filter out score 0 and sort by score descending
      filteredFoods = scoredFoods.filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.food);
    }

    // Since we are returning a section list, we only group if NOT searching.
    // If searching, we display it as a single flat list (by giving it one section) to respect the score sort order!
    if (searchText) {
      return [{ title: 'Kết quả tìm kiếm', data: filteredFoods }];
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
