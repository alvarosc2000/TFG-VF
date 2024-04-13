
// Ajuste para eliminar la etiqueta label de usuario
//addEventListerner se aplica a un elemento previamente indicado

document.getElementById("usuario_input").addEventListener("focus", function() {
    document.getElementById("usuario_label").style.display = "none";
});

document.getElementById("usuario_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("usuario_label").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta label de password

document.getElementById("password_input").addEventListener("focus", function() {
    document.getElementById("password_label").style.display = "none";
});

document.getElementById("password_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("password_label").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta label de password2

document.getElementById("password_input2").addEventListener("focus", function() {
    document.getElementById("password_label2").style.display = "none";
});

document.getElementById("password_input2").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("password_label2").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta label de email

document.getElementById("email_input").addEventListener("focus", function() {
    document.getElementById("email_label").style.display = "none";
});

document.getElementById("email_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("email_label").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta nif de email

document.getElementById("nif_input").addEventListener("focus", function() {
    document.getElementById("nif_label").style.display = "none";
});

document.getElementById("nif_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("nif_label").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta nif de email

document.getElementById("contacto_input").addEventListener("focus", function() {
    document.getElementById("contacto_label").style.display = "none";
});

document.getElementById("contacto_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("contacto_label").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta usuario de inicio sesion

document.getElementById("usuario_input").addEventListener("focus", function() {
    document.getElementById("usuario_label").style.display = "none";
});

document.getElementById("usuario_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("usuario_label").style.display = "block";
    }
});


