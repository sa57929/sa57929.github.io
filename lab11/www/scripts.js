const APIKEY = "3844b2d3bffbd7affa454d51289d2996";
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const searchbox = document.getElementById("searchbox");
const searchbutton = document.getElementById("searchbutton");
const errorbox = document.getElementById("errorbox");
const currentbox = document.getElementById("currentbox");
const forecastbox = document.getElementById("forecastbox");

searchbutton.addEventListener("click", onSearch);
searchbox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSearch();
});

function onSearch() {
  const query = searchbox.value.trim();
  clearError();
  if (!query) {
    showError("adres/miasto");
    return;
  }
  fetchCurrent(query);
  fetchForecast(query);
}

function buildUrl(base, query) {
  const params = new URLSearchParams({
    q: query,
    appid: APIKEY,
    units: "metric",
    lang: "pl",
  });
  return `${base}?${params.toString()}`;
}

function fetchCurrent(query) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", buildUrl(CURRENT_URL, query), true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200) {
      try {
        const data = JSON.parse(xhr.responseText);

        console.log(data)
        renderCurrent(data);
      } catch (err) {
        showError("blad Json od api LOL");
      }
    } else {
      showError(`blad API (status ${xhr.status}).`);
      currentbox.classList.remove("visible");
    }
  };
  xhr.onerror = function () {
    showError("Blad api dzisiejsza prognoze.");
  };
  xhr.send();
}

function fetchForecast(query) {
  fetch(buildUrl(FORECAST_URL, query))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {console.log(data); renderForecast(data)})
    .catch((err) => {
      showError(`blad API (prognoza na 5 dni) (${err.message}).`);
      forecastbox.innerHTML = "";
    });
}

function renderCurrent(data) {
  const dt = new Date(data.dt * 1000);

  currentbox.querySelector(".datetimeVal").textContent = formatDateTime(dt);
  currentbox.querySelector(".citynameVal").textContent =
    `${data.name}${data?.sys?.country ? ", " + data.sys.country : ""}`;

  currentbox.querySelector(".realtempVal").textContent = Math.round(
    data.main?.temp,
  );

  currentbox.querySelector(".felttempVal").textContent = Math.round(
    data.main?.feels_like,
  );

  const w = data?.weather[0];

  currentbox.querySelector(".weatherval").textContent = w ? w.description : "";
  const iconEl = currentbox.querySelector(".icon");

  iconEl.innerHTML = "";

  if (w?.icon) {
    const img = document.createElement("img");

    img.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
    img.alt = w.description || "";

    iconEl.appendChild(img);
  }
  currentbox.classList.add("visible");
}

function renderForecast(data) {
  forecastbox.innerHTML = "";
  if (!data.list) return;

  const byDay = {};

  data.list.forEach((entry) => {
    const d = new Date(entry.dt * 1000);
    const key = localDateKey(d);

    const hourDiff = Math.abs(d.getHours() - 12);

    if (!byDay[key] || hourDiff < byDay[key]._hourDiff) {
      byDay[key] = Object.assign({}, entry, { _hourDiff: hourDiff });
    }
  });

  const todayKey = localDateKey(new Date());
  const days = Object.keys(byDay)
    .filter((k) => k > todayKey)
    .sort()
    .slice(0, 5);

  days.forEach((key) => {
    const entry = byDay[key];
    const date = new Date(entry.dt * 1000);

    const card = document.createElement("div");
    card.className = "forecast-card column";

    const dateLabel = document.createElement("span");
    dateLabel.className = "fc-date";
    dateLabel.textContent = formatDate(date);

    card.appendChild(dateLabel);

    const w = entry.weather && entry.weather[0];
    if (w?.icon) {
      const img = document.createElement("img");
      img.className = "fc-icon";
      img.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
      img.alt = w.description || "";

      card.appendChild(img);
    }

    const temp = document.createElement("span");
    temp.className = "fc-temp";
    temp.textContent = `${Math.round(entry.main.temp)} °C`;
    card.appendChild(temp);

    const felt = document.createElement("span");
    felt.className = "fc-felt";
    felt.textContent = `Odczuwalna: ${Math.round(entry.main.feels_like)} °C`;
    card.appendChild(felt);

    const desc = document.createElement("span");
    desc.className = "fc-desc";
    desc.textContent = w?.description;
    card.appendChild(desc);

    forecastbox.appendChild(card);
  });
}

function formatDateTime(d) {
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(d) {
  return d.toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function showError(msg) {
  errorbox.textContent = msg;
  errorbox.classList.add("visible");
}

function clearError() {
  errorbox.textContent = "";
  errorbox.classList.remove("visible");
}
