# Dev Hub + JWT setup for GitHub Actions (free Developer Edition)

This connects CI to a free Developer Edition Dev Hub using the JWT bearer flow through an **External Client App**. It uses no paid features. Do it once per Dev Hub, then set three secrets on each repo that runs scratch-org CI.

> **Why an External Client App and not a Connected App?** Since Spring '26, new Connected Apps can't be created unless Salesforce Support enables an org permission, and free Developer Edition orgs don't get Support. External Client Apps can't be replicated into a new scratch org during signup, so CI sets `SF_SCRATCH_SIGNUP_CONNECTED_APP=PlatformCLI` and `SF_SCRATCH_SIGNUP_CALLBACK_URL`. Signup then uses the built-in Salesforce CLI app. This is the official workaround in CLI 2.147.7 and later ([forcedotcom/cli#3515](https://github.com/forcedotcom/cli/issues/3515)).

## 1. Enable the Dev Hub

1. Log in to the Developer Edition org.
2. **Setup → Dev Hub**. Turn on **Enable Dev Hub**.
3. On the same page, turn on **Enable Unlocked Packages and Second-Generation Managed Packages**.

Both settings are permanent for the org.

## 2. Create a key pair (on your machine, outside every repo)

```bash
mkdir -p ~/secure/sf-ci && cd ~/secure/sf-ci
openssl req -x509 -sha256 -nodes -days 730 -newkey rsa:2048 \
  -keyout server.key -out server.crt -subj "/CN=github-actions-ci"
chmod 600 server.key
```

`server.crt` is uploaded to Salesforce. `server.key` goes only into a GitHub secret and your password manager, never into a repo.

## 3. Create the External Client App

1. **Setup → External Client App Manager → New External Client App.**
2. **Basic information:**
   - Name: `github-actions-ci`
   - Contact email: your email
   - Distribution state: **Local**
3. **API (Enable OAuth Settings)**: check **Enable OAuth**.
   - Callback URL: `http://localhost:1717/OauthRedirect`
   - OAuth scopes: **Manage user data via APIs (api)**, **Manage user data via Web browsers (web)**, **Perform requests at any time (refresh_token, offline_access)**
4. **Flow enablement**: check **Enable JWT Bearer Flow**, then upload `server.crt`.
5. **Security**: leave the defaults.
6. Click **Create**.

## 4. Pre-authorize the CI user

1. Open the app → **Policies** tab → **Edit**.
2. **OAuth Policies → Permitted Users:** choose **Admin approved users are pre-authorized**.
3. Under **Select Profiles**, add **System Administrator** (or a permission set assigned only to the CI user).
4. Save.

## 5. Copy the consumer key

**Settings** tab → **OAuth Settings → Consumer Key and Secret**. Salesforce emails a verification code. Copy the **Consumer Key** only; JWT doesn't need the secret.

## 6. Prove it works locally before touching GitHub

First check the CLI version: `sf --version` must be **2.147.7 or later**. Older versions silently ignore the `SF_SCRATCH_SIGNUP_*` variables, and signup fails with `C-1016` even though the JWT login succeeds. Upgrade with `brew upgrade sf` or `npm install -g @salesforce/cli@latest`, depending on how it was installed.

```bash
sf org login jwt \
  --client-id <CONSUMER_KEY> \
  --jwt-key-file ~/secure/sf-ci/server.key \
  --username <DEV_HUB_USERNAME> \
  --alias devhub \
  --set-default-dev-hub

SF_SCRATCH_SIGNUP_CONNECTED_APP=PlatformCLI \
SF_SCRATCH_SIGNUP_CALLBACK_URL=http://localhost:1717/OauthRedirect \
sf org create scratch --edition developer --duration-days 1 --alias jwt-smoke --wait 15

sf org delete scratch --target-org jwt-smoke --no-prompt
```

That uses one of your six daily scratch orgs. If login fails with `user hasn't approved this consumer`, the profile or permission set from step 4 is missing or the change hasn't propagated yet. Wait a few minutes and retry. If your org enforces a My Domain login, add `--instance-url https://<my-domain>.my.salesforce.com`.

## 7. Add the GitHub secrets (per repo)

```bash
cd <repo>
gh secret set SF_JWT_KEY < ~/secure/sf-ci/server.key
gh secret set SF_CONSUMER_KEY --body "<CONSUMER_KEY>"
gh secret set SF_DEVHUB_USERNAME --body "<DEV_HUB_USERNAME>"
```

Repeat for each repo that runs scratch-org CI. The username is stored as a secret too, so it never appears in workflow files or logs.

## 8. Rotation and cleanup

- The certificate in step 2 expires after 730 days. To rotate, generate a new pair, upload the new `server.crt` to the app, and update `SF_JWT_KEY` in each repo.
- Keep `server.key` in a password manager. Delete any other copies.
- To revoke CI access immediately, remove the profile or permission set from the app's policies, or delete the app.

## Budget reminder

A Developer Edition Dev Hub allows **3 active and 6 daily** scratch orgs (rolling 24 hours), and the same daily cap applies to package versions. The CI template creates scratch orgs only for non-draft PRs and pushes to `main`, cancels superseded runs, and deletes every org it creates.
