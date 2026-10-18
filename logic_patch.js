const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The new Javascript logic for dynamic investments
const jsBlock = `
        let inversiones = [
            { id: 'inv_1', nombre: 'Escenario Conservador', tasa: 0.1 },
            { id: 'inv_2', nombre: 'Escenario Optimizado', tasa: 3.0 }
        ];

        function renderInversiones() {
            const container = document.getElementById('inversionesContainer');
            if(!container) return;
            let html = '';
            inversiones.forEach((inv, index) => {
                html += \`
                    <div class="bg-slate-50 dark:bg-darkBg/50 p-4 rounded-2xl relative group">
                        <div class="flex justify-between items-center mb-2">
                            <input type="text" value="\${inv.nombre}" onchange="updateInversion('\${inv.id}', 'nombre', this.value)" class="bg-transparent border-none p-0 text-[10px] font-black uppercase text-slate-500 w-full focus:ring-0">
                            \${inversiones.length > 1 ? \`<button onclick="eliminarInversion('\${inv.id}')" class="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>\` : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="number" step="0.1" value="\${inv.tasa}" oninput="updateInversion('\${inv.id}', 'tasa', this.value)" class="w-full bg-transparent border-none p-0 font-black text-xl text-slate-800 dark:text-white focus:ring-0">
                            <span class="text-xs font-black text-slate-400">%</span>
                        </div>
                    </div>
                \`;
            });
            container.innerHTML = html;
        }

        function agregarInversion() {
            if(inversiones.length >= 20) return alert('Máximo 20 inversiones permitidas.');
            const id = 'inv_' + Date.now();
            inversiones.push({ id, nombre: 'Nueva Inversión', tasa: 5.0 });
            renderInversiones();
            handleChange();
        }

        function updateInversion(id, field, value) {
            const inv = inversiones.find(i => i.id === id);
            if(inv) {
                if(field === 'tasa') inv[field] = parseFloat(value) || 0;
                else inv[field] = value;
                handleChange();
            }
        }

        function eliminarInversion(id) {
            inversiones = inversiones.filter(i => i.id !== id);
            renderInversiones();
            handleChange();
        }

        // We completely replace the calcular function
`;

