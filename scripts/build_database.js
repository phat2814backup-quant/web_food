const fs = require('fs');
const path = require('path');

const dataSourcePath = path.resolve(__dirname, '..', 'data_source');
const sourceFoodsPath = path.join(dataSourcePath, 'source_per_food.md');
const sourceMedicalPath = path.join(dataSourcePath, 'Source_medical.md');
const sourceSuperPath = path.join(dataSourcePath, 'source_supper_food.md');
const jsonOutputPath = path.resolve(__dirname, '..', 'data.json');

const normalizeStr = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
};

const generateId = (name) => {
  return normalizeStr(name).replace(/\s+/g, '_').toUpperCase();
};

const parseNum = (match) => {
  if (!match) return 0;
  return parseFloat(match[1].replace(',', '.'));
};

const badFoods = [
  // Nhóm Đồ uống ngọt
  { id: "TRA_SUA", name: "Trà sữa trân châu", category: "Đồ uống công nghiệp", nutrition: "Chứa rất nhiều đường tinh luyện, kem béo thực vật (trans fat) và tinh bột từ trân châu.", benefits: ["Cung cấp năng lượng tức thời."], bad_combinations: [], consumption_tips: "Nên giới hạn 1-2 lần/tháng và chọn mức 0-30% đường." },
  { id: "NUOC_NGOT", name: "Nước ngọt có gas", category: "Đồ uống công nghiệp", nutrition: "Chứa lượng đường khổng lồ (khoảng 39g/lon), phẩm màu và axit photphoric làm mòn men răng.", benefits: ["Giải khát tạm thời."], bad_combinations: [], consumption_tips: "Hãy đổi sang uống nước lọc hoặc nước ép trái cây không đường." },
  { id: "NUOC_TANG_LUC", name: "Nước tăng lực", category: "Đồ uống công nghiệp", nutrition: "Nhiều đường, caffeine hàm lượng cao và các chất kích thích nhân tạo.", benefits: ["Giúp tỉnh táo tạm thời."], bad_combinations: [], consumption_tips: "Làm nhịp tim nhanh, hồi hộp, gây mất ngủ." },
  { id: "GA_RAN", name: "Gà rán công nghiệp", category: "Thức ăn nhanh", nutrition: "Nhiều dầu mỡ, lớp bột chiên hút nhiều dầu (trans fat và bão hòa), giàu calo nhưng nghèo vi chất.", benefits: ["Rất hấp dẫn, ngon miệng và tiện lợi."], bad_combinations: [], consumption_tips: "Dầu chiên đi chiên lại sinh ra chất độc. Gây nóng trong, nổi mụn, béo phì." },
  { id: "KHOAI_TAY_CHIEN", name: "Khoai tây chiên", category: "Thức ăn nhanh", nutrition: "Chứa nhiều tinh bột tiêu hóa nhanh, dầu mỡ và lượng muối natri cao. Nhiệt độ cao sinh ra acrylamide.", benefits: ["Ăn vặt giòn ngon."], bad_combinations: [], consumption_tips: "Dư thừa muối làm hại thận và tăng huyết áp sớm." },
  { id: "HAMBURGER", name: "Hamburger", category: "Thức ăn nhanh", nutrition: "Chứa thịt chế biến, phô mai nhiều béo, vỏ bánh mì trắng (carbohydrate tinh chế).", benefits: ["Nhanh chóng no bụng."], bad_combinations: [], consumption_tips: "Thiếu chất xơ nghiêm trọng, gây táo bón và chậm tiêu." },
  { id: "PIZZA", name: "Pizza công nghiệp", category: "Thức ăn nhanh", nutrition: "Dư thừa tinh bột tinh chế, nhiều chất béo bão hòa từ phô mai và thịt xông khói.", benefits: ["Món ăn tiệc tùng hấp dẫn."], bad_combinations: [], consumption_tips: "Lượng calo rất khủng (khoảng 300 kcal/miếng)." },
  { id: "MI_GOI", name: "Mì ăn liền", category: "Thực phẩm chế biến sẵn", nutrition: "Sợi mì chiên qua dầu (nhiều béo bão hòa), gói gia vị chứa rất nhiều muối (natri) và chất điều vị (MSG).", benefits: ["Cứu đói nhanh chóng, dễ bảo quản."], bad_combinations: [], consumption_tips: "Gây gánh nặng cho gan và thận, thiếu chất xơ, vitamin và khoáng chất." },
  { id: "XUC_XICH", name: "Xúc xích công nghiệp", category: "Thịt chế biến", nutrition: "Chứa nhiều chất bảo quản (nitrate, nitrite), nhiều muối và chất béo bão hòa. Ít thịt nguyên chất.", benefits: ["Tiện lợi, dễ chế biến."], bad_combinations: [], consumption_tips: "WHO xếp thịt chế biến vào nhóm gây ung thư nếu ăn thường xuyên." }
];

