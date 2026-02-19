let myGames = JSON.parse(localStorage.getItem('myGames')) || [];
let currentFilter = 'all';

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
        displaySearchResults(data.results);
    } catch (error) {
        console.error("Search failed:", error);
    }
}

// Puts the search results in a dropdown
function displayResults(games) {
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';  // Clears old results

    games.slice(0, 5).forEach(game => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `<span>${game.name}</span>`;
        item.onclick = () => addToLibrary(game);
        resultsDiv.appendChild(item);
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

        filtered.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `<img src="${game.image}"><h3>${game.name}</h3>`;
            shelf.appendChild(card);
        });
}

// Start App
render();
