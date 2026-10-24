# A first price-distance gate

Early code example · 2024-03-18

This early Pine example is preserved as a draft. Its flat-position condition bypasses the price-distance gate; it is not a validated solution.

---

```pinescript
//@version=5
strategy("My Strategy", overlay=true)

// Define the percentage move required to open another order
float requiredMove = 1.0 / 100 // 1%

// Persistent variable to track the close price of the last order
var float lastOrderClosePrice = na

// Function to check if the price moved more than the required percentage
priceMovedEnough() =>
    if (na(lastOrderClosePrice))
        true // No last order price, so we can open a position
    else
        math.abs(close - lastOrderClosePrice) / lastOrderClosePrice >= requiredMove

// Strategy logic
if (strategy.opentrades == 0 or priceMovedEnough())
    if (close > open) // Your condition for going long
        strategy.entry("Long", strategy.long)
        lastOrderClosePrice := close // Update the last order close price

    if (close < open) // Your condition for going short
        strategy.entry("Short", strategy.short)
        lastOrderClosePrice := close // Update the last order close price

// Other strategy conditions here...

```
