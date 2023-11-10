const maxLoanAmount = 55000000; // Paso 1: Límite de monto

function validateLoanAmount() {
    var loanAmountInput = document.getElementById('loanAmount');
    if (loanAmountInput.value > maxLoanAmount) {
        alert('El monto del préstamo no puede superar los 55 millones.');
        loanAmountInput.value = maxLoanAmount;
    }
}

// Llamamos a esta función cada vez que se modifica el monto del préstamo
document.getElementById('loanAmount').addEventListener('input', validateLoanAmount);

// Paso 2: Control deslizante para el plazo del préstamo
function updateLoanTerm() {
    var loanTermInput = document.getElementById('loanTerm');
    var loanTermValue = document.getElementById('loanTermValue');
    loanTermValue.textContent = loanTermInput.value;

    // Paso adicional: Recalcular cuando se actualiza el plazo
    recalculateLoan();
}

// Paso 3: Calcular y mostrar la cuota mensual
function calculateLoan() {
    var loanAmount = document.getElementById('loanAmount').value;
    var interestRate = 0.0125; // 1.25% mensual
    var loanTerm = document.getElementById('loanTerm').value;

    // Verificar que los elementos existan antes de acceder a sus propiedades
    if (loanAmount && loanTerm) {
        var monthlyPayment = (loanAmount * interestRate) / (1 - Math.pow(1 + interestRate, -loanTerm));

        // Paso adicional: Definir monthlyPayment como variable global
        window.monthlyPayment = monthlyPayment;

        var monthlyPaymentContainer = document.getElementById('monthlyPaymentContainer');
        monthlyPaymentContainer.style.display = 'block';

        var monthlyPaymentValue = document.getElementById('monthlyPaymentValue');
        monthlyPaymentValue.textContent = formatCurrency(monthlyPayment);

        // Paso 2: Generar tabla de amortización
        generateAmortizationTable(loanAmount, interestRate, loanTerm);
    } else {
        console.error("No se puede calcular la cuota mensual. Asegúrate de que el monto y el plazo sean válidos.");
    }
}



// Paso 2: Función para generar la tabla de amortización
function generateAmortizationTable(loanAmount, interestRate, loanTerm) {
    var amortizationContainer = document.getElementById('amortizationContainer');
    
    var tableHTML = '<table id="amortizationTable">';
    tableHTML += '<tr><th>Cuota</th><th>Pago Mensual</th><th>Interés</th><th>Capital</th><th>Saldo Pendiente</th></tr>';

    var balance = loanAmount;
    for (var i = 1; i <= loanTerm; i++) {
        // Paso adicional: Usar window.monthlyPayment en lugar de monthlyPayment
        var interest = balance * interestRate;
        var principal = window.monthlyPayment - interest;
        balance = balance - principal;

        tableHTML += '<tr><td>' + i + '</td><td>' + formatCurrency(window.monthlyPayment) + '</td><td>' + formatCurrency(interest) + '</td><td>' + formatCurrency(principal) + '</td><td>' + formatCurrency(balance) + '</td></tr>';
    }

    tableHTML += '</table>';

    // Mostrar la tabla en el contenedor
    amortizationContainer.innerHTML = tableHTML;
}



// Paso 9: Mostrar y ocultar tabla de amortización
function toggleAmortizationTable() {
    var amortizationContainer = document.getElementById('amortizationContainer');
    
    // Guardar la posición actual de desplazamiento
    var scrollPosition = window.scrollY;

    // Mostrar u ocultar la tabla de amortización
    amortizationContainer.style.display = (amortizationContainer.style.display === 'none' || amortizationContainer.style.display === '') ? 'block' : 'none';

    // Restaurar la posición de desplazamiento después de la acción
    if (amortizationContainer.style.display === 'block') {
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
}


// Paso 8: Descargar tabla de amortización en PDF
function downloadPDF() {
    // Obtener datos del préstamo
    var loanAmount = formatCurrency(document.getElementById('loanAmount').value);
    var interestRate = '15% N.A. (1.25% mensual)';
    var loanTerm = document.getElementById('loanTerm').value + ' meses';

    // Obtener fecha y hora actual
    var currentDate = new Date();
    var formattedDate = currentDate.toLocaleDateString('es-CO') + ' ' + currentDate.toLocaleTimeString('es-CO');

    // Crear contenido del PDF
    var pdfContent = {
        content: [
            { text: '\n\n' },
            { text: 'COOPROFESORESUN - Crédito Aniversario', style: 'header' },
            { text: '\n\n' },
            { text: 'Fecha de simulación: ' + formattedDate, style: 'subheader' },
            { text: 'Monto del Préstamo: ' + loanAmount, style: 'subheader' },
            { text: 'Tasa de Interés: ' + interestRate, style: 'subheader' },
            { text: 'Plazo del Préstamo: ' + loanTerm, style: 'subheader' },
            '\n\n', // Espacio en blanco para centrar la tabla
            { table: { body: getAmortizationData(), layout: 'lightHorizontalLines', width: ['*'], alignment: 'center' } }, // Centrar la tabla
            { text: '\n\n' }, // Saltos de línea después de la tabla
            { text: 'Nota: Los cálculos pueden variar según condiciones del crédito.', style: 'note' },
            { text: 'Nota: La cuota mensual no contempla el seguro.', style: 'note' }
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10], color: '#3498db' }, // Azul brillante
            subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 0], color: '#555' }, // Gris oscuro
            note: { fontSize: 10, margin: [0, 5, 0, 0], color: '#777' } // Gris claro
        }
    };
    
    // Generar el PDF
    pdfMake.createPdf(pdfContent).download('tabla_amortizacion.pdf');


}


// Obtener datos de amortización para la tabla del PDF
function getAmortizationData() {
    var data = [['Cuota', 'Pago Mensual', 'Interés', 'Capital', 'Saldo Pendiente']];
    var balance = document.getElementById('loanAmount').value;
    var interestRate = 0.0125; // 1.25% mensual
    var loanTerm = document.getElementById('loanTerm').value;

    for (var i = 1; i <= loanTerm; i++) {
        var interest = balance * interestRate;
        var principal = window.monthlyPayment - interest;
        balance = balance - principal;

        data.push([i, formatCurrency(window.monthlyPayment), formatCurrency(interest), formatCurrency(principal), formatCurrency(balance)]);
    }

    return data;
}

// Función para formatear moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
}

// Escuchar cambios en el monto del préstamo y recalcular
document.getElementById('loanAmount').addEventListener('input', function () {
    recalculateLoan();
});

// Paso 3: Función para recalcular cuota mensual y amortización
function recalculateLoan() {
    var loanAmount = document.getElementById('loanAmount').value;
    var interestRate = 0.0125; // 1.25% mensual
    var loanTerm = document.getElementById('loanTerm').value;

    // Verificar que el monto y el plazo sean válidos antes de recalcular
    if (loanAmount && loanTerm) {
        var monthlyPayment = (loanAmount * interestRate) / (1 - Math.pow(1 + interestRate, -loanTerm));
        
        
        // Actualizar la cuota mensual en la interfaz
        var monthlyPaymentValue = document.getElementById('monthlyPaymentValue');
        monthlyPaymentValue.textContent = formatCurrency(monthlyPayment);
        

        // Generar y mostrar la nueva tabla de amortización
        generateAmortizationTable(loanAmount, interestRate, loanTerm);
        calculateLoan();
    }
}
