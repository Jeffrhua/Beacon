<script>
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
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
        groupId: '',
        severity: 'low'
    };
    let tempMarker = null;
    let photoFiles;
    let successMessage = false;

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
            .then(d => { incidentForm.address = d.display_name || ''; })
            .catch(() => { incidentForm.address = 'Address not found'; });
    }

    function cancelIncident() {
        addingIncident = false;
        map.off('click', onMapClick);
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
        photoFiles = undefined;
        incidentForm = { lat: null, lng: null, description: '', address: '', groupId: '', severity: 'low' };
    }

    async function submitIncident() {
        if (!incidentForm.description) { alert('Please enter a description'); return; }

        const fd = new FormData();
        fd.append('lat',         incidentForm.lat);
        fd.append('lng',         incidentForm.lng);
        fd.append('address',     incidentForm.address);
        fd.append('description', incidentForm.description);
        fd.append('groupId',     incidentForm.groupId);
        fd.append('severity',    incidentForm.severity);

        if (photoFiles && photoFiles[0]) {
            if (photoFiles[0].size > 5 * 1024 * 1024) {
                alert('Image must be under 5MB');
                return;
            }
            fd.append('photo', photoFiles[0]);
        }

        const response = await fetch('?/addIncident', { method: 'POST', body: fd });

        if (response.ok) {
            map.off('click', onMapClick);
            if (tempMarker) map.removeLayer(tempMarker);

            L.marker([incidentForm.lat, incidentForm.lng])
                .addTo(map)
                .bindPopup(`<b>${incidentForm.description}</b><br>${incidentForm.address || 'No address'}`);

            addingIncident = false;
            photoFiles = undefined;
            incidentForm = { lat: null, lng: null, description: '', address: '', groupId: '', severity: 'low' };

            await invalidateAll(); // refreshes alerts + notification bell

            successMessage = true;
            setTimeout(() => { successMessage = false; }, 4000);
        }
    }

    const severityLevels = [
        { value: 'low',      label: 'Low',      border: '#16a34a', bg: '#dcfce7', activeBg: '#16a34a' },
        { value: 'moderate', label: 'Moderate', border: '#ca8a04', bg: '#fef9c3', activeBg: '#ca8a04' },
        { value: 'high',     label: 'High',     border: '#dc2626', bg: '#fee2e2', activeBg: '#dc2626' }
    ];
</script>

<h1 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">My Map</h1>

<!-- SUCCESS MESSAGE -->
{#if successMessage}
    <div style="
        max-width: 600px;
        margin: 0 auto 20px;
        padding: 16px 20px;
        background-color: #dcfce7;
        border: 2px solid #16a34a;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
    ">
        <span style="font-size: 1.3rem;">✅</span>
        <span style="color: #15803d; font-weight: bold; font-size: 1rem;">
            Incident successfully submitted!
        </span>
    </div>
{/if}

{#if addingIncident && incidentForm.lat}
    <div style="max-width: 600px; margin: 0 auto 20px; padding: 20px; border: 2px solid #ccc; border-radius: 8px; background: white;">
        <h2 style="margin-top: 0; color: #111;">Report Incident</h2>

        <form id="incidentForm" on:submit|preventDefault={submitIncident}>

            <!-- GROUP SELECTOR -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #111;">Report to Group:</label>
                <select
                    name="groupId"
                    bind:value={incidentForm.groupId}
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                >
                    <option value="">Select a group...</option>
                    {#each data.groups as group}
                        <option value={group.id}>{group.title}</option>
                    {/each}
                </select>
            </div>

            <!-- SEVERITY SELECTOR -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #111;">
                    Severity: <span style="font-weight: normal; color: #555;">({incidentForm.severity})</span>
                </label>
                <div style="display: flex; gap: 10px;">
                    {#each severityLevels as s}
                        <button
                            type="button"
                            on:click={() => { incidentForm.severity = s.value; }}
                            style="
                                flex: 1;
                                padding: 10px 8px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 0.9rem;
                                border: 2px solid {s.border};
                                background-color: {incidentForm.severity === s.value ? s.activeBg : s.bg};
                                color: {incidentForm.severity === s.value ? 'white' : s.border};
                                transition: all 0.15s ease;
                            "
                        >
                            {s.label}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- ADDRESS -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #111;">Address:</label>
                <input
                    type="text"
                    name="address"
                    bind:value={incidentForm.address}
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>

            <!-- DESCRIPTION -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #111;">What happened?</label>
                <textarea
                    name="description"
                    bind:value={incidentForm.description}
                    placeholder="e.g., Car crash, Robbery, Fire, etc."
                    rows="3"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                    required
                ></textarea>
            </div>

            <!-- PHOTO UPLOAD -->
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #111;">
                    Photo (optional):
                </label>
                <input
                    type="file"
                    accept="image/*"
                    bind:files={photoFiles}
                    style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9;"
                />
                {#if photoFiles && photoFiles[0]}
                    <img
                        src={URL.createObjectURL(photoFiles[0])}
                        alt="Preview"
                        style="margin-top: 8px; max-height: 120px; border-radius: 6px; object-fit: cover;"
                    />
                {/if}
            </div>

            <div style="display: flex; gap: 10px;">
                <button
                    type="submit"
                    style="flex: 1; padding: 10px; background-color: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;"
                >
                    Submit
                </button>
                <button
                    type="button"
                    on:click={cancelIncident}
                    style="flex: 1; padding: 10px; background-color: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;"
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


