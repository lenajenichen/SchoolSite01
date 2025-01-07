let entries = [];
let currentPage = 1;
let searchTerm = '';

async function fetchEntries() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    for (let i = 0; i < 9; i++) {
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
        const entryDate = new Date(entry.date_ranges[0].datum);
        const isInFuture = entryDate > currentDate;
        const matchesSearchTerm = entry.thema.toLowerCase().includes(searchTerm.toLowerCase());

        return isInFuture && matchesSearchTerm;
    });

    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;

    const pageEntries = filteredEntries.slice(startIndex, endIndex);

    pageEntries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'card bg-gray-800 shadow-xl p-4';

        const dateRanges = entry.date_ranges.map(range => {
            const startDate = new Date(range.datum);
            const endDate = new Date(range.enddatum);
            return {
                datum: startDate.toLocaleDateString(),
                startzeit: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endzeit: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        });

        const dateText = dateRanges.map(d => d.datum).join(', ');
        const startTimeText = dateRanges.map(d => d.startzeit).join(', ');
        const endTimeText = dateRanges.map(d => d.endzeit).join(', ');

        const dateDisplay = dateRanges.length > 2 ? `${dateRanges[0].datum}, ${dateRanges[1].datum}, ...` : dateText;
        const startTimeDisplay = dateRanges.length > 2 ? `${dateRanges[0].startzeit}, ${dateRanges[1].startzeit}, ...` : startTimeText;
        const endTimeDisplay = dateRanges.length > 2 ? `${dateRanges[0].endzeit}, ${dateRanges[1].endzeit}, ...` : endTimeText;

        const dateTooltip = dateRanges.length > 2 ? dateText : '';
        const startTimeTooltip = dateRanges.length > 2 ? startTimeText : '';
        const endTimeTooltip = dateRanges.length > 2 ? endTimeText : '';

        card.innerHTML = `
            <div class="card-body">
                <h2 class="card-title text-lg font-bold text-white">${entry.titel || 'No Title'}</h2>
                <p class="text-gray-400"><strong>Thema:</strong> ${entry.thema || 'No Topic'}</p>
                <p class="text-gray-400" title="${dateTooltip}"><strong>Datum:</strong> ${dateDisplay}</p>
                <p class="text-gray-400" title="${startTimeTooltip}"><strong>Startzeit:</strong> ${startTimeDisplay}</p>
                <p class="text-gray-400" title="${endTimeTooltip}"><strong>Endzeit:</strong> ${endTimeDisplay}</p>
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

function createDateTimeRange() {
    const dateTimeRangeContainer = document.getElementById('date-time-ranges');
    const endzeitContainer = document.getElementById('endzeit-container');

    const startInput = document.createElement('input');
    startInput.type = 'datetime-local';
    startInput.className = 'input input-bordered input-primary w-full mb-2';
    startInput.required = true;

    const endInput = document.createElement('input');
    endInput.type = 'datetime-local';
    endInput.className = 'input input-bordered input-primary w-full mb-2';
    endInput.required = true;

    dateTimeRangeContainer.appendChild(startInput);
    endzeitContainer.appendChild(endInput);

    startInput.addEventListener('change', function (event) {
        const dateValue = new Date(event.target.value);
        dateValue.setHours(dateValue.getHours() + 1);

        const offsetDate = new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000);
        endInput.value = offsetDate.toISOString().slice(0, 16);

        endInput.min = event.target.value;
    });
}

window.onload = fetchEntries;

document.getElementById('add-fobi-modal').addEventListener('change', function () {
    if (this.checked) {
        createDateTimeRange();
    }
});

document.getElementById('add-date-time-range').addEventListener('click', function () {
    const dateTimeRangeContainer = document.getElementById('date-time-ranges');
    const endzeitContainer = document.getElementById('endzeit-container');

    const startInput = document.createElement('input');
    startInput.type = 'datetime-local';
    startInput.className = 'input input-bordered input-primary w-full mb-2';
    startInput.required = true;

    const endInput = document.createElement('input');
    endInput.type = 'datetime-local';
    endInput.className = 'input input-bordered input-primary w-full mb-2';
    endInput.required = true;

    dateTimeRangeContainer.appendChild(startInput);
    endzeitContainer.appendChild(endInput);

    startInput.addEventListener('change', function (event) {
        const dateValue = new Date(event.target.value);
        dateValue.setHours(dateValue.getHours() + 1);

        const offsetDate = new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000);
        endInput.value = offsetDate.toISOString().slice(0, 16);

        endInput.min = event.target.value;
    });
});

document.getElementById('add-fobi-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const thema = document.getElementById('thema').value;
    const titel = document.getElementById('titel').value;
    const lehrer = document.getElementById('lehrer').value;

    const dateRanges = [];
    const startInputs = document.querySelectorAll('#date-time-ranges .input');
    const endInputs = document.querySelectorAll('#endzeit-container .input');

    startInputs.forEach((startInput, index) => {
        dateRanges.push({
            datum: startInput.value,
            enddatum: endInputs[index].value
        });
    });

    try {
        const response = await fetch('http://localhost:3001/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                thema,
                titel,
                dateRanges,
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