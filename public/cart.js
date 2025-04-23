//set up for add to cart at post and cart
let count = 0;
let sum = 0;
let cart = JSON.parse(localStorage.getItem("cart")) || {}

//Updates table in checkout
async function updateCart() {
    cart = JSON.parse(localStorage.getItem("cart")) || {}
    sum = 0
    count = 0

    //Clears Table
    let tbody = document.getElementById("tbody")
    tbody.innerHTML = ''
    //if cart is empty returns and displays message
    if (Object.keys(cart).length === 0) {
      localStorage.setItem("count", 0)
      displayEmptyCart()
      updateTotals()
      return
    } 
    //fetch verified cart
    const verifiedCart = await fetchVerifiedCart()
    //remove unverified items from local storage cart
    cleanCart(verifiedCart)
    localStorage.setItem("cart", JSON.stringify(cart))
    
    //build item rows
    for (let id in verifiedCart) {
      let item = verifiedCart[id]
      tbody.appendChild(createCartRow(id, item))

      if (cart[id]) {
        sum += (item.price - item.discount) * cart[id]['qty']
        count += cart[id]['qty']
      }
    }
    
    appendSummaryRows(tbody)
    updateTotals()
    
    localStorage.setItem("count", count)
  }
  updateCart()
  
  //HELPER FUNCTIONS: 

  //display for empty cart
  function displayEmptyCart() {
    let tr = document.createElement('tr')
    let emptyCart= document.createElement('td')
    emptyCart.textContent =`Your Cart is Currently Empty`
    emptyCart.setAttribute('colspan', 4)
    tr.appendChild(emptyCart)
    document.getElementById("tbody").appendChild(tr);
  }

  //fetch for verified cart
  async function fetchVerifiedCart() {
    const response = await fetch('/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
    });
    return response.json();
  }
  //removes cart items from local storage that do not have valid ID or availability
  function cleanCart(verifiedCart) {
    for (let id in cart) {
        if (!verifiedCart.hasOwnProperty(id)) {
            delete cart[id];
            alert('An item in your cart is no longer available and has been removed.');
        }
        if (cart[id]['qty']>verifiedCart[id]['qty']) {
            cart[id]['qty'] = verifiedCart[id]['qty']
            // alert(`Sorry, quantity of ${cart[id]['productTitle']} was updated due to lack of stock`)
        }
    }
  }
  //creates item row in table
  function createCartRow(id, item) {
    const tr = document.createElement('tr');
    tr.appendChild(createImageCell(id, item));
    tr.appendChild(createTitleCell(id, item));
    tr.appendChild(createPriceCell(id, item));
    tr.appendChild(createQtyCell(id, item));
    tr.appendChild(createDeleteCell(id));
    return tr;
  }

  function createImageCell(id, item) {
    const td = document.createElement('td');
    td.innerHTML = `<a href='/${id}'><img src='${item.image}' alt='ceramic art' class='cartImage'></a>`;
    return td;
  }

function createTitleCell(id, item) {
    const td = document.createElement('td');
    td.innerHTML = `<a href='/${id}'>${item.productTitle}</a>`;
    return td;
}

function createPriceCell(id, item) {
    const td = document.createElement('td');
    const qty = cart[id]['qty'];
    const originalTotal = item.price * qty;
    const discountedTotal = (item.price - item.discount) * qty;

    if (item.discount > 0) {
        const originalDiv = document.createElement('div');
        originalDiv.textContent = originalTotal.toFixed(2);
        originalDiv.style.textDecoration = 'line-through';
        originalDiv.style.color = '#888';

        const discountedDiv = document.createElement('div');
        discountedDiv.textContent = discountedTotal.toFixed(2);
        discountedDiv.style.fontWeight = 'bold';

        td.appendChild(originalDiv);
        td.appendChild(discountedDiv);
    } else {
        td.textContent = originalTotal.toFixed(2);
    }

    return td;
}
function createQtyCell(id, item) {
  const td = document.createElement('td');
  const select = document.createElement('select');
  select.name = 'editQTY';
  select.setAttribute('data-id', id);
  select.class = 'p-2';
  select.onchange = function () {
      editFromCart(this, +this.value);
  };

  for (let i = 1; i <= item.qty; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      if (i === cart[id]['qty']) {
        option.selected = true
      }
      select.appendChild(option);
  }

  td.appendChild(select);
  return td;
}

function createDeleteCell (id) {
  let deleteButton = document.createElement("td")
  deleteButton.innerHTML = `<span data-id="${id}" class ="deleteCart"><i data-id="${id}" class="deleteCart fa fa-times px-2 " aria-hidden="true"></i>Delete</span>`
  deleteButton.querySelector(".deleteCart").addEventListener("click", deleteFromCart)
  return deleteButton
}

//add taxes and shipping
function appendSummaryRows(tbody) {
  const tax = sum * 0.07
  const shipping = 10.00
  // const discountPercentage = 0.00
  // const discount = sum * discountPercentage
  // tbody.appendChild(createSummaryRow(`Discount -${discountPercentage*100}`, discount))
  tbody.appendChild(createSummaryRow('Taxes 7%', tax))
  tbody.appendChild(createSummaryRow('Shipping and Handling', shipping))
}

function createSummaryRow(label, value) {
  const tr = document.createElement('tr');
  const spacer = document.createElement('td');
  const labelTD = document.createElement('td');
  const valueTD = document.createElement('td');

  labelTD.textContent = label;
  valueTD.textContent = value.toFixed(2);

  tr.appendChild(spacer);
  tr.appendChild(labelTD);
  tr.appendChild(valueTD);

  return tr;
}
//update total sum and count
function updateTotals() {
  const tax = sum * 0.07
  const shipping = count > 0 ? 10.00 : 0
  const discount = sum * 0.00 //added functionality for later?
  document.getElementById("sum").textContent = (sum + tax + shipping - discount).toFixed(2);
  document.getElementById("count").textContent = count;
}
  //Adds delete buttons in checkout page
  
  function deleteFromCart(event) {
    let productID = event.target.dataset.id
    delete cart[productID]
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCart()
  }
  
  //edits quantity on cart checkout
  function editFromCart(selectObj, value) {
     let productID = selectObj.dataset.id
     for (let id in cart) {
       let item = cart[id]
       if (id == productID) {
         item.qty = value
       }
     }
     localStorage.setItem("cart", JSON.stringify(cart))
     updateCart()
   }