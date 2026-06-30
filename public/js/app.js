const money = (value) => `KES ${Number(value).toLocaleString('en-KE')}`;
const app = document.getElementById('app');
const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const cartCount = document.getElementById('cartCount');

menuToggle?.addEventListener('click', () => nav.classList.toggle('open'));

document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === location.pathname) link.classList.add('active');
});

const getCart = () => JSON.parse(localStorage.getItem('kh_cart') || '[]');
const saveCart = (cart) => { localStorage.setItem('kh_cart', JSON.stringify(cart)); updateCartCount(); };
const updateCartCount = () => {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) cartCount.textContent = count;
};

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  saveCart(cart);
  toast(`${product.name} added to cart`);
}

function toast(message) {
  const el = document.createElement('div');
  el.className = 'notice';
  el.style.position = 'fixed';
  el.style.right = '18px';
  el.style.bottom = '18px';
  el.style.zIndex = '100';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function productCard(product) {
  return `
    <article class="card product-card">
      <div class="product-art ${product.imageClass || ''}"></div>
      <span class="tag">${product.tag}</span>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price">${money(product.price)}</div>
      <ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul>
      <div class="product-actions">
        <button class="btn" data-add="${product.id}">Add to cart</button>
        <a class="btn secondary" href="https://wa.me/254707268547?text=${encodeURIComponent('Hello, I am interested in ' + product.name)}">WhatsApp</a>
      </div>
    </article>
  `;
}

function bindAddButtons(products) {
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(products.find(p => p.id === btn.dataset.add)));
  });
}

async function renderHome() {
  const [products, collections] = await Promise.all([fetchJSON('/api/products'), fetchJSON('/api/collections')]);
  app.innerHTML = `
    <section class="hero">
      <div>
        <div class="eyebrow">Juja, Kiambu creative furniture lab</div>
        <h1>Where creativity creates comfort.</h1>
        <p>Kivuli Homeworks is a design-led furniture lab based in Juja, Kiambu and delivering across Kenya. Shop ready pieces, or use the AI Custom Studio to turn ideas, room measurements and inspiration into practical furniture concepts before production.</p>
        <div class="hero-actions">
          <a class="btn secondary" href="/collections">Shop collections</a>
          <a class="btn outline" href="/custom">Start custom order</a>
          <a class="btn outline" href="/checkout">Pay with M-Pesa</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="poster-grid">
          <div class="poster-card large"><span class="round-lamp"></span><span class="furniture-shape"></span></div>
          <div class="poster-card"><span class="table-shape"></span></div>
          <div class="poster-card"><span class="bed-shape"></span></div>
        </div>
        <div class="hero-label">Creative lab thinking. Clean forms. Furniture made for real Kenyan homes.</div>
      </div>
    </section>

    <section class="section split">
      <div>
        <div class="kicker">The Kivuli Lab Method</div>
        <h2 class="big-title">Ideas become forms. Forms become comfort.</h2>
      </div>
      <div>
        <p class="lead">The experience is built around large visuals, clear categories, calm navigation and quick M-Pesa checkout. Customers in Juja, Kiambu, Nairobi and across Kenya can browse, add to cart, request WhatsApp help, generate custom concepts and pay through STK Push.</p>
      </div>
    </section>

    <section class="section">
      <div class="kicker">Shop by room</div>
      <h2 class="big-title">Collections</h2>
      <div class="grid cols-4">
        ${collections.map(c => `
          <a class="card collection-card" href="/${c.slug}">
            <div class="collection-art ${c.imageClass}"></div>
            <div><h3>${c.title}</h3><p>${c.line}</p></div>
          </a>
        `).join('')}
      </div>
    </section>

    <section class="section">
      <div class="kicker">Featured pieces</div>
      <h2 class="big-title">Ready for your home</h2>
      <div class="grid cols-4">${products.slice(0, 4).map(productCard).join('')}</div>
    </section>

    <section class="section grid cols-3 lab-principles">
      <div class="card dark"><h3>Creative Lab</h3><p>Ideas, experiments and custom concepts are shaped into real furniture pieces for Kenyan homes.</p></div>
      <div class="card"><h3>Form & Function</h3><p>Every piece must look beautiful and solve a real living need: storage, comfort, spacing or durability.</p></div>
      <div class="card"><h3>M-Pesa Ready</h3><p>Pay through Daraja STK Push. Enter your Safaricom number and confirm the prompt on your phone.</p></div>
    </section>

    <section class="section split logo-feature">
      <div>
        <div class="kicker">Kivuli Homeworks</div>
        <h2 class="big-title">A creative lab for homes that feel considered.</h2>
        <p class="lead">The mark keeps the idea simple: shelter, shade, furniture and comfort. No extra brand-board labels — just the Kivuli Homeworks logo as the face of the workshop.</p>
      </div>
      <div class="logo-card"><img src="/images/kivuli-logo.svg" alt="Kivuli Homeworks logo"></div>
    </section>
  `;
  bindAddButtons(products);
}

