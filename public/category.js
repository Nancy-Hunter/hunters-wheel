// Add image gallery preview on hover

let categoryImgs= [...document.querySelectorAll('.categoryImg')]

categoryImgs.forEach(img => {
  const galleryImgURL = img.dataset.gallery
  const mainImgURL = img.dataset.mainimg
  
  // Only attach listeners if a gallery image exists
  if (galleryImgURL) {
    img.addEventListener('mouseenter', () => {
      img.src = galleryImgURL
    });

    img.addEventListener('mouseleave', () => {
      img.src = mainImgURL
    });
  }
})
