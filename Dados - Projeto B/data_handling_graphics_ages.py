import json
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import mannwhitneyu

# ---------- Helper: grupo etário ----------
def get_age_group(age):
    if 20 <= age <= 30:
        return "20-30"
    elif 50 <= age <= 60:
        return "50-60"
    else:
        return None

# ---------- Load data ----------
def load_data(path):
    with open(path) as f:
        data = json.load(f)

    rows = []
    for u in data.values():
        age_group = get_age_group(u["age"])
        if age_group is None:
            continue

        rows.append({
            "age_group": age_group,

            "elapsed": u["elapsed"],

            "time_per_target": (
                u["elapsed"] / u["successes"]
                if u["successes"] > 0 else np.nan
            ),

            "success_rate": (
                u["successes"] / u["length"]
                if u["length"] > 0 else np.nan
            ),

            "errors": u["mistakes"] + u["failures"]
        })

    return pd.DataFrame(rows)

df = load_data("Dados - Projeto B/dados_nosso.json")

# ---------- Analyze ONE metric ----------
def analyze_metric(metric, log_scale=False):
    # gráfico
    plt.figure(figsize=(7,4))
    sns.violinplot(
        data=df,
        x="age_group",
        y=metric,
        inner="box"
    )

    if log_scale:
        plt.yscale("log")

    plt.title(metric.replace("_", " ").title())
    plt.xlabel("Grupo etário")
    plt.tight_layout()
    plt.show()

    # estatística
    x = df[df.age_group == "20-30"][metric].dropna()
    y = df[df.age_group == "50-60"][metric].dropna()

    U, p = mannwhitneyu(x, y, alternative="two-sided")
    r = U / (len(x) * len(y))

    print(f"\n{metric.upper()}")
    print(f"20–30 median: {np.median(x):.3f}")
    print(f"50–60 median: {np.median(y):.3f}")
    print(f"U = {U:.1f}, p = {p:.4f}, r = {r:.3f}")

# ---------- Run (um de cada vez) ----------
analyze_metric("elapsed", log_scale=True)
analyze_metric("time_per_target", log_scale=True)
analyze_metric("errors")
analyze_metric("success_rate")