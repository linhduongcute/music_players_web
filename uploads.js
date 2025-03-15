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

function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Xóa dấu tiếng Việt
    .replace(/\s+/g, "_") // Thay dấu cách bằng dấu _
    .replace(/[^\w.-]/g, ""); // Xóa ký tự đặc biệt
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

async function addSong(title, artist, duration, album, file_path) {
  const { data, error } = await supabaseClient.from("songs").insert([
    {
      title: title,
      artist: artist,
      duration: duration,
      album: album,
      file_path: file_path,
    },
  ]);

  if (error) {
    console.error("Lỗi khi thêm bài hát vào database:", error.message);
    return;
  }

  console.log("Bài hát đã được thêm vào database!", data);
  loadSongs(); // Cập nhật danh sách bài hát sau khi upload thành công
}

async function uploadMusic() {
  const fileInput = document.getElementById("fileInput");
  const songTitle = document.getElementById("songTitle").value.trim();
  const artistName = document.getElementById("artistName").value.trim();
  const albumName = document.getElementById("albumName").value.trim();
  if (!fileInput || !songTitle || !artistName || !albumName) {
    alert("Vui lòng nhập đầy đủ thông tin bài hát!");
    return;
  }
  const file = fileInput.files[0];
  if (!file) {
    alert("Vui lòng chọn file nhạc!");
    return;
  }

  const sanitizedFileName = sanitizeFileName(file.name);
  const sanitizedFilePath = `music/${sanitizedFileName}`;

  const { data, error } = await supabaseClient.storage
    .from("music")
    .upload(sanitizedFilePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Lỗi upload file:", error.message);
    alert("Upload thất bại!");
    return;
  }

  const audio = new Audio();
  audio.src = URL.createObjectURL(file);

  audio.addEventListener("loadedmetadata", function () {
    let duration = audio.duration.toFixed(2);
    duration = formatTime(duration);
    console.log("Thời gian bài hát:", duration);
    saveSongInfo(songTitle, artistName, duration, albumName, sanitizedFilePath);
  });

  audio.load();
}

async function saveSongInfo(title, artist, duration, album, filePath) {
  await addSong(title, artist, duration, album, filePath);
  alert("Upload thành công!");
  loadSongs(); // Cập nhật danh sách bài hát sau khi thêm vào database
}

document.getElementById("uploadButton").addEventListener("click", uploadMusic);

async function loadSongs() {
  const { data, error } = await supabaseClient.from("songs").select("*");
  const songList = document.getElementById("songList");

  if (!songList) {
    console.error("Không tìm thấy songList trong HTML.");
    return;
  }

  songList.innerHTML = "";

  if (error) {
    console.error("Lỗi tải danh sách bài hát:", error.message);
    return;
  }

  if (data.length === 0) {
    songList.innerHTML = "<p>Không có bài hát nào được tải lên.</p>";
    return;
  }

  data.forEach((song, index) => {
    const songItem = document.createElement("li");
    songItem.classList.add("playlist-item");
    if (song.file_path) {
      songItem.dataset.file_path = song.file_path;
    } else {
      console.error(`Lỗi: Không tìm thấy filePath cho bài hát ${song.title}`);
    }

    songItem.innerHTML = `
      <span class="playlist-number">${index + 1}</span>
      <span class="playlist-title" data-title="${song.title}"> ${song.title}
      </span>
      <span class="playlist-artist" data-artist="${song.artist}">${
      song.artist
    }</span>
      <span class="playlist-time" data-time="${song.duration}">${
      song.duration
    }</span>
      <span class="playlist-album" data-album="${song.album}">${
      song.album
    }</span>    `;
    songList.prepend(songItem);
  });
  attachSongClickEvent();
}

document.addEventListener("DOMContentLoaded", loadSongs);

function attachSongClickEvent() {
  document.querySelectorAll("#songList .playlist-item").forEach((item) => {
    item.addEventListener("click", function () {
      const title = this.querySelector(".playlist-title").dataset.title;
      const artist = this.querySelector(".playlist-artist").dataset.artist;
      const time = this.querySelector(".playlist-time").dataset.time;
      const album = this.querySelector(".playlist-album").dataset.album;
      const path = this.dataset.file_path;
      if (!title || !artist || !time || !album) {
        console.error("Lỗi: Dữ liệu bài hát bị thiếu!");
        return;
      }

      addToPlaylist(title, artist, time, album, path);
      const songUrl = getSongURL(path);
      console.log("FilePath từ dataset:", item.dataset.file_path);
      console.log("URL nhạc từ Supabase:", songUrl);
    });
  });
}

function addToPlaylist(title, artist, time, album, file_path) {
  const playlist = document.getElementById("playlist");
  if (!playlist) return;

  const songItem = document.createElement("li");
  songItem.classList.add("playlist-item");
  if (file_path) {
    songItem.dataset.file_path = file_path;
  } else {
    console.error("Lỗi: filePath không có giá trị!");
  }

  songItem.innerHTML = `
    <span class="playlist-number">${playlist.children.length + 1}</span>
    <span class="playlist-title">${title}</span>
    <span class="playlist-artist">${artist}</span>
    <span class="playlist-time">${time}</span>
    <span class="playlist-album">${album}</span>
  `;

  playlist.appendChild(songItem);
  alert("Bài hát được lưu");
}

async function getSongURL(filePath) {
  const { data, error } = await supabaseClient.storage
    .from("music") // Đảm bảo đúng tên bucket
    .getPublicUrl(filePath);

  if (error) {
    console.error("Lỗi lấy URL bài hát:", error.message);
    return null;
  }

  return data.publicUrl;
}
