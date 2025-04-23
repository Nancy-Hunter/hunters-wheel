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

//update Cart in local storage at post.ejs

const addToCartButton = document.querySelectorAll(".cartButton")

addToCartButton.forEach(function (el) {
  el.addEventListener('click', addToCart)
})
function addToCart(event) {
  let price = Number(event.target.dataset.price)
  let id = event.target.dataset.id
  let image = event.target.dataset.img
  const stock = Number(event.target.dataset.stock)
  // Find the nearest select inside the same form
  const form = event.target.closest(".addToCartForm")
  const select = form.querySelector(".selectQty")
  const qty = Number(select.value)

  const currentQtyInCart = cart[id]?.qty || 0;
  const newTotalQty = currentQtyInCart + qty;

  if (newTotalQty > stock) {
    alert(`Only ${stock} in stock. You already have ${currentQtyInCart} in your cart.`);
    return; // prevent adding
  }
  
  if (id in cart) {
    cart[id].qty += qty
    
  } else {
    cart[id] = {
        image : image,
        price: price,
        qty: qty
    }
  }
  count += qty;

  localStorage.setItem("cart", JSON.stringify(cart))
  localStorage.setItem("count", count)
  
  let shoppingCart = document.querySelector('.shopping-cart')
  shoppingCart.classList.add('active');
  shoppingCart.setAttribute('data-product-count', count)
  setTimeout(() => {
    shoppingCart.classList.remove('active');
}, 1000)
}