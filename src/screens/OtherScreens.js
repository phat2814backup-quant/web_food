import React, { useContext } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, FlatList, Linking, useColorScheme } from 'react-native';
import { getTheme, commonStyles as styles } from '../styles/theme';
import { FoodRow, SectionCard } from '../components/Shared';
import { MealContext } from '../context/MealContext';
import db from '../../data.json';

const foodData = db.foods || [];
const diseasesData = db.diseases || [];
const dietsData = db.diets || [];

export function DiseasesScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ backgroundColor: '#fff3cd', padding: 12, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba' }}>
        <Text style={{ color: '#856404', fontSize: 13, textAlign: 'center' }}>
          ⚠️ <Text style={{ fontWeight: 'bold' }}>Lưu ý Y Khoa:</Text> Các gợi ý trị bệnh và kiêng kỵ được suy luận tự động từ cơ sở dữ liệu dựa trên thành phần dinh dưỡng. Đây không phải là lời khuyên y tế cá nhân hóa. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa trước khi áp dụng.
        </Text>
      </View>
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

export function DietsScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <TouchableOpacity style={{ margin: 16, marginBottom: 0, padding: 12, backgroundColor: theme.primary, borderRadius: 8, alignItems: 'center' }} onPress={() => navigation.navigate('FoodsTab')}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>🏠 Về Màn Hình Thực Phẩm</Text>
      </TouchableOpacity>
      <FlatList
        data={dietsData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.cardRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]} onPress={() => navigation.navigate('DietDetail', { diet: item })}>
            <Text style={styles.cardIcon}>🌿</Text>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.foodSummary, { color: theme.textMuted }]} numberOfLines={2}>{item.desc?.replace(/\n/g, ' ')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

export function CausesScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ backgroundColor: '#fff3cd', padding: 12, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba' }}>
        <Text style={{ color: '#856404', fontSize: 13, textAlign: 'center' }}>
          ⚠️ <Text style={{ fontWeight: 'bold' }}>Lưu ý Y Khoa:</Text> Các gợi ý trị bệnh và kiêng kỵ được suy luận tự động từ cơ sở dữ liệu dựa trên thành phần dinh dưỡng. Đây không phải là lời khuyên y tế cá nhân hóa. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa trước khi áp dụng.
        </Text>
      </View>
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

export function CompareScreen({ route }) {
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

export function FoodDetailScreen({ route, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { food } = route.params;
  const { meal, addToMeal, removeFromMeal } = useContext(MealContext);
  const inMeal = meal.find(f => f.id === food.id);

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

      {/* Combos */}
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
              <Text style={styles.comboFoodBad}>{c.food_name || c.food}</Text>
              <Text style={[styles.comboReason, { color: theme.text }]}>{c.reason}</Text>
            </View>
          ))}
        </SectionCard>
      )}
    </ScrollView>
  );
}

export function DiseaseDetailScreen({ route, navigation }) {
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

export function DietDetailScreen({ route, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const { diet } = route.params;
  const approvedFoods = foodData.filter(f => f.diets?.includes(diet.id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerHero, { backgroundColor: '#27ae60' }]}>
        <Text style={styles.heroTitle}>{diet.name}</Text>
        {diet.desc?.split('\n').map((line, i) => {
          const parts = line.split(':');
          if (parts.length > 1) {
             return <Text key={i} style={[styles.heroDesc, { textAlign: 'left', marginBottom: 8, fontSize: 14 }]}><Text style={{fontWeight: 'bold', color: '#fff'}}>{parts[0]}:</Text>{parts.slice(1).join(':')}</Text>
          }
          return <Text key={i} style={[styles.heroDesc, { textAlign: 'left', marginBottom: 8, fontSize: 14 }]}>{line}</Text>
        })}
      </View>

      <TouchableOpacity style={{ margin: 16, marginBottom: 0, padding: 12, backgroundColor: theme.primary, borderRadius: 8, alignItems: 'center' }} onPress={() => navigation.navigate('FoodsTab')}>
         <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>🏠 Trở Về Trang Chủ</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        <Text style={styles.sectionListHeaderText}>Thực phẩm phù hợp tiêu chuẩn</Text>
        {approvedFoods.map(f => (
          <FoodRow key={f.id} item={f} theme={theme} onPress={() => navigation.navigate('FoodDetail', { food: f })} />
        ))}
      </View>
    </ScrollView>
  );
}

export function CauseDetailScreen({ route, navigation }) {
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
