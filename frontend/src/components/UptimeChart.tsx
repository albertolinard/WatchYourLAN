import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { apiGetUptime, UptimePoint } from "../functions/influx";
import Chart from "chart.js/auto";

function UptimeChart() {
  let canvasRef: HTMLCanvasElement | undefined;
  let chartInstance: Chart | undefined;

  const [range, setRange] = createSignal(24);
  const [data, setData] = createSignal<UptimePoint[]>([]);
  const [loading, setLoading] = createSignal(true);
  let refreshInterval: number;

  const fetchData = async () => {
    setLoading(true);
    const points = await apiGetUptime(range());
    setData(points);
    setLoading(false);
    renderChart();
  };

  const renderChart = () => {
    if (!canvasRef) return;

    const points = data();
    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = points.map(p => {
      const d = new Date(p.time);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const values = points.map(p => p.online);

    chartInstance = new Chart(canvasRef, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Online Devices",
          data: values,
          borderColor: "rgba(25, 135, 84, 0.9)",
          backgroundColor: "rgba(25, 135, 84, 0.1)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index" as const,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            padding: 10,
            callbacks: {
              title: (items) => {
                if (!items.length) return "";
                const idx = items[0].dataIndex;
                return points[idx]
                  ? new Date(points[idx].time).toLocaleString()
                  : "";
              },
              label: (item) => ` ${item.raw} online`
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: { display: false },
            ticks: {
              maxTicksLimit: 8,
              font: { size: 11 },
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: { color: "rgba(128,128,128,0.1)" },
            ticks: {
              stepSize: 1,
              font: { size: 11 },
            }
          }
        }
      }
    });
  };

  onMount(() => {
    fetchData();
    refreshInterval = setInterval(fetchData, 300000) as unknown as number; // 5 min
  });

  onCleanup(() => {
    clearInterval(refreshInterval);
    if (chartInstance) chartInstance.destroy();
  });

  const changeRange = (hours: number) => {
    setRange(hours);
    fetchData();
  };

  return (
    <div>
      <div class="d-flex justify-content-end mb-2">
        <div class="btn-group btn-group-sm">
          <button class={`btn ${range() === 24 ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => changeRange(24)}>24h</button>
          <button class={`btn ${range() === 168 ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => changeRange(168)}>7d</button>
          <button class={`btn ${range() === 720 ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => changeRange(720)}>30d</button>
        </div>
      </div>
      <div class="chart-container" style="position: relative; height: 220px;">
        <Show when={!loading()} fallback={
          <div class="d-flex justify-content-center align-items-center h-100">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        }>
          <canvas ref={canvasRef}></canvas>
        </Show>
      </div>
    </div>
  );
}

export default UptimeChart;