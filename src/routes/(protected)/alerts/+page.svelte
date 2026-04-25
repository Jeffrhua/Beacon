<script lang="ts">
	import {
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch,
		Modal,
		Badge
	} from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	import SeverityBadge from '$lib/components/SeverityBadge.svelte';
	import EscalateAlertModal from '$lib/components/EscalateAlertModal.svelte';

	let { data } = $props();
	let escalationModal = $state(false);
	let items = $state(data.userAlerts as any[]);
	let searchTerm = $state('');
	let userSearchTerm = $state('');

	// History drawer state
	let historyAlert = $state<any | null>(null);
	let historyOpen = $state(false);

	function openHistory(item: any) {
		historyAlert = item;
		historyOpen = true;
	}

	const reasonLabel: Record<string, string> = {
		created: 'Alert created',
		time: 'Auto-escalated (time)',
		acknowledgment: 'Auto-escalated (acknowledgments)',
		manual: 'Manually changed',
		resolved: 'Resolved'
	};

	let filteredItems = $derived.by(() =>
		items.filter(
			(item) => !searchTerm || item.alertTitle.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	let userFilteredItems = $derived.by(() =>
		items.filter(
			(item) =>
				item?.submittedId === data.userId &&
				(!userSearchTerm || item.alertTitle.toLowerCase().includes(userSearchTerm.toLowerCase()))
		)
	);
</script>

<!-- ─── Mobile search ──────────────────────────────────────────────────── -->
<div class="md:hidden p-3">
	<input
		type="text"
		placeholder="Search by Alert name"
		bind:value={searchTerm}
		class="w-full px-4 py-2 rounded-lg border border-gray-600 dark:bg-gray-800 dark:text-white"
	/>
</div>

<!-- ─── Mobile cards ──────────────────────────────────────────────────── -->
<div class="mobile-cards md:hidden flex flex-col gap-3 px-3 pb-20">
	{#each filteredItems as item}
		<div class="rounded-lg p-4" style="background-color: #1f1f1f; border: 1px solid #3a1a1a;">
			<div class="flex items-center justify-between mb-2">
				<span class="font-semibold text-white">{item?.alertTitle}</span>
				<div class="flex items-center gap-1">
					<SeverityBadge severity={item?.alertSeverity} />
					{#if item?.escalation?.escalationCount > 0}
						<span class="text-xs text-orange-400 font-bold">↑{item.escalation.escalationCount}</span>
					{/if}
					{#if item?.escalation?.resolved}
						<span class="text-xs text-green-400 font-bold">✓ Resolved</span>
					{/if}
				</div>
			</div>
			<p class="text-sm text-gray-400 mb-2">{item?.alertDescription}</p>
			<div class="flex items-center justify-between text-xs text-gray-500">
				<a href="/groups/{item?.groupId}" style="color: #e84040 !important;">{item?.groupName}</a>
				<span>{item?.alertCreated}</span>
			</div>
			<p class="text-xs text-gray-500 mt-1">By: {item?.submittedBy ?? 'Unknown'}</p>
			{#if item?.escalation && !item.escalation.resolved}
				<div class="mt-2 flex gap-2">
					{#if !item.escalation.hasAcknowledged}
						<form method="POST" action="?/acknowledgeAlert" use:enhance={() => async ({ update }) => { await update(); }}>
							<input type="hidden" name="alertId" value={item.alertId} />
							<button type="submit" class="text-xs px-2 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700">
								Acknowledge ({item.escalation.ackCount}/{item.escalation.ackThreshold})
							</button>
						</form>
					{:else}
						<span class="text-xs text-yellow-400">Acknowledged</span>
					{/if}
					{#if item.submittedId === data.userId}
						<form method="POST" action="?/resolveAlert" use:enhance={() => async ({ update }) => { await update(); }}>
							<input type="hidden" name="alertId" value={item.alertId} />
							<button type="submit" class="text-xs px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800">
								Resolve
							</button>
						</form>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

<!-- Mobile: My Alerts -->
<div class="mobile-cards md:hidden px-3 pb-4">
    <div class="flex items-center justify-between mb-3">
        <h2 class="text-2xl font-bold">My Alerts</h2>
        <button onclick={() => (escalationModal = true)} class="text-xs px-3 py-1 rounded" style="background-color: #dc2626 !important; color: white !important; border: none !important; box-shadow: none !important; transform: none !important;">
            Escalate Alert
        </button>
        <EscalateAlertModal bind:escalationModal alerts={userFilteredItems} />
    </div>
    <input
        type="text"
        placeholder="Search by Alert name"
        bind:value={userSearchTerm}
        class="w-full px-4 py-2 rounded-lg border border-gray-600 dark:bg-gray-800 dark:text-white mb-3"
    />
    {#each userFilteredItems as item}
        <div class="rounded-lg p-4 mb-3" style="background-color: #1f1f1f; border: 1px solid #3a1a1a;">
            <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-white">{item?.alertTitle}</span>
                <div class="flex items-center gap-1">
                    <SeverityBadge severity={item?.alertSeverity} />
                    {#if item?.escalation?.escalationCount > 0}
                        <span class="text-xs text-orange-400 font-bold">↑{item.escalation.escalationCount}</span>
                    {/if}
                    {#if item?.escalation?.resolved}
                        <span class="text-xs text-green-400 font-bold">✓ Resolved</span>
                    {/if}
                </div>
            </div>
            <p class="text-sm text-gray-400 mb-2">{item?.alertDescription}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <a href="/groups/{item?.groupId}" style="color: #e84040 !important;">{item?.groupName}</a>
                <span>{item?.alertCreated}</span>
            </div>
            {#if item?.escalation && !item.escalation.resolved}
                <div class="mt-2 flex gap-2">
                    {#if !item.escalation.hasAcknowledged}
                        <form method="POST" action="?/acknowledgeAlert" use:enhance={() => async ({ update }) => { await update(); }}>
                            <input type="hidden" name="alertId" value={item.alertId} />
                            <button type="submit" class="text-xs px-2 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700">
                                Acknowledge ({item.escalation.ackCount}/{item.escalation.ackThreshold})
                            </button>
                        </form>
                    {:else}
                        <span class="text-xs text-yellow-400">Acknowledged</span>
                    {/if}
                    <form method="POST" action="?/resolveAlert" use:enhance={() => async ({ update }) => { await update(); }}>
                        <input type="hidden" name="alertId" value={item.alertId} />
                        <button type="submit" class="text-xs px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800">
                            Resolve
                        </button>
                    </form>
                </div>
            {/if}
        </div>
    {/each}
</div>



<!-- ─── Desktop: All Alerts ───────────────────────────────────────────── -->
<div class="desktop-table overflow-x-auto w-full">
	<h2 class="text-3xl font-bold mt-4 pl-4">All Alerts</h2>
	<TableSearch placeholder="Search by Alert name" hoverable bind:inputValue={searchTerm}>
		<TableHead>
			<TableHeadCell>Created</TableHeadCell>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
			<TableHeadCell>Group</TableHeadCell>
			<TableHeadCell>Severity</TableHeadCell>
			<TableHeadCell>Submitted By</TableHeadCell>
			<TableHeadCell>Escalation</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#if filteredItems.length === 0}
				<TableBodyCell colspan={8} class="text-center">No alerts found...</TableBodyCell>
			{:else}
				{#each filteredItems as item}
					<TableBodyRow>
						<TableBodyCell>{item?.alertCreated}</TableBodyCell>
						<TableBodyCell>{item?.alertTitle}</TableBodyCell>
						<TableBodyCell>{item?.alertDescription}</TableBodyCell>
						<TableBodyCell><a href="/groups/{item?.groupId}">{item?.groupName}</a></TableBodyCell>
						<TableBodyCell>
							<div class="flex items-center gap-1">
								<SeverityBadge severity={item?.alertSeverity} />
								{#if item?.escalation?.escalationCount > 0}
									<span class="text-xs font-bold text-orange-400" title="Escalated {item.escalation.escalationCount}× from {item.escalation.baseSeverity}">
										↑{item.escalation.escalationCount}
									</span>
								{/if}
							</div>
						</TableBodyCell>
						<TableBodyCell>{item?.submittedBy ?? 'Unknown'}</TableBodyCell>
						<TableBodyCell>
							{#if !item?.escalation}
								<span class="text-xs text-gray-400">—</span>
							{:else if item.escalation.resolved}
								<Badge color="green" class="text-xs">Resolved</Badge>
							{:else}
								<button
									onclick={() => openHistory(item)}
									class="text-xs underline text-blue-400 hover:text-blue-300 cursor-pointer"
								>
									{item.escalation.autoEscalate ? `Auto /${item.escalation.escalateAfterMinutes}m` : 'Manual'}
									· {item.escalation.history.length} event{item.escalation.history.length !== 1 ? 's' : ''}
								</button>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							<div class="flex gap-2 items-center">
								{#if item?.escalation && !item.escalation.resolved}
									{#if !item.escalation.hasAcknowledged}
										<form method="POST" action="?/acknowledgeAlert" use:enhance={() => async ({ update }) => { await update(); }}>
											<input type="hidden" name="alertId" value={item.alertId} />
											<button
												type="submit"
												class="text-xs px-2 py-1 rounded border border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 whitespace-nowrap"
												title="Acknowledge — {item.escalation.ackThreshold - item.escalation.ackCount} more acks will escalate"
											>
												Ack ({item.escalation.ackCount}/{item.escalation.ackThreshold})
											</button>
										</form>
									{:else}
										<span class="text-xs text-yellow-400">Acked</span>
									{/if}
									{#if item.submittedId === data.userId}
										<form method="POST" action="?/resolveAlert" use:enhance={() => async ({ update }) => { await update(); }}>
											<input type="hidden" name="alertId" value={item.alertId} />
											<button
												type="submit"
												class="text-xs px-2 py-1 rounded border border-green-600 text-green-400 hover:bg-green-900/30"
											>
												Resolve
											</button>
										</form>
									{/if}
								{/if}
							</div>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</TableSearch>
</div>

<hr class="border-t mt-8" />

<!-- ─── Desktop: My Alerts ────────────────────────────────────────────── -->
<div class="desktop-table overflow-x-auto w-full">
	<div class="flex justify-between">
		<h2 class="text-3xl font-bold mt-4 pl-4">My Alerts</h2>
		<button onclick={() => (escalationModal = true)} class="text-white mt-4 mr-4 rounded">
			Escalate Alert
		</button>
		<EscalateAlertModal bind:escalationModal alerts={userFilteredItems} />
	</div>
	<TableSearch placeholder="Search by Alert name" hoverable bind:inputValue={userSearchTerm}>
		<TableHead>
			<TableHeadCell>Created</TableHeadCell>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
			<TableHeadCell>Group</TableHeadCell>
			<TableHeadCell>Severity</TableHeadCell>
			<TableHeadCell>Submitted By</TableHeadCell>
			<TableHeadCell>Escalation</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#if userFilteredItems.length === 0}
				<TableBodyCell colspan={8} class="text-center">No alerts found...</TableBodyCell>
			{:else}
				{#each userFilteredItems as item}
					<TableBodyRow>
						<TableBodyCell>{item?.alertCreated}</TableBodyCell>
						<TableBodyCell>{item?.alertTitle}</TableBodyCell>
						<TableBodyCell>{item?.alertDescription}</TableBodyCell>
						<TableBodyCell><a href="/groups/{item?.groupId}">{item?.groupName}</a></TableBodyCell>
						<TableBodyCell>
							<div class="flex items-center gap-1">
								<SeverityBadge severity={item?.alertSeverity} />
								{#if item?.escalation?.escalationCount > 0}
									<span class="text-xs font-bold text-orange-400">↑{item.escalation.escalationCount}</span>
								{/if}
							</div>
						</TableBodyCell>
						<TableBodyCell>{item?.submittedBy ?? 'Unknown'}</TableBodyCell>
						<TableBodyCell>
							{#if !item?.escalation}
								<span class="text-xs text-gray-400">—</span>
							{:else if item.escalation.resolved}
								<Badge color="green" class="text-xs">Resolved</Badge>
							{:else}
								<button
									onclick={() => openHistory(item)}
									class="text-xs underline text-blue-400 hover:text-blue-300 cursor-pointer"
								>
									{item.escalation.autoEscalate ? `Auto /${item.escalation.escalateAfterMinutes}m` : 'Manual'}
									· {item.escalation.history.length} event{item.escalation.history.length !== 1 ? 's' : ''}
								</button>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							<div class="flex gap-2 items-center">
								{#if item?.escalation && !item.escalation.resolved}
									{#if !item.escalation.hasAcknowledged}
										<form method="POST" action="?/acknowledgeAlert" use:enhance={() => async ({ update }) => { await update(); }}>
											<input type="hidden" name="alertId" value={item.alertId} />
											<button
												type="submit"
												class="text-xs px-2 py-1 rounded border border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 whitespace-nowrap"
											>
												Ack ({item.escalation.ackCount}/{item.escalation.ackThreshold})
											</button>
										</form>
									{:else}
										<span class="text-xs text-yellow-400">Acked</span>
									{/if}
									<form method="POST" action="?/resolveAlert" use:enhance={() => async ({ update }) => { await update(); }}>
										<input type="hidden" name="alertId" value={item.alertId} />
										<button
											type="submit"
											class="text-xs px-2 py-1 rounded border border-green-600 text-green-400 hover:bg-green-900/30"
										>
											Resolve
										</button>
									</form>
								{/if}
							</div>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</TableSearch>
</div>

<!-- ─── Escalation History Modal ─────────────────────────────────────── -->
<Modal title="Escalation History" bind:open={historyOpen} size="md">
	{#if historyAlert}
		<div class="mb-3">
			<p class="font-semibold text-gray-900 dark:text-white">{historyAlert.alertTitle}</p>
			<p class="text-sm text-gray-500">
				Original severity:
				<span class="font-medium capitalize">{historyAlert.escalation?.baseSeverity ?? '—'}</span>
				→ Current:
				<span class="font-medium capitalize">{historyAlert.alertSeverity}</span>
			</p>
			{#if historyAlert.escalation?.autoEscalate}
				<p class="text-xs text-gray-400 mt-1">
					Auto-escalates every {historyAlert.escalation.escalateAfterMinutes} min ·
					Ack threshold: {historyAlert.escalation.ackThreshold}
				</p>
			{/if}
		</div>

		<ol class="relative border-l border-gray-300 dark:border-gray-600 ml-3">
			{#each historyAlert.escalation?.history ?? [] as event}
				<li class="mb-4 ml-4">
					<span
						class="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white
						{event.reason === 'resolved'
							? 'bg-green-500'
							: event.reason === 'created'
								? 'bg-gray-400'
								: 'bg-orange-500'}"
					></span>
					<time class="text-xs text-gray-400">{new Date(event.at).toLocaleString()}</time>
					<p class="text-sm font-medium text-gray-800 dark:text-gray-200">
						{reasonLabel[event.reason] ?? event.reason}
					</p>
					<p class="text-xs text-gray-500 capitalize">Severity: {event.severity}</p>
				</li>
			{/each}
		</ol>
	{/if}
</Modal>

<style>
	@media (max-width: 768px) {
		.desktop-table {
			display: none !important;
		}
	}
	@media (min-width: 769px) {
		.mobile-cards {
			display: none !important;
		}
	}
</style>
