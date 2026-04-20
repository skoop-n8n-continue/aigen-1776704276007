const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=31.5204&longitude=74.3587&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto';

const weatherCodes = {
    0: { desc: 'Clear sky', icon: 'sun' },
    1: { desc: 'Mainly clear', icon: 'sun' },
    2: { desc: 'Partly cloudy', icon: 'cloud-sun' },
    3: { desc: 'Overcast', icon: 'cloud' },
    45: { desc: 'Fog', icon: 'cloud-fog' },
    48: { desc: 'Depositing rime fog', icon: 'cloud-fog' },
    51: { desc: 'Light drizzle', icon: 'cloud-drizzle' },
    53: { desc: 'Moderate drizzle', icon: 'cloud-drizzle' },
    55: { desc: 'Dense drizzle', icon: 'cloud-drizzle' },
    61: { desc: 'Slight rain', icon: 'cloud-rain' },
    63: { desc: 'Moderate rain', icon: 'cloud-rain' },
    65: { desc: 'Heavy rain', icon: 'cloud-rain' },
    71: { desc: 'Slight snow fall', icon: 'snowflake' },
    73: { desc: 'Moderate snow fall', icon: 'snowflake' },
    75: { desc: 'Heavy snow fall', icon: 'snowflake' },
    80: { desc: 'Slight rain showers', icon: 'cloud-rain' },
    81: { desc: 'Moderate rain showers', icon: 'cloud-rain' },
    82: { desc: 'Violent rain showers', icon: 'cloud-lightning' },
    95: { desc: 'Thunderstorm', icon: 'cloud-lightning' },
    96: { desc: 'Thunderstorm with slight hail', icon: 'cloud-lightning' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'cloud-lightning' },
};

async function fetchWeather() {
    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        updateUI(data);
        saveToLocalStorage(data);
    } catch (error) {
        console.error('Fetch error:', error);
        loadFromLocalStorage();
    }
}

function updateUI(data) {
    const current = data.current;
    const daily = data.daily;

    // Current weather
    const code = current.weather_code;
    const weatherInfo = weatherCodes[code] || { desc: 'Unknown', icon: 'help-circle' };

    document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
    document.getElementById('weather-description').textContent = weatherInfo.desc;

    const iconContainer = document.getElementById('weather-icon-container');
    iconContainer.innerHTML = `<i data-lucide="${weatherInfo.icon}" class="main-weather-icon"></i>`;

    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;

    // Date and time
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('last-updated').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    });

    // Forecast
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    // Next 5 days
    for (let i = 1; i <= 5; i++) {
        const dayDate = new Date(daily.time[i]);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayCode = daily.weather_code[i];
        const dayInfo = weatherCodes[dayCode] || { desc: 'Unknown', icon: 'help-circle' };
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <i data-lucide="${dayInfo.icon}" class="forecast-icon"></i>
            <span class="forecast-temp">${maxTemp}° / ${minTemp}°</span>
        `;
        forecastContainer.appendChild(item);
    }

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function saveToLocalStorage(data) {
    localStorage.setItem('weather_data', JSON.stringify({
        data: data,
        timestamp: new Date().getTime()
    }));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('weather_data');
    if (stored) {
        const parsed = JSON.parse(stored);
        updateUI(parsed.data);
    }
}

// Initial fetch
fetchWeather();

// Update every 30 minutes
setInterval(fetchWeather, 30 * 60 * 1000);
