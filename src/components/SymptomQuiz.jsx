import React, { useState, useMemo } from 'react';
import './SymptomQuiz.css';

// 35 granular, check-all-that-apply clinical symptoms grouped by TCM diagnostic categories
const symptomDatabase = [
  // Nhóm 1: Thân nhiệt & Mồ hôi
  { id: 's1', text: 'Sợ lạnh, chân tay thường xuyên lạnh giá, thích đắp chăn ấm', category: 'temp_sweat', scores: { deficiencyCold: 3, kidneyYang: 3 } },
  { id: 's2', text: 'Sợ nóng, người hay hầm hập bứt rứt, thích uống đồ lạnh mát', category: 'temp_sweat', scores: { excessHeat: 3 } },
  { id: 's3', text: 'Thường bị nóng bừng mặt (triều nhiệt) râm ran về chiều tối', category: 'temp_sweat', scores: { kidneyYin: 3 } },
  { id: 's4', text: 'Lòng bàn tay, bàn chân có cảm giác nóng rát, khó chịu', category: 'temp_sweat', scores: { kidneyYin: 3 } },
  { id: 's5', text: 'Lúc nóng lúc lạnh xen kẽ không đều, ngực tức nghẹn', category: 'temp_sweat', scores: { liverStagnation: 2 } },
  { id: 's6', text: 'Tự đổ nhiều mồ hôi ban ngày dù không vận động nặng hay nóng nực', category: 'temp_sweat', scores: { lungQiWeakness: 3, qiDeficiency: 2 } },
  { id: 's7', text: 'Đổ mồ hôi trộm khi ngủ say ban đêm, khi tỉnh dậy mồ hôi ngưng', category: 'temp_sweat', scores: { kidneyYin: 3 } },

  // Nhóm 2: Đầu & Ngũ quan
  { id: 's8', text: 'Hoa mắt, chóng mặt khi đứng lên ngồi xuống đột ngột, sắc mặt nhợt', category: 'head_senses', scores: { heartSpleenDef: 3, qiDeficiency: 2 } },
  { id: 's9', text: 'Đầu căng nặng như bị cuốn chặt dải vải, cơ thể nặng nề uể oải', category: 'head_senses', scores: { phlegmDamp: 3 } },
  { id: 's10', text: 'Đau căng giật nửa bên đầu hoặc vùng đỉnh đầu, miệng đắng chát', category: 'head_senses', scores: { liverStagnation: 3 } },
  { id: 's11', text: 'Mắt thường xuyên khô rát nhức mỏi, nhìn vật hay bị mờ nhòe', category: 'head_senses', scores: { kidneyYin: 3 } },
  { id: 's12', text: 'Tai ù như tiếng ve kêu o o hoặc thính lực giảm rõ rệt', category: 'head_senses', scores: { kidneyYin: 2, kidneyYang: 2 } },
  { id: 's13', text: 'Khô cổ khát họng, thích uống nước mát từng ngụm nhỏ liên tục', category: 'head_senses', scores: { kidneyYin: 3 } },
  { id: 's14', text: 'Miệng đắng chát khi mới thức dậy, hơi thở có mùi hoặc khô ráp', category: 'head_senses', scores: { liverStagnation: 3 } },

  // Nhóm 3: Ăn uống & Tiêu hóa
  { id: 's15', text: 'Ăn uống kém, miệng nhạt nhẽo không muốn ăn gì', category: 'diet_digestion', scores: { spleenStomachCold: 3, qiDeficiency: 2 } },
  { id: 's16', text: 'Ăn xong bụng đầy chướng, óc ách khó tiêu rất lâu không đỡ', category: 'diet_digestion', scores: { spleenStomachCold: 3, qiDeficiency: 2 } },
  { id: 's17', text: 'Hay bị ợ hơi, ợ chua hoặc hay thở dài vùng ngực bụng', category: 'diet_digestion', scores: { liverStagnation: 3 } },
  { id: 's18', text: 'Phân sống lỏng nát, đại tiện nhiều lần trong ngày sau ăn', category: 'diet_digestion', scores: { spleenStomachCold: 3, kidneyYang: 2 } },
  { id: 's19', text: 'Hay đau bụng tiêu chảy lúc sáng sớm thức dậy (Ngũ canh tả)', category: 'diet_digestion', scores: { kidneyYang: 3 } },
  { id: 's20', text: 'Đại tiện táo bón lâu ngày, phân khô kết cục đen cứng khó đi', category: 'diet_digestion', scores: { kidneyYin: 2, excessHeat: 2 } },
  { id: 's21', text: 'Phân dẻo nát dính bồn cầu dội khó sạch, cảm giác đi không hết phân', category: 'diet_digestion', scores: { phlegmDamp: 3 } },
  { id: 's22', text: 'Tiểu đêm nhiều lần (2 lần trở lên), nước tiểu trong dài', category: 'diet_digestion', scores: { kidneyYang: 3 } },
  { id: 's23', text: 'Nước tiểu ít sẫm màu, tiểu nóng rát râm ran dắt', category: 'diet_digestion', scores: { excessHeat: 3 } },

  // Nhóm 4: Giấc ngủ & Tinh thần
  { id: 's24', text: 'Khó vào giấc ngủ, ngủ mơ màng dễ tỉnh giấc, hay quên lo âu', category: 'sleep_mind', scores: { heartSpleenDef: 3, qiDeficiency: 1 } },
  { id: 's25', text: 'Dễ hồi hộp trống ngực đập thon thót lo sợ vô cớ', category: 'sleep_mind', scores: { heartSpleenDef: 3 } },
  { id: 's26', text: 'Hay giật mình tỉnh giấc giữa đêm (1h - 3h sáng) rồi trằn trọc suy nghĩ', category: 'sleep_mind', scores: { liverStagnation: 3 } },
  { id: 's27', text: 'Cơ thể nặng nề thèm ngủ cả ngày, ngủ dậy người uể oải', category: 'sleep_mind', scores: { phlegmDamp: 3, spleenStomachCold: 1 } },
  { id: 's28', text: 'Dễ nổi giận cáu gắt, tinh thần bực bội bứt rứt trong lòng', category: 'sleep_mind', scores: { liverStagnation: 3 } },
  { id: 's29', text: 'Tinh thần hay u uất, dễ lo âu buồn bực, hay thở dài giải uất', category: 'sleep_mind', scores: { liverStagnation: 3 } },

  // Nhóm 5: Đau nhức & Hô hấp
  { id: 's30', text: 'Đau mỏi âm ỉ ê ẩm vùng thắt lưng và đầu gối', category: 'pain_breath', scores: { kidneyYang: 3, kidneyYin: 3 } },
  { id: 's31', text: 'Đau nhức cơ khớp tê bì nặng nề khi thời tiết lạnh ẩm', category: 'pain_breath', scores: { phlegmDamp: 2, deficiencyCold: 2 } },
  { id: 's32', text: 'Đau buốt nhói cố định một điểm cụ thể trên cơ thể (cự án)', category: 'pain_breath', scores: { bloodStasis: 3 } },
  { id: 's33', text: 'Da dẻ thâm xạm, sắc môi tím, hoặc lưỡi có điểm tím đen ứ huyết', category: 'pain_breath', scores: { bloodStasis: 3 } },
  { id: 's34', text: 'Ho nhiều đờm trắng loãng nhớt dính, hay ngạt mũi chảy nước mũi', category: 'pain_breath', scores: { lungQiWeakness: 3, phlegmDamp: 2 } },
  { id: 's35', text: 'Ho khan ngứa rát họng, tiếng ho khàn khè ít đờm', category: 'pain_breath', scores: { kidneyYin: 2, lungQiWeakness: 1 } }
];

