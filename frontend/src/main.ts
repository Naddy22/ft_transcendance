
import { API } from "./api";
import { UserStatus } from "./api"; //tmp

const api = new API("https://localhost:3000"); // adjust to your backend URL

document.addEventListener("DOMContentLoaded", () => {
  // Grab UI elements
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

  // Grab the avatar UI elements
  const avatarImg = document.getElementById("userAvatar") as HTMLImageElement;
  const avatarInput = document.getElementById("avatarInput") as HTMLInputElement;
  const uploadAvatarBtn = document.getElementById("uploadAvatarBtn") as HTMLButtonElement;
  const removeAvatarBtn = document.getElementById("removeAvatarBtn") as HTMLButtonElement;

  const newUsername = document.getElementById("newUsername") as HTMLInputElement;
  const updateUsernameBtn = document.getElementById("updateUsernameBtn") as HTMLButtonElement;
  const newEmail = document.getElementById("newEmail") as HTMLInputElement;
  const updateEmailBtn = document.getElementById("updateEmailBtn") as HTMLButtonElement;
  const newStatus = document.getElementById("newStatus") as HTMLSelectElement;
  const updateStatusBtn = document.getElementById("updateStatusBtn") as HTMLButtonElement;
  const updateResponse = document.getElementById("updateResponse") as HTMLParagraphElement;

  let loggedInUserId: number | null = null;
  let loggedInUserStatus: string | null = null;

  // Initially hide forms and user info
  registerForm.style.display = "none";
  loginForm.style.display = "none";
  logoutBtn.style.display = "none";
  deleteAccountBtn.style.display = "none";
  userInfo.style.display = "none";
  allUsersResponse.style.display = "none";

  // Dark Mode Handling
  function setDarkMode(enabled: boolean) {
    document.body.classList.toggle("dark-mode", enabled);
    localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
    darkModeBtn.textContent = enabled ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
  setDarkMode(localStorage.getItem("darkMode") === "enabled");

  darkModeBtn.addEventListener("click", () => {
    setDarkMode(!document.body.classList.contains("dark-mode"));
  });

  // Helper function to update the displayed avatar
  function updateAvatarDisplay(avatarUrl: string | null | undefined) {
    // If the avatarUrl is null or empty, revert to default
    avatarImg.src = avatarUrl ? avatarUrl : "/avatars/default.png";
  }


  // Fetch & display user info
  async function fetchUserInfo(userId: number) {
    try {
      const userData = await api.getUser(userId);
      userIdElem.textContent = userData.id.toString();
      userNameElem.textContent = userData.username;
      userEmailElem.textContent = userData.email;
      userStatusElem.textContent = userData.status;

      updateAvatarDisplay(userData.avatar);

    } catch (error: any) {
      console.error("Error fetching user info:", error.message);
    }
  }

  // Fetch & display all users
  async function fetchUsers() {
    try {
      const users = await api.getUsers();
      allUsersResponse.textContent = JSON.stringify(users, null, 2);
    } catch (error: any) {
      allUsersResponse.textContent = `❌ Error: ${error.message}`;
    }
  }

  // Auto-fetch users on page load
  // fetchUsers();

  // Toggle display of all users
  toggleAllUsers.addEventListener("click", async () => {
    if (allUsersResponse.style.display === "none") {
      toggleAllUsers.textContent = "Loading...";
      await fetchUsers();
      allUsersResponse.style.display = "block";
      toggleAllUsers.textContent = "Hide All Users";
    } else {
      allUsersResponse.style.display = "none";
      toggleAllUsers.textContent = "Show All Users";
    }
  });

  // Toggle Register Form
  toggleRegister.addEventListener("click", () => {
    registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
    loginForm.style.display = "none";
  });

  // Toggle Login Form
  toggleLogin.addEventListener("click", () => {
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
    registerForm.style.display = "none";
  });

  // Registration
  registerBtn.addEventListener("click", async () => {
    const username = regUsername.value;
    const email = regEmail.value;
    const password = regPassword.value;
    if (!username || !email || !password) {
      registerResponse.textContent = "❌ Please fill all fields.";
      return;
    }
    try {
      const user = await api.registerUser({ username, email, password });
      registerResponse.textContent = `✅ Registration successful. User ID: ${user.id}`;
      fetchUsers();
    } catch (error: any) {
      registerResponse.textContent = `❌ Registration failed: ${error.message}`;
    }
  });

  // Login
  loginBtn.addEventListener("click", async () => {
    const identifier = loginIdentifier.value;
    const password = loginPassword.value;
    if (!identifier || !password) {
      loginResponse.textContent = "❌ Please enter username/email and password.";
      return;
    }
    if (loggedInUserStatus === "online") {
      loginResponse.textContent = "✅ Already logged in.";
      return;
    }
    try {
      const response = await api.loginUser({ identifier, password });
      loggedInUserId = response.user.id;
      loggedInUserStatus = response.user.status;
      loginResponse.textContent = `✅ Login successful: ${response.message}`;
      logoutBtn.style.display = "block";
      deleteAccountBtn.style.display = "block";
      userInfo.style.display = "block";
      fetchUserInfo(loggedInUserId);
      fetchUsers();
    } catch (error: any) {
      loginResponse.textContent = `❌ Login failed: ${error.message}`;
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      logoutResponse.textContent = "❌ No user is logged in.";
      return;
    }
    try {
      const response = await api.logoutUser({ id: loggedInUserId });
      logoutResponse.textContent = `✅ Logged out: ${response.message}`;
    } catch (error: any) {
      logoutResponse.textContent = `❌ Logout failed: ${error.message}`;
    }
    loggedInUserId = null;
    loggedInUserStatus = null;
    logoutBtn.style.display = "none";
    deleteAccountBtn.style.display = "none";
    userInfo.style.display = "none";
    loginIdentifier.value = "";
    loginPassword.value = "";
    loginResponse.textContent = "🔓 Logged out. You can log in again.";
    fetchUsers();
  });

  // Delete Account
  deleteAccountBtn.addEventListener("click", async () => {
    if (!loggedInUserId || !confirm("⚠️ Delete your account?")) return;
    try {
      const response = await api.deleteUser(loggedInUserId);
      deleteResponse.textContent = `✅ Account deleted: ${response.message}`;
      loggedInUserId = null;
      loggedInUserStatus = null;
      logoutBtn.style.display = "none";
      deleteAccountBtn.style.display = "none";
      userInfo.style.display = "none";
      loginIdentifier.value = "";
      loginPassword.value = "";
      loginResponse.textContent = "🔓 Account deleted. You can register again.";
      fetchUsers();
    } catch (error: any) {
      deleteResponse.textContent = `❌ Deletion failed: ${error.message}`;
    }
  });

  // Update Username
  updateUsernameBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    if (!newUsername.value.trim()) {
      updateResponse.textContent = "❌ Please enter a new username.";
      return;
    }
    try {
      await api.updateUser(loggedInUserId, { username: newUsername.value });
      updateResponse.textContent = "✅ Username updated.";
      fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      updateResponse.textContent = `❌ Update failed: ${error.message}`;
    }
  });

  // Update Email
  updateEmailBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    if (!newEmail.value.trim()) {
      updateResponse.textContent = "❌ Please enter a new email.";
      return;
    }
    try {
      await api.updateUser(loggedInUserId, { email: newEmail.value });
      updateResponse.textContent = "✅ Email updated.";
      fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      updateResponse.textContent = `❌ Update failed: ${error.message}`;
    }
  });

  // Update Status
  // Function to assert a value as UserStatus
  const toUserStatus = (value: string): UserStatus => {
    switch (value) {
      case "online":
      case "offline":
      case "in-game":
        return value;
      default:
        throw new Error(`Invalid status value: ${value}`);
    }
  };

  updateStatusBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;

    try {
      const statusValue = toUserStatus(newStatus.value);
      await api.updateUser(loggedInUserId, { status: statusValue });
      // await api.updateUser(loggedInUserId, { status: newStatus.value });
      updateResponse.textContent = "✅ Status updated.";
      fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      updateResponse.textContent = `❌ Update failed: ${error.message}`;
    }
  });


  // 

  // Upload Avatar
  uploadAvatarBtn.addEventListener("click", async () => {
    if (!avatarInput.files || avatarInput.files.length === 0) {
      console.error("No file selected for upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", avatarInput.files[0]);
    try {
      // First, upload the file
      const uploadResponse = await api.uploadAvatar(formData);
      console.log("Avatar uploaded:", uploadResponse.avatarUrl);
      // Then, update the avatar reference in the database (if required)
      if (loggedInUserId) {
        const updateResponse = await api.updateAvatar(loggedInUserId, uploadResponse.avatarUrl);
        console.log("Avatar updated:", updateResponse.avatarUrl);
        updateAvatarDisplay(updateResponse.avatarUrl);
      }
    } catch (error: any) {
      console.error("Avatar upload failed:", error.message);
    }
  });

  // Remove Avatar (revert to default)
  removeAvatarBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    try {
      const response = await api.removeAvatar(loggedInUserId);
      console.log("Avatar removed:", response.avatarUrl);
      updateAvatarDisplay(response.avatarUrl);
    } catch (error: any) {
      console.error("Avatar removal failed:", error.message);
    }
  });

});

