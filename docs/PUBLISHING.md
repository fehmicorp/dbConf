# Publishing `fc-dbconf_next`

This guide explains how to build, validate, and publish the package to npm.

## 1) Prerequisites

- Node.js 18+
- npm 9+
- An npm account with publish access to `fc-dbconf_next`
- `NPM_TOKEN` configured for CI/CD (optional but recommended)

## 2) Install dependencies

```bash
npm install
```

## 3) Build the package

```bash
npm run build
```

This compiles TypeScript sources from `src/` to `lib/` and emits declaration files.

## 4) Validate package contents

```bash
npm pack --dry-run
```

Use the dry-run output to confirm only expected files are included.

## 5) Publish manually

```bash
npm run publish:public
```

This script runs:

```bash
npm publish --access public
```

## 6) Versioning workflow

1. Update the version in `package.json`.
2. Rebuild and validate with `npm pack --dry-run`.
3. Commit and tag the release.
4. Publish.

## 7) Troubleshooting

- **E403 / permission error:** confirm package ownership and npm login.
- **2FA errors:** provide OTP when prompted by npm.
- **Unexpected files in tarball:** update `files` in `package.json`.
