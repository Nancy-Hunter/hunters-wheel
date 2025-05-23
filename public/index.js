document.addEventListener("DOMContentLoaded", function () {
  const seeMoreButton = document.querySelector(".seeMoreButton")
  const seeMoreTargets = document.getElementsByClassName("hidden")

  if (seeMoreButton) {
    seeMoreButton.addEventListener('click', function () {
        let hiddenItems = [...seeMoreTargets]
        for (let i = 0; i < 6 && i<hiddenItems.length; i++) {
            hiddenItems[i].classList.remove('hidden')
        }
        if (hiddenItems.length == 0) {
            this.style.display = "none"
        }
    })
  }
})
