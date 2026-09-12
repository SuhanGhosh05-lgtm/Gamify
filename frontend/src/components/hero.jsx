export default function Hero({ onExplore, exploreMessage, playerName }) {
  return (
    <main className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{playerName ? 'Your universe is ready' : 'Your real life, leveled up'}</p>
        <h1>{playerName ? `Your next quest awaits, ${playerName}.` : 'Make your next chapter an adventure.'}</h1>
        <p className="hero-description">
          {playerName
            ? 'Explore your restored journey, review your progress, and choose the next step in your adventure.'
            : 'Turn the habits that matter into quests, build momentum every day, and become the hero of your own story.'}
        </p>
        <button className="primary-button" type="button" onClick={onExplore}>Explore Your Journey <span aria-hidden="true">→</span></button>
        {exploreMessage && <p className="explore-message" role="status">{exploreMessage}</p>}
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="moon" />
        <div className="mountain mountain-back" />
        <div className="mountain mountain-front" />
        <div className="path" />
        <span className="star star-one">✦</span><span className="star star-two">✦</span><span className="star star-three">·</span>
      </div>
    </main>
  );
}
