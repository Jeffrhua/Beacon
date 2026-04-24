<script>
	export let data;
</script>

<div style="max-width: 600px; margin: 50px auto; padding: 20px;">
	<h1 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">Weather Alerts</h1>

	{#if data.alerts.length > 0}
		<div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
			<h2 style="margin: 0 0 10px 0;">⚠️ ACTIVE ALERTS</h2>
			{#each data.alerts as alert}
				<p style="margin: 5px 0; font-weight: bold;">{alert.type}: {alert.message}</p>
			{/each}
		</div>
	{:else}
		<div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
			<p style="margin: 0; font-weight: bold;">✓ No active weather alerts</p>
		</div>
	{/if}

	<div style="background: white; padding: 20px; border: 2px solid #ccc; border-radius: 8px;">
		<h2>Current Conditions - Long Beach, CA</h2>
		<p><strong>Temperature:</strong> {data.weather.temp}°F</p>
		<p><strong>Conditions:</strong> {data.weather.description}</p>
		<p><strong>Humidity:</strong> {data.weather.humidity}%</p>
		<p><strong>Wind Speed:</strong> {data.weather.windSpeed} mph</p>
	</div>
</div>