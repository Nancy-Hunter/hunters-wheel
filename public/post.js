// switch gallery images and main for post.ejs

const leadImage = document.getElementById("leadImage");
const thumbnails = document.querySelectorAll(".gallery");
thumbnails.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const tempSrc = leadImage.src
    leadImage.src = thumb.src
    thumb.src = tempSrc
  })
})

//set up for add to cart at post and cart
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let count = Number(localStorage.getItem("count")) || 0;

//disables quantity options according to stock/cart[qty]
document.querySelectorAll('.addToCartForm').forEach(form => {
  const select = form.querySelector('.selectQty')
  const button = form.querySelector('.cartButton')
  const id = button.dataset.id
  const stock = Number(button.dataset.stock)
  const currentQty = cart[id]?.qty || 0
  const maxAvailable = stock - currentQty

  Array.from(select.options).forEach(option => {
    const isDisabled = Number(option.value) > maxAvailable
    option.disabled = isDisabled
    option.style.color = isDisabled ? 'white' : 'black' 
  })

  // disable add to cart if no quantity available
  if (maxAvailable <= 0) {
    // below span doesnt work because button.textContent overrides all text in element including the span
    // button.querySelector('span').textContent = 'Max Quantity Reached'
    button.textContent = 'All in Cart'
    button.disabled = true
    select.disabled = true
  }
}) 

//update Cart in local storage at post.ejs

const addToCartButton = document.querySelectorAll(".cartButton")

addToCartButton.forEach(function (el) {
  el.addEventListener('click', addToCart)
})
function addToCart(event) {
  // can't use const button = event.target because the ghostButton styling has a span inside. When the span is clicked the dataset in the button isn't attached
  const button = event.target.closest('button')
  let price = Number(button.dataset.price)
  let id = button.dataset.id
  const stock = Number(button.dataset.stock)
  // Find the nearest select inside the same form
  const form = button.closest(".addToCartForm")
  const select = form.querySelector(".selectQty")
  const qty = Number(select.value)
  console.log(id, price)
  const currentQtyInCart = cart[id]?.qty || 0
  const newTotalQty = currentQtyInCart + qty

  if (newTotalQty > stock) {
    alert(`Only ${stock} in stock. You already have ${currentQtyInCart} in your cart.`);
    return; // prevent adding
  }
  
  if (id in cart) {
    cart[id].qty += qty
    
  } else {
    cart[id] = {
        price: price,
        qty: qty
    }
  }
  count += qty;

  localStorage.setItem("cart", JSON.stringify(cart))
  localStorage.setItem("count", count)
  //disables quantity options according to stock/cart[qty]
  const maxAvailable = stock - cart[id].qty
  Array.from(select.options).forEach(option => {
    const isDisabled = Number(option.value) > maxAvailable
    option.disabled = isDisabled
    option.style.color = isDisabled ? 'white' : 'black' 
  })

  if (maxAvailable <= 0) {
    button.disabled = true
    select.disabled = true
  }
  
  let shoppingCart = document.querySelector('.shopping-cart')
  shoppingCart.classList.add('active');
  shoppingCart.setAttribute('data-product-count', count)
  setTimeout(() => {
    shoppingCart.classList.remove('active');
}, 1000)
}