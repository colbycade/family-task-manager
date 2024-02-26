function login(form) {
    event.preventDefault(); // Prevent the form from submitting unti we implement database stuff
    
    const username = form.username.value;
    localStorage.setItem("userName", username);
    window.location.href = "home.html";
}

function joinFamily(form) {
    event.preventDefault();

    const username = form.username.value;
    const familyCode = form.familycode.value;
    localStorage.setItem("userName", username);
    window.location.href = "home.html";
}

function createFamily(form) {
    event.preventDefault();
    
    const username = form.username.value;
    localStorage.setItem("userName", username);
    window.location.href = "home.html";
}