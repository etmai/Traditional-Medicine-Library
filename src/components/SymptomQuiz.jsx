import React, { useState, useMemo } from 'react';
import './SymptomQuiz.css';

// 6 interactive questions with weighted score options representing Chinese Medicine syndromes
const quizQuestions = [
  {
    id: 1,
    question: "1. Bạn thường có cảm giác thân nhiệt như thế nào?",
    options: [
      {
        text: "Sợ lạnh, tay chân thường xuyên lạnh buốt, thích đắp chăn ấm",
        scores: { deficiencyCold: 3, qiDeficiency: 1 }
      },
      {
        text: "Sợ nóng, người hay bứt rứt bốc hỏa, lòng bàn tay bàn chân nóng",
        scores: { excessHeat: 3 }
      },
      {
        text: "Bình thường, thích nghi tốt với cả thời tiết nóng và lạnh",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 2,
    question: "2. Thói quen ăn uống và cảm giác khát nước của bạn ra sao?",
    options: [
      {
        text: "Thích uống nước ấm, thích ăn đồ nóng, ăn đồ lạnh dễ đầy bụng, đi lỏng",
        scores: { deficiencyCold: 2, spleenStomach: 2 }
      },
      {
        text: "Thường xuyên khát nước, thích uống nước đá/nước lạnh, mau đói",
        scores: { excessHeat: 3, spleenStomach: 1 }
      },
      {
        text: "Ăn uống bình thường, không khát nước nhiều, tiêu hóa ổn định",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 3,
    question: "3. Mức độ năng lượng, sức bền và hơi thở hàng ngày của bạn?",
    options: [
      {
        text: "Rất dễ mệt mỏi, hụt hơi khi nói nhiều, tự ra mồ hôi dù không vận động nặng",
        scores: { qiDeficiency: 3, lungQi: 2 }
      },
      {
        text: "Người nặng nề, uể oải, ngủ nhiều vẫn thấy thiếu tỉnh táo, ngực sườn đầy chướng",
        scores: { spleenStomach: 1, lungQi: 1 }
      },
      {
        text: "Tinh thần tỉnh táo, tràn đầy năng lượng, nhịp thở điều hòa",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 4,
    question: "4. Tình trạng tiêu hóa và đại tiểu tiện của bạn gần đây?",
    options: [
      {
        text: "Ăn uống chậm tiêu, bụng hay chướng ọc ạch, phân thường sống, lỏng nát",
        scores: { spleenStomach: 3, deficiencyCold: 1 }
      },
      {
        text: "Dễ bị táo bón, phân khô kết cứng, tiểu tiện nước vàng đậm hoặc đỏ sẻn",
        scores: { excessHeat: 3, spleenStomach: 1 }
      },
      {
        text: "Đại tiện đều đặn phân thành khuôn, nước tiểu trong vàng nhạt",
        scores: { balanced: 2 }
      }
    ]
  },
  {
    id: 5,
    question: "5. Chất lượng giấc ngủ và tâm trạng của bạn thế nào?",
    options: [
      {
        text: "Khó vào giấc, ngủ hay mơ, dễ giật mình hồi hộp lo âu, trí nhớ giảm sút",
        scores: { qiDeficiency: 2, balanced: -1 }
      },
      {
        text: "Ngủ chập chờn, bứt rứt, hay tỉnh giấc giữa đêm, dễ nổi giận cáu gắt",
        scores: { excessHeat: 2, qiDeficiency: 1 }
      },
      {
        text: "Ngủ ngon giấc 6-8 tiếng, tinh thần sảng khoái và thư thái khi thức dậy",
        scores: { balanced: 3 }
      }
    ]
  },
  {
    id: 6,
    question: "6. Tình trạng đau nhức hoặc cảm giác khó chịu khác trên cơ thể?",
    options: [
      {
        text: "Hay bị đau mỏi ê ẩm cơ khớp lưng gối, đau tăng khi thời tiết chuyển lạnh ẩm",
        scores: { deficiencyCold: 2 }
      },
      {
        text: "Đau nhức nhối cố định ở một vị trí cụ thể, da dẻ khô xạm, môi sắc tím",
        scores: { bloodStasis: 3 }
      },
      {
        text: "Không có cảm giác đau nhức hay mệt mỏi đặc biệt nào ở cơ khớp",
        scores: { balanced: 3 }
      }
    ]
  }
];

// Detailed diagnosis profiles with associated herbs, formulas, and acupressure guides
const diagnosisProfiles = {
  deficiencyCold: {
    title: "Thể Trạng Hư Hàn (Yang Deficiency / Cold)",
    description: "Cơ thể bạn đang có xu hướng thiếu hụt dương khí (dương hư), dẫn đến khả năng sinh nhiệt kém, mạch máu co thắt gây sợ lạnh, chân tay lạnh, chức năng vận hóa tỳ vị suy giảm.",
    advice: "Nên giữ ấm cơ thể, hạn chế ăn đồ sống lạnh (kem, nước đá, rau sống). Tăng cường các vị ấm nóng như gừng, tỏi, quế trong chế độ ăn hàng ngày.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo", "Đương quy"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["ki", "sp"],
    acupoints: [
      { code: "CV4", name: "Quan Nguyên", desc: "Nằm dưới rốn 3 thốn (khoảng 4 ngón tay nằm ngang). Cứu ấm hoặc day ấm nhẹ nhàng để bổ nguyên dương khí." },
      { code: "CV6", name: "Khí Hải", desc: "Nằm dưới rốn 1.5 thốn. Nơi hội tụ của sinh khí, giúp ôn ấm hạ tiêu." },
      { code: "GV4", name: "Mệnh Môn", desc: "Nằm ở cột sống thắt lưng, đối diện rốn ra sau lưng. Giúp bổ thận tráng dương." }
    ]
  },
  excessHeat: {
    title: "Thể Trạng Thực Nhiệt (Excess Heat / Inflammatory)",
    description: "Cơ thể bạn có xu hướng tích nhiệt mạnh, dễ bốc hỏa, viêm nhiệt, khát nước, tân dịch hao tổn dẫn đến táo bón, tiểu đỏ sẻn, tinh thần bứt rứt.",
    advice: "Hạn chế đồ ăn cay nóng, chiên xào nhiều dầu mỡ, rượu bia. Bổ sung các loại nước thanh nhiệt như trà cúc hoa, nước rau má, nước đậu đen nấu ấm.",
    herbs: ["Bạch cúc hoa", "Bạc hà"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["lu", "st"],
    acupoints: [
      { code: "LI4", name: "Hợp Cốc", desc: "Nằm ở hổ khẩu giữa ngón cái và ngón trỏ. Day bấm tả pháp (bấm mạnh) để thanh nhiệt, sơ phong giải biểu." },
      { code: "LI11", name: "Khúc Trì", desc: "Nằm ở đầu ngoài nếp gấp khuỷu tay khi co cánh tay lại. Là huyệt đặc hiệu hạ sốt, thanh nhiệt cơ thể." }
    ]
  },
  qiDeficiency: {
    title: "Thể Trạng Khí Hư (Qi Deficiency / Fatigue)",
    description: "Năng lượng sinh học (khí) trong cơ thể bạn bị suy giảm nghiêm trọng, làm giảm khả năng bảo vệ của tỳ phế, gây đoản hơi, mệt mỏi mạn tính, tự ra mồ hôi.",
    advice: "Tránh làm việc quá sức, ngủ đủ giấc, tập các bài dưỡng sinh hoặc yoga nhẹ nhàng. Ăn uống đầy đủ dinh dưỡng, ưu tiên thức ăn chín mềm, dễ tiêu.",
    herbs: ["Nhân sâm", "Bạch truật", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "lu"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Nằm dưới hõm ngoài xương bánh chè 3 thốn. Huyệt cường tráng cơ thể chủ chốt, bổ tỳ ích vị, nâng cao chính khí." },
      { code: "CV12", name: "Trung Quản", desc: "Nằm trên rốn 4 thốn. Huyệt hội của lục phủ, điều hòa vị khí, kiện tỳ hóa thấp." }
    ]
  },
  bloodStasis: {
    title: "Thể Trạng Huyết Ứ (Blood Stasis / Poor Circulation)",
    description: "Tuần hoàn khí huyết trong kinh mạch của bạn đang bị cản trở hoặc ứ trệ, biểu hiện qua các cơn đau nhói cố định, sắc môi tím hoặc da dẻ xạm tối.",
    advice: "Hạn chế ngồi lâu một chỗ, tăng cường đi bộ nhẹ nhàng để hành khí hoạt huyết. Giữ ấm cơ thể để tránh lạnh gây co thắt mạch máu.",
    herbs: ["Đương quy"],
    prescriptions: ["Tứ Quân Tử Thang"], // Default fallback or active ones
    meridians: ["lr", "ht"],
    acupoints: [
      { code: "SP6", name: "Tam Âm Giao", desc: "Nằm trên đỉnh mắt cá chân trong 3 thốn. Huyệt hội của 3 kinh âm ở chân, hoạt huyết, thông kinh hoạt lạc." },
      { code: "SI3", name: "Hậu Khê", desc: "Nằm ở đầu nếp gấp ngang bàn tay phía ngón út khi nắm hờ tay. Giúp thông đốc mạch, tán ứ chỉ thống." }
    ]
  },
  spleenStomach: {
    title: "Mất Cân Bằng Tỳ Vị (Spleen-Stomach Imbalance)",
    description: "Chức năng tiêu hóa (vận hóa) của Tỳ và Vị của bạn suy yếu, dẫn đến thức ăn đình trệ gây chướng bụng, phân sống nát, ăn không ngon miệng.",
    advice: "Ăn uống đúng giờ, nhai kỹ, không ăn quá no vào buổi tối. Tránh đồ ăn nhiều dầu mỡ khó tiêu, đồ ngọt béo sinh đàm thấp.",
    herbs: ["Bạch truật", "Cam thảo", "Nhân sâm"],
    prescriptions: ["Tứ Quân Tử Thang"],
    meridians: ["sp", "st"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Day bấm hàng ngày từ 3-5 phút để tăng cường nhu động ruột và nâng cao hiệu suất tiêu hóa." },
      { code: "ST25", name: "Thiên Khu", desc: "Nằm từ rốn đo ngang ra 2 thốn. Giúp điều hòa đại tràng, chỉ tả (trị tiêu chảy) và trị táo bón." }
    ]
  },
  lungQi: {
    title: "Thể Trạng Phế Khí Kém (Lung Qi Weakness / Respiratory)",
    description: "Vệ khí của Phế suy giảm khiến đường hô hấp của bạn dễ bị kích ứng bởi thời tiết, dễ ho hắt hơi, ngực đầy tức, nhạy cảm với khí lạnh.",
    advice: "Giữ ấm vùng cổ họng và ngực, đeo khẩu trang khi ra đường lạnh. Có thể xông mũi bằng gừng sả hoặc bạc hà để thông phế khí.",
    herbs: ["Nhân sâm", "Bạc hà"],
    prescriptions: ["Tang Cúc Ẩm"],
    meridians: ["lu"],
    acupoints: [
      { code: "LU7", name: "Liệt Khuyết", desc: "Đan chéo hai ngón tay cái và trỏ của hai tay vào nhau, huyệt nằm ở chỗ lõm dưới đầu ngón tay trỏ. Tuyên phế, sơ phong giải biểu." },
      { code: "LU9", name: "Thái Uyên", desc: "Trên lằn chỉ cổ tay, ở chỗ lõm phía ngoài động mạch quay. Huyệt nguyên của kinh Phế, bổ ích phế khí." },
      { code: "GB20", name: "Phong Trì", desc: "Ở chỗ lõm phía sau tai, dưới xương chẩm. Huyệt đặc trị ngoại phong xâm nhập đầu mặt phế khí." }
    ]
  },
  balanced: {
    title: "Thể Trạng Bình Hòa (Balanced & Healthy)",
    description: "Chúc mừng! Khí huyết và âm dương của cơ thể bạn đang ở trạng thái cân bằng tương đối tốt. Tinh thần thoải mái, chức năng tạng phủ vận hành trơn tru.",
    advice: "Hãy tiếp tục duy trì chế độ ăn uống khoa học, rèn luyện thể thao đều đặn và giữ vững tinh thần thoải mái để duy trì trạng thái lý tưởng này.",
    herbs: ["Nhân sâm", "Cam thảo"],
    prescriptions: ["Tứ Quân Tử Thang", "Tang Cúc Ẩm"],
    meridians: ["lu", "ki", "sp", "st"],
    acupoints: [
      { code: "ST36", name: "Túc Tam Lý", desc: "Day bấm thường xuyên để dưỡng sinh trường thọ, phòng bệnh tật." },
      { code: "SP6", name: "Tam Âm Giao", desc: "Day bấm bổ ích can tỳ thận âm, điều hòa huyết mạch cơ thể." }
    ]
  }
};

function SymptomQuiz({ herbs = [], onSelectHerb, onNavigateToMeridian, onNavigateToPrescription }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1-6: Questions, 7: Result
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
      // End of quiz, compile results
      calculateDiagnosis(newAnswers);
      setCurrentStep(quizQuestions.length + 1);
    }
  };

  const calculateDiagnosis = (compiledAnswers) => {
    const tallies = {
      deficiencyCold: 0,
      excessHeat: 0,
      qiDeficiency: 0,
      bloodStasis: 0,
      spleenStomach: 0,
      lungQi: 0,
      balanced: 0
    };

    compiledAnswers.forEach(answer => {
      Object.entries(answer).forEach(([syndrome, score]) => {
        if (tallies[syndrome] !== undefined) {
          tallies[syndrome] += score;
        }
      });
    });

    // Determine the syndrome with highest score
    let highestSyndrome = 'balanced';
    let highestScore = 0;

    Object.entries(tallies).forEach(([syndrome, score]) => {
      // Balanced score needs to beat other syndromes or if all other scores are low
      if (syndrome !== 'balanced' && score > highestScore) {
        highestScore = score;
        highestSyndrome = syndrome;
      }
    });

    // If no distinct imbalance is higher than 2 points, default to balanced
    if (highestScore <= 2) {
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
        <h1>Trắc Nghiệm Triệu Chứng Tự Chẩn Đoán</h1>
        <p>
          Dựa trên lý luận biện chứng luận trị Đông y để phân tích trạng thái âm dương khí huyết và gợi ý phương pháp dưỡng sinh phù hợp.
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
            <h2>Biện Chứng Luận Trị Trực Tuyến</h2>
            <p>
              Bài trắc nghiệm gồm 6 câu hỏi khảo sát các triệu chứng sinh lý đặc trưng như cảm giác nóng lạnh, thói quen ăn uống, tiêu hóa, giấc ngủ và đau nhức. Hệ thống sẽ tính toán các chỉ số mất cân bằng năng lượng và đề xuất:
            </p>
            <ul className="intro-benefits">
              <li>🍀 Các vị thuốc Đông y phù hợp nhất với thể trạng.</li>
              <li>🍲 Các bài thuốc cổ phương khuyên dùng làm nền tảng gia giảm.</li>
              <li>📍 Lộ trình kinh lạc & các huyệt vị quan trọng cần tự day bấm kích hoạt.</li>
            </ul>
            <div className="alert-panel caution" style={{ marginTop: '20px', marginBottom: '25px' }}>
              <strong>⚠️ KHUYẾN CÁO AN TOÀN</strong>
              <p>Kết quả từ bộ trắc nghiệm mang tính chất tham khảo dưỡng sinh học và hỗ trợ tra cứu học tập. Tuyệt đối không thay thế cho chỉ định điều trị y khoa chuyên nghiệp của thầy thuốc.</p>
            </div>
            <button className="quiz-start-btn" onClick={startQuiz} type="button">
              Bắt đầu Trắc nghiệm tự chẩn đoán
            </button>
          </div>
        )}

        {/* STEPS 1-6: QUESTIONS */}
        {currentStep > 0 && currentStep <= quizQuestions.length && (
          <div className="quiz-step-question fade-in" key={currentStep}>
            <span className="question-counter">CÂU HỎI {currentStep}</span>
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

        {/* STEP 7: RESULTS */}
        {currentStep > quizQuestions.length && activeDiagnosis && (
          <div className="quiz-step-results fade-in">
            <div className="result-header">
              <span className="result-badge">Kết quả phân tích thể trạng</span>
              <h2>{activeDiagnosis.profile.title}</h2>
              <p className="result-description">{activeDiagnosis.profile.description}</p>
            </div>

            {/* SYNDROMES CHART METERS */}
            <div className="scores-visualization-panel">
              <h3>Biểu đồ mất cân bằng âm dương & khí huyết</h3>
              <div className="scores-grid">
                {Object.entries(activeDiagnosis.scores)
                  .filter(([syn]) => syn !== 'balanced')
                  .map(([syndrome, score]) => {
                    const labelMap = {
                      deficiencyCold: "Hư Hàn (Lạnh)",
                      excessHeat: "Thực Nhiệt (Nóng)",
                      qiDeficiency: "Khí Hư (Mệt mỏi)",
                      bloodStasis: "Huyết Ứ (Tuần hoàn)",
                      spleenStomach: "Tỳ Vị Hư (Tiêu hóa)",
                      lungQi: "Phế Khí Kém (Hô hấp)"
                    };
                    const maxPossibleScore = 8;
                    const pct = Math.min(Math.round((score / maxPossibleScore) * 100), 100);
                    return (
                      <div key={syndrome} className="score-meter-row">
                        <div className="score-meta">
                          <span className="score-label">{labelMap[syndrome]}</span>
                          <span className="score-num">{score}đ / 8đ ({pct}%)</span>
                        </div>
                        <div className="score-bar-bg">
                          <div
                            className={`score-bar-fill ${syndrome === activeDiagnosis.syndrome ? 'primary' : ''}`}
                            style={{ width: `${pct}%`, background: syndrome === activeDiagnosis.syndrome ? 'var(--primary-color)' : 'rgba(107, 68, 35, 0.2)' }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ADVICE */}
            <div className="alert-panel info" style={{ background: 'rgba(107, 68, 35, 0.04)', border: '1px solid rgba(107, 68, 35, 0.15)', color: 'var(--text-main)' }}>
              <strong>💡 Lời khuyên dưỡng sinh:</strong>
              <p>{activeDiagnosis.profile.advice}</p>
            </div>

            {/* RECOMMENDATIONS SECTION */}
            <div className="recommendations-box">
              <h3>Đề xuất Trị liệu & Dưỡng sinh</h3>

              {/* RECOMMENDED HERBS */}
              <div className="rec-section">
                <h4>🌿 Thảo dược phù hợp:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
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
                <h4>🍲 Bài thuốc cổ phương khuyên dùng:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
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
                <h4>📍 Huyệt vị tự day bấm phòng trị bệnh:</h4>
                <div className="rec-acupoints-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
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
                      <div key={ap.code} style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ color: 'var(--secondary-color)', fontSize: '14.5px' }}>
                            Huyệt {ap.name} ({ap.code})
                          </strong>
                          {mId && onNavigateToMeridian && (
                            <button
                              onClick={() => onNavigateToMeridian(mId)}
                              type="button"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                color: 'var(--primary-color)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '11.5px',
                                textDecoration: 'underline'
                              }}
                            >
                              Xem kinh lạc tương ứng
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>
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
                Thực hiện lại Trắc nghiệm tự chẩn đoán
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default SymptomQuiz;
