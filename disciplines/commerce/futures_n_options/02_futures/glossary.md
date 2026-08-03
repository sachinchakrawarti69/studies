# Futures Glossary

> **Module:** Futures & Options  
> **Section:** Futures  
> **Purpose:** Quick Reference  
> **Level:** Beginner → Intermediate

---

# A

## Arbitrage

The process of earning profit from price differences of the same asset in different markets.

Example:

```
NSE Price = ₹500
BSE Price = ₹503
```

Buy from NSE and sell on BSE.

---

## Ask Price

The lowest price at which a seller is willing to sell a futures contract.

---

## Asset

Anything that has economic value.

Examples:

- Stocks
- Commodities
- Currency
- Index

---

# B

## Basis

The difference between spot price and futures price.

Formula:

```
Basis = Spot Price - Futures Price
```

---

## Basis Risk

The risk that the futures price and spot price do not move perfectly together.

---

## Backwardation

A market condition where:

```
Futures Price < Spot Price
```

Usually occurs due to high demand for immediate delivery.

---

## Bid Price

The highest price a buyer is willing to pay for a futures contract.

---

# C

## Clearing Corporation

An organization responsible for:

- Settlement
- Risk management
- Guaranteeing trades

---

## Closing Price

The official market price at the end of the trading session.

Used for:

- Mark-to-Market calculation
- Daily settlement

---

## Contract Size

The quantity of underlying asset represented by one futures contract.

Example:

```
Nifty Futures Lot Size = Fixed number of units
```

---

## Cost of Carry

The cost of holding an asset until futures expiry.

Includes:

- Interest cost
- Storage cost
- Insurance cost

Formula:

```
Futures Price = Spot Price + Carry Cost
```

---

# D

## Derivative

A financial contract whose value depends on an underlying asset.

Examples:

- Futures
- Options
- Swaps

---

# E

## Expiry Date

The date on which a futures contract ends.

After expiry:

- Contract is settled.
- Position closes.

---

## Exchange Traded Futures

Standardized futures contracts traded on organized exchanges.

Examples:

- NSE
- CME
- BSE

---

# F

## Futures Contract

A standardized agreement to buy or sell an asset at a future date at a predetermined price.

---

## Futures Price

The current market price of a futures contract.

Affected by:

- Spot price
- Interest rate
- Carry cost
- Market expectations

---

# H

## Hedging

A strategy used to reduce financial risk.

Example:

An airline uses fuel futures to protect against rising fuel prices.

---

# I

## Initial Margin

The amount deposited by traders when opening a futures position.

Purpose:

- Covers possible losses.
- Maintains trading security.

---

## Index Futures

Futures contracts based on stock market indices.

Examples:

- Nifty Futures
- Bank Nifty Futures

---

# L

## Long Position

A futures position where a trader buys a contract.

Profit occurs when:

```
Futures Price Rises
```

---

# M

## Maintenance Margin

Minimum balance required in a futures trading account.

If balance falls below this level:

Margin call occurs.

---

## Margin

Security deposit required to trade futures.

Types:

- Initial Margin
- Maintenance Margin

---

## Margin Call

A request to add more funds when margin falls below required level.

---

## Mark-to-Market (MTM)

Daily settlement process where futures profits and losses are adjusted based on closing prices.

---

# N

## Near Month Contract

The futures contract with the closest expiry date.

Example:

January Futures before expiry.

---

# O

## Open Interest (OI)

The total number of outstanding futures contracts that are not closed.

Indicates:

- Market participation
- Liquidity
- Trading activity

---

## Opening Price

The first traded price of a futures contract during a trading session.

---

# P

## Premium

The additional amount paid above the fair value of an asset.

---

## Position

A trader's market exposure.

Types:

- Long Position
- Short Position

---

# R

## Rollover

The process of transferring a futures position from one expiry month to another.

Example:

```
January Futures
        ↓
February Futures
```

---

## Rollover Cost

The price difference between current and next expiry futures contracts.

Formula:

```
Next Month Futures
-
Current Month Futures
```

---

# S

## Settlement

The process of completing a futures contract.

Types:

- Daily Settlement
- Final Settlement

---

## Short Position

A futures position where a trader sells a contract.

Profit occurs when:

```
Futures Price Falls
```

---

## Spot Price

The current market price of an asset.

Example:

Current Gold Price.

---

## Speculation

Taking risk to earn profit from expected price movements.

Example:

Buying futures expecting prices to rise.

---

# T

## Tick Size

The minimum price movement allowed in a futures contract.

Example:

```
Price changes from ₹100.00 to ₹100.05
```

---

## Trading Volume

The number of contracts traded during a period.

Higher volume usually means higher liquidity.

---

# U

## Underlying Asset

The asset from which a derivative gets its value.

Examples:

| Derivative | Underlying |
|-|-|
| Nifty Futures | Nifty Index |
| Gold Futures | Gold |
| Currency Futures | Currency |

---

# V

## Volatility

The degree of price movement of an asset.

Higher volatility:

- Higher risk
- Higher opportunity

---

# Important Futures Formulas

## Futures Profit/Loss

### Long Position

```
Profit/Loss =
(Current Price - Buy Price) × Lot Size
```

---

### Short Position

```
Profit/Loss =
(Sell Price - Current Price) × Lot Size
```

---

## Basis

```
Basis =
Spot Price - Futures Price
```

---

## Rollover Percentage

```
Rollover %

=
(Rolled Contracts ÷ Total Contracts)

× 100
```

---

# Quick Revision Table

| Term | Meaning |
|---|---|
| Futures | Future delivery contract |
| Spot Price | Current market price |
| Long | Buyer position |
| Short | Seller position |
| Margin | Security deposit |
| MTM | Daily settlement |
| Basis | Spot minus futures |
| Rollover | Shift to next expiry |
| Open Interest | Outstanding contracts |
| Cost of Carry | Holding cost |

---

# Futures Market Flow

```mermaid
flowchart LR

A["Underlying Asset"]
--> B["Futures Contract"]

B --> C["Trading"]

C --> D["Margin"]

D --> E["MTM Settlement"]

E --> F["Expiry / Rollover"]

style A fill:#16A34A,color:#ffffff
style B fill:#1E40AF,color:#ffffff
style C fill:#9333EA,color:#ffffff
style D fill:#F59E0B,color:#000000
style E fill:#0891B2,color:#ffffff
style F fill:#DC2626,color:#ffffff
```

---

# Final Summary

- Futures are standardized derivative contracts.
- Traders use futures for hedging, speculation, and arbitrage.
- Futures require margin deposits.
- Profits and losses are settled daily through MTM.
- Positions can be continued through rollover.
- Spot price, futures price, and cost of carry determine futures valuation.