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
    shelf.innerHTML = '';

    const filtered = currentFilter === 'all'
        ? myGames
        : myGames.filter(g => g.status === currentFilter);

    if (filtered.length === 0) {
        shelf.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">
            No games found in ${currentFilter}.
        </p>`;
        return;
    }

    filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card'; // Triggers the CSS grid and hover effects

        card.innerHTML = `
            <img src="${game.image}" alt="${game.name}" loading="lazy">
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
}

// Start App
render();
