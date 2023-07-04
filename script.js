var members = [];
var selectToggle = 0;
var expenses = [];
function appendMember(){
    let nm = document.getElementById('member_name').value;
    if (nm == "") return;
    console.log(nm);
    let newElement = document.getElementById('member-list').appendChild(document.createElement('li'));
    newElement.innerHTML = nm + "&ThickSpace;&ThickSpace;&ThickSpace;&ThickSpace;&ThickSpace;&cross;";
    newElement.id = members.length + 1;
    newElement.classList.add('list-group-item', 'hovercursor')
    newElement.addEventListener('click', (ev)=>{
        removeMember(ev.target.id);
    });    
    members.push({"name" : nm, "id": (members.length + 1), "element": newElement});
    document.getElementById('member_name').value = "";
    update_form();
}
function removeMember(id){
    if (id <= members.length){
        members[id-1].element.remove();
        members.splice(id -1, 1);
    }
    for (let i = 0; i < members.length; i++){
            members[i].id = i+1;
            members[i].element.id = i+1;
    }
    update_form();
}
function update_form(){
    let ele = document.getElementById('exp-pb');
    ele.innerHTML = "";
    members.forEach(mem=>{
        ele.innerHTML += "<option value='" + mem.id + "'>" + mem.name + "</option>";
    });
    let ele2 = document.getElementById('exp-sb');
    ele2.innerHTML = "";
    ele2.size = members.length;
    members.forEach(mem=>{
        ele2.innerHTML += "<option class='sb-options' value='" + mem.id + "'>" + mem.name + "</option>";
    });
}
function selectAllButton(){
    let opts = document.getElementsByClassName('sb-options');
    for (let i  = 0; i < opts.length; i++){
        if (selectToggle == 0){
            opts[i].removeAttribute('selected');
            opts[i].setAttribute('selected', 'selected');
        }else{
            opts[i].setAttribute('selected', 'selected');
            opts[i].removeAttribute('selected');
        }
    }
    if (selectToggle == 0){
        selectToggle = 1;
    }else{
        selectToggle = 0;
    }
}
function addExpense(){
    let result = [];
    let opt;
    let options = document.getElementById('exp-sb').options;
    for (var i=0, iLen=options.length; i<iLen; i++) {
        opt = options[i];
    
        if (opt.selected) {
          result.push(parseInt(opt.value));
        }
    }
    let exp = {
        "desc": document.getElementById('expense-desc').value,
        "amount": parseFloat(document.getElementById('expense-amt').value),
        "paid_by" : parseInt(document.getElementById('exp-pb').value),
        "shared" : result
    };
    expenses.push(exp);
    let exptbl = document.getElementById('exp-tbl-body');
    let payer = members[exp.paid_by - 1].name;
    let rec = [];
    for (let i=0 ; i<exp.shared.length; i++){
        rec.push(members[exp.shared[i] - 1].name);
    }
    let recstr = rec.join(', ');
    let exprow = "<tr><td>" + exp.desc +"</td><td>" + exp.amount + "</td><td>" + payer + "</td><td>" + recstr +"</td></tr>";
    exptbl.innerHTML += exprow;
    return;
}
function calculateTransactions(){
    let netBalances = [];
    let expenditures = []
    for (let i = 0; i < members.length; i++){
        netBalances.push(0);
        expenditures.push(0);
    }
    let sum = 0;
    for (let i = 0; i< expenses.length; i++){
        let amt = expenses[i].amount;
        if (expenses[i].shared.length == 0) continue;
        let shamt = expenses[i].amount / expenses[i].shared.length;
        netBalances[expenses[i].paid_by - 1] += amt;
        for (let j = 0; j < expenses[i].shared.length; j++){
            netBalances[expenses[i].shared[j] - 1] -= shamt;
            expenditures[expenses[i].shared[j] - 1] += shamt;
        }
    }
    const totalBalance = Object.values(netBalances).reduce((total, balance) => total + balance, 0);
    const averageBalance = totalBalance / members.length;
  
    // Step 4: Identify participants with imbalanced amounts
    const debtors = [];
    const creditors = [];
    for (const participant of members) {
        const netBalance = netBalances[participant.id - 1];
        if (netBalance < averageBalance) {
          debtors.push({ participant, netBalance });
        } else if (netBalance > averageBalance) {
          creditors.push({ participant, netBalance });
        }
    }
    const transactions = [];

    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
  
      const amount = Math.min(Math.abs(debtor.netBalance), Math.abs(creditor.netBalance));
      transactions.push({ from: debtor.participant, to: creditor.participant, amount });
  
      debtor.netBalance += amount;
      creditor.netBalance -= amount;
  
      if (debtor.netBalance === 0) {
        debtors.shift();
      }
  
      if (creditor.netBalance === 0) {
        creditors.shift();
      }
    }
    console.log(transactions);
    let tbl = document.getElementById('tr-tbl-body');
    tbl.innerHTML = "";
    let tstr = "";
    for (let i = 0; i < transactions.length; i++){
        tstr = "<tr><td>" + transactions[i].from.name + "</td><td>" + transactions[i].to.name +"</td><td>" + Math.round(transactions[i].amount) + "</td></tr>";
        tbl.innerHTML += tstr;
    }
    let tbl2 = document.getElementById('phe-tbl-body');
    tbl2.innerHTML = "";
    tstr = "";
    let sumexpend = 0;
    for (let i = 0; i < expenditures.length; i++){
        tstr = "<tr><td>" + members[i].name + "</td><td>" + Math.round(expenditures[i]) + "</td></tr>";
        tbl2.innerHTML += tstr;
        sumexpend += expenditures[i];
    }
    tstr = "<tr><td> TOTAL : </td><td>" + Math.round(sumexpend) + "</td></tr>";
    tbl2.innerHTML += tstr;
}
function printTable() {
    // Apply CSS styles to optimize the table for printing
    const table = document.getElementById('exp-table');
    table.classList.add('table', 'table-bordered');
  
    // Open a new window and write the table content
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Table</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<table>' + table.innerHTML + '</table>');
    printWindow.document.write('</body></html>');
  
    // Call the print function on the new window
    printWindow.print();
    printWindow.close();
  }
  

document.getElementById('add-member').addEventListener('submit', ev=>{
    ev.preventDefault();
});
document.getElementById('add-exp').addEventListener('submit', ev=>{
    ev.preventDefault();
});
