let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveAndReload() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  loadTransactions();
  updateReports();
  updateChart();
}

function loadTransactions() {
  const tbody = document.getElementById("transactionTable");
  tbody.innerHTML = "";
  transactions.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>${t.payee}</td>
      <td>₹${t.amount}</td>
      <td>${t.status}</td>
    `;
    tbody.appendChild(row);
  });
}

function updateReports() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === "Income") income += amt;
    else expense += amt;
  });
  document.getElementById("incomeTotal").textContent = income;
  document.getElementById("expenseTotal").textContent = expense;
}

function updateChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const data = transactions.reduce((acc, t) => {
    if (t.type === "Expense") {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
    }
    return acc;
  }, {});
  const categories = Object.keys(data);
  const values = Object.values(data);

  if (window.expenseChart) window.expenseChart.destroy();
  window.expenseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [{
        label: "Expenses",
        data: values,
        backgroundColor: "#ff6384"
      }]
    }
  });
}


document.getElementById("addTransactionBtn").onclick = openModal;
document.getElementById("saveTransactionBtn").onclick = () => {
  const date = document.getElementById("dateInput").value;
  const type = document.getElementById("typeInput").value;
  const category = document.getElementById("categoryInput").value;
  const payee = document.getElementById("payeeInput").value;
  const amount = document.getElementById("amountInput").value;
  const status = document.getElementById("statusInput").value;

  if (!date || !type || !category || !payee || !amount || !status) {
    alert("Please fill in all fields.");
    return;
  }

  const newTx = { date, type, category, payee, amount, status };
  transactions.push(newTx);
  closeModal();
  saveAndReload();
};

function openModal() {
  document.getElementById("transactionModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("transactionModal").style.display = "none";
}


document.getElementById("exportExcelBtn").addEventListener("click", () => {
  const worksheet = XLSX.utils.json_to_sheet(transactions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, "BudgetEase_Transactions.xlsx");
});

document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

const container = document.getElementById("dollarContainer");
function createDollar() {
  const dollar = document.createElement("div");
  dollar.classList.add("dollar");
  dollar.innerText = "💵";
  dollar.style.left = Math.random() * 100 + "vw";
  dollar.style.top = Math.random() * 100 + "vh";
  dollar.style.animationDuration = `${1 + Math.random() * 10}s`;
  container.appendChild(dollar);
  setTimeout(() => dollar.remove(), 10000);
}
setInterval(createDollar, 500);


document.addEventListener("mousemove", (e) => {
  container.style.transform = `translate(${e.clientX * 0.02}px, ${e.clientY * 0.02}px)`;
});

loadTransactions();
updateReports();
updateChart();
