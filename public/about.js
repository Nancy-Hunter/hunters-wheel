const referenceInput = document.getElementById('reference');
  const fileText = document.getElementById('fileUploadText');
  const previewImage = document.getElementById('previewImage');
  const previewWrapper = document.querySelector('.previewWrapper');
  const clearButton = document.getElementById('clearFileButton');

  referenceInput.addEventListener('change', function () {
    const file = referenceInput.files[0];
    if (file) {
      fileText.textContent = file.name;

      // Show preview
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewWrapper.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    } else {
      fileText.textContent = 'No file chosen';
      previewWrapper.style.display = 'none';
    }
  });

  clearButton.addEventListener('click', function () {
    referenceInput.value = '';
    fileText.textContent = 'No file chosen';
    previewImage.src = '';
    previewWrapper.style.display = 'none';
  });