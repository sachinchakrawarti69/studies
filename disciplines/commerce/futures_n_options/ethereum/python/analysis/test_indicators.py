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