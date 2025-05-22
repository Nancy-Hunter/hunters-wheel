document.addEventListener("DOMContentLoaded", function () {
  const seeMoreButton = document.querySelector(".seeMoreButton")
  const seeMoreTargets = document.getElementsByClassName("hidden")

  if (seeMoreButton) {
    seeMoreButton.addEventListener('click', function () {
      [...seeMoreTargets].forEach(el => el.classList.remove('hidden'))
      this.style.display = "none"
    })
  }
})
