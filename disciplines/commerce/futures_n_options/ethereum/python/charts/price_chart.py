import sys
import os


# =====================================
# Add python folder to import path
# =====================================

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



# =====================================
# Load Ethereum OHLCV Data
# =====================================

df = load_ohlcv()



# =====================================
# Create Chart
# =====================================

plt.figure(
    figsize=(14, 6)
)


plt.plot(
    df.index,
    df["close"],
    linewidth=1
)



plt.title(
    "Ethereum ETHUSDT Historical Price"
)


plt.xlabel(
    "Date"
)


plt.ylabel(
    "Price (USDT)"
)



plt.grid(
    True
)



plt.tight_layout()



# =====================================
# Output Path
# =====================================

PROJECT_DIR = os.path.dirname(
    os.path.dirname(
        PYTHON_DIR
    )
)


OUTPUT_DIR = os.path.join(
    PROJECT_DIR,
    "charts",
    "daily"
)


os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)



OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "eth_price_history.png"
)



# =====================================
# Save Image
# =====================================

plt.savefig(
    OUTPUT_FILE,
    dpi=300,
    bbox_inches="tight"
)



plt.close()



print("==============================")
print(" ETH Price Chart Generated")
print("==============================")
print(
    "Saved:",
    OUTPUT_FILE
)