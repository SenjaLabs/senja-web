# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# LINE DApp Portal SDK Configuration
NEXT_PUBLIC_CLIENT_ID=your_channel_id_here
NEXT_PUBLIC_CHAIN_ID=8217
NEXT_PUBLIC_CHAIN_RPC_ENDPOINT=https://public-en.node.kaia.io

# LIFF Configuration (if using LIFF)
NEXT_PUBLIC_LIFF_ID=your_liff_id_here
```

## How to Get Your Channel ID

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider or select an existing one
3. Create a new channel (Mini App)
4. Go to the "Basic settings" tab
5. Copy the "Channel ID" - this is your `NEXT_PUBLIC_CLIENT_ID`

## Chain Configuration

- **Chain ID**: `8217` (Kaia mainnet)
- **RPC Endpoint**: `https://public-en.node.kaia.io` (default)

## Troubleshooting

### Error: "NEXT_PUBLIC_CLIENT_ID is not set"
- Make sure you have created a `.env.local` file
- Verify the environment variable name is exactly `NEXT_PUBLIC_CLIENT_ID`
- Restart your development server after adding environment variables

### Error: "POST https://metric.dappportal.io/api/v2/metric/wallet-activity 400"
- This error occurs when the SDK tries to send metrics but the Channel ID is invalid
- **Solution**: Make sure your `NEXT_PUBLIC_CLIENT_ID` is correct
- The SDK has been configured to disable metrics in development mode to prevent this error
- For production, ensure your Channel ID is properly configured in LINE Developer Console

### Error: "Request failed with status code 400"
- Verify your Client ID is correct
- Make sure your LINE channel is properly configured
- Check that your domain is whitelisted in LINE Developer Console

### Error: "no PRNG"
- This should be fixed with the crypto polyfills we added
- Make sure to restart your development server
- Clear your browser cache if the error persists

## Quick Setup Steps

1. **Create `.env.local` file**:
   ```bash
   touch .env.local
   ```

2. **Add your Channel ID**:
   ```bash
   echo "NEXT_PUBLIC_CLIENT_ID=your_actual_channel_id_here" >> .env.local
   ```

3. **Start development server**:
   ```bash
   # Using Turbopack (faster, default)
   pnpm dev
   
   # Using Webpack (more stable for complex polyfills)
   pnpm dev:webpack
   ```

## Production Considerations

- Make sure your domain is whitelisted in LINE Developer Console
- Use a valid Channel ID from a properly configured LINE channel
- Consider enabling metrics for production use by setting `enableMetrics: true` in the SDK configuration
