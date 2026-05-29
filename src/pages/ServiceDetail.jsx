import { useParams } from "react-router-dom";
import { getServiceBySlug } from "../data/services";

function DetailList({ title, items }) {
  return (
    <article className="rounded-xl border border-teal/18 bg-surface/90 p-6">
      <h2 className="font-head text-[1.35rem] font-semibold tracking-[-0.01em] text-text">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-[0.98rem] leading-[1.6] text-muted"
          >
            <span className="mt-[0.48rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal/85"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ServiceDetail() {
  const { serviceSlug } = useParams();
  const service = getServiceBySlug(serviceSlug);
  const hasDetails = Boolean(service?.hasDetails && service?.detail);

  if (!hasDetails) {
    return (
      <section className="bg-bg px-5 pb-20 pt-[calc(70px+3.5rem)] md:px-8 lg:px-[5%]">
        <div className="content-fluid max-w-[980px]">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-teal">
            Service Details
          </p>
          <h1 className="mt-3 font-head text-[clamp(1.9rem,4vw,3rem)] font-bold tracking-[-0.02em] text-text">
            {service
              ? `${service.title} details coming soon`
              : "Service not found"}
          </h1>
          <p className="mt-4 max-w-[72ch] text-[1.02rem] leading-[1.75] text-muted">
            {service
              ? "Detailed information for this service will be published soon. Contact us and we can share a tailored scope."
              : "The requested service page is unavailable. Explore available services from the home page."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5 max-[480px]:flex-col">
            <a
              href="/#services"
              className="inline-flex items-center justify-center rounded border border-text/25 bg-transparent px-6 py-3 font-ui text-[0.84rem] font-semibold uppercase tracking-[0.14em] text-text transition-all duration-300 hover:border-teal hover:bg-teal/10 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
            >
              Back to Services
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded bg-teal px-6 py-3 font-ui text-[0.84rem] font-bold uppercase tracking-[0.14em] text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00ffda] hover:shadow-[0_0_38px_rgba(0,229,195,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
            >
              Request Consultation
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
          Design Service
        </p>
        <h1 className="mt-3 font-head text-[clamp(1.9rem,4vw,3rem)] font-bold tracking-[-0.02em] text-text">
          {service.title}
        </h1>
        <p className="mt-4 max-w-[74ch] text-[1.02rem] leading-[1.75] text-muted">
          {service.detail.intro}
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <DetailList title="Key Features" items={service.detail.featureList} />
          <DetailList
            title="Deliverables"
            items={service.detail.deliverablesList}
          />
        </div>

        <div className="mt-5">
          <DetailList title="Tools & Stack" items={service.detail.toolsList} />
        </div>

        <div className="mt-10 flex flex-wrap gap-3.5 max-[480px]:flex-col">
          <a
            href="/#services"
            className="inline-flex items-center justify-center rounded border border-text/25 bg-transparent px-6 py-3 font-ui text-[0.84rem] font-semibold uppercase tracking-[0.14em] text-text transition-all duration-300 hover:border-teal hover:bg-teal/10 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
          >
            Back to Services
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded bg-teal px-6 py-3 font-ui text-[0.84rem] font-bold uppercase tracking-[0.14em] text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00ffda] hover:shadow-[0_0_38px_rgba(0,229,195,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/55 max-[480px]:w-full"
          >
            Request Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
