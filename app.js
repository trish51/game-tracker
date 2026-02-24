let myGames = JSON.parse(localStorage.getItem('myGames')) || [];
let currentFilter = 'all';
const searchInput = document.getElementById('game-search');
const resultsDropdown = document.getElementById('search-results');

// Fetches data from RAWG
async function fetchGames(query) {
    if (query.length < 3) {
        resultsDropdown.innerHTML = '';
        return;
    }

    try {
        // This line talks to your api/search.js file
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        console.error("Search failed:", error);
    }
}

let timeout = null;
searchInput.addEventListener('input', () => {
    console.log("Listener attached!");

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetchGames(searchInput.value);
    }, 500);
});
 
function filterGames(status) {
    currentFilter = status;
    
    const title = document.getElementById('shelf-title');
    title.innerText = status.charAt(0).toUpperCase() + status.slice(1);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase().includes(status)) {
            btn.classList.add('active');
        }
    });

    render();
}

// Puts the search results in a dropdown
function displayResults(games) {

    // Shows dropdown box
    resultsDropdown.innerHTML = '';
    resultsDropdown.classList.add('active');

    games.slice(0, 5).forEach(game => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
            <img src="${game.background_image}" width="40">
            <span>${game.name}</span>
        `;
        item.onclick = () => {
            addToLibrary(game);
            // Hides drop down
            resultsDropdown.innerHTML = '';
            resultsDropdown.classList.remove('active');
        }
        resultsDropdown.appendChild(item);
    });
}

// Adds game to local memeory
function addToLibrary(game) {
    const newGame = {
        id: game.id,
        name: game.name,
        image: game.background_image, 
        status:'uncategorized'
    };
    myGames.push(newGame);
    saveData();
}

// Saves to local storage so it stays after a refresh
function saveData() {
    localStorage.setItem('myGames', JSON.stringify(myGames));
    render();
}

// Displays the library on screen
function render() {
    const shelf = document.getElementById('main-shelf');
    const shelfTitle = document.getElementById('shelf-title');
    shelf.innerHTML = '';

    // Updates the title based on the filter
    shelfTitle.innerText = currentFilter === 'all' ? 'All Games' :
        currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);

    const filtered = currentFilter === 'all'
        ? myGames
        : myGames.filter(g => g.status === currentFilter);

    // What to display if no games
    if (filtered.length === 0) {
        shelf.innerHTML = `
            <div class="empty-state">
                <p>No games here yet. Start searching to add some!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card'; // Enables the hover and 2:3 ratio

        card.innerHTML = `
            <img src="${game.image}" alt="${game.name}">
            <div class="status-badge">${game.status}</div>
            
            <div class="card-info">
                <h3>${game.name}</h3>
                <div class="card-controls">
                    <select onchange="updateStatus(${game.id}, this.value)">
                        <option value="uncategorized" ${game.status === 'uncategorized' ? 'selected' : ''}>New</option>
                        <option value="backlog" ${game.status === 'backlog' ? 'selected' : ''}>Backlog</option>
                        <option value="playing" ${game.status === 'playing' ? 'selected' : ''}>Playing</option>
                        <option value="completed" ${game.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button class="delete-btn" onclick="deleteGame(${game.id})">×</button>
                </div>
            </div>
        `;
        shelf.appendChild(card);
    });

    updateStats();
}

function updateStatus(gameId, newStatus) {
    const game = myGames.find( g => g,id === gameId);
    if(game) {
        game.status = newStatus;
        saveData();
    }
}

function deleteGame(gameId) {
    myGames = myGames.filter(g => g.id !== gameId);
    saveData();
}

function updateStats() {
    document.getElementById('stat-all').innerText = myGames.length;
    document.getElementById('stat-playing').innerText = myGames.filter(g => g.status === 'playing').length;
    document.getElementById('stat-backlog').innerText = myGames.filter(g => g.status === 'backlog').length;
    document.getElementById('stat-completed').innerText = myGames.filter(g => g.status === 'completed').length;
}

// Export user library
function downloadBackup() {
    const dataStr = JSON.stringify(myGames);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'gameshelf-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import a backup file
function uploadBackup(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedGames = JSON.parse(e.target.result);
            if (Array.isArray(importedGames)) {
                myGames = importedGames;
                saveData();
                alert("Library Updated successfully!");
            }
        } catch (err) {
            alert("Invalid Backup file.");
        }
    };
    reader.readAsText(file);
}

// Start App
render();
