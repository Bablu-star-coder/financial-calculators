let currentChart = null;

// 1. Dual Field Sync Engine
function syncFields(sourceId, targetId) {
    const sourceEl = document.getElementById(sourceId);
    let val = Number(sourceEl.value);
    const targetEl = document.getElementById(targetId);
    
    if (sourceEl.type === 'number' && val > Number(targetEl.max)) {
        targetEl.max = val * 2;
    }
    
    targetEl.value = val;
    
    // Trigger calculation instantly based on which inputs are running
    if (sourceId.startsWith('sip')) computeSIP();
    if (sourceId.startsWith('swp')) computeSWP();
    if (sourceId.startsWith('inf')) computeInflationSIP();
    if (sourceId.startsWith('fd')) computeFD();
}

// 2. Standard SIP Calculation (Locked to Groww Math)
function computeSIP() {
    const P = Number(document.getElementById('sipAmount').value);
    const annualRate = Number(document.getElementById('sipRate').value);
    const years = Number(document.getElementById('sipYears').value);

    if (!P || !annualRate || !years) return;

    const i = (annualRate / 100) / 12;
    const n = Math.round(years * 12);

    const invested = P * n;
    
    // Groww Baseline Formula
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const gains = totalValue - invested;

    document.getElementById('sipResultOutputs').innerHTML = `
        <div class="result-row"><span>Invested amount</span> <strong>₹${invested.toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Est. returns</span> <strong>₹${Math.round(gains).toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Total value</span> <strong>₹${Math.round(totalValue).toLocaleString('en-IN')}</strong></div>
    `;

    updateChart('sipChart', ['Invested amount', 'Est. returns'], [invested, gains], ['#e2e8f0', '#4466ff']);
}

// 3. SWP Calculation
function computeSWP() {
    const initialLump = Number(document.getElementById('swpLump').value);
    const monthlyPayout = Number(document.getElementById('swpWithdraw').value);
    const annualRate = Number(document.getElementById('swpRate').value);
    const years = Number(document.getElementById('swpYears').value);

    if (!initialLump || !monthlyPayout || !annualRate || !years) return;

    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = Math.round(years * 12);

    let balance = initialLump;
    let totalWithdrawn = 0;

    for (let m = 0; m < totalMonths; m++) {
        balance = balance * (1 + monthlyRate);
        if (balance >= monthlyPayout) {
            balance -= monthlyPayout;
            totalWithdrawn += monthlyPayout;
        } else {
            totalWithdrawn += balance;
            balance = 0;
            break;
        }
    }

    const totalEstimatedGains = (totalWithdrawn + balance) - initialLump;
    const safeGains = totalEstimatedGains > 0 ? totalEstimatedGains : 0;

    document.getElementById('swpResultOutputs').innerHTML = `
        <div class="result-row"><span>Total Investment</span> <strong>₹${initialLump.toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Total Withdrawal</span> <strong>₹${totalWithdrawn.toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Final Value</span> <strong>₹${Math.round(balance).toLocaleString('en-IN')}</strong></div>
    `;

    updateChart('swpChart', ['Total Investment', 'Est. Returns'], [initialLump, safeGains], ['#e2e8f0', '#00d09c']);
}

// 4. Fixed Deposit Calculation
function computeFD() {
    const principal = Number(document.getElementById('fdPrincipal').value);
    const annualRate = Number(document.getElementById('fdRate').value);
    const years = Number(document.getElementById('fdYears').value);
    const frequency = Number(document.getElementById('fdFrequency').value);

    if (!principal || !annualRate || !years || !frequency) return;

    const r = annualRate / 100;
    const n = frequency;
    const t = years;

    const maturityValue = principal * Math.pow(1 + r / n, n * t);
    const interestEarned = maturityValue - principal;

    document.getElementById('fdResultOutputs').innerHTML = `
        <div class="result-row"><span>Principal amount</span> <strong>₹${principal.toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Interest earned</span> <strong>₹${Math.round(interestEarned).toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Maturity value</span> <strong>₹${Math.round(maturityValue).toLocaleString('en-IN')}</strong></div>
    `;

    updateChart('fdChart', ['Principal', 'Interest earned'], [principal, Math.round(interestEarned)], ['#e2e8f0', '#ff9f43']);
}

// 5. Inflation SIP Calculation
function computeInflationSIP() {
    const P = Number(document.getElementById('infAmount').value);
    const annualRate = Number(document.getElementById('infRate').value);
    const inflationRate = Number(document.getElementById('infInflation').value);
    const years = Number(document.getElementById('infYears').value);

    if (!P || !annualRate || !years) return;

    const nominalRateDec = annualRate / 100;
    const inflationRateDec = inflationRate / 100;
    const realAnnualRate = ((1 + nominalRateDec) / (1 + inflationRateDec)) - 1;
    
    const i = realAnnualRate / 12;
    const n = Math.round(years * 12);

    const invested = P * n;
    const currentPurchasingPowerValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const realGains = currentPurchasingPowerValue - invested;
    const safeRealGains = realGains > 0 ? realGains : 0;

    document.getElementById('infResultOutputs').innerHTML = `
        <div class="result-row"><span>Total Invested</span> <strong>₹${invested.toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Real Gains (Adjusted)</span> <strong>₹${Math.round(safeRealGains).toLocaleString('en-IN')}</strong></div>
        <div class="result-row"><span>Adjusted Present Value</span> <strong>₹${Math.round(currentPurchasingPowerValue).toLocaleString('en-IN')}</strong></div>
    `;

    updateChart('infChart', ['Total Invested', 'Real Gains'], [invested, safeRealGains], ['#e2e8f0', '#ffaa44']);
}

// 5. Universal Chart Renderer
function updateChart(canvasId, labels, dataArray, colors) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataArray,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '75%'
        }
    });
}