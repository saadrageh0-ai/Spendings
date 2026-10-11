let saved;

try {
  saved = JSON.parse(localStorage.getItem("saved")) || { trip: [] };
} catch (error) {
  saved = { trip: [] };
}

if (!saved || !Array.isArray(saved.trip)) {
  saved = { trip: [] };
}

let spending = saved.trip;

function saveData() {
  localStorage.setItem("saved", JSON.stringify(saved));
}

// ---------- Header + theme ----------
let introSection = document.createElement("div");
introSection.className = "intro-section";
document.body.append(introSection)

let intro = document.createElement("h1");
intro.textContent = "Spending Sheet";
intro.className = "intro";
introSection.append(intro);

let switchBtn = document.createElement("button");
switchBtn.className = "switch-btn";
switchBtn.textContent = "Switch Theme";
introSection.append(switchBtn);

switchBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
});

// ---------- Date ----------
let dayOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let currentDate = new Date();

let todayDate = document.createElement("h3");
todayDate.className = "date";
introSection.append(todayDate);

function renderDate() {
  let dayName = dayOfTheWeek[currentDate.getDay()];
  let dateString = currentDate.toLocaleDateString();
  todayDate.textContent = `${dayName} ${dateString}`;
}

renderDate();

// ---------- Form ----------
let spendingForm = document.createElement("div");
spendingForm.className = "spending-form";
document.body.append(spendingForm);

let dateSection = document.createElement("div");
dateSection.className = "date-section";
spendingForm.append(dateSection);

let dateLabel = document.createElement("label");
dateLabel.className = "date-label";
dateLabel.textContent = "Date : ";
dateSection.append(dateLabel);

let dateInput = document.createElement("input");
dateInput.className = "date-input";
dateInput.type = "date";
dateSection.append(dateInput);

dateInput.value = currentDate.toISOString().split("T")[0];

dateInput.addEventListener("change", function () {
  let [year, month, day] = dateInput.value.split("-").map(Number);
  currentDate = new Date(year, month - 1, day);
  renderDate();
});

let nameSection = document.createElement("div");
nameSection.className = "name-section";
spendingForm.append(nameSection);

let nameLabel = document.createElement("label");
nameLabel.className = "name-label";
nameLabel.textContent = "Name of Store: ";
nameSection.append(nameLabel);

let nameOfStore = document.createElement("input");
nameOfStore.className = "name-input";
nameOfStore.placeholder = "Store name";
nameSection.append(nameOfStore);

let itemSection = document.createElement("div");
itemSection.className = "item-section";
spendingForm.append(itemSection);

let addBtn = document.createElement("input");
addBtn.type = "button";
addBtn.className = "add-btn";
addBtn.value = "Add";
itemSection.append(addBtn);

itemSection.hidden = true;

nameOfStore.addEventListener("input", function () {
  itemSection.hidden = nameOfStore.value.trim() === "";
});

// ---------- Trip list ----------
let tripList = document.createElement("ol");
tripList.className = "trip-list";
document.body.append(tripList);

function renderEntry(entry) {
  let li = document.createElement("li");
  li.className = "trip-item";

  let header = document.createElement("h3");
  header.textContent = `${entry.name} - ${entry.date}`;
  li.append(header);

  // items already in this trip
  let itemsList = document.createElement("ul");
  let basicTotal = 0;
  let nonBasicTotal = 0;

  let editingIndex = null;

  entry.items.forEach(function (item, index) {
    if (item.catalog === "Basic") {
      basicTotal += item.cost;
    } else {
      nonBasicTotal += item.cost;
    }

    let itemLi = document.createElement("li");
    itemLi.textContent = `${item.itemName} - $${item.cost.toFixed(2)} - ${item.catalog} `;

    let editItemBtn = document.createElement("button");
    editItemBtn.textContent = "Edit";
    editItemBtn.addEventListener("click", function () {
      itemInput.value = item.itemName;
      costInput.value = item.cost;
      typeSelect.value = item.catalog;
      editingIndex = index;
    });

    let deleteItemBtn = document.createElement("button");
    deleteItemBtn.textContent = "Delete";
    deleteItemBtn.addEventListener("click", function () {
      entry.items.splice(index, 1);
      saveData();
      renderAll();
    });

    itemLi.append(editItemBtn, deleteItemBtn);
    itemsList.append(itemLi);
  });
  li.append(itemsList);

  // this trip's own inputs
  let itemInput = document.createElement("input");
  itemInput.placeholder = "item name";

  let costInput = document.createElement("input");
  costInput.type = "number";
  costInput.min = 0;
  costInput.placeholder = "cost";

  let typeSelect = document.createElement("select");
  typeSelect.innerHTML = "<option>Basic</option><option>Non-Basic</option>";

  let addItem = document.createElement("button");
  addItem.textContent = "Add Item";
  addItem.addEventListener("click", function () {
    if (itemInput.value.trim() === "") return;
    if (costInput.value <= 0) return;

    let updatedItem = {
      itemName: itemInput.value.trim(),
      cost: Number(costInput.value),
      catalog: typeSelect.value
    };

    if (editingIndex === null) {
      entry.items.push(updatedItem); // Add a new item
    } else {
      entry.items[editingIndex] = updatedItem; // Replace the old item
      editingIndex = null;
    }
    saveData();
    renderAll();
  });

  li.append(itemInput, costInput, typeSelect, addItem);

  // totals
  let totalMsg = document.createElement("p");
  totalMsg.textContent =
    `Basic: $${basicTotal.toFixed(2)} | Non-Basic: $${nonBasicTotal.toFixed(2)} | Total: $${(basicTotal + nonBasicTotal).toFixed(2)}`;
  li.append(totalMsg);

  let totalBasic = 0;
  let nonTotalBasic = 0;

  spending.forEach(function (trip) {
    trip.items.forEach(function (item) {
      if (item.catalog === "Basic") {
        totalBasic += item.cost
      } else {
        nonTotalBasic += item.cost
      }
      console.log(totalBasic, nonTotalBasic);
    });
  });

  let sumTotal = document.createElement("p");
  sumTotal.className = "total-msg";
  li.append(sumTotal);
  sumTotal.textContent = `Total Spendind for Basic $${totalBasic} | and for Non Basic $${nonTotalBasic}`;

  let deleteTripBtn = document.createElement("button");
  deleteTripBtn.textContent = "Delete Trip";
  deleteTripBtn.addEventListener("click", function () {
    spending.splice(spending.indexOf(entry), 1);
    saveData();
    renderAll();
  });

  li.append(deleteTripBtn);

  tripList.append(li);
}

function renderAll() {
  tripList.innerHTML = "";
  spending.forEach(function (entry) {
    renderEntry(entry);
  });
}

// ---------- Add trip ----------
addBtn.addEventListener("click", function () {
  const name = nameOfStore.value.trim();

  spending.push({
    date: `${dayOfTheWeek[currentDate.getDay()]} ${currentDate.toLocaleDateString()}`,
    name: name,
    items: []
  });
  saveData();
  renderAll();

  nameOfStore.value = "";
  itemSection.hidden = true;
  nameOfStore.focus();
});

renderAll();