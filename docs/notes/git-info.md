
# Git Info

## Fixing a push of files that were to be ignored..

### 1. Ensure `.gitignore` Correctly Ignores All Instances

Modify your `.gitignore` so that it ignores all occurrences of `node_modules/`:
```plaintext
# Ignore all node_modules folders in any subdirectory
node_modules/
```
This will ignore:
- `node_modules/`
- `backend/node_modules/`
- `frontend/node_modules/`
- `any_folder/node_modules/`

Also, check if other directories need similar treatment (e.g., `dist/`, `build/`).

### 2. Remove Already Tracked Instances of These Files

Since these files were **already committed**, Git is still tracking them. \
We need to **remove them from tracking** while keeping them locally.

Run:
```bash
git rm -r --cached backend/node_modules frontend/node_modules
```
> **The `--cached` flag removes them from Git but keeps them on your system.**\
> (Will display removed files if line is valid)

Now commit the removal:
```bash
git commit -m "Remove ignored files from tracking"
```

### 3. Push the Fixed Version (Force Push Required)

Since the files were already pushed to GitHub, we need to **overwrite** the incorrect commit history:
```bash
git push --force
```
This forces GitHub to match your local branch exactly, removing all the mistakenly committed files.

### 4. Verify the Fix

1️⃣ Check GitHub: The unwanted files should no longer be in the repo.\
2️⃣ Confirm .gitignore is Working: Run:
```bash
git status
```
- If it works, node_modules/ should no longer appear as a tracked file.
- If they do, there may be an issue with your .gitignore syntax.

> [!TIP]
> Always check `.gitignore` before committing.
```bash
git check-ignore -v backend/node_modules/
```
> If the output is empty, .gitignore isn't correctly ignoring the file.

---

## Understanding Git Rebase

### When to Use `git rebase` Instead of Merge**

- Use rebase when you want a clean history without extra merge commits.
- Use merge when you want to preserve exact commits from a feature branch.

### How to Rebase Instead of Merging

1. Switch to your feature branch:
```bash
git checkout feature-branch
```

2. Rebase it onto `main`:
```bash
git rebase main
```

This **moves your branch’s commits on top of `main`**, making history cleaner.
- If new commits exist in `main`, your feature branch **adopts them** first.
- It avoids merge commits, keeping history **linear**.

3. Resolve conflicts if needed.

4. Push with `--force` (only if required):
```bash
git push --force
```

**Benefit**: This moves your commits to the top of `main`, as if they were created after the latest commit.

### Interactive Rebase (`git rebase -i HEAD~3`)

> Instead of lots of "small commits", **squash commits together** before merging

Interactive rebase (`-i`) allows you to **edit, squash, or reorder commits** before finalizing them.

Example:\
Say you have **3 recent commits**:
```plaintext
commit A - "Fixed a typo"
commit B - "Added login"
commit C - "Improved error handling"
```
Run:
```bash
git rebase -i HEAD~3
```

It opens a text editor with:
```plaintext
pick A Fixed a typo
pick B Added login
pick C Improved error handling
```

#### Actions You Can Do:
- `pick` → Keep commit as is.
- `squash (s)` → Merge commits together.
- `edit (e)` → Modify the commit message.
- `reword (r)` → Change only the commit message.

If you want to squash commits A & B together:
```plaintext
pick A Fixed a typo
squash B Added login
pick C Improved error handling
```
After saving, Git **merges A & B into one commit**, cleaning up your history.

#### Why use Interactive Rebase?

- **Squash unnecessary commits** (`fix typo`, `debug`, etc.) before merging.
- **Reword commit messages** to follow the best format.
- **Rearrange commits** if needed.

#### What to Do After an Interactive Rebase?

After running `git rebase -i`, the history **only changes locally**, so **you must push the changes**.

**If You Haven't Pushed the Commits Before (Safe Case)**\
If the commits you rebased were **only local** (never pushed before), you can **push normally**:
```bash
git push origin feature-branch
```
**If You Already Pushed Before (Requires Force Push)**\
Since rebasing **rewrites commit history**, the remote repository will reject a normal push. \
You must **force push**:
```bash
git push --force
```
or safer:
```bash
git push --force-with-lease
```
> [!TIP] `--force-with-lease` **only overwrites if no one else has pushed changes** in the meantime.

> **rebase does not replace push**. It **modifies your commit history**, and after rebasing, you still **need to push**.

---

## Best Practices for Commit Message Format

**Format**
```bash
type(scope): short description

Longer explanation if necessary.

Fixes #issue-number
```

### Types

- `feat` → New feature
- `fix` → Bug fix
- `docs` → Documentation updates
- `refactor` → Code refactoring (no functional changes)
- `test` → Adding tests
- `chore` → Maintenance tasks (e.g., updating dependencies)

Example:
```bash
git commit -m "feat(auth): Implement OAuth login

Added support for Google and GitHub OAuth authentication.

Fixes #45"
```

---

## Deleting Branches

**Locally (on your machine):**
```bash
git branch -d feature-branch  # Safe delete (only if merged)
git branch -D feature-branch  # Force delete (even if unmerged)
```

**On GitHub (remote):**
```bash
git branch -d feature-branch  # Safe delete (only if merged)
git branch -D feature-branch  # Force delete (even if unmerged)
```

> [!TIP] After merging a PR, GitHub even gives an option to "Delete Branch" automatically.


---

## To Check

### Do a Pull Request from the Command Line

Usig **GitHub CLI**:
```bash
gh pr create --base main --head feature-branch --title "New Feature" --body "Description of the changes"
```
Instal **GitHub CLI**: [GitHub CLI Documentation](https://cli.github.com/)

---

### How to Integrate GitHub with Discord for Notifications?

To automatically send notifications (like new PRs, issues, or commits) to a **Discord server**, follow these steps:

#### Step 1: Create a Webhook on Discord

- Open **Discord** and go to **Server Settings**.
- Click on **"Integrations"** → **"Create Webhook"**.
- Name it **GitHub Notifications**.
- Copy the **Webhook URL**.

#### Step 2: Add the Webhook to GitHub

- Open your **GitHub repository**.
- Go to **Settings** → **Webhooks** → **"Add webhook"**.
- In the **Payload URL**, paste the **Discord Webhook URL**.
- Set **Content type** to `application/json`.
- In **"Which events would you like to trigger this webhook?"**, choose:
	- `Pull Requests`
	- `Pushes`
	- `Issues`
	- Or select **"Send me everything"** for all activity.
- Click **"Add Webhook"**.

✅ Now, GitHub will send updates to the Discord server!

### 🚀 Extra: GitHub Discord Bot (Advanced)

If you need more control (e.g., triggering builds, fetching PRs, running commands):

- Use a bot like **GitHub Actions** → **Discord Notifications**.
- Install **OctoBot** or use a **Discord bot that fetches GitHub updates**.

---
