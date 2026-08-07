import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles as styles } from '../styles/theme';

export const removeDiacritics = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
};

export const iconForCategory = (category) => {
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

export const FoodRow = ({ item, onPress, theme }) => (
  <TouchableOpacity style={[styles.foodRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={onPress}>
    <Text style={styles.foodIcon}>{item.icon || iconForCategory(item.main_category + ' ' + item.category)}</Text>
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

export const FoodGridItem = ({ item, onPress, theme }) => {
  const isHarmful = (item.main_category || '').includes('Nhóm 11') || (item.main_category || '').includes('Gây hại');
  return (
  <TouchableOpacity 
    style={{ 
      width: 105, 
      backgroundColor: isHarmful ? '#fbe9e7' : theme.cardBg, 
      borderRadius: 12, 
      padding: 10, 
      alignItems: 'center', 
      marginBottom: 10, 
      marginRight: 6,
      borderWidth: 1, 
      borderColor: isHarmful ? '#ffcdd2' : theme.border,
      justifyContent: 'center'
    }} 
    onPress={onPress}
  >
    <Text style={{ fontSize: 40, marginBottom: 8 }}>{item.icon}</Text>
    <Text style={{ fontSize: 13, fontWeight: 'bold', color: isHarmful ? '#c0392b' : theme.text, textAlign: 'center' }} numberOfLines={2}>
      {item.name}
    </Text>
  </TouchableOpacity>
)};

export const SectionCard = ({ title, icon, color, children, theme }) => (
  <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionIcon, { color }]}>{icon}</Text>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </View>
);
