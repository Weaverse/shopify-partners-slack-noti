# Shopify Partners Slack Notifications

This project is a Cloudflare worker designed to send notifications to Slack regarding Shopify Partner events such as app installation, uninstallation, subscription, and unsubscription.

## Features

- Fetches events from Shopify Partners API.
- Sends event notifications to a specified Slack channel.
- Deployed to Cloudflare Workers and utilizes Cron Triggers for scheduling.

## Prerequisites

- A Shopify Partner account and access to the Shopify Partners API.
- A Slack workspace and a webhook URL for posting messages to a channel.
- Cloudflare account with Workers enabled.
- Node.js and npm installed on your machine.

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Weaverse/shopify-partners-slack-noti.git
   cd shopify-partners-slack-noti
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Wrangler**:

   - Install Wrangler CLI globally (if you haven't already):
     ```bash
     npm install -g wrangler
     ```
   - Configure your Cloudflare account:
     ```bash
     wrangler config
     ```

4. **Set Up Secrets**:

   - Run the following commands to create and upload secrets to Cloudflare:

     ```bash
     wrangler secret put SHOPIFY_PARTNER_API_TOKEN
     # Enter the value for SHOPIFY_PARTNER_API_TOKEN when prompted

     wrangler secret put SHOPIFY_PARTNER_ID
     # Enter the value for SHOPIFY_PARTNER_ID when prompted

     wrangler secret put SHOPIFY_APP_ID
     # Enter the value for SHOPIFY_APP_ID when prompted

     wrangler secret put SLACK_WEBHOOK_URL
     # Enter the value for SLACK_WEBHOOK_URL when prompted
     ```

5. **Modify Scheduling (Optional)**:

   - The current configuration schedules the worker to run every 10 minutes. To modify this, update the `crons` field in the `triggers` section of `wrangler.toml`:
     ```toml
     [triggers]
       crons = ["*/10 * * * *"]  # Change this to your preferred schedule
     ```

6. **Local Development**:

   - To test the worker locally, run:
     ```bash
     wrangler dev
     ```

7. **Deploy to Cloudflare**:
   - To deploy the worker to Cloudflare, you can use either of the following commands:
     ```bash
     wrangler deploy
     # or
     npm run deploy
     ```

## Usage

Once deployed, the worker will check for new events from the Shopify API at the scheduled intervals and send notifications to the configured Slack channel.

## Contributing

Feel free to submit issues and/or pull requests, whether it's for bug fixes, improvements, or new feature requests.

## License

This project is open source under the MIT license.
