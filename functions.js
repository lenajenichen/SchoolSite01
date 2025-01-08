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

function renderEntries(page, searchTerm = "", searchDate = "", searchTeacher = "", entriesPerPage = 9) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    const currentDate = new Date();

    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date_ranges[0].datum);
        const isInFuture = entryDate > currentDate;
        const matchesSearchTerm = entry.thema.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearchDate = searchDate ? entry.date_ranges.some(range => new Date(range.datum).toISOString().slice(0, 10) === searchDate) : true;
        const matchesSearchTeacher = searchTeacher ? entry.lehrer.toLowerCase().includes(searchTeacher.toLowerCase()) : true;

        return isInFuture && matchesSearchTerm && matchesSearchDate && matchesSearchTeacher;
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
                <button class="btn btn-secondary" onclick="editEntry(${entry.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteEntry(${entry.id})">Delete</button>
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
    const searchDate = document.getElementById('search-date').value;
    const searchTeacher = document.getElementById('search-teacher').value;
    renderEntries(1, searchTerm, searchDate, searchTeacher);
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

async function editEntry(id) {
    const entry = entries.find(entry => entry.id === id);
    if (!entry) return;

    document.getElementById('entry-id').value = entry.id;
    document.getElementById('thema').value = entry.thema;
    document.getElementById('titel').value = entry.titel;
    document.getElementById('lehrer').value = entry.lehrer;

    document.getElementById('date-time-ranges').innerHTML = '';
    document.getElementById('endzeit-container').innerHTML = '';

    entry.date_ranges.forEach(range => {
        const startInput = document.createElement('input');
        startInput.type = 'datetime-local';
        startInput.className = 'input input-bordered input-primary w-full mb-2';
        startInput.value = new Date(range.datum).toISOString().slice(0, 16);
        document.getElementById('date-time-ranges').appendChild(startInput);

        const endInput = document.createElement('input');
        endInput.type = 'datetime-local';
        endInput.className = 'input input-bordered input-primary w-full mb-2';
        endInput.value = new Date(range.enddatum).toISOString().slice(0, 16);
        document.getElementById('endzeit-container').appendChild(endInput);
    });

    document.getElementById('add-fobi-modal').checked = true;

    document.getElementById('add-fobi-form').onsubmit = async function (event) {
        event.preventDefault();

        const id = document.getElementById('entry-id').value;
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
            const response = await fetch(`http://localhost:3001/entries/${id}`, {
                method: 'PUT',
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
                throw new Error('Fehler beim Aktualisieren der Fortbildung');
            }

            document.getElementById('add-fobi-modal').checked = false;
            await fetchEntries();
        } catch (error) {
            console.error('Fehler:', error);
            alert('Eintrag konnte nicht aktualisiert werden.');
        }
    };
}

async function deleteEntry(id) {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;

    try {
        const response = await fetch(`http://localhost:3001/entries/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Fehler beim Löschen der Fortbildung');
        }

        await fetchEntries();
    } catch (error) {
        console.error('Fehler:', error);
        alert('Eintrag konnte nicht gelöscht werden.');
    }
}

function clearForm() {
    document.getElementById('entry-id').value = '';
    document.getElementById('thema').value = '';
    document.getElementById('titel').value = '';
    document.getElementById('lehrer').value = '';
    document.getElementById('date-time-ranges').innerHTML = '';
    document.getElementById('endzeit-container').innerHTML = '';
}

window.onload = fetchEntries;

document.getElementById('add-fobi-modal').addEventListener('change', function () {
    if (this.checked) {
        clearForm();
        createDateTimeRange();
    }
});

document.getElementById('filter-date').addEventListener('click', () => {
    const searchDate = document.getElementById('search-date').value.trim();
    const searchTerm = document.querySelector('input[placeholder="Search for topic"]').value.trim();
    const searchTeacher = document.getElementById('search-teacher').value.trim();

    if (!searchDate) {
        alert('Bitte ein Datum eingeben.');
        return;
    }

    renderEntries(1, searchTerm, searchDate, searchTeacher);
});

document.getElementById('filter-teacher').addEventListener('click', () => {
    const searchTeacher = document.getElementById('search-teacher').value.trim();
    const searchTerm = document.querySelector('input[placeholder="Search for topic"]').value.trim();
    const searchDate = document.getElementById('search-date').value.trim();

    if (!searchTeacher) {
        alert('Bitte eine Lehrkraft eingeben.');
        return;
    }

    renderEntries(1, searchTerm, searchDate, searchTeacher);
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

    const id = document.getElementById('entry-id').value;
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
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:3001/entries/${id}` : 'http://localhost:3001/entries';

        const response = await fetch(url, {
            method,
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
            throw new Error(`Fehler beim ${id ? 'Aktualisieren' : 'Hinzufügen'} der Fortbildung`);
        }

        document.getElementById('add-fobi-modal').checked = false;
        await fetchEntries();
    } catch (error) {
        console.error('Fehler:', error);
        alert(`Eintrag konnte nicht ${id ? 'aktualisiert' : 'hinzugefügt'} werden.`);
    }
});