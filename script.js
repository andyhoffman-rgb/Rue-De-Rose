/* ==========================================================
   RUE DE ROSE: script.js
   ========================================================== */

if (typeof IMG === "undefined") {
    window.IMG = {};
    document.body.insertAdjacentHTML("afterbegin",
        '<p style="margin:0;padding:.6rem 1rem;background:#b3261e;color:#fff;text-align:center;font:600 .85rem sans-serif">' +
        'Photos are missing: ensure IMG is configured properly.</p>');
}

const STORE = {
    currency: "₹",
    instagram: "rue.de.rose_",
    whatsapp: "",
    discount: 15,
    promoText: "Launch offer: 15% off every order, applied automatically.",
};

const PRODUCTS = [
    { id: 1,  name: "Gold heart studs",             price: 199, cat: "earrings",  img: "heart" },
    { id: 2,  name: "Pearl drops",                  price: 299, cat: "earrings",  img: "pearl" },
    { id: 3,  name: "Pavé crystal huggies",         price: 249, cat: "earrings",  img: "pave" },
    { id: 4,  name: "Sculptural gold hoops",        price: 199, cat: "earrings",  img: "hoops" },
    { id: 5,  name: "Botanical flower studs",       price: 199, cat: "earrings",  img: "flower" },
    { id: 6,  name: "Sculptural pearl shell",       price: 229, cat: "necklaces", img: "shell" },
    { id: 7,  name: "Cluster pendants",             price: 279, cat: "necklaces", img: "cluster" },
    { id: 8,  name: "Double pearl satellite chain", price: 249, cat: "bracelets", img: "satellite" },
    { id: 9,  name: "Solitaire pearl chain",        price: 199, cat: "bracelets", img: "solitaire" },
    { id: 10, name: "Interlocking two-tone band",   price: 249, cat: "rings",     img: "band" },
    { id: 11, name: "Sapphire Contour V-Band",      price: 249, cat: "rings",     img: "sapphire" },

];

const $ = (id) => document.getElementById(id);
const CATEGORIES = ["earrings", "necklaces", "bracelets", "rings"];
const money = (n) => STORE.currency + Math.round(n).toLocaleString("en-IN");
const discounted = (price) => price * (1 - STORE.discount / 100);
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

let cart = [];
try {
    cart = JSON.parse(localStorage.getItem("rdr") || "[]");
} catch (e) {}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("on");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("on"), 1700);
}

$("promo").textContent = STORE.promoText;
document.querySelectorAll(".iglink").forEach((a) => {
    a.href = "https://instagram.com/" + STORE.instagram;
});

// Mapping background images safely
if (IMG.hero) {
    $("hero").style.backgroundImage = "url('" + IMG.hero + "')";
}
if (IMG.abouthero) {
    $("abouthero").style.backgroundImage = "url('" + IMG.abouthero + "')";
}
if (IMG.portrait) {
    $("aboutimg").src = IMG.portrait;
}
if (STORE.whatsapp) $("wab").hidden = false;

$("cats").innerHTML = CATEGORIES.map((cat) => `
    <a class="cat" href="#${cat}">
        <img src="${IMG["c_" + cat] || ''}" alt="">
        <span>${cat[0].toUpperCase() + cat.slice(1)}</span>
        <small>Shop now</small>
    </a>`).join("");

const productCard = (p) => `
    <article class="p">
        <span class="badge">-${STORE.discount}%</span>
        <img src="${IMG[p.img] || ''}" alt="${p.name}" loading="lazy">
        <div class="pi">
            <h3>${p.name}</h3>
            <div class="price">
                ${STORE.discount ? `<s>${money(p.price)}</s>` : ""}${money(discounted(p.price))}
            </div>
            <div class="add"><button data-add="${p.id}">Add to cart</button></div>
        </div>
    </article>`;

$("rail").innerHTML = PRODUCTS.slice(0, 8).map(productCard).join("");
$("pl").onclick = () => $("rail").scrollBy({ left: -$("rail").clientWidth * 0.8, behavior: "smooth" });
$("pr").onclick = () => $("rail").scrollBy({ left: $("rail").clientWidth * 0.8, behavior: "smooth" });

$("g-collection").innerHTML = PRODUCTS.map(productCard).join("");
CATEGORIES.forEach((cat) => {
    $("g-" + cat).innerHTML = PRODUCTS.filter((p) => p.cat === cat).map(productCard).join("");
});

const chipsFor = (active) => ["collection", ...CATEGORIES].map((c) => `
    <a href="#${c}" class="${c === active ? "on" : ""}">${c === "collection" ? "All" : c}</a>`).join("");
["collection", ...CATEGORIES].forEach((c, i) => {
    $("chips" + i).innerHTML = chipsFor(c);
});

const openMenu = (open) => {
    $("menu").classList.toggle("on", open);
    $("mscrim").classList.toggle("on", open);
};
$("bg").onclick = () => openMenu(true);
$("mx").onclick = $("mscrim").onclick = () => openMenu(false);

