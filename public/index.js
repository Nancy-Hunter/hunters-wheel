document.addEventListener("DOMContentLoaded", function () {
  const seeMoreButton = document.querySelector(".seeMoreButton")
  const seeMoreTargets = document.getElementsByClassName("hidden")

  if (seeMoreButton) {
    seeMoreButton.addEventListener('click', function () {
        let hiddenItems = [...seeMoreTargets]
        for (let i = 0; i < 6 && i<hiddenItems.length; i++) {
            // display items one at a time
            setTimeout(()=>{
                hiddenItems[i].classList.remove('hidden')
            }, i * 400)
        }
        if (hiddenItems.length < 6) {
            this.style.display = "none"
        }
    })
  }
})
