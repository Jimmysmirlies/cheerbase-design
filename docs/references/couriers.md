Great brief—below is a carrier-by-carrier integration kit focused on tracking (plus label and webhook touch‑points where they exist) for USPS, DHL, Canada Post, and Chit Chats. I’ve grouped details exactly as you asked: account identifiers, API endpoints & auth, webhooks, polling fallbacks, metadata to store, and docs links. Citations point to the official docs or high‑signal sources.

Heads‑up on “DHL”: DHL has multiple business units with different APIs. In North America you’ll most often use DHL eCommerce Americas (small‑parcel, last‑mile) or DHL Express (MyDHL). I’ve covered DHL eCommerce Americas (OAuth + webhooks) and the global Shipment Tracking (Unified) API (API key). Use the one that matches your account.

USPS (United States Postal Service)
Account identifiers

USPS Developer Portal app with:

Client (Consumer) Key & Client Secret (OAuth 2.0).

CRID (Customer Registration ID) and MID (Mailer ID) — required to obtain access tokens.
GitHub

Environments:

Production base: https://apis.usps.com

Test base: https://apis-tem.usps.com (swap domain to use test).
GitHub

Note: USPS is retiring legacy Web Tools (TrackV2, etc.) in Jan 2026; implement the modern USPS APIs (v3).
USPS
+1

API endpoints & authentication

OAuth (client credentials or auth code)
POST https://apis.usps.com/oauth2/v3/token → returns Bearer token; include in Authorization: Bearer <token>. Test host uses apis-tem.
GitHub

Tracking (v3 / v3.2)
Public dev‑portal entries: Tracking 3.0 & Tracking 3.2 (modernized). Production endpoints are under /tracking/v3/... or /tracking/v3r2/... per the catalog; test uses apis-tem. (USPS indicates v3 is the current family and v1/v2 have retired.)
USPS Developer Portal
+2
USPS Developer Portal
+2

Labels (if you also create labels)
Domestic Labels 3.0, International Labels 3.0 (OAuth Bearer).
developer.usps.com
+1

Header example

Authorization: Bearer <USPS_ACCESS_TOKEN>
Accept: application/json


OAuth/token acquisition and Bearer usage per USPS examples.
GitHub

Webhook support

Yes — “Subscriptions - Tracking”: Create subscriptions by tracking number or by MID and receive push events to your listener URL. Tracking 3.2 notes a “Scan Event Extract” payload for MID‑based subscriptions with additional attributes.
EasyPost
+1

What to expect in payloads
USPS indicates notifications mirror the tracking response structure (scan events with date/time/location + delivery information), with modernized payload in v3.2. Use the subscription docs for listener requirements and signature/URL specs.
EasyPost

Polling fallback

USPS doesn’t publicly publish hard rate limits for Tracking in the catalog pages; design for HTTP 429 + Retry-After handling and backoff. Prefer webhooks where possible; if you must poll, keep cadence modest (e.g., daily until “Out for Delivery”, then every few hours; stop on delivered). (Web Tools’ Track/Confirm had different constraints and is retiring.)
USPS

Metadata to store (USPS)

Environment (test/prod), Client Key/Secret, CRID, MID, OAuth token & expiry.

Subscription ID / webhook listener URL.

Service type (if relevant to labels), origin ZIP, destination ZIP, IMpb/Tracking #.

Polling cadence override per service (optional).

Documentation links (USPS)
USPS Developer Portal (home): https://developers.usps.com/           [Getting started, app setup]
Tracking 3.0 (catalog entry): https://developers.usps.com/trackingv3
Tracking 3.2 (modernized):    https://developers.usps.com/trackingv3r2
Subscriptions - Tracking:     https://developers.usps.com/subscriptions-trackingv3
OAuth 2.0 overview:           https://developers.usps.com/oauth
USPS APIs vs Web Tools:       https://www.usps.com/business/web-tools-apis/


(Web Tools retirement + migration guide on that page.)
USPS
+5
USPS Developer Portal
+5
USPS Developer Portal
+5

DHL

