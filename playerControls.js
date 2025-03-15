document.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("audio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const progressBar = document.getElementById("progressBar");
  const progressFilled = document.getElementById("progressFilled");
  const currentTimeDisplay = document.getElementById("currentTime");
  const totalTimeDisplay = document.getElementById("totalTime");

  let playlist = []; // Danh sách bài hát (cần cập nhật khi tải nhạc)
  let currentSongIndex = 0;

  // 🚀 Play/Pause nhạc
  playPauseBtn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play();
      playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    } else {
      audio.pause();
      playPauseBtn.innerHTML = `<i class="fas fa-play"></i>`;
    }
  });

  // 🚀 Cập nhật thanh tiến trình khi nhạc phát
  audio.addEventListener("timeupdate", function () {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressFilled.style.width = `${progressPercent}%`;

    // Cập nhật thời gian hiện tại
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
  });

  // 🚀 Cập nhật tổng thời gian khi tải nhạc
  audio.addEventListener("loadedmetadata", function () {
    totalTimeDisplay.textContent = formatTime(audio.duration);
  });

  // 🚀 Tua nhạc khi nhấn vào thanh tiến trình
  progressBar.addEventListener("click", function (event) {
    const barWidth = progressBar.clientWidth;
    const clickX = event.offsetX;
    const seekTime = (clickX / barWidth) * audio.duration;
    audio.currentTime = seekTime;
  });

  // 🚀 Chuyển bài hát trước
  prevButton.addEventListener("click", function () {
    if (currentSongIndex > 0) {
      currentSongIndex--;
      loadSong(playlist[currentSongIndex]);
      audio.play();
    }
  });

  // 🚀 Chuyển bài hát tiếp theo
  nextButton.addEventListener("click", function () {
    if (currentSongIndex < playlist.length - 1) {
      currentSongIndex++;
      loadSong(playlist[currentSongIndex]);
      audio.play();
    }
  });

  // 🚀 Hàm định dạng thời gian (phút:giây)
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  // 🚀 Hàm tải bài hát
  function loadSong(songUrl) {
    if (!songUrl) return;
    audio.src = songUrl;
    audio.load();
  }

  // 🚀 Cập nhật danh sách playlist
  function updatePlaylist(songs) {
    playlist = songs;
    currentSongIndex = 0;
    if (playlist.length > 0) {
      loadSong(playlist[currentSongIndex]);
    }
  }

  // Export hàm cập nhật playlist (dùng trong `script.js`)
  window.updatePlaylist = updatePlaylist;
});
