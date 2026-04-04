<script lang="ts">
    let { data } = $props();
</script>

<div class="p-4 flex flex-col gap-4">

    <div class="rounded-lg p-4 text-center" style="background-color: #1f1f1f; border: 1px solid #3a1a1a;">
        <p class="text-3xl font-bold" style="color: #e84040;">Welcome</p>
        <p class="text-sm text-gray-400 mt-1">{data.user.name}</p>
    </div>
    <!-- Quick actions -->
    <div class="rounded-lg p-4" style="background-color: #1f1f1f; border: 1px solid #3a1a1a;">
        <h2 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-2">
            <a href="/interactive-map"
                class="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white"
                style="background-color: #3b1f00;">
                Create Incident
            </a>
            <a href="/groups/my-groups"
                class="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white"
                style="background-color: #3b1f00;">
                View My Groups
            </a>
        </div>
    </div>

    <!-- Recent alerts -->
    <div class="rounded-lg p-4" style="background-color: #1f1f1f; border: 1px solid #3a1a1a;">
        <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Recent Alerts</h2>
            <a href="/alerts" class="text-xs" style="color: #e84040;">View all →</a>
        </div>
        {#if data.recentAlerts.length === 0}
            <p class="text-sm text-gray-500 text-center py-4">No alerts yet.</p>
        {:else}
            <div class="flex flex-col gap-2">
                {#each data.recentAlerts as alert}
                    <div class="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                            <p class="text-sm text-white font-medium">{alert.title}</p>
                            <p class="text-xs text-gray-500">By: {alert.submittedBy}</p>
                        </div>
                        <span class="text-xs font-semibold px-2 py-1 rounded"
                            style="color: {alert.severity === 'High' ? '#ef4444' : alert.severity === 'Medium' ? '#f59e0b' : '#22c55e'}">
                            {alert.severity}
                        </span>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

</div>