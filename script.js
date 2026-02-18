// Variáveis globais
const menu = document.getElementById("menu");
const cartModal = document.getElementById("cart-modal");
const cartBtn = document.getElementById("cart-btn");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const cartCounterModal = document.getElementById("cart-count-modal");
const addressInput = document.getElementById("address-input");
const addressWarn = document.getElementById("address-warn");
const addressSection = document.getElementById("address-section");
const changeArea = document.getElementById("change-area");
const changeValue = document.getElementById("change-value");
const changeInfo = document.getElementById("change-info");

let cart = [];
let orderType = "delivery";   // "delivery" | "retirada"
let paymentType = "pix";      // "pix" | "cartao" | "dinheiro"

// ─── MODAL ────────────────────────────────────────────────────────────────────
cartBtn.addEventListener("click", () => {
  updateCartModal();
  cartModal.classList.add("active");
});

closeModalBtn.addEventListener("click", () => {
  cartModal.classList.remove("active");
});

cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.classList.remove("active");
  }
});

// ─── TIPO DO PEDIDO ───────────────────────────────────────────────────────────
function selectOrderType(type) {
  orderType = type;

  document.getElementById("btn-delivery").classList.toggle("selected", type === "delivery");
  document.getElementById("btn-retirada").classList.toggle("selected", type === "retirada");

  if (type === "retirada") {
    addressSection.style.display = "none";
    addressWarn.style.display = "none";
    addressInput.classList.remove("input-error");
  } else {
    addressSection.style.display = "block";
  }
}

// ─── PAGAMENTO ────────────────────────────────────────────────────────────────
function selectPayment(type) {
  paymentType = type;

  document.getElementById("btn-pix").classList.toggle("selected", type === "pix");
  document.getElementById("btn-cartao").classList.toggle("selected", type === "cartao");
  document.getElementById("btn-dinheiro").classList.toggle("selected", type === "dinheiro");

  if (type === "dinheiro") {
    changeArea.style.display = "block";
  } else {
    changeArea.style.display = "none";
    changeValue.value = "";
    changeInfo.style.display = "none";
  }
}

// Atualizar info do troco em tempo real
changeValue.addEventListener("input", () => {
  const val = parseFloat(changeValue.value);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (val > 0 && val >= total) {
    const troco = val - total;
    changeInfo.textContent = `💵 Troco a devolver: R$ ${troco.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    changeInfo.style.display = "block";
    changeInfo.style.color = "#16a34a";
  } else if (val > 0 && val < total) {
    changeInfo.textContent = "⚠️ Valor menor que o total do pedido";
    changeInfo.style.display = "block";
    changeInfo.style.color = "#dc2626";
  } else {
    changeInfo.style.display = "none";
  }
});

// ─── CARRINHO ─────────────────────────────────────────────────────────────────
menu.addEventListener("click", (e) => {
  const parentButton = e.target.closest(".add-td-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    addToCart(name, price);
  }
});

function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartCounter();
}

function updateCartCounter() {
  const total = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCounter.textContent = total;
  if (cartCounterModal) cartCounterModal.textContent = total;
}

function updateCartModal() {
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fa fa-shopping-cart"></i>
        <p style="font-weight:600; color:#374151; margin-bottom:0.25rem;">Carrinho vazio</p>
        <p style="font-size:0.8rem;">Adicione itens do menu para começar</p>
      </div>`;
    cartTotal.textContent = "R$ 0,00";
    updateCartCounter();
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const el = document.createElement("div");
    el.className = "cart-item-card";
    el.innerHTML = `
      <div style="flex:1;">
        <p style="font-weight:700; font-size:0.875rem;">${item.name}</p>
        <p style="font-size:0.75rem; color:#6b7280;">R$ ${item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} cada</p>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <button class="qty-btn" data-action="dec" data-name="${item.name}" title="Remover um">−</button>
        <span style="font-weight:700; min-width:1.5rem; text-align:center;">${item.quantity}</span>
        <button class="qty-btn" data-action="inc" data-name="${item.name}" title="Adicionar um">+</button>
        <span style="font-weight:700; font-size:0.875rem; min-width:4rem; text-align:right;">R$ ${subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
      </div>`;
    cartItemsContainer.appendChild(el);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  updateCartCounter();

  // Atualiza info do troco se necessário
  if (paymentType === "dinheiro" && changeValue.value) {
    changeValue.dispatchEvent(new Event("input"));
  }
}

// Botões de quantidade dentro do modal
cartItemsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;

  const name = btn.getAttribute("data-name");
  const action = btn.getAttribute("data-action");
  const item = cart.find((i) => i.name === name);

  if (!item) return;

  if (action === "inc") {
    item.quantity += 1;
  } else if (action === "dec") {
    item.quantity -= 1;
    if (item.quantity === 0) {
      cart.splice(cart.indexOf(item), 1);
    }
  }

  updateCartModal();
});

