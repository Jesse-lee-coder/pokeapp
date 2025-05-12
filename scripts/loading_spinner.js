'use strict';

// Zeigt den Ladebildschirm mit Startwerten an
function showLoadingSpinner(total) {
    document.getElementById("loading_overlay").classList.remove("d-none");
    updateLoadingUI(0, total, 0);
}

// Aktualisiert die Anzeige des Ladefortschritts
function updateLoadingUI(loaded, total, percent) {
    document.getElementById("loaded_count").textContent = loaded;
    document.getElementById("total_count").textContent = total;

    const fill = document.getElementById("loading_bar_fill");
    fill.style.width = `${percent}%`;
    fill.style.backgroundColor = getProgressBarColor(percent);
}

// Gibt eine Farbe passend zum Fortschrittswert zurück (von rot → grün)
function getProgressBarColor(percent) {
    if (percent < 50) {
        const green = Math.floor((percent / 50) * 255);
        return `rgb(255, ${green}, 0)`; // von rot nach gelb
    } else {
        const red = Math.floor(255 - ((percent - 50) / 50) * 255);
        return `rgb(${red}, 255, 0)`;   // von gelb nach grün
    }
}

// Versteckt den Ladebildschirm
function hideLoadingSpinner() {
    document.getElementById("loading_overlay").classList.add("d-none");
}


