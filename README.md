# React Native Wallet 🔷

Open source Ethereum wallet built with React Native and Expo, featuring biometric authentication and a glassmorphic design.

## ✨ Features

- **🔐 Secure Storage**: Private keys stored in iOS Keychain / Android Keystore with biometric protection
- **👆 Biometric Authentication**: Face ID, Touch ID, and device passcode support
- **💎 Glassmorphic Design**: Modern UI with semi-transparent cards and custom backgrounds
- **🌐 Polygon Network**: Built for POL (Polygon) transactions on mainnet, easily adaptable to other EVM networks, ETH, ARB, etc.
- **📤 Send Transactions**: Easy-to-use interface for sending POL to other wallets
- **💰 Real-time Balance**: Live balance updates from the blockchain
- **🔑 Wallet Management**: Export and restore wallets using private keys

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo SDK 53+** - Development and build toolchain
- **Ethers.js v6** - Ethereum/Polygon blockchain interaction
- **NativeWind v4** - Tailwind CSS for React Native
- **TypeScript** - Type-safe development
- **Expo Secure Store** - Secure key storage
- **Expo Local Authentication** - Biometric authentication

## 📱 Screenshots

The app features three main screens:
- **Wallet Screen**: View balance and manage wallet settings
- **Send Screen**: Send POL to other addresses
- **Transactions Screen**: View transaction history (coming soon)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ReactNativeWallet.git
cd ReactNativeWallet
```

2. Install dependencies:
```bash
npm install
```

3. Create API keys configuration:
```bash
# Create config/api-keys.ts (this file is gitignored)
cat > config/api-keys.ts << EOF
export const API_KEYS = {
  ANKR_API_KEY: 'your_ankr_api_key_here',
};
EOF
```

4. Start the development server:
```bash
npm start
# or
npx expo start
```

5. Run on your device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## 🏗️ Architecture

### Service Layer (OOP Design)

The app uses a modular service architecture with inheritance:

```
BaseService (Abstract)
├── AuthenticationService - Biometric/passcode authentication
├── StorageService - Secure storage operations
├── BlockchainService - Blockchain interactions
└── WalletManagerService - Orchestrates all wallet operations
```

### Key Components

- **GlassCard**: Glassmorphic card component with blur effects
- **Button**: Custom button with multiple variants
- **Input**: Styled input component with glass variant
- **Title**: Typography component with consistent styling

### Security Features

- Private keys never leave the device
- Biometric authentication required for sensitive operations
- Secure storage using platform-specific keychains
- No telemetry or analytics tracking

## 🎨 Design System

The app features a custom glassmorphic design system:

- **Glass Cards**: Semi-transparent cards with backdrop blur
- **Monochrome Icons**: Geometric symbols (◈, ⬡, ⟠, etc.)
- **Custom Backgrounds**: Blurred and darkened images for each screen
- **White Text Theme**: Consistent white text for readability

## 📦 Project Structure

```
ReactNativeWallet/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Wallet/Home screen
│   │   ├── send.tsx       # Send transaction screen
│   │   └── transactions.tsx # Transaction history
│   └── _layout.tsx        # Root layout
├── services/              # Business logic services
│   ├── base/             # Base service classes
│   ├── AuthenticationService.ts
│   ├── StorageService.ts
│   ├── BlockchainService.ts
│   └── WalletManagerService.ts
├── components/            # Reusable UI components
│   └── ui/               # Design system components
├── contexts/             # React contexts
│   └── WalletContext.tsx
├── config/               # Configuration files
│   ├── rpc-endpoints.ts
│   └── api-keys.ts      # (gitignored)
└── assets/               # Images and fonts
    └── images/           # Background images
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run lint` - Run ESLint

### Environment Configuration

The app uses the following environment configurations:
- **Network**: Polygon Mainnet (Chain ID: 137)
- **RPC Provider**: Ankr (requires API key)
- **Native Token**: POL

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🔐 Security Considerations

- **Never commit API keys** - Use gitignored config files
- **Private key management** - Keys are encrypted in secure storage
- **Biometric protection** - Required for wallet access
- **Network security** - HTTPS only for RPC connections

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This is a demonstration wallet application. Always conduct thorough security audits before using in production with real funds.

## 📞 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using React Native and Expo
