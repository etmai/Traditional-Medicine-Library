export const useCaseOptions = [
  { id: "all", label: "Tất cả", shortLabel: "Tất cả" },
  { id: "tonic", label: "Bồi bổ, phục hồi", shortLabel: "Thuốc bổ" },
  { id: "cold", label: "Cảm mạo, phong hàn/nhiệt", shortLabel: "Thuốc cảm" },
  { id: "tea", label: "Trà thảo mộc, dưỡng sinh", shortLabel: "Trà thảo mộc" },
  { id: "digestion", label: "Tiêu hóa, tỳ vị", shortLabel: "Tiêu hóa" },
  { id: "women", label: "Phụ khoa, huyết hư", shortLabel: "Phụ khoa" },
  { id: "detox", label: "Thanh nhiệt, giải độc", shortLabel: "Thanh nhiệt" },
  { id: "sleep", label: "An thần, giấc ngủ", shortLabel: "An thần" },
  { id: "joint", label: "Xương khớp, thấp tý", shortLabel: "Xương khớp" },
];

export const safetyOptions = [
  { id: "all", label: "Tất cả mức cảnh báo" },
  { id: "normal", label: "Thông thường" },
  { id: "caution", label: "Cần thận trọng" },
  { id: "toxic", label: "Có độc/kiểm soát chặt" },
];

export const safetyMeta = {
  normal: {
    label: "Thông thường",
    tone: "normal",
    summary: "Vẫn cần dùng đúng thể trạng và nguồn dược liệu.",
  },
  caution: {
    label: "Cần thận trọng",
    tone: "caution",
    summary: "Cần chú ý bệnh nền, thai kỳ, liều dùng hoặc tương tác thuốc.",
  },
  toxic: {
    label: "Có độc",
    tone: "danger",
    summary: "Không tự dùng, chỉ dùng khi có chuyên môn và bào chế đúng.",
  },
};

export const getUseCaseLabel = (id) =>
  useCaseOptions.find((option) => option.id === id)?.label || id;

export const getUseCaseShortLabel = (id) =>
  useCaseOptions.find((option) => option.id === id)?.shortLabel || id;
