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
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        // Only search if user hasn't typed for 200ms
        fetchGames(searchInput.value);
    }, 200); 
});
 
function filterGames(status) {
    currentFilter = status;
    
    // Update active button color
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        // This checks if the button text is "New" or "All Games" etc.
        if (btn.getAttribute('onclick').includes("'"+status+"'")) {
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
    const exists = myGames.some(g => g.id == game.id);
    if(exists) {
        showNotice("Game already in your library!");
        return;
    }

    const newGame = {
        id: game.id,
        name: game.name,
        image: game.background_image, 
        status:'new'
    };
    myGames.push(newGame);
    saveData();
    filterGames('new');

    // Clears dropdown
    searchInput.value = '';
    resultsDropdown.innerHTML = '';
    resultsDropdown.classList.remove('active');
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

    shelfTitle.innerText = currentFilter === 'all' ? 'All Games' : 
        currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);

    const filtered = currentFilter === 'all'
        ? myGames
        : myGames.filter(g => g.status === currentFilter);
    
    const displayFilter = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);

    // Empty State Logic
    if (filtered.length === 0) {
        shelf.innerHTML = `
            <div class="empty-state">
                <p>No games in <i>${displayFilter}</i></p>
                <p style="font-size: 0.85rem; opacity: 0.5; margin-top: 10px;">
                    Start searching above to add titles to your shelf.
                </p>
            </div>
        `;
        updateStats();
        return;
    }
    filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <button class="delete-btn" onclick="deleteGame(${game.id})">×</button>
            
            <select class="card-category-selector" onchange="updateStatus(${game.id}, this.value)">
                <option value="new" ${game.status === 'new' ? 'selected' : ''}>NEW</option>
                <option value="backlog" ${game.status === 'backlog' ? 'selected' : ''}>BACKLOG</option>
                <option value="playing" ${game.status === 'playing' ? 'selected' : ''}>PLAYING</option>
                <option value="completed" ${game.status === 'completed' ? 'selected' : ''}>DONE</option>
            </select>

            <img src="${game.image}" alt="${game.name}">
            
            <div class="card-info">
                <h3>${game.name}</h3>
                </div>
        `;
        shelf.appendChild(card);
    });

    updateStats();
}

function updateStatus(gameId, newStatus) {
    const game = myGames.find( g => g.id === gameId);
    if(game) {
        game.status = newStatus;
        saveData();
    }
}

let gameToDelete = null;

function deleteGame(gameId) {
    gameToDelete = gameId;

    const game = myGames.find(g => g.id === gameId);

    document.getElementById('confirm-message').innerText = `Remove ${game.name}?`;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirm() {
    document.getElementById('confirm-modal').classList.add('hidden');
    gameToDelete = null;
}

document.getElementById('confirm-yes').onclick = () => {
    if (gameToDelete) {
        myGames = myGames.filter(g => g.id !== gameToDelete);
        saveData();
        closeConfirm();
    }
};

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('hidden');
}

function updateStats() {
    const total = myGames.length;
    const playing = myGames.filter(g => g.status === 'playing').length;
    const backlog = myGames.filter(g => g.status === 'backlog').length;
    const completed = myGames.filter(g => g.status === 'completed').length;
    const newCount = myGames.filter(g => g.status === 'new').length;

    document.getElementById('stat-all').innerText = total;
    document.getElementById('stat-playing').innerText = playing;
    document.getElementById('stat-backlog').innerText = backlog;
    document.getElementById('stat-completed').innerText = completed;

    const newWrapper = document.getElementById('stat-new-wrapper');
    if (newCount > 0) {
        newWrapper.style.display = 'block';
        // CHANGE THIS LINE: change 'uncategorized' to 'newCount'
        document.getElementById('stat-new').innerText = newCount; 
    } else {
        newWrapper.style.display = 'none';
    }
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

function resetLibrary() {
    const isChecked = document.getElementById('reset-confirm').checked;
    if (!isChecked) {
        alert("Please check the confirmation box first.");
        return;
    }

    if (confirm("This is permanent. Are you sure?")) {
        myGames = [];
        saveData();
        document.getElementById('reset-confirm').checked = false;
        toggleSettings(); // Close drawer after reset
        alert("Library Reset.");
    }
}

function toggleAbout() {
    const modal = document.getElementById('about-modal');
    modal.classList.toggle('hidden');
}

function showNotice(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notice';
        // Add styling directly or in CSS
        toast.style = "position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: var(--bg-card); color: var(--accent); padding: 12px 25px; border-radius: 12px; border: 1px solid var(--accent); box-shadow: 0 10px 20px rgba(0,0,0,0.5); z-index: 3000; font-weight: 600; transition: opacity 0.3s ease;";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2500);
}

// Close modal if user clicks outside
window.onclick = function(event) {
    const settingsModal = document.getElementById('settings-modal');
    const aboutModal = document.getElementById('about-modal');
    if (event.target == settingsModal) toggleSettings();
    if (event.target == aboutModal) toggleAbout();
}

// Reopens dropdown
searchInput.addEventListener('click', () => {
    if (resultsDropdown.innerHTML !== '') {
        resultsDropdown.classList.add('active');
    }
});

// Click outside to close searchbox
// Closes search dropdown when clicking anywhere else on the page
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
        resultsDropdown.classList.remove('active');
        resultsDropdown.innerHTML = ''; // Clears search results
    }
});

// Start App
render();
