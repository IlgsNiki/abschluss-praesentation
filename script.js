import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://wmxjsxtsdxbdeiheabsc.supabase.co";
const supabaseKey = "sb_publishable_LyvE9X1tzhXaWKvUr454Lg_qap7_kwN";

const supabase = createClient(supabaseUrl, supabaseKey)
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

console.log("Script.js loaded successfully!");
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
let names = [];
const survey = document.getElementById("survey")
async function getNames() {
    const { data, error } = await supabase
        .from('personen')
        .select('*')  // <-- wichtig statt single()

    if (error) {
        console.log(error);
    }
    for (let i = 0; i < data.length; i++) {
        names.push(data[i].name);
    }
    for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [names[i], names[j]] = [names[j], names[i]];
    }

    for (let i = 0; i < names.length; i++) {
        // Wie kann ich die inputs einblenden lassen?
        const label = document.createElement("label");
        label.textContent = names[i] + ": ";

        const input = document.createElement("input");
        input.type = "text";
        input.name = "person_" + i;
        input.required = false;
        input.maxLength = 30;

        const br = document.createElement("br");

        survey.appendChild(label);
        survey.appendChild(input);
        survey.appendChild(br);
    }

}
getNames();
function datenschutz() {
    deleteCookie("code");
    deleteCookie("verified");
    deleteCookie("email");
}