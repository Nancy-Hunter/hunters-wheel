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
let count = 0;
let sum = 0;
let cart = {};

if (localStorage.getItem("count")) {
    count = parseInt(localStorage.getItem("count"));
}

if (localStorage.getItem("sum")) {
    sum = +JSON.parse(localStorage.getItem("sum")).toFixed(2);
}

if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"));
}

//update Cart in local storage at post.ejs

const addToCartButton = document.querySelectorAll(".cartButton")

addToCartButton.forEach(function (el) {
  el.addEventListener('click', addToCart)
})
function addToCart(event) {
  let price = Number(event.target.dataset.price);
  let productTitle = event.target.dataset.title;
  let id = event.target.dataset.id;
  let image = event.target.dataset.img

if (id in cart) {
  cart[id].qty++;
} else {
  let cartItem = {
      image : image,
      productTitle: productTitle,
      price: price,
      qty: 1
  };
  cart[id] = cartItem
}
  count++;
  sum += +price;

  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("sum", sum)
  localStorage.setItem("count", count)
  
  let shoppingCart = document.querySelector('.shopping-cart')
  shoppingCart.classList.add('active');
  shoppingCart.setAttribute('data-product-count', count)
  setTimeout(() => {
    shoppingCart.classList.remove('active');
}, 1000)
}