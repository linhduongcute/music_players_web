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
// 🎵 Phát nhạc
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  const featuredTitle = document.getElementById("song-listening");
  const featuredLabel = document.getElementById("featured-label");
  const featuredImage = document.getElementById("featured-image");
  const downloadButton = document.getElementById("download-button");
  const audioElement = document.getElementById("audio");
  const playlist = document.getElementById("playlist");

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
  playlist.addEventListener("click", async function (event) {
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
      audioElement.play().catch((error) => {
        console.error("Lỗi phát nhạc:", error);
      });

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

    const a = document.createElement("a");
    a.href = songUrl;
    a.download = filePath.split("/").pop(); // Đặt tên file khi tải về
    a.target = "_blank";
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
