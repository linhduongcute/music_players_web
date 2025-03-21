async function getFavoriteSongs() {
    try {
      let { data, error } = await supabase
        .from('favorite')
        .select('title, artist_name, duration, album, image_src');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error.message);
      return [];
    }
  }
  
  // Hiển thị danh sách bài hát yêu thích vào HTML
  async function displayFavoriteSongs() {
    const favList = document.getElementById('favList');
    const favoriteSongsSection = document.getElementById('favoriteSongsSection');
    const songs = await getFavoriteSongs();

    console.log(songs);
    
    if (songs.length > 0) {
      favList.innerHTML = songs.map(song => `
        <li class="favPlaylist-item">
          <img src="${song.image_src}" alt="${song.title}" class="song-image" />
          <div class="song-details">
            <h3>${song.title}</h3>
            <p>${song.artist_name} • ${song.album} • ${song.duration}</p>
          </div>
        </li>
      `).join('');
    }
  }

  displayFavoriteSongs();