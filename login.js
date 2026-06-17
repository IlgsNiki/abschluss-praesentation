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
function checkLogin() {
    const code = getCookie("code");
    if (code) {
        window.location.href = "index.html";
    }
}
checkLogin();
const codeInput = document.getElementById("code-input");
const emailInput = document.getElementById("email-input");
var loginBtn = document.getElementById("login-btn");
var requestCodeBtn = document.getElementById("request-code-btn");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");
loginBtn.addEventListener("click", login);
requestCodeBtn.addEventListener("click", requestCode);

function restartRequestCodeProcess(message) {
    errorMessage.textContent = message;
    console.error(message);
    emailInput.style.display = "none";
    requestCodeBtn.textContent = "Erneut Code beantragen";
    loginBtn.style.display = "block";
    function handleEmailStep() {
    }
    requestCodeBtn.removeEventListener("click", handleEmailStep);
    requestCodeBtn.addEventListener("click", requestCode);
}

async function requestCode() {
    emailInput.style.display = "block";
    requestCodeBtn.textContent = "Weiter";
    loginBtn.style.display = "none";

    // alten Listener entfernen (falls er existiert)
    requestCodeBtn.removeEventListener("click", requestCode);

    // neuen Listener setzen
    requestCodeBtn.addEventListener("click", async function handleEmailStep() {
        const email = emailInput.value.trim();
        if (!email || !email.includes("@")) {
            restartRequestCodeProcess("Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }
        const code = generateCode(4);
        console.log(`Generierter Code: ${code} für E-Mail: ${email}`);
        // check if email already has a code or if code is already used
        // 1. check if email already has a code
        const { data, error } = await supabase
            .from('private_codes')
            .select('code')
            .eq('email', email)
            .maybeSingle()
        if (error) {
            restartRequestCodeProcess("Fehler bei der Anfrage. Bitte versuche es später erneut.");
            return;
        }
        if (data) {
            restartRequestCodeProcess("Diese E-Mail-Adresse hat bereits einen Code angefordert. Bitte überprüfe deine E-Mails.");
            return;
        }
        // 2. check if code is already used
        const { data: codeData, error: codeError } = await supabase
            .from('private_codes')
            .select('code')
            .eq('code', code)
            .maybeSingle()
        if (codeError) {
            console.error(codeError);
            restartRequestCodeProcess("Fehler bei der Anfrage. Bitte versuche es später erneut.");
            return;
        }
        if (codeData) {
            restartRequestCodeProcess("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
            return;
        }
        // insert code into database
        const { data: insertData, error: insertError } = await supabase
            .from('private_codes')
            .insert({ email: email, code: code })
        if (insertError) {
            console.error(insertError);
            restartRequestCodeProcess("Fehler bei der Anfrage. Bitte versuche es später erneut.");
            return;
        }


        successMessage.innerHTML = 'Dein Code wurde erfolgreich angefordert. Er lautet: <strong><u>' + code + '</u></strong>. Bitte merke dir diesen Code gut und gib ihn nicht weiter. Sollte dein Name in der Email, die du verwendet hast, nicht eindeutig sein, schreibe mir bitte deine E-Mail-Adresse, damit ich deinen Code zuordnen kann, auf Whatsapp. Sobald dein Code Verifiziert wurde, kannst du damit abstimmen. Um den Verifizierungsprozess zu beschleunigen, kannst du mir auch direkt den Code schicken.';
        requestCodeBtn.style.display = "none";
        loginBtn.style.display = "block";
        emailInput.style.display = "none";

    }
    );
}
function generateCode(length) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function login() {
    loginBtn.textContent = "Weiter";

    if (codeInput.style.display === "" || codeInput.style.display === "none") {
        codeInput.style.display = "block"
        requestCodeBtn.style.display = "none"
    }
    else if (codeInput.style.display === "block") {

        const code = codeInput.value.trim()

        if (!code) {
            alert("Bitte gib einen gültigen Code ein.")
            return
        }

        const { data, error } = await supabase
            .from('private_codes')
            .select('*')
            .eq('code', code)
            .maybeSingle()   // <-- wichtig statt single()

        if (error) {
            console.error(error)
            console.log("Fehler bei Anfrage")
            return
        }

        if (data) {
            console.log('Code vorhanden.');
            if (!data.verified) {
                errorMessage.textContent = "Dein Code muss noch bestätigt werden. Vielleicht schreibst du mir ein Whatsapp, um es zu Beschleunigen?";
                reset();
                return;
            }
            if (data.used) {
                errorMessage.textContent = "Dieser Code wurde schon benutzt.";
                reset();
                return;
            }

            emailInput.style.display = "block";
            codeInput.style.display = "none";
            requestCodeBtn.textContent = "Weiter";
            loginBtn.removeEventListener("click", login);

            // neuen Listener setzen
            loginBtn.addEventListener("click", async function checkEmail() {
                const email = emailInput.value.trim();
                if (!email || !email.includes("@")) {
                    errorMessage.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
                    return;
                }
                if (email !== data.email) {
                    errorMessage.textContent = "Die eingegebene E-Mail-Adresse stimmt nicht mit der für diesen Code registrierten E-Mail-Adresse überein.";
                    return;
                }
                console.log("Login erfolgreich");
                // Eimalcode löschen
                const { error } = await supabase
                    .from('private_codes')
                    .update({ 'used': true })
                    .eq('id', data.id);

                if (error) {
                    errorMessage.textContent = error;
                }

                setCookie("code", code, 1);
                setCookie("verified", true, 1);
                setCookie("email", email, 1);
                window.location.replace("vote.html");
            });

        } else {
            console.log('Code ungültig')
            errorMessage.textContent = "Der eingegebene Code ist ungültig."
        }
    }
}

function reset() {
    codeInput.style.display = "none";
    codeInput.style.display = "none";
    const newlogin = loginBtn.cloneNode(true);
    loginBtn.replaceWith(newlogin);
    loginBtn = document.getElementById("login-btn");
    const newrequest = requestCodeBtn.cloneNode(true);
    requestCodeBtn.replaceWith(newrequest);
    requestCodeBtn = document.getElementById("request-code-btn");
    loginBtn.addEventListener("click", login);
    requestCodeBtn.addEventListener("click", requestCode);
    loginBtn.style.display = "block";
    requestCodeBtn.style.display = "block";
    loginBtn.textContent = "Login";
    requestCodeBtn.textContent = "Code beantragen";
}