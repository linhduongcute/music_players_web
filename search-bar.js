const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestions");
const resultsContainer = document.getElementById("results"); // Thêm phần tử hiển thị kết quả

searchInput.addEventListener("input", async function () {
    const inputText = this.value.toLowerCase();
    suggestionsList.innerHTML = "";

    if (inputText.length === 0) {
        suggestionsList.style.display = "none";
        return;
    }

    // 🔥 Fetch song list from Supabase
    const { data, error } = await supabaseClient
        .from("songs")
        .select("title, file_path")
        .ilike("title", `%${inputText}%`); // Case-insensitive search

    if (error) {
        console.error("Error fetching songs:", error.message);
        return;
    }

    if (data.length === 0) {
        suggestionsList.style.display = "none";
        return;
    }

    data.forEach(song => {
        const li = document.createElement("li");
        li.textContent = song.title;
        li.addEventListener("click", function () {
            // 🔀 Redirect to song.html with parameters
            const songUrl = `result.html?title=${encodeURIComponent(song.title)}&file=${encodeURIComponent(song.file_path)}`;
            window.location.href = songUrl;
        });
        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = "block";
});

// 📌 Hiển thị kết quả trên trang khi ấn Enter
searchInput.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Ngăn form tự động gửi (nếu có)
        const inputText = searchInput.value.toLowerCase();

        if (inputText.length === 0) return;

        // 🔥 Fetch song list từ Supabase
        const { data, error } = await supabaseClient
            .from("songs")
            .select("title, file_path")
            .ilike("title", `%${inputText}%`);

        if (error) {
            console.error("Error fetching songs:", error.message);
            return;
        }

        // Xóa kết quả cũ trước khi thêm kết quả mới
        resultsContainer.innerHTML = "";

        if (data.length === 0) {
            resultsContainer.innerHTML = "<p>Không tìm thấy bài hát nào.</p>";
            return;
        }

        const ul = document.createElement("ul");
        data.forEach(song => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${song.title}</strong> - <a href="result.html?title=${encodeURIComponent(song.title)}&file=${encodeURIComponent(song.file_path)}">Nghe ngay</a>`;
            ul.appendChild(li);
        });

        resultsContainer.appendChild(ul);
    }
});

document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none";
    }
});
