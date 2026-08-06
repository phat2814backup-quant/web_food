const fs = require('fs');
const path = require('path');

const markdownPath = path.resolve(__dirname, '..', 'source_per_food.md');

// A generic dictionary of bad combinations based on keywords in food names or categories
function getGenericBadCombination(foodName, category) {
  const name = foodName.toLowerCase();
  const cat = category.toLowerCase();

  if (cat.includes('rau') || name.includes('rau')) {
    return [
      {
        "food": "Sữa hoặc Canxi liều cao",
        "reason": "Một số loại rau xanh chứa nhiều axit oxalic, khi kết hợp với canxi sẽ tạo thành canxi oxalat gây cản trở hấp thu và dễ hình thành sỏi thận."
      }
    ];
  } else if (cat.includes('trái cây') || cat.includes('quả') || name.includes('trái') || name.includes('quả')) {
    return [
      {
        "food": "Hải sản có vỏ (Tôm, Cua)",
        "reason": "Theo y học cổ truyền, ăn nhiều trái cây giàu Vitamin C cùng hải sản có vỏ có thể làm vi chất khó hấp thu, dễ gây lạnh bụng hoặc rối loạn tiêu hóa."
      }
    ];
  } else if (cat.includes('thịt') || cat.includes('cá') || cat.includes('đạm')) {
    return [
      {
        "food": "Trà đặc (Trà xanh/Trà đen)",
        "reason": "Tannin trong trà sẽ kết hợp với protein và sắt trong thịt/cá tạo thành chất khó tiêu, làm giảm khả năng hấp thu dinh dưỡng."
      }
    ];
  } else if (cat.includes('hạt') || cat.includes('ngũ cốc') || cat.includes('đậu')) {
    return [
      {
        "food": "Thực phẩm nhiều đường tinh luyện",
        "reason": "Kết hợp ngũ cốc với quá nhiều đường sẽ làm tăng đột biến lượng đường trong máu, giảm lợi ích ổn định đường huyết của các loại hạt."
      }
    ];
  } else if (cat.includes('nấm')) {
    return [
      {
        "food": "Rượu bia",
        "reason": "Một số loại nấm ăn cùng rượu có thể gây ra phản ứng khó chịu, nhức đầu hoặc làm giảm lợi ích giải độc của nấm."
      }
    ];
  } else {
    return [
      {
        "food": "Thực phẩm chế biến sẵn (Xúc xích, thịt xông khói)",
        "reason": "Chứa nhiều chất bảo quản và muối, làm giảm tác dụng chống oxy hóa và thanh lọc cơ thể của món ăn này."
      }
    ];
  }
}

function processMarkdown() {
  try {
    let content = fs.readFileSync(markdownPath, 'utf8');
    
    // Match JSON blocks
    const regex = /```json\s+([\s\S]*?)\s+```/g;
    
    content = content.replace(regex, (match, jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        let modified = false;

        const updateArray = (arr) => {
          for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (Array.isArray(item.bad_combinations) && item.bad_combinations.length === 0) {
              item.bad_combinations = getGenericBadCombination(item.name, item.category);
              modified = true;
            }
          }
        };

        if (Array.isArray(parsed)) {
          updateArray(parsed);
        } else {
          if (Array.isArray(parsed.bad_combinations) && parsed.bad_combinations.length === 0) {
            parsed.bad_combinations = getGenericBadCombination(parsed.name, parsed.category);
            modified = true;
          }
        }

        if (modified) {
          return "```json\n" + JSON.stringify(parsed, null, 2) + "\n```";
        }
        return match;
      } catch (e) {
        console.error("Lỗi parse JSON trong file:", e.message);
        return match;
      }
    });

    fs.writeFileSync(markdownPath, content, 'utf8');
    console.log("✅ Đã tự động điền các phần bad_combinations bị thiếu vào file source_per_food.md!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  }
}

processMarkdown();
