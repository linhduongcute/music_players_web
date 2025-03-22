const playPauseBtn = document.getElementById("playPauseBtn");
const searchResult = document.getElementById("searchResult");
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

  async function getSongImage(songTitle) {
    const { data, error } = await supabaseClient
      .from("songs")
      .select("image_src")
      .ilike("title", songTitle) // Không phân biệt chữ hoa/thường
      .single();

    if (error || !data) {
      console.error("Lỗi hoặc không tìm thấy bài hát:", error?.message);
      return "https://i.pinimg.com/236x/4f/11/5d/4f115daf9b8075f69d3e238a4313a3ec.jpg";
    }
    return data.image_src;
  }

  // Khi click vào bài hát trong playlist, cập nhật thông tin và phát nhạc
  playlistElement.addEventListener("click", async function (event) {
    const item = event.target.closest(".queue-item");
    if (!item) return;

    document
      .querySelectorAll(".queue-item")
      .forEach((el) => el.classList.remove("active"));
    item.classList.add("active");

    const songTitle = item.querySelector(".playlist-title").textContent;
    const artistName = item.querySelector(".playlist-artist").textContent;
    const filePath = item.dataset.file_path; // Đường dẫn file trong Storage
    const image_src = await getSongImage(songTitle);
    console.log(image_src);
    featuredTitle.textContent = songTitle;
    featuredLabel.textContent = artistName;
    document.getElementById("mainImg").src = image_src;

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
      audio.play();
      playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
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
    console.log(downloadUrl);
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
  const favSection = document.getElementById("favoriteSongsSection");
  const fileInput = document.getElementById("fileInput");
  const uploadButton = document.getElementById("uploadButton");

  if (
    browseButton &&
    homeButton &&
    mainContent &&
    uploadSection &&
    favButton &&
    favSection
  ) {
    // Khi bấm "Browse", ẩn trang chủ và hiển thị phần upload
    browseButton.addEventListener("click", function () {
      mainContent.style.display = "none";
      uploadSection.style.display = "block";
      favSection.style.display = "none";
      searchResult.style.display = "none";
    });

    // Khi bấm "Home", ẩn phần upload và quay về trang chủ
    homeButton.addEventListener("click", function () {
      uploadSection.style.display = "none";
      mainContent.style.display = "block";
      favSection.style.display = "none";
      searchResult.style.display = "none";
    });

    favButton.addEventListener("click", function () {
      uploadSection.style.display = "none";
      mainContent.style.display = "none";
      favSection.style.display = "block";
      searchResult.style.display = "none";
    });
  }

  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", async function () {
      const file = fileInput.files[0];
    });
  }
});

async function fetchFavoriteSongs() {
  try {
    // Truy vấn tất cả bài hát từ bảng `songs`
    const { data, error } = await supabaseClient
      .from("favourite")
      .select("id, title, artist, duration, album");

    if (error) throw error; // Báo lỗi nếu truy vấn thất bại

    // Kiểm tra nếu không có bài hát
    if (!data || data.length === 0) {
      console.log("Không có bài hát nào trong danh sách yêu thích.");
      return;
    }

    // Chèn dữ liệu vào HTML
    const section = document.getElementById("favoriteSongsSection");
    const playlistContainer = document.createElement("div");
    playlistContainer.classList.add("playlist-container");

    data.forEach((song, index) => {
      const songRow = document.createElement("li");
      songRow.classList.add("playlist-item");
      songRow.innerHTML = `
              <span class="playlist-number">${index + 1}</span>
              <span class="playlist-title">${song.title}</span>
              <span class="playlist-artist">${song.artist}</span>
              <span class="playlist-time">${song.duration}</span>
              <span class="playlist-album">${song.album}</span>
              <button class="remove-btn" onclick="removeFromFavorites(${
                song.id
              })">X</button>
          `;
      playlistContainer.appendChild(songRow);
      const removeBtn = songRow.querySelector(".remove-btn");

      removeBtn.addEventListener("click", async function () {
        await removeFromFavorites(song.id); // Xóa khỏi database
        songRow.remove(); // Xóa khỏi giao diện
      });
    });

    section.appendChild(playlistContainer);
    section.classList.remove("hidden"); // Hiển thị danh sách bài hát
  } catch (error) {
    console.error("Lỗi khi tải danh sách bài hát:", error.message);
  }
}

// // Gọi hàm khi trang tải xong
document.addEventListener("DOMContentLoaded", fetchFavoriteSongs);
