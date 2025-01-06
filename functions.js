let entries = [];
let currentPage = 1;
let searchTerm = '';

async function fetchEntries() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'card bg-gray-800 shadow-xl p-4 animate-pulse';
        skeleton.innerHTML = `
            <div class="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
            <div class="h-4 bg-gray-700 rounded w-1/4"></div>
        `;
        container.appendChild(skeleton);
    }

    try {
        const response = await fetch('http://localhost:3001/entries');
        entries = await response.json();
        container.innerHTML = '';
        renderEntries(currentPage, searchTerm);
    } catch (error) {
        console.error('Error fetching entries:', error);
        container.innerHTML = '<p class="text-gray-400">Error loading data.</p>';
    }
}

function renderEntries(page, searchTerm = "", entriesPerPage = 9) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    const currentDate = new Date();

    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.datum);
        const isInFuture = entryDate > currentDate;
        const matchesSearchTerm = entry.thema.toLowerCase().includes(searchTerm.toLowerCase());

        return isInFuture || matchesSearchTerm;
    });

    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;

    const pageEntries = filteredEntries.slice(startIndex, endIndex);

    pageEntries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'card bg-gray-800 shadow-xl p-4';
        const entryDate = new Date(entry.datum);
        const formattedDate = entryDate.toLocaleDateString();
        const formattedTime = entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
            <div class="card-body">
                <h2 class="card-title text-lg font-bold text-white">${entry.titel || 'No Title'}</h2>
                <p class="text-gray-400"><strong>Thema:</strong> ${entry.thema || 'No Topic'}</p>
                <p class="text-gray-400"><strong>Datum:</strong> ${formattedDate}</p>
                <p class="text-gray-400"><strong>Zeit:</strong> ${formattedTime}</p>
                <p class="text-gray-400"><strong>Lehrkraft:</strong> ${entry.lehrer || 'No Teacher'}</p>
            </div>
        `;
        container.appendChild(card);
    });

    renderPagination(filteredEntries.length, page, entriesPerPage);
}

function renderPagination(totalEntries, currentPage, entriesPerPage) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'} mx-1`;
        button.textContent = i;

        button.addEventListener('click', () => {
            currentPage = i;
            renderEntries(currentPage, searchTerm);
        });

        paginationContainer.appendChild(button);
    }
}

document.querySelector('input[placeholder="Search for topic"]').addEventListener('input', function(event) {
    const searchTerm = event.target.value;
    renderEntries(1, searchTerm);
});


window.onload = fetchEntries;

document.getElementById('add-fobi-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const thema = document.getElementById('thema').value;
    const titel = document.getElementById('titel').value;
    const datum = document.getElementById('datum').value;
    const zeit = document.getElementById('zeit').value;
    const lehrer = document.getElementById('lehrer').value;

    const datetime = `${datum}T${zeit}`;

    try {
        const response = await fetch('http://localhost:3001/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                thema,
                titel,
                datum: datetime,
                lehrer,
            }),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen der Fortbildung');
        }

        document.getElementById('add-fobi-modal').checked = false;
        await fetchEntries();
    } catch (error) {
        console.error('Fehler:', error);
        alert('Eintrag konnte nicht hinzugefügt werden.');
    }
});