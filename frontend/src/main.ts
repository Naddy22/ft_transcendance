document.addEventListener("DOMContentLoaded", () => {
  const toggleRegister = document.getElementById("toggleRegister") as HTMLButtonElement;
  const toggleLogin = document.getElementById("toggleLogin") as HTMLButtonElement;
  const toggleAllUsers = document.getElementById("toggleAllUsers") as HTMLButtonElement;
  const darkModeBtn = document.getElementById("toggleDarkMode") as HTMLButtonElement;

  const registerForm = document.getElementById("registerForm") as HTMLDivElement;
  const loginForm = document.getElementById("loginForm") as HTMLDivElement;

  const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
  const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
  const deleteAccountBtn = document.getElementById("deleteAccountBtn") as HTMLButtonElement;

  const regUsername = document.getElementById("regUsername") as HTMLInputElement;
  const regEmail = document.getElementById("regEmail") as HTMLInputElement;
  const regPassword = document.getElementById("regPassword") as HTMLInputElement;
  const registerResponse = document.getElementById("registerResponse") as HTMLParagraphElement;

  const loginIdentifier = document.getElementById("loginIdentifier") as HTMLInputElement;
  const loginPassword = document.getElementById("loginPassword") as HTMLInputElement;
  const loginResponse = document.getElementById("loginResponse") as HTMLParagraphElement;

  const allUsersResponse = document.getElementById("allUsersResponse") as HTMLPreElement;
  const logoutResponse = document.getElementById("logoutResponse") as HTMLParagraphElement;
  const deleteResponse = document.getElementById("deleteResponse") as HTMLParagraphElement;

  const userInfo = document.getElementById("userInfo") as HTMLDivElement;
  const userIdElem = document.getElementById("userId") as HTMLSpanElement;
  const userNameElem = document.getElementById("userName") as HTMLSpanElement;
  const userEmailElem = document.getElementById("userEmail") as HTMLSpanElement;
  const userStatusElem = document.getElementById("userStatus") as HTMLSpanElement;

  const newUsername = document.getElementById("newUsername") as HTMLInputElement;
  const updateUsernameBtn = document.getElementById("updateUsernameBtn") as HTMLButtonElement;
  const newEmail = document.getElementById("newEmail") as HTMLInputElement;
  const updateEmailBtn = document.getElementById("updateEmailBtn") as HTMLButtonElement;
  const newStatus = document.getElementById("newStatus") as HTMLSelectElement;
  const updateStatusBtn = document.getElementById("updateStatusBtn") as HTMLButtonElement;
  const updateResponse = document.getElementById("updateResponse") as HTMLParagraphElement;

  let loggedInUserId: number | null = null; // Store logged-in user ID
  let loggedInUserStatus: string | null = null;

  // Ensure forms are hidden at the start
  registerForm.style.display = "none";
  loginForm.style.display = "none";
  logoutBtn.style.display = "none";
  deleteAccountBtn.style.display = "none";
  userInfo.style.display = "none";

  // ────────────────────────────────────────────────────────────────────────────────
  // Function to set dark mode
  function setDarkMode(enabled: boolean) {
    if (enabled) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
      darkModeBtn.textContent = "☀️ Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
      darkModeBtn.textContent = "🌙 Dark Mode";
    }
  }

  // Check for existing dark mode preference
  const darkModePreference = localStorage.getItem("darkMode");
  if (darkModePreference === "enabled") {
    setDarkMode(true);
  } else {
    setDarkMode(false);
  }

  // Event listener for toggling dark mode
  darkModeBtn.addEventListener("click", () => {
    const isDarkMode = document.body.classList.contains("dark-mode");
    setDarkMode(!isDarkMode);
  });

  // ────────────────────────────────────────────────────────────────────────────────
  // Fetch User Info by ID
  async function fetchUserInfo(userId: number | null) {
    if (userId === null)
      return; // Exit if no user is logged in

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

  // Fetch All Users
  async function fetchUsers() {
    try {
      const response = await fetch("/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }

      const data = await response.json();
      allUsersResponse.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error fetching users:", error);
      allUsersResponse.textContent = "❌ Error fetching users.";
    }
  }

  // Auto-fetch users on page load
  fetchUsers();

  // Toggle All Users: Show data if hidden, hide if visible
  toggleAllUsers.addEventListener("click", async () => {
    const isHidden = allUsersResponse.style.display === "none";

    if (isHidden) {
      toggleAllUsers.textContent = "Loading...";

      try {
        await fetchUsers();
        allUsersResponse.style.display = "block"; // show users
        toggleAllUsers.textContent = "Show All Users"; // Reset button on failure
      } catch (error) {
        toggleAllUsers.textContent = "Show All Users"; // Reset button on failure
        console.error("Error fetching users:", error);
      }

    } else {
      allUsersResponse.style.display = "none";
      allUsersResponse.textContent = "Show All Users";
    }
  });

  // Toggle Register: Show form if hidden, hide if visible
  toggleRegister.addEventListener("click", () => {
    const isHidden = registerForm.style.display === "none";
    registerForm.style.display = isHidden ? "block" : "none";
    loginForm.style.display = "none";
    toggleRegister.textContent = isHidden ? "Hide Register" : "Show Register";
    toggleLogin.textContent = "Show Login";
  });

  // Toggle Login: Show form if hidden, hide if visible
  toggleLogin.addEventListener("click", () => {
    const isHidden = loginForm.style.display === "none";
    loginForm.style.display = isHidden ? "block" : "none";
    registerForm.style.display = "none";
    toggleLogin.textContent = isHidden ? "Hide Login" : "Show Login";
    toggleRegister.textContent = "Show Register";
  });

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

      // Refresh users list if registration was successful
      if (response.ok) {
        fetchUsers();
      }

    } catch (error) {
      registerResponse.textContent = "❌ Network error.";
      console.error("Registration error:", error);
    }
  });

  // Login API Call
  loginBtn.addEventListener("click", async () => {
    const identifier = loginIdentifier.value;
    const password = loginPassword.value;

    if (!identifier || !password) {
      loginResponse.textContent = "❌ Please enter username/email and password.";
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
        body: JSON.stringify({ identifier, password }),
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

      } else {
        loginResponse.textContent = `❌ Error: ${data.error}`;
      }

      // Refresh users list if registration was successful
      if (response.ok)
        fetchUsers();

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
        loginIdentifier.value = "";
        loginPassword.value = "";

        loginResponse.textContent = "🔓 Logged out. You can  log in again.";

        fetchUsers(); // Auto-refresh users list ✅

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

        loginIdentifier.value = "";
        loginPassword.value = "";

        loginResponse.textContent = "🔓 Account deleted. You can register again.";

        fetchUsers();

      } else {
        deleteResponse.textContent = "❌ Failed to delete account.";
      }
    } catch (error) {
      deleteResponse.textContent = "❌ Network error.";
    }
  });

  // Update Username
  updateUsernameBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    const username = newUsername.value.trim();
    if (!username) {
      updateResponse.textContent = "❌ Please enter a new username.";
      return;
    }

    try {
      const response = await fetch(`/users/${loggedInUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (response.ok) {
        updateResponse.textContent = "✅ Username updated successfully.";
        await fetchUserInfo(loggedInUserId);
        fetchUsers();
      } else {
        updateResponse.textContent = `❌ Error: ${data.error}`;
      }
    } catch (error) {
      updateResponse.textContent = "❌ Network error.";
    }
  });

  // Update Email
  updateEmailBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    const email = newEmail.value.trim();
    if (!email) {
      updateResponse.textContent = "❌ Please enter a new email.";
      return;
    }

    try {
      const response = await fetch(`/users/${loggedInUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        updateResponse.textContent = "✅ Email updated successfully.";
        await fetchUserInfo(loggedInUserId);
        fetchUsers();
      } else {
        updateResponse.textContent = `❌ Error: ${data.error}`;
      }
    } catch (error) {
      updateResponse.textContent = "❌ Network error.";
    }
  });

  // Update Status
  updateStatusBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    const status = newStatus.value;

    try {
      const response = await fetch(`/users/${loggedInUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (response.ok) {
        updateResponse.textContent = "✅ Status updated successfully.";
        await fetchUserInfo(loggedInUserId);
        fetchUsers();
      } else {
        updateResponse.textContent = `❌ Error: ${data.error}`;
      }
    } catch (error) {
      updateResponse.textContent = "❌ Network error.";
    }
  });

  // Hook Into Login (Modify login function to store user ID)
  async function loginUser(email: string, password: string) {
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        loggedInUserId = data.user.id; // Store user ID
        userInfo.style.display = "block";
        await fetchUserInfo(loggedInUserId); // Fetch and display user data
        fetchUsers();
      } else {
        updateResponse.textContent = `❌ Error: ${data.error}`;
      }
    } catch (error) {
      updateResponse.textContent = "❌ Network error.";
    }
  };

});

// document.addEventListener("DOMContentLoaded", () => {
//   // UI Elements
//   const toggleRegister = document.getElementById("toggleRegister") as HTMLButtonElement;
//   const toggleLogin = document.getElementById("toggleLogin") as HTMLButtonElement;
//   const toggleAllUsers = document.getElementById("toggleAllUsers") as HTMLButtonElement;
//   const darkModeBtn = document.getElementById("toggleDarkMode") as HTMLButtonElement;

//   const registerForm = document.getElementById("registerForm") as HTMLDivElement;
//   const loginForm = document.getElementById("loginForm") as HTMLDivElement;

//   const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;
//   const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
//   const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
//   const deleteAccountBtn = document.getElementById("deleteAccountBtn") as HTMLButtonElement;

//   const regUsername = document.getElementById("regUsername") as HTMLInputElement;
//   const regEmail = document.getElementById("regEmail") as HTMLInputElement;
//   const regPassword = document.getElementById("regPassword") as HTMLInputElement;
//   const registerResponse = document.getElementById("registerResponse") as HTMLParagraphElement;

//   const loginIdentifier = document.getElementById("loginIdentifier") as HTMLInputElement;
//   const loginPassword = document.getElementById("loginPassword") as HTMLInputElement;
//   const loginResponse = document.getElementById("loginResponse") as HTMLParagraphElement;

//   const allUsersResponse = document.getElementById("allUsersResponse") as HTMLPreElement;
//   const logoutResponse = document.getElementById("logoutResponse") as HTMLParagraphElement;
//   const deleteResponse = document.getElementById("deleteResponse") as HTMLParagraphElement;

//   const userInfo = document.getElementById("userInfo") as HTMLDivElement;
//   const userIdElem = document.getElementById("userId") as HTMLSpanElement;
//   const userNameElem = document.getElementById("userName") as HTMLSpanElement;
//   const userEmailElem = document.getElementById("userEmail") as HTMLSpanElement;
//   const userStatusElem = document.getElementById("userStatus") as HTMLSpanElement;

//   const newUsername = document.getElementById("newUsername") as HTMLInputElement;
//   const updateUsernameBtn = document.getElementById("updateUsernameBtn") as HTMLButtonElement;
//   const newEmail = document.getElementById("newEmail") as HTMLInputElement;
//   const updateEmailBtn = document.getElementById("updateEmailBtn") as HTMLButtonElement;
//   const newStatus = document.getElementById("newStatus") as HTMLSelectElement;
//   const updateStatusBtn = document.getElementById("updateStatusBtn") as HTMLButtonElement;
//   const updateResponse = document.getElementById("updateResponse") as HTMLParagraphElement;

//   let loggedInUserId: number | null = null;

//   // Ensure forms are hidden at the start
//   registerForm.style.display = "none";
//   loginForm.style.display = "none";
//   logoutBtn.style.display = "none";
//   deleteAccountBtn.style.display = "none";
//   userInfo.style.display = "none";
//   allUsersResponse.style.display = "none";

//   // ────────────────────────────────────────────────────────────────────────────────
//   // DARK MODE HANDLING
//   function setDarkMode(enabled: boolean) {
//     if (enabled) {
//       document.body.classList.add("dark-mode");
//       localStorage.setItem("darkMode", "enabled");
//       darkModeBtn.textContent = "☀️ Light Mode";
//     } else {
//       document.body.classList.remove("dark-mode");
//       localStorage.setItem("darkMode", "disabled");
//       darkModeBtn.textContent = "🌙 Dark Mode";
//     }
//   }

//   // Load dark mode preference
//   setDarkMode(localStorage.getItem("darkMode") === "enabled");

//   darkModeBtn.addEventListener("click", () => {
//     setDarkMode(!document.body.classList.contains("dark-mode"));
//   });

//   // ────────────────────────────────────────────────────────────────────────────────
//   // FETCH USERS LIST
//   async function fetchUsers() {
//     try {
//       const response = await fetch("/users");
//       if (!response.ok) throw new Error("Failed to fetch users.");

//       const data = await response.json();
//       allUsersResponse.textContent = JSON.stringify(data, null, 2);
//       allUsersResponse.style.display = "block";
//     } catch (error) {
//       allUsersResponse.textContent = "❌ Error fetching users.";
//     }
//   }

//   // Auto-fetch users on page load
//   fetchUsers();

//   // ────────────────────────────────────────────────────────────────────────────────
//   // TOGGLE ALL USERS
//   toggleAllUsers.addEventListener("click", async () => {
//     const isHidden = allUsersResponse.style.display === "none";

//     if (isHidden) {
//       toggleAllUsers.textContent = "Loading...";
//       await fetchUsers();
//       toggleAllUsers.textContent = "Hide All Users";
//     } else {
//       allUsersResponse.style.display = "none";
//       toggleAllUsers.textContent = "Show All Users";
//     }
//   });

//   // ────────────────────────────────────────────────────────────────────────────────
//   // USER MANAGEMENT API CALLS
//   async function apiRequest(url: string, method: string, body: object | null = null) {
//     return fetch(url, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: body ? JSON.stringify(body) : null,
//     });
//   }

//   async function registerUser(username: string, email: string, password: string) {
//     const response = await apiRequest("/auth/register", "POST", { username, email, password });
//     if (response.ok) fetchUsers();
//   }

//   async function loginUser(identifier: string, password: string) {
//     const response = await apiRequest("/auth/login", "POST", { identifier, password });
//     if (response.ok) {
//       const data = await response.json();
//       loggedInUserId = data.user.id;
//       await fetchUsers();
//     }
//   }

//   async function logoutUser() {
//     if (!loggedInUserId) return;
//     const response = await apiRequest("/auth/logout", "POST", { id: loggedInUserId });
//     if (response.ok) {
//       loggedInUserId = null;
//       await fetchUsers();
//     }
//   }

//   async function deleteUser() {
//     if (!loggedInUserId) return;
//     const response = await apiRequest(`/users/${loggedInUserId}`, "DELETE");
//     if (response.ok) {
//       loggedInUserId = null;
//       await fetchUsers();
//     }
//   }

//   async function updateUser(field: string, value: string) {
//     if (!loggedInUserId) return;
//     const response = await apiRequest(`/users/${loggedInUserId}`, "PUT", { [field]: value });
//     if (response.ok) await fetchUsers();
//   }

//   // ────────────────────────────────────────────────────────────────────────────────
//   // EVENT LISTENERS
//   registerBtn.addEventListener("click", async () => {
//     await registerUser(regUsername.value, regEmail.value, regPassword.value);
//   });

//   loginBtn.addEventListener("click", async () => {
//     await loginUser(loginIdentifier.value, loginPassword.value);
//   });

//   logoutBtn.addEventListener("click", async () => {
//     await logoutUser();
//   });

//   deleteAccountBtn.addEventListener("click", async () => {
//     await deleteUser();
//   });

//   updateUsernameBtn.addEventListener("click", async () => {
//     await updateUser("username", newUsername.value);
//   });

//   updateEmailBtn.addEventListener("click", async () => {
//     await updateUser("email", newEmail.value);
//   });

//   updateStatusBtn.addEventListener("click", async () => {
//     await updateUser("status", newStatus.value);
//   });
// });