async function renderCollections() {
  const collections = await fetchJSON('/api/collections');
  app.innerHTML = `
    <section class="page-hero"><div class="eyebrow">Shop the rooms</div><h1>Furniture collections for real Kenyan homes.</h1><p>Browse by living room, bedroom, dining and custom furniture. The layout stays simple so customers reach products faster.</p></section>
    <section class="section grid cols-4">
      ${collections.map(c => `
        <a class="card collection-card" href="/${c.slug}">
          <div class="collection-art ${c.imageClass}"></div>
          <div><h3>${c.title}</h3><p>${c.line}</p></div>
        </a>
      `).join('')}
    </section>
  `;
}

async function renderCategory(slug, title, intro) {
  const products = (await fetchJSON('/api/products')).filter(p => p.category === slug);
  app.innerHTML = `
    <section class="page-hero"><div class="eyebrow">${title}</div><h1>${intro.heading}</h1><p>${intro.text}</p></section>
    <section class="section grid cols-3">${products.map(productCard).join('')}</section>
    <section class="section split">
      <div class="visual-block"></div>
      <div><div class="kicker">Need a different size?</div><h2 class="big-title">We can build around your room.</h2><p class="lead">Send measurements, photos or inspiration through WhatsApp and the team will guide you on material, finish, timeline and delivery.</p><a class="btn" href="https://wa.me/254707268547">Talk to us</a></div>
    </section>
  `;
  bindAddButtons(products);
}

