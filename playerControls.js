let currentSongIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("audio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const progressBar = document.getElementById("progressBar");
  const progressFilled = document.getElementById("progressFilled");
  const currentTimeDisplay = document.getElementById("currentTime");
  const totalTimeDisplay = document.getElementById("totalTime");
  const loadSong = window.loadSongs; // Lấy hàm từ `script.js`

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

  // 🚀 Chuyển bài hát tiếp theo
  let SongIndex = 0; // Bắt đầu từ bài đầu tiên

  audio.addEventListener("ended", function () {
    if (playlistArray.length === 0) {
      console.error("Danh sách bài hát trống!");
      return;
    }

    // Nếu chưa đến bài cuối, phát bài tiếp theo
    SongIndex++;

    if (SongIndex < playlistArray.length) {
      console.log("Đang phát bài hát:", playlistArray[SongIndex]);
      audio.play().catch((error) => {
        console.warn("Không thể tự động phát bài hát:", error);
      });
    } else {
      console.log("Hết danh sách phát!");
    }
  });
});
