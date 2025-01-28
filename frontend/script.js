document.getElementById('showPassword').addEventListener('change', function() {
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    if (this.checked) {
        passwordField.type = 'text';
        confirmPasswordField.type = 'text';
    } else {
        passwordField.type = 'password';
        confirmPasswordField.type = 'password';
    }
});


document.getElementById('showLoginPassword').addEventListener('change', function() {
    const loginPasswordField = document.getElementById('loginPassword');
    if (this.checked) {
        loginPasswordField.type = 'text';
    } else {
        loginPasswordField.type = 'password';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
      document.getElementById('message').innerText = 'Passwords do not match.';
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      document.getElementById('message').innerText = data.message;

      if (response.ok) {
          document.getElementById('registerForm').reset();
      }
  } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').innerText = 'Registration failed';
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameOrEmail = document.getElementById('usernameOrEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
      const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await response.json();
      document.getElementById('message').innerText = data.message;

      if (response.ok) {
          localStorage.setItem('token', data.token);
          window.location.href = 'dashboard.html';
      }
  } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').innerText = 'Login failed';
  }
});