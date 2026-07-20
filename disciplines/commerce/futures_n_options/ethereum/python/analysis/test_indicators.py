from load_data import load_ohlcv
from indicator_pipeline import apply_indicators



df = load_ohlcv()



df = apply_indicators(df)



print(df.tail())



df.to_csv(
    "../../datasets/ethereum_indicators.csv"
)


print("Indicators completed")