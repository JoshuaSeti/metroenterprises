# Bila integration readiness

The store owner authorized Bila integration and explicitly requested a direct key without payment tests. Manual checkout remains unchanged. No payment endpoint, payment collection, or customer-facing Bila checkout has been enabled yet.

## Confirmed provider requirements
- Documentation: https://docs.usebila.com/docs/developers/overview
- Live base URL: `https://api.usebila.com/api/v1`
- Authentication: `x-api-key` header; store the provider-issued credential securely as `BILA_API_KEY`.
- Read-only credential check: `GET /bila/accounts`.
- Create collection: `POST /bila/collections/mobile-money`.
- Collection fields: amount, unique reference, phone, operator, country (`zm`), walletId, customerName, narration.
- Operators: `airtel`, `mtn`, `zamtel`; currency: `ZMW`.
- Verify collection: `GET /bila/collections/status/{reference}`.
- Documented statuses: `pending`, `successful`, `failed`.

## Implementation requirements after credential setup
- Use the explicitly requested direct project secret, not a connector; keep all credentials and provider calls server-side.
- Select the merchant's active ZMW wallet from account data; ask the owner if more than one eligible wallet exists.
- Validate the signed-in buyer, order ownership, product quantities, availability, prices and eligible discounts server-side before requesting money. Do not trust client-submitted totals.
- Persist order-linked payment attempts with unique references and prevent concurrent or duplicate collection requests. Reconcile an ambiguous response by reference before allowing another request.
- Do not send payment requests during verification: the owner declined payment tests. Preview and published app share the database, so live requests from either can charge real money.
- Verify reference, amount, currency and successful status from Bila before accepting payment. Never mark paid based on browser input or an unverified callback.
- Start with authenticated status checks; background reconciliation is needed before unattended live operation. Only add a webhook after confirming signature verification in official documentation.
- Retain existing manual checkout and do not expose a working-looking Bila choice before credentials and the merchant wallet are ready.
- Check transaction fee handling with the owner before live launch; do not silently charge customers additional fees.
- Report live payment processing as unverified until an actual authorized customer payment has completed; do not claim payment tests were performed.