
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

//función para calcular la cuota mensual total, considerando el seguro.
function calculateMonthlyPayment(loanAmount, interestRate, loanTerm, insuranceRate) {
    var monthlyPayment = (loanAmount * interestRate) / (1 - Math.pow(1 + interestRate, -loanTerm));

    // Calcular la cuota mensual total (préstamo + seguro)
    var totalMonthlyPayment = monthlyPayment + (loanAmount * insuranceRate);
    
    // Paso adicional: Definir totalMonthlyPayment como variable global
    window.totalMonthlyPayment = totalMonthlyPayment;

    return totalMonthlyPayment;
}


//Función para Obtener la Tasa de Seguro según la Edad
function getInsuranceRate(age) {
    if (age >= 18 && age <= 74) {
        return 0.00042; // Tasa mensual para personas entre 18 y 74 años: 0.40%
    } else if (age >= 75 && age <= 84) {
        return 0.004; // Tasa mensual para personas entre 75 y 84 años: 4.0%
    } else if (age > 84) {
        return 0.008; // Tasa mensual para personas mayores de 84 años: 8%
    } else {
        return 0; // Sin seguro para edades no especificadas
    }
}

// Paso 3: Calcular y mostrar la cuota mensual
function calculateLoan() {
    var loanAmount = document.getElementById('loanAmount').value;
    var interestRate = 0.0125; // 1.25% mensual
    var loanTerm = document.getElementById('loanTerm').value;
    var age = document.getElementById('age').value;

    // Verificar que los elementos existan antes de acceder a sus propiedades
    if (loanAmount && loanTerm && age) {
        // Calcular la tasa de seguro según la edad
        var insuranceRate = getInsuranceRate(age);

        // Calcular la cuota mensual total (préstamo + seguro)
        var totalMonthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm, insuranceRate);

        // Actualizar la cuota mensual en la interfaz
        var monthlyPaymentValue = document.getElementById('monthlyPaymentValue');
        monthlyPaymentValue.textContent = formatCurrency(totalMonthlyPayment);

        // Generar y mostrar la nueva tabla de amortización
        generateAmortizationTable(loanAmount, interestRate, loanTerm, insuranceRate);
    } else {
        console.error("No se puede calcular la cuota mensual. Asegúrate de que el monto, el plazo y la edad sean válidos.");
    }
}


