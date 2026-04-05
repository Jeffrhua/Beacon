import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');

    if (!lat || !lng) return json({ address: 'Address not found' });

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
            { headers: { 'User-Agent': 'BeaconApp/1.0' } }
        );
        const data = await res.json();
        return json({ address: data.display_name || 'Address not found' });
    } catch {
        return json({ address: 'Address not found' });
    }
};