import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { WEATHER_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/sign-in');

	const lat = 33.78;
	const lon = -118.11;

	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
		);
		
		if (!response.ok) {
			throw new Error(`API returned ${response.status}`);
		}
		
		const weather = await response.json();

		const alerts = [];
		
		if (weather.weather?.[0]?.main === 'Thunderstorm' || weather.weather?.[0]?.main === 'Tornado') {
			alerts.push({ type: 'SEVERE', message: `${weather.weather[0].main} detected!` });
		}
		
		if (weather.main?.temp > 100) {
			alerts.push({ type: 'WARNING', message: 'Extreme heat warning!' });
		}
		
		if (weather.wind?.speed > 25) {
			alerts.push({ type: 'WARNING', message: 'High wind warning!' });
		}

		return {
			weather: {
				temp: Math.round(weather.main?.temp || 72),
				description: weather.weather?.[0]?.description || 'clear',
				humidity: weather.main?.humidity || 50,
				windSpeed: Math.round(weather.wind?.speed || 5)
			},
			alerts
		};
	} catch (err) {
		console.error('Weather fetch failed:', err);
		// Return mock data as fallback
		return {
			weather: {
				temp: 72,
				description: 'partly cloudy',
				humidity: 65,
				windSpeed: 10
			},
			alerts: []
		};
	}
};