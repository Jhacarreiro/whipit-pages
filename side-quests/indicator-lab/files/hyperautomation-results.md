# A result row needs its run context

Reconstructed data layout · 2025-05-05

Selected field groups from the historical implementation. No private sheet, account or configuration is included.

| Group | Fields recorded or selected in the implementation |
|---|---|
| Identity | Date and time, run number, strategy, configuration name |
| Search setup | Epochs, random state, time range, pairs and loss function |
| Strategy context | Leverage, trade allocation and selected strategy parameters |
| Reported metrics | Trade count, win rate, average profit, total profit, duration and drawdown |
| Failure context | The known run settings and a failed-result marker when execution or parsing did not yield a result |

The result columns were configurable. The script combined configuration fields, selected strategy fields and result fields rather than relying on one fixed report layout.

That flexibility also introduced a constraint: sheet headers and the script's field names had to match. The code reported missing headers and skipped metrics that were not in the selected result columns.

This layout belongs to [Freqtrade Strategies](/#freqtrade). The archive records the mechanism, not any particular account's trading results.