Pick DHL eCommerce Americas if that’s your pickup/manifests/labels provider in the U.S.; pick Shipment Tracking (Unified) if you only need tracking across DHL business units (requires an API key header). My notes include both.

A) DHL eCommerce Americas (v4)
Account identifiers

API client (issued by DHL eCommerce Americas).

OAuth 2.0 access token obtained via /auth/v4/accesstoken (Bearer).
DHL eCommerce API Status
+1

API endpoints & authentication

Base (prod): https://api.dhlecs.com (status page lists active endpoints below).
DHL eCommerce API Status

Auth: POST /auth/v4/accesstoken → returns Bearer token; send Authorization: Bearer <token> on subsequent calls.
DHL eCommerce API Status
+2
DHL eCommerce Americas API
+2

Tracking: GET /tracking/v4/package (tracking lookups).
DHL eCommerce API Status

Webhooks (manage): POST/GET/DEL /account/v4/webhooks (subscribe/unsubscribe/list).
DHL eCommerce API Status

Labels: POST /shipping/v4/label
Manifest: POST /shipping/v4/manifest (useful if you also create shipments).
DHL eCommerce API Status

Header example

Authorization: Bearer <DHL_ECS_ACCESS_TOKEN>
Accept: application/json


(Bearer usage confirmed in DHL eCommerce Americas docs.)
DHL eCommerce Americas API

Webhook support

Yes — receive real‑time shipping events (complete track history updates) per account or tracking. Manage via /account/v4/webhooks.
DHL Developer
+1

Payload shape & verification
Webhooks deliver event data with status updates; configure your HTTPS listener. (DHL’s Tracking Webhook docs cover subscription fields and payload.)
DHL Developer

Polling fallback

Rate limits aren’t publicly listed on the status page; design for 429 + Retry-After. If polling, include tracking number and any documented filters (e.g., date window) to reduce volume; prefer webhooks. (Status page confirms the tracking and webhook endpoints.)
DHL eCommerce API Status

Metadata to store (DHL eCommerce Americas)

Environment (acceptance vs prod, if applicable), client ID/secret (or credentials used to obtain token), OAuth token & expiry, pickup customer/account number, webhook subscription IDs & secret (if applicable), preferred locale/time zone.

B) DHL Shipment Tracking – Unified (covers Express/eCommerce/Parcel)
Account identifiers

DHL API Key for the Unified Tracking API (send in header).
Stack Overflow

API endpoints & authentication

Base (commonly): https://api-eu.dhl.com/track/shipments

Auth header: DHL-API-Key: <your_key>

Important: Some use cases require a service query param (e.g., service=ecommerce) with the tracking number.
Stack Overflow
+1

Request example

GET https://api-eu.dhl.com/track/shipments?trackingNumber=<num>&service=ecommerce
DHL-API-Key: <DHL_UNIFIED_API_KEY>
Accept: application/json


(Endpoint & header pattern reflected in developer and community examples.)
Stack Overflow
+1

Webhook support

DHL also offers a Unified Push option (subscribe to delivery status updates). Use if you’re not on the eCommerce Americas stack.
DHL Developer

Polling fallback

If you don’t use push, poll with trackingNumber (and service where required). Implement backoff on 429 and retries for transient 404s (mis‑typed service).
Stack Overflow

Metadata to store (DHL – Unified)

API key, service (e.g., ecommerce, express), locale, time zone, last event timestamp (for idempotent processing).

Canada Post
Account identifiers

Developer Program API key (userid/password pair for HTTP Basic).

Requires Customer Number (“mailed by customer”) and sometimes MOBO (“mailed on behalf of”) for some services.
Canada Post

Environments:

Development host: ct.soa-gw.canadapost.ca

Production host: soa-gw.canadapost.ca
Canada Post

API endpoints & authentication

Tracking – Get Tracking Details (REST)
GET https://XX/vis/track/pin/{pin}/detail (or /dnc/{dnc}/detail)
Headers:
Authorization: Basic <base64(userid:password)>
Accept: application/vnd.cpc.track-v2+xml
Accept-Language: en-CA|fr-CA
Canada Post

