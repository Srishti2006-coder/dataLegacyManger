
import React from "react";
import PropTypes from "prop-types";
import "./Hero.css";

/**
 * Reusable hero/landing section with optional actions.
 * Props allow the parent to customize text and button handlers.
 */
function Hero({
  title,
  subtitle,
  primaryText,
  secondaryText,
  onPrimaryClick,
  onSecondaryClick
}) {
  console.log("Hero props:", { title, subtitle, primaryText, secondaryText });
  return (
    <section className="hero" role="banner">
      <header className="hero__container">
        <h1 className="hero__heading">{title}</h1>
        <p className="hero__subtext">{subtitle}</p>
        <div className="hero__buttons">
          {primaryText && (
            <button
              className="hero__btn hero__btn--primary"
              onClick={onPrimaryClick}
              aria-label={primaryText}
            >
              {primaryText}
            </button>
          )}
          {secondaryText && (
            <button
              className="hero__btn hero__btn--secondary"
              onClick={onSecondaryClick}
              aria-label={secondaryText}
            >
              {secondaryText}
            </button>
          )}
        </div>
      </header>
    </section>
  );
}

Hero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  primaryText: PropTypes.string,
  secondaryText: PropTypes.string,
  onPrimaryClick: PropTypes.func,
  onSecondaryClick: PropTypes.func
};

Hero.defaultProps = {
  title: "Your Digital Life Deserves a Future",
  subtitle:
    "Organize your digital assets, protect your accounts, and create a secure digital legacy with the help of AI.",
  primaryText: "Start Planning",
  secondaryText: "See How It Works",
  onPrimaryClick: () => {},
  onSecondaryClick: () => {}
};

export default Hero;