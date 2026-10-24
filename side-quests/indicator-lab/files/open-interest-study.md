# What was the open-interest signal actually measuring?

Reconstructed learning notes · 2024-12-12

A study of the supplied quantifytools indicator. Its third-party code is not republished or attributed to this project.

## The question behind the label

A chart indicator used labels such as “aggressive longs” and “liquidated shorts”. The useful question was how the script reached those labels, and whether the underlying data actually observed those events.

## Reading the supplied code

The script requested an open-interest series, compared it with its moving average and combined that relative value with relative price. Thresholds then classified unusually large changes and selected the alert label.

That is an inference from price and open interest. The supplied code did not read a feed of individual liquidation events. A label in an indicator is therefore not, by itself, evidence of a directly observed liquidation.

## What was learned

The distinction between a measured input and an inferred explanation matters more than the confidence of the label. The session kept asking how the signal was calculated instead of treating its name as proof.

The source indicator was “Open interest flow / quantifytools”, supplied with a third-party licence notice. This note documents the examination of that indicator, not authorship of it or evidence of trading performance.
