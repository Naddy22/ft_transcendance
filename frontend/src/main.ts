
import { API } from "./api"

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
  // DARK MODE HANDLING
  function setDarkMode(enabled: boolean) {
    document.body.classList.toggle("dark-mode", enabled);
    localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
    darkModeBtn.textContent = enabled ? "☀️ Light Mode" : "🌙 Dark Mode";
  }

  // Load dark mode preference
  setDarkMode(localStorage.getItem("darkMode") === "enabled");

  // Event listener for toggling dark mode
  darkModeBtn.addEventListener("click", () => {
    setDarkMode(!document.body.classList.contains("dark-mode"));
  });

  // ────────────────────────────────────────────────────────────────────────────────
  // Fetch & Display User Info
  async function fetchUserInfo(userId: number | null) {
    if (!userId)
      return; // Exit if no user is logged in

    const userData = await API.fetchUserInfo(userId);
    if (userData) {
      userIdElem.textContent = userData.id.toString();
      userNameElem.textContent = userData.username;
      userEmailElem.textContent = userData.email;
      userStatusElem.textContent = userData.status;
    }
  }

  // Fetch & Display All Users
  async function fetchUsers() {
    const data = await API.fetchUsers();
    allUsersResponse.textContent = data ? JSON.stringify(data, null, 2) : "❌ Error fetching users.";
  }

  // Auto-fetch users on page load
  fetchUsers();

  // ────────────────────────────────────────────────────────────────────────────────
  // Event Listeners

  // Toggle All Users: Show data if hidden, hide if visible
  toggleAllUsers.addEventListener("click", async () => {
    const isHidden = allUsersResponse.style.display === "none";
    if (isHidden) {
      toggleAllUsers.textContent = "Loading...";
      await fetchUsers();
      allUsersResponse.style.display = "block"; // show users
      toggleAllUsers.textContent = "Show All Users"; // Reset button on failure
    } else {
      allUsersResponse.style.display = "none";
    }
  });

  // Toggle Register: Show form if hidden, hide if visible
  // toggleRegister.addEventListener("click", () => {
  //   const isHidden = registerForm.style.display === "none";
  //   registerForm.style.display = isHidden ? "block" : "none";
  //   loginForm.style.display = "none";
  //   toggleRegister.textContent = isHidden ? "Hide Register" : "Show Register";
  //   toggleLogin.textContent = "Show Login";
  // });
  toggleRegister.addEventListener("click", () => {
    registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
    loginForm.style.display = "none";
  });

  // Toggle Login: Show form if hidden, hide if visible
  // toggleLogin.addEventListener("click", () => {
  //   const isHidden = loginForm.style.display === "none";
  //   loginForm.style.display = isHidden ? "block" : "none";
  //   registerForm.style.display = "none";
  //   toggleLogin.textContent = isHidden ? "Hide Login" : "Show Login";
  //   toggleRegister.textContent = "Show Register";
  // });
  toggleLogin.addEventListener("click", () => {
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
    registerForm.style.display = "none";
  });

  // ────────────────────────────────────────────────────────────────────────────────

  registerBtn.addEventListener("click", async () => {
    const username = regUsername.value;
    const email = regEmail.value;
    const password = regPassword.value;

    if (!username || !email || !password) {
      registerResponse.textContent = "❌ Please fill all fields.";
      return;
    }

    const response = await API.registerUser(username, email, password);
    registerResponse.textContent = response ? `✅ Success: ${response.message}` : "❌ Error registering.";

    // Refresh users list if registration was successful
    if (response) fetchUsers();
  });

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

    const response = await API.loginUser(identifier, password)
    if (response) {
      loggedInUserId = response.user.id; // Store user ID for logout
      loggedInUserStatus = response.user.status; // Store user status

      loginResponse.textContent = `✅ Success: ${response.message}`;
      logoutBtn.style.display = "block"; // Show Logout button
      deleteAccountBtn.style.display = "block";
      userInfo.style.display = "block";
      fetchUserInfo(loggedInUserId);
      fetchUsers();
    } else {
      loginResponse.textContent = "❌ Login failed.";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      logoutResponse.textContent = "❌ No user is logged in.";
      return;
    }

    const response = await API.logoutUser(loggedInUserId);
    if (response) {
      logoutResponse.textContent = "✅ Successfully logged out.";
    } else {
      logoutResponse.textContent = "❌ Logout failed.";
    }

    // Ensure UI resets regardless of API response
    loggedInUserId = null;
    loggedInUserStatus = null;

    logoutBtn.style.display = "none";
    deleteAccountBtn.style.display = "none";
    userInfo.style.display = "none";

    loginIdentifier.value = "";
    loginPassword.value = "";

    loginResponse.textContent = "🔓 Logged out. You can log in again.";

    fetchUsers(); // Refresh users list
  });

  // Delete Account API Call
  deleteAccountBtn.addEventListener("click", async () => {
    if (!loggedInUserId || !confirm("⚠️ Are you sure you want to delete your account?")) return;

    const response = await API.deleteAccount(loggedInUserId);
    if (response) {
      loggedInUserId = null;
      loggedInUserStatus = null;
      deleteResponse.textContent = "✅ Account deleted successfully.";
      logoutBtn.style.display = "none";
      deleteAccountBtn.style.display = "none";
      userInfo.style.display = "none";

      // Clear login fields
      loginIdentifier.value = "";
      loginPassword.value = "";

      loginResponse.textContent = "🔓 Account deleted. You can register again.";

      fetchUsers();
    }
  });

  // Update Username
  updateUsernameBtn.addEventListener("click", async () => {
    if (!loggedInUserId)
      return;

    if (!newUsername.value.trim()) {
      updateResponse.textContent = "❌ Please enter a new username.";
      return;
    }

    const response = await API.updateUser(loggedInUserId, { username: newUsername.value });
    updateResponse.textContent = response ? "✅ Username updated." : "❌ Update failed.";
    if (response)
      fetchUserInfo(loggedInUserId);
  });

  // Update Email
  updateEmailBtn.addEventListener("click", async () => {
    if (!loggedInUserId)
      return;

    if (!newEmail.value.trim()) {
      updateResponse.textContent = "❌ Please enter a new email.";
      return;
    }

    const response = await API.updateUser(loggedInUserId, { email: newEmail.value });
    updateResponse.textContent = response ? "✅ Email updated." : "❌ Update failed.";
    if (response) {
      updateResponse.textContent = "✅ Email updated successfully.";
      fetchUserInfo(loggedInUserId);
    }
  });

  // Update Status
  updateStatusBtn.addEventListener("click", async () => {
    if (!loggedInUserId)
      return;

    const response = await API.updateUser(loggedInUserId, { status: newStatus.value });
    updateResponse.textContent = response ? "✅ Status updated." : "❌ Update failed.";
    if (response) fetchUserInfo(loggedInUserId);
  });

});
