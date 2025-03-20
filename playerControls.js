let SongIndex = 0; // Bắt đầu từ bài đầu tiên

document.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("audio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const progressBar = document.getElementById("progressBar");
  const progressFilled = document.getElementById("progressFilled");
  const playNextBtn = document.getElementById("nextButton");
  const playPrevBtn = document.getElementById("prevButton");
  const replayBtn = document.getElementById("replayButton");
  const songName = document.getElementById("song-listening");

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

  audio.addEventListener("ended", function () {
    console.log(SongIndex);
    if (playlistArray.length === 0) {
      console.error("Danh sách bài hát trống!");
      return;
    }

    // Nếu chưa đến bài cuối, phát bài tiếp theo
    console.log("Đang phát bài hát:", playlistArray[SongIndex]);
    // Kiểm tra nếu đã đến bài cuối, quay lại bài đầu
    if (SongIndex >= playlistArray.length - 1) {
      SongIndex = 0; // Quay lại bài đầu tiên
    } else {
      SongIndex++; // Chuyển sang bài tiếp theo
    }
    songName.textContent = playlistArray[SongIndex].title;
    const supabaseUrl =
      "https://oscyuefajpcsopwmvwhf.supabase.co/storage/v1/object/public/music/";

    const filePath = playlistArray[SongIndex].filePath; // Chỉ lấy phần tên file
    audio.src = `${supabaseUrl}${filePath}`;
    audio.play().catch((error) => {
      console.warn("Không thể tự động phát bài hát:", error);
    });
  });
  replayBtn.addEventListener("click", function () {
    audio.currentTime = 0;
    audio.play();
  });

  playNextBtn.addEventListener("click", function () {
    if (playlistArray.length === 0) {
      console.error("Danh sách bài hát trống!");
      return;
    }
  
    document.querySelectorAll(".playlist-item").forEach((item) => item.classList.remove("active"));
  
    if (SongIndex < playlistArray.length - 1) {
      SongIndex++;
    } else {
      SongIndex = 0;
    }

    songName.textContent = playlistArray[SongIndex].title;
    document.querySelectorAll(".playlist-item")[SongIndex]?.classList.add("active");
    audio.src = `https://oscyuefajpcsopwmvwhf.supabase.co/storage/v1/object/public/music/${playlistArray[SongIndex].filePath}`;
    audio.play().catch((error) => {
      console.warn("Không thể tự động phát bài hát:", error);
    });
  
    document.querySelectorAll(".playlist-item")[SongIndex]?.classList.add("active");
  });
  

  playPrevBtn.addEventListener("click", function () {
    if (playlistArray.length === 0) {
      console.error("Danh sách bài hát trống!");
      return;
    }

    document.querySelectorAll(".playlist-item").forEach((item) => item.classList.remove("active"));

    if (SongIndex != 0 || SongIndex < playlistArray.length - 1) {
      SongIndex--;
    } else {
      SongIndex = 0;
    }
    songName.textContent = playlistArray[SongIndex].title;
    audio.src = `https://oscyuefajpcsopwmvwhf.supabase.co/storage/v1/object/public/music/${playlistArray[SongIndex].filePath}`;
    audio.play();
    document.querySelectorAll(".playlist-item")[SongIndex]?.classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".playlist-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Xóa class active khỏi tất cả các mục
      menuItems.forEach((li) => li.classList.remove("active"));

      // Thêm class active vào mục được click
      this.classList.add("active");
    });
  });
});

const favBtn = document.querySelectorAll(".favorite-icon");

document.querySelectorAll(".favorite-icon").forEach((btn) => {
  favBtn.addEventListener("click", function () {
    console.log("hehehehehehehehehe");
    this.textContent = this.textContent === "🤍" ? "❤️" : "🤍";
  });
});


// document.querySelectorAll(".favorite-icon").forEach((icon, SongIndex) => {
//       icon.addEventListener("click", function () {
//           // const isFav = playlistArray[index].favorite;
//           // playlistArray[index].favorite = !isFav;

//           // icon.textContent = isFav ? "🤍" : "❤️";
//           // icon.classList.toggle("active", !isFav);
//           console.log(playlistArray[SongIndex]);

//           Swal.fire({
//               title: "Bỏ yêu thích? Đã thêm vào yêu thích!",
//               text: `Bài hát: ${playlistArray[SongIndex].title}`,
//               // icon: isFav ? "warning" : "success",
//           });
//       });
//   });