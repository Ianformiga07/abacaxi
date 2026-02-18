// Variáveis globais
const menu = document.getElementById("menu");
const cartModal = document.getElementById("cart-modal");
const cartBtn = document.getElementById("cart-btn");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addresswarn = document.getElementById("address-warn");
const orderType = document.getElementById("order-type");
const paymentType = document.getElementById("payment-type");
const changeArea = document.getElementById("change-area");
const changeValue = document.getElementById("change-value");

let cart = [];

//Elementos de manipulação da modal
cartBtn.addEventListener("click", () => {
  updateCartModal();
  cartModal.style.display = "flex";
});
closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = "none";
  }
});

// Manipulação de exibição do campo de endereço e campo de troco
orderType.addEventListener("change", () => {
  if (orderType.value === "retirada") {
    addressInput.style.display = "none";
  } else {
    addressInput.style.display = "block";
  }
});

paymentType.addEventListener("change", () => {
  if (paymentType.value === "dinheiro") {
    changeArea.classList.remove("hidden");
  } else {
    changeArea.classList.add("hidden");
  }
});

// Função para adicionar item ao carrinho
menu.addEventListener("click", (e) => {
  let parentButton = e.target.closest(".add-td-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

//Função para adicionar item ao carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartModal();
}

// Função para atualizar o carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col",
    );

    cartItemElement.innerHTML = `
      <div class="flex justify-between items-center border-b py-2">
        <div>
          <p class="font-bold">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p>R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="text-red-500 remove-item-btn" data-name="${item.name}">remover</button>
      </div>`;

    total += item.price * item.quantity;

    cartItemsContainer.appendChild(cartItemElement);
  });
  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Função para remover item do carrinho
cartItemsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-item-btn")) {
    const name = e.target.getAttribute("data-name");

    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const itemIndex = cart.findIndex((item) => item.name === name);
  if (itemIndex > -1) {
    cart[itemIndex].quantity -= 1;
    if (cart[itemIndex].quantity === 0) {
      cart.splice(itemIndex, 1);
    }
    updateCartModal();
  }
}

// Função Endereço
addressInput.addEventListener("input", (e) => {
  let inputValue = e.target.value;

  if (inputValue.trim() !== "") {
    addresswarn.setAttribute("hidden", "true");
    addressInput.classList.remove("border-red-600");
  } else {
    addresswarn.removeAttribute("hidden");
    addressInput.classList.add("border-red-600");
  }
});

//finalizar compra
checkoutBtn.addEventListener("click", () => {
  //   if (!checkRestaurantOpen()) {
  //     alert(
  //       "O restaurante está fechado no momento. Por favor, volte mais tarde.",
  //     );
  //     return;
  //   }

  if (cart.length === 0) return;
  if (addressInput.value.trim() === "") {
    addresswarn.removeAttribute("hidden");
    addressInput.classList.add("border-red-600");
    return;
  }

  // Formatar itens do carrinho com estilo profissional
  const cartItems = cart
    .map((item) => {
      const itemTotal = item.price * item.quantity;
      return `▪️ *${item.name}*\n   Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)} = R$ ${itemTotal.toFixed(2)}`;
    })
    .join("\n\n");

  // Calcular total do pedido
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Montar mensagem formatada e organizada
  const message = encodeURIComponent(
    `🍔 *NOVO PEDIDO - HERO'S BURGER* 🍔\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 *ITENS DO PEDIDO:*\n\n` +
    `${cartItems}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 *VALOR TOTAL:* R$ ${total.toFixed(2)}\n\n` +
    `📍 *ENDEREÇO DE ENTREGA:*\n${addressInput.value}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⏰ Pedido realizado em: ${new Date().toLocaleString('pt-BR')}`
  );

  const phone = "63992863557";

  window.open(
    `https://wa.me/${phone}?text=${message}`,
    "_blank",
  );
  
  cart.length = 0;
  updateCartModal();
});

//Validar horário de funcionamento
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 23; //true se estiver aberto, false se estiver fechado
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-600");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-600");
}

