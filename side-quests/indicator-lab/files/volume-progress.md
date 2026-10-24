# Volume progress against the same time of day

Worked learning example · 2025-09-17

English translation of the Portuguese source. Original explanation with worked example. It describes the intended metric, not measured trading performance.

---

**Time-based RVol (%) = 100 × (volume accumulated up to this bar) / (daily average × typical fraction up to this time).**
The “typical fraction” is learned from the last _N_ days, with a default of 14: the “up to the same time” profile.

### Example at 13:00 on a 10-minute chart
- There are 144 bars per day; at 13:00 we are at bar 78, counting from 00:00 in the chart's time zone.
- Daily average over the last 14 days: **120M**.
- Typical fraction of volume up to 13:00, learned from the data: **0.62** → expected volume of **74.4M** (= 120M × 0.62).
- Today's accumulated volume up to 13:00: **76.6M**.

**Time-based RVol = 76.6 / 74.4 × 100 = 103%**.
In other words, by 13:00 the market has traded **3% more volume** than normal for this time of day.

For **time-based R/ATR**, the same reasoning applies, using the range (high–low) versus ATR:
- Daily ATR(14): **2.00**.
- Typical fraction of the range up to 13:00: **0.55** → expected range of **1.10** (= 2.00 × 0.55).
- Today's range up to 13:00: **1.13**.

**Time-based R/ATR = 1.13 / 1.10 × 100 ≈ 103%**.
The range up to this time is about 3% above what is expected for this time of day.

A quick note:
- “Time-based” uses the **time-of-day profile**. In 24/7 crypto markets, the day changes at **00:00** in the chart's time zone.
- **Simple** mode ignores the time and compares progress against the **whole-day average**. At noon, it tends to produce values below 100% even when activity is on track, because the day is not over yet.
