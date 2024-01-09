window.onload = function () {
    let userBudget = 0;
    let expenses = [];
    let totalAmount = 0;
    let expenseChart;

    const budgetInput = document.getElementById('userInput');
    const categoryInput = document.getElementById('category-input');
    const amountInput = document.getElementById('amount-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const expenseTableBody = document.getElementById('expense-table-body');
    const totalAmountCell = document.getElementById('total-amount');
    const balance = document.getElementById('balance');
    const expenseChartCanvas = document.getElementById('expense-chart');
    const ctx = expenseChartCanvas.getContext('2d');

    // Check for existing user budget in local storage
    if (localStorage.getItem('userBudget')) {
        userBudget = parseFloat(localStorage.getItem('userBudget'));
        budgetInput.value = userBudget;
    }

    // Check for existing expenses in local storage
    if (localStorage.getItem('expenses')) {
        expenses = JSON.parse(localStorage.getItem('expenses'));
        totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    // Populate the expenses table from local storage
    expenses.forEach(expense => {
        const newRow = expenseTableBody.insertRow();
        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const editCell = newRow.insertCell();
        const deleteCell = newRow.insertCell();
        const editBtn = document.createElement('button');
        const deleteBtn = document.createElement('button');

        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function () {
            editExpense(newRow);
        });

        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function () {
            deleteExpense(newRow, expense);
        });

        categoryCell.textContent = expense.category;
        amountCell.textContent = expense.amount;
        dateCell.textContent = expense.date;
        editCell.appendChild(editBtn);
        deleteCell.appendChild(deleteBtn);
    });

    // Render the initial pie chart
    renderPieChart();

    // Add event listener to the budget input for real-time updates
    budgetInput.addEventListener('input', updateContent);

    // Add event listener to the "Add" button to handle expense addition
    addBtn.addEventListener('click', addExpense);

    // Function to update content based on user input
    function updateContent() {
        userBudget = parseFloat(budgetInput.value) || 0;
        localStorage.setItem('userBudget', userBudget.toString());

        var inputValue = document.getElementById('userInput').value;
        document.getElementById('output').innerText = "Your Income: " + inputValue;

        // Display balance and percentage only if the budget is entered
        if (userBudget > 0) {
            updateBalance();
            renderPieChart();
            document.getElementById('balance').style.display = 'block';
            document.getElementById('remainingPercentage').style.display = 'block';
        }
    }

    // Function to add a new expense
    function addExpense() {
        const userCategory = categoryInput.value;
        const userAmount = Number(amountInput.value);
        const userDate = dateInput.value;

        if (userCategory === '' || isNaN(userAmount) || userAmount <= 0 || userDate === '') {
            alert('Please enter valid data for all fields.');
            return;
        }

        const newExpense = { category: userCategory, amount: userAmount, date: userDate };
        expenses.push(newExpense);

        totalAmount += userAmount;
        totalAmountCell.textContent = totalAmount;

        const newRow = expenseTableBody.insertRow();
        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const editCell = newRow.insertCell();
        const deleteCell = newRow.insertCell();
        const editBtn = document.createElement('button');
        const deleteBtn = document.createElement('button');

        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function () {
            editExpense(newRow);
        });

        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function () {
            deleteExpense(newRow, newExpense);
        });

        categoryCell.textContent = newExpense.category;
        amountCell.textContent = newExpense.amount;
        dateCell.textContent = newExpense.date;
        editCell.appendChild(editBtn);
        deleteCell.appendChild(deleteBtn);

        localStorage.setItem('userBudget', userBudget.toString());
        localStorage.setItem('expenses', JSON.stringify(expenses));

        updateBalance();
        renderPieChart();
    }

    // Function to edit an existing expense
    function editExpense(row) {
        const rowIndex = row.rowIndex - 1;
        const existingExpense = expenses[rowIndex];

        const updatedCategory = prompt('Enter updated category:', existingExpense.category);
        const updatedAmount = prompt('Enter updated amount:', existingExpense.amount);
        const updatedDate = prompt('Enter updated date:', existingExpense.date);

        if (updatedCategory !== null) {
            existingExpense.category = updatedCategory;
        }

        if (updatedAmount !== null && !isNaN(updatedAmount) && updatedAmount > 0) {
            totalAmount -= existingExpense.amount;
            totalAmount += parseFloat(updatedAmount);
            totalAmountCell.textContent = totalAmount;

            existingExpense.amount = parseFloat(updatedAmount);
        }

        if (updatedDate !== null) {
            existingExpense.date = updatedDate;
        }

        row.cells[0].textContent = existingExpense.category;
        row.cells[1].textContent = existingExpense.amount;
        row.cells[2].textContent = existingExpense.date;

        localStorage.setItem('expenses', JSON.stringify(expenses));

        updateBalance();
        renderPieChart();
    }

    // Function to delete an existing expense
    function deleteExpense(row, expense) {
        totalAmount -= expense.amount;
        totalAmountCell.textContent = totalAmount;

        expenses = expenses.filter(exp => exp !== expense);
        expenseTableBody.removeChild(row);

        localStorage.setItem('expenses', JSON.stringify(expenses));

        updateBalance();
        renderPieChart();
    }

    // Function to update the balance and remaining percentage
    function updateBalance() {
        balance.textContent = "Balance: " + (userBudget - totalAmount);

        // Display the remaining budget percentage and message
        const remainingPercentage = ((userBudget - totalAmount) / userBudget) * 100;
        const percentageElement = document.getElementById('percentage');
        percentageElement.textContent = remainingPercentage.toFixed(2) + "%";

        const messageElement = document.getElementById('remainingPercentage');
        if (remainingPercentage < 20) {
            messageElement.innerHTML = "Remaining Budget : <span id='percentage' style='color: red;'>" + remainingPercentage.toFixed(2) + "%</span> It would be best if you save 20% of your Income.";
        } else {
            messageElement.innerHTML = "Remaining Budget : <span id='percentage'>" + remainingPercentage.toFixed(2) + "%  </span> You are doing Good!";
        }
    }

    // Function to render the pie chart
    function renderPieChart() {
        if (expenses.length === 0) {
            return;
        }

        const categoryNames = expenses.map(expense => expense.category);
        const categoryAmounts = expenses.map(expense => expense.amount);

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categoryNames,
                datasets: [{
                    data: categoryAmounts,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0', '#673AB7', '#FF9800'],
                }],
            },
            options: {
                responsive: true,
                aspectRatio: 5.5,
            },
        });
    }

    // Function to download reports in Excel format
    function downloadReports() {
        const table = document.querySelector('table');
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ExpenseTable');
        XLSX.writeFile(wb, 'ExpenseTable.xlsx');
        alert('Downloaded successfully');
    }

    // Add event listener to the "Download Reports" button
    const downloadButton = document.getElementById('Download-button');
    downloadButton.addEventListener('click', downloadReports);
};
