const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadCalculatorFunctions() {
    const scriptPath = path.join(__dirname, 'public', 'script.js');
    const source = fs.readFileSync(scriptPath, 'utf8');
    const elements = new Map();

    const context = {
        document: {
            getElementById(id) {
                if (!elements.has(id)) {
                    const element = {
                        value: '',
                        innerHTML: '',
                        max: 0,
                        type: 'text'
                    };
                    if (id === 'incomeTaxIncome') element.value = '1200000';
                    if (id === 'incomeTaxAge') element.value = 'below60';
                    if (id === 'incomeTaxRegime') element.value = 'old';
                    if (id === 'incomeTaxChart' || id === 'stepupChart') element.getContext = () => ({ });
                    elements.set(id, element);
                }
                return elements.get(id);
            }
        },
        Chart: function () {
            this.destroy = function () {};
        },
        console,
        Math,
        setTimeout,
        clearTimeout,
        window: {}
    };

    context.window = context;
    vm.createContext(context);
    vm.runInContext(source, context);
    return context;
}

function testIncomeTax() {
    const context = loadCalculatorFunctions();
    const cases = [
        { income: 1200000, ageGroup: 'below60', regime: 'old', expected: 106600 },
        { income: 1200000, ageGroup: '60to80', regime: 'old', expected: 96200 },
        { income: 1200000, ageGroup: 'above80', regime: 'old', expected: 54600 },
        { income: 1200000, ageGroup: 'below60', regime: 'new', expected: 93600 }
    ];

    cases.forEach(({ income, ageGroup, regime, expected }) => {
        const doc = context.document;
        doc.getElementById('incomeTaxIncome').value = String(income);
        doc.getElementById('incomeTaxAge').value = ageGroup;
        doc.getElementById('incomeTaxRegime').value = regime;
        context.computeIncomeTax();
        const resultText = doc.getElementById('incomeTaxResultOutputs').innerHTML;
        const match = resultText.match(/Total tax<\/span> <strong>₹([0-9,]+)<\/strong>/);
        const actual = match ? Number(match[1].replace(/,/g, '')) : null;
        assert.strictEqual(actual, expected, `Income tax case failed for ${ageGroup}/${regime}`);
    });
}

function testStepUpSIP() {
    const context = loadCalculatorFunctions();
    const doc = context.document;
    doc.getElementById('stepupAmount').value = '10000';
    doc.getElementById('stepupRate').value = '12';
    doc.getElementById('stepupStep').value = '0';
    doc.getElementById('stepupYears').value = '1';
    context.computeStepUpSIP();

    const resultText = doc.getElementById('stepupResultOutputs').innerHTML;
    const match = resultText.match(/Maturity value<\/span> <strong>₹([0-9,]+)<\/strong>/);
    const actual = match ? Number(match[1].replace(/,/g, '')) : null;
    const expected = 128093;
    assert.strictEqual(actual, expected, 'Step-Up SIP maturity value mismatch');
}

try {
    testIncomeTax();
    testStepUpSIP();
    console.log('✅ Calculator validation passed');
} catch (error) {
    console.error('❌ Calculator validation failed');
    console.error(error.message);
    process.exit(1);
}
