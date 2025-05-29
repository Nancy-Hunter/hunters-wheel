document.addEventListener("DOMContentLoaded", function () {
  const seeMoreButton = document.querySelector(".seeMoreButton")
  const seeMoreTargets = document.getElementsByClassName("hidden")

  if (seeMoreButton) {
    seeMoreButton.addEventListener('click', function () {
        let hiddenItems = [...seeMoreTargets]
        for (let i = 0; i < 6 && i<hiddenItems.length; i++) {
            // display items one at a time
            // setTimeout(()=>{
                hiddenItems[i].classList.remove('hidden')
            // }, i * 200)
        }
        if (hiddenItems.length < 6) {
            this.style.display = "none"
        }
    })
  }
})

// slider

const slider = document.querySelector('.sliderLine')
const imgTop = document.getElementById('customImgTop')
const container = document.querySelector('.customContainer')

let isDragging = false;

slider.addEventListener('mousedown', (e) => {
    isDragging = true;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    let offsetX = e.clientX - containerRect.left;
    
    // Clamp value between 0 and container width
    offsetX = Math.max(0, Math.min(offsetX, containerRect.width));
    
    // Move the slider
    slider.style.left = `${offsetX}px`;

    // Adjust the top image width via clip-path
    const percent = (offsetX / containerRect.width) * 100;
    imgTop.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
});

// functionality for mobile

slider.addEventListener('touchstart', (e) => {
    isDragging = true;
});

window.addEventListener('touchend', () => {
    isDragging = false;
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    let offsetX = e.clientX - containerRect.left;
    
    // Clamp value between 0 and container width
    offsetX = Math.max(0, Math.min(offsetX, containerRect.width));
    
    // Move the slider
    slider.style.left = `${offsetX}px`;

    // Adjust the top image width via clip-path
    const percent = (offsetX / containerRect.width) * 100;
    imgTop.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
});