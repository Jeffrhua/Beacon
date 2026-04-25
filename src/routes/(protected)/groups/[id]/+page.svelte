<script lang="ts">
  import { page } from "$app/state";
  import { Card, Listgroup, Button, Group } from "flowbite-svelte";
  import { UserOutline } from "flowbite-svelte-icons";
  import { formatDate } from "$lib/utils.js";
  import { jsPDF } from "jspdf";
  import { autoTable } from "jspdf-autotable";
  import SendAlertModal from "$lib/components/SendAlertModal.svelte";
  import SeverityBadge from "$lib/components/SeverityBadge.svelte";
  import JoinGroupBtn from "$lib/components/JoinGroupBtn.svelte";
  import RemoveGroupBtn from "$lib/components/RemoveGroupBtn.svelte";
  import DeleteGroupBtn from "$lib/components/DeleteGroupBtn.svelte";
  import GroupSettings from "$lib/components/GroupSettings.svelte";
  import ExportAlertModal from "$lib/components/ExportAlertModal.svelte";

  import { onMount } from "svelte";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    type ChartOptions,
  } from "chart.js";

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
  );

  let { id } = page.params;
  let { data } = $props();

  let formModal = $state(false);
  let deleteGroupForm = $state(false);
  let settingsModal = $state(false);
  let exportModal = $state(false);

  let alerts = data.alerts ? data.alerts : [];

  const isOwner = data.owner?.id === data.currentUser;
  const isAdmin = data.isAdmin;
  const userRole = data.userRole;

  let totalChartCanvas: HTMLCanvasElement;
  let severityChartCanvas: HTMLCanvasElement;

  let totalAlertsChart: Chart | null = null;
  let severityAlertsChart: Chart | null = null;

  function normalizeSeverity(severity: string) {
    const value = severity.toLowerCase();
    return value === "moderate" ? "medium" : value;
  }

  function formatAlertDateLabel(dateValue: string | Date) {
    const date = new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function sortDateLabels(labels: string[]) {
    return labels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  function getSharedChartOptions(titleText: string): ChartOptions<"line"> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#e5e7eb",
          },
        },
        title: {
          display: true,
          text: titleText,
          color: "#e5e7eb",
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#e5e7eb",
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#e5e7eb",
            precision: 0,
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
        },
      },
    };
  }

  function buildAlertFrequencyData(alerts: any[]) {
    const counts: Record<string, number> = {};

    for (const alert of alerts) {
      if (!alert.dateCreated) continue;

      const label = formatAlertDateLabel(alert.dateCreated);
      counts[label] = (counts[label] ?? 0) + 1;
    }

    const labels = sortDateLabels(Object.keys(counts));
    const values = labels.map((label) => counts[label]);

    return { labels, values };
  }

  function buildAlertSeverityFrequencyData(alerts: any[]) {
    const severityConfig = [
      { key: "low", label: "Low", color: "#22c55e" },
      { key: "medium", label: "Medium", color: "#f59e0b" },
      { key: "high", label: "High", color: "#ef4444" },
      { key: "critical", label: "Critical", color: "#7c3aed" },
    ];

    const countsByDate: Record<string, Record<string, number>> = {};

    for (const alert of alerts) {
      if (!alert.dateCreated || !alert.severity) continue;

      const label = formatAlertDateLabel(alert.dateCreated);
      const severity = normalizeSeverity(alert.severity);

      if (!countsByDate[label]) {
        countsByDate[label] = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        };
      }

      if (severity in countsByDate[label]) {
        countsByDate[label][severity]++;
      }
    }

    const labels = sortDateLabels(Object.keys(countsByDate));

    const datasets = severityConfig.map((severity) => ({
      label: severity.label,
      data: labels.map((label) => countsByDate[label][severity.key] ?? 0),
      borderColor: severity.color,
      backgroundColor: severity.color,
      borderWidth: 2,
      tension: 0.25,
      fill: false,
    }));

    return { labels, datasets };
  }

  function renderTotalAlertsChart() {
    if (!totalChartCanvas) return;

    const { labels, values } = buildAlertFrequencyData(alerts);

    if (totalAlertsChart) {
      totalAlertsChart.destroy();
    }

    totalAlertsChart = new Chart(totalChartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Alerts per day",
            data: values,
            borderWidth: 2,
            tension: 0.25,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f6",
            fill: false,
          },
        ],
      },
      options: getSharedChartOptions("Alert Frequency Over Time"),
    });
  }

  function renderSeverityChart() {
    if (!severityChartCanvas) return;

    const { labels, datasets } = buildAlertSeverityFrequencyData(alerts);

    if (severityAlertsChart) {
      severityAlertsChart.destroy();
    }

    severityAlertsChart = new Chart(severityChartCanvas, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: getSharedChartOptions("Alert Frequency by Severity"),
    });
  }

  function renderCharts() {
    renderTotalAlertsChart();
    renderSeverityChart();
  }

  onMount(() => {
    renderCharts();

    return () => {
      if (totalAlertsChart) totalAlertsChart.destroy();
      if (severityAlertsChart) severityAlertsChart.destroy();
    };
  });

  $effect(() => {
    alerts = data.alerts ? data.alerts : [];
    if (totalChartCanvas && severityChartCanvas) {
      renderCharts();
    }
  });

  const exportAlertsToPDF = () => {
    if (!data.group) return;

    const columns = [
      "Alert Id",
      "Title",
      "Description",
      "Severity",
      "Long",
      "Lat",
      "Address",
      "Sent By",
      "Date Created",
    ];

    const rows = alerts.map((a) => [
      a.id.toString(),
      a.title.toString(),
      a.description.toString(),
      a.severity.toString(),
      a.longitude.toString(),
      a.latitude.toString(),
      a.address.toString(),
      a.user_id.toString(),
      formatDate(a.dateCreated),
    ]);

    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`Alert Report for ${data.group.title} (${data.group.id})`, 10, 10);

    autoTable(doc, {
      head: [columns],
      body: rows,
      styles: {
        fontSize: 8,
      },
    });

    doc.save(
      `${data.group.title}_${data.group.id}_Report_${formatDate(new Date())}`,
    );
  };

  const exportAlertsToJSON = () => {
    if (!data.group) return;

    const jsonString = JSON.stringify(alerts, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.group.title}_${data.group.id}_Report_${formatDate(new Date())}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };
