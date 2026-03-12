
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

function Landing() {
  const handleGetStarted = () => {
    console.log("Primary action clicked");
  };

  const handleLearnMore = () => {
    console.log("Secondary action clicked");
  };

  // explicitly pass strings so we know they're rendered
  return (
    <div>
      <Navbar />
      <Hero
        title="Welcome to Your Digital Legacy"
        subtitle="Safeguard memories, passwords and more with a few clicks."
        primaryText="Begin Now"
        secondaryText="Learn More"
        onPrimaryClick={handleGetStarted}
        onSecondaryClick={handleLearnMore}
      />
    </div>
  );
}

export default Landing;