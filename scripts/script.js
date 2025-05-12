'use strict';

// Globale Konstanten & Variablen
const POKEMONS_PER_PAGE = 20;
const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=151&offset=0';
const POKEMON_TYPES_API_URL = 'https://pokeapi.co/api/v2/type/';

// Speicher für Daten
let allPokemons = [];              
let allPokemonDetails = [];         
let currentPagePokemonDetails = []; 
let allTypes = [];                  

// Steuerung der Seitennavigation und Suche
let currentPageStartIndex = 0;
let isSearchActive = false;
let searchResults = [];

// Init
async function init() {
    showLoadingSpinner();
    await loadAllPokemons();
    await loadAllTypes();
    await loadVisiblePokemons(); // Zeigt erste Seite an
}

// Datenabruf-Funktionen

// Lädt JSON-Daten von der übergebenen URL
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fehler beim Laden: ${url}`);
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}

// Lädt Liste aller 151 Pokémon mit Detail- und Evolutionsdaten
async function loadAllPokemons() {
    const data = await fetchData(POKEMON_API_URL);
    allPokemons = data.results;

    for (const pokemon of allPokemons) {
        const fullData = await fetchData(pokemon.url);
        const speciesData = await fetchData(fullData.species.url);
        fullData.evolutionChainUrl = speciesData.evolution_chain.url;
        allPokemonDetails.push(fullData);
    }
}

// Lädt alle Pokémon-Typen
async function loadAllTypes() {
    const data = await fetchData(POKEMON_TYPES_API_URL);
    allTypes = data.results;
}

// Lädt die sichtbaren Pokémon nacheinander und zeigt Fortschritt
async function loadVisiblePokemons() {
    const start = currentPageStartIndex;
    const end = Math.min(start + POKEMONS_PER_PAGE, allPokemonDetails.length);
    const toLoad = allPokemonDetails.slice(start, end);

    showLoadingSpinner(toLoad.length);
    currentPagePokemonDetails = [];

    for (let i = 0; i < toLoad.length; i++) {
        currentPagePokemonDetails.push(toLoad[i]);

        const percent = ((i + 1) / toLoad.length) * 100;
        updateLoadingUI(i + 1, toLoad.length, percent);

        await new Promise(resolve => setTimeout(resolve, 10));
    }

    currentPageStartIndex = end;
    renderPage();
}

// Suche

// Führt die Suchfunktion aus
function searchPokemon() {
    const inputValue = document.getElementById('search_input').value.toLowerCase();

    if (inputValue.length > 2) {
        toggleSearchTooltip(false);
        isSearchActive = true;
        searchResults = allPokemonDetails.filter(p => p.name.toLowerCase().includes(inputValue));
        renderPokemonList(searchResults, 'search');
    } else if (inputValue.length === 0) {
        toggleSearchTooltip(false);
        isSearchActive = false;
        renderPage();
    } else {
        toggleSearchTooltip(true);
    }
}

// Zeigt oder versteckt das Tooltip
function toggleSearchTooltip(show) {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.toggle('show', show);
}

// Rendering-Funktionen

// Rendert die aktuelle Seite und Navigation
function renderPage() {
    renderPokemonList(currentPagePokemonDetails, 'page');
    renderNavigationButtons();
    setTimeout(hideLoadingSpinner, 1000);
}

// Rendert eine Liste von Pokémon-Karten
function renderPokemonList(pokemonList, mode = 'page') {
    const contentArea = document.getElementById("content");
    contentArea.innerHTML = pokemonList.map((p, i) => getPokemonCardTemplate(p, i, mode)).join('');

    const controlArea = document.getElementById("control");
    controlArea.classList.toggle('d-none', isSearchActive || pokemonList.length < POKEMONS_PER_PAGE);
}

// Rendert Navigations-Buttons (PREV / NEXT)
function renderNavigationButtons() {
    const controlArea = document.getElementById("control");
    controlArea.innerHTML = `
        <button id="prev_btn" onclick="loadPreviousPage()" class="btn">
            <img src="assets/icon/arrow_prev.png" alt="Zurück"> PREV
        </button>
        <button onclick="loadNextPage()" class="btn">
            NEXT <img src="assets/icon/arrow_next.png" alt="Weiter">
        </button>
    `;

    document.getElementById('prev_btn').classList.toggle('d-none', currentPageStartIndex <= POKEMONS_PER_PAGE);
}

// Overlay (Detailansicht)

// Zeigt ein Overlay mit Pokémon-Details an
async function renderPokemonOverlay(state, index, mode = 'page') {
    togglePokemonOverlay(state);
    const list = mode === 'search' ? searchResults : currentPagePokemonDetails;
    const selectedPokemon = list[index];
    window.currentOverlayPokemon = selectedPokemon;
    window.currentOverlayMode = mode;
    window.currentOverlayIndex = index;

    const overlayContainer = document.getElementById("card_overlay");
    overlayContainer.innerHTML = `
        <div id="card_overlay_content" class="card-overlay-content ${selectedPokemon.types[0].type.name}">
            ${await getPokemonOverlayTemplate(selectedPokemon, index, mode)}
        </div>
    `;

    showOverlaySection("main_info");
    playPokemonCry(selectedPokemon.name);
}

// Zeigt oder versteckt das Overlay
function togglePokemonOverlay(state) {
    const overlayContainer = document.getElementById("card_overlay");
    overlayContainer.classList.toggle("d-none", state !== "show");
    document.body.style.overflow = (state === "show") ? "hidden" : "auto";
}

// Zeigt bestimmte Sektionen im Overlay ein/aus
function showOverlaySection(sectionId) {
    document.querySelectorAll(".info-cnt").forEach(el => el.classList.add('d-none'));
    document.getElementById(sectionId).classList.remove('d-none');
    document.querySelectorAll(".stats-buttons button").forEach(btn => btn.classList.remove('active'));
    document.getElementById(sectionId + "_btn").classList.add('active');
}

// Overlay-Navigation

// Vorheriges Pokémon anzeigen
function showPreviousPokemonInOverlay(index, mode = 'page') {
    const list = mode === 'search' ? searchResults : currentPagePokemonDetails;
    const newIndex = (index - 1 + list.length) % list.length;
    renderPokemonOverlay('show', newIndex, mode);
}

// Nächstes Pokémon anzeigen
function showNextPokemonInOverlay(index, mode = 'page') {
    const list = mode === 'search' ? searchResults : currentPagePokemonDetails;
    const newIndex = (index + 1) % list.length;
    renderPokemonOverlay('show', newIndex, mode);
}

// Seitennavigation

// Lädt die vorherige Seite 
function loadPreviousPage() {
    currentPageStartIndex = Math.max(0, currentPageStartIndex - POKEMONS_PER_PAGE * 2);
    loadVisiblePokemons();
}

// Lädt die nächste Seite 
function loadNextPage() {
    loadVisiblePokemons();
}

// Spielt den Schrei des Pokémon ab
function playPokemonCry(name) {
    const cryMap = {
        'nidoran-f': 'nidoranf',
        'nidoran-m': 'nidoranm',
        'mr-mime': 'mrmime'
    };
    const formattedName = cryMap[name.toLowerCase()] || name.toLowerCase();
    const audio = new Audio(`https://play.pokemonshowdown.com/audio/cries/${formattedName}.mp3`);
    audio.volume = 0.7;
    audio.play().catch(() => {
        console.warn(`Cry für ${name} nicht gefunden.`);
    });
}

