# Bila integration readiness

The store owner authorized Bila integration and explicitly requested a direct key without payment tests. Manual checkout remains available alongside the new Bila option.

The direct key and receiving wallet are saved in encrypted project secrets. The deployed `bila-readiness` endpoint validates the signed-in admin and returns only configuration-presence booleans. Admin → Settings shows the configured wallet and enabled checkout. The signed-in cart choice was checked without placing an order or requesting a payment.

## Implemented flow
- Buyer selects Bila in the cart, then places an order using the server-calculated current catalog and eligible promotion prices.
- An immutable order/payment snapshot protects products and financial totals. The buyer confirms the final Kwacha amount, mobile money network, number and account holder name in their account before sending a collection request.
- The server claims the collection once and sends it directly to Bila with merchant-paid fees. An uncertain response never triggers an automatic duplicate collection request.
- Customer order history checks pending payments while open; buyers and admins can also check payment status explicitly.
- A service-only transaction confirms a matching successful payment and awards rewards once. Reference, exact amount and ZMW currency must match. Admins cannot confirm or ship an unpaid Bila order.
- Local verification/phone-format tests run without a network connection to Bila. No live payment, merchant credential validity, wallet acceptance, phone prompt, or provider settlement has been verified.
- Background/webhook reconciliation is not implemented: when nobody opens the account or checks the payment, a delayed payment remains unconfirmed locally until the next check.

## Confirmed provider requirements
- Documentation: https://docs.usebila.com/docs/developers/overview
- Live base URL: `https://api.usebila.com/api/v1`
- Authentication: `x-api-key` header; store the provider-issued credential securely as `BILA_API_KEY`.
- Read-only credential check: `GET /bila/accounts`.
- Create collection: `POST /bila/collections/mobile-money`.
- Collection fields: amount, unique reference, phone, operator, country (`zm`), walletId, customerName, narration.
- Operators: `airtel`, `mtn`, `zamtel`; currency: `ZMW`.
- Verify collection: `GET /bila/collections/status/{reference}`.
- Documented statuses: `pending`, `successful`, `failed`, `otp-required`, `pay-offline`. The last two require team assistance rather than being treated as paid.

## Implementation requirements after credential setup
- Use the explicitly requested direct project secret, not a connector; keep all credentials and provider calls server-side.
- Use the wallet supplied by the owner; its live acceptance has not been checked.
- Validate the signed-in buyer, order ownership, product quantities, availability, prices and eligible discounts server-side before requesting money. Do not trust client-submitted totals.
- Persist order-linked payment attempts with unique references and prevent concurrent or duplicate collection requests. Reconcile an ambiguous response by reference before allowing another request.
- Do not send payment requests during verification: the owner declined payment tests. Preview and published app share the database, so live requests from either can charge real money.
- Verify reference, amount, currency and successful status from Bila before accepting payment. Never mark paid based on browser input or an unverified callback.
- Start with authenticated status checks; background reconciliation is needed before unattended live operation. Only add a webhook after confirming signature verification in official documentation.
- Retain existing manual checkout and do not expose a working-looking Bila choice before credentials and the merchant wallet are ready.
- Fees use Bila's documented default `merchant` bearer: the customer pays the displayed amount, and fees are deducted from merchant proceeds.
- Report live payment processing as unverified until an actual authorized customer payment has completed; do not claim payment tests were performed.