const categoryTabs = [
  { id: 'temp_sweat', label: '🌡️ Hàn Nhiệt & Mồ Hôi' },
  { id: 'head_senses', label: '👁️ Đầu & Ngũ Quan' },
  { id: 'diet_digestion', label: '🍲 Tiêu Hóa & Bài Tiết' },
  { id: 'sleep_mind', label: '💤 Giấc Ngủ & Tinh Thần' },
  { id: 'pain_breath', label: '🦴 Đau Nhức & Hô Hấp' }
];

// Comprehensive diagnostic profiles
const diagnosisProfiles = {
  spleenStomachCold: {
    title: "Tỳ Vị Hư Hàn (Spleen-Stomach Yang Deficiency)",
    mechanism: "Dương khí ở dạ dày và tạng tỳ bị suy yếu làm mất đi khả năng giữ ấm và co bóp vận hóa thức ăn. Thức ăn ứ trệ gây đầy chướng khó tiêu, hàn thấp không được chuyển hóa trôi tuột xuống đại tràng làm phân sống, nát, đi lỏng liên tục.",
    therapeutic: "Ôn trung tán hàn, bổ tỳ ích vị, kiện tỳ tiêu tích trệ.",
    dietary: "Nên ăn cháo ấm, thức ăn mềm dễ tiêu. Sử dụng gừng tươi (sinh khương), trần bì, quế chi làm gia vị. Tránh đồ ăn sống lạnh (nước đá, kem, rau sống), hạn chế tối đa thực phẩm nhiều đường béo gây ọc ạch chướng bụng.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "st"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Dưới hõm ngoài xương bánh chè đo xuống 3 thốn. Huyệt chuyên bổ trung ích khí, hỗ trợ vị khí vận hành thức ăn, trị chướng bụng tiêu chảy." },
      { code: "CV12", name: "Trung Quản", desc: "Nằm trên đường giữa bụng, trên rốn 4 thốn. Huyệt hội của phủ vị, có tác dụng ôn ấm dạ dày, trị ợ hơi ợ chua khó chịu." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Trên đỉnh mắt cá chân trong 3 thốn. Giúp tỳ vị khỏe mạnh, tiêu thủy thấp." }
    ]
  },
  kidneyYang: {
    title: "Thận Dương Hư (Kidney Yang Deficiency / Mệnh Môn Hỏa Suy)",
    mechanism: "Mệnh môn chân hỏa suy tổn nặng, không thể sưởi ấm toàn thân và các phủ tạng khác. Dương khí hư gây chân tay lạnh ngắt, lưng mỏi gối lạnh đau ê ẩm, tiểu tiện trong dài đi nhiều lần ban đêm, tiêu chảy lúc sáng sớm (Ngũ canh tả).",
    therapeutic: "Ôn bổ Thận dương, tráng mệnh môn chân hỏa, ấm hạ tiêu trừ thủy thũng.",
    dietary: "Ăn canh hầm ấm nóng nấu chín kỹ, các loại hạt tính ấm (óc chó, hạt dẻ). Dùng thịt dê, thịt bò xào gừng. Kiêng thức ăn lạnh làm hao tổn dương khí.",
    herbs: ["Ba kích", "Nhân sâm", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["ki", "bl"],
    acupoints: [
      { code: "GV4", name: "Mệnh Môn", desc: "Giữa đốt sống thắt lưng 2 và 3 (đối diện rốn ra sau lưng). Cứu ấm để kích hoạt nguồn hỏa chân dương tráng thận dương." },
      { code: "CV4", name: "Quan Nguyên", desc: "Nằm dưới rốn 3 thốn. Nơi chứa nguyên khí hạ tiêu, cứu ấm dán cao ấm giúp phục hồi dương khí bị suy kiệt." },
      { code: "KI3", name: "Thái Khê", desc: "Chỗ lõm giữa mắt cá trong và gân gót. Bồi bổ thận khí nguyên thủy." }
    ]
  },
  kidneyYin: {
    title: "Can Thận Âm Hư (Liver-Kidney Yin Deficiency)",
    mechanism: "Âm huyết (phần nước dưỡng ẩm) bị cạn kiệt, không kìm hãm được dương khí, sinh ra nhiệt giả tạo (hư nhiệt) đốt cháy bên trong. Biểu hiện nóng bừng má chiều tối, ra mồ hôi trộm khi ngủ, mắt khô mỏi nhức rát, tai ù o o.",
    therapeutic: "Tư bổ Can Thận âm, thanh hư hỏa, nhuận phế sinh tân dịch.",
    dietary: "Ăn uống bổ mát dưỡng âm (chè hạt sen bách hợp, canh mộc nhĩ trắng chưng đường phèn). Uống trà kỷ tử cúc hoa ấm nhẹ. Tránh tuyệt đối đồ ăn cay nóng tỏi ớt xào giòn và thức đêm.",
    herbs: ["Bạch cúc hoa", "Mạch môn", "Đương quy"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["ki", "lr"],
    acupoints: [
      { code: "KI3", name: "Thái Khê", desc: "Huyệt Nguyên của Thận, bổ thận âm thủy để khống chế hư hỏa bốc lên đầu mặt." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Hội của 3 kinh âm chân, bổ ích can thận âm tinh nuôi dưỡng âm huyết." },
      { code: "GB20", name: "Phong Trì", desc: "Nằm dưới xương chẩm sau tai. Giúp giảm cơn bốc hỏa gây đau đầu căng, sáng mắt." }
    ]
  },
  liverStagnation: {
    title: "Can Khí Uất Kết (Liver Qi Stagnation / Khí Uất Kết)",
    mechanism: "Sự ức chế tâm lý lâu ngày làm Can mất khả năng điều đạt khí huyết tự do. Khí bị tắc lại vùng ngực sườn gây đầy tức sườn mạng, đau thái dương đầu căng giật, thở dài nhiều, tâm lý dễ bực dọc giận dỗi cáu gắt u uất.",
    therapeutic: "Sơ can lý khí, hành khí giải uất chỉ thống, bình can hòa vị.",
    dietary: "Uống trà hoa hồng khô hãm ấm, vỏ quýt khô (trần bì), bạc hà. Thư giãn cơ thể, đi bộ thiền dưỡng sinh. Tránh ăn no quá mức dễ làm khí tắc nghẽn ở dạ dày.",
    herbs: ["Bạc hà", "Bạch cúc hoa", "Đương quy"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["lr", "gb"],
    acupoints: [
      { code: "LR3", name: "Thái Xung", desc: "Giữa kẽ ngón chân cái và thứ 2 đo lên 1.5 thốn. Huyệt Nguyên của kinh Can, bấm tả mạnh giúp bình can dẹp giận uất tức mạng sườn." },
      { code: "PC6", name: "Nội Quan", desc: "Đo lên từ lằn chỉ cổ tay trong 2 thốn. Hành khí thông chướng vị quản, giải uất chẹn ngực." },
      { code: "GB20", name: "Phong Trì", desc: "Day bấm nhẹ nhàng giải tỏa co thắt cơ cổ gáy do uất ức căng thẳng đầu óc." }
    ]
  },
  heartSpleenDef: {
    title: "Tâm Tỳ Lưỡng Hư (Heart-Spleen Qi & Blood Deficiency)",
    mechanism: "Lo nghĩ làm tổn thương tỳ vị khí. Tỳ vị suy giảm chức năng tạo huyết không đủ huyết đưa lên nuôi dưỡng tim (tâm), tâm thần bất an gây khó ngủ, hay mơ, hồi hộp lo sợ giật mình, trí nhớ giảm.",
    therapeutic: "Bồi bổ Tâm Tỳ, ích khí sinh huyết, dưỡng tâm an thần.",
    dietary: "Dùng canh hầm tim lợn hạt sen long nhãn, cháo củ mài táo đỏ. Hạn chế chất kích thích như trà đặc, cà phê, rượu bia. Tránh làm việc trí óc căng thẳng sát giờ đi ngủ.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo", "Đương quy"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "ht"],
    acupoints: [
      { code: "HT7", name: "Thần Môn", desc: "Chỗ lõm bờ ngoài gân cơ trụ tay ở lằn chỉ cổ tay trong. Huyệt đặc trị an thần, trị mất ngủ cồn cào hồi hộp trống ngực." },
      { code: "ST36", name: "Túc Tam Lý", desc: "Kiện vận vị tỳ tăng cường sinh huyết bồi đắp tâm huyết." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Huyệt điều huyết dưỡng âm ích khí an thần sâu." }
    ]
  },
  phlegmDamp: {
    title: "Đàm Thấp Đình Trệ (Phlegm-Dampness Stagnation)",
    mechanism: "Vận hóa thủy thấp của tỳ vị suy giảm làm nước đọng hóa thành đờm đục, ẩm thấp ở cơ khớp kinh lạc. Gây cảm giác người nặng như đeo chì, đầu óc mông lung buồn ngủ liên tục, đi phân dẻo nát dính bồn cầu.",
    therapeutic: "Táo thấp hóa đàm, kiện tỳ trừ thấp tiêu tích trệ thông lạc.",
    dietary: "Ăn cháo ý dĩ, uống trà vỏ cam ấm. Tránh xa đồ ăn ngọt béo, nhiều kem sữa, mỡ động vật và đồ chiên rán nhiều dầu mỡ vì chúng sinh đàm cực kỳ mạnh.",
    herbs: ["Bạch truật", "Phục linh", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "st"],
    acupoints: [
      { code: "SP9", name: "Âm Lăng Tuyền", desc: "Chỗ lõm dưới đầu trên xương chày mặt trong cẳng chân. Huyệt thanh thấp nhiệt trục thủy thấp đình trệ của kinh Tỳ." },
      { code: "ST36", name: "Túc Tam Lý", desc: "Kiện tỳ vận vị thúc đẩy chuyển hóa nước ứ đọng." },
      { code: "CV12", name: "Trung Quản", desc: "Hòa vị hóa đàm chướng bụng trên ngực." }
    ]
  },
  lungQiWeakness: {
    title: "Phế Khí Suy Yếu (Lung Qi & Defensive Qi Deficiency)",
    mechanism: "Khí quản của phổi bị suy giảm năng lượng bảo vệ ngoài da (vệ khí) không vững. Cơ thể nhạy cảm với sự thay đổi thời tiết, gió thổi qua dễ lạnh run hắt hơi ho đờm trắng loãng chảy mũi trong.",
    therapeutic: "Bổ phế ích khí, củng cố vệ biểu vững chắc chống ngoại tà.",
    dietary: "Ăn canh củ cải trắng hành tăm gừng ấm, cháo hoài sơn. Uống nước trà gừng ấm đường phèn nhẹ buổi sáng. Tránh nước lạnh đá sặc vào phổi.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo", "Bạc hà"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["lu", "li"],
    acupoints: [
      { code: "LU9", name: "Thái Uyên", desc: "Chỗ lõm trên nếp gấp cổ tay ngoài gần ngón cái. Huyệt nguyên kinh phế, bổ phế khí phế âm yếu từ gốc." },
      { code: "LU7", name: "Liệt Khuyết", desc: "Day bấm giải phong hàn hắt hơi chảy mũi ho ngạt thở phế quản." },
      { code: "GB20", name: "Phong Trì", desc: "Day bấm chặn đứng gió lạnh ngoại phong xâm nhập cơ thể ở gáy cổ." }
    ]
  },
  bloodStasis: {
    title: "Huyết Ứ Kinh Lạc (Blood Stasis / Ứ Trệ Tuần Hoàn)",
    mechanism: "Huyết dịch lưu thông chậm chạp tích tụ thành ứ huyết tại kinh lạc cơ khớp gây các cơn đau buốt nhói cố định một điểm cụ thể, sắc da sạm đen tối, sắc môi thâm khô ráp.",
    therapeutic: "Hoạt huyết hóa ứ, thông kinh lạc trệ chỉ khái chỉ thống.",
    dietary: "Dùng các món nấu mộc nhĩ đen nấm hương hành gừng giúp giãn mạch thúc đẩy tuần hoàn máu. Kiêng ăn lạnh sống gây ngưng trệ dòng chảy huyết dịch.",
    herbs: ["Đương quy"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["lr", "ht"],
    acupoints: [
      { code: "SP6", name: "Tam Âm Giao", desc: "Day bấm hoạt huyết thông ứ huyết vùng bụng dưới chi dưới." },
      { code: "SI3", name: "Hậu Khê", desc: "Day bấm tả pháp thông đốc mạch hoạt huyết chỉ thống đau nhức khớp." },
      { code: "LR3", name: "Thái Xung", desc: "Hành can khí giúp thúc đẩy huyết hành ứ thông suốt." }
    ]
  },
  balanced: {
    title: "Thể Trạng Bình Hòa (Balanced Health / Cân Bằng Âm Dương)",
    mechanism: "Khí huyết điều hòa dồi dào, âm dương trong cơ thể ở trạng thái cân bằng động lý tưởng. Khả năng đề kháng chính khí tốt chống chọi tốt với bệnh tật bên ngoài.",
    therapeutic: "Dưỡng sinh phòng bệnh chủ động giữ gìn thể trạng cân bằng.",
    dietary: "Duy trì chế độ ăn đa dạng đầy đủ các nhóm dưỡng chất chín ấm sạch. Tập thể thao khí công dưỡng sinh đều đặn nhẹ nhàng giữ tinh thần thoải mái.",
    herbs: ["Nhân sâm", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang", "Tang Cúc Ẩm"],
    meridians: ["ki", "sp", "lu", "st"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Huyệt bổ chính khí dưỡng sinh trường thọ bấm 2 phút mỗi sáng." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Day bấm bổ ích âm tinh điều hòa nội tiết sinh lý cơ thể." },
      { code: "KI3", name: "Thái Khê", desc: "Bồi bổ tinh khí thận âm thận dương chân nguyên cơ thể." }
    ]
  }
};

function SymptomQuiz({ herbs = [], onSelectHerb, onNavigateToMeridian, onNavigateToPrescription }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Checklists, 2: Result
  const [activeTab, setActiveTab] = useState('temp_sweat');
  const [selectedSymptoms, setSelectedSymptoms] = useState(new Set());
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);

  const startQuiz = () => {
    setCurrentStep(1);
    setActiveTab('temp_sweat');
    setSelectedSymptoms(new Set());
    setActiveDiagnosis(null);
  };

  const handleToggleSymptom = (id) => {
    setSelectedSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const currentTabSymptoms = useMemo(() => {
    return symptomDatabase.filter(s => s.category === activeTab);
  }, [activeTab]);

  const activeTabIndex = useMemo(() => {
    return categoryTabs.findIndex(t => t.id === activeTab);
  }, [activeTab]);

  const handleNextTab = () => {
    if (activeTabIndex < categoryTabs.length - 1) {
      setActiveTab(categoryTabs[activeTabIndex + 1].id);
      window.scrollTo(0, 0);
    } else {
      // compile results
      calculateDiagnosis();
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevTab = () => {
    if (activeTabIndex > 0) {
      setActiveTab(categoryTabs[activeTabIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  const calculateDiagnosis = () => {
    const tallies = {
      spleenStomachCold: 0,
      kidneyYang: 0,
      kidneyYin: 0,
      liverStagnation: 0,
      heartSpleenDef: 0,
      phlegmDamp: 0,
      lungQiWeakness: 0,
      bloodStasis: 0,
      balanced: 0
    };

    let totalSelected = 0;
    selectedSymptoms.forEach(id => {
      const symptom = symptomDatabase.find(s => s.id === id);
      if (symptom) {
        totalSelected++;
        Object.entries(symptom.scores).forEach(([syndrome, score]) => {
          if (tallies[syndrome] !== undefined) {
            tallies[syndrome] += score;
          }
        });
      }
    });

    let highestSyndrome = 'balanced';
    let highestScore = 0;

    Object.entries(tallies).forEach(([syndrome, score]) => {
      if (syndrome !== 'balanced' && score > highestScore) {
        highestScore = score;
        highestSyndrome = syndrome;
      }
    });

    // Default to balanced if no symptoms selected or score is extremely low
    if (totalSelected === 0 || highestScore <= 2) {
      highestSyndrome = 'balanced';
    }

    setActiveDiagnosis({
      syndrome: highestSyndrome,
      scores: tallies,
      totalSelected,
      profile: diagnosisProfiles[highestSyndrome]
    });
  };

  const progressPercentage = useMemo(() => {
    return Math.round(((activeTabIndex + 1) / categoryTabs.length) * 100);
  }, [activeTabIndex]);

  const herbByName = useMemo(
    () => new Map(herbs.map((h) => [h.name_vn.toLowerCase().trim(), h])),
    [herbs]
  );

  const getMatchedHerbObject = (name) => herbByName.get(name.toLowerCase().trim());

  return (
    <main className="content-page container fade-in">
      <header className="page-header">
        <span className="eyebrow">Interactive Assessment</span>
        <h1>Trắc Nghiệm Triệu Chứng Tự Chẩn Đoán</h1>
        <p>
          Bản chẩn đoán tự động phân tích đa triệu chứng co-exist (đồng thời) giúp tìm ra hội chứng mất cân bằng âm dương tạng phủ chi tiết nhất.
        </p>
      </header>

      <div className="quiz-card-wrapper glass">
        
        {/* STEP 0: INTRO */}
        {currentStep === 0 && (
          <div className="quiz-step-intro fade-in">
            <div className="intro-icon">📋</div>
            <h2>Vấn Chẩn Tổng Hợp Đa Triệu Chứng</h2>
            <p>
              Thay vì trả lời trắc nghiệm một đáp án cứng nhắc, hệ thống cung cấp bảng kiểm tra đa dấu hiệu. Bạn hãy tích chọn tất cả các triệu chứng cơ thể đang gặp phải ở cả 5 nhóm sinh lý. Hệ thống sẽ bóc tách mức độ ứ trệ, hư hàn hay thực nhiệt đồng thời của bạn.
            </p>
            <ul className="intro-benefits">
              <li>🍀 Lọc các vị thuốc thanh bổ phù hợp quy trực tiếp vào kinh bệnh.</li>
              <li>🍲 Gợi ý bài thuốc cổ phương kinh điển gia giảm.</li>
              <li>📍 Hướng dẫn định vị & thao tác day bấm 3 huyệt vị dưỡng sinh đặc trị.</li>
              <li>🍲 Chế độ ăn uống Dược thiện khuyên dùng và cần kiêng kỵ.</li>
            </ul>
            <div className="alert-panel caution" style={{ marginTop: '20px', marginBottom: '25px' }}>
              <strong>⚠️ KHUYẾN CÁO AN TOÀN</strong>
              <p>Kết quả mang tính chất tham khảo nghiên cứu và hỗ trợ định hướng dưỡng sinh. Hãy luôn thăm khám trực tiếp với bác sĩ y học cổ truyền để được chẩn đoán mạch chẩn và kê toa điều trị chuyên môn.</p>
            </div>
            <button className="quiz-start-btn" onClick={startQuiz} type="button">
              Bắt đầu Vấn chẩn tự chẩn đoán
            </button>
          </div>
        )}

        {/* STEP 1: CHECKLIST CATEGORIES TABS */}
        {currentStep === 1 && (
          <div className="quiz-step-checklist fade-in">
            {/* Steps Progress bar */}
            <div className="quiz-progress-container">
              <div className="progress-text">
                <span>Nhóm triệu chứng: {activeTabIndex + 1} / {categoryTabs.length} ({categoryTabs[activeTabIndex].label.split(' ')[1]})</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>

            {/* Tabs Header */}
            <div className="quiz-tabs-header" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`tab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-color)',
                    background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Symptoms list check-boxes */}
            <h3 style={{ fontSize: '16px', color: 'var(--secondary-color)', marginBottom: '14px', fontFamily: 'var(--font-serif)' }}>
              Hãy chọn tất cả triệu chứng bạn đang gặp phải:
            </h3>
            
            <div className="symptoms-checklist-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentTabSymptoms.map((symptom) => {
                const isChecked = selectedSymptoms.has(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    onClick={() => handleToggleSymptom(symptom.id)}
                    type="button"
                    className={`symptom-check-card ${isChecked ? 'checked' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '14px 18px',
                      background: isChecked ? 'rgba(107, 68, 35, 0.04)' : 'rgba(0,0,0,0.01)',
                      border: isChecked ? '1.5px solid var(--primary-color)' : '1.5px solid var(--border-color)',
                      borderRadius: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: '2px solid var(--border-color)',
                      marginRight: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isChecked ? 'var(--primary-color)' : '#fff',
                      borderColor: isChecked ? 'var(--primary-color)' : 'var(--border-color)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {isChecked ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: isChecked ? '700' : '500', color: 'var(--text-main)' }}>
                      {symptom.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="quiz-nav-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={handlePrevTab}
                disabled={activeTabIndex === 0}
                className="quiz-start-btn restart"
                type="button"
                style={{ opacity: activeTabIndex === 0 ? 0.4 : 1, cursor: activeTabIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                ◀ Nhóm trước
              </button>
              
              <button
                onClick={handleNextTab}
                className="quiz-start-btn"
                type="button"
              >
                {activeTabIndex === categoryTabs.length - 1 ? 'Xem kết quả chẩn đoán 📊' : 'Tiếp theo ▶'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RESULTS */}
        {currentStep === 2 && activeDiagnosis && (
          <div className="quiz-step-results fade-in">
            <div className="result-header">
              <span className="result-badge">Hồ sơ biện chứng thể trạng</span>
              <h2>{activeDiagnosis.profile.title}</h2>
              <p className="result-description" style={{ fontStyle: 'italic', color: 'var(--primary-color)', fontWeight: '700' }}>
                Cơ chế bệnh sinh Đông y: {activeDiagnosis.profile.mechanism}
              </p>
            </div>

            {/* SYNDROMES CHART METERS */}
            <div className="scores-visualization-panel">
              <h3>Độ tương thích các hội chứng tạng phủ & khí huyết ({activeDiagnosis.totalSelected} triệu chứng được chọn)</h3>
              <div className="scores-grid">
                {Object.entries(activeDiagnosis.scores)
                  .filter(([syn]) => syn !== 'balanced')
                  .sort((a, b) => b[1] - a[1]) // Sort scores descending
                  .map(([syndrome, score]) => {
                    const labelMap = {
                      spleenStomachCold: "Tỳ Vị Hư Hàn (Tiêu hóa kém)",
                      kidneyYang: "Thận Dương Hư (Lạnh/Suy nhược)",
                      kidneyYin: "Can Thận Âm Hư (Khô rát/Hư hỏa)",
                      liverStagnation: "Can Khí Uất Kết (Stress/Khí uất)",
                      heartSpleenDef: "Tâm Tỳ Lưỡng Hư (Mất ngủ/Lo âu)",
                      phlegmDamp: "Đàm Thấp Đình Trệ (Nặng nề/Uể oải)",
                      lungQiWeakness: "Phế Khí Suy Yếu (Ho/Hô hấp kém)",
                      bloodStasis: "Huyết Ứ Kinh Lạc (Đau nhói/Tuần hoàn kém)"
                    };
                    const maxPossibleScore = 20;
                    const pct = Math.min(Math.round((score / maxPossibleScore) * 100), 100);
                    return (
                      <div key={syndrome} className="score-meter-row">
                        <div className="score-meta">
                          <span className="score-label" style={{ fontWeight: syndrome === activeDiagnosis.syndrome ? '800' : '500' }}>
                            {labelMap[syndrome]} {syndrome === activeDiagnosis.syndrome ? '★' : ''}
                          </span>
                          <span className="score-num">{score} điểm ({pct}%)</span>
                        </div>
                        <div className="score-bar-bg">
                          <div
                            className={`score-bar-fill ${syndrome === activeDiagnosis.syndrome ? 'primary' : ''}`}
                            style={{ 
                              width: `${Math.max(pct, 5)}%`, 
                              background: syndrome === activeDiagnosis.syndrome ? 'var(--primary-color)' : 'rgba(107, 68, 35, 0.15)' 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* PHÁP TRỊ */}
            <div className="alert-panel info" style={{ background: 'rgba(107, 68, 35, 0.03)', border: '1px solid rgba(107, 68, 35, 0.15)', color: 'var(--text-main)' }}>
              <strong>📋 Nguyên tắc trị liệu (Pháp trị):</strong>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700' }}>{activeDiagnosis.profile.therapeutic}</p>
            </div>

            {/* DƯỢC THIỆN */}
            <div className="alert-panel info" style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)', color: 'var(--text-main)' }}>
              <strong>🍲 Thực đơn Dược thiện dinh dưỡng khuyên dùng:</strong>
              <p style={{ margin: '4px 0 0 0' }}>{activeDiagnosis.profile.dietary}</p>
            </div>

            {/* RECOMMENDATIONS SECTION */}
            <div className="recommendations-box">
              <h3>Đề xuất Trị liệu & Dưỡng sinh</h3>

              {/* RECOMMENDED HERBS */}
              <div className="rec-section">
                <h4>🌿 Thảo dược quy kinh bổ trợ phù hợp:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {activeDiagnosis.profile.herbs.map((hName) => {
                    const herbObj = getMatchedHerbObject(hName);
                    if (herbObj && onSelectHerb) {
                      return (
                        <button
                          key={hName}
                          className="rec-chip-btn clickable"
                          onClick={() => onSelectHerb(herbObj)}
                          type="button"
                        >
                          {hName} (Xem chi tiết)
                        </button>
                      );
                    }
                    return <span key={hName} className="rec-chip-btn">{hName}</span>;
                  })}
                </div>
              </div>

              {/* RECOMMENDED FORMULAS */}
              <div className="rec-section" style={{ marginTop: '16px' }}>
                <h4>🍲 Bài thuốc cổ phương kinh điển đối chứng:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {activeDiagnosis.profile.prescriptions.map((pName) => (
                    <button
                      key={pName}
                      className="rec-chip-btn clickable formula"
                      onClick={() => onNavigateToPrescription?.()}
                      type="button"
                    >
                      {pName} (Xem bài thuốc)
                    </button>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED ACUPOINTS */}
              <div className="rec-section" style={{ marginTop: '20px' }}>
                <h4>📍 Day bấm 3 huyệt vị dưỡng sinh đặc trị:</h4>
                <div className="rec-acupoints-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  {activeDiagnosis.profile.acupoints.map((ap) => {
                    const cleanCode = ap.code.toLowerCase();
                    const getMeridianId = (code) => {
                      if (code.startsWith("lu")) return "lu";
                      if (code.startsWith("li")) return "li";
                      if (code.startsWith("st")) return "st";
                      if (code.startsWith("sp")) return "sp";
                      if (code.startsWith("ht")) return "ht";
                      if (code.startsWith("si")) return "si";
                      if (code.startsWith("bl")) return "bl";
                      if (code.startsWith("ki")) return "ki";
                      if (code.startsWith("pc")) return "pc";
                      if (code.startsWith("te")) return "te";
                      if (code.startsWith("gb")) return "gb";
                      if (code.startsWith("lr")) return "lr";
                      if (code.startsWith("cv")) return "cv";
                      if (code.startsWith("gv")) return "gv";
                      return null;
                    };
                    const mId = getMeridianId(cleanCode);

                    return (
                      <div key={ap.code} style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '15px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                          <strong style={{ color: 'var(--secondary-color)', fontSize: '15px' }}>
                            Huyệt {ap.name} ({ap.code})
                          </strong>
                          {mId && onNavigateToMeridian && (
                            <button
                              onClick={() => onNavigateToMeridian(mId)}
                              type="button"
                              style={{
                                background: 'rgba(107, 68, 35, 0.06)',
                                border: 'none',
                                padding: '4px 10px',
                                color: 'var(--primary-color)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '11px',
                                borderRadius: '6px',
                                textDecoration: 'underline'
                              }}
                            >
                              Xem đường kinh lạc tương ứng
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                          {ap.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', borderTop: '1.5px solid var(--border-color)', paddingTop: '20px' }}>
              <button className="quiz-start-btn restart" onClick={startQuiz} type="button">
                Thực hiện lại trắc nghiệm vấn chẩn
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default SymptomQuiz;
