const fs = require('fs');
const path = require('path');

const markdownPath = path.resolve(__dirname, '..', 'source_per_food.md');
const jsonOutputPath = path.resolve(__dirname, 'data.json');

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
  return title.includes('Đợt 11') || title.includes('Gây hại') || cat.includes('công nghiệp') || cat.includes('chế biến') || cat.includes('nhanh');
};

function determineCures(foodName, cat, title) {
  if (isHarmful(cat, title)) return [];

  const cures = [];
  if (cat.includes('rau') || cat.includes('trái cây') || cat.includes('đậu')) cures.push('tim_mach', 'beo_phi');
  if (cat.includes('hạt') || cat.includes('ngũ cốc')) cures.push('tieu_duong', 'tim_mach');
  if (cat.includes('sữa') || cat.includes('đậu') || foodName.includes('rau ngót') || foodName.includes('rau dền')) cures.push('xuong_khop');
  if (cat.includes('nấm') || cat.includes('rau')) cures.push('tieu_hoa');
  return [...new Set(cures)];
}

function determineAvoids(foodName, cat, title) {
  const avoids = [];
  if (isHarmful(cat, title)) {
    avoids.push('beo_phi', 'tim_mach', 'tieu_duong', 'tieu_hoa'); // Harmful foods are bad for all these
    return avoids;
  }

  if (cat.includes('thịt đỏ') || foodName.includes('thịt bò') || foodName.includes('thịt lợn')) avoids.push('tim_mach', 'xuong_khop');
  if (foodName.includes('trái cây ngọt') || foodName.includes('nhãn') || foodName.includes('vải')) avoids.push('tieu_duong');
  if (cat.includes('hải sản') || foodName.includes('hàu') || foodName.includes('tôm')) avoids.push('xuong_khop');
  return avoids;
}

function determineDiets(foodName, cat, title) {
  if (isHarmful(cat, title)) return [];

  const diets = [];
  if (cat.includes('rau') || cat.includes('trái cây') || cat.includes('đậu') || cat.includes('hạt') || cat.includes('ngũ cốc')) {
    diets.push('mediterranean', 'blue_zones', 'longevity', 'dash');
  }
  if (cat.includes('cá') || cat.includes('hải sản')) {
    diets.push('mediterranean', 'longevity');
  }
  return diets;
}

function updateData() {
  try {
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    const sections = markdownContent.split('### ');
    let foods = [];

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const lines = section.split('\n');
      const title = lines[0].trim();
      
      const jsonMatches = [...section.matchAll(/```json\s+([\s\S]*?)\s+```/g)];
      
      for (const match of jsonMatches) {
        if (match && match[1]) {
          try {
            const jsonBlock = JSON.parse(match[1]);
            const arr = Array.isArray(jsonBlock) ? jsonBlock : [jsonBlock];
            
            arr.forEach(item => {
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

    if (foods.length > 0) {
      const db = {
        foods,
        diseases: diseasesDB,
        diets: dietsDB
      };
      fs.writeFileSync(jsonOutputPath, JSON.stringify(db, null, 2), 'utf8');
      console.log(`✅ Cập nhật thành công! Trích xuất ${foods.length} món ăn và tạo cấu trúc Cơ sở dữ liệu chéo.`);
    } else {
      console.warn("⚠️ Không tìm thấy dữ liệu JSON nào hợp lệ trong file Markdown.");
    }
  } catch (error) {
    console.error("Lỗi trong quá trình cập nhật dữ liệu:", error.message);
  }
}

updateData();
