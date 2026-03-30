// GitHub Repo Infos
const USER = "LandesgerichtFalkenheim";
const REPO = "zeugnis";
const FILE = "archiv.json";

// HIER DEIN TOKEN EINTRAGEN
const TOKEN = "HIER_DEIN_GITHUB_TOKEN_EINTRAGEN";

async function loadArchiv() {
    const res = await fetch(`https://raw.githubusercontent.com/${USER}/${REPO}/main/${FILE}`);
    return await res.json();
}

function generateSecureNumber() {
    return Math.floor(Math.random() * 1e16).toString();
}

function toHex(str) {
    return Array.from(str).map(c => c.charCodeAt(0).toString(16)).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fzForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());

        const sicherheitsnummer = generateSecureNumber();
        const sicherheitsnummer_hex = toHex(sicherheitsnummer);

        const archiv = await loadArchiv();

        const neuerEintrag = {
            id: Date.now(),
            name: data.name,
            geburtsdatum: data.geburtsdatum,
            geburtsort: data.geburtsort,
            dokumentlink: data.dokumentlink,
            sachbearbeiter: data.sachbearbeiter,
            sicherheitsnummer_hex,
            datum: new Date().toISOString().split("T")[0]
        };

        archiv.push(neuerEintrag);

        const content = btoa(JSON.stringify(archiv, null, 2));

        // SHA holen
        const shaRes = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FILE}`);
        const shaData = await shaRes.json();

        // Commit an GitHub senden
        await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FILE}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Neuer Eintrag im Archiv",
                content,
                sha: shaData.sha
            })
        });

        alert("Führungszeugnis erfolgreich eingereicht!\nSicherheitsnummer (Hex): " + sicherheitsnummer_hex);
        window.location.href = "archiv.html";
    });
});
