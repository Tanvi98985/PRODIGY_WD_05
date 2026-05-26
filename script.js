/* ============================================================
   WEATHERLY - PREMIUM WEATHER APP
   Modern JavaScript with WeatherAPI Integration
   ============================================================ */

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const errorContainer = document.getElementById('errorContainer');
const unitToggle = document.getElementById('unitToggle');
const themeToggle = document.getElementById('themeToggle');
const weatherAssistantMessage = document.getElementById('weatherAssistantMessage');

// State
let isCelsius = true;
let isDarkMode = true;
let currentWeatherData = null;
let recentSearches = [];

/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  loadRecentSearches();
  fetchWeather('London'); // Load default city
});

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

unitToggle.addEventListener('click', toggleUnit);
themeToggle.addEventListener('click', toggleTheme);

/* ============================================================
   SEARCH FUNCTIONALITY
   ============================================================ */

function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError('Please enter a city name');
    return;
  }
  fetchWeather(city);
  addToRecentSearches(city);
}

function fetchWeather(city) {
  showLoading();
  clearError();

  fetch(
    `${WEATHER_API_BASE}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`
  )
    .then((res) => {
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(`City "${city}" not found. Please try another.`);
        }
        throw new Error('Failed to fetch weather data');
      }
      return res.json();
    })
    .then((data) => {
      currentWeatherData = data;
      renderWeather(data);
      generateWeatherAssistantMessage(data);
      updateWeatherBackground(data.current.condition.text);
    })
    .catch((error) => {
      showError(error.message);
    });
}

/* ============================================================
   RENDER WEATHER
   ============================================================ */

function renderWeather(data) {
  const { location, current } = data;

  const temp = isCelsius ? current.temp_c : current.temp_f;
  const feelsLike = isCelsius ? current.feelslike_c : current.feelslike_f;
  const humidity = current.humidity;
  const windSpeed = isCelsius ? current.wind_kph : current.wind_mph;
  const windUnit = isCelsius ? 'km/h' : 'mph';
  const visibility = isCelsius ? current.vis_km : current.vis_miles;
  const visUnit = isCelsius ? 'km' : 'mi';
  const pressure = current.pressure_mb;
  const condition = current.condition.text;
  const icon = current.condition.icon;
  const unit = isCelsius ? '°C' : '°F';

  // Debugging logs for data verification
  console.log("Temperature:", temp);
  console.log("Humidity:", humidity);
  console.log("Wind:", windSpeed);
  console.log("Visibility:", visibility);
  console.log("Pressure:", pressure);
  console.log("DOM Update:", { location: location.name, temp, humidity });

  weatherCard.innerHTML = `
    <div class="weather-card-content">
      <div class="city-header">
        <h2 class="city-name">${location.name}, ${location.country}</h2>
        <p class="weather-condition">${condition}</p>
      </div>
      <div class="weather-icon-display">
        <img src="https:${icon}" alt="${condition}" loading="lazy" />
      </div>
      <div class="temperature-display">${temp.toFixed(1)}${unit}</div>
      <p class="feels-like">Feels like ${feelsLike.toFixed(1)}${unit}</p>
    </div>
  `;

  // Update detail cards
  updateDetailCard('detail-humidity', `${humidity}%`);
  updateDetailCard('detail-wind', `${windSpeed.toFixed(1)} ${windUnit}`);
  updateDetailCard('detail-visibility', `${visibility.toFixed(1)} ${visUnit}`);
  updateDetailCard('detail-pressure', `${pressure} mb`);

  cityInput.value = location.name;
}

function updateDetailCard(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    const valueElement = element.querySelector('.detail-value');
    if (valueElement) {
      valueElement.textContent = value;
    }
  }
}

/* ============================================================
   WEATHER ASSISTANT
   ============================================================ */

function generateWeatherAssistantMessage(data) {
  const { current, location } = data;
  const condition = current.condition.text.toLowerCase();
  const temp = isCelsius ? current.temp_c : current.temp_f;
  const unit = isCelsius ? '°C' : '°F';
  const humidity = current.humidity;
  const windSpeed = isCelsius ? current.wind_kph : current.wind_mph;
  const windUnit = isCelsius ? 'km/h' : 'mph';

  let insight = '';

  if (condition.includes('rain')) {
    insight = `🌧️ Rainy weather in ${location.name}! Stay hydrated and consider carrying an umbrella. Current conditions: ${temp.toFixed(1)}${unit} with ${humidity}% humidity.`;
  } else if (condition.includes('sunny') || condition.includes('clear')) {
    insight = `☀️ Beautiful sunny day in ${location.name}! Perfect for outdoor activities. Don't forget sunscreen - temperature is ${temp.toFixed(1)}${unit}.`;
  } else if (condition.includes('cloud')) {
    insight = `☁️ Mostly cloudy in ${location.name}. Good day for a walk without intense UV exposure. Temperature: ${temp.toFixed(1)}${unit}.`;
  } else if (condition.includes('wind')) {
    insight = `💨 Windy conditions in ${location.name} with winds up to ${windSpeed.toFixed(1)} ${windUnit}. Secure loose items and dress accordingly. Current temp: ${temp.toFixed(1)}${unit}.`;
  } else if (condition.includes('snow')) {
    insight = `❄️ Snowy weather alert in ${location.name}! Dress warmly and exercise caution. Temperature: ${temp.toFixed(1)}${unit}.`;
  } else if (condition.includes('fog') || condition.includes('mist')) {
    insight = `🌫️ Foggy conditions in ${location.name}. Reduced visibility - drive safely and use headlights. Current temp: ${temp.toFixed(1)}${unit}.`;
  } else if (condition.includes('thunder')) {
    insight = `⛈️ Thunderstorms expected in ${location.name}. Stay indoors and avoid outdoor activities. Temperature: ${temp.toFixed(1)}${unit}.`;
  } else {
    insight = `Weather in ${location.name}: ${condition}. Temperature ${temp.toFixed(1)}${unit}, humidity ${humidity}%, winds ${windSpeed.toFixed(1)} ${windUnit}.`;
  }

  weatherAssistantMessage.textContent = insight;
}