// Evolution-Anzeige

// Holt und zeigt die Evolutionskette
async function getPokemonEvolutionTemplate(pokemon, mode = 'page') {
    const container = document.getElementById("evolution");
    setEvolutionContent(container, "Loading Evolution...");
    try {
        const chainData = await fetchData(pokemon.evolutionChainUrl);
        const speciesList = getEvolutionChainSpeciesList(chainData.chain);
        const html = await buildEvolutionHtml(speciesList);
        setEvolutionContent(container, html);
    } catch (error) {
        setEvolutionContent(container, "Evolution data not available.", true);
    }
}

// Setzt den Inhalt der Evolutionsanzeige
function setEvolutionContent(container, html, isError = false) {
    container.innerHTML = html;
    if (isError) console.error("Evolution Error:", html);
}

// Baut das HTML für die Evolutionskette
async function buildEvolutionHtml(speciesList) {
    const cards = await Promise.all(
        speciesList.map(async (species) => await createEvolutionCard(species))
    );
    return cards
        .filter(card => card.trim() !== "")
        .join(`
            <img class="evo-arrow" src="assets/icon/evo-arrow.png" alt="Arrow">
        `);
}

// Baut eine einzelne Evolutions-Karte
async function createEvolutionCard(species) {
    const id = species.id;
    if (id < 1 || id > 151) return '';
    
    const data = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const sprite = data?.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default;
    if (!sprite) return '';

    return `
        <div class="evo-card">
            <img class="evo-card-img" src="${sprite}" alt="${species.name}">
            <span class="poke-name">${species.name.toUpperCase()}</span>
        </div>
    `;
}

// Sammelt alle Pokémon-Arten aus der Evolutionskette
function getEvolutionChainSpeciesList(chain) {
    const speciesList = [];

    function traverseAllBranches(node) {
        const id = extractIdFromSpeciesUrl(node.species.url);
        speciesList.push({ name: node.species.name, id });
        for (const evo of node.evolves_to) {
            traverseAllBranches(evo);
        }
    }

    traverseAllBranches(chain);
    return speciesList;
}

// Extrahiert die ID aus der Pokémon-URL
function extractIdFromSpeciesUrl(url) {
    const parts = url.split('/');
    return Number(parts[parts.length - 2]);
}

function toggleImageTooltip() {
    const tooltip = document.getElementById('image-tooltip');
    tooltip.classList.toggle('d-none');
    tooltip.style.display = tooltip.classList.contains('d-none') ? 'none' : 'block';
}
