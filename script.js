// ─── ADICIONAIS DISPONÍVEIS ───────────────────────────────────────────────────
const EXTRAS_LIST = [
  { id: 'ovo',        label: '🥚 Ovo',        price: 2.00 },
  { id: 'salsicha',   label: '🌭 Salsicha',    price: 2.00 },
  { id: 'hamburguer', label: '🍔 Hambúrguer',  price: 2.00 },
  { id: 'bacon',      label: '🥓 Bacon',       price: 2.00 },
  { id: 'cebola',     label: '🧅 Cebola',      price: 2.00 },
  { id: 'queijo',     label: '🧀 Queijo',      price: 2.00 },
  { id: 'cheddar',    label: '🧀 Cheddar',     price: 2.00 },
  { id: 'catupiry',   label: '🍶 Catupiry',    price: 2.00 },
  { id: 'calabresa',  label: '🌶️ Calabresa',  price: 2.00 },
  { id: 'presunto',   label: '🥩 Presunto',    price: 2.00 },
];

// ─── VARIÁVEIS GLOBAIS ────────────────────────────────────────────────────────
const menu                = document.getElementById('menu');
const cartModal           = document.getElementById('cart-modal');
const cartBtn             = document.getElementById('cart-btn');
const cartItemsContainer  = document.getElementById('cart-items');
const cartTotal           = document.getElementById('cart-total');
const checkoutBtn         = document.getElementById('checkout-btn');
const closeModalBtn       = document.getElementById('close-modal-btn');
const cartCounter         = document.getElementById('cart-count');
const cartCounterModal    = document.getElementById('cart-count-modal');
const addressInput        = document.getElementById('address-input');
const addressWarn         = document.getElementById('address-warn');
const addressSection      = document.getElementById('address-section');
const changeArea          = document.getElementById('change-area');
const changeValue         = document.getElementById('change-value');
const changeInfo          = document.getElementById('change-info');

// Extras modal
const extrasModal         = document.getElementById('extras-modal');
const extrasProductName   = document.getElementById('extras-product-name');
const extrasChipsContainer= document.getElementById('extras-chips');
const extrasObs           = document.getElementById('extras-obs');
const extrasModalClose    = document.getElementById('extras-modal-close');
const extrasCancelBtn     = document.getElementById('extras-cancel-btn');
const extrasConfirmBtn    = document.getElementById('extras-confirm-btn');

let cart        = [];
let orderType   = 'delivery';
let paymentType = 'pix';

// Estado temporário enquanto o modal de adicionais está aberto
let pendingItem = null;

