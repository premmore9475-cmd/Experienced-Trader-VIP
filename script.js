document.addEventListener("DOMContentLoaded", () => {
    const coins = ["bitcoin", "ethereum", "cardano"];
    const charts = {};
    const priceHistory = {};
    const maxPoints = 60;

    // Initialize price history arrays
    coins.forEach(coin => priceHistory[coin] = []);

    async function fetchPrice(coin) {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;
        const res = await fetch(url);
        const data = await res.json();
        return data[coin].usd;
    }

    async function updateCharts() {
        for (let coin of coins) {
            const price = await fetchPrice(coin);
            document.getElementById(`price-${coin}`).textContent = `$${price}`;

            priceHistory[coin].push(price);
            if (priceHistory[coin].length > maxPoints) priceHistory[coin].shift();

            const ctx = document.getElementById(`chart-${coin}`).getContext("2d");
            if (!charts[coin]) {
                charts[coin] = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: priceHistory[coin].map((_, i) => i + 1),
                        datasets: [{
                            label: `${coin.toUpperCase()} Price`,
                            data: priceHistory[coin],
                            borderColor: "#3498db",
                            backgroundColor: "rgba(52,152,219,0.2)",
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { ticks: { display: false }, grid: { display: false } },
                            y: { title: { display: true, text: "Price (USD)" } }
                        }
                    }
                });
            } else {
                charts[coin].data.labels = priceHistory[coin].map((_, i) => i + 1);
                charts[coin].data.datasets[0].data = priceHistory[coin];
                charts[coin].update();
            }
        }
    }

    setInterval(updateCharts, 1000);
    updateCharts();

    // Signal Form
    document.getElementById("signalForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const coin = document.getElementById("coin").value.toUpperCase();
        const entry = document.getElementById("entry").value;
        const tp = document.getElementById("tp").value;
        const sl = document.getElementById("sl").value;
        const type = document.getElementById("type").value;

        const card = document.createElement("div");
        card.classList.add("signal-card", type.toLowerCase());
        card.innerHTML = `
            <div>
                <span><b>Coin:</b> ${coin}</span>
                <span><b>Type:</b> ${type}</span>
                <span><b>Entry:</b> ${entry}</span>
                <span><b>TP:</b> ${tp}</span>
                <span><b>SL:</b> ${sl}</span>
            </div>
        `;
        document.getElementById("signalsList").appendChild(card);
        e.target.reset();
    });

    // Dark / Light Mode Toggle
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    function setTheme(theme) {
        body.className = theme;
        localStorage.setItem("theme", theme);
        themeToggle.textContent = theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode";
    }

    themeToggle.addEventListener("click", () => {
        const newTheme = body.className === "dark" ? "light" : "dark";
        setTheme(newTheme);
    });

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
});
