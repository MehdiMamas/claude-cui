# Claude CUI

A small desktop companion for Claude. Click editable prompt buttons to append text to a draft, then copy and paste it into Claude Code, the Claude desktop app, or the Claude website. It does not run Claude, submit prompts, modify Claude, or require API credentials.

The initial Explain, Review, and Test buttons are examples. Use **Edit buttons** to remove them and add your own names and text. Drafts and buttons are saved locally in the app's profile. **Keep on top** lets the window stay beside your existing workflow.

## Develop

Requires Node.js 24 or later and a graphical desktop.

```sh
npm ci
npm start
```

Run `npm test` for UI tests and `npm pack --dry-run` to inspect the npm package. The package exposes the `claude-cui` command. Until published, install a local tarball with `npm install -g ./claude-cui-0.1.0.tgz` after `npm pack`. No npm publication has been performed.

## Desktop installers

Run `npm run dist:linux`, `npm run dist:mac`, or `npm run dist:win` on the corresponding OS. Output is placed in `dist/`. Configured formats are AppImage, deb, and rpm for Linux; dmg and zip for macOS; NSIS and portable executable for Windows. Public distribution on macOS and Windows should use signing credentials supplied through the build environment.

The Linux x64 AppImage was built in the cloud environment. These other targets are configured, not a claim that every platform has been tested. Linux requires desktop libraries supported by Electron; minimal/headless systems and arbitrary distributions are not guaranteed. Electron supports mainstream modern Linux, macOS, and Windows, with support dependent on its current requirements. Installers must be built and tested on each intended OS and CPU architecture before release. A GitHub Actions workflow checks tests and unpacked builds on all three operating systems once pushed; it has not been run here.

## Cloud development

Use `npm --cache /workspace/.npm-cache ci` if the home-directory cache is not writable. For headless GUI validation, use an X server such as Xvfb. Keep Chromium's sandbox enabled. Use the existing isolated checkout; no extra Git worktree is required.

The cloud container cannot provide Chromium's required sandbox, so live Electron startup is blocked here. UI behavior is covered by four DOM tests; a real desktop smoke check remains required. On Linux desktops without unprivileged user namespaces, consult Electron/Chromium's supported sandbox configuration for your distribution rather than disabling the sandbox.

This is an independent companion, not an official Anthropic product.

## Publish to npm

The package name is `claude-cui`; its availability was checked but is not reserved. The initial release requires an npm account with publishing permission. On your own computer, after cloning this repository and installing Node.js 24+, run:

```sh
npm ci
npm test
npm login
npm publish --access public
```

Complete npm's browser sign-in and two-factor authentication if prompted. Never put an npm token in repository files or send it in chat. Once published, users can launch it with `npx claude-cui` or install it with `npm install -g claude-cui` and run `claude-cui`.

For future releases, configure a **Trusted Publisher** in the npm package settings: GitHub owner `MehdiMamas`, repository `claude-cui`, workflow filename `npm-publish.yml`, and no environment name. This permits the manual **Publish to npm** GitHub Actions workflow to publish with OIDC, without a stored npm token. Trusted publishing requires a supported npm CLI (11.5.1+); Node.js 24 includes a compatible version. Configure trust after the first manual publication. Before another release, update the version with `npm version patch`, push the commit and tag, then run **Publish to npm** from `main`. Versions cannot be republished. Provenance publishing also requires a public GitHub repository and public package.

The manual **Build desktop installers** workflow creates downloadable Actions artifacts for Linux x64, macOS Intel/Apple Silicon, and Windows x64. These builds are unsigned. macOS and Windows may display security prompts; signing and macOS notarization are separate release setup steps. ARM Linux and Windows installers are not yet configured.
