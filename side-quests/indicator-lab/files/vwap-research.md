# Rolling or anchored VWAP?

Reconstructed research brief · 2025-04-04

Questions from a strategy-design discussion. No profitable strategy or validated indicator choice is claimed.

## The design question

The existing strategy used EMA clouds. The discussion explored whether VWAP could provide a higher-timeframe trend reference while retaining the clouds for other parts of the strategy.

| Question | What needed to be decided |
|---|---|
| Rolling or anchored | Use a moving window, or choose a point from which accumulation starts? |
| Anchor selection | A week, a month or an event such as a change in open interest? |
| Timeframe | Keep the existing short timeframe, or evaluate a longer one? |
| Open-interest data | Which data would actually be available to the implementation? |
| Volume profile | Could its levels add a useful reference alongside the existing rules? |

## Implementation context

The follow-up focused on how to express these ideas in Freqtrade and which indicator implementation could support them. A later question returned to the availability of open-interest-based indicators.

This is a research brief: it preserves the alternatives and data questions that needed testing. It does not turn the assistant's suggestions into a proven strategy.
