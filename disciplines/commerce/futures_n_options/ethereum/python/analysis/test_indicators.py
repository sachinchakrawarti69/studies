from load_data import load_ohlcv
from indicator_pipeline import apply_indicators

import os


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "ethereum_indicators.csv"
)


os.makedirs(
    os.path.dirname(DATASET_PATH),
    exist_ok=True
)


df.to_csv(
    DATASET_PATH
)


print("Saved:")
print(DATASET_PATH)

df = load_ohlcv()



df = apply_indicators(df)



print(df.tail())



df.to_csv(
    "../../datasets/ethereum_indicators.csv"
)


print("Indicators completed")