const PAGES = ["home", "about", "collection", "order", ...CATEGORIES];

function route() {
    let page = location.hash.slice(1);
    if (!PAGES.includes(page)) page = "home";

    PAGES.forEach((p) => $("v-" + p).classList.toggle("on", p === page));

    const navKey = CATEGORIES.includes(page) ? "collection" : page;
    document.querySelectorAll("#dn a").forEach((a) => {
        a.classList.toggle("on", a.hash === "#" + navKey);
    });

    document.body.classList.toggle("home", page === "home");

    window.scrollTo(0, 0);
    openMenu(false);
}
addEventListener("hashchange", route);
route();

const siteHeader = document.querySelector("header");
function updateHeader() {
    siteHeader.classList.toggle("solid", window.scrollY > 40);
    document.documentElement.style.setProperty("--hh", siteHeader.offsetHeight + "px");
}
addEventListener("scroll", updateHeader, { passive: true });
addEventListener("resize", updateHeader);
updateHeader();

const openCart = (open) => {
    $("cart").classList.toggle("on", open);
    $("scrim").classList.toggle("on", open);
    $("cart").setAttribute("aria-hidden", !open);
    if (open) $("close").focus();
};

function totals() {
    const subtotal = cart.reduce((sum, line) => sum + line.qty * findProduct(line.id).price, 0);
    return { subtotal, discount: subtotal * STORE.discount / 100 };
}

function renderCart() {
    $("cnt").textContent = cart.reduce((sum, line) => sum + line.qty, 0);

    $("items").innerHTML = cart.length
        ? cart.map((line) => {
            const p = findProduct(line.id);
            return `
                <div class="ln">
                    <img src="${IMG[p.img] || ''}" alt="">
                    <div>
                        <h4>${p.name}</h4>
                        <div class="q">
                            <button data-change="-1" data-id="${p.id}" aria-label="Decrease">−</button>
                            ${line.qty}
                            <button data-change="1" data-id="${p.id}" aria-label="Increase">+</button>
                        </div>
                        <button class="rm" data-remove="${p.id}">Remove</button>
                    </div>
                    <b>${money(discounted(p.price) * line.qty)}</b>
                </div>`;
        }).join("")
        : `<p class="empty">Your cart is empty. Add a piece you love.</p>`;

    const t = totals();
    $("sub").textContent = money(t.subtotal);
    $("dl").textContent = "Launch offer (" + STORE.discount + "%)";
    $("dv").textContent = "−" + money(t.discount);
    $("tot").textContent = money(t.subtotal - t.discount);
    $("foot").style.display = cart.length ? "" : "none";

    try {
        localStorage.setItem("rdr", JSON.stringify(cart));
    } catch (e) {}
}

document.addEventListener("click", (e) => {
    const d = e.target.dataset;

    if (d.add) {
        const id = +d.add;
        const line = cart.find((l) => l.id === id);
        line ? line.qty++ : cart.push({ id, qty: 1 });
        renderCart();
        showToast("Added to cart");
    } else if (d.change) {
        const line = cart.find((l) => l.id === +d.id);
        line.qty += +d.change;
        if (line.qty < 1) cart = cart.filter((l) => l !== line);
        renderCart();
    } else if (d.remove) {
        cart = cart.filter((l) => l.id !== +d.remove);
        renderCart();
    }
});

$("open").onclick = () => openCart(true);
$("close").onclick = $("scrim").onclick = () => openCart(false);
addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        openCart(false);
        openMenu(false);
    }
});

function buildOrderText() {
    const t = totals();
    const name = $("nm").value.trim();
    const phone = $("ph").value.trim();
    const address = $("ad").value.trim();

    if (!name || !phone || !address) {
        $("msg").textContent = "Please add your name, phone and delivery address.";
        return null;
    }
    $("msg").textContent = "";

    const lines = cart.map((l) => {
        const p = findProduct(l.id);
        return `• ${p.name} × ${l.qty} = ${money(discounted(p.price) * l.qty)}`;
    }).join("\n");

    return `New order, Rue de Rose\n\n${lines}\n\n` +
        `Subtotal: ${money(t.subtotal)}\n` +
        `Launch offer (${STORE.discount}%): −${money(t.discount)}\n` +
        `Total: ${money(t.subtotal - t.discount)}\n\n` +
        `Name: ${name}\nPhone: ${phone}\nAddress: ${address}`;
}

$("igb").onclick = async () => {
    const text = buildOrderText();
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        $("msg").textContent = "Order copied. Paste it into our Instagram DM.";
    } catch (e) {
        $("msg").textContent = "Couldn’t copy automatically. Select your order from the cart and send it in our DM.";
    }
    window.open("https://ig.me/m/" + STORE.instagram, "_blank");
};

$("wab").onclick = () => {
    const text = buildOrderText();
    if (text) window.open("https://wa.me/" + STORE.whatsapp + "?text=" + encodeURIComponent(text), "_blank");
};

renderCart();