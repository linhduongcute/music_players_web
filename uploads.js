let playlistArray = [];

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

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

async function addSong(title, artist, duration, album, file_path, image_src) {
  const { data, error } = await supabaseClient
    .from("songs")
    .insert([{ title, artist, duration, album, file_path, image_src }]);

  if (error) {
    Swal.fire("Lỗi!", "Không thể thêm bài hát vào database!", "error");
    console.error("Lỗi khi thêm bài hát vào database:", error.message);
    return;
  }

  Swal.fire("Thành công!", "Bài hát đã được thêm vào database!", "success");
  loadSongs();
}

async function uploadMusic() {
  const fileInput = document.getElementById("fileInput");
  const songTitle = document.getElementById("songTitle").value.trim();
  const artistName = document.getElementById("artistName").value.trim();
  const albumName = document.getElementById("albumName").value.trim();

  if (!fileInput || !songTitle || !artistName || !albumName) {
    Swal.fire("Lỗi!", "Vui lòng nhập đầy đủ thông tin bài hát!", "warning");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    Swal.fire("Lỗi!", "Vui lòng chọn file nhạc!", "warning");
    return;
  }

  const sanitizedFileName = sanitizeFileName(file.name);
  const sanitizedFilePath = `music/${sanitizedFileName}`;

  const { data, error } = await supabaseClient.storage
    .from("music")
    .upload(sanitizedFilePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    Swal.fire("Lỗi!", "Upload thất bại!", "error");
    console.error("Lỗi upload file:", error.message);
    return;
  }

  const audio = new Audio();
  audio.src = URL.createObjectURL(file);

  audio.addEventListener("loadedmetadata", function () {
    let duration = formatTime(audio.duration.toFixed(2));
    saveSongInfo(songTitle, artistName, duration, albumName, sanitizedFilePath);
  });

  audio.load();
}

async function saveSongInfo(title, artist, duration, album, filePath) {
  await addSong(title, artist, duration, album, filePath);
  Swal.fire("Thành công!", "Upload bài hát thành công!", "success");
  loadSongs();
}

document.getElementById("uploadButton").addEventListener("click", uploadMusic);

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
    songItem.dataset.file_path = song.file_path || "";
    songItem.dataset.image_src =
      song.image_src ||
      "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png";

    songItem.innerHTML = `
      <span class="playlist-number">${index + 1}</span>
      <span class="playlist-title">${song.title}</span>
      <span class="playlist-artist">${song.artist}</span>
      <span class="playlist-time">${song.duration}</span>
      <span class="playlist-album">${song.album}</span>
      
    `;
    songList.prepend(songItem);
  });

  attachSongClickEvent();
}

document.addEventListener("DOMContentLoaded", loadSongs);

function attachSongClickEvent() {
  document.querySelectorAll("#songList .playlist-item").forEach((item) => {
    item.addEventListener("click", function () {
      const title = this.querySelector(".playlist-title").textContent;
      const artist = this.querySelector(".playlist-artist").textContent;
      const time = this.querySelector(".playlist-time").textContent;
      const album = this.querySelector(".playlist-album").textContent;
      const path = this.dataset.file_path;
      const image_src = this.dataset.image_src;

      if (!title || !artist || !time || !album || !path) {
        Swal.fire("Lỗi!", "Dữ liệu bài hát bị thiếu!", "error");
        return;
      }
      addToPlaylist(title, artist, time, album, path, image_src);
      const songUrl = getSongURL(path);
      console.log("FilePath từ dataset:", item.dataset.file_path);
      console.log("URL anhr từ Supabase:", item.dataset.image_src);
      console.log("URL nhạc từ Supabase:", songUrl);
    });
  });
}

function addToPlaylist(title, artist, time, album, file_path, image_src) {
  const playlistElement = document.getElementById("playlist");
  if (!playlistElement) return;

  const songItem = document.createElement("li");
  songItem.classList.add("queue-item");
  songItem.dataset.file_path = file_path || "";

  songItem.innerHTML = `
    <span class="playlist-number">${playlistElement.children.length + 1}</span>
    <span class="playlist-img">
      <img src="${image_src}" width="50" alt="${title}"> 
    </span>
    <div> 
      <span class="playlist-title">${title}</span>
      <span class="playlist-artist">${artist}</span>
    </div>
  `;
  playlistElement.appendChild(songItem);
  playlistArray.push({
    title,
    artist,
    time,
    album,
    filePath: file_path,
    image_src,
  });

  Swal.fire(
    "Thành công!",
    "Bài hát đã được thêm vào danh sách phát!",
    "success"
  );
}
