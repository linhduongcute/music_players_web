document.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("audio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const progressBar = document.getElementById("progressBar");
  const progressFilled = document.getElementById("progressFilled");

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
  });

  // 🚀 Tua nhạc khi nhấn vào thanh tiến trình
  progressBar.addEventListener("click", function (event) {
    const barWidth = progressBar.clientWidth;
    const clickX = event.offsetX;
    const seekTime = (clickX / barWidth) * audio.duration;
    audio.currentTime = seekTime;
  });

  let SongIndex = 0; // Bắt đầu từ bài đầu tiên
  audio.addEventListener("ended", function () {
    console.log(SongIndex);
    if (playlistArray.length === 0) {
      console.error("Danh sách bài hát trống!");
      return;
    }

    // Nếu chưa đến bài cuối, phát bài tiếp theo
    console.log("Đang phát bài hát:", playlistArray[SongIndex]);
    if (SongIndex < playlistArray.length) {
      SongIndex++;
      audio.src = getSongURL(playlistArray[SongIndex].filePath);
      audio.play().catch((error) => {
        console.warn("Không thể tự động phát bài hát:", error);
      });
    } else {
      SongIndex = 0;
      audio.src = getSongURL(playlistArray[SongIndex].filePath);
      audio.play().catch((error) => {
        console.warn("Không thể tự động phát bài hát:", error);
      });
    }
  });
});
