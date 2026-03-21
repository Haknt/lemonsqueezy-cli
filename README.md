# lemonsqueezy-cli

> CLI for the LemonSqueezy API — built for AI coding agents and humans.

> **Disclaimer:** This project is not affiliated with, endorsed by, or sponsored by Lemon Squeezy Software, LLC.

## Quick Start

```bash
npx lemonsqueezy-cli products list --json
```

## Install

```bash
npm install -g lemonsqueezy-cli
```

## Authentication

```bash
export LEMONSQUEEZY_API_KEY=your_api_key
```

Or pass it directly:

```bash
lemonsqueezy store list --api-key your_api_key
```

Optionally set a default store:

```bash
export LEMONSQUEEZY_STORE_ID=your_store_id
```

## Usage

```
lemonsqueezy <resource> <action> [id] [flags]
```

### Resources

| Resource | Actions | Description |
|---|---|---|
| `auth` | `whoami` | Authentication info |
| `store` | `get`, `list` | Store management |
| `products` | `get`, `list` | Product catalog |
| `variants` | `get`, `list` | Product variants |
| `customers` | `get`, `list`, `create`, `update`, `archive` | Customer management |
| `orders` | `get`, `list`, `invoice`, `refund` | Order management |
| `subscriptions` | `get`, `list`, `update`, `cancel` | Subscription management |
| `checkouts` | `get`, `list`, `create` | Checkout links |
| `webhooks` | `get`, `list`, `create`, `update`, `delete` | Webhook management |
| `discounts` | `get`, `list`, `create`, `delete`, `redemptions` | Discount codes |
| `licenses` | `get`, `list`, `update`, `activate`, `deactivate`, `validate`, `instances` | License keys |
| `usage` | `get`, `list`, `create` | Usage-based billing |

### Examples

```bash
# List products
lemonsqueezy products list --json

# Get subscription details
lemonsqueezy subscriptions get 12345 --json

# List active subscriptions
lemonsqueezy subscriptions list --status active --json

# Create a checkout
lemonsqueezy checkouts create --variant-id 12345 --email user@example.com --json

# Cancel subscription
lemonsqueezy subscriptions cancel 12345 --json

# Paginate orders
lemonsqueezy orders list --limit 25 --page 2 --json

# Create a discount
lemonsqueezy discounts create --name "Launch" --code LAUNCH20 --amount 20 --amount-type percent --json

# Validate a license
lemonsqueezy licenses validate --key "ABCD-1234-EFGH-5678" --json

# Create a webhook
lemonsqueezy webhooks create --url https://example.com/hook --events subscription_created,order_created --secret mysecret --json
```

## Output Formats

### Human (default)

```
 ID      Name             Status     Price        Created
 ─────── ──────────────── ────────── ──────────── ──────────────────
 12345   AppIntel Pro     published  $29.00/mo    2025-06-15

Showing page 1 of 1 (1 total)
```

### JSON (`--json`)

```json
{
  "data": [
    {
      "id": "12345",
      "type": "products",
      "name": "AppIntel Pro",
      "status": "published",
      "price": 2900,
      "price_formatted": "$29.00/mo"
    }
  ],
  "meta": { "page": { "currentPage": 1, "lastPage": 1, "total": 1 } }
}
```

### Plain (`--plain`)

```
12345	AppIntel Pro	published	$29.00/mo	2025-06-15
```

## Global Flags

| Flag | Description | Default |
|---|---|---|
| `--json` | Output as JSON | `false` |
| `--plain` | Tab-separated output | `false` |
| `--api-key` | LemonSqueezy API key | `$LEMONSQUEEZY_API_KEY` |
| `--store-id` | Default store ID | `$LEMONSQUEEZY_STORE_ID` |
| `--limit` | Page size | `10` |
| `--page` | Page number | `1` |
| `--all` | Fetch all pages | `false` |
| `--no-color` | Disable color | `false` / `$NO_COLOR` |
| `--help` | Show help | |
| `--version` | Show version | |

## Error Handling

Errors are written to stderr. Exit codes:

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | API/runtime error |
| `2` | Usage error (bad arguments) |

JSON error format (stderr):

```json
{"error": "Authentication required.", "code": "AUTH_REQUIRED"}
```

## AI Agent Integration

This CLI is designed for AI coding agents (Claude Code, Cursor, etc.).

- Use `--json` for structured output
- Errors go to stderr, data to stdout
- Non-interactive — never prompts
- Includes `SKILL.md` for Claude Code auto-discovery

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `LEMONSQUEEZY_API_KEY` | Yes | Your LemonSqueezy API key |
| `LEMONSQUEEZY_STORE_ID` | No | Default store ID |
| `NO_COLOR` | No | Disable color when set |

## Development

```bash
git clone https://github.com/Haknt/lemonsqueezy-cli.git
cd lemonsqueezy-cli
npm install
npm run dev    # watch mode
npm run build  # production build
npm test       # run tests
```

## License

MIT