// ─── CATEGORY NAV SCROLL ──────────────────────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 60;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
  // Update active tab
  document.querySelectorAll('.cat-tab').forEach(tab => tab.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ─── MODAL CARRINHO ───────────────────────────────────────────────────────────
cartBtn.addEventListener('click', () => {
  updateCartModal();
  cartModal.classList.add('active');
});
closeModalBtn.addEventListener('click', () => cartModal.classList.remove('active'));
cartModal.addEventListener('click', e => {
  if (e.target === cartModal) cartModal.classList.remove('active');
});

// ─── TIPO DO PEDIDO ───────────────────────────────────────────────────────────
function selectOrderType(type) {
  orderType = type;
  document.getElementById('btn-delivery').classList.toggle('selected-order', type === 'delivery');
  document.getElementById('btn-retirada').classList.toggle('selected-order', type === 'retirada');

  if (type === 'retirada') {
    addressSection.style.display = 'none';
    addressWarn.style.display = 'none';
    addressInput.classList.remove('input-error');
  } else {
    addressSection.style.display = 'flex';
  }
}

// ─── PAGAMENTO ────────────────────────────────────────────────────────────────
function selectPayment(type) {
  paymentType = type;
  ['pix','cartao','dinheiro'].forEach(p => {
    document.getElementById(`btn-${p}`).classList.toggle('selected-pay', p === type);
  });
  changeArea.style.display = type === 'dinheiro' ? 'flex' : 'none';
  if (type !== 'dinheiro') {
    changeValue.value = '';
    changeInfo.style.display = 'none';
  }
}

changeValue.addEventListener('input', () => {
  const val   = parseFloat(changeValue.value);
  const total = cartTotal.textContent; // just use raw sum
  const sum   = cart.reduce((a, i) => a + (i.price + i.extrasTotal) * i.quantity, 0);
  if (val > 0 && val >= sum) {
    const troco = val - sum;
    changeInfo.textContent = `💵 Troco a devolver: R$ ${troco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    changeInfo.style.display = 'block';
    changeInfo.style.color = '#16a34a';
  } else if (val > 0 && val < sum) {
    changeInfo.textContent = '⚠️ Valor menor que o total do pedido';
    changeInfo.style.display = 'block';
    changeInfo.style.color = '#dc2626';
  } else {
    changeInfo.style.display = 'none';
  }
});

// ─── MODAL ADICIONAIS ─────────────────────────────────────────────────────────
function openExtrasModal(name, price) {
  pendingItem = { name, price };
  extrasProductName.textContent = name;
  extrasObs.value = '';

  // Renderizar chips
  extrasChipsContainer.innerHTML = '';
  EXTRAS_LIST.forEach(extra => {
    const chip = document.createElement('label');
    chip.className = 'extra-chip';
    chip.innerHTML = `
      <span class="extra-chip-check"><i class="fa fa-check" style="display:none;"></i></span>
      <span>${extra.label}</span>
      <span style="margin-left:auto;font-size:0.72rem;color:#9ca3af;">+R$2</span>
    `;
    chip.dataset.id = extra.id;

    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const checkIcon = chip.querySelector('.extra-chip-check i');
      checkIcon.style.display = chip.classList.contains('selected') ? 'block' : 'none';
    });
    extrasChipsContainer.appendChild(chip);
  });

  extrasModal.classList.add('active');
}

function closeExtrasModal() {
  extrasModal.classList.remove('active');
  pendingItem = null;
}

extrasModalClose.addEventListener('click', closeExtrasModal);
extrasCancelBtn.addEventListener('click', closeExtrasModal);
extrasModal.addEventListener('click', e => {
  if (e.target === extrasModal) closeExtrasModal();
});

extrasConfirmBtn.addEventListener('click', () => {
  if (!pendingItem) return;

  const selectedExtras = [];
  let extrasTotal = 0;
  extrasChipsContainer.querySelectorAll('.extra-chip.selected').forEach(chip => {
    const extra = EXTRAS_LIST.find(e => e.id === chip.dataset.id);
    if (extra) {
      selectedExtras.push(extra.label);
      extrasTotal += extra.price;
    }
  });

  const obs = extrasObs.value.trim();

  addToCart(pendingItem.name, pendingItem.price, selectedExtras, extrasTotal, obs);
  closeExtrasModal();
});

// ─── CARRINHO ─────────────────────────────────────────────────────────────────
menu.addEventListener('click', e => {
  const btn = e.target.closest('.add-td-cart-btn');
  if (!btn) return;

  const name      = btn.getAttribute('data-name');
  const price     = parseFloat(btn.getAttribute('data-price'));
  const hasExtras = btn.getAttribute('data-has-extras') === 'true';

  if (hasExtras) {
    openExtrasModal(name, price);
  } else {
    addToCart(name, price, [], 0, '');
  }
});

function addToCart(name, price, extras, extrasTotal, obs) {
  // Cada adição cria um novo item (para permitir mesma pizza com obs diferentes)
  cart.push({ name, price, extras, extrasTotal, obs, quantity: 1 });
  updateCartCounter();
  animateCartBtn();
}

function animateCartBtn() {
  cartBtn.classList.add('animate-bounce');
  setTimeout(() => cartBtn.classList.remove('animate-bounce'), 600);
}

function updateCartCounter() {
  const total = cart.reduce((a, i) => a + i.quantity, 0);
  cartCounter.textContent = total;
  if (cartCounterModal) cartCounterModal.textContent = total;
}

function updateCartModal() {
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fa fa-shopping-cart"></i>
        <p style="font-weight:800;color:#1a1a1a;margin-bottom:0.25rem;">Carrinho vazio</p>
        <p style="font-size:0.8rem;">Adicione itens do menu para começar</p>
      </div>`;
    cartTotal.textContent = 'R$ 0,00';
    updateCartCounter();
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemUnitTotal = item.price + item.extrasTotal;
    const subtotal = itemUnitTotal * item.quantity;
    total += subtotal;

    const extrasLine = item.extras && item.extras.length > 0
      ? `<div class="cart-item-extras">+${item.extras.join(', ')}</div>`
      : '';
    const obsLine = item.obs
      ? `<div class="cart-item-obs">💬 ${item.obs}</div>`
      : '';

    const el = document.createElement('div');
    el.className = 'cart-item-card';
    el.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-unit">R$ ${itemUnitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada</p>
        ${extrasLine}
        ${obsLine}
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="dec" data-index="${index}" title="Remover um">−</button>
        <span class="qty-num">${item.quantity}</span>
        <button class="qty-btn" data-action="inc" data-index="${index}" title="Adicionar um">+</button>
      </div>
      <div class="cart-item-price">
        R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>`;
    cartItemsContainer.appendChild(el);
  });

  cartTotal.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  updateCartCounter();

  if (paymentType === 'dinheiro' && changeValue.value) {
    changeValue.dispatchEvent(new Event('input'));
  }
}

// Botões de quantidade
cartItemsContainer.addEventListener('click', e => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;

  const index  = parseInt(btn.getAttribute('data-index'));
  const action = btn.getAttribute('data-action');
  const item   = cart[index];
  if (!item) return;

  if (action === 'inc') {
    item.quantity += 1;
  } else if (action === 'dec') {
    item.quantity -= 1;
    if (item.quantity === 0) cart.splice(index, 1);
  }
  updateCartModal();
});

// ─── FINALIZAR PEDIDO ─────────────────────────────────────────────────────────
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Adicione itens ao carrinho antes de finalizar.');
    return;
  }

  if (orderType === 'delivery' && addressInput.value.trim() === '') {
    addressWarn.style.display = 'block';
    addressInput.classList.add('input-error');
    addressInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (paymentType === 'dinheiro') {
    const total = cart.reduce((a, i) => a + (i.price + i.extrasTotal) * i.quantity, 0);
    const troco = parseFloat(changeValue.value);
    if (!troco || troco < total) {
      changeValue.classList.add('input-error');
      changeValue.focus();
      return;
    }
  }

  const total = cart.reduce((a, i) => a + (i.price + i.extrasTotal) * i.quantity, 0);

  const cartLines = cart.map(item => {
    const unitTotal = item.price + item.extrasTotal;
    const sub = unitTotal * item.quantity;
    let line = `▪️ *${item.name}*\n   Qtd: ${item.quantity} × R$ ${unitTotal.toFixed(2)} = R$ ${sub.toFixed(2)}`;
    if (item.extras && item.extras.length > 0) {
      line += `\n   ➕ Adicionais: ${item.extras.join(', ')}`;
    }
    if (item.obs) {
      line += `\n   💬 Obs: ${item.obs}`;
    }
    return line;
  }).join('\n\n');

  const tipoLabel    = orderType === 'delivery' ? '🛵 Delivery' : '🏪 Retirada no local';
  const enderecoLine = orderType === 'delivery'
    ? `📍 *ENDEREÇO DE ENTREGA:*\n${addressInput.value}\n\n`
    : `🏪 *RETIRADA NO LOCAL*\n\n`;

  const paymentLabels = { pix: '💠 Pix', cartao: '💳 Cartão', dinheiro: '💵 Dinheiro' };
  const paymentLine   = `💳 *PAGAMENTO:* ${paymentLabels[paymentType]}`;

  let trocoLine = '';
  if (paymentType === 'dinheiro') {
    const trocoVal = parseFloat(changeValue.value) - total;
    trocoLine = `\n💰 *TROCO PARA:* R$ ${parseFloat(changeValue.value).toFixed(2)}\n💵 *TROCO A DEVOLVER:* R$ ${trocoVal.toFixed(2)}`;
  }

  const message = encodeURIComponent(
    `🍕 *NOVO PEDIDO - PIZZARIA RA* 🍕\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 *ITENS DO PEDIDO:*\n\n` +
    `${cartLines}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 *VALOR TOTAL:* R$ ${total.toFixed(2)}\n\n` +
    `🚀 *TIPO:* ${tipoLabel}\n\n` +
    `${enderecoLine}` +
    `${paymentLine}${trocoLine}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⏰ Pedido: ${new Date().toLocaleString('pt-BR')}`
  );

  window.open(`https://wa.me/63992863557?text=${message}`, '_blank');

  // Reset
  cart.length = 0;
  changeValue.value = '';
  changeInfo.style.display = 'none';
  updateCartModal();
  cartModal.classList.remove('active');
});

// Validação de endereço em tempo real
addressInput.addEventListener('input', () => {
  if (addressInput.value.trim() !== '') {
    addressWarn.style.display = 'none';
    addressInput.classList.remove('input-error');
  } else {
    addressWarn.style.display = 'block';
    addressInput.classList.add('input-error');
  }
});

// ─── HORÁRIO ──────────────────────────────────────────────────────────────────
const spanItem = document.getElementById('date-span');
const hora = new Date().getHours();
const isOpen = hora >= 18 && hora < 23;
if (isOpen) {
  spanItem.classList.add('open');
  spanItem.classList.remove('closed');
} else {
  spanItem.classList.remove('open');
  spanItem.classList.add('closed');
}
