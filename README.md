# ASKANI KAASHIDHOO — Dhauraa & Dharus Records

Dhivehi (RTL) site listing the NGO's dhauraa (ދައުރާ) and dharus (ދަރުސް).

- Public site: `index.html`
- Admin panel: `admin.html` — add, edit and delete records (login required)
- Records are stored in Supabase. Until `config.js` is filled in, the public site shows the samples in `data/records.json`.

## Supabase setup (one time)

1. Create a free project at https://supabase.com.
2. **SQL Editor → New query**: paste `supabase/setup.sql`, change `YOUR-EMAIL@example.com` on the last line to the admin's email, and click **Run**.
3. **Authentication → Users → Add user → Create new user**: same email, choose a password, tick **Auto Confirm User**.
4. **Authentication → Sign In / Providers**: turn off **Allow new users to sign up**.
5. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key** into `config.js`.

### Adding another admin

1. Authentication → Users → Add user (with Auto Confirm).
2. SQL Editor: `insert into public.admins (email) values ('their@email.com');`

### Password-protecting the site later

Records are readable by everyone right now. The `"Anyone can read records"` policy in `supabase/setup.sql` is what to change.

## Record fields

| Field | Required | Notes |
|---|---|---|
| type | ✓ | `dhauraa` or `dharus` |
| title | ✓ | |
| date | ✓ | |
| arabic | | Shown without harakat |
| time, place, speaker, topic, participants, description, notes | | |

## Fonts

- Thaana: MV Funa (Regular, Bold) and MV Funa Black for headings — in `fonts/`
- Arabic: Sakkal Majalla — in `fonts/` (Amiri from Google Fonts as fallback)
