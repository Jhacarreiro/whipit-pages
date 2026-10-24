# Hyperautomation: queue the runs, keep the results

Code-backed project notes · 2025-05-05

Working material from the Freqtrade project, reconstructed from its historical README and Python source.

## The repetitive job

Hyperautomation was built to run several Freqtrade hyperopt sessions in sequence and keep their settings and results together. A configuration sheet supplied the runs; a result sheet collected their output.

## The workflow in the code

1. Read the run configurations and skip rows missing required fields.
2. Build and execute the hyperopt command for each run.
3. Keep the supplied random state, or capture the state reported by the optimiser.
4. Locate the result file and retrieve the detailed result.
5. Parse the parameters and metrics into the chosen result columns.
6. Append either the result or a partial failure record to the sheet.

The project joined run preparation and record keeping. Keeping the settings beside the outputs made comparison possible without manually copying each terminal report.

## Project context

This is part of [Freqtrade Strategies](/#freqtrade), rather than a separate trading product. The [public Hyperautomation repository](https://github.com/Jhacarreiro/hyperautomation) holds the source. The historical code documents the workflow; it is not evidence of profitable trading or current compatibility.
