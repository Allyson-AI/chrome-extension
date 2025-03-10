# Allyson - AI Web Agent Chrome Extension

![Allyson Logo](https://allyson.ai/allyson-og.png)

Allyson is an AI web agent that handles online tasks for you. It can navigate websites, fill forms, collect data, manage files, and perform various web-based operations with persistence through S3 storage.

## 🚀 Features

- AI-powered web agent capabilities
- Session management for web interactions
- Secure authentication with Clerk
- Cookie management for web sessions
- Modern, responsive UI

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm
- A Clerk account for authentication

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/allyson-chrome-extension.git
   cd allyson-chrome-extension
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy the example environment files and fill in your credentials:
     ```bash
     cp example.env.development .env.development
     cp exmaple.env.production .env.production
     cp example.env.chrome .env.chrome
     ```

4. Configure your environment variables:
   - `.env.development` and `.env.production`:
     - `PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
     - `CLERK_FRONTEND_API`: Your Clerk frontend API endpoint
     - `PLASMO_PUBLIC_API_URL`: Your API URL
     - `PLASMO_PUBLIC_CLERK_SYNC_HOST`: Your Clerk sync host

   - `.env.chrome`:
     - `CRX_PUBLIC_KEY`: Your Chrome extension public key
     - `CRX_ID`: Your Chrome extension ID

## 🏗️ Development

To start the development server:

```bash
pnpm dev
```

This will start the Plasmo development server and load the extension in development mode.

## 🔨 Building for Production

To build the extension for production:

```bash
pnpm build
```

For specific browser targets:

```bash
# Firefox
pnpm build:firefox

# Brave
pnpm build:brave

# Edge
pnpm build:edge

# Opera
pnpm build:opera
```

## 📦 Packaging

To package the extension for distribution:

```bash
pnpm package
```

For Firefox:

```bash
pnpm package:firefox
```

## 🔑 Chrome Web Store Submission

To submit your extension to the Chrome Web Store, you'll need to:

1. Generate a `keys.json` file with your Google API credentials:
   - Visit the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Chrome Web Store API
   - Create OAuth credentials (client ID and client secret)
   - Generate a refresh token

2. Format your `keys.json` file as follows:
   ```json
   {
     "$schema": "https://raw.githubusercontent.com/PlasmoHQ/bpp/v3/keys.schema.json",
     "chrome": {
       "clientId": "YOUR_CLIENT_ID",
       "clientSecret": "YOUR_CLIENT_SECRET",
       "refreshToken": "YOUR_REFRESH_TOKEN",
       "extId": "YOUR_EXTENSION_ID"
     }
   }
   ```

3. For more detailed instructions on submitting to the Chrome Web Store, refer to the [Plasmo documentation](https://docs.plasmo.com/framework/workflows/submit).

## 🔐 CRX Private Key

For Chrome extension packaging, you'll need a private key file (`crx.pem`). If you're creating a new extension:

1. Plasmo will automatically generate this file during the first build
2. Keep this file secure and don't commit it to your repository

If you're working with an existing extension, you'll need to obtain the original private key file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE). This means if you use this software as part of a service you offer to others, you must make the complete source code available to the users of that service under the same license.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes between versions.
