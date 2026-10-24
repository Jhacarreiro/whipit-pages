# Select the runs from the configuration sheet

Historical code excerpt · 2025-05-05

Two functions from the May 2025 source, with their traceback import. Configuration, credentials and execution code are omitted.

The reader requires strategy, epochs and time range before accepting a row. Optional settings are copied when supplied, while empty values and the `OFF` marker are omitted.

```python
# Historical excerpt: configuration-sheet parsing only.
import traceback

def get_value_from_dict(data_dict, key, default=""):
    """Retrieve a value from a dictionary with a default if missing or invalid."""
    val = data_dict.get(key)
    if val in [None, "", "#N/A"]:
        return default
    return val

def read_hyperopt_runs_from_sheet(config_worksheet):
    """Read hyperopt run configurations from the config worksheet."""
    print(f"Reading runs from sheet '{config_worksheet.title}'...")
    expected_headers = ["Runs", "Config", "Strategy", "Pairs", "Leverage", "% per trade", "epochs", "spaces", "timerange", "loss_function", "jobs", "min_trades", "random_state", "timeframe_detail"]
    try:
        all_runs_data = config_worksheet.get_all_records(head=1)
        valid_runs = []
        required_columns = ["epochs", "timerange", "Strategy"]
        if not all_runs_data and config_worksheet.row_count > 0:
            print("Warning: Sheet has rows but get_all_records returned empty. Check header row.")
            return []
        print(f"Processing {len(all_runs_data)} potential runs...")
        for i, run_data in enumerate(all_runs_data):
            row_num = i + 2
            if any(get_value_from_dict(run_data, col) == "" for col in required_columns):
                print(f"Skipping Row {row_num}: A required column is empty.")
                continue
            run_dict = {
                "strategy_name": str(get_value_from_dict(run_data, "Strategy")),
                "config_filename": str(get_value_from_dict(run_data, "Config")),
                "epochs": str(get_value_from_dict(run_data, "epochs")),
                "timerange": str(get_value_from_dict(run_data, "timerange")),
                "Leverage": str(get_value_from_dict(run_data, "Leverage")),
                "% per trade": str(get_value_from_dict(run_data, "% per trade")),
                "Pairs": str(get_value_from_dict(run_data, "Pairs")),
            }
            for key in ["spaces", "loss_function", "jobs", "min_trades", "random_state", "timeframe_detail"]:
                value = get_value_from_dict(run_data, key)
                if value != "" and value != "OFF":
                    run_dict[key] = str(value)
            valid_runs.append(run_dict)
        if not valid_runs:
            print("Warning: No valid runs found after processing sheet.")
        else:
            print(f"Prepared {len(valid_runs)} valid runs.")
        return valid_runs
    except Exception as e:
        print(f"ERROR: Failed reading config sheet: {e}")
        traceback.print_exc()
        return None
```

This is an excerpt for reading, not a complete runner. It expects a worksheet object with the methods used above. The full project belongs to [Freqtrade Strategies](/#freqtrade) and is available in the [public repository](https://github.com/Jhacarreiro/hyperautomation).
