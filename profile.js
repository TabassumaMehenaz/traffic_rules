document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('dpInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('dp', file);

  try {
    const response = await fetch('http://localhost:3000/api/upload-dp', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      alert('Profile picture uploaded successfully!');
    } else {
      alert('Upload failed!');
    }
  } catch (error) {
    alert('Error uploading DP');
    console.error(error);
  }
});

// Optional: show preview
document.getElementById('dpInput').addEventListener('change', function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('preview').src = e.target.result;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
});
