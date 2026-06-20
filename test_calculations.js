// Test all calculator formulas

console.log("=== SIP Calculation Test ===");
function testSIP() {
    const P = 500;           // Monthly investment
    const annualRate = 12;   // 12% annual
    const years = 10;

    const i = (annualRate / 100) / 12;
    const n = Math.round(years * 12);
    
    const invested = P * n;
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const gains = totalValue - invested;
    
    console.log(`Input: P=₹${P}, Rate=${annualRate}%, Years=${years}`);
    console.log(`Monthly Rate (i): ${i} (${(i*100).toFixed(4)}%)`);
    console.log(`Total Months (n): ${n}`);
    console.log(`Invested: ₹${invested.toLocaleString('en-IN')}`);
    console.log(`Total Value: ₹${Math.round(totalValue).toLocaleString('en-IN')}`);
    console.log(`Gains: ₹${Math.round(gains).toLocaleString('en-IN')}`);
    console.log(`Formula Used: Annuity Due = P * [((1+i)^n - 1) / i] * (1+i)`);
}
testSIP();

console.log("\n=== SWP Calculation Test ===");
function testSWP() {
    const initialLump = 500000;    // ₹5 lakh
    const monthlyPayout = 10000;   // ₹10k/month
    const annualRate = 12;
    const years = 10;

    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = Math.round(years * 12);
    
    let balance = initialLump;
    let totalWithdrawn = 0;
    let monthsActive = 0;

    for (let m = 0; m < totalMonths; m++) {
        balance = balance * (1 + monthlyRate);
        if (balance >= monthlyPayout) {
            balance -= monthlyPayout;
            totalWithdrawn += monthlyPayout;
            monthsActive++;
        } else {
            totalWithdrawn += balance;
            balance = 0;
            break;
        }
    }

    const totalEstimatedGains = (totalWithdrawn + balance) - initialLump;
    const safeGains = totalEstimatedGains > 0 ? totalEstimatedGains : 0;
    
    console.log(`Input: Initial=₹${initialLump.toLocaleString('en-IN')}, Withdrawal=₹${monthlyPayout.toLocaleString('en-IN')}/month, Rate=${annualRate}%, Years=${years}`);
    console.log(`Monthly Rate: ${monthlyRate} (${(monthlyRate*100).toFixed(4)}%)`);
    console.log(`Months Active: ${monthsActive}/${totalMonths}`);
    console.log(`Total Investment: ₹${initialLump.toLocaleString('en-IN')}`);
    console.log(`Total Withdrawn: ₹${totalWithdrawn.toLocaleString('en-IN')}`);
    console.log(`Final Balance: ₹${Math.round(balance).toLocaleString('en-IN')}`);
    console.log(`Estimated Gains: ₹${Math.round(safeGains).toLocaleString('en-IN')}`);
}
testSWP();

console.log("\n=== Inflation SIP Calculation Test ===");
function testInflationSIP() {
    const P = 25000;           // Monthly investment
    const annualRate = 12;     // 12% nominal return
    const inflationRate = 6;   // 6% inflation
    const years = 10;

    const nominalRateDec = annualRate / 100;
    const inflationRateDec = inflationRate / 100;
    const realAnnualRate = ((1 + nominalRateDec) / (1 + inflationRateDec)) - 1;
    
    const i = realAnnualRate / 12;
    const n = Math.round(years * 12);

    const invested = P * n;
    const currentPurchasingPowerValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const realGains = currentPurchasingPowerValue - invested;
    const safeRealGains = realGains > 0 ? realGains : 0;
    
    console.log(`Input: P=₹${P.toLocaleString('en-IN')}, Nominal Rate=${annualRate}%, Inflation=${inflationRate}%, Years=${years}`);
    console.log(`Real Annual Rate: ${(realAnnualRate*100).toFixed(4)}%`);
    console.log(`Monthly Real Rate (i): ${i} (${(i*100).toFixed(6)}%)`);
    console.log(`Total Months (n): ${n}`);
    console.log(`Total Invested: ₹${invested.toLocaleString('en-IN')}`);
    console.log(`Adjusted Present Value (inflation-adjusted): ₹${Math.round(currentPurchasingPowerValue).toLocaleString('en-IN')}`);
    console.log(`Real Gains (adjusted for inflation): ₹${Math.round(safeRealGains).toLocaleString('en-IN')}`);
    console.log(`Formula: Real Rate = ((1 + Nominal%) / (1 + Inflation%)) - 1`);
}
testInflationSIP();

console.log("\n✅ All calculations executed successfully!");
