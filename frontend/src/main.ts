document.addEventListener("DOMContentLoaded", () => {
  const toggleRegister = document.getElementById("toggleRegister") as HTMLButtonElement;
  const toggleLogin = document.getElementById("toggleLogin") as HTMLButtonElement;
  const registerForm = document.getElementById("registerForm") as HTMLDivElement;
  const loginForm = document.getElementById("loginForm") as HTMLDivElement;

  const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
  const fetchUsersBtn = document.getElementById("fetchUsers") as HTMLButtonElement;
  const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
  const deleteAccountBtn = document.getElementById("deleteAccountBtn") as HTMLButtonElement;

  const regUsername = document.getElementById("regUsername") as HTMLInputElement;
  const regEmail = document.getElementById("regEmail") as HTMLInputElement;
  const regPassword = document.getElementById("regPassword") as HTMLInputElement;
  const registerResponse = document.getElementById("registerResponse") as HTMLParagraphElement;

  const loginEmail = document.getElementById("loginEmail") as HTMLInputElement;
  const loginPassword = document.getElementById("loginPassword") as HTMLInputElement;
  const loginResponse = document.getElementById("loginResponse") as HTMLParagraphElement;

  const apiResponse = document.getElementById("apiResponse") as HTMLPreElement;
  const logoutResponse = document.getElementById("logoutResponse") as HTMLParagraphElement;
  const deleteResponse = document.getElementById("deleteResponse") as HTMLParagraphElement;

  const userInfo = document.getElementById("userInfo") as HTMLDivElement;
  const userIdElem = document.getElementById("userId") as HTMLSpanElement;
  const userNameElem = document.getElementById("userName") as HTMLSpanElement;
  const userEmailElem = document.getElementById("userEmail") as HTMLSpanElement;
  const userStatusElem = document.getElementById("userStatus") as HTMLSpanElement;

  let loggedInUserId: number | null = null; // Store logged-in user ID
  let loggedInUserStatus: string | null = null;

  // Ensure forms are hidden at the start
  registerForm.style.display = "none";
  loginForm.style.display = "none";
  logoutBtn.style.display = "none";
  deleteAccountBtn.style.display = "none";
  userInfo.style.display = "none";

  // Fetch All Users
  function fetchUsers() {
    fetch("/users")
      .then(response => response.json())
      .then(data => {
        apiResponse.textContent = JSON.stringify(data, null, 2);
      })
      .catch(() => {
        apiResponse.textContent = "❌ Error fetching users.";
      });
  }

  // // ??
  // function fetchUsers() {
  //   try {
  //     const response = await fetch("/users");
  //     const data = await response.json();
  //     apiResponse.textContent = JSON.stringify(data, null, 2);
  //   } catch (error) {
  //     apiResponse.textContent = "❌ Error fetching users.";
  //   }
  // }

  // // Fetch All Users
  // fetchUsersBtn.addEventListener("click", async () => {
  //   try {
  //     const response = await fetch("/users");
  //     const data = await response.json();
  //     apiResponse.textContent = JSON.stringify(data, null, 2);
  //   } catch (error) {
  //     apiResponse.textContent = "❌ Error fetching users.";
  //   }
  // });

  // Toggle Register: Show form if hidden, hide if visible
  toggleRegister.addEventListener("click", () => {
    if (registerForm.style.display === "none") {
      registerForm.style.display = "block";
      loginForm.style.display = "none"; // Hide login form
      toggleRegister.textContent = "Hide Register";
      toggleLogin.textContent = "Show Login";
      // fetchUsers();
    } else {
      registerForm.style.display = "none";
      toggleRegister.textContent = "Show Register";
    }
  });
  // // Toggle Register Form
  // toggleRegister.addEventListener("click", () => {
  //   const isHidden = registerForm.style.display === "none";
  //   registerForm.style.display = isHidden ? "block" : "none";
  //   loginForm.style.display = "none";
  //   toggleRegister.textContent = isHidden ? "Hide Register" : "Show Register";
  // });
  // // Toggle Register Form
  // toggleRegister.addEventListener("click", () => {
  //   registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
  //   loginForm.style.display = "none";
  // });

  // Toggle Login: Show form if hidden, hide if visible
  toggleLogin.addEventListener("click", () => {
    if (loginForm.style.display === "none") {
      loginForm.style.display = "block";
      registerForm.style.display = "none"; // Hide register form
      toggleLogin.textContent = "Hide Login";
      toggleRegister.textContent = "Show Register";
      // fetchUsers();
    } else {
      loginForm.style.display = "none";
      toggleLogin.textContent = "Show Login";
    }
  });
  // // Toggle Login Form
  // toggleLogin.addEventListener("click", () => {
  //   const isHidden = loginForm.style.display === "none";
  //   loginForm.style.display = isHidden ? "block" : "none";
  //   registerForm.style.display = "none";
  //   toggleLogin.textContent = isHidden ? "Hide Login" : "Show Login";
  // });
  // // Toggle Login Form
  // toggleLogin.addEventListener("click", () => {
  //   loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  //   registerForm.style.display = "none";
  // });

  // Register API Call
  registerBtn.addEventListener("click", async () => {
    const username = regUsername.value;
    const email = regEmail.value;
    const password = regPassword.value;

    if (!username || !email || !password) {
      registerResponse.textContent = "❌ Please fill all fields.";
      return;
    }

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      registerResponse.textContent = response.ok ? `✅ Success: ${data.message}` : `❌ Error: ${data.error}`;

      // // Refresh users list if registration was successful
      // if (response.ok)
      // fetchUsers();

    } catch (error) {
      registerResponse.textContent = "❌ Network error.";
      console.error("Registration error:", error);
    }
  });

  // Login API Call
  loginBtn.addEventListener("click", async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;

    if (!email || !password) {
      loginResponse.textContent = "❌ Please enter email and password.";
      return;
    }

    // Check if already logged in
    if (loggedInUserStatus === "online") {
      loginResponse.textContent = "✅ Already logged in.";
      return;
    }

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        loggedInUserId = data.user.id; // Store user ID for logout
        loggedInUserStatus = data.user.status; // Store user status

        loginResponse.textContent = `✅ Success: ${data.message}`;
        logoutBtn.style.display = "block"; // Show Logout button
        deleteAccountBtn.style.display = "block";
        userInfo.style.display = "block";

        // Fetch & Display User Info
        await fetchUserInfo(loggedInUserId);

        // // Refresh users list if registration was successful
        // if (response.ok)
        //   fetchUsers();

      } else {
        loginResponse.textContent = `❌ Error: ${data.error}`;
      }
    } catch (error) {
      loginResponse.textContent = "❌ Network error.";
      console.error("Login error:", error);
    }
  });

  // Logout API Call
  logoutBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      logoutResponse.textContent = "❌ No user is logged in.";
      return;
    }

    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: loggedInUserId }),
      });

      const data = await response.json();
      if (response.ok) {
        logoutResponse.textContent = `✅ Success: ${data.message}`;
        loggedInUserId = null; // Clear logged-in user ID
        loggedInUserStatus = null; // Reset user status
        logoutBtn.style.display = "none"; // Hide Logout button
        deleteAccountBtn.style.display = "none";
        userInfo.style.display = "none";

        // Clear login fields
        loginEmail.value = "";
        loginPassword.value = "";

        loginResponse.textContent = "🔓 Logged out. You can  log in again.";

        // // Refresh users list if registration was successful
        // if (response.ok)
        // fetchUsers();

      } else {
        logoutResponse.textContent = `❌ Error: ${data.error}`;
      }
    } catch (error) {
      logoutResponse.textContent = "❌ Network error.";
      console.error("Logout error:", error);
    }
  });

  // Delete Account API Call
  deleteAccountBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      deleteResponse.textContent = "❌ No user is logged in.";
      return;
    }

    if (!confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      const response = await fetch(`/users/${loggedInUserId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteResponse.textContent = "✅ Account deleted successfully.";
        logoutBtn.style.display = "none";
        deleteAccountBtn.style.display = "none";
        userInfo.style.display = "none";

        loggedInUserId = null;
        loggedInUserStatus = null;

        loginEmail.value = "";
        loginPassword.value = "";

        loginResponse.textContent = "🔓 Account deleted. You can register again.";
      } else {
        deleteResponse.textContent = "❌ Failed to delete account.";
      }
    } catch (error) {
      deleteResponse.textContent = "❌ Network error.";
    }
  });

  // Fetch User Info by ID
  async function fetchUserInfo(userId: number) {
    try {
      const response = await fetch(`/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user info.");
      }
      const userData = await response.json();

      // Update user info display
      userIdElem.textContent = userData.id.toString();
      userNameElem.textContent = userData.username;
      userEmailElem.textContent = userData.email;
      userStatusElem.textContent = userData.status;
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }

  // "Get All Users" button now calls the reusable function
  fetchUsersBtn.addEventListener("click", fetchUsers);

  // // Auto-fetch users on page load
  // fetchUsers();

});
