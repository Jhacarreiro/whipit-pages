# Extending higher-timeframe levels across a chart

Code draft · 2024-10-08

Original Pine draft using extended lines. It uses lookahead-enabled current higher-timeframe values; it is not presented as a backtest-safe finished indicator.

---

```pinescript
//@version=5
indicator("Key Level Suite by Jhac", overlay=true, dynamic_requests=true)

// Timeframe selection
htf1_timeframe_input = input.string("1h", title="Timeframe", options=["1h", "4h", "D", "W", "M", "3M", "12M"], inline="Timeframe")

// Map user-friendly display values to valid timeframe strings
htf1_timeframe = htf1_timeframe_input == "1h" ? "60" :
                 htf1_timeframe_input == "4h" ? "240" :
                 htf1_timeframe_input

htf1_color = input.color(color.blue, title="Color", inline="Timeframe")

// Checkbox options for displaying levels
htf1_show_open = input(true, title="Open", inline="Levels")
htf1_show_close = input(true, title="Close", inline="Levels")
htf1_show_high = input(true, title="High", inline="Levels")
htf1_show_low = input(true, title="Low", inline="Levels")
htf1_show_half = input(true, title="1/2", inline="Levels")

// Fetch the Open, Close, High, Low, and 1/2 values for the selected higher timeframe
htf1_open = request.security(syminfo.tickerid, htf1_timeframe, open, lookahead=barmerge.lookahead_on)
htf1_close = request.security(syminfo.tickerid, htf1_timeframe, close, lookahead=barmerge.lookahead_on)
htf1_high = request.security(syminfo.tickerid, htf1_timeframe, high, lookahead=barmerge.lookahead_on)
htf1_low = request.security(syminfo.tickerid, htf1_timeframe, low, lookahead=barmerge.lookahead_on)
htf1_half = (htf1_high + htf1_low) / 2

// Remove previous lines to avoid duplication
var line htf1_open_line = na
var line htf1_close_line = na
var line htf1_high_line = na
var line htf1_low_line = na
var line htf1_half_line = na

line.delete(htf1_open_line)
line.delete(htf1_close_line)
line.delete(htf1_high_line)
line.delete(htf1_low_line)
line.delete(htf1_half_line)

// Only plot for the current candle of the selected higher timeframe
if (barstate.islast)
    if htf1_show_open
        htf1_open_line := line.new(x1=bar_index - 100, y1=htf1_open, x2=bar_index + 100, y2=htf1_open, color=htf1_color, width=2, extend=extend.both)
    if htf1_show_close
        htf1_close_line := line.new(x1=bar_index - 100, y1=htf1_close, x2=bar_index + 100, y2=htf1_close, color=htf1_color, width=2, extend=extend.both)
    if htf1_show_high
        htf1_high_line := line.new(x1=bar_index - 100, y1=htf1_high, x2=bar_index + 100, y2=htf1_high, color=htf1_color, width=2, extend=extend.both)
    if htf1_show_low
        htf1_low_line := line.new(x1=bar_index - 100, y1=htf1_low, x2=bar_index + 100, y2=htf1_low, color=htf1_color, width=2, extend=extend.both)
    if htf1_show_half
        htf1_half_line := line.new(x1=bar_index - 100, y1=htf1_half, x2=bar_index + 100, y2=htf1_half, color=htf1_color, width=2, extend=extend.both)
```
