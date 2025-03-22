const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestions");
const resultsContainer = document.getElementById("results");
const searchResultSection = document.getElementById("searchResult");

searchInput.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    const mainContent = document.querySelector(".main-content");
    const uploadSection = document.getElementById("uploadDownloadSection");
    const favSection = document.getElementById("favoriteSongsSection");
    uploadSection.style.display = "none";
    mainContent.style.display = "none";
    favSection.style.display = "none";

    event.preventDefault();
    resultsContainer.innerHTML = "";
    const inputText = this.value.toLowerCase().trim();

    if (!inputText) {
      searchResultSection.classList.add("hidden");
      return;
    }

    const { data, error } = await supabaseClient
      .from("songs")
      .select("title, artist, album, duration, file_path, image_src")
      .ilike("title", `%${inputText}%`);

    if (error) return;
    displaySearchResults(data);
  }
});

function displaySearchResults(data) {
  resultsContainer.innerHTML = data.length
    ? `<div style="display: flex; flex-direction: column; gap: 15px;">
            ${data
              .map(
                (song) => `
                <div class="search-result-item">
                    <img src="${song.image_src}" class="search-result-img"> 
                    <div class="search-result-info">
                        <h3>${song.title}</h3>
                        <p>Nghệ sĩ: ${song.artist}</p>
                        <p>Album: ${song.album}</p>
                        <p>Thời lượng: ${song.duration}</p>
                        <button class="queue-btn" 
                            onclick="addToPlaylist('${song.title}', '${song.artist}', '${song.duration}', '${song.album}', '${song.file_path}', '${song.image_src}')">
                            Add to queue
                        </button>
                    </div>
                </div>
            `
              )
              .join("")}
          </div>`
    : "<p class='no-results'>Không tìm thấy bài hát nào.</p>";

  searchResultSection.classList.remove("hidden");
  searchInput.focus();
}
