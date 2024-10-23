async function getItem() {
  const storedItems = JSON.parse(localStorage.getItem("cartItems"));

  if (storedItems && storedItems.length > 0) {
    populateTable(storedItems);
  } else {
    const url =
      "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";
    try {
      const response = await fetch(url);
      const data = await response.json();
      const items = data.items;
      localStorage.setItem("cartItems", JSON.stringify(items)); 
      populateTable(items);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

function populateTable(items) {
  const cartBody = document.getElementById("cartBody");
  cartBody.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("tr");
    const subtotal = item.presentment_price * item.quantity;

    row.innerHTML = `
      <td>
        <div class="product">
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: auto;">
          ${item.title}
        </div>
      </td>
      <td>${formatNumber(item.price)}</td>
      <td>
        <input type="number" class="quantity-input" value="${item.quantity}" min="1" oninput="updateSubtotal(this, ${item.presentment_price})">
      </td>
      <td class="subtotal">${formatNumber(subtotal)}</td>
      <td><button class="delete-btn" onclick="confirmDelete(this)"><i class="bi bi-trash3-fill"></i></button></td>
    `;

    cartBody.appendChild(row);
  });
  updateCardDetails();
}

function updateSubtotal(input, price) {
  const quantity = input.value;
  const subtotalCell = input.closest("tr").querySelector(".subtotal");
  const subtotal = price * quantity;
  subtotalCell.textContent = formatNumber(subtotal);
  updateCardDetails();
}

function updateCardDetails() {
  const subtotalCells = document.querySelectorAll(".subtotal");
  const itemNames = document.querySelectorAll(".product");
  let subtotalTotal = 0;

  const itemListElement = document.querySelector(".itemList");
  itemListElement.innerHTML = '';

  subtotalCells.forEach((cell, index) => {
    const itemName = itemNames[index].textContent;
    const itemSubtotal = parseFloat(cell.textContent.replace(/,/g, '')) || 0;

    subtotalTotal += itemSubtotal; 

    if (itemSubtotal > 0) {
      const itemElement = document.createElement("div");
      itemElement.textContent = `${itemName}: ${formatNumber(itemSubtotal)}`;
      itemListElement.appendChild(itemElement);
    }
  });

  const totalPriceElement = document.querySelector(".totalPrice");
  totalPriceElement.textContent = formatNumber(subtotalTotal);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let rowToDelete;

function confirmDelete(button) {
  rowToDelete = button.closest("tr");
  const modal = document.getElementById("confirmModal");
  modal.style.display = "block";
}


document.querySelector(".close").onclick = function () {
  document.getElementById("confirmModal").style.display = "none";
};

document.getElementById("confirmYes").onclick = function () {
  if (rowToDelete) {
    const itemName = rowToDelete.querySelector(".product").textContent.trim();
    
    removeFromLocalStorage(itemName);
    
    rowToDelete.remove();
    updateCardDetails(); 
    document.getElementById("confirmModal").style.display = "none";
  }
};

document.getElementById("confirmNo").onclick = function () {
  document.getElementById("confirmModal").style.display = "none";
};

window.onclick = function (event) {
  const modal = document.getElementById("confirmModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

getItem();

function removeFromLocalStorage(itemName) {
  const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    const updatedItems = items.filter(item => item.title !== itemName);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
}