async function renderCustom() {
  const products = (await fetchJSON('/api/products')).filter(p => p.category === 'custom');
  app.innerHTML = `
    <section class="page-hero custom-hero"><div class="eyebrow">AI Custom Studio</div><h1>The lab where ideas become furniture.</h1><p>Describe the furniture you want, add room measurements, and Kivuli AI will suggest practical dimensions plus a simple design preview before you request production in Juja.</p></section>

    <section class="section ai-studio">
      <div class="card ai-form-card">
        <div class="kicker">Kivuli AI Design Lab</div>
        <h2>Create the concept</h2>
        <p>Use this as a starting point for sofas, beds, wardrobes, TV units, dining sets and desks. Final measurements are confirmed by our workshop before production.</p>
        <form class="form" id="aiDesignForm">
          <div class="form-grid">
            <select name="furnitureType" required>
              <option value="sofa">Sofa / L-shape</option>
              <option value="bed">Bed / Headboard</option>
              <option value="wardrobe">Wardrobe</option>
              <option value="tv-unit">TV Unit</option>
              <option value="dining">Dining Set</option>
              <option value="desk">Work Desk</option>
            </select>
            <select name="style" required>
              <option value="Modern warm">Modern warm</option>
              <option value="Minimal premium">Minimal premium</option>
              <option value="Family practical">Family practical</option>
              <option value="Compact apartment">Compact apartment</option>
            </select>
            <input name="roomWidth" type="number" min="1" step="0.1" placeholder="Room width in metres e.g. 3.5" required />
            <input name="roomLength" type="number" min="1" step="0.1" placeholder="Room length in metres e.g. 4.2" required />
            <select name="storage">
              <option value="Standard storage">Standard storage</option>
              <option value="Extra storage">Extra storage</option>
              <option value="No storage">No storage</option>
            </select>
            <select name="material">
              <option value="Hardwood + fabric">Hardwood + fabric</option>
              <option value="MDF + laminate">MDF + laminate</option>
              <option value="Plywood + veneer">Plywood + veneer</option>
              <option value="Metal + wood">Metal + wood</option>
            </select>
          </div>
          <textarea name="notes" rows="4" placeholder="Describe the design you intend: color, cushions, drawers, shelves, wall space, inspiration, family size..."></textarea>
          <button class="btn" type="submit">Generate AI Design</button>
        </form>
      </div>
      <div class="card ai-result-card" id="aiDesignResult">
        <div class="ai-placeholder">
          <span>AI</span>
          <h3>Your design preview appears here</h3>
          <p>The assistant will return recommended dimensions, layout notes, estimated budget band and a simple visual sketch.</p>
        </div>
      </div>
    </section>

    <section class="section grid cols-3">
      <div class="card"><h3>1. Generate concept</h3><p>AI suggests dimensions based on your furniture type and room size.</p></div>
      <div class="card"><h3>2. Confirm with workshop</h3><p>Our Juja team reviews measurements, material, color and finishing details.</p></div>
      <div class="card"><h3>3. Pay & produce</h3><p>Confirm the order with M-Pesa Daraja STK Push and receive delivery updates.</p></div>
    </section>
    <section class="section grid cols-2">${products.map(productCard).join('')}</section>
  `;
  bindAddButtons(products);
  bindAIDesignForm();
}

function bindAIDesignForm() {
  const form = document.getElementById('aiDesignForm');
  const target = document.getElementById('aiDesignResult');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    target.innerHTML = '<div class="notice">Generating your AI custom furniture concept...</div>';
    try {
      const response = await fetch('/api/ai/custom-design', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.message || 'AI design failed');
      const d = data.design;
      target.innerHTML = `
        <div class="ai-preview">${d.svg}</div>
        <span class="tag">${d.style}</span>
        <h3>${d.title}</h3>
        <p>${d.summary}</p>
        <div class="dimension-grid">
          <div><strong>${d.dimensions.width} cm</strong><span>Width</span></div>
          <div><strong>${d.dimensions.depth} cm</strong><span>Depth</span></div>
          <div><strong>${d.dimensions.height} cm</strong><span>Height</span></div>
        </div>
        <ul>${d.notes.map(n => `<li>${n}</li>`).join('')}</ul>
        <div class="price">Budget guide: ${money(d.estimatedBudget)}</div>
        <div class="product-actions">
          <a class="btn" href="https://wa.me/254707268547?text=${encodeURIComponent('Hello Kivuli, I generated an AI custom design: ' + d.title + '. Dimensions: ' + d.dimensions.width + 'W x ' + d.dimensions.depth + 'D x ' + d.dimensions.height + 'H cm. Please quote it.')}">Send to WhatsApp</a>
          <a class="btn secondary" href="/checkout">Pay deposit</a>
        </div>
      `;
    } catch (error) {
      target.innerHTML = `<div class="notice error">${error.message}</div>`;
    }
  });
}

async function renderShowroom() {
  const data = await fetchJSON('/api/showroom');
  app.innerHTML = `
    <section class="page-hero"><div class="eyebrow">Showroom & delivery</div><h1>${data.title}</h1><p>${data.intro}</p></section>
    <section class="section grid cols-2">
      ${data.locations.map(l => `<div class="card"><h3>${l.name}</h3><p><strong>${l.area}</strong></p><p>${l.note}</p></div>`).join('')}
    </section>
    <section class="section">
      <div class="kicker">Services</div><h2 class="big-title">Before and after the order</h2>
      <div class="grid cols-3">${data.services.map(s => `<div class="card"><h3>${s}</h3><p>Available through our Juja order desk for Kiambu, Nairobi and countrywide customers.</p></div>`).join('')}</div>
    </section>
  `;
}

