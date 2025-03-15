window.sanitizeFileName = function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Xóa dấu tiếng Việt
    .replace(/\s+/g, "_") // Thay dấu cách bằng dấu _
    .replace(/[^\w.-]/g, ""); // Xóa ký tự đặc biệt
};

window.formatTime = function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};
