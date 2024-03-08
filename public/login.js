// Example data until database is implemented
const exampleFamily = [
    { username: "John", role: "Parent" },
    { username: "Jane", role: "Parent" },
    { username: "Jill", role: "Child" },
    { username: "Bobby", role: "Child" }
];
localStorage.setItem('familyData', JSON.stringify(exampleFamily));

function updateUsername(username) { // This is temporary just to update the example data
    localStorage.setItem("username", username);
    familyData = JSON.parse(localStorage.getItem('familyData'));
    if (familyData) {
        for (let i = 0; i < familyData.length; i++) {
            if (familyData[i].role === "Parent") {
                familyData[i].username = username;
                break;
            }
        }

        localStorage.setItem('familyData', JSON.stringify(familyData));
    }
}

function login() {
    const username = document.querySelector("#login-username").value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('All fields are required.');
        return; 
    }

    updateUsername(username);
    window.location.href = "home.html";
}


function joinFamily() {
    const username = document.getElementById("join-username").value;
    const password = document.getElementById("join-password").value;
    const familyCode = document.getElementById("join-familycode").value;

    if (!username || !password || !familyCode) {
        alert('All fields are required.');
        return;
    }    
    
    updateUsername(username);
    window.location.href = "home.html";
}

function createFamily() {
    const username = document.getElementById("create-username").value;
    const password = document.getElementById("create-password").value;

    if (!username || !password) {
        alert('Username and password are required.');
        return;
    }

    updateUsername(username);
    const familyCode = generateUniqueCode();
    localStorage.setItem("familyCode", familyCode);
    window.location.href = "home.html";
}

function generateUniqueCode() {
    let code = generateRandomCode();
    while (!checkUniqueCode(code)) {
        code = generateRandomCode();
    }
    return code;
}

function generateRandomCode() {
    length = 8
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function checkUniqueCode(code) {
    // Check if code has already been used in the database
    return true;
}