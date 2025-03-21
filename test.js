const { createClient } = supabase;

const supabaseUrl = "https://oscyuefajpcsopwmvwhf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zY3l1ZWZhanBjc29wd212d2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MTE0MjEsImV4cCI6MjA1NzI4NzQyMX0.w6vsdPKMb1ICn-yQUv-vbnSPhyoFNRSKrC08OqwyUNg";

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase client initialized successfully!");

const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestions");
const resultsContainer = document.getElementById("results");

// 🔎 Xử lý gợi ý khi nhập từ khóa
searchInput.addEventListener("input", async function () {
    const inputText = this.value.toLowerCase().trim();
    suggestionsList.innerHTML = "";

    if (inputText.length === 0) {
        suggestionsList.style.display = "none";
        return;
    }

    const { data, error } = await supabaseClient
        .from("songs")
        .select("title, file_path")
        .ilike("title", `%${inputText}%`);

    if (error) {
        console.error("Lỗi tải danh sách:", error.message);
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
            window.location.href = `result.html?title=${encodeURIComponent(song.title)}&file=${encodeURIComponent(song.file_path)}`;
        });
        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = "block";
});

// 🛠 Hiển thị kết quả khi nhấn Enter
searchInput.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const inputText = searchInput.value.toLowerCase().trim();

        if (inputText.length === 0) return;

        let { data, error } = await supabaseClient
            .from("songs")
            .select("title, file_path")
            .textSearch("title", inputText, { type: "websearch" });

        if (error || !data.length) {
            console.warn("Không tìm thấy, thử tìm gần đúng...");
            const allSongs = await supabaseClient.from("songs").select("title, file_path");
            if (!allSongs.error) {
                data = fuzzySearch(inputText, allSongs.data, "title");
            }
        }

        resultsContainer.innerHTML = "";

        if (!data || data.length === 0) {
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

// 📌 Ẩn danh sách gợi ý khi click ra ngoài
document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none";
    }
});

/* 🔥 Hàm tìm kiếm gần đúng (Fuzzy Search) */
function fuzzySearch(query, items, key) {
    const threshold = 0.4;
    return items
        .map(item => ({
            item,
            score: similarity(query, item[key].toLowerCase())
        }))
        .filter(result => result.score > threshold)
        .sort((a, b) => b.score - a.score)
        .map(result => result.item);
}

// 🔍 Hàm tính độ tương đồng giữa hai chuỗi
function similarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;

    if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

// 📌 Hàm tính khoảng cách giữa hai chuỗi (Levenshtein Distance)
function editDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
