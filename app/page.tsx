const products = [
  {
    name: "Portable Mini Blender",
    category: "Kitchen",
    price: "$18.99",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=80",
    description: "A compact rechargeable blender for smoothies and quick drinks.",
    link: "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE"
  },
  {
    name: "LED Desk Lamp",
    category: "Home & Office",
    price: "$16.49",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    description: "Modern adjustable lighting for study, work and gaming setups.",
    link: "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE"
  },
  {
    name: "Wireless Earbuds",
    category: "Tech",
    price: "$22.99",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
    description: "Compact wireless audio for music, calls and everyday use.",
    link: "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE"
  },
  {
    name: "Smart LED Light Strip",
    category: "Trending",
    price: "$11.99",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
    description: "Add colorful ambient lighting to bedrooms, desks and entertainment spaces.",
    link: "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE"
  },
  {
    name: "Phone Stand",
    category: "Accessories",
    price: "$7.49",
    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=900&q=80",
    description: "A simple adjustable stand for watching videos, calls and work.",
    link: "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE"
  },
  {
    name: "Portable Projector",
    category: "Entertainment",
    price: "$39.99",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80",
    description: "Create a home cinema experience with a compact projector.",
    link: "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE"
  }
];

const categories = ["All", "Tech", "Home & Office", "Kitchen", "Trending", "Accessories", "Entertainment"];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="brand"><span className="brandMark">V</span><span>Veylola Finds</span></div>
        <div className="navLinks">
          <a href="#deals">Deals</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
        </div>
        <a className="navCta" href="#deals">Explore deals</a>
      </nav>

      <section className="hero">
        <div className="heroGlow" />
        <div className="heroCopy">
          <div className="eyebrow">TRENDING FINDS • CURATED FOR YOU</div>
          <h1>Discover products<br /><span>worth clicking.</span></h1>
          <p>We hunt for useful, stylish and trending finds on AliExpress so you can discover them in one simple place.</p>
          <div className="heroActions">
            <a className="primary" href="#deals">Browse featured finds →</a>
            <a className="secondary" href="#about">How it works</a>
          </div>
          <div className="trust"><span>✓ Curated products</span><span>✓ Direct AliExpress links</span><span>✓ New finds added regularly</span></div>
        </div>
        <div className="heroCard">
          <div className="dealBadge">HOT FIND</div>
          <img src={products[5].image} alt={products[5].name} />
          <div className="heroCardInfo"><span>Portable Projector</span><strong>From $39.99</strong></div>
        </div>
      </section>

      <section id="categories" className="categories">
        <div>
          <p className="sectionEyebrow">SHOP BY INTEREST</p>
          <h2>Find your next favorite.</h2>
        </div>
        <div className="chips">{categories.map(c => <a key={c} href="#deals">{c}</a>)}</div>
      </section>

      <section id="deals" className="deals">
        <div className="sectionHead">
          <div><p className="sectionEyebrow">EDITOR'S PICKS</p><h2>Trending finds</h2></div>
          <span className="smallNote">Prices may change on AliExpress.</span>
        </div>
        <div className="grid">
          {products.map((p, i) => (
            <article className="product" key={p.name}>
              <div className="imageWrap">
                <img src={p.image} alt={p.name} />
                {i < 3 && <span className="tag">POPULAR</span>}
              </div>
              <div className="productBody">
                <span className="category">{p.category}</span>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="productFoot">
                  <strong>{p.price}</strong>
                  <a href={p.link === "PASTE_YOUR_ALIEXPRESS_AFFILIATE_LINK_HERE" ? "#affiliate-info" : p.link} target="_blank" rel="nofollow sponsored noopener">View deal ↗</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="how">
        <div>
          <p className="sectionEyebrow">HOW IT WORKS</p>
          <h2>Simple. Useful. Transparent.</h2>
        </div>
        <div className="steps">
          <div><b>01</b><h3>We curate</h3><p>We select interesting products and organize them into easy-to-browse collections.</p></div>
          <div><b>02</b><h3>You discover</h3><p>Read the short product summary and decide whether it fits what you need.</p></div>
          <div><b>03</b><h3>AliExpress checkout</h3><p>Click the deal button and complete your purchase on AliExpress.</p></div>
        </div>
      </section>

      <section id="affiliate-info" className="disclosure">
        <strong>Affiliate disclosure</strong>
        <p>Some links on Veylola Finds are affiliate links. If you buy through one of these links, we may earn a commission at no extra cost to you. Product prices, shipping and availability are controlled by AliExpress and can change.</p>
      </section>

      <footer>
        <div className="brand"><span className="brandMark">V</span><span>Veylola Finds</span></div>
        <p>Curated online finds. © 2026 Veylola.</p>
      </footer>
    </main>
  );
}