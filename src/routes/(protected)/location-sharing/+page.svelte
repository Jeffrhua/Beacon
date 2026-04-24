<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import 'leaflet/dist/leaflet.css';
	import type { SharedLocation } from '$lib/types.d.ts';

	let { data } = $props();

	let mapContainer: HTMLElement;
	let map: any;
	let L: any;

	let isSharing = $state(data.isActive as boolean);
	let selectedFriends = $state<Set<string>>(new Set(data.sharingWith as string[]));

	// Live friend locations (updated via WebSocket)
	let friendLocations = $state<Map<string, { name: string; lat: number; lng: number }>>(
		new Map(
			(data.friendLocations as SharedLocation[]).map((f) => [
				f.id,
				{ name: f.name, lat: f.latitude, lng: f.longitude }
			])
		)
	);

	let socket: WebSocket;
	let watchId: number | null = null;
	let myMarker: any = null;
	const friendMarkers = new Map<string, any>();

	function toggleFriend(friendId: string) {
		const next = new Set(selectedFriends);
		if (next.has(friendId)) next.delete(friendId);
		else next.add(friendId);
		selectedFriends = next;
	}

	function buildDotIcon(color: string, label: string) {
		return L.divIcon({
			className: '',
			html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)" title="${label}"></div>`,
			iconSize: [14, 14],
			iconAnchor: [7, 7]
		});
	}

	function updateFriendMarker(id: string, name: string, lat: number, lng: number) {
		if (!map || !L) return;
		if (friendMarkers.has(id)) {
			friendMarkers.get(id).setLatLng([lat, lng]);
		} else {
			const m = L.marker([lat, lng], { icon: buildDotIcon('#10b981', name) })
				.addTo(map)
				.bindPopup(`<b>${name}</b>`);
			friendMarkers.set(id, m);
		}
	}

	function removeFriendMarker(id: string) {
		const m = friendMarkers.get(id);
		if (m && map) {
			map.removeLayer(m);
			friendMarkers.delete(id);
		}
	}

	function startLocationWatch() {
		if (!navigator.geolocation) return;
		watchId = navigator.geolocation.watchPosition(
			(pos) => {
				const { latitude, longitude, accuracy } = pos.coords;

				if (map && L) {
					if (!myMarker) {
						myMarker = L.marker([latitude, longitude], { icon: buildDotIcon('#3b82f6', 'You') })
							.addTo(map)
							.bindPopup('<b>You</b>');
						map.setView([latitude, longitude], 15);
					} else {
						myMarker.setLatLng([latitude, longitude]);
					}
				}

				if (socket && socket.readyState === WebSocket.OPEN && selectedFriends.size > 0) {
					socket.send(
						JSON.stringify({
							type: 'location_update',
							latitude,
							longitude,
							accuracy,
							to: [...selectedFriends]
						})
					);
				}
			},
			(err) => console.error('Geolocation error:', err),
			{ enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
		);
	}

	function stopLocationWatch() {
		if (watchId !== null) {
			navigator.geolocation.clearWatch(watchId);
			watchId = null;
		}
		if (myMarker && map) {
			map.removeLayer(myMarker);
			myMarker = null;
		}
		if (socket && socket.readyState === WebSocket.OPEN && selectedFriends.size > 0) {
			socket.send(JSON.stringify({ type: 'location_stop', to: [...selectedFriends] }));
		}
	}

	onMount(async () => {
		L = (await import('leaflet')).default;
		map = L.map(mapContainer).setView([33.78, -118.11], 11);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(map);

		// Render any already-shared friend locations from server
		for (const [id, loc] of friendLocations) {
			updateFriendMarker(id, loc.name, loc.lat, loc.lng);
		}

		socket = new WebSocket('ws://localhost:8080');

		socket.addEventListener('open', () => {
			socket.send(JSON.stringify({ type: 'register', userId: data.userId }));
		});

		socket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === 'location_update') {
				const friend = (data.friends as any[]).find((f) => f.id === msg.from);
				const name = friend?.name ?? 'Friend';
				friendLocations = new Map(friendLocations).set(msg.from, {
					name,
					lat: msg.latitude,
					lng: msg.longitude
				});
				updateFriendMarker(msg.from, name, msg.latitude, msg.longitude);
			}

			if (msg.type === 'location_stop') {
				const next = new Map(friendLocations);
				next.delete(msg.from);
				friendLocations = next;
				removeFriendMarker(msg.from);
			}
		});

		if (isSharing) startLocationWatch();

		return () => {
			socket?.close();
			if (watchId !== null) navigator.geolocation.clearWatch(watchId);
		};
	});
