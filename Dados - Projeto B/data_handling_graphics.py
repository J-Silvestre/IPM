import json
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import mannwhitneyu

def load_data(path, label):
    with open(path) as f:
        data = json.load(f)

    rows = []
    for u in data.values():
        rows.append({
            "group": label,
            "elapsed": u["elapsed"],

            # evita divisão por zero
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

df = pd.concat([
    load_data("Dados - Projeto B/dados_prof.json", "Solução standard"),
    load_data("Dados - Projeto B/dados_nosso.json", "Solução proposta")
], ignore_index=True)

plt.figure(figsize=(8,5))
sns.violinplot(data=df, x="group", y="elapsed", inner="box")
plt.ylabel("Tempo total (s)")
plt.xlabel("")
plt.title("Comparação do tempo total de execução")
plt.tight_layout()
plt.show()

def stats(metric):
    x = df[df.group=="Solução proposta"][metric].dropna()
    y = df[df.group=="Solução standard"][metric].dropna()

    U, p = mannwhitneyu(x, y, alternative="less")
    r = U / (len(x) * len(y))

    print(f"\n{metric.upper()}")
    print(f"Mediana proposta: {np.median(x):.3f}")
    print(f"Mediana standard: {np.median(y):.3f}")
    print(f"U={U:.1f}, p={p:.4f}, r={r:.3f}")

def analyze_metric(metric, log_scale=False):
    # dados sem NaN
    x = df[df.group == "Solução proposta"][metric].dropna()
    y = df[df.group == "Solução standard"][metric].dropna()

    # ----- gráfico -----
    plt.figure(figsize=(7,4))
    sns.violinplot(data=df, x="group", y=metric, inner="box")

    if log_scale:
        plt.yscale("log")

    plt.title(metric.replace("_", " ").title())
    plt.xlabel("")
    plt.tight_layout()
    plt.show()

    # ----- estatística -----
    U, p = mannwhitneyu(x, y, alternative="less")
    r = U / (len(x) * len(y))

    print(f"\n{metric.upper()}")
    print(f"Mediana proposta: {np.median(x):.3f}")
    print(f"Mediana standard: {np.median(y):.3f}")
    print(f"U = {U:.1f} | p = {p:.4f} | r = {r:.3f}")

analyze_metric("time_per_target", log_scale=True)
analyze_metric("errors")
analyze_metric("success_rate")