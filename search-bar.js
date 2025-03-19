const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestions");

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

document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none";
    }
});

