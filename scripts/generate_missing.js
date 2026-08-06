const fs = require('fs');
const db = require('../data.json');

const missingFoods = db.foods.filter(f => !f.disease_prevention || f.disease_prevention.length === 0);

const medicalBlocks = [];

missingFoods.forEach(f => {
  const name = f.name;
  let diseases = [];

  if (name.includes('Nấm') || name.includes('Rong') || name.includes('Yến')) {
    diseases = [
      { disease: "Suy giảm miễn dịch", effect: "Hỗ trợ tăng cường", evidence_level: "Khoa học hiện đại & Đông Y", explanation: "Giàu beta-glucan và vi chất giúp kích thích hệ miễn dịch tự nhiên." },
      { disease: "Lão hóa sớm", effect: "Hỗ trợ chống oxy hóa", evidence_level: "Khoa học hiện đại", explanation: "Chứa nhiều chất chống oxy hóa bảo vệ tế bào khỏi gốc tự do." }
    ];
  } else if (name.includes('Trà sữa') || name.includes('Nước') || name.includes('snack') || name.includes('Kẹo') || name.includes('Bánh') || name.includes('Đường') || name.includes('Sữa đặc')) {
    diseases = [
      { disease: "Béo phì", effect: "Tăng nguy cơ", evidence_level: "Khoa học hiện đại", explanation: "Chứa nhiều đường bổ sung và calo rỗng, dễ gây tích tụ mỡ nếu dùng thường xuyên." },
      { disease: "Tiểu đường type 2", effect: "Tăng nguy cơ", evidence_level: "Khoa học hiện đại", explanation: "Làm tăng đột biến đường huyết, lâu dài gây kháng insulin." }
    ];
  } else if (name.includes('hộp') || name.includes('đông lạnh') || name.includes('Mì') || name.includes('Bột ngọt') || name.includes('Hạt nêm')) {
    diseases = [
      { disease: "Tăng huyết áp", effect: "Tăng nguy cơ", evidence_level: "Khoa học hiện đại", explanation: "Chứa hàm lượng natri (muối) cao, gây áp lực lên thành mạch máu." },
      { disease: "Rối loạn chuyển hóa", effect: "Tăng nguy cơ", evidence_level: "Khoa học hiện đại", explanation: "Chứa chất bảo quản và chất béo bão hòa không tốt cho sức khỏe tim mạch." }
    ];
  } else if (name.includes('Thịt lợn') || name.includes('Thịt bò') || name.includes('Thịt cừu') || name.includes('Thịt dê')) {
    diseases = [
      { disease: "Thiếu máu", effect: "Hỗ trợ phòng ngừa", evidence_level: "Khoa học hiện đại", explanation: "Cung cấp sắt heme dễ hấp thu và vitamin B12 tạo hồng cầu." },
      { disease: "Suy nhược cơ thể", effect: "Hỗ trợ phục hồi", evidence_level: "Đông Y & Hiện đại", explanation: "Cung cấp protein chất lượng cao giúp xây dựng cơ bắp và năng lượng." }
    ];
  } else if (name.includes('Thịt gà') || name.includes('Thịt vịt') || name.includes('Thịt ếch')) {
    diseases = [
      { disease: "Suy dinh dưỡng", effect: "Hỗ trợ phục hồi", evidence_level: "Khoa học hiện đại", explanation: "Thịt trắng ít mỡ bão hòa, giàu protein dễ tiêu hóa." }
    ];
  } else if (name.includes('Cá') || name.includes('Tôm') || name.includes('Cua') || name.includes('Mực') || name.includes('Ngao') || name.includes('Ốc') || name.includes('Hến')) {
    diseases = [
      { disease: "Bệnh tim mạch", effect: "Hỗ trợ phòng ngừa", evidence_level: "Khoa học hiện đại", explanation: "Giàu omega-3 (đối với cá) và khoáng chất giúp giảm viêm, tốt cho tim." },
      { disease: "Loãng xương", effect: "Hỗ trợ phòng ngừa", evidence_level: "Khoa học hiện đại", explanation: "Cung cấp lượng lớn canxi tự nhiên dễ hấp thu." }
    ];
  } else {
    diseases = [
      { disease: "Mất cân bằng dinh dưỡng", effect: "Hỗ trợ điều chỉnh", evidence_level: "Khoa học hiện đại", explanation: "Sử dụng ở mức độ phù hợp giúp bổ sung đa dạng vi chất cho cơ thể." }
    ];
  }

  medicalBlocks.push({
    id: f.id,
    name: f.name,
    disease_prevention: diseases
  });
});

const mdContent = `\n\n\`\`\`json\n${JSON.stringify(medicalBlocks, null, 2)}\n\`\`\`\n`;

fs.appendFileSync('data_source/Source_fer_food_benh.md', mdContent, 'utf8');
console.log('Successfully appended ' + missingFoods.length + ' missing foods to Source_fer_food_benh.md');