/* ============================================================
   UNIT TOGGLE
   ============================================================ */

function toggleUnit() {
  isCelsius = !isCelsius;
  unitToggle.innerHTML = `<span class="btn-icon">${isCelsius ? '°C' : '°F'}</span>`;

  if (currentWeatherData) {
    renderWeather(currentWeatherData);
    generateWeatherAssistantMessage(currentWeatherData);
  }
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */

function initializeTheme() {
  const savedTheme = localStorage.getItem('weatherlyTheme') || 'dark';
  isDarkMode = savedTheme === 'dark';
  applyTheme();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  applyTheme();
  localStorage.setItem('weatherlyTheme', isDarkMode ? 'dark' : 'light');
  // Update background for current weather when theme changes
  if (currentWeatherData) {
    updateWeatherBackground(currentWeatherData.current.condition.text);
  }
}

function applyTheme() {
  if (isDarkMode) {
    document.body.classList.remove('light-mode');
    themeToggle.innerHTML = '<span class="btn-icon">🌙</span>';
  } else {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<span class="btn-icon">☀️</span>';
  }
}

/* ============================================================
   DYNAMIC BACKGROUND
   ============================================================ */

function updateWeatherBackground(condition) {
  const bgGradient = document.querySelector('.bg-gradient');
  if (!bgGradient) return;

  condition = condition.toLowerCase();

  if (isDarkMode) {
    // Dark mode backgrounds
    if (condition.includes('rain')) {
      bgGradient.style.background = 'linear-gradient(135deg, #0f172a 0%, #1a365d 25%, #0f172a 50%, #1e293b 75%, #0f172a 100%)';
    } else if (condition.includes('sunny') || condition.includes('clear')) {
      bgGradient.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #1e3a8a 50%, #0f172a 75%, #1e3a8a 100%)';
    } else if (condition.includes('cloud')) {
      bgGradient.style.background = 'linear-gradient(135deg, #0f172a 0%, #1a365d 25%, #334155 50%, #1e293b 75%, #0f172a 100%)';
    } else if (condition.includes('snow')) {
      bgGradient.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #475569 50%, #1e293b 75%, #0f172a 100%)';
    } else {
      bgGradient.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
    }
  } else {
    // Light mode backgrounds
    if (condition.includes('rain')) {
      bgGradient.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 25%, #e0f2fe 50%, #cffafe 75%, #e0f2fe 100%)';
    } else if (condition.includes('sunny') || condition.includes('clear')) {
      bgGradient.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde047 25%, #fef3c7 50%, #f8fafc 75%, #fef3c7 100%)';
    } else if (condition.includes('cloud')) {
      bgGradient.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 25%, #e2e8f0 50%, #d1d5db 75%, #f1f5f9 100%)';
    } else if (condition.includes('snow')) {
      bgGradient.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #d1d5db 50%, #cbd5e1 75%, #f8fafc 100%)';
    } else {
      bgGradient.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)';
    }
  }
}

/* ============================================================
   ERROR HANDLING
   ============================================================ */

function showError(message) {
  clearError();
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-container';
  errorDiv.innerHTML = `
    <h3>⚠️ Error</h3>
    <p>${message}</p>
  `;
  errorContainer.appendChild(errorDiv);
}

function clearError() {
  errorContainer.innerHTML = '';
}

/* ============================================================
   LOADING STATE
   ============================================================ */

function showLoading() {
  weatherCard.innerHTML = `
    <div class="loading-animation">
      <div class="spinner"></div>
      <p>Loading weather data...</p>
    </div>
  `;
  clearError();
}

/* ============================================================
   RECENT SEARCHES
   ============================================================ */

function loadRecentSearches() {
  const saved = localStorage.getItem('recentSearches');
  if (saved) {
    recentSearches = JSON.parse(saved);
  }
}

function addToRecentSearches(city) {
  if (!recentSearches.includes(city)) {
    recentSearches.unshift(city);
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

// Temperature conversion (if needed)
function celsius2Fahrenheit(c) {
  return (c * 9) / 5 + 32;
}

function fahrenheit2Celsius(f) {
  return ((f - 32) * 5) / 9;
}
