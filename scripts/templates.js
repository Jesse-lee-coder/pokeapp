function getPokemonCardTemplate(pokemon, pokemonIndex, mode) {
    return `
    <div class="card ${pokemon.types[0].type.name}">
        <div class="card-header">
            <span class="headline">Nr.${pokemon.id}</span>
            <h2 class="headline">${pokemon.name.toUpperCase()}</h2>
        </div>
        <div class="card-pokemon-cnt">
            <div onclick="renderPokemonOverlay('show', ${pokemonIndex}, '${mode}')" class="card-img-circle">
                <img class="card-pokemon-img" src="${pokemon.sprites.other['official-artwork'].front_default}" alt="">
            </div>
        </div>
        <div class="card-footer">
            ${getTypeLabelTemplate(pokemon)}
        </div>
    </div>
    `;
}

async function getPokemonOverlayTemplate(pokemon, pokemonIndex, mode) {
    return `
        <button onclick="togglePokemonOverlay('hide')" class="close-btn">
            <img class="close-btn-img" src="assets/icon/close-icon.png" alt="Close">
        </button>
        <div class="card-header">
            <span class="headline">Nr.${pokemon.id}</span>
            <h2 class="headline">${pokemon.name.toUpperCase()}</h2>
        </div>
        <div class="card-pokemon-cnt">
            <div class="card-img-circle no-hover overlay no-curser-pointer">
                <img class="card-pokemon-img" src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            </div>
            <div class="type-cnt">
                ${await getOverlayTypeLabelTemplate(pokemon)}
                <button onclick="playPokemonCry('${pokemon.name}')" class="cry-btn">
                    <span class="emoji-big">🔊</span> Sound
                </button>
            </div>
        </div>

        <div id="stats_cnt" class="stats-cnt">
            <div class="stats-buttons">
                <button id="main_info_btn" onclick="showOverlaySection('main_info')" class="active">Main Info</button>
                <button id="stats_btn" onclick="showOverlaySection('stats')">Stats</button>
                <button id="evolution_btn" onclick="showOverlaySection('evolution'); getPokemonEvolutionTemplate(window.currentOverlayPokemon, window.currentOverlayMode)">Evolution</button>
            </div>

            <div id="main_info" class="main-info info-cnt">
                <table class="info-table">
                    <tr><td>Height</td><td>${pokemon.height / 10} m</td></tr>
                    <tr><td>Weight</td><td>${pokemon.weight / 10} kg</td></tr>
                    <tr id="abilities">${getOverlayAbilitiesTemplate(pokemon)}</tr>
                    <tr><td>Base Exp</td><td>${pokemon.base_experience}</td></tr>
                </table>
            </div>

            <div id="stats" class="stats info-cnt d-none">
                <table class="info-table">
                    ${getOverlayStatsTemplate(pokemon)}
                </table>
            </div>

            <div id="evolution" class="evolution info-cnt d-none"></div>
        </div>

        <div class="overlay-footer">
            <button onclick="showPreviousPokemonInOverlay(${pokemonIndex}, '${mode}')" class="arrow-btn">
                <img src="assets/icon/arrow_prev.png" alt="Previous">
            </button>
            <button onclick="showNextPokemonInOverlay(${pokemonIndex}, '${mode}')" class="arrow-btn">
                <img src="assets/icon/arrow_next.png" alt="Next">
            </button>
        </div>
    `;
}

function getTypeLabelTemplate(pokemon) {
    return pokemon.types.map(type => `
        <span class="type-label type-${type.type.name}">
            ${type.type.name.toUpperCase()}
        </span>
    `).join('');
}

function getOverlayTypeLabelTemplate(pokemon) {
    return pokemon.types.map(type => `
        <span class="type-label type-${type.type.name}">${type.type.name.toUpperCase()}</span>
    `).join('');
}

function getOverlayAbilitiesTemplate(pokemon) {
    let abilities = pokemon.abilities.map(ability => capitalizeEachWord(ability.ability.name));
    return `<td>Abilities</td><td>${abilities.join(", ")}</td>`;
}

function getOverlayStatsTemplate(pokemon) {
    let content = "";
    pokemon.stats.forEach(stat => {
        if (!stat.stat.name.toLowerCase().includes("special")) {
            const name = stat.stat.name.toUpperCase();
            const value = stat.base_stat;
            const width = Math.min(value, 100);
            content += `
                <tr>
                    <td style="width: 100px; text-align: left;">${name}</td>
                    <td style="width: 100%;">
                        <div class="stat-bar-bg" title="${name} Wert: ${value}">
                            <div class="stat-bar-fill" style="width: ${width}%;"><span class="stat-val">${value}</span></div>
                        </div>
                    </td>
                </tr>
            `;
        }
    });
    return content;
}

function capitalizeEachWord(str) {
    return str.split(" ")
        .map(word => word.split("-")
            .map(part => part[0].toUpperCase() + part.slice(1).toLowerCase())
            .join("-"))
        .join(" ");
}








