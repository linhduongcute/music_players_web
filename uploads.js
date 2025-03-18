let playlistArray = []; // Danh sách bài hát (cần cập nhật khi tải nhạc)

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
    }</span>
    <span class="favorite-icon" data-fav="false">🤍</span>    `;
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
  const playlistElement = document.getElementById("playlist");
  if (!playlistElement) return;

  const songItem = document.createElement("li");
  songItem.classList.add("playlist-item");
  if (file_path) {
    songItem.dataset.file_path = file_path;
  } else {
    console.error("Lỗi: filePath không có giá trị!");
  }

  songItem.innerHTML = `
    <span class="playlist-number">${playlistElement.children.length + 1}</span>
    <span class="playlist-title">${title}</span>
    <span class="playlist-artist">${artist}</span>
    <span class="playlist-time">${time}</span>
    <span class="playlist-album">${album}</span>
    <span class="favorite-icon" data-fav="false">🤍</span>
  `;

  playlistElement.appendChild(songItem);
  playlistArray.push({ title, artist, time, album, filePath: file_path });

  console.log("Danh sách phát trong JS:", playlistArray);
  alert("Bài hát được thêm vào danh sách!");

  updateFavoriteIcons();
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

function updateFavoriteIcons() {
  document.querySelectorAll(".favorite-icon").forEach((icon, index) => {
    icon.addEventListener("click", function () {
      // Đảo trạng thái yêu thích
      const isFav = playlistArray[index].favorite;
      playlistArray[index].favorite = !isFav;

      // Cập nhật icon hiển thị
      icon.textContent = isFav ? "🤍" : "❤️";
      icon.classList.toggle("active", !isFav);

      console.log(
        `Bài hát "${playlistArray[index].title}" yêu thích:`,
        playlistArray[index].favorite
      );
    });
  });
}
