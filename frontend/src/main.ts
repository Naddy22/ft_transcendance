// File: frontend/src/main.ts

import { API } from "./api";
import { UserStatus, PublicUser } from "./api";
import { setupToggleLoginRegister } from "./toggle";
import { setupDarkMode } from "./darkMode";
import { addGameToHistory, updateHistoryUI } from "./history";
// import { updateUserStatsAfterMatch } from "./stats";
import { addGameToStats, updateStatsUI } from "./stats";

const api = new API("https://localhost:3000");

document.addEventListener("DOMContentLoaded", () => {

  // =================================================
  // Global Variables & Element References
  // =================================================
  let loggedInUserId: number | null = null;
  let loggedInUserStatus: string | null = null;

  setupDarkMode();
  setupToggleLoginRegister();

  // Authentication & User Info
  const toggleAllUsers = document.getElementById("toggleAllUsers") as HTMLButtonElement;

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

  // Avatar
  const avatarImg = document.getElementById("userAvatar") as HTMLImageElement;
  const avatarInput = document.getElementById("avatarInput") as HTMLInputElement;
  const uploadAvatarBtn = document.getElementById("uploadAvatarBtn") as HTMLButtonElement;
  const removeAvatarBtn = document.getElementById("removeAvatarBtn") as HTMLButtonElement;

  // Manual Match
  const matchTypeInput = document.getElementById("matchType") as HTMLSelectElement;
  const matchResultInput = document.getElementById("matchResult") as HTMLSelectElement;
  const addMatchBtn = document.getElementById("addMatchBtn") as HTMLButtonElement;
  const matchResponse = document.getElementById("matchResponse") as HTMLParagraphElement;

  // Match History
  const gameHistoryList = document.getElementById("gameHistoryList") as HTMLUListElement;
  const loadGameHistoryBtn = document.getElementById("loadGameHistoryBtn") as HTMLButtonElement;

  // Friends & Friend Search
  const friendSearchInput = document.getElementById("friendSearchInput") as HTMLInputElement;
  const friendSearchBtn = document.getElementById("friendSearchBtn") as HTMLButtonElement;
  const friendSearchResults = document.getElementById("friendSearchResults") as HTMLUListElement;
  const friendList = document.getElementById("friendList") as HTMLUListElement;

  // User Updates
  const newUsername = document.getElementById("newUsername") as HTMLInputElement;
  const updateUsernameBtn = document.getElementById("updateUsernameBtn") as HTMLButtonElement;
  const newEmail = document.getElementById("newEmail") as HTMLInputElement;
  const updateEmailBtn = document.getElementById("updateEmailBtn") as HTMLButtonElement;
  const newStatus = document.getElementById("newStatus") as HTMLSelectElement;
  const updateStatusBtn = document.getElementById("updateStatusBtn") as HTMLButtonElement;
  const updateResponse = document.getElementById("updateResponse") as HTMLParagraphElement;

  // =================================================
  // Authentication & User Info Functions
  // =================================================

  // Fetch & display user info
  async function fetchUserInfo(userId: number) {
    try {
      const userData = await api.getUser(userId);
      userIdElem.textContent = userData.id.toString();
      userNameElem.textContent = userData.username;
      userEmailElem.textContent = userData.email;
      userStatusElem.textContent = userData.status;

      await updateAvatarDisplay(userData.avatar);
      await updateStatsUI(userId);

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

  // Toggle display of all users
  toggleAllUsers.addEventListener("click", async () => {
    if (allUsersResponse.classList.contains("hidden")) {
      toggleAllUsers.textContent = "Loading...";
      await fetchUsers();
      allUsersResponse.classList.remove("hidden");
      toggleAllUsers.textContent = "Hide All Users";
    } else {
      allUsersResponse.classList.add("hidden");
      toggleAllUsers.textContent = "Show All Users";
    }
  });

  // =================================================
  // Avatar Functions
  // =================================================

  // Helper function to update the displayed avatar
  async function updateAvatarDisplay(avatarUrl: string | null | undefined) {

    // If the avatarUrl is null or empty, revert to default
    avatarImg.src = avatarUrl ? avatarUrl : "/avatars/default.png";
  }

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
        await updateAvatarDisplay(updateResponse.avatarUrl);
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
      await updateAvatarDisplay(response.avatarUrl);
    } catch (error: any) {
      console.error("Avatar removal failed:", error.message);
    }
  });

  // =================================================
  // Friend List & Search Functions
  // =================================================

  // Function to fetch and display the current friend list
  async function fetchFriendList(userId: number) {
    try {
      const friends = await api.getFriends(userId);
      friendList.innerHTML = "";
      if (friends.length === 0) {
        friendList.innerHTML = "<li>You have no friends yet.</li>";
      } else {
        friends.forEach(friend => {
          const li = document.createElement("li");
          li.textContent = `ID: ${friend.id} - ${friend.username} (${friend.status})`;

          // Create a button to remove friend
          const removeBtn = document.createElement("button");
          removeBtn.textContent = "Remove";
          removeBtn.classList.add("danger-btn");
          removeBtn.addEventListener("click", async () => {
            try {
              const res = await api.removeFriend(userId, friend.id);
              alert(res.message);
              // Refresh friend list (and optionally search results)
              await fetchFriendList(userId);
            } catch (error: any) {
              alert(`Error removing friend: ${error.message}`);
            }
          });
          li.appendChild(removeBtn);
          friendList.appendChild(li);
        });
      }
    } catch (error: any) {
      friendList.innerHTML = `<li>Error fetching friends: ${error.message}</li>`;
    }
  }

  // Function to search users by username or email using the getUsers() endpoint
  async function searchUsers(query: string): Promise<PublicUser[]> {
    try {

      // Get all users
      const users = await api.getUsers();

      // Filter out the logged-in user and any whose username or email doesn't include the query (case insensitive)
      return users.filter(user => {
        if (loggedInUserId && user.id === loggedInUserId) return false;
        return (
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      });
    } catch (error: any) {
      alert(`Error searching users: ${error.message}`);
      return [];
    }
  }

  // Event listener for the friend search button
  friendSearchBtn.addEventListener("click", async () => {
    const query = friendSearchInput.value.trim();
    if (!query) {
      alert("Please enter a search term.");
      return;
    }
    const results = await searchUsers(query);
    friendSearchResults.innerHTML = "";
    if (results.length === 0) {
      friendSearchResults.innerHTML = "<li>No matching users found.</li>";
    } else {
      results.forEach(user => {
        const listItem = document.createElement("li");
        listItem.textContent = `ID: ${user.id} - ${user.username} (${user.email})`;
        // Button to add friend
        const addBtn = document.createElement("button");
        addBtn.textContent = "Add Friend";
        addBtn.addEventListener("click", async () => {
          if (!loggedInUserId) return;
          try {
            const res = await api.addFriend(loggedInUserId, user.id);
            alert(res.message);
            // Refresh the friend list after adding
            await fetchFriendList(loggedInUserId);
          } catch (error: any) {
            alert(`Error adding friend: ${error.message}`);
          }
        });
        listItem.appendChild(addBtn);
        friendSearchResults.appendChild(listItem);
      });
    }
  });

  // =================================================
  // Authentication Event Listeners
  // =================================================

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
      await fetchUsers();
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
      await fetchUserInfo(loggedInUserId);
      await fetchUsers();
      await fetchFriendList(loggedInUserId);
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
    await fetchUsers();
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
      await fetchUsers();
    } catch (error: any) {
      deleteResponse.textContent = `❌ Deletion failed: ${error.message}`;
    }
  });

  // =================================================
  // User Update Functions
  // =================================================

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
      await fetchUserInfo(loggedInUserId);
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
      await fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      updateResponse.textContent = `❌ Update failed: ${error.message}`;
    }
  });

  // Update Password
  const oldPasswordInput = document.getElementById("oldPassword") as HTMLInputElement;
  const newPasswordInput = document.getElementById("newPassword") as HTMLInputElement;
  const updatePasswordBtn = document.getElementById("updatePasswordBtn") as HTMLButtonElement;
  const passwordUpdateResponse = document.getElementById("passwordUpdateResponse") as HTMLParagraphElement;

  updatePasswordBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;

    const oldPass = oldPasswordInput.value.trim();
    const newPass = newPasswordInput.value.trim();

    if (!oldPass || !newPass) {
      passwordUpdateResponse.textContent = "❌ Please fill both fields.";
      return;
    }

    try {
      const response = await api.updatePassword(loggedInUserId, oldPass, newPass);
      passwordUpdateResponse.textContent = "✅ Password updated successfully.";
      oldPasswordInput.value = "";
      newPasswordInput.value = "";
    } catch (error: any) {
      passwordUpdateResponse.textContent = `❌ Update failed: ${error.message}`;
    }
  });



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

  // Update Status
  updateStatusBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;

    try {
      const statusValue = toUserStatus(newStatus.value);
      await api.updateUser(loggedInUserId, { status: statusValue });
      // await api.updateUser(loggedInUserId, { status: newStatus.value });
      updateResponse.textContent = "✅ Status updated.";
      await fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      updateResponse.textContent = `❌ Update failed: ${error.message}`;
    }
  });

  // =================================================
  // Matches – Manual Match Functionality
  // =================================================

  // Function to manually add a match
  async function addManualMatch() {
    if (!loggedInUserId) return;

    // Get match type and result from the dropdowns
    const matchType = matchTypeInput.value as "1vs1" | "vs AI" | "Tournament";
    const matchResultStr = matchResultInput.value; // e.g., ("✅ Victory" or "❌ Defeat") or ("✅ Victoire" or "❌ Défaite")
    const player1 = loggedInUserId;
    const player2 = 9999; // Dummy opponent
    const score = { player1: 0, player2: 0 };
    const startTime = new Date().toISOString();

    try {
      // Call the API to create a new match
      const createRes = await api.createMatch({
        player1,
        player2,
        score,
        startTime,
        tournamentId: null,
        matchType,
      });

      // Determine winner based on the selected result
      // const winner = matchResultStr.includes("Victory") ? player1 : player2;
      // const winner = matchResultStr.includes("Victoire") ? player1 : player2;
      const didWin = matchResultStr.includes("Victoire");
      const winner = didWin ? player1 : player2;

      // Update the match with the result
      await api.submitMatchResult({
        matchId: createRes.matchId,
        winner,
        score, // Optionally, update scores if needed
      });

      // Provide feedback to the user
      matchResponse.textContent = `✅ Test match added: ${matchType} - ${matchResultStr}`;

      // Refresh match history after adding a match
      // await loadUserHistory(loggedInUserId!);

      // Update match history (already calls updateHistoryUI)
      await addGameToHistory(loggedInUserId, matchType, matchResultStr);

      // Update the user stats on the backend and then update the UI
      await addGameToStats(loggedInUserId, matchResultStr);
      await updateStatsUI(loggedInUserId);

    } catch (error: any) {
      matchResponse.textContent = `❌ Error adding test match: ${error.message}`;
    }
  }

  // Event listener for adding a match
  addMatchBtn.addEventListener("click", addManualMatch);

  // =================================================
  // Match History – Toggle Display
  // =================================================

  // Function to load the match history for a given user ID
  async function loadUserHistory(userId: number) {
    try {
      const history = await api.getUserMatchHistory(userId);
      gameHistoryList.innerHTML = "";

      if (history.length === 0) {
        gameHistoryList.innerHTML = "<li>No match history found.</li>";
        return;
      }

      history.forEach(({ date, type, result }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${date} - ${type} : ${result}`;
        gameHistoryList.appendChild(listItem);
      });
    } catch (error: any) {
      console.error("Error loading history:", error.message);
      gameHistoryList.innerHTML = `<li>Error loading history: ${error.message}</li>`;
    }
  }

  loadGameHistoryBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      alert("Please log in to view your match history.");
      return;
    }

    // Toggle the visibility of the match history section
    if (gameHistoryList.style.display === "none" || gameHistoryList.style.display === "") {

      // Fetch game history and show the list
      // await loadUserHistory(loggedInUserId);
      await updateHistoryUI(loggedInUserId);

      gameHistoryList.style.display = "block";
      loadGameHistoryBtn.textContent = "Hide Game History";
    } else {
      // Hide the game history list
      gameHistoryList.style.display = "none";
      loadGameHistoryBtn.textContent = "Load Game History";
    }
  });

  // 
  // 
  // Create references for the Privacy Settings elements
  const exportDataBtn = document.getElementById("exportDataBtn") as HTMLButtonElement;
  const anonymizeBtn = document.getElementById("anonymizeBtn") as HTMLButtonElement;
  const privacyResponse = document.getElementById("privacyResponse") as HTMLParagraphElement;

  // Event listener for data export (stub example)
  exportDataBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      privacyResponse.textContent = "❌ You must be logged in to export your data.";
      return;
    }
    try {
      // If you implement an export endpoint, call it here.
      const data = await api.exportUserData(loggedInUserId);
      // For example, convert data to JSON and trigger a download.
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my_data_export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      privacyResponse.textContent = "✅ Data export initiated.";
    } catch (error: any) {
      privacyResponse.textContent = `❌ Data export failed: ${error.message}`;
    }
  });

  // Event listener for permanent anonymization
  anonymizeBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      privacyResponse.textContent = "❌ You must be logged in to anonymize your data.";
      return;
    }
    // Confirm with the user before proceeding
    if (!confirm("WARNING: This action will permanently anonymize your account. You will lose your original login credentials. Proceed?")) {
      return;
    }
    try {
      const response = await api.anonymizeUser(loggedInUserId);
      privacyResponse.textContent = `✅ ${response.message}`;
      // Optionally force a logout and update UI since the account is now anonymized.
      loggedInUserId = null;
      loggedInUserStatus = null;
      logoutBtn.style.display = "none";
      deleteAccountBtn.style.display = "none";
      userInfo.style.display = "none";
      loginResponse.textContent = "Your account has been anonymized. Please register a new account if you wish to continue using the service.";
    } catch (error: any) {
      privacyResponse.textContent = `❌ Anonymization failed: ${error.message}`;
    }
  });

});