const diseasesDB = [
  { id: 'tieu_duong', name: 'Tiểu đường / Mỡ máu', desc: 'Rối loạn chuyển hóa đường và lipid.' },
  { id: 'tim_mach', name: 'Tim mạch & Huyết áp', desc: 'Các vấn đề liên quan đến tuần hoàn, mảng bám thành mạch và huyết áp cao.' },
  { id: 'tieu_hoa', name: 'Tiêu hóa & Dạ dày', desc: 'Cần thực phẩm dễ tiêu, giàu chất xơ hòa tan hoặc lợi khuẩn.' },
  { id: 'xuong_khop', name: 'Xương khớp (Gout, Loãng xương)', desc: 'Cần canxi, khoáng chất nhưng hạn chế purin (với Gout).' },
  { id: 'beo_phi', name: 'Thừa cân / Béo phì', desc: 'Cần thực phẩm ít calo, giàu chất xơ, tạo cảm giác no lâu.' },
];

const dietsDB = [
  { id: 'mediterranean', name: 'Địa Trung Hải', desc: 'Nhiều rau củ, trái cây, ngũ cốc nguyên hạt, đậu, hạt, dầu ô liu. Rất tốt cho tim mạch.' },
  { id: 'blue_zones', name: 'Vùng Xanh (Blue Zones)', desc: '90-95% calo từ thực vật. Đậu là cốt lõi. Thịt đỏ rất ít. Ăn no 80% (Hara Hachi Bu).' },
  { id: 'longevity', name: 'Longevity (Valter Longo)', desc: 'Protein thấp-vừa, chủ yếu thực vật và cá. Nhịn ăn gián đoạn nhẹ.' },
  { id: 'dash', name: 'DASH', desc: 'Nhiều rau, ít muối, giảm huyết áp.' },
];

const isHarmful = (cat, title) => {
  return title.includes('Đợt 11') || title.includes('Gây hại') || title.includes('Nhóm 11') || cat.includes('công nghiệp') || cat.includes('chế biến') || cat.includes('nhanh');
};

function determineCures(foodName, cat, title) {
  if (isHarmful(cat, title)) return [];
  const cures = [];
  if (cat.includes('rau') || cat.includes('trái cây') || cat.includes('đậu')) cures.push('tim_mach', 'beo_phi');
  if (cat.includes('đậu') || cat.includes('hạt') || cat.includes('nấm')) cures.push('tieu_duong');
  if (cat.includes('hải sản') || cat.includes('sữa')) cures.push('xuong_khop');
  if (cat.includes('lên men') || cat.includes('rau')) cures.push('tieu_hoa');
  return cures;
}

function determineAvoids(foodName, cat, title) {
  const avoids = [];
  if (isHarmful(cat, title)) {
    avoids.push('tim_mach', 'beo_phi', 'tieu_duong');
    if (cat.includes('đồ uống')) avoids.push('tieu_hoa');
  }
  if (cat.includes('hải sản') || foodName.includes('thịt bò') || foodName.includes('nội tạng')) avoids.push('xuong_khop'); // Gout
  if (cat.includes('trái cây') && (foodName.includes('nhãn') || foodName.includes('vải') || foodName.includes('sầu riêng'))) avoids.push('tieu_duong');
  return avoids;
}

function determineDiets(foodName, cat, title) {
  if (isHarmful(cat, title)) return [];
  const diets = [];
  if (cat.includes('rau') || cat.includes('đậu') || cat.includes('hạt') || cat.includes('trái cây') || cat.includes('hải sản')) {
    diets.push('mediterranean', 'blue_zones', 'longevity');
  }
  if (cat.includes('rau') || cat.includes('trái cây') || cat.includes('đậu')) diets.push('dash');
  return diets;
}

function parseSuperFoods() {
  let superContent = '';
  try {
    superContent = fs.readFileSync(sourceSuperPath, 'utf8');
  } catch(e) {
    console.error('Không tìm thấy source_supper_food.md', e.message);
    return [];
  }
  
  let superData = [];
  const categoryRegex = /"category_name":\s*"([^"]+)"[\s\S]*?"top_foods":\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = categoryRegex.exec(superContent)) !== null) {
     const catName = match[1];
     const foodsBlock = match[2];
     const foodRegex = /"food_name":\s*"([^"]+)"/g;
     let foodMatch;
     let idx = 0;
     while ((foodMatch = foodRegex.exec(foodsBlock)) !== null) {
       superData.push({ category: catName, food: normalizeStr(foodMatch[1]), index: idx });
       idx++;
     }
  }
  return superData;
}

