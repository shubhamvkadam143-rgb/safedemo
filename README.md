# SafeHaven Mesh SMS Demo

This is a local demonstration project. It simulates OTP verification, SOS alerts, family contact notifications, and location links. **It does not send real SMS messages or contact emergency services.**

## Requirements
- Node.js LTS
- VS Code (optional)

## Run on Windows
1. Extract this ZIP file.
2. Open the extracted `safehaven-mesh-sms-demo` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:
   ```bash
   npm install
   npm start
   ```
5. Open http://localhost:5000 in Chrome.
6. Allow location access when testing the demo SOS feature.

## Demo features
- Generate a temporary demo OTP (shown on screen, not sent by SMS).
- Verify the demo OTP.
- Create simulated SOS alerts for up to five Indian mobile numbers.
- Attach a Google Maps link using browser location permission.
- View in-memory demo history (cleared when the server restarts).

## Important
This is not production-ready and must not be relied on for emergencies. Real SMS requires an SMS provider account, approved templates/sender setup where applicable, backend authentication, user consent, delivery-status handling, and security review. Never expose provider API keys in frontend code.
