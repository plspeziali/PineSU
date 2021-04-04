# Fortmatic Javascript SDK

Fortmatic JavaScript SDK lets developers conveniently connect their web apps to the Ethereum blockchain - allowing end-users to interact with their apps on any modern browser, without requiring them to download any browser extensions or mobile dApp browsers.

## Documentation

See the [Developer Documentation](https://docs.fortmatic.com).

## Installation

Integrating your app with Fortmatic will need our npm package:

```bash
# Via NPM:
npm install --save fortmatic

# Via Yarn:
yarn add fortmatic
```

Alternatively you can load via CDN with by adding a script tag to your app’s `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/fortmatic/dist/fortmatic.js"></script>
```

## Usage

Sign up or log in to the [Developer Dashboard](https://dashboard.fortmatic.com) to receive API keys that will allow your app to interact with the Ethereum blockchain through Fortmatic.

You can then integrate by simply replacing your web3 provider with Fortmatic provider. Now, instead of the MetaMask Chrome Extension opening, a Fortmatic modal will show instead—requiring no additional user downloads. Fortmatic works across all modern desktop, mobile Chrome, Safari and Firefox browsers.

```jspx
import Fortmatic from 'fortmatic';

// Create client and replace web3 provider
const fm = new Fortmatic('YOUR_API_KEY');
web3 = new Web3(fm.getProvider());

// Send transactions the way your are used to
web3.eth.sendTransaction({/* ... */});
```
