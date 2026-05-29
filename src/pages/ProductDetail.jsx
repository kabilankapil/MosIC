import { useParams } from "react-router-dom";
import { getProductBySlug } from "../data/products";

export default function ProductDetail() {
  const { productSlug } = useParams();
  const product = getProductBySlug(productSlug);
  const hasDetails = Boolean(product?.hasDetails && product?.detail);

  if (!hasDetails) {
    return (
      <section className="bg-bg px-5 pb-20 pt-[calc(70px+3.5rem)] md:px-8 lg:px-[5%]">
        <div className="content-fluid max-w-[980px]">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-teal">
            Product Details
          </p>
          <h1 className="mt-3 font-head text-[clamp(1.9rem,4vw,3rem)] font-bold tracking-[-0.02em] text-text">
            {product
              ? `${product.title} details coming soon`
              : "Product not found"}
          </h1>
          <p className="mt-4 max-w-[72ch] text-[1.02rem] leading-[1.75] text-muted">
            {product
              ? "Detailed specifications for this product will be published soon. Contact us for preliminary information or datasheet requests."
              : "The requested product page is unavailable. Explore current products from the product section."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5 max-[480px]:flex-col">
            <a
              href="/#products"
              className="inline-flex items-center justify-center rounded border border-text/25 bg-transparent px-6 py-3 font-ui text-[0.84rem] font-semibold uppercase tracking-[0.14em] text-text transition-all duration-300 hover:border-teal hover:bg-teal/10 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
            >
              Back to Products
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded bg-teal px-6 py-3 font-ui text-[0.84rem] font-bold uppercase tracking-[0.14em] text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00ffda] hover:shadow-[0_0_38px_rgba(0,229,195,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
            >
              Request Datasheet
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg px-5 pb-20 pt-[calc(70px+3.5rem)] md:px-8 lg:px-[5%]">
      <div className="content-fluid max-w-[1120px]">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-teal">
          Product Solution
        </p>
        <h1 className="mt-3 font-head text-[clamp(1.9rem,4vw,3rem)] font-bold tracking-[-0.02em] text-text">
          {product.code} - {product.title}
        </h1>
        <p className="mt-4 max-w-[74ch] text-[1.02rem] leading-[1.75] text-muted">
          {product.detail.intro}
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-teal/18 bg-surface/90 p-6">
            <h2 className="font-head text-[1.35rem] font-semibold tracking-[-0.01em] text-text">
              Key Features
            </h2>
            <ul className="mt-4 space-y-2.5">
              {product.detail.featureList.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-[0.98rem] leading-[1.6] text-muted"
                >
                  <span className="mt-[0.48rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal/85"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-teal/18 bg-surface/90 p-6">
            <h2 className="font-head text-[1.35rem] font-semibold tracking-[-0.01em] text-text">
              Specifications
            </h2>
            <ul className="mt-4 space-y-2.5">
              {product.detail.specList.map((spec) => (
                <li
                  key={spec}
                  className="flex items-start gap-2.5 text-[0.98rem] leading-[1.6] text-muted"
                >
                  <span className="mt-[0.48rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal/85"></span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-10 flex flex-wrap gap-3.5 max-[480px]:flex-col">
          <a
            href="/#products"
            className="inline-flex items-center justify-center rounded border border-text/25 bg-transparent px-6 py-3 font-ui text-[0.84rem] font-semibold uppercase tracking-[0.14em] text-text transition-all duration-300 hover:border-teal hover:bg-teal/10 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
          >
            Back to Products
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded bg-teal px-6 py-3 font-ui text-[0.84rem] font-bold uppercase tracking-[0.14em] text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00ffda] hover:shadow-[0_0_38px_rgba(0,229,195,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
          >
            Request Datasheet
          </a>
        </div>

        <div className="mt-7 rounded-lg border border-teal/14 bg-surface/65 px-4 py-3 text-[0.9rem] leading-[1.65] text-muted">
          MosIC solutions offers complete integrated chip solutions for LVDT
          sensors and readout integrated circuits for differential capacitance
          measurements.
        </div>
      </div>
    </section>
  );
}
