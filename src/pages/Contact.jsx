import { useState } from "react";
import { CONTACT_DEFAULT_SUBJECT, SITE_CONTACT } from "../data/siteContact";
import "./contact.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM_VALUES = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
};

function buildMailtoLink(values) {
  const cleanValues = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    company: values.company.trim(),
    subject: values.subject.trim(),
    message: values.message.trim(),
  };

  const subject = cleanValues.subject || CONTACT_DEFAULT_SUBJECT;
  const body = [
    "Hello MosIC team,",
    "",
    "Please find my inquiry details below.",
    "",
    `Name: ${cleanValues.name}`,
    `Email: ${cleanValues.email}`,
    `Phone: ${cleanValues.phone || "Not provided"}`,
    `Company: ${cleanValues.company || "Not provided"}`,
    "",
    "Message:",
    cleanValues.message,
  ].join("\n");

  return `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter your message.";
  } else if (values.message.trim().length < 15) {
    errors.message = "Please provide at least 15 characters.";
  }

  return errors;
}

export default function Contact() {
  const [values, setValues] = useState(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState({});
  const [submissionNotice, setSubmissionNotice] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setSubmissionNotice("");
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmissionNotice(
      "Opening your email client with the prepared message. Please send it to complete your inquiry."
    );

    window.location.href = buildMailtoLink(values);
  };

  return (
    <main className="contact-page">
      <section className="contact-page__hero">
        <div className="contact-page__hero-grid circuit-grid" aria-hidden="true"></div>
        <div className="content-fluid contact-page__hero-content">
          <p className="contact-page__eyebrow">// Contact MosIC</p>
          <h1 className="contact-page__title">
            Let&apos;s Build Instrumentation-Grade IC Solutions Together
          </h1>
          <p className="contact-page__lead">
            Share your design challenge, requirement scope, or integration goal.
            Our engineering team will review and respond with the right next
            steps.
          </p>
          <div className="contact-page__hero-actions">
            <a className="contact-page__hero-link contact-page__hero-link--primary" href={SITE_CONTACT.emailHref}>
              Email Our Team
            </a>
            <a className="contact-page__hero-link contact-page__hero-link--secondary" href={SITE_CONTACT.phoneHref}>
              Call Us
            </a>
          </div>
        </div>
      </section>

      <section className="contact-page__details">
        <div className="content-fluid">
          <div className="contact-page__card-grid">
            <article className="contact-card">
              <p className="contact-card__icon" aria-hidden="true">
                ADR
              </p>
              <h2 className="contact-card__title">Corporate Address</h2>
              <address className="contact-card__body">
                {SITE_CONTACT.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <a
                href={SITE_CONTACT.mapsExternalUrl}
                target="_blank"
                rel="noreferrer"
                className="contact-card__link"
              >
                Open in Maps
              </a>
            </article>

            <article className="contact-card">
              <p className="contact-card__icon" aria-hidden="true">
                TEL
              </p>
              <h2 className="contact-card__title">Phone</h2>
              <p className="contact-card__body">{SITE_CONTACT.phoneDisplay}</p>
              <a href={SITE_CONTACT.phoneHref} className="contact-card__link">
                Dial Now
              </a>
            </article>

            <article className="contact-card">
              <p className="contact-card__icon" aria-hidden="true">
                MAIL
              </p>
              <h2 className="contact-card__title">Email</h2>
              <p className="contact-card__body">{SITE_CONTACT.email}</p>
              <a href={SITE_CONTACT.emailHref} className="contact-card__link">
                Compose Email
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="contact-page__connect">
        <div className="content-fluid contact-page__connect-grid">
          <article className="contact-panel">
            <h2 className="contact-panel__title">Send Us a Message</h2>
            <p className="contact-panel__lead">
              If you have any questions, please do not hesitate to send us a
              message.
            </p>

            <form className="contact-form" noValidate onSubmit={handleSubmit}>
              <div className="contact-form__grid">
                <div className="contact-field">
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                  {errors.name ? (
                    <p id="contact-name-error" className="contact-field__error" role="alert">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">Your Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                  {errors.email ? (
                    <p id="contact-email-error" className="contact-field__error" role="alert">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-phone">Phone (Optional)</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={values.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-company">Company (Optional)</label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    value={values.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">Subject (Optional)</label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={values.subject}
                  onChange={handleChange}
                  placeholder={CONTACT_DEFAULT_SUBJECT}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Your Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="6"
                  value={values.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                ></textarea>
                {errors.message ? (
                  <p id="contact-message-error" className="contact-field__error" role="alert">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              {submissionNotice ? (
                <p className="contact-form__notice" role="status">
                  {submissionNotice}
                </p>
              ) : null}

              <button type="submit" className="contact-form__submit">
                Send Message
              </button>
            </form>
          </article>

          <aside className="contact-map-panel">
            <h2 className="contact-panel__title">Our Location</h2>
            <p className="contact-panel__lead">
              Located near Marathahalli, Bengaluru for close collaboration and
              customer engagement.
            </p>

            <div className="contact-map-panel__frame">
              <iframe
                title="MosIC Solutions office location map"
                src={SITE_CONTACT.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <a
              className="contact-map-panel__link"
              href={SITE_CONTACT.mapsExternalUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
