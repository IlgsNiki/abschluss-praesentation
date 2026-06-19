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
    if (admin) {
        window.location.href = "admin.html";
    }
}
function loginAdmin() {
    console.log("login...")
    const code = document.getElementById("code-input").value.trim()
    console.log(code)
    if (code == 6767 || code == 6969) {
        setCookie("admin", true, 1);
        window.location.href = "admin.html";
    }
}
checkAdmin();
const loginBtn = document.getElementById("login-btn")
loginBtn.addEventListener("click", loginAdmin);