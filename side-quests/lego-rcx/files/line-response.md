# Wait for the line, then turn

Translated code draft · 2025-04-04

English variable names and comments; the original control flow is preserved. Untested on the RCX.

## Intended behaviour

Move forward until a line is detected continuously for a chosen interval, then make a small turn. Losing the line should reset the counter.

## The draft

```c
#define YELLOW_THRESHOLD 45 // Adjust after calibration
#define TIME_THRESHOLD 50   // Original draft describes this as tenths of a second

task main() {
    SetSensor(SENSOR_1, SENSOR_LIGHT);
    int counter = 0;

    while (true) {
        int reading = Sensor(SENSOR_1);
        if (reading > YELLOW_THRESHOLD) {
            counter++;
            if (counter > TIME_THRESHOLD) {
                // Original draft uses opposite motor directions for the turn
                OnFwd(OUT_A);
                OnRev(OUT_C);
                Wait(10);
                counter = 0;
            }
        } else {
            counter = 0;
            OnFwd(OUT_A + OUT_C);
        }
        Wait(1);
    }
}
```

## What remained to resolve

The sketch uses a reflected-light threshold; it does not establish colour recognition. The counter advances once per loop, so the original timing description needs checking against the RCX/NQC timing units. Opposite motor directions also do not establish the gentle turn requested. Calibration and an on-robot test were still missing.