Header example

Authorization: Basic <base64(userid:password)>
Accept: application/vnd.cpc.track-v2+xml
Accept-Language: en-CA


(Basic Auth + media‑type header is mandatory.)
Canada Post
+1

Webhook support

No native webhooks — tracking is pull via REST/SOAP. (Service directory shows tracking operations only.)
Canada Post

Polling fallback

Throttle limits (Group E: Tracking): Default 20 req/min per API key, Upgraded 500/min. Respect rolling 60‑second window, and space requests to avoid SLM blocks.
Canada Post

Use PIN (tracking number) or DNC, or reference search (customer number + date range) as available.
Canada Post

Metadata to store (Canada Post)

Environment & host, userid/password, Customer Number, MOBO (if used), preferred language, throttle profile (default vs upgraded), last event timestamp.

Chit Chats
Account identifiers

Client ID and API access token (generated in Settings → Developer → API Access Tokens).

Access token is sent directly in the Authorization header (no “Bearer” prefix).

Sandbox: https://staging.chitchats.com (with test card for credits).
Chit Chats

API endpoints & authentication

Base (prod): https://chitchats.com/api/v1/clients/<CLIENT_ID>/...

Authorization: Authorization: <ACCESS_TOKEN> (as supplied).
Chit Chats

Shipments: list/create/buy/refund under /shipments (if you also create labels).
Chit Chats

Tracking (public JSON fallback):
https://chitchats.com/tracking/<shipment_id>.json returns public tracking events as JSON (good for read‑only tracking if that’s all you need).
Chit Chats

Header example

Authorization: <CHITCHATS_ACCESS_TOKEN>
Accept: application/json


(Direct token header per docs.)
Chit Chats

Webhook support

Not documented in the public API; plan to poll (either the private API tracking endpoints as they expose them, or the public JSON endpoint).
Chit Chats

Polling fallback

Rate limiting: 2,000 requests / 5 minutes (HTTP 429 with Retry-After on exceed). Use pagination and store updated_at to minimize calls.
Chit Chats

Metadata to store (Chit Chats)

Client ID, access token, environment (staging/prod), preferred postage types, polling cadence, last event timestamp.

Minimal schemas you’ll likely need

1) Per‑carrier account config (internal settings table)

{
  "carrier": "usps|dhl_ecs|dhl_unified|canadapost|chitchats",
  "environment": "prod|test",
  "credentials": {
    "client_id": "...",           // USPS/DHL eCommerce
    "client_secret": "...",       // USPS/DHL eCommerce
    "api_key": "...",             // DHL Unified
    "userid": "...", "password": "...", // Canada Post
    "access_token": "...", "expires_at": "2025-10-26T14:00:00Z" // where applicable
  },
  "account_numbers": {
    "usps": { "crid": "...", "mid": "..." },
    "canadapost": { "customer_number": "...", "mobo": "..." },
    "dhl_ecs": { "pickup_customer": "..." }
  },
  "webhooks": {
    "listener_url": "https://your.app/tracking/webhooks/<carrier>",
    "subscription_ids": ["..."],
    "secret": "..."                // if the carrier supports signing
  },
  "defaults": {
    "locale": "en-US",
    "timezone": "America/New_York",
    "poll_interval_minutes": 180   // used only when no webhooks
  }
}


2) Tracking event normalization (store per tracking number)

{
  "tracking_number": "...",
  "carrier": "usps",
  "status": "delivered|out_for_delivery|in_transit|exception|info_received",
  "status_code": "CARRIER_NATIVE_CODE",
  "summary": "Package delivered at front door",
  "events": [
    {
      "code": "DELIVERED",
      "description": "Delivered",
      "city": "Austin", "state": "TX", "country": "US",
      "timestamp": "2025-10-22T14:37:00-05:00",
      "signed_by": null
    }
  ],
  "estimated_delivery": "2025-10-23",
  "delivered_at": "2025-10-22T14:37:00-05:00",
  "last_polled_at": "2025-10-22T18:00:00Z",
  "source": "webhook|poll"
}

