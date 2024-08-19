// Ajuste para eliminar la etiqueta label de usuario
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

// Ajuste para eliminar la etiqueta label de password_confirm
document.getElementById("password_confirm_input").addEventListener("focus", function() {
    document.getElementById("password_confirm_label").style.display = "none";
});

document.getElementById("password_confirm_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("password_confirm_label").style.display = "block";
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

// Ajuste para eliminar la etiqueta label de nif
document.getElementById("nif_input").addEventListener("focus", function() {
    document.getElementById("nif_label").style.display = "none";
});

document.getElementById("nif_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("nif_label").style.display = "block";
    }
});

// Ajuste para eliminar la etiqueta label de contacto
document.getElementById("contacto_input").addEventListener("focus", function() {
    document.getElementById("contacto_label").style.display = "none";
});

document.getElementById("contacto_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("contacto_label").style.display = "block";
    }
});

// Ajuste para eliminar la etiqueta label de nombre
document.getElementById("nombre_input").addEventListener("focus", function() {
    document.getElementById("nombre_label").style.display = "none";
});

document.getElementById("nombre_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("nombre_label").style.display = "block";
    }
});

// Ajuste para eliminar la etiqueta label de apellido
document.getElementById("apellido_input").addEventListener("focus", function() {
    document.getElementById("apellido_label").style.display = "none";
});

document.getElementById("apellido_input").addEventListener("blur", function() {
    if (this.value === "") {
        document.getElementById("apellido_label").style.display = "block";
    }
});


// Ajuste para eliminar la etiqueta label de email
document.getElementById("email_input").addEventListener("focus", function() {
    document.getElementById("email_label").style.display = "none";
});

document.getElementById("email_input").addEventListener("blur", function() {
    if (this.value.trim() === "") {
        document.getElementById("email_label").style.display = "block";
    }
});

// Ajuste para mostrar u ocultar campos adicionales según el rol seleccionado
function mostrarCampos() {
    var rolSelect = document.getElementById("rol_select");
    var emailContainer = document.getElementById("email_container");
    var nifContainer = document.getElementById("nif_container");
    var contactoContainer = document.getElementById("contacto_container");
    var nombreContainer = document.getElementById("nombre_container");
    var apellidoContainer = document.getElementById("apellido_container");

    if (rolSelect.value === "company") {
        emailContainer.style.display = "block";
        nifContainer.style.display = "block";
        contactoContainer.style.display = "block";
        nombreContainer.style.display = "none";
        apellidoContainer.style.display = "none";
    } else if (rolSelect.value === "user") {
        nombreContainer.style.display = "block";
        apellidoContainer.style.display = "block";
        emailContainer.style.display = "block";
        nifContainer.style.display = "none";
        contactoContainer.style.display = "none";
    } else {
        emailContainer.style.display = "none";
        nifContainer.style.display = "none";
        contactoContainer.style.display = "none";
        nombreContainer.style.display = "none";
        apellidoContainer.style.display = "none";
    }
}
