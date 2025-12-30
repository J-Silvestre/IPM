import json
import numpy as np
from scipy.stats import mannwhitneyu

# ---------- Load data ----------
with open("Dados - Projeto B/dados_nosso.json") as f:
    data = json.load(f)

# ---------- Helper: grupo etário ----------
def get_age_group(age):
    if 20 <= age <= 30:
        return "20-30"
    elif 50 <= age <= 60:
        return "50-60"
    else:
        return None

# ---------- Feature extraction ----------
def extract_metrics(data):
    metrics = {
        "20-30": {
            "elapsed": [],
            "time_per_target": [],
            "success_rate": [],
            "errors": []
        },
        "50-60": {
            "elapsed": [],
            "time_per_target": [],
            "success_rate": [],
            "errors": []
        }
    }

    for u in data.values():
        group = get_age_group(u["age"])
        if group is None:
            continue

        metrics[group]["elapsed"].append(u["elapsed"])

        # tempo por alvo
        if u["successes"] > 0:
            metrics[group]["time_per_target"].append(
                u["elapsed"] / u["successes"]
            )
        else:
            metrics[group]["time_per_target"].append(np.nan)

        # taxa de sucesso
        if u["length"] > 0:
            metrics[group]["success_rate"].append(
                u["successes"] / u["length"]
            )
        else:
            metrics[group]["success_rate"].append(np.nan)

        metrics[group]["errors"].append(
            u["mistakes"] + u["failures"]
        )

    # converter para numpy
    for g in metrics:
        for m in metrics[g]:
            metrics[g][m] = np.array(metrics[g][m], dtype=float)

    return metrics

metrics = extract_metrics(data)

# ---------- Statistical test ----------
def compare(metric_name):
    x = metrics["20-30"][metric_name]
    y = metrics["50-60"][metric_name]

    # remover NaN
    x = x[~np.isnan(x)]
    y = y[~np.isnan(y)]

    U, p = mannwhitneyu(x, y, alternative="two-sided")
    r = U / (len(x) * len(y))

    print(f"\n{metric_name.upper()}")
    print(f"20–30 median: {np.median(x):.3f}")
    print(f"50–60 median: {np.median(y):.3f}")
    print(f"U = {U:.1f}, p = {p:.4f}, r = {r:.3f}")

# ---------- Run comparisons ----------
compare("elapsed")
compare("time_per_target")
compare("success_rate")
compare("errors")