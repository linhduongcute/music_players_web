// ==========================
// 🎵 Kiểm tra đăng nhập
// ==========================

// Kiểm tra xem đã đăng nhập chưa
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("index.html")) {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.location.href = "login.html"; // Chuyển hướng về login
    }
  }
});

// ==========================
// 🚪 Đăng xuất
// ==========================
function logout() {
  localStorage.removeItem("isLoggedIn"); // Xóa trạng thái đăng nhập
  window.location.href = "login.html"; // Chuyển hướng về login
}

// Gắn sự kiện logout cho nút đăng xuất
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.querySelector(".menu-list li:last-child"); // Tìm nút logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});

// ==========================
// 🎵 Hiển thị menu active
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".menu-list li");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Xóa class active khỏi tất cả các mục
      menuItems.forEach((li) => li.classList.remove("active"));

      // Thêm class active vào mục được click
      this.classList.add("active");
    });
  });
});

// ==========================
// 🎵 Phát nhạc
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const featuredTitle = document.getElementById("song-listening");
  const featuredLabel = document.getElementById("featured-label");
  const featuredImage = document.getElementById("featured-image");
  const audioElement = document.getElementById("audio");
  const playlistElement = document.getElementById("playlist");

  // Hàm lấy URL file từ Supabase Storage
  async function getSongURL(filePath) {
    const { data, error } = await supabaseClient.storage
      .from("music") // Tên bucket trong Supabase
      .getPublicUrl(filePath);

    if (error) {
      console.error("Lỗi lấy URL bài hát:", error.message);
      return null;
    }

    return data.publicUrl;
  }

  // Khi click vào bài hát trong playlist, cập nhật thông tin và phát nhạc
  playlistElement.addEventListener("click", async function (event) {
    const item = event.target.closest(".playlist-item");
    if (!item) return;

    document
      .querySelectorAll(".playlist-item")
      .forEach((el) => el.classList.remove("active"));
    item.classList.add("active");

    const songTitle = item.querySelector(".playlist-title").textContent;
    const artistName = item.querySelector(".playlist-artist").textContent;
    const filePath = item.dataset.file_path; // Đường dẫn file trong Storage
    const songImage = item.dataset.image || "https://via.placeholder.com/150"; // Ảnh bài hát (nếu có)

    featuredTitle.textContent = songTitle;
    featuredLabel.textContent = artistName;
    featuredImage.src = songImage;

    if (!filePath) {
      console.error("Không tìm thấy đường dẫn file.");
      return;
    }

    const songUrl = await getSongURL(filePath);
    if (songUrl) {
      audioElement.src = songUrl;

      // Cập nhật giao diện Listening Feature
      featuredTitle.textContent = songTitle;
      featuredLabel.textContent = artistName;

      const downloadButton = document.getElementById("download-button");
      downloadButton.onclick = function () {
        downloadSong(filePath);
      };
    } else {
      console.error("Không thể lấy URL bài hát từ Supabase.");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const audioElement = document.getElementById("audio");
  const currentTimeDisplay = document.getElementById("currentTime");
  const totalTimeDisplay = document.getElementById("totalTime");

  // Cập nhật thời gian thực của bài hát
  audioElement.addEventListener("timeupdate", function () {
    currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
    totalTimeDisplay.textContent = formatTime(audioElement.duration);
  });

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }
});

// ==========================
// 🎵 Tải xuống bài hát
// ==========================
function downloadSong(filePath) {
  if (!filePath) {
    console.error("Không tìm thấy filePath.");
    return;
  }

  getSongURL(filePath).then((songUrl) => {
    if (!songUrl) {
      console.error("Không thể lấy URL bài hát.");
      return;
    }

    let fileName = filePath.split("/").pop();
    const downloadUrl = `${songUrl}?download=${fileName}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName; // Đặt tên file khi tải về
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("Bài hát đã được tải xuống:", filePath);
  });
}

// ==========================
// Kết nối với Supabase
// ==========================
const { createClient } = supabase;

const supabaseUrl = "https://oscyuefajpcsopwmvwhf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zY3l1ZWZhanBjc29wd212d2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MTE0MjEsImV4cCI6MjA1NzI4NzQyMX0.w6vsdPKMb1ICn-yQUv-vbnSPhyoFNRSKrC08OqwyUNg";

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase client initialized successfully!");

// ==========================
// 🎵 upload
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  loadSongs();
  const browseButton = document.getElementById("browseButton");
  const homeButton = document.querySelector(".menu-list li:first-child"); // Nút Home
  const mainContent = document.querySelector(".main-content");
  const uploadSection = document.getElementById("uploadDownloadSection");
  const fileInput = document.getElementById("fileInput");
  const uploadButton = document.getElementById("uploadButton");

  if (browseButton && homeButton && mainContent && uploadSection) {
    // Khi bấm "Browse", ẩn trang chủ và hiển thị phần upload
    browseButton.addEventListener("click", function () {
      mainContent.style.display = "none";
      uploadSection.style.display = "block";
    });

    // Khi bấm "Home", ẩn phần upload và quay về trang chủ
    homeButton.addEventListener("click", function () {
      uploadSection.style.display = "none";
      mainContent.style.display = "block";
    });
  }

  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", async function () {
      const file = fileInput.files[0];
      if (!file) {
        alert("Vui lòng chọn một file MP3!");
        return;
      }
    });
  }
});
