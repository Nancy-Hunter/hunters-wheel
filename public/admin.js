// opens modal popup for editing on profile page

const productModal = document.getElementById("productModal")
productModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget
    const form = document.getElementById('productForm');

    form.setAttribute('action', `/admin/updatePost/${button.getAttribute('data-id')}?_method=PUT`);
    // Fill in form fields from data attributes
    form._id.value = button.getAttribute('data-id'); 
    form.title.value = button.getAttribute('data-title');
    form.caption.value = button.getAttribute('data-caption');
    form.price.value = button.getAttribute('data-price');
    form.category.value = button.getAttribute('data-category');

    // Clear any old main preview images
    const mainPreviewContainer = document.getElementById("mainPreviewContainer")
    mainPreviewContainer.innerHTML = ""
    
    const mainImg = document.createElement('img');
    mainImg.src = button.getAttribute('data-mainImageURL')
    mainImg.classList.add("img-thumbnail", "m-1"); // styling
    mainImg.style.maxWidth = "100px";
    mainPreviewContainer.appendChild(mainImg); 
    
    // Clear any old gallery preview images
    const galleryPreviewContainer = document.getElementById("galleryPreviewContainer")
    galleryPreviewContainer.innerHTML = ""

    // Parse image data and display previews
    const galleryImages = JSON.parse(button.getAttribute('data-galleryImages') || '[]')
    galleryImages.forEach(img => {
      const newImg = document.createElement('img');
      newImg.src = img.url;
      newImg.classList.add("img-thumbnail", "m-1"); // styling
      newImg.style.maxWidth = "100px";
      galleryPreviewContainer.appendChild(newImg);
    })
})

// set up for button toggles in admin/profile page
//discount toggle
const openDiscountFormButton = document.querySelectorAll(".changeDiscountButton")

openDiscountFormButton.forEach(function(el){
    el.addEventListener('click', toggleDisplay)
})
//quantity toggle
const openQuantityFormButton = document.querySelectorAll(".updateQuantityButton")

openQuantityFormButton.forEach(function(el){
    el.addEventListener('click', toggleDisplay)
})

function toggleDisplay(event) {
    const clicked = event.target
    if (clicked.matches('button')) {
    clicked.nextElementSibling.classList.toggle('hidden');
  }
}

function confirmDelete() {
    return confirm("Are you sure you want to delete this post? This action cannot be undone.");
}