
// toggle dropdown in nav
const dropdownButton = document.getElementById("dropdownButton");
const dropdownContent = document.getElementById("dropdownContent")
dropdownButton.addEventListener('click', toggleDropdown)

function toggleDropdown(e) {
    e.stopPropagation(); // Prevent click from bubbling up
    dropdownContent.classList.toggle ('show')
}

window.addEventListener("click", function(event) {
if (!event.target.closest('.dropdownContainer')) {
    dropdownContent.classList.remove ('show')
}
})