</script>

<div class="grid h-full grid-cols-1 md:grid-cols-[75%_1fr] gap-2">
  <div class="p-4 space-y-4">
    {#if data.group}
      <div>
        <h1 class="text-2xl">{data.group.title}</h1>
        <h2 class="text-2md">{data.group.description}</h2>
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card class="p-4 w-full">
        <h5
          class="text-xl leading-none font-bold text-gray-900 dark:text-white mb-4"
        >
          Alerts Over Time
        </h5>

        <div class="h-80">
          <canvas bind:this={totalChartCanvas}></canvas>
        </div>
      </Card>

      <Card class="p-4 w-full">
        <h5
          class="text-xl leading-none font-bold text-gray-900 dark:text-white mb-4"
        >
          Alerts by Severity
        </h5>

        <div class="h-80">
          <canvas bind:this={severityChartCanvas}></canvas>
        </div>
      </Card>
    </div>
  </div>

  <div class="flex flex-col m-2 gap-3 overflow-x-hidden">
    <Card class="p-4 w-full max-w-none">
      <div class="flex items-center">
        <h5
          class="text-xl leading-none font-bold text-gray-900 dark:text-white"
        >
          Info
        </h5>
        <div class="ml-auto flex items-center">
          <UserOutline
            class="h-5 w-5 translate-x-[-5px] text-gray-900 dark:text-white"
          />
          <p class="text-gray-900 dark:text-white">
            {data.users.length}
          </p>
        </div>
      </div>

      <div>
        <h6 class="text-md font-semibold text-gray-900 dark:text-white">
          Owner:
        </h6>
        {#if data.owner}
          <p class="text-gray-900 dark:text-white">
            {data.owner.displayName ? data.owner.displayName : data.owner.name}
          </p>
        {/if}
      </div>

      <div>
        <h6 class="text-md font-semibold text-gray-900 dark:text-white">
          Members:
        </h6>

        {#if data.users}
          <Listgroup items={data.users} class="border-0 dark:bg-transparent">
            {#snippet children(user)}
              {#if user.id != data.owner?.id}
                <div class="flex items-center py-2">
                  <p class="text-sm font-sm text-gray-900 dark:text-white">
                    {user.displayName ? user.displayName : user.name}
                  </p>
                </div>
              {/if}
            {/snippet}
          </Listgroup>
        {/if}
      </div>
    </Card>

    <Card class="p-4 w-full flex-1 max-w-none">
      <div class="mb-4 flex items-center justify-between">
        <h5
          class="text-xl leading-none font-bold text-gray-900 dark:text-white"
        >
          Latest Alerts
        </h5>
        <Button onclick={() => (exportModal = true)}>Export</Button>

        <ExportAlertModal
          bind:exportModal
          exportPDF={exportAlertsToPDF}
          exportJSON={exportAlertsToJSON}
        ></ExportAlertModal>
      </div>

      <Listgroup items={alerts} class="border-0 dark:bg-transparent">
        {#snippet children(alert)}
          <div class="flex items-center space-x-4 py-2 rtl:space-x-reverse">
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-medium text-gray-900 dark:text-white"
              >
                {alert.title}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-gray-499">
                {alert.description}
              </p>
            </div>
            <div
              class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
            >
              <SeverityBadge severity={alert.severity}></SeverityBadge>
            </div>
          </div>
        {/snippet}
      </Listgroup>
    </Card>

    {#if !data.isMember}
      <JoinGroupBtn></JoinGroupBtn>
    {/if}

    {#if data.isMember && !isOwner}
      <RemoveGroupBtn></RemoveGroupBtn>
    {/if}

    {#if userRole === "owner" || userRole === "admin" || userRole === "moderator"}
      <Button onclick={() => (formModal = true)}>Send an alert</Button>
      <SendAlertModal bind:formModal></SendAlertModal>
    {/if}

    {#if isOwner || isAdmin}
      <Button onclick={() => (settingsModal = true)}>Settings</Button>
      <GroupSettings
        bind:settingsModal
        users={data.users}
        owner={data.owner}
        group={data.group}
        {userRole}
        currentUser={data.currentUser}
      ></GroupSettings>
    {/if}

    {#if isOwner}
      <Button onclick={() => (deleteGroupForm = true)}>Delete group</Button>
      <DeleteGroupBtn bind:deleteGroupForm></DeleteGroupBtn>
    {/if}
  </div>
</div>

<style>
</style>
