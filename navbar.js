
const dropdown = document.getElementById('profileDropdown');
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (token) {
  dropdown.innerHTML = `
    <a href="profile.html">Profile</a>
    <a href="${role === 'admin' ? 'admin_dashboard.html' : 'user_dashboard.html'}">Dashboard</a>
    <a href="#" id="logoutBtn">Logout</a>
  `;
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
} else {
  dropdown.innerHTML = `
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
  `;
}



























document.addEventListener("DOMContentLoaded", () => {
  const profileIcon = document.getElementById('profileIcon');
  const dropdown = document.getElementById('profileDropdown');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Update dropdown based on login status
  if (token) {
    dropdown.innerHTML = `
      <a href="${role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html'}">Dashboard</a>
      <a href="#" id="logoutBtn">Logout</a>
    `;
  } else {
    dropdown.innerHTML = `
      <a href="login.html">Login</a>
      <a href="signup.html">Sign Up</a>
    `;
  }

  // Toggle dropdown on icon click
  profileIcon.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  });

  // Hide dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (!profileIcon.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Logout button click
  dropdown.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      window.location.href = 'index1.html';
    }
  });
});
