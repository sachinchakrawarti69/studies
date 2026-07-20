import sys
import os


# add python folder to path
PYTHON_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


sys.path.append(
    PYTHON_DIR
)


import matplotlib.pyplot as plt

from analysis.load_data import load_ohlcv



df = load_ohlcv()


plt.figure(figsize=(14,6))


plt.plot(
    df.index,
    df["close"]
)


plt.title(
    "Ethereum ETHUSDT Historical Price"
)


plt.xlabel(
    "Date"
)


plt.ylabel(
    "Price USDT"
)


plt.grid()


plt.tight_layout()


plt.savefig(
    "../../charts/daily/eth_price_history.png",
    dpi=300
)


plt.close()


print(
    "Price chart created"
)