// ─── FINALIZAR PEDIDO ─────────────────────────────────────────────────────────
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Adicione itens ao carrinho antes de finalizar.");
    return;
  }

  // Validação de endereço apenas para delivery
  if (orderType === "delivery" && addressInput.value.trim() === "") {
    addressWarn.style.display = "block";
    addressInput.classList.add("input-error");
    addressInput.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Validação de troco
  if (paymentType === "dinheiro") {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const troco = parseFloat(changeValue.value);
    if (!troco || troco < total) {
      changeValue.classList.add("input-error");
      changeValue.focus();
      return;
    }
  }

  // ── Montar mensagem WhatsApp ──────────────────────────────────────────────
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cartItems = cart
    .map((item) => {
      const sub = item.price * item.quantity;
      return `▪️ *${item.name}*\n   Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)} = R$ ${sub.toFixed(2)}`;
    })
    .join("\n\n");

  const tipoLabel = orderType === "delivery" ? "🛵 Delivery" : "🏪 Retirada no local";
  const enderecoLine =
    orderType === "delivery"
      ? `📍 *ENDEREÇO DE ENTREGA:*\n${addressInput.value}\n\n`
      : `🏪 *RETIRADA NO LOCAL*\n\n`;

  const paymentLabels = { pix: "💠 Pix", cartao: "💳 Cartão", dinheiro: "💵 Dinheiro" };
  const paymentLine = `💳 *PAGAMENTO:* ${paymentLabels[paymentType]}`;

  let trocoLine = "";
  if (paymentType === "dinheiro") {
    const trocoVal = parseFloat(changeValue.value) - total;
    trocoLine = `\n💰 *TROCO PARA:* R$ ${parseFloat(changeValue.value).toFixed(2)}\n💵 *TROCO A DEVOLVER:* R$ ${trocoVal.toFixed(2)}`;
  }

  const rawMessage =
    `🍔 *NOVO PEDIDO - ABACAXI BURGER* 🍔\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 *ITENS DO PEDIDO:*\n\n` +
    `${cartItems}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 *VALOR TOTAL:* R$ ${total.toFixed(2)}\n\n` +
    `🚀 *TIPO:* ${tipoLabel}\n\n` +
    `${enderecoLine}` +
    `${paymentLine}${trocoLine}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⏰ Pedido: ${new Date().toLocaleString("pt-BR")}`;

  const message = [...rawMessage]
    .map(c => {
      const code = c.codePointAt(0);
      if (code > 127) {
        return encodeURIComponent(c);
      }
      return c;
    })
    .join("")
    .replace(/ /g, "%20")
    .replace(/\n/g, "%0A");

  window.open(`https://wa.me/63992863557?text=${message}`, "_blank");

  // Resetar
  cart.length = 0;
  changeValue.value = "";
  changeInfo.style.display = "none";
  updateCartModal();
  cartModal.classList.remove("active");
});

// Validação de endereço em tempo real
addressInput.addEventListener("input", () => {
  if (addressInput.value.trim() !== "") {
    addressWarn.style.display = "none";
    addressInput.classList.remove("input-error");
  } else {
    addressWarn.style.display = "block";
    addressInput.classList.add("input-error");
  }
});

// ─── HORÁRIO ──────────────────────────────────────────────────────────────────
function checkRestaurantOpen() {
  const hora = new Date().getHours();
  return hora >= 18 && hora < 23;
}

const spanItem = document.getElementById("date-span");
if (checkRestaurantOpen()) {
  spanItem.classList.remove("bg-red-600");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-600");
}