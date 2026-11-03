# bloomline

A whimsical goals, to-do, habit and focus-timer app. Plain HTML, CSS and JavaScript (no build step), with
Supabase for sign in and private per-user data.

```
bloomline/
├─ index.html          page structure
├─ css/styles.css      all styling
├─ js/config.js        your Supabase URL + anon key (edit this)
├─ js/store.js         Supabase auth + cloud sync (falls back to local mode)
├─ js/app.js           app logic: goals, kanban, post-its, pomodoro, habits, analytics
├─ js/fx.js            floating bubbles and dandelions
├─ assets/             bg.jpg (background) and flower.png (logo + favicon)
└─ supabase/schema.sql database table + security rules
```

## 1. Set up Supabase (about 5 minutes)

1. Go to https://supabase.com, sign in, click **New project**, pick a name, region and database password.
2. Open **SQL Editor > New query**, paste everything from `supabase/schema.sql`, click **Run**.
   This creates the `user_state` table and the Row Level Security rules, so each user can only read and write their own data.
3. Open **Project Settings > API** and copy the **Project URL** and the **Publisher** key.
4. Paste them into `js/config.js`. (The anon key is meant to be public. Never use the `service_role` key here.)
5. Open **Authentication > Providers > Email** and choose whether to require email confirmation.
   Easiest for testing: turn "Confirm email" off. For real users, keep it on.
6. After you deploy (step 3 below), open **Authentication > URL Configuration** and set
   **Site URL** to your GitHub Pages address, e.g. `https://YOUR-USERNAME.github.io/bloomline/`.

## 2. Test on your computer

Open a terminal in the project folder and run:

    python3 -m http.server 8000

Then visit http://localhost:8000. (Opening index.html by double-clicking can break sign in, so use a local server.)
Create an account, add some tasks, then check **Table Editor > user_state** in Supabase: you will see one row for you.
Create a second account in another browser: it will not see the first account's data.

If `config.js` still has the placeholder values, the app runs in local mode and saves only in that browser.

## 3. Put it on GitHub and publish it free with GitHub Pages

1. Create a free account at https://github.com if you don't have one.
2. Click **+ > New repository**. Name it `bloomline`, keep it **Public** (free Pages needs public on free plans),
   and do NOT tick "Add a README". Click **Create repository**.
3. Install Git (https://git-scm.com/downloads) and, in a terminal inside the project folder, run:

       git init
       git add .
       git commit -m "Initial commit: bloomline"
       git branch -M main
       git remote add origin https://github.com/YOUR-USERNAME/bloomline.git
       git push -u origin main

   (When asked to sign in, use your GitHub username and a Personal Access Token as the password:
   GitHub > Settings > Developer settings > Personal access tokens. Or use GitHub Desktop instead.)
   No Git? On your repo page click **Add file > Upload files**, drag in all the files and folders, then **Commit changes**.
4. In the repo go to **Settings > Pages**. Under **Build and deployment**, set Source to
   **Deploy from a branch**, Branch **main**, folder **/ (root)**, and click **Save**.
5. Wait about a minute. Your site will be live at `https://YOUR-USERNAME.github.io/bloomline/`.
6. Add that address as the **Site URL** in Supabase (step 1.6 above).

To update the site later: edit files, then run `git add .`, `git commit -m "describe change"`, `git push`.

## Notes

- Privacy: each user's data lives in their own row and is protected by Row Level Security in the database itself,
  not just by the app. Anonymous visitors can read and write nothing.
- Syncing: changes are saved to the browser immediately and to Supabase about 1 second later.
  If you use two devices at once, the most recent save wins.
- Habit logs, tasks and notes are stored together as JSON in `user_state.data`. That is plenty for personal use.
  If you later want SQL analytics across many users, split habits and logs into their own tables.
