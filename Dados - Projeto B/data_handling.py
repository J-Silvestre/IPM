import json
import numpy as np
from scipy.stats import mannwhitneyu

# ---------- Load data ----------
with open("Dados - Projeto B/dados_nosso.json") as f:
    nosso = json.load(f)

with open("Dados - Projeto B/dados_prof.json") as f:
    prof = json.load(f)

# ---------- Feature extraction ----------
def extract_metrics(data):
    elapsed = []
    time_per_target = []
    success_rate = []
    errors = []

    for u in data.values():
        elapsed.append(u["elapsed"])

        # tempo por alvo (evita divisão por zero)
        if u["successes"] > 0:
            time_per_target.append(u["elapsed"] / u["successes"])
        else:
            time_per_target.append(np.nan)

        # taxa de sucesso (evita divisão por zero)
        if u["length"] > 0:
            success_rate.append(u["successes"] / u["length"])
        else:
            success_rate.append(np.nan)

        errors.append(u["mistakes"] + u["failures"])

    return {
        "elapsed": np.array(elapsed, dtype=float),
        "time_per_target": np.array(time_per_target, dtype=float),
        "success_rate": np.array(success_rate, dtype=float),
        "errors": np.array(errors, dtype=float)
    }

nosso_m = extract_metrics(nosso)
prof_m = extract_metrics(prof)

# ---------- Statistical test ----------
def compare(metric_name):
    x = nosso_m[metric_name]
    y = prof_m[metric_name]

    # remover NaN
    x = x[~np.isnan(x)]
    y = y[~np.isnan(y)]

    U, p = mannwhitneyu(x, y, alternative="less")

    r = U / (len(x) * len(y))  # efeito (rank-biserial approx.)

    print(f"\n{metric_name.upper()}")
    print(f"Nosso  median: {np.median(x):.3f}")
    print(f"Prof   median: {np.median(y):.3f}")
    print(f"U = {U:.1f}, p = {p:.4f}, r = {r:.3f}")

# ---------- Run comparisons ----------
compare("elapsed")
compare("time_per_target")
compare("success_rate")
compare("errors")