</script>

<div class="flex h-full flex-col gap-4 p-4 md:flex-row">
	<!-- Left panel: controls -->
	<div class="flex w-full flex-col gap-4 md:w-72 md:flex-shrink-0">
		<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#17191C]">
			<h2 class="mb-1 text-lg font-bold text-gray-900 dark:text-white">Share My Location</h2>
			<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
				Select friends to share your live location with.
			</p>

			<!-- Friend checkboxes -->
			{#if (data.friends as any[]).length === 0}
				<p class="text-sm text-gray-400">Add friends to start sharing.</p>
			{:else}
				<ul class="mb-4 space-y-2">
					{#each data.friends as friend (friend.id)}
						<li class="flex items-center gap-3">
							<input
								type="checkbox"
								id="friend-{friend.id}"
								checked={selectedFriends.has(friend.id)}
								onchange={() => toggleFriend(friend.id)}
								disabled={isSharing}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label
								for="friend-{friend.id}"
								class="text-sm text-gray-800 dark:text-gray-200 {isSharing
									? 'cursor-not-allowed opacity-60'
									: 'cursor-pointer'}"
							>
								{friend.name}
							</label>
						</li>
					{/each}
				</ul>
			{/if}

			<!-- Start sharing form -->
			{#if !isSharing}
				<form
					method="POST"
					action="?/startSharing"
					use:enhance={() =>
						async ({ result, update }) => {
							if (result.type === 'success' || result.type === 'redirect') {
								isSharing = true;
								startLocationWatch();
							}
							await update({ reset: false });
						}}
				>
					{#each [...selectedFriends] as friendId}
						<input type="hidden" name="sharingWith" value={friendId} />
					{/each}
					<button
						type="submit"
						disabled={selectedFriends.size === 0}
						class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Start Sharing
					</button>
				</form>
			{:else}
				<!-- Stop sharing form -->
				<form
					method="POST"
					action="?/stopSharing"
					use:enhance={() =>
						async ({ result, update }) => {
							stopLocationWatch();
							if (result.type === 'success' || result.type === 'redirect') {
								isSharing = false;
							}
							await update({ reset: false });
						}}
				>
					<div
						class="mb-3 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 dark:bg-green-900/20"
					>
						<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
						<span class="text-sm font-medium text-green-700 dark:text-green-400"
							>Sharing live location</span
						>
					</div>
					<button
						type="submit"
						class="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
					>
						Stop Sharing
					</button>
				</form>
			{/if}
		</div>

		<!-- Friends sharing with me -->
		<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#17191C]">
			<h3 class="mb-3 text-sm font-bold text-gray-900 dark:text-white">Shared With You</h3>
			{#if friendLocations.size === 0}
				<p class="text-sm text-gray-400">No friends are sharing their location right now.</p>
			{:else}
				<ul class="space-y-2">
					{#each [...friendLocations.entries()] as [id, loc]}
						<li class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<span class="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
							{loc.name}
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Legend -->
		<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#17191C]">
			<h3 class="mb-2 text-sm font-bold text-gray-900 dark:text-white">Legend</h3>
			<div class="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
				<div class="flex items-center gap-2">
					<span class="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
					You
				</div>
				<div class="flex items-center gap-2">
					<span class="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
					Friend
				</div>
			</div>
		</div>
	</div>

	<!-- Map -->
	<div
		bind:this={mapContainer}
		class="min-h-[400px] flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600"
	></div>
</div>

<style>
	:global(.leaflet-container) {
		height: 100%;
		width: 100%;
		border-radius: 8px;
	}
</style>