// Paso 2: Función para generar la tabla de amortización
function generateAmortizationTable(loanAmount, interestRate, loanTerm, insuranceRate) {
    var amortizationContainer = document.getElementById('amortizationContainer');
    
    var tableHTML = '<table id="amortizationTable">';
    tableHTML += '<tr><th>Cuota</th><th>Pago Mensual</th><th>Interés</th><th>Seguro de Vida</th><th>Capital</th><th>Saldo Pendiente</th></tr>';

    var balance = loanAmount;
    for (var i = 1; i <= loanTerm; i++) {
        var interest = balance * interestRate;
        var insurance = balance * insuranceRate;
        var totalMonthlyPayment = window.totalMonthlyPayment; // Asumo que ya has calculado el pago total mensual
        var principal = totalMonthlyPayment - interest - insurance;

        // Si el principal es mayor que el saldo, ajusta el principal
        principal = Math.min(principal, balance);

        balance = balance - principal;

        // Evitar saldos negativos
        balance = Math.max(balance, 0);

        tableHTML += '<tr><td>' + i + '</td><td>' + formatCurrency(totalMonthlyPayment) + '</td><td>' + formatCurrency(interest) + '</td><td>' + formatCurrency(insurance) + '</td><td>' + formatCurrency(principal) + '</td><td>' + formatCurrency(balance) + '</td></tr>';
        
        // Si el saldo llega a cero, sal del bucle
        if (balance === 0) {
            break;
        }
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

    // Obtener datos adicionales
    var borrowerName = document.getElementById('borrowerName').value;
    var borrowerAge = document.getElementById('age').value;

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
            { text: 'Nombre del Solicitante: ' + borrowerName, style: 'subheader' },
            { text: 'Edad del Solicitante: ' + borrowerAge, style: 'subheader' },
            '\n\n', // Espacio en blanco para centrar la tabla
            { table: { body: getAmortizationData(), layout: 'lightHorizontalLines', width: ['*'], alignment: 'center' } }, // Centrar la tabla
            { text: '\n\n' }, // Saltos de línea después de la tabla
            { text: 'Nota: Los cálculos pueden variar según condiciones del crédito.', style: 'note' }
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
    var data = [['Cuota', 'Pago Mensual', 'Interés', 'Seguro de Vida', 'Capital', 'Saldo Pendiente']];
    var balance = parseFloat(document.getElementById('loanAmount').value);
    var interestRate = 0.0125; // 1.25% mensual
    var loanTerm = parseInt(document.getElementById('loanTerm').value);

    // Obtener edad del solicitante
    var age = parseInt(document.getElementById('age').value);

    for (var i = 1; i <= loanTerm; i++) {
        // Calcular interés
        var interest = balance * interestRate;

        // Calcular seguro
        var insuranceRate;
        if (age >= 18 && age <= 74) {
            insuranceRate = 0.00042; // 0.40% mensual
        } else if (age >= 75 && age <= 84) {
            insuranceRate = 0.004; // 4.0% mensual
        } else if (age > 84) {
            insuranceRate = 0.008; // 8.0% mensual
        } else {
            insuranceRate = 0; // Sin seguro para edades no especificadas
        }

        var insurance = balance * insuranceRate;

        // Calcular capital
        var principal = window.totalMonthlyPayment - interest - insurance;

        // Ajustar el saldo pendiente considerando el seguro
        balance = balance - principal;

        // Evitar saldos negativos
        balance = Math.max(balance, 0);

        data.push([
            i,
            window.totalMonthlyPayment.toFixed(2), // Redondear a dos decimales
            interest.toFixed(2),
            insurance.toFixed(2),
            principal.toFixed(2),
            balance.toFixed(2)
        ]);

        // Si el saldo llega a cero, salir del bucle
        if (balance === 0) {
            break;
        }
    }

    return data;
}



// Función para calcular la tasa de seguro según la edad
function calculateInsuranceRate(age) {
    if (age >= 18 && age <= 74) {
        return 0.004; // 0.4%
    } else if (age >= 75 && age <= 84) {
        return 0.04; // 4%
    } else if (age > 84) {
        return 0.08; // 8%
    }

    return 0; // Tasa predeterminada si la edad no está en ningún rango válido
}

// Función para calcular los intereses totales
function calculateTotalInterest(loanAmount, interestRate, loanTerm, insuranceRate) {
    var totalInterest = 0;
    var balance = loanAmount;

    for (var i = 1; i <= loanTerm; i++) {
        var interest = balance * interestRate;
        var insurance = balance * insuranceRate;
        totalInterest += interest;

        // Actualizar el saldo
        balance = balance - (window.totalMonthlyPayment - insurance - interest);
    }

    return totalInterest;
}

// Función para calcular el total de cuotas pagadas
function calculateTotalPayments(loanAmount, interestRate, loanTerm, insuranceRate) {
    var totalPayments = 0;
    var balance = loanAmount;

    for (var i = 1; i <= loanTerm; i++) {
        var insurance = balance * insuranceRate;
        totalPayments += window.totalMonthlyPayment - insurance;

        // Actualizar el saldo
        balance = balance - (window.totalMonthlyPayment - insurance - (balance * interestRate));
    }

    return totalPayments;
}

// Función para calcular el total del seguro de vida pagado
function calculateTotalInsurance(loanAmount, interestRate, loanTerm, insuranceRate) {
    var totalInsurance = 0;
    var balance = loanAmount;

    for (var i = 1; i <= loanTerm; i++) {
        var insurance = balance * insuranceRate;
        totalInsurance += insurance;

        // Actualizar el saldo
        balance = balance - (window.totalMonthlyPayment - insurance - (balance * interestRate));
    }

    return totalInsurance;
}

// Función para formatear moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
}

// Escuchar cambios en el monto del préstamo y recalcular
document.getElementById('loanAmount').addEventListener('input', function () {
    recalculateLoan();
});

// Escuchar cambios en la edad y recalcular
document.getElementById('age').addEventListener('input', function () {
    recalculateLoan();
});


// Paso 3: Función para recalcular cuota mensual y amortización
function recalculateLoan() {
    var loanAmount = document.getElementById('loanAmount').value;
    var interestRate = 0.0125; // 1.25% mensual
    var loanTerm = document.getElementById('loanTerm').value;
    var age = document.getElementById('age').value;

    // Verificar que el monto y el plazo sean válidos antes de recalcular
    if (loanAmount && loanTerm && age) {
        var monthlyPayment = (loanAmount * interestRate) / (1 - Math.pow(1 + interestRate, -loanTerm));
        
        
        // Actualizar la cuota mensual en la interfaz
        var monthlyPaymentValue = document.getElementById('monthlyPaymentValue');
        monthlyPaymentValue.textContent = formatCurrency(monthlyPayment);
        

        // Generar y mostrar la nueva tabla de amortización
        generateAmortizationTable(loanAmount, interestRate, loanTerm, getInsuranceRate(age));
        calculateLoan();
    }
}

