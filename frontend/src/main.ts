// File: frontend/src/main.ts

import { API, UserStatus, PublicUser } from "./api";
import { setupToggleLoginRegister } from "./toggle";
import { setupDarkMode } from "./darkMode";
import { addGameToHistory, updateHistoryUI } from "./history";
import { addGameToStats, updateStatsUI } from "./stats";
import { clearFields } from "./utils";

// const api = new API("https://localhost:3000");
const api = new API("");

document.addEventListener("DOMContentLoaded", () => {

  // =================================================
  // Global State & Element References
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

  // 2FA UI
  const twoFactorSection = document.getElementById("twoFactorSection") as HTMLDivElement;
  const setup2FABtn = document.getElementById("setup2FABtn") as HTMLButtonElement;
  const qrCodeImg = document.getElementById("qrCodeImg") as HTMLImageElement;
  const twoFactorResponse = document.getElementById("twoFactorResponse") as HTMLParagraphElement;

  const setup2FACode = document.getElementById("setup2FACode") as HTMLInputElement;
  const confirm2FASetupBtn = document.getElementById("confirm2FASetupBtn") as HTMLButtonElement;
  const setup2FAResponse = document.getElementById("setup2FAResponse") as HTMLParagraphElement;

  const login2FACode = document.getElementById("login2FACode") as HTMLInputElement;
  const verify2FAForLoginBtn = document.getElementById("verify2FAForLoginBtn") as HTMLButtonElement;
  const login2FAResponse = document.getElementById("login2FAResponse") as HTMLParagraphElement;

  const disable2FABtn = document.getElementById("disable2FABtn") as HTMLButtonElement;
  const disable2FAResponse = document.getElementById("disable2FAResponse") as HTMLParagraphElement;

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

  // Helper functions
  async function clearAllInputFields() {
    clearFields(
      regUsername,
      regEmail,
      regPassword,
      loginIdentifier,
      loginPassword,
      avatarInput,
      friendSearchInput,
      newUsername,
      newEmail,
      oldPasswordInput,
      newPasswordInput
    );
  };

  // =================================================
  // Authentication & User Info Functions
  // =================================================

  // Fetch & display user info
  async function fetchUserInfo(userId: number) {
    try {
      const user = await api.getUser(userId);
      console.log("User info:", user); // debug
      userIdElem.textContent = user.id.toString();
      userNameElem.textContent = user.username;
      userEmailElem.textContent = user.email;
      userStatusElem.textContent = user.status;

      // show 2FA section now that user is logged in
      twoFactorSection.style.display = "block";

      // Show/hide 2FA buttons depending on user's 2FA status
      if (user.isTwoFactorEnabled) {
        // Hide the setup section and show the disable section
        hideTwoFactorSetup();
        showTwoFactorDisable();
        hideQRAndConfirm();
        hideTwoFactorLogin();
      } else {
        // When not enabled, show the setup section and hide the disable section
        showTwoFactorSetup();
        hideTwoFactorDisable();
      }

      // Possibly update avatar, stats, friends, etc.
      await updateAvatarDisplay(user.avatar);
      await updateStatsUI(userId);
      fetchFriendList(userId);

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
    avatarImg.src = avatarUrl ? avatarUrl : "/avatars/default/default_cat.webp";
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

  /**
 * Creates a friend list item (<li>) for a given user.
 * @param user - The PublicUser object.
 * @param buttonFactory - Optional callback that receives the user object and returns an HTMLElement (e.g., a button).
 * @returns An <li> element representing the friend.
 */
  function createFriendListItem(
    user: PublicUser,
    buttonFactory?: (user: PublicUser) => HTMLElement
  ): HTMLLIElement {
    const li = document.createElement("li");
    li.classList.add("friend-item"); // CSS will style layout

    // Create avatar image element.
    const avatarIcon = document.createElement("img");
    avatarIcon.classList.add("friend-avatar");
    // Use the user's avatar if available, otherwise fallback.
    avatarIcon.src = user.avatar ? user.avatar : "/avatars/default/default_cat.webp";
    avatarIcon.alt = `${user.username}'s avatar`;

    // Create a span element with user details.
    const details = document.createElement("span");
    details.textContent = `ID: ${user.id} - ${user.username} (${user.status})`;

    li.appendChild(avatarIcon);
    li.appendChild(details);

    // If a button factory is provided, call it and append the returned element.
    if (buttonFactory) {
      const btn = buttonFactory(user);
      li.appendChild(btn);
    }
    return li;
  }

  function createAddFriendButton(user: PublicUser): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = "Add Friend";
    btn.addEventListener("click", async () => {
      if (!loggedInUserId) return;
      try {
        const res = await api.addFriend(loggedInUserId, user.id);
        alert(res.message);
        // Optionally refresh friend list after adding friend.
        await fetchFriendList(loggedInUserId);
      } catch (error: any) {
        alert(`Error adding friend: ${error.message}`);
      }
    });
    return btn;
  }

  function createRemoveFriendButton(user: PublicUser): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.classList.add("danger-btn");
    btn.addEventListener("click", async () => {
      if (!loggedInUserId) return;
      try {
        const res = await api.removeFriend(loggedInUserId, user.id);
        alert(res.message);
        // Refresh friend list after removal.
        await fetchFriendList(loggedInUserId);
      } catch (error: any) {
        alert(`Error removing friend: ${error.message}`);
      }
    });
    return btn;
  }

  async function fetchFriendList(userId: number) {
    try {
      const friends = await api.getFriends(userId);
      friendList.innerHTML = "";
      if (friends.length === 0) {
        friendList.innerHTML = "<li>You have no friends yet.</li>";
      } else {
        friends.forEach(friend => {
          // Pass the remove friend button factory.
          friendList.appendChild(createFriendListItem(friend, createRemoveFriendButton));
        });
      }
    } catch (error: any) {
      friendList.innerHTML = `<li>Error fetching friends: ${error.message}</li>`;
    }
  }

  // async function fetchFriendList(userId: number) {
  //   try {
  //     const friends = await api.getFriends(userId);
  //     friendList.innerHTML = "";
  //     if (friends.length === 0) {
  //       friendList.innerHTML = "<li>You have no friends yet.</li>";
  //     } else {
  //       friends.forEach(friend => {
  //         const li = document.createElement("li");
  //         li.classList.add("friend-item"); // apply the layout styles

  //         // Create an image element for the avatar icon
  //         const avatarIcon = document.createElement("img");
  //         avatarIcon.classList.add("friend-avatar"); // apply the styling class
  //         avatarIcon.src = friend.avatar ? friend.avatar : "/default-avatars/default_cat.webp";
  //         avatarIcon.alt = `${friend.username}'s avatar`;

  //         // Create a span for the friend's text details
  //         const details = document.createElement("span");
  //         details.textContent = `ID: ${friend.id} - ${friend.username} (${friend.status})`;

  //         li.appendChild(avatarIcon);
  //         li.appendChild(details);

  //         // Create a button to remove friend
  //         const removeBtn = document.createElement("button");
  //         removeBtn.textContent = "Remove";
  //         removeBtn.classList.add("danger-btn");
  //         removeBtn.addEventListener("click", async () => {
  //           try {
  //             const res = await api.removeFriend(userId, friend.id);
  //             alert(res.message);

  //             // Refresh friend list (and optionally search results)
  //             await fetchFriendList(userId);
  //           } catch (error: any) {
  //             alert(`Error removing friend: ${error.message}`);
  //           }
  //         });
  //         li.appendChild(removeBtn);
  //         friendList.appendChild(li);
  //       });
  //     }
  //   } catch (error: any) {
  //     friendList.innerHTML = `<li>Error fetching friends: ${error.message}</li>`;
  //   }
  // }

  // Function to search users by username or email using the getUsers() endpoint
  async function searchUsers(query: string): Promise<PublicUser[]> {
    try {

      // Get all users
      const users = await api.getUsers();

      // Filter out the logged-in user and any whose username or email doesn't include the query (case insensitive)
      return users.filter(user => {
        if (loggedInUserId && user.id === loggedInUserId) return false;
        if (user.status === "anonymized") return false; // Exclude anonymized users
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


  // // Event listener for the friend search button
  // friendSearchBtn.addEventListener("click", async () => {

  //   const query = friendSearchInput.value.trim();
  //   if (!query) {
  //     alert("Please enter a search term.");
  //     return;
  //   }

  //   const results = await searchUsers(query);
  //   friendSearchResults.innerHTML = "";
  //   if (results.length === 0) {
  //     friendSearchResults.innerHTML = "<li>No matching users found.</li>";
  //   } else {
  //     results.forEach(user => {
  //       const listItem = document.createElement("li");
  //       listItem.classList.add("friend-item"); // apply the layout styles

  //       // Create an image for the avatar
  //       const avatarIcon = document.createElement("img");
  //       avatarIcon.classList.add("friend-avatar"); // apply the styling class
  //       avatarIcon.src = user.avatar ? user.avatar : "/default-avatars/default_cat.webp";
  //       avatarIcon.alt = `${user.username}'s avatar`;
  //       avatarIcon.width = 30;
  //       avatarIcon.height = 30;
  //       avatarIcon.style.borderRadius = "50%";
  //       avatarIcon.style.marginRight = "10px";

  //       // Create a span for the user details
  //       const details = document.createElement("span");
  //       details.textContent = `ID: ${user.id} - ${user.username} (${user.email})`;

  //       listItem.appendChild(avatarIcon);
  //       listItem.appendChild(details);

  //       // Button to add friend
  //       const addBtn = document.createElement("button");
  //       addBtn.textContent = "Add Friend";
  //       addBtn.addEventListener("click", async () => {
  //         if (!loggedInUserId) return;
  //         try {
  //           const res = await api.addFriend(loggedInUserId, user.id);
  //           alert(res.message);

  //           // Refresh the friend list after adding
  //           await fetchFriendList(loggedInUserId);
  //         } catch (error: any) {
  //           alert(`Error adding friend: ${error.message}`);
  //         }
  //       });
  //       listItem.appendChild(addBtn);
  //       friendSearchResults.appendChild(listItem);
  //     });
  //   }
  // });

  friendSearchBtn.addEventListener("click", async () => {
    const query = friendSearchInput.value.trim();
    if (!query) {
      alert("Please enter a search term.");
      return;
    }
    try {
      const results = await searchUsers(query);
      friendSearchResults.innerHTML = "";
      if (results.length === 0) {
        friendSearchResults.innerHTML = "<li>No matching users found.</li>";
      } else {
        results.forEach(user => {
          // Pass the add friend button factory.
          const listItem = createFriendListItem(user, createAddFriendButton);
          friendSearchResults.appendChild(listItem);
        });
      }
    } catch (error: any) {
      alert(`Error searching users: ${error.message}`);
    }
  });

  // =================================================
  // Authentication Event Listeners
  // =================================================

  // ================================================
  // Registration Handler
  // ================================================
  registerBtn.addEventListener("click", async () => {
    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;

    if (!username || !email || !password) {
      registerResponse.textContent = "❌ Please fill all fields.";
      return;
    }

    try {
      const newUser = await api.registerUser({ username, email, password });
      registerResponse.textContent = `✅ Registration successful. Your ID: ${newUser.id}`;

      // Optionally clear fields, refresh user list, etc.
      await fetchUsers();
      // clearAllInputFields();

      clearFields(regUsername, regEmail, regPassword);
    } catch (error: any) {
      registerResponse.textContent = `❌ Registration failed: ${error.message}`;
    }
  });

  // Login
  // loginBtn.addEventListener("click", async () => {
  //   const identifier = loginIdentifier.value;
  //   const password = loginPassword.value;
  //   if (!identifier || !password) {
  //     loginResponse.textContent = "❌ Please enter username/email and password.";
  //     return;
  //   }
  //   if (loggedInUserStatus === "online") {
  //     loginResponse.textContent = "✅ Already logged in.";
  //     return;
  //   }
  //   try {
  //     const response = await api.loginUser({ identifier, password });
  //     loggedInUserId = response.user.id;
  //     loggedInUserStatus = response.user.status;
  //     loginResponse.textContent = `✅ Login successful: Hi, ${response.user.username}`;
  //     logoutBtn.style.display = "block";
  //     deleteAccountBtn.style.display = "block";
  //     userInfo.style.display = "block";
  //     await fetchUserInfo(loggedInUserId);
  //     await fetchUsers();
  //     await fetchFriendList(loggedInUserId);
  //     clearAllInputFields();
  //   } catch (error: any) {
  //     loginResponse.textContent = `❌ Login failed: ${error.message}`;
  //   }
  // });

  // ================================================
  // Login Handler (with 2FA support)
  // ================================================
  loginBtn.addEventListener("click", async () => {
    const identifier = loginIdentifier.value.trim();
    const password = loginPassword.value;
    if (!identifier || !password) {
      loginResponse.textContent = "❌ Missing username/email or password.";
      return;
    }

    try {
      // Attempt to login
      const response = await api.loginUser({
        identifier,
        password
        // twoFactorCode is omitted here; 
        // the backend will let us know if 2FA is required.
      });

      console.log("Login response:", response);

      // Check if 2FA is required
      // If the response indicates 2FA is required, show the modal
      if (response.requires2FA && response.user) {
        // Display 2FA code input for the user
        loggedInUserId = response.user.id; // Store user ID for subsequent 2FA verification
        loginResponse.textContent = "⚠️ 2FA Required. Please enter your 6-digit code.";
        // Remove the hidden class to display the modal
        document.getElementById("twoFactorLoginModal")!.classList.remove("hidden");
        // showTwoFactorLogin();
        return;
      }

      // If we get here, either 2FA is not required or not enabled
      if (response.user) {
        completeLogin(response.user);
      } else {
        throw new Error("No user data returned from login.");
      }
    } catch (error: any) {
      loginResponse.textContent = `❌ Login failed: ${error.message}`;
    }
  });

  // ================================================
  // Verify 2FA for Login
  // ================================================
  verify2FAForLoginBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      login2FAResponse.textContent = "❌ No user to verify.";
      return;
    }

    const code = login2FACode.value.trim();
    if (!code) {
      login2FAResponse.textContent = "❌ Enter the 2FA code."; // 6-digit code.";
      return;
    }

    try {
      // Call the verify2FA endpoint
      const verificationResponse = await api.verify2FA(loggedInUserId, code);

      // Store the token from verification in localStorage
      if (verificationResponse.token) {
        localStorage.setItem('token', verificationResponse.token);
      }

      // If verification succeeds, fetch the user again
      const user = await api.getUser(loggedInUserId);
      completeLogin(user);
      login2FAResponse.textContent = "✅ 2FA Verification succeeded!";
      // Hide the modal after success
      document.getElementById("twoFactorLoginModal")!.classList.add("hidden");
      // hideTwoFactorLogin();
    } catch (error: any) {
      login2FAResponse.textContent = `❌ 2FA Verification Failed: ${error.message}`;
    }
  });

  // ================================================
  // Logout
  // ================================================
  logoutBtn.addEventListener("click", async () => {
    if (!loggedInUserId) {
      logoutResponse.textContent = "❌ No user is logged in.";
      return;
    }
    try {
      const res = await api.logoutUser({ id: loggedInUserId });
      logoutResponse.textContent = `✅ ${res.message}`;

      // Reset global state
      loggedInUserId = null;
      loggedInUserStatus = null;

      // Hide the user info & 2FA
      userInfo.style.display = "none";

      // Hide buttons
      logoutBtn.style.display = "none";
      deleteAccountBtn.style.display = "none";

      // Clear the login inputs
      loginIdentifier.value = "";
      loginPassword.value = "";
      loginResponse.textContent = "🔓 Logged out.";
    } catch (error: any) {
      logoutResponse.textContent = `❌ Logout failed: ${error.message}`;
    }
  });

  // ================================================
  // Delete Account
  // ================================================
  deleteAccountBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;
    if (!confirm("Are you sure you want to delete your account?")) return;
    // if (!loggedInUserId || !confirm("⚠️ Delete your account?")) return;

    try {
      const response = await api.deleteUser(loggedInUserId);
      deleteResponse.textContent = `✅ Account deleted: ${response.message}`;

      // Reset everything
      loggedInUserId = null;
      loggedInUserStatus = null;
      userInfo.style.display = "none";
      logoutBtn.style.display = "none";
      deleteAccountBtn.style.display = "none";

      loginResponse.textContent = "🔓 Account deleted. You can register again.";

      await fetchUsers();
      clearAllInputFields();
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
      clearAllInputFields();
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
      clearAllInputFields();
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
      clearAllInputFields();
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
      case "anonymized":
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
    // const matchType = matchTypeInput.value as "1vs1" | "vs AI" | "Tournament";
    const matchType = matchTypeInput.value;
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
      // const didWin = matchResultStr.includes("Victoire");
      const didWin = matchResultStr.includes("Vict");
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
      const data = await api.exportUserData(loggedInUserId);
      // Convert data to JSON and trigger a download.
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
      clearAllInputFields();
      loginResponse.textContent = "Your account has been anonymized. Please register a new account if you wish to continue using the service.";
    } catch (error: any) {
      privacyResponse.textContent = `❌ Anonymization failed: ${error.message}`;
    }
  });

  // ================================================
  // Helper to fully “complete” login
  // so we can reuse after verifying 2FA
  // ================================================
  function completeLogin(user: PublicUser) {
    loggedInUserId = user.id;
    loggedInUserStatus = user.status;

    loginResponse.textContent = `✅ Welcome, ${user.username}`;

    // Show user info & logout/delete buttons
    userInfo.style.display = "block";
    logoutBtn.style.display = "block";
    deleteAccountBtn.style.display = "block";

    // Hide the 2FA modal if it is open
    document.getElementById("twoFactorLoginModal")!.classList.add("hidden");

    // Hide any 2FA elements (both login and setup)
    // hideAll2FASections();
    // hideTwoFactorLogin();
    // hideTwoFactorSetup();
    // hideQRAndConfirm();

    // Then fetch the user info, including 2FA status, stats, etc.
    fetchUserInfo(user.id);
  }

  // ================================================
  // 2FA UI Show/Hide Helpers
  // ================================================
  // function showLogin2FASection() {
  //   login2FACode.style.display = "block";
  //   verify2FAForLoginBtn.style.display = "block";
  //   login2FAResponse.textContent = "Enter the 6-digit code from your authenticator app.";
  // }
  // function hideLogin2FASection() {
  //   login2FACode.style.display = "none";
  //   verify2FAForLoginBtn.style.display = "none";
  //   login2FAResponse.textContent = "";
  //   login2FACode.value = "";
  // }
  // function showSetup2FASection() {
  //   setup2FACode.style.display = "block";
  //   confirm2FASetupBtn.style.display = "block";
  //   setup2FAResponse.textContent = "Enter the 6-digit code to confirm setup.";
  // }
  // function hideSetup2FASection() {
  //   setup2FACode.style.display = "none";
  //   confirm2FASetupBtn.style.display = "none";
  //   setup2FAResponse.textContent = "";
  //   setup2FACode.value = "";
  // }
  // function hideAll2FASections() {
  //   hideLogin2FASection();
  //   hideSetup2FASection();
  //   qrCodeImg.style.display = "none";
  //   twoFactorResponse.textContent = "";
  // }
  // function hideTwoFactorSection() {
  //   twoFactorSection.style.display = "none";
  //   hideAll2FASections();
  // }
  function showTwoFactorSetup() {
    (document.getElementById("twoFactorSetupSection") as HTMLDivElement).style.display = "block";
  }
  function hideTwoFactorSetup() {
    (document.getElementById("twoFactorSetupSection") as HTMLDivElement).style.display = "none";
  }

  function showQRAndConfirm() {
    (document.getElementById("qrAndConfirmContainer") as HTMLDivElement).style.display = "block";
  }
  function hideQRAndConfirm() {
    (document.getElementById("qrAndConfirmContainer") as HTMLDivElement).style.display = "none";
  }

  function showTwoFactorLogin() {
    (document.getElementById("twoFactorLoginSection") as HTMLDivElement).style.display = "block";
  }
  function hideTwoFactorLogin() {
    (document.getElementById("twoFactorLoginSection") as HTMLDivElement).style.display = "none";
  }

  function showTwoFactorDisable() {
    (document.getElementById("twoFactorDisableSection") as HTMLDivElement).style.display = "block";
  }
  function hideTwoFactorDisable() {
    (document.getElementById("twoFactorDisableSection") as HTMLDivElement).style.display = "none";
  }

  function hideAll2FASections() {
    hideTwoFactorSetup();
    hideQRAndConfirm();
    hideTwoFactorLogin();
    hideTwoFactorDisable();
  }

  // ================================================
  // Setup 2FA Flow
  // ================================================
  setup2FABtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;

    try {
      const res = await api.setup2FA(loggedInUserId);
      // Display the QR code for scanning
      qrCodeImg.src = res.qrCode;
      showQRAndConfirm();
      // qrCodeImg.style.display = "block";
      twoFactorResponse.textContent =
        "Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.";
    } catch (error: any) {
      twoFactorResponse.textContent = `❌ 2FA Setup Failed: ${error.message}`;
    }
  });

  // Confirm the 2FA setup by verifying the code
  confirm2FASetupBtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;

    const code = setup2FACode.value.trim();
    if (!code) {
      setup2FAResponse.textContent = "❌ Please enter the 6-digit code.";
      return;
    }

    try {
      await api.confirm2FASetup(loggedInUserId, code);
      setup2FAResponse.textContent = "✅ 2FA setup confirmed and enabled.";

      // Optionally keep the message for 3 seconds before hiding the UI
      setTimeout(async () => {
        hideQRAndConfirm();
        hideTwoFactorSetup();
        showTwoFactorDisable();
        fetchUserInfo(loggedInUserId!);
      }, 3000);

      // hideQRAndConfirm();
      // hideTwoFactorSetup();
      // showTwoFactorDisable();

      // Refresh user info to reflect that 2FA is now enabled
      await fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      setup2FAResponse.textContent = `❌ Setup Verification Failed: ${error.message}`;
    }
  });

  // Disable 2FA
  disable2FABtn.addEventListener("click", async () => {
    if (!loggedInUserId) return;

    try {
      const res = await api.disable2FA(loggedInUserId);
      disable2FAResponse.textContent = `✅ ${res.message}`;

      hideTwoFactorDisable();
      showTwoFactorSetup();

      // Refresh user info to reflect that 2FA is now disabled
      await fetchUserInfo(loggedInUserId);
    } catch (error: any) {
      disable2FAResponse.textContent = `❌ 2FA Disable Failed: ${error.message}`;
    }
  });



});
