document.getElementById("menuContainer").addEventListener("mouseleave", function() {
    var menuItems = document.getElementById("menuItems");
    // Oculta el menú desplegable con una transición lenta
    menuItems.style.opacity = "0";
    setTimeout(function() {
        menuItems.style.display = "none";
    }, 500); // Tiempo de espera para que la transición termine
});

function toggleMenu() {
    var menuItems = document.getElementById("menuItems");
    if (menuItems.style.display === "block" || menuItems.style.display === "") {
        menuItems.style.opacity = "0"; // Hacer el menú transparente antes de ocultarlo
        setTimeout(function() {
            menuItems.style.display = "none";
        }, 500); // Tiempo de espera para que la transición termine
    } else {
        menuItems.style.display = "block";
        setTimeout(function() {
            menuItems.style.opacity = "1"; // Hacer el menú visible gradualmente
        }, 50); // Pequeño tiempo de espera para evitar problemas de transición
    }
}
