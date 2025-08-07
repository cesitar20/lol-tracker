const ENDPOINT = "/api/fetch_matches";
let isSearching = false;

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function setStatColor(elementId, value, thresholds) {
  const el = document.getElementById(elementId);
  el.classList.remove(
    "text-success",
    "text-warning",
    "text-danger",
    "text-light"
  );

  if (thresholds) {
    if (value < thresholds.low) {
      el.classList.add("text-danger");
    } else if (value < thresholds.high) {
      el.classList.add("text-warning");
    } else {
      el.classList.add("text-success");
    }
  } else {
    el.classList.add("text-light"); // For totalMatches and avgVision
  }
}

function updateStats(matches) {
  const total = matches.length;
  const totalEl = document.getElementById("totalMatches");
  totalEl.textContent = total;
  setStatColor("totalMatches", 0, null); // always white

  if (total > 0) {
    const wins = matches.filter((m) => m.win).length;
    const winRate = ((wins / total) * 100).toFixed(1);
    const kdas = matches.map(
      (m) => (m.kills + m.assists) / Math.max(m.deaths, 1)
    );
    const avgKda = (kdas.reduce((sum, kda) => sum + kda, 0) / total).toFixed(2);
    const totalVision = matches.reduce((sum, m) => sum + m.visionScore, 0);
    const avgVision = Math.round(totalVision / total);

    document.getElementById("winRate").textContent = winRate + "%";
    setStatColor("winRate", parseFloat(winRate), { low: 39, high: 51 });

    document.getElementById("avgKda").textContent = avgKda;
    setStatColor("avgKda", parseFloat(avgKda), { low: 1, high: 2 });

    document.getElementById("avgVision").textContent = avgVision;
    setStatColor("avgVision", 0, null); // always white
  } else {
    document.getElementById("winRate").textContent = "0%";
    document.getElementById("avgKda").textContent = "0.00";
    document.getElementById("avgVision").textContent = "0";

    setStatColor("winRate", 0, { low: 39, high: 51 });
    setStatColor("avgKda", 0, { low: 1, high: 2 });
    setStatColor("avgVision", 0, null);
  }
}

async function buscarPartidas() {
  if (isSearching) {
    console.warn("[WARN] Búsqueda ya en curso");
    return;
  }
  isSearching = true;
  const btn = document.getElementById("btnBuscar");
  btn.disabled = true;

  window.toaster.showInfoToast({ text: "Iniciando búsqueda..." });

  const name = document.getElementById("summonerName").value.trim();
  const tag = document.getElementById("tagLine").value.trim();
  const queue = document.getElementById("queueSelect").value;
  const days = document.getElementById("daysFilter").value;

  console.log("[INFO] Inputs:", { name, tag, queue, days });

  if (!name || !tag) {
    window.toaster.showErrorToast({ text: "Falta nombre o tag" });
    btn.disabled = false;
    isSearching = false;
    return;
  }

  const url =
    `${ENDPOINT}?gameName=${encodeURIComponent(name)}` +
    `&tagLine=${encodeURIComponent(tag)}` +
    `&queueId=${encodeURIComponent(queue)}` +
    `&days=${encodeURIComponent(days)}`;
  console.log("[INFO] Fetching:", url);

  try {
    const res = await fetch(url);
    console.log("[DEBUG] Status:", res.status);
    if (!res.ok) {
      const err = await res.json();
      console.error("[ERROR] API:", err);
      window.toaster.showErrorToast({ text: err.error || "Error en API" });
      return;
    }
    const { matches } = await res.json();
    console.log("[INFO] Matches recibidos:", matches);
    window.toaster.showSuccessToast({
      text: `Encontradas ${matches.length} partidas`,
    });

    const tbody = document.querySelector("#tablaResultados tbody");
    tbody.innerHTML = "";
    if (!matches.length) {
      const row = document.createElement("tr");
      row.innerHTML =
        '<td colspan="11" style="text-align:center">No se encontraron partidas.</td>';
      tbody.appendChild(row);
    } else {
      matches.forEach((m) => {
        console.log("[DEBUG] Render:", m.matchId);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.champion}</td>
          <td>${m.kills}/${m.deaths}/${m.assists}</td>
          <td>${m.win ? "✅" : "❌"}</td>
          <td>${m.minions}</td>
          <td>${m.lane}</td>
          <td>${m.rival || "N/A"}</td>
          <td>${formatDuration(m.duration)}</td>
          <td>${m.totalGold.toLocaleString()}</td>
          <td>${m.gameType}</td>
          <td>${formatDate(m.gameDate)}</td>
          <td>${m.visionScore}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    updateStats(matches);
  } catch (err) {
    console.error("[ERROR] Exception:", err);
    window.toaster.showErrorToast({ text: "Error en conexión" });
  } finally {
    btn.disabled = false;
    isSearching = false;
  }
}

document.getElementById("btnBuscar").addEventListener("click", buscarPartidas);