const calcularRegex = /function calcular\(\) \{[\s\S]*?\n        \}/m;
const newCalcular = `function calcular() {
            const P = parseFloat(document.getElementById('montoInicial').value) || 0;
            const PMT = parseFloat(document.getElementById('aporteMensual').value) || 0;
            const aplicarImpuesto = document.getElementById('aplicarImpuesto') ? document.getElementById('aplicarImpuesto').checked : true;

            const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
            const fechaInicioStr = document.getElementById('fechaInicio').value;
            const fechaFinStr = document.getElementById('fechaFin').value;

            if (!fechaInicioStr || !fechaFinStr) return;

            const fechaInicio = new Date(fechaInicioStr + 'T00:00:00');
            const fechaFin = new Date(fechaFinStr + 'T00:00:00');
            const tablaBody = document.getElementById('tablaBody');
            const tablaHeaders = document.getElementById('tablaHeaders');
            const escenariosContainer = document.getElementById('tour-escenarios');

            if (fechaInicio >= fechaFin) {
                if(tablaBody) tablaBody.innerHTML = '<tr><td colspan="100%" class="p-5 text-center text-slate-400 text-xs font-black">La fecha "Desde" debe ser menor a "Hasta".</td></tr>';
                if(escenariosContainer) escenariosContainer.innerHTML = '';
                return;
            }

            // Headers for table
            let headersHtml = '<th class="p-5 text-left">Mes</th>';
            inversiones.forEach(inv => {
                headersHtml += \`<th class="p-5 text-right border-l border-slate-50 dark:border-slate-800">\${inv.nombre} <br><span class="opacity-50">Balance</span></th>\`;
                headersHtml += \`<th class="p-5 text-right">\${inv.nombre} <br><span class="opacity-50">Int.</span></th>\`;
            });
            if(tablaHeaders) tablaHeaders.innerHTML = headersHtml;

            const mesesNombres = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            let current = new Date(fechaInicio);
            let totalPMT = 0;

            const cutDay = parseInt(document.getElementById('diaCorte').value) || 1;
            const omitirPrimerCorteCheckbox = document.getElementById('omitirPrimerCorte');
            const omitirPrimerCorte = omitirPrimerCorteCheckbox ? omitirPrimerCorteCheckbox.checked : false;

            // Initialize balances
            let balances = inversiones.map(() => P);
            let htmlTable = '';

            while (current < fechaFin) {
                const year = current.getFullYear();
                const month = current.getMonth();
                const daysInYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;
                const isFirstIteration = (current.getTime() === fechaInicio.getTime());

                let thisMonthCutDay = Math.min(cutDay, new Date(year, month + 1, 0).getDate());
                let thisMonthCut = new Date(year, month, thisMonthCutDay);

                let nextStepEnd;
                if (current < thisMonthCut && !(isFirstIteration && omitirPrimerCorte)) {
                    nextStepEnd = thisMonthCut;
                } else {
                    let nextMonthCutDay = Math.min(cutDay, new Date(year, month + 2, 0).getDate());
                    nextStepEnd = new Date(year, month + 1, nextMonthCutDay);
                }

                const stepEnd = nextStepEnd < fechaFin ? nextStepEnd : fechaFin;
                const daysInPeriod = Math.round((stepEnd - current) / (1000 * 60 * 60 * 24));

                let displayDate = new Date(stepEnd.getTime() - 1);
                const nombreMes = \`\${mesesNombres[displayDate.getMonth()]} \${displayDate.getFullYear()}\`;

                const totalDaysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
                const proporcionMes = daysInPeriod / totalDaysInMonth;
                const aporteProporcional = PMT * proporcionMes;

                totalPMT += aporteProporcional;

                let rowHtml = \`<td class="p-5 text-slate-400 font-black italic whitespace-nowrap">\${nombreMes} <span class="text-[9px] opacity-60 font-normal ml-1">(\${daysInPeriod}d)</span></td>\`;

                inversiones.forEach((inv, idx) => {
                    let tasaAnual = inv.tasa / 100;
                    let interesGanado = balances[idx] * (tasaAnual / daysInYear) * daysInPeriod;

                    // Lógica de Impuestos (Retención del 10% por ley RD)
                    if (aplicarImpuesto && interesGanado > 0) {
                        interesGanado = interesGanado * 0.90; // Retiene el 10%
                    }

                    balances[idx] += interesGanado + aporteProporcional;

                    rowHtml += \`<td class="p-5 text-right font-black border-l border-slate-50 dark:border-slate-800">\${fmt.format(balances[idx])}</td>\`;
                    rowHtml += \`<td class="p-5 text-right text-blue-500/80 font-black">+\${fmt.format(interesGanado)}</td>\`;
                });

                htmlTable += \`<tr class="text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">\${rowHtml}</tr>\`;
                current = stepEnd;
            }

            if(tablaBody) tablaBody.innerHTML = htmlTable;

            // Build Escenarios Cards
            const totalInvertido = P + totalPMT;
            if(escenariosContainer) {
                let cardsHtml = '';
                const colors = ['blue', 'emerald', 'purple', 'amber', 'rose', 'cyan'];
                inversiones.forEach((inv, idx) => {
                    const c = colors[idx % colors.length];
                    const ganancia = balances[idx] - totalInvertido;
                    cardsHtml += \`
                    <div class="group">
                        <div class="bg-white dark:bg-darkCard p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-\${c}-500/30">
                            <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 truncate">\${inv.nombre}</p>
                            <h2 class="text-4xl font-black text-slate-800 dark:text-white">\${fmt.format(balances[idx])}</h2>
                            <div class="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                <span class="text-[10px] font-black uppercase text-slate-400">Rendimiento Neto</span>
                                <span class="text-xl font-black text-\${c}-500">+\${fmt.format(ganancia)}</span>
                            </div>
                        </div>
                    </div>
                    \`;
                });
                escenariosContainer.innerHTML = cardsHtml;
            }
        }`;

html = html.replace(calcularRegex, jsBlock + newCalcular);

// Update saveSettings and loadSettings to include inversiones and aplicarImpuesto
html = html.replace("interes1: document.getElementById('interes1').value,", "inversiones: inversiones,");
html = html.replace("interes2: document.getElementById('interes2').value,", "aplicarImpuesto: document.getElementById('aplicarImpuesto') ? document.getElementById('aplicarImpuesto').checked : true,");

const loadSettingsRegex = /document\.getElementById\('interes1'\)\.value = s\.interes1 \|\| 0\.1;\s*document\.getElementById\('interes2'\)\.value = s\.interes2 \|\| 3\.0;/m;
const newLoadSettings = `
                        if(s.inversiones && s.inversiones.length > 0) {
                            inversiones = s.inversiones;
                        }
                        if(s.aplicarImpuesto !== undefined && document.getElementById('aplicarImpuesto')) {
                            document.getElementById('aplicarImpuesto').checked = s.aplicarImpuesto;
                        }
                        renderInversiones();
`;
html = html.replace(loadSettingsRegex, newLoadSettings);

// Add initial render call in window.onload
html = html.replace("calcular();", "renderInversiones();\n            calcular();");


fs.writeFileSync('index.html', html);
