let SHOPIFY_PARTNER_API_TOKEN,
  SHOPIFY_PARTNER_ID,
  SHOPIFY_APP_ID,
  SLACK_WEBHOOK_URL;

// Function to initialize environment variables
const initializeEnvVariables = (env) => {
  SHOPIFY_PARTNER_API_TOKEN = env.SHOPIFY_PARTNER_API_TOKEN;
  SHOPIFY_PARTNER_ID = env.SHOPIFY_PARTNER_ID;
  SHOPIFY_APP_ID = env.SHOPIFY_APP_ID;
  SLACK_WEBHOOK_URL = env.SLACK_WEBHOOK_URL;
};
const query = `query ($start: DateTime!, $end: DateTime!, $after: String, $first: Int!, $appid: ID!) {
    app(id: $appid) {
      id
      name
      events(
        types: [SUBSCRIPTION_CHARGE_ACTIVATED, SUBSCRIPTION_CHARGE_CANCELED, SUBSCRIPTION_CHARGE_FROZEN, SUBSCRIPTION_CHARGE_UNFROZEN, RELATIONSHIP_INSTALLED, RELATIONSHIP_DEACTIVATED, RELATIONSHIP_REACTIVATED, RELATIONSHIP_UNINSTALLED, USAGE_CHARGE_APPLIED]
        occurredAtMin: $start
        occurredAtMax: $end
        first: $first
        after: $after
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            occurredAt
            type
            ... on RelationshipUninstalled {
              reason
              description
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on RelationshipInstalled {
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on RelationshipDeactivated {
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on RelationshipReactivated {
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on SubscriptionChargeAccepted {
              charge {
                amount {
                  currencyCode
                  amount
                }
                billingOn
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on SubscriptionChargeActivated {
              charge {
                amount {
                  currencyCode
                  amount
                }
                billingOn
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on SubscriptionChargeCanceled {
              charge {
                amount {
                  currencyCode
                  amount
                }
                billingOn
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on SubscriptionChargeDeclined {
              charge {
                amount {
                  currencyCode
                  amount
                }
                billingOn
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on SubscriptionChargeFrozen {
              charge {
                amount {
                  currencyCode
                  amount
                }
                billingOn
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on SubscriptionChargeUnfrozen {
              charge {
                amount {
                  currencyCode
                  amount
                }
                billingOn
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
            ... on UsageChargeApplied {
              charge {
                amount {
                  currencyCode
                  amount
                }
                id
                name
              }
              shop {
                id
                myshopifyDomain
                name
              }
            }
          }
        }
      }
    }
  }
  `;

const eventMessageMappings = {
  SUBSCRIPTION_CHARGE_ACTIVATED: "has subscribed! :tada:",
  SUBSCRIPTION_CHARGE_CANCELED: "has cancelled their subscription :tired_face:",
  SUBSCRIPTION_CHARGE_FROZEN: "has been frozen :cold_face:",
  SUBSCRIPTION_CHARGE_UNFROZEN: "has unfrozen! :relieved:",
  RELATIONSHIP_INSTALLED: "has installed! :star-struck:",
  RELATIONSHIP_DEACTIVATED: "has deactivated :worried:",
  RELATIONSHIP_REACTIVATED: "has reactivated! :relaxed:",
  RELATIONSHIP_UNINSTALLED: "has uninstalled :cry:",
  USAGE_CHARGE_APPLIED: "applied usage charge :relaxed:",
};
const eventTagMappings = {
  SUBSCRIPTION_CHARGE_ACTIVATED: "subscribed",
  SUBSCRIPTION_CHARGE_CANCELED: "subscription_cancelled",
  SUBSCRIPTION_CHARGE_FROZEN: "frozen",
  SUBSCRIPTION_CHARGE_UNFROZEN: "unfrozen",
  RELATIONSHIP_INSTALLED: "installed",
  RELATIONSHIP_DEACTIVATED: "deactivated",
  RELATIONSHIP_REACTIVATED: "reactivated",
  RELATIONSHIP_UNINSTALLED: "uninstalled",
  USAGE_CHARGE_APPLIED: "usage_charge_applied",
};
const constructSlackMessage = (event) => {
  const node = event.node;
  const shop = node.shop;
  const charge = node.charge;
  const shopGId = shop.id;
  const shopId = shopGId.split("/")[4];
  const eventType = eventMessageMappings[node.type] || node.type;
  const chargeAmount = charge?.amount?.amount;
  const chargeCurrency = charge?.amount?.currencyCode;
  const chargeName = charge?.name;
  const chargeId = charge?.id;
  const chargeBillingOn = charge?.billingOn;
  const chargeBillingOnGMT7 = new Date(chargeBillingOn).toLocaleString(
    "vi-VN",
    {
      timeZone: "Asia/Ho_Chi_Minh",
    }
  );
  const reason = node.reason;
  const description = node.description;
  const partnerLink = `https://partners.shopify.com/${SHOPIFY_PARTNER_ID}/stores/${shopId}`;

  let text = `
    *${shop.myshopifyDomain} ${eventType}* 
    Shop Name: ${shop.name}
    Occurred at: ${new Date(node.occurredAt).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    })}
    <${partnerLink}| Partner Link >
${chargeAmount ? `Charge Amount: ${chargeCurrency}${chargeAmount}` : ""}
${chargeName ? `Charge Name: ${chargeName}` : ""}
${chargeId ? `Charge ID: ${chargeId}` : ""}
${chargeBillingOn ? `Charge Billing On: ${chargeBillingOnGMT7}` : ""}
${reason ? `Reason: ${reason}` : ""}
${description ? `Description: ${description}` : ""}
    `;

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text,
        },
      },
    ],
  };
};

// Function to send app events to Slack
const sendAppEventsToSlack = async (events) => {
  for (const event of events) {
    if (event?.node?.shop) {
      const message = constructSlackMessage(event);
      try {
        await fetch(SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });
        console.log("Message sent to Slack");
      } catch (error) {
        console.error(error);
      }
    }
  }
};

// Function to request Shopify Partner check
export const requestShopifyPartnerCheck = async () => {
  const currentTimestamp = Date.now();
  const startTimesAgo = currentTimestamp - 1000 * 60 * 10; // 10 minutes ago
  const response = await fetch(
    `https://partners.shopify.com/${SHOPIFY_PARTNER_ID}/api/2023-07/graphql.json`,
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_PARTNER_API_TOKEN,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        query,
        variables: {
          start: new Date(startTimesAgo),
          end: new Date(currentTimestamp),
          after: null,
          first: 10,
          appid: `gid://partners/App/${SHOPIFY_APP_ID}`,
        },
      }),
    }
  ).then((response) => response.json());
  const events = response?.data?.app?.events?.edges || [];
  await sendAppEventsToSlack(events.reverse());
  return new Response(JSON.stringify(response));
};

// Event listener for scheduled events
export default {
  async scheduled(event, env, ctx) {
    initializeEnvVariables(env); // Initialize environment variables with env
    console.log("env", env);
    ctx.waitUntil(requestShopifyPartnerCheck());
  },
  async fetch(request, env, ctx) {
    initializeEnvVariables(env); // Initialize environment variables with env
    console.log("env", env);
    ctx.waitUntil(requestShopifyPartnerCheck());
    return new Response("OK");
  },
};
