import React, { useState, useMemo } from 'react';
import './SymptomQuiz.css';

// 12 Comprehensive diagnostic questions mapping to detailed Chinese Medicine syndromes
const quizQuestions = [
  {
    id: 1,
    question: "1. Về thân nhiệt: Bạn thường có cảm giác sợ nóng hay lạnh nhiều hơn?",
    options: [
      {
        text: "Sợ lạnh, tay chân lạnh buốt, thích uống đồ ấm nóng, đắp chăn ấm",
        scores: { deficiencyCold: 3, kidneyYang: 3 }
      },
      {
        text: "Sợ nóng, người hâm hấp bứt rứt, nóng bừng mặt chiều tối, lòng bàn tay chân nóng râm ran",
        scores: { kidneyYin: 3 }
      },
      {
        text: "Lúc nóng lúc lạnh xen kẽ chập chờn, kèm theo ngực sườn đầy tức, hay thở dài bực dọc",
        scores: { liverStagnation: 3 }
      },
      {
        text: "Thân nhiệt ôn hòa, thích nghi tốt với thời tiết nóng lạnh bình thường",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 2,
    question: "2. Về mồ hôi: Tình trạng tiết mồ hôi của bạn như thế nào?",
    options: [
      {
        text: "Tự đổ mồ hôi ban ngày dù không vận động nhiều, ra gió dễ gai lạnh hắt hơi",
        scores: { lungQiWeakness: 3, qiDeficiency: 2 }
      },
      {
        text: "Đổ mồ hôi trộm ban đêm khi ngủ say, lúc tỉnh dậy mồ hôi tự ngưng, người khô ráo dần",
        scores: { kidneyYin: 3 }
      },
      {
        text: "Ra mồ hôi nhiều ở lòng bàn tay bàn chân kèm lòng cồn cào bứt rứt khó ngủ",
        scores: { kidneyYin: 2, liverStagnation: 1 }
      },
      {
        text: "Mồ hôi tiết ra bình thường khi vận động nóng, không tự đổ mồ hôi bất thường",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 3,
    question: "3. Về đầu và thân: Bạn thường gặp trạng thái hoa mắt chóng mặt hay đau nhức cơ thể ra sao?",
    options: [
      {
        text: "Thường xuyên hoa mắt, chóng mặt khi đứng lên ngồi xuống mắt tối sầm, da dẻ nhợt nhạt",
        scores: { heartSpleenDef: 3, qiDeficiency: 1 }
      },
      {
        text: "Đầu nặng trĩu như bị cuốn vải chặt, người nặng nề uể oải như đeo đá, bắp thịt mỏi mệt",
        scores: { phlegmDamp: 3 }
      },
      {
        text: "Đầu đau căng giật từng cơn ở vùng đỉnh hoặc hai bên thái dương kèm miệng khô đắng",
        scores: { liverStagnation: 2, kidneyYin: 1 }
      },
      {
        text: "Đầu óc thanh thản minh mẫn, cơ thể nhẹ nhàng sảng khoái",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 4,
    question: "4. Về ăn uống: Bạn cảm thấy khẩu vị và sự thèm ăn thế nào?",
    options: [
      {
        text: "Ăn không ngon miệng, miệng nhạt nhẽo, ăn xong bụng chướng ọc ạch rất lâu tiêu, phân sống nát",
        scores: { spleenStomachCold: 3, qiDeficiency: 2 }
      },
      {
        text: "Họng khô miệng ráo, thích uống nước mát từng ngụm nhỏ liên tục, hay cồn cào xót ruột",
        scores: { kidneyYin: 2, spleenStomachCold: -1 }
      },
      {
        text: "Miệng đắng chát khi thức dậy, ăn kém hoặc thường xuyên ợ hơi ợ chua đầy tức vùng thượng vị",
        scores: { liverStagnation: 3 }
      },
      {
        text: "Ăn uống ngon miệng, tiêu hóa nhanh, miệng không khô đắng hay có mùi bất thường",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 5,
    question: "5. Về tiêu hóa & đại tiện: Trạng thái phân của bạn phản ánh tiêu hóa như thế nào?",
    options: [
      {
        text: "Phân lỏng nát, thường đi ngoài phân sống ngay sau khi ăn hoặc đi lỏng lúc sáng sớm thức dậy",
        scores: { spleenStomachCold: 3, kidneyYang: 3 }
      },
      {
        text: "Phân khô kết cứng, đại tiện khó khăn táo bón dai dẳng, nước tiểu vàng sẫm màu",
        scores: { kidneyYin: 2 }
      },
      {
        text: "Phân nát dính dẻo, đi ngoài có cảm giác không sạch hết phân, dính bồn cầu khó dội sạch",
        scores: { phlegmDamp: 3, spleenStomachCold: 1 }
      },
      {
        text: "Đại tiện đều đặn phân thành khuôn mềm màu vàng, không táo hay nát dính",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 6,
    question: "6. Về tiểu tiện: Tần suất và màu sắc nước tiểu của bạn?",
    options: [
      {
        text: "Đi tiểu nhiều lần trong ngày, nước tiểu trong dài, thường xuyên phải thức giấc tiểu đêm",
        scores: { kidneyYang: 3, deficiencyCold: 2 }
      },
      {
        text: "Nước tiểu ít, màu vàng đậm hoặc đỏ sẻn, tiểu nóng rát nhẹ hoặc tiểu khó dắt",
        scores: { kidneyYin: 2 }
      },
      {
        text: "Tiểu tiện bình thường, màu vàng nhạt trong suốt, không đau rát hay đi đêm",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 7,
    question: "7. Về giấc ngủ: Chất lượng giấc ngủ hàng đêm của bạn ra sao?",
    options: [
      {
        text: "Khó vào giấc ngủ, ngủ chập chờn hay mơ, dễ giật mình hồi hộp trống ngực, hay quên",
        scores: { heartSpleenDef: 3, qiDeficiency: 1 }
      },
      {
        text: "Mất ngủ, khó ngủ kèm bứt rứt trong lòng, hay thức giấc lúc nửa đêm (1h - 3h sáng) rồi trằn trọc",
        scores: { liverStagnation: 3 }
      },
      {
        text: "Rất thèm ngủ, người uể oải buồn ngủ cả ngày, ngủ dậy đầu óc vẫn mông lung mệt mỏi",
        scores: { phlegmDamp: 3, spleenStomachCold: 1 }
      },
      {
        text: "Dễ ngủ, ngủ sâu giấc từ 6-8 tiếng, tinh thần sảng khoái sau khi tỉnh dậy",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 8,
    question: "8. Về lồng ngực & vùng bụng: Bạn có cảm giác khó chịu hay đầy tức ở khu vực này không?",
    options: [
      {
        text: "Hay bị đau tức mạng sườn, đầy chướng bụng trên, thường xuyên ợ hơi hoặc thở dài mới thấy dễ chịu",
        scores: { liverStagnation: 3 }
      },
      {
        text: "Vùng bụng dưới rốn thường lạnh buốt, đau âm ỉ liên tục, thích chườm nóng ấm vào bụng",
        scores: { kidneyYang: 3, deficiencyCold: 2 }
      },
      {
        text: "Lồng ngực đầy chướng nghẹt thở, hay có cảm giác hồi hộp trống ngực đập liên hồi",
        scores: { heartSpleenDef: 2, lungQiWeakness: 1 }
      },
      {
        text: "Vùng ngực bụng thư thái, không có cảm giác đau tức hay chướng đầy ấm lạnh bất thường",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 9,
    question: "9. Về tinh thần & cảm xúc: Trạng thái tâm lý thường gặp của bạn?",
    options: [
      {
        text: "Dễ nổi cáu giận dữ vô cớ, tinh thần u uất lo nghĩ tức giận dồn nén trong lòng",
        scores: { liverStagnation: 3 }
      },
      {
        text: "Hay lo sợ vẩn vơ, nhút nhát nhạy cảm, dễ hốt hoảng hồi hộp, tinh thần mệt mỏi thụ động",
        scores: { heartSpleenDef: 3, qiDeficiency: 1 }
      },
      {
        text: "Tinh thần vui vẻ ổn định, lạc quan, khả năng kiềm chế điều hòa cảm xúc tốt",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 10,
    question: "10. Về cơ khớp & đau nhức: Tính chất của các cơn đau nhức mỏi trên cơ thể bạn?",
    options: [
      {
        text: "Đau mỏi ê ẩm âm ỉ vùng thắt lưng và đầu gối, đau tăng khi đứng lâu hoặc khi làm việc mệt mỏi",
        scores: { kidneyYang: 3, kidneyYin: 2 }
      },
      {
        text: "Đau buốt nhói như kim châm cố định một điểm cụ thể, sắc da tối sạm, môi thâm, lưỡi có điểm ứ huyết",
        scores: { bloodStasis: 3 }
      },
      {
        text: "Đau nhức di chuyển từ khớp này sang khớp khác hoặc khớp tê bì nặng nề khi trời mưa ẩm",
        scores: { phlegmDamp: 2, deficiencyCold: 1 }
      },
      {
        text: "Khớp xương dẻo dai khỏe mạnh, cơ bắp săn chắc không đau mỏi bì cứng",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 11,
    question: "11. Về hô hấp: Tình trạng phổi và đường thở của bạn ra sao?",
    options: [
      {
        text: "Ho nhiều đờm trắng loãng hoặc dính nhớt, tiếng ho yếu, hay ngạt mũi chảy nước mũi trong",
        scores: { lungQiWeakness: 3, phlegmDamp: 2 }
      },
      {
        text: "Ho khan không có đờm hoặc đờm rất ít dính quánh khó khạc, khô họng khản tiếng",
        scores: { kidneyYin: 2, lungQiWeakness: 1 }
      },
      {
        text: "Giọng nói vang khỏe, hơi thở sâu đều đặn, ít khi bị cảm mạo hay ho hắt hơi",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 12,
    question: "12. Về ngũ quan (Tai & Mắt): Bạn có biểu hiện ù tai hay khô mỏi mắt không?",
    options: [
      {
        text: "Tai ù như ve kêu bên trong hoặc thính lực giảm sút rõ rệt, kèm theo thắt lưng đau gối mỏi",
        scores: { kidneyYang: 2, kidneyYin: 3 }
      },
      {
        text: "Mắt khô rát nhức mỏi, nhìn vật mờ nhòe, hay bị chảy nước mắt sống khi đi ra gió",
        scores: { kidneyYin: 3, liverStagnation: 1 }
      },
      {
        text: "Tai nghe rõ ràng tinh nhạy, mắt sáng tinh tường nhìn rõ, không khô nhức",
        scores: { balanced: 2 }
      }
    ]
  }
];

// Comprehensive diagnostic syndrome profiles
const diagnosisProfiles = {
  spleenStomachCold: {
    title: "Tỳ Vị Hư Hàn (Spleen-Stomach Qi & Yang Deficiency)",
    mechanism: "Dương khí ở trung tiêu (dạ dày và ruột) suy yếu làm mất đi khả năng giữ ấm và vận hóa thức ăn. Thức ăn đình trệ không tiêu hóa được gây trướng bụng đầy hơi, hàn thấp chảy xuống đại tràng gây phân lỏng nát.",
    therapeutic: "Ôn trung tán hàn, kiện tỳ kiện vị, trừ thấp tiêu trệ.",
    dietary: "Nên dùng thức ăn ấm nóng, dễ tiêu. Sử dụng gừng, riềng, quế chi, trần bì làm gia vị. Tránh đồ ăn sống lạnh (kem, nước đá, rau sống), mướp đắng, dưa hấu và đồ ngọt béo gây nê trệ.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "st"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Dưới hõm ngoài xương bánh chè 3 thốn (khoảng 4 ngón tay nằm ngang). Day bấm tả pháp hoặc cứu ngải ấm 3-5 phút để tăng nhu động ruột, điều hòa khí cơ vị quản." },
      { code: "CV12", name: "Trung Quản", desc: "Nằm ở đường giữa bụng, trên rốn 4 thốn. Huyệt hội của phủ, điều hòa vị khí, trị bụng chướng đầy ợ chua." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Nằm trên đỉnh mắt cá chân trong 3 thốn. Kiện tỳ hóa thấp, trợ vận hóa ngũ cốc." }
    ]
  },
  kidneyYang: {
    title: "Thận Dương Hư (Kidney Yang Deficiency / Mệnh Môn Hỏa Suy)",
    mechanism: "Thận dương (chân hỏa của cơ thể) bị suy giảm nặng, không thể ôn ấm cho các tạng phủ khác và hạ tiêu. Nguồn nhiệt suy giảm gây tay chân lạnh buốt, thắt lưng lạnh đau, tiểu đêm nhiều lần và phân sống nát lúc sáng sớm (Ngũ canh tả).",
    therapeutic: "Ôn bổ Thận dương, tráng Mệnh môn hỏa, ôn ấm hạ tiêu trừ thủy dịch.",
    dietary: "Ăn canh hầm ấm nóng, các loại hạt (óc chó, hạt sen). Có thể dùng các loại thịt tính ấm như thịt dê, thịt bò hầm hành gừng kỷ tử. Hạn chế bia lạnh, rau cải cúc, mướp, cà pháo.",
    herbs: ["Ba kích", "Nhân sâm", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"], // default fallback
    meridians: ["ki", "bl"],
    acupoints: [
      { code: "GV4", name: "Mệnh Môn", desc: "Nằm ở cột sống thắt lưng, đối diện rốn ra sau lưng. Cứu ấm hoặc dán cao ấm để đánh thức nguồn hỏa chân nguyên tráng mệnh môn." },
      { code: "CV4", name: "Quan Nguyên", desc: "Nằm dưới rốn 3 thốn trên đường trắng bụng. Huyệt chủ chốt giúp ôn ấm hạ nguyên khí, bổ ích hạ tiêu dương khí." },
      { code: "KI3", name: "Thái Khê", desc: "Tại trung điểm giữa đỉnh mắt cá trong và gân gót. Bổ ích thận nguyên khí âm dương." }
    ]
  },
  kidneyYin: {
    title: "Can Thận Âm Hư (Liver-Kidney Yin Deficiency)",
    mechanism: "Phần âm dịch và huyết trong cơ thể bị tiêu hao làm mất khả năng nhu dưỡng Can Thận. Âm hư dẫn đến dương thịnh giả tạo tạo ra hư nhiệt âm ỉ bên trong gây nóng bừng mặt, lòng bàn tay chân nóng rát, triều nhiệt, khô rát mắt, ù tai.",
    therapeutic: "Tư bổ Can Thận âm, tư âm giáng hỏa lương huyết.",
    dietary: "Ăn các món canh bổ mát dưỡng âm (canh bách hợp hạt sen, canh mộc nhĩ). Uống nước kỷ tử, táo đỏ, trà hoa cúc nhẹ. Tránh hoàn toàn đồ cay nóng (ớt, tiêu, tỏi), rượu mạnh và thức đêm muộn.",
    herbs: ["Bạch cúc hoa", "Mạch môn", "Đương quy"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["ki", "lr"],
    acupoints: [
      { code: "KI3", name: "Thái Khê", desc: "Nơi tụ hội nguyên khí kinh Thận. Day bấm tả pháp nhẹ nhàng bổ ích chân âm, kéo hỏa quy nguyên hạ tiêu." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Huyệt giao hội của 3 kinh âm ở chân (Tỳ, Can, Thận), bổ can thận âm huyết cực kỳ hiệu quả." },
      { code: "GB20", name: "Phong Trì", desc: "Nằm dưới xương chẩm sau tai. Day bấm để giảm căng thẳng đầu óc, hạ hư hỏa thượng viêm gây nhức đầu mắt khô mỏi." }
    ]
  },
  liverStagnation: {
    title: "Can Khí Uất Kết (Liver Qi Stagnation / Stress & Tension)",
    mechanism: "Trạng thái tình chí căng thẳng lo nghĩ làm chức năng sơ tiết điều đạt khí huyết của tạng Can bị uất trệ. Khí cơ không thông vùng ngực sườn gây đau tức mạng sườn, thở dài, dễ kích động tức giận vô cớ hoặc đau đầu căng thái dương.",
    therapeutic: "Sơ can lý khí, giải uất hành trệ, hòa vị chỉ thống.",
    dietary: "Nên dùng trà thảo mộc (trà hoa hồng, trà hoa nhài), vỏ quýt (trần bì), phật thủ, bạc hà để hành khí. Giữ tâm trạng vui vẻ, kết hợp tập luyện thể dục đều đặn. Hạn chế đồ ăn quá béo ngấy sinh uất nhiệt.",
    herbs: ["Bạc hà", "Bạch cúc hoa", "Đương quy"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["lr", "gb"],
    acupoints: [
      { code: "LR3", name: "Thái Xung", desc: "Tại kẽ ngón chân cái và ngón thứ 2 đo lên 1.5 thốn. Huyệt Nguyên của kinh Can, day bấm tả pháp mạnh để bình can giải uất tiêu giận dữ tức ngực." },
      { code: "PC6", name: "Nội Quan", desc: "Trên lằn chỉ cổ tay trong đo lên 2 thốn giữa 2 gân cơ. Khoan hung lý khí, sơ thông uất kết ngực bụng, trị ợ chua buồn nôn." },
      { code: "GB20", name: "Phong Trì", desc: "Day bấm tả pháp giúp thanh thông đầu óc, thư giãn cơ vai cổ gáy do uất ức căng thẳng." }
    ]
  },
  heartSpleenDef: {
    title: "Tâm Tỳ Lưỡng Hư (Heart & Spleen Qi-Blood Deficiency)",
    mechanism: "Lao tâm suy nghĩ nhiều làm hao tổn Tỳ khí và Tâm huyết. Tỳ khí hư vị vận hóa kém không sinh ra đủ huyết dưỡng Tâm, dẫn đến tâm thần thất dưỡng gây mất ngủ, hồi hộp lo âu trống ngực, ngủ hay giật mình, mau quên.",
    therapeutic: "Bổ ích Tâm Tỳ, kiện khí dưỡng huyết an thần định chí.",
    dietary: "Dùng các món cháo ích trí như cháo long nhãn hạt sen táo đỏ, cháo tim heo phục linh. Uống nước ấm mật ong. Tránh xa cà phê, trà đậm đặc, hạn chế làm việc trí óc muộn sát giờ ngủ.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo", "Đương quy"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "ht"],
    acupoints: [
      { code: "HT7", name: "Thần Môn", desc: "Tại chỗ lõm bờ ngoài gân cơ trụ tay trên nếp gấp cổ tay trong. Huyệt Nguyên của kinh Tâm, đặc trị hồi hộp mất ngủ, an định tâm thần." },
      { code: "ST36", name: "Túc Tam Lý", desc: "Bồi bổ tỳ vị bổ khí sinh huyết nuôi dưỡng tâm mạch từ gốc." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Điều huyết dưỡng âm an thần, làm dịu hệ thần kinh giao cảm kích thích giấc ngủ sâu." }
    ]
  },
  phlegmDamp: {
    title: "Thể Trạng Đàm Thấp Đình Trệ (Phlegm-Dampness Stagnation)",
    mechanism: "Tỳ vị hư suy không vận hóa hết nước gây tích tụ thành đàm ẩm và thấp khí tại cơ khớp, tạng phủ. Biểu hiện qua cảm giác nặng nề toàn thân, đầu nặng căng như quấn vải, thèm ngủ, phân nát dính dẻo khó đi.",
    therapeutic: "Kiện tỳ trừ thấp, hóa đàm tiêu trệ, thông lợi quan tiết.",
    dietary: "Ăn uống thanh đạm, tăng rau xanh khô ráo như cải bẹ, bí đao, uống nước đậu đỏ ý dĩ rang ấm. Tránh tuyệt đối đồ ăn ngọt béo ngấy (phô mai, sữa, mỡ động vật) dễ tạo thêm đàm thấp.",
    herbs: ["Bạch truật", "Phục linh", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "st"],
    acupoints: [
      { code: "SP9", name: "Âm Lăng Tuyền", desc: "Chỗ lõm dưới ngành ngang xương chày mắt trong đầu gối. Huyệt chuyên thanh nhiệt lợi thấp tống khứ thủy thấp trì trệ của kinh Tỳ." },
      { code: "ST36", name: "Túc Tam Lý", desc: "Kiện vận tỳ vị tiêu trừ thủy thấp ứ trệ từ trung tiêu." },
      { code: "CV12", name: "Trung Quản", desc: "Huyệt trung ương điều khí hòa trung hóa đàm trệ bụng ngực." }
    ]
  },
  lungQiWeakness: {
    title: "Phế Khí & Vệ Khí Suy Yếu (Lung Qi & Defensive Qi Deficiency)",
    mechanism: "Phế quản khí lực bất túc làm suy giảm khả năng bảo vệ bề mặt cơ thể (vệ khí), ngoại tà dễ xâm nhập gây ho khan đờm loãng, ngạt mũi hắt hơi chảy nước mũi trong, dễ bị cảm lạnh khi nhiệt độ chuyển mùa.",
    therapeutic: "Bổ phế ích khí, củng cố vệ biểu, chỉ khái hóa đờm.",
    dietary: "Nên dùng canh củ cải trắng hầm hành gừng, cháo củ mài bách hợp. Uống trà gừng ấm mật ong buổi sáng. Tránh đồ uống lạnh đá, đồ ăn chua chát ngưng phế khí.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo", "Bạc hà"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["lu", "li"],
    acupoints: [
      { code: "LU9", name: "Thái Uyên", desc: "Chỗ lõm trên nếp gấp cổ tay ngoài cạnh động mạch quay. Huyệt Nguyên của kinh Phế, bổ sung nguyên khí phế kinh từ gốc." },
      { code: "LU7", name: "Liệt Khuyết", desc: "Giao chéo hai ngón cái trỏ, huyệt nằm chỗ lõm dưới đầu ngón trỏ. Tuyên thông phế khí trị ho, nghẹt mũi chảy nước mũi." },
      { code: "GB20", name: "Phong Trì", desc: "Huyệt ngăn chặn ngoại phong tà xâm nhập cơ thể qua vùng gáy." }
    ]
  },
  bloodStasis: {
    title: "Huyết Ứ Kinh Lạc (Blood Stasis / Poor Microcirculation)",
    mechanism: "Dòng chảy huyết dịch trong kinh mạch bị cản trở (do khí trệ hoặc lạnh co mạch), tích tụ lại gây đau nhức nhối cố định cự án, sắc môi thâm sẫm, da dẻ xù xì xạm sẫm.",
    therapeutic: "Hoạt huyết hóa ứ, hành khí chỉ thống, sơ thông kinh lạc trệ.",
    dietary: "Ăn mộc nhĩ đen nấm hương gừng hành tăm thúc đẩy huyết hành. Uống nước ấm mật ong quế chi mức nhẹ. Tránh đồ ăn sống lạnh ngưng trệ huyết mạch.",
    herbs: ["Đương quy"],
    prescriptions: ["Tứ Quân Tử Thang"], // default
    meridians: ["lr", "ht"],
    acupoints: [
      { code: "SP6", name: "Tam Âm Giao", desc: "Huyệt hội 3 kinh âm ở chân, thông thông huyết mạch hạ tiêu tiêu trừ huyết ứ." },
      { code: "SI3", name: "Hậu Khê", desc: "Day bấm mạnh để thông lạc chỉ thống toàn thân." },
      { code: "LR3", name: "Thái Xung", desc: "Hành khí thúc đẩy huyết dịch vận hành thông suốt (khí hành huyết hành)." }
    ]
  },
  balanced: {
    title: "Thể Trạng Bình Hòa (Balanced Health / Cân Bằng Âm Dương)",
    mechanism: "Khí huyết và âm dương trong cơ thể bạn đang ở trạng thái cân bằng động rất tốt. Tạng phủ vận hành trơn tru bền bỉ, sức đề kháng tự nhiên (chính khí) dồi dào bảo vệ tốt cơ thể.",
    therapeutic: "Duy trì sức khỏe dưỡng sinh phòng ngừa bệnh tật tích cực.",
    dietary: "Duy trì chế độ ăn đa dạng đầy đủ dinh dưỡng, ưu tiên thực phẩm tươi sống sạch, ăn nhiều rau quả mùa. Tập thể dục điều độ dưỡng sinh.",
    herbs: ["Nhân sâm", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang", "Tang Cúc Ẩm"],
    meridians: ["ki", "sp", "lu", "st"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Huyệt trường thọ dưỡng sinh phòng bách bệnh bấm 2-3 phút mỗi buổi sáng." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Dưỡng tỳ can thận âm huyết điều hòa sinh lý cơ thể." },
      { code: "KI3", name: "Thái Khê", desc: "Nạp khí bổ thận dưỡng chân âm gốc sinh lực." }
    ]
  }
};

function SymptomQuiz({ herbs = [], onSelectHerb, onNavigateToMeridian, onNavigateToPrescription }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1-12: Questions, 13: Result
  const [answers, setAnswers] = useState([]);
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);

  const startQuiz = () => {
    setCurrentStep(1);
    setAnswers([]);
    setActiveDiagnosis(null);
  };

  const handleSelectOption = (scores) => {
    const newAnswers = [...answers, scores];
    setAnswers(newAnswers);

    if (currentStep < quizQuestions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateDiagnosis(newAnswers);
      setCurrentStep(quizQuestions.length + 1);
    }
  };

  const calculateDiagnosis = (compiledAnswers) => {
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

    compiledAnswers.forEach(answer => {
      Object.entries(answer).forEach(([syndrome, score]) => {
        if (tallies[syndrome] !== undefined) {
          tallies[syndrome] += score;
        }
      });
    });

    let highestSyndrome = 'balanced';
    let highestScore = 0;

    Object.entries(tallies).forEach(([syndrome, score]) => {
      if (syndrome !== 'balanced' && score > highestScore) {
        highestScore = score;
        highestSyndrome = syndrome;
      }
    });

    // If highest imbalance is low, default to balanced
    if (highestScore <= 3) {
      highestSyndrome = 'balanced';
    }

    setActiveDiagnosis({
      syndrome: highestSyndrome,
      scores: tallies,
      profile: diagnosisProfiles[highestSyndrome]
    });
  };

  const progressPercentage = useMemo(() => {
    if (currentStep === 0) return 0;
    if (currentStep > quizQuestions.length) return 100;
    return Math.round(((currentStep - 1) / quizQuestions.length) * 100);
  }, [currentStep]);

  const herbByName = useMemo(
    () => new Map(herbs.map((h) => [h.name_vn.toLowerCase().trim(), h])),
    [herbs]
  );

  const getMatchedHerbObject = (name) => herbByName.get(name.toLowerCase().trim());

  return (
    <main className="content-page container fade-in">
      <header className="page-header">
        <span className="eyebrow">Interactive Assessment</span>
        <h1>Trắc Nghiệm Triệu Chúng Tự Chẩn Đoán</h1>
        <p>
          Bản trắc nghiệm chuyên sâu dựa trên phương pháp Vấn Chẩn (Thập Vấn) của y học cổ truyền giúp nhận diện sâu rộng thể trạng tạng phủ của bạn.
        </p>
      </header>

      <div className="quiz-card-wrapper glass">
        
        {/* PROGRESS BAR */}
        {currentStep > 0 && currentStep <= quizQuestions.length && (
          <div className="quiz-progress-container">
            <div className="progress-text">
              <span>Tiến độ câu hỏi: {currentStep} / {quizQuestions.length}</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        )}

        {/* STEP 0: INTRO */}
        {currentStep === 0 && (
          <div className="quiz-step-intro fade-in">
            <div className="intro-icon">📋</div>
            <h2>Biện Chứng Vấn Chẩn Chuyên Sâu</h2>
            <p>
              Khảo sát toàn diện 12 dấu hiệu lâm sàng tương ứng với các kinh mạch và tạng phủ chính. Hệ thống phân tích logic Đông y sẽ đối chiếu và xây dựng biểu đồ hội chứng của bạn để đề xuất giải pháp chăm sóc dưỡng sinh toàn diện.
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

        {/* STEPS 1-12: QUESTIONS */}
        {currentStep > 0 && currentStep <= quizQuestions.length && (
          <div className="quiz-step-question fade-in" key={currentStep}>
            <span className="question-counter">CÂU HỎI {currentStep} / {quizQuestions.length}</span>
            <h2 className="question-title">{quizQuestions[currentStep - 1].question}</h2>
            
            <div className="options-list">
              {quizQuestions[currentStep - 1].options.map((option, index) => (
                <button
                  key={index}
                  className="option-btn"
                  onClick={() => handleSelectOption(option.scores)}
                  type="button"
                >
                  <span className="option-marker">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 13: RESULTS */}
        {currentStep > quizQuestions.length && activeDiagnosis && (
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
              <h3>Độ tương thích các hội chứng tạng phủ & khí huyết</h3>
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
                    const maxPossibleScore = 15;
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
