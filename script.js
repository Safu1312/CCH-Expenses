// Exchange rates (you can update these as needed)
const exchangeRates = {
    LKR: 0.0025,  // 1 LKR = 0.0025 GBP
    USD: 0.76,    // 1 USD = 0.76 GBP
    GBP: 1        // 1 GBP = 1 GBP
};

// Sample expenses data (you can modify this)
let expenses = [
    {
        id: 1,
        description: "Travel Insurance Fee (1 Year)",
        amount: 171.55,
        currency: "USD",
        date: "2025-09-29",
        receipt: "assets/Travel_insurance.pdf"
    },
    {
        id: 2,
        description: "TB Test (Medical) Fee for UK Visa Application",
        amount: 18130,
        currency: "LKR",
        date: "2025-10-15",
        receipt: "assets/TB_Test.pdf"
    },
    {
        id: 3,
        description: "Immigration Health Surcharge (IHS) Payment",
        amount: 1035,
        currency: "GBP",
        date: "2025-10-17",
        receipt: "assets/IHS_Payment.pdf"
    },
    {
        id: 4,
        description: "Visa Payment",
        amount: 443,
        currency: "USD",
        date: "2025-10-17",
        receipt: "assets/Visa_Payment.pdf"
    },
    {
        id: 5,
        description: "Flight Ticket to UK",
        amount: 112814,
        currency: "LKR",
        date: "2025-10-27",
        receipt: "assets/Flight_Ticket.pdf"
    }
];

let currentReceipt = null;
let currentReceiptName = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderExpenses();
    updateTotals();
});

// Check if file is PDF
function isPDF(filename) {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
}

// Get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Convert currency to GBP
function convertToGBP(amount, currency) {
    return amount * exchangeRates[currency];
}

// Format currency
function formatCurrency(amount, currency) {
    const symbols = {
        LKR: 'Rs ',
        USD: '$',
        GBP: '£'
    };
    
    return symbols[currency] + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Render expenses table
function renderExpenses() {
    const tbody = document.getElementById('expensesBody');
    tbody.innerHTML = '';

    expenses.forEach((expense, index) => {
        const gbpAmount = convertToGBP(expense.amount, expense.currency);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <strong>${expense.description}</strong>
            </td>
            <td>
                ${formatCurrency(expense.amount, expense.currency)}
                <span class="currency-badge currency-${expense.currency.toLowerCase()}">${expense.currency}</span>
            </td>
            <td>${formatCurrency(gbpAmount, 'GBP')}</td>
            <td>${formatDate(expense.date)}</td>
            <td>
                ${expense.receipt ? `
                    <div class="receipt-actions">
                        <button class="view-btn" onclick="viewReceipt(${expense.id})">
                            👁 View
                        </button>
                        <button class="download-btn-small" onclick="downloadReceiptDirect(${expense.id})">
                            Download Receipt ⬇
                        </button>
                    </div>
                ` : '<span class="no-receipt">No receipt</span>'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Update totals
function updateTotals() {
    let totalGBP = 0;
    let totalLKR = 0;

    expenses.forEach(expense => {
        const gbpAmount = convertToGBP(expense.amount, expense.currency);
        totalGBP += gbpAmount;
        
        if (expense.currency === 'LKR') {
            totalLKR += expense.amount;
        } else {
            totalLKR += expense.amount / exchangeRates['LKR'];
        }
    });

    document.getElementById('totalGBP').textContent = formatCurrency(totalGBP, 'GBP');
    document.getElementById('totalLKR').textContent = formatCurrency(totalLKR, 'LKR');
}

// View receipt in modal - UPDATED to handle PDFs
function viewReceipt(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.receipt) {
        currentReceipt = expense.receipt;
        currentReceiptName = expense.description;
        
        const receiptViewer = document.getElementById('receiptViewer');
        receiptViewer.innerHTML = ''; // Clear previous content
        
        if (isPDF(expense.receipt)) {
            // For PDF files, use iframe
            const iframe = document.createElement('iframe');
            iframe.src = expense.receipt;
            iframe.type = "application/pdf";
            receiptViewer.appendChild(iframe);
            
            // Fallback message for browsers that don't support PDF viewing
            const fallback = document.createElement('div');
            fallback.className = 'pdf-fallback';
            fallback.innerHTML = `
                <p>📄 PDF Document</p>
                <p>If the PDF doesn't display above, <a href="${expense.receipt}" target="_blank">click here to open in a new tab</a></p>
            `;
            receiptViewer.appendChild(fallback);
        } else {
            // For image files, use img tag
            const img = document.createElement('img');
            img.src = expense.receipt;
            img.alt = 'Receipt';
            img.onerror = function() {
                receiptViewer.innerHTML = `
                    <div class="pdf-fallback">
                        <p>❌ Failed to load receipt</p>
                        <p><a href="${expense.receipt}" target="_blank">Click here to open in a new tab</a></p>
                    </div>
                `;
            };
            receiptViewer.appendChild(img);
        }
        
        document.getElementById('receiptModal').style.display = 'block';
    }
}

// Close receipt modal
function closeModal() {
    document.getElementById('receiptModal').style.display = 'none';
    currentReceipt = null;
    currentReceiptName = null;
    document.getElementById('receiptViewer').innerHTML = '';
}

// Download receipt - UPDATED
function downloadReceipt() {
    if (currentReceipt) {
        const link = document.createElement('a');
        link.href = currentReceipt;
        
        // Determine file extension
        const extension = isPDF(currentReceipt) ? '.pdf' : '.jpg';
        const filename = currentReceiptName ? 
            currentReceiptName.replace(/\s+/g, '_') + extension : 
            'receipt_' + Date.now() + extension;
        
        link.download = filename;
        link.click();
    }
}

// Download receipt directly - UPDATED
function downloadReceiptDirect(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.receipt) {
        const link = document.createElement('a');
        link.href = expense.receipt;
        
        // Determine file extension
        const extension = '.' + getFileExtension(expense.receipt);
        link.download = expense.description.replace(/\s+/g, '_') + extension;
        
        link.click();
    }
}

// Open add expense modal
function openAddExpenseModal() {
    document.getElementById('addExpenseModal').style.display = 'block';
    document.getElementById('date').valueAsDate = new Date();
}

// Close add expense modal
function closeAddExpenseModal() {
    document.getElementById('addExpenseModal').style.display = 'none';
    document.getElementById('expenseForm').reset();
}

// Add new expense - UPDATED to accept PDFs
function addExpense(event) {
    event.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;
    const date = document.getElementById('date').value;
    const receiptFile = document.getElementById('receipt').files[0];

    const newExpense = {
        id: expenses.length + 1,
        description,
        amount,
        currency,
        date,
        receipt: null
    };

    // Handle receipt file upload (now supports both images and PDFs)
    if (receiptFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newExpense.receipt = e.target.result;
            expenses.push(newExpense);
            renderExpenses();
            updateTotals();
            closeAddExpenseModal();
        };
        reader.readAsDataURL(receiptFile);
    } else {
        expenses.push(newExpense);
        renderExpenses();
        updateTotals();
        closeAddExpenseModal();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const receiptModal = document.getElementById('receiptModal');
    const addExpenseModal = document.getElementById('addExpenseModal');
    
    if (event.target === receiptModal) {
        closeModal();
    }
    if (event.target === addExpenseModal) {
        closeAddExpenseModal();
    }
}