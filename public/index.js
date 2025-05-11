const seeMoreButton = document.getElementById("seeMore")
const seeMoreTargets = document.getElementsByClassName("hidden")
seeMoreButton.addEventListener('click', removeHidden)

function removeHidden() {
    [...seeMoreTargets].forEach(el=> el.classList.remove('hidden'))
    seeMoreButton.style.display = "none"
}