Implementation notes & pitfalls

Prefer push where offered:
USPS Subscriptions - Tracking and DHL eCommerce Americas both push tracking updates so you can avoid tight polling. USPS v3.2 includes a modernized payload for MID subscriptions.
EasyPost
+1

USPS migration: If you still have legacy Web Tools code (e.g., ShippingAPI.dll?API=TrackV2), plan your cutover—USPS confirms these shut down January 2026 and older USPS API versions (v1/v2) retired in January 2025.
USPS
+1

DHL Unified nuances: Some tracking numbers require a service parameter like service=ecommerce, and you must send DHL-API-Key. A missing service can yield 404s.
Stack Overflow
+1

Canada Post Accept header: Their REST services are media‑type driven (e.g., application/vnd.cpc.track-v2+xml). Using */* will error.
Canada Post

Canada Post throttling: Tracking calls are Group E — 20/min default; throttle violations block further calls until the rolling window clears. Consider staging polls and caching.
Canada Post

Chit Chats polling: Respect 2,000 requests/5 minutes; use public tracking JSON for lightweight status checks when appropriate.
Chit Chats

Quick “what to store” checklist by carrier

USPS: Client ID/Secret, CRID, MID, token+expiry, webhook subscription(s), environment; for labels: default service/package.
GitHub
+1

DHL eCommerce Americas: Client ID/Secret, token+expiry, pickup customer/account, webhook subscription(s), environment.
DHL eCommerce API Status

DHL Unified Tracking: API key, service (e.g., ecommerce), any locale preferences.
Stack Overflow
+1

Canada Post: userid/password (Basic), Customer Number, MOBO (if any), language, throttle profile.
Canada Post
+1

Chit Chats: Client ID, access token, environment, polling interval.
Chit Chats

Appendix — Copy‑paste doc links
USPS
- Dev Portal (home):           https://developers.usps.com/
- Tracking 3.0:                https://developers.usps.com/trackingv3
- Tracking 3.2 (modernized):   https://developers.usps.com/trackingv3r2
- Subscriptions - Tracking:    https://developers.usps.com/subscriptions-trackingv3
- OAuth 2.0:                   https://developers.usps.com/oauth
- Web Tools retirement & guide:https://www.usps.com/business/web-tools-apis/


USPS
+5
USPS Developer Portal
+5
USPS Developer Portal
+5

DHL eCommerce Americas
- API status (shows endpoints): https://status.api.dhlecs.com/
- Auth & Bearer token note:     https://docs.api.dhlecs.com/
- Tracking Webhooks (overview): https://developer.dhl.com/api-reference/tracking-webhooks-dhl-ecommerce-americas


DHL eCommerce API Status
+2
DHL eCommerce Americas API
+2

DHL Shipment Tracking (Unified)
- Tracking API (overview):      https://developer.dhl.com/api-reference/shipment-tracking
- Example base & header:        https://api-eu.dhl.com/track/shipments (DHL-API-Key header)
- `service` param behavior:     (community note) https://stackoverflow.com/q/76445657


DHL Developer
+2
Stack Overflow
+2

Canada Post
- Tracking (service directory): https://www.canadapost-postescanada.ca/.../developers/services/tracking/default.jsf
- Get Tracking Details (REST):  https://www.canadapost-postescanada.ca/.../services/tracking/trackingdetails.jsf
- REST Fundamentals (auth, headers): https://www.canadapost-postescanada.ca/.../services/fundamentals.jsf
- API Throttle Limits:          https://www.canadapost-postescanada.ca/.../developers/throttlelimits.jsf


Canada Post
+3
Canada Post
+3
Canada Post
+3

Chit Chats
- API docs:                     https://chitchats.com/docs/api/v1
- “How to use the API” (support): https://support.chitchats.com/en/support/solutions/articles/47000427165-how-to-use-the-chit-chats-api


Chit Chats
+1

Want me to turn this into a ready‑to‑paste internal doc (Markdown table + sample requests + status mapping), or sketch webhook listener stubs (Express/FastAPI) for USPS/DHL? I can produce those directly here.