async function renderCheckout() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  app.innerHTML = `
    <section class="page-hero"><div class="eyebrow">M-Pesa checkout</div><h1>Confirm your order by phone.</h1><p>Enter your Safaricom number and Daraja STK Push will send an M-Pesa prompt to your phone.</p></section>
    <section class="section checkout">
      <div class="card">
        <h3>Your cart</h3>
        <div id="cartLines">${cart.length ? cart.map(item => `
          <div class="cart-line">
            <div><strong>${item.name}</strong><br><small>${money(item.price)} each</small></div>
            <div class="qty"><button data-minus="${item.id}">-</button><span>${item.qty}</span><button data-plus="${item.id}">+</button></div>
            <strong>${money(item.price * item.qty)}</strong>
          </div>`).join('') : '<p>Your cart is empty. Add furniture from the collections.</p>'}</div>
        <div class="total-row"><span>Total</span><span>${money(total)}</span></div>
      </div>
      <div class="card">
        <h3>Pay with M-Pesa</h3>
        <p>The backend uses Safaricom Daraja STK Push. Add real credentials in <strong>.env</strong> before going live.</p>
        <form class="form" id="paymentForm">
          <input name="name" placeholder="Full name" required />
          <input name="phone" placeholder="Safaricom number e.g. 0712345678" required />
          <input name="location" placeholder="Delivery area e.g. Ruiru, Kilimani, Kiambu" required />
          <textarea name="notes" rows="4" placeholder="Order notes, fabric preference or delivery instructions"></textarea>
          <button class="btn" ${!total ? 'disabled' : ''}>Send M-Pesa Prompt</button>
        </form>
        <div id="paymentMessage" style="margin-top:14px"></div>
      </div>
    </section>
  `;
  document.querySelectorAll('[data-minus]').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.minus, -1)));
  document.querySelectorAll('[data-plus]').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.plus, 1)));
  document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const message = document.getElementById('paymentMessage');
    message.className = 'notice';
    message.textContent = 'Sending M-Pesa prompt...';
    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.get('phone'), amount: total, orderId: `KH-${Date.now().toString().slice(-6)}` })
      });
      const data = await response.json();
      message.className = data.ok ? 'notice' : 'notice error';
      message.textContent = data.message || 'Request completed.';
    } catch (error) {
      message.className = 'notice error';
      message.textContent = error.message;
    }
  });
}

function changeQty(id, diff) {
  let cart = getCart().map(item => item.id === id ? { ...item, qty: item.qty + diff } : item).filter(item => item.qty > 0);
  saveCart(cart);
  renderCheckout();
}

async function router() {
  updateCartCount();
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/') return renderHome();
  if (path === '/collections') return renderCollections();
  if (path === '/living-room') return renderCategory('living-room', 'Living Room', { heading: 'Soft seating, calm corners and media walls.', text: 'Shop sofas, loungers, coffee tables and TV units for Juja, Kiambu, Nairobi and Kenyan homes.' });
  if (path === '/bedroom') return renderCategory('bedroom', 'Bedroom', { heading: 'Restful furniture with storage intelligence.', text: 'Beds, wardrobes and bedroom furniture designed for comfort, storage and lasting finish.' });
  if (path === '/dining') return renderCategory('dining', 'Dining', { heading: 'Dining sets for daily meals and family hosting.', text: 'Tables and chairs that balance durability, comfort and warm home character.' });
  if (path === '/custom') return renderCustom();
  if (path === '/showroom') return renderShowroom();
  if (path === '/checkout') return renderCheckout();
  app.innerHTML = '<section class="page-hero"><h1>Page not found.</h1><p>Use the navigation to continue shopping.</p></section>';
}

router();
