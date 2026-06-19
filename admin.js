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
function getCookie(name) {
    name = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
}
function checkAdmin() {
    const admin = getCookie("admin")
    if (!admin) {
        window.location.href = "admin-login.html";
    }
}
checkAdmin();
async function loadRequests() {
    const table = document.getElementById("requests")
    const { data, error } = await supabase
        .from('private_codes')
        .select('*')
        .eq('verified', false)
    console.log(data);
    console.log(data.length)
    if (data.length == 0) {
        document.getElementById("anfragen").style.display = "none";
    }
    if (error) {
        console.error(error);
    } else {
        const requests = document.getElementById("requests");

        requests.innerHTML = "";

        data.forEach(eintrag => {
            requests.innerHTML += `
            <tr>
                <td>${eintrag.id}</td>
                <td>${eintrag.name ?? "-"}</td>
                <td>${eintrag.email}</td>
                <td>${eintrag.code}</td>
                <td>
                    <button onclick="verify(${eintrag.id})">
                        Verifizieren
                    </button>
                </td>
            </tr>
        `;
        });

    }
}
loadRequests();
async function verify(id) {
    const { error } = await supabase
        .from('private_codes')
        .update({ verified: true })
        .eq('id', id);
    loadRequests()
    if (error) {
        console.log(error)
    }
    console.log("updated " + id)
}
window.verify = verify;