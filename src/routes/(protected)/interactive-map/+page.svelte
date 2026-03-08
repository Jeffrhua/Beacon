<script>
    import { onMount } from 'svelte';
    import 'leaflet/dist/leaflet.css';

    let mapContainer;
    let map;
    let L;
    let addingIncident = false;
    let incidentForm = {
        lat: null,
        lng: null,
        description: '',
        address: '',
        groupId: ''
    };
    let tempMarker = null;

    export let data;

    onMount(async () => {
        L = (await import('leaflet')).default;

        map = L.map(mapContainer).setView([33.78, -118.11], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        data.incidents.forEach(incident => {
            L.marker([incident.lat, incident.lng])
                .addTo(map)
                .bindPopup(`<b>${incident.description}</b><br>${incident.address || 'No address'}`);
        });
    });

    function startAddingIncident() {
        addingIncident = true;
        alert('Click on the map where the incident occurred');
        map.on('click', onMapClick);
    }

    function onMapClick(e) {
        incidentForm.lat = e.latlng.lat;
        incidentForm.lng = e.latlng.lng;

        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
            .then(res => res.json())
            .then(data => { incidentForm.address = data.display_name || ''; })
            .catch(() => { incidentForm.address = 'Address not found'; });
    }

    function cancelIncident() {
        addingIncident = false;
        map.off('click', onMapClick);
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
        incidentForm = { lat: null, lng: null, description: '', address: '', groupId: '' };
    }

    async function submitIncident() {
        if (!incidentForm.description) {
            alert('Please enter a description');
            return;
        }
        if (!incidentForm.groupId) {
            alert('Please select a group');
            return;
        }

        const response = await fetch('?/addIncident', {
            method: 'POST',
            body: new FormData(document.getElementById('incidentForm'))
        });

        if (response.ok) {
            map.off('click', onMapClick);
            if (tempMarker) map.removeLayer(tempMarker);

            L.marker([incidentForm.lat, incidentForm.lng])
                .addTo(map)
                .bindPopup(`<b>${incidentForm.description}</b><br>${incidentForm.address || 'No address'}`);

            addingIncident = false;
            incidentForm = { lat: null, lng: null, description: '', address: '', groupId: '' };
        }
    }
</script>

<h1 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">My Map</h1>

{#if addingIncident && incidentForm.lat}
    <div style="max-width: 600px; margin: 0 auto 20px; padding: 20px; border: 2px solid #ccc; border-radius: 8px; background: white;">
        <h2 style="margin-top: 0;">Report Incident</h2>

        <form id="incidentForm" on:submit|preventDefault={submitIncident}>
            <input type="hidden" name="lat" value={incidentForm.lat} />
            <input type="hidden" name="lng" value={incidentForm.lng} />

            <!-- GROUP SELECTOR -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Report to Group:</label>
                <select
                    name="groupId"
                    bind:value={incidentForm.groupId}
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                    required
                >
                    <option value="">Select a group...</option>
                    {#each data.groups as group}
                        <option value={group.id}>{group.title}</option>
                    {/each}
                </select>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Address:</label>
                <input
                    type="text"
                    name="address"
                    bind:value={incidentForm.address}
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">What happened?</label>
                <textarea
                    name="description"
                    bind:value={incidentForm.description}
                    placeholder="e.g., Car crash, Robbery, Fire, etc."
                    rows="3"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                    required
                ></textarea>
            </div>

            <div style="display: flex; gap: 10px;">
                <button
                    type="submit"
                    style="flex: 1; padding: 10px; background-color: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer;"
                >
                    Submit
                </button>
                <button
                    type="button"
                    on:click={cancelIncident}
                    style="flex: 1; padding: 10px; background-color: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
{/if}

<div bind:this={mapContainer} style="height: 600px; width: 600px; margin: 0 auto; border: 2px solid black;"></div>

<div style="text-align: center; margin-top: 20px;">
    <button
        on:click={startAddingIncident}
        style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;"
        disabled={addingIncident}
    >
        {addingIncident ? 'Click on map...' : 'Add Incident'}
    </button>
</div>

<style>
    :global(.leaflet-container) {
        height: 100%;
        width: 100%;
    }
</style>