function updateData() {
  console.log("1. Đang biên dịch dữ liệu từ file Markdown...");
  try {
    const markdownContent = fs.readFileSync(sourceFoodsPath, 'utf8');
    const sections = markdownContent.split('### ');
    let foods = [];

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const lines = section.split('\n');
      const title = lines[0].trim().replace(/Đợt/gi, 'Nhóm');
      
      const jsonMatches = [...section.matchAll(/```json\s+([\s\S]*?)\s+```/g)];
      
      for (const match of jsonMatches) {
        if (match && match[1]) {
          try {
            const jsonBlock = JSON.parse(match[1]);
            const arr = Array.isArray(jsonBlock) ? jsonBlock : [jsonBlock];
            
            arr.forEach(item => {
              item.id = generateId(item.name);
              item.main_category = title;
              item.cures = determineCures(item.name.toLowerCase(), item.category.toLowerCase(), title);
              item.avoids = determineAvoids(item.name.toLowerCase(), item.category.toLowerCase(), title);
              item.diets = determineDiets(item.name.toLowerCase(), item.category.toLowerCase(), title);
              foods.push(item);
            });
          } catch (e) {
            console.error("Lỗi parse JSON trong section:", title, e.message);
          }
        }
      }
    }

    // Gắn thêm badFoods
    badFoods.forEach(bf => {
      bf.main_category = '🔴 Nhóm 11: Thực phẩm Gây hại (Cần hạn chế)';
      bf.cures = [];
      bf.avoids = determineAvoids(bf.name.toLowerCase(), bf.category.toLowerCase(), bf.main_category);
      bf.diets = [];
      foods.push(bf);
    });

    console.log("2. Đang quét Dữ liệu Y khoa...");
    let medicalContent = '';
    try {
      medicalContent += fs.readFileSync(sourceMedicalPath, 'utf8') + '\n';
    } catch (e) {
      console.error('Không tìm thấy Source_medical.md', e.message);
    }
    
    try {
      const ferPath = path.join(dataSourcePath, 'Source_fer_food_benh.md');
      medicalContent += fs.readFileSync(ferPath, 'utf8') + '\n';
    } catch (e) {
      console.error('Không tìm thấy Source_fer_food_benh.md', e.message);
    }

    const acronymMap = {
      "rng": "rau ngót",
      "rm": "rau muống",
      "bd": "bí đỏ",
      "md": "mướp đắng",
      "mb": "mướp đắng",
      "tmb": "mướp đắng",
      "dtau": "trái dâu tằm",
      "dt": "dâu tằm",
      "toi": "tỏi",
      "gung": "gừng",
      "nghe": "nghệ",
      "rcn": "rau chùm ngây",
      "ct": "cần tây",
      "toi_den": "tỏi đen",
      "tgg": "trứng gà",
      "ugg": "ức gà",
      "tbt": "thịt bò",
      "tln": "thịt lợn nạc",
      "cbg": "chim bồ câu",
      "tvt": "thịt vịt",
      "sc": "sữa chua",
      "sbt": "sữa bò tươi",
      "gg": "gan gà",
      "ys": "yến sào",
      "dcc": "dưa cải chua",
      "kc": "kim chi",
      "tdn": "tương đậu nành",
      "tđn": "tương đậu nành",
      "rncc": "rượu nếp cẩm",
      "gt": "giấm",
      "thc": "trà hoa cúc",
      "ndt": "nước dừa tươi",
      "mtr": "mủ trôm",
      "ty": "tuyết yến",
      "hd": "hạt điều",
      "hmc": "hạt macca",
      "hb": "hạt bí ngô",
      "hc": "hạt chia",
      "hhm": "hạt hướng dương",
      "mgc": "măng cụt",
      "cd": "chanh dây",
      "hg": "hồng giòn",
      "nl": "nhãn",
      "vl": "vải tươi"
    };

    const medicalJsonMatches = [...medicalContent.matchAll(/```json\s+([\s\S]*?)\s+```/g)];
    const rawMatches = [...medicalContent.matchAll(/\[\s*\{\s*"(id|name)"[\s\S]*?\n\]/g)];
    const allBlocks = [...medicalJsonMatches.map(m => m[1]), ...rawMatches.map(m => m[0])];

    for (const block of allBlocks) {
      try {
        let cleanedBlock = block.replace(/\n/g, ' ').replace(/\r/g, '');
        cleanedBlock = cleanedBlock.replace(/,\s*([}\]])/g, '$1');
        
        const medicalData = JSON.parse(cleanedBlock);
        const arr = Array.isArray(medicalData) ? medicalData : [medicalData];
        
        arr.forEach(medItem => {
          const mId = (medItem.id || medItem.name || "").toLowerCase();
          if (!mId) return;

          const mappedName = acronymMap[mId] || mId;
          const targetNorm = normalizeStr(mappedName);

          const targetFood = foods.find(f => normalizeStr(f.name).includes(targetNorm) || targetNorm.includes(normalizeStr(f.name)));
          if (targetFood) {
            if (medItem.disease_prevention) {
              targetFood.disease_prevention = medItem.disease_prevention;
            } else if (medItem.healthBenefits && Array.isArray(medItem.healthBenefits)) {
              // Convert healthBenefits array to disease_prevention format
              targetFood.disease_prevention = medItem.healthBenefits.map(hb => ({
                disease: hb.split(',')[0].trim(), // Lấy vế đầu làm tên bệnh/tác dụng
                effect: hb,
                evidence_level: "Khoa học hiện đại (tổng quát)",
                explanation: medItem.scientificEvidence || medItem.description || "Dữ liệu được tổng hợp từ nguồn thông tin chung."
              }));
            }
          }
        });
      } catch (e) {
        // Có thể bỏ qua console error nếu bị lặp nhiều do regex quét trúng block không hợp lệ
      }
    }

    console.log("3. Đang quét Siêu thực phẩm (source_supper_food.md)...");
    const superData = parseSuperFoods();

    // Map bad_combinations từ TÊN sang ID
    // 1. Tạo lookup map Tên Normalize -> ID
    const nameToId = {};
    foods.forEach(f => {
      nameToId[normalizeStr(f.name)] = f.id;
    });

    foods.forEach(food => {
      // Chuyển bad_combinations
      if (food.bad_combinations && food.bad_combinations.length > 0) {
        food.bad_combinations = food.bad_combinations.map(bc => {
           let targetId = bc.food; // mặc định giữ nguyên text nếu không tìm thấy
           // Tìm ID
           const normB = normalizeStr(bc.food);
           for (const [nName, nId] of Object.entries(nameToId)) {
              if (nName.includes(normB) || normB.includes(nName)) {
                 targetId = nId;
                 break;
              }
           }
           return {
             food_id: targetId,
             food_name: bc.food, // giữ lại tên để hiển thị
             reason: bc.reason
           };
        });
      }

      // 4. Enrich super_tags
      const nut = (food.nutrition || '').toLowerCase();
      food.super_tags = [];
      food.super_tags_order = {};

      if (food.disease_prevention && food.disease_prevention.length >= 3) {
        food.super_tags.push("🛡️ Đa dụng Phòng bệnh");
        food.super_tags_order["🛡️ Đa dụng Phòng bệnh"] = 0;
      }

      const foodNameNorm = normalizeStr(food.name);
      superData.forEach(sd => {
        if (foodNameNorm.includes(sd.food) || sd.food.includes(foodNameNorm)) {
           let badge = '✨';
           if(sd.category.includes('Vitamin C')) badge = '🍊';
           if(sd.category.includes('Chống oxy hóa')) badge = '🍷';
           if(sd.category.includes('Omega-3')) badge = '🐟';
           if(sd.category.includes('Protein')) badge = '💪';
           if(sd.category.includes('vi sinh')) badge = '🦠';
           if(sd.category.includes('Bổ máu')) badge = '🩸';
           if(sd.category.includes('phục hồi')) badge = '🌿';
           if(sd.category.includes('Chất xơ')) badge = '🌾';
           
           const tag = `${badge} ${sd.category}`;
           if (!food.super_tags.includes(tag)) {
             food.super_tags.push(tag);
             food.super_tags_order[tag] = sd.index;
           }
        }
      });
    });

    if (foods.length > 0) {
      const masterData = { foods, diseases: diseasesDB, diets: dietsDB };
      fs.writeFileSync(jsonOutputPath, JSON.stringify(masterData, null, 2), 'utf8');
      console.log(`\nSuccess! Đã xuất data.json với ${masterData.foods.length} món ăn.`);
    } else {
      console.warn("⚠️ Không tìm thấy dữ liệu.");
    }
  } catch (error) {
    console.error("Lỗi:", error.message);
  }
}

updateData();
