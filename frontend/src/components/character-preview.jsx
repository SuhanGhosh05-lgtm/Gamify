export default function CharacterPreview({ character, compact = false }) {
  if (!character) return null;
  return <div className={`character-preview gender-${character.gender}${compact ? ' compact' : ''}`} aria-label={`${character.name}'s character preview`}>
    <span className="character-aura" /><span className="character-spark spark-one">✦</span><span className="character-spark spark-two">✦</span><span className="character-shadow" />
    <div className={`character-hair hair-${character.hairStyle} hair-color-${character.hairColor}`}><span className="hair-shine" /></div>
    <div className={`character-head skin-${character.skinColor}`}>
      <span className="character-brow left" /><span className="character-brow right" /><span className="character-eye left"><i /></span><span className="character-eye right"><i /></span><span className="character-nose" /><span className="character-mouth" />
      {character.accessory === 'glasses' && <span className="character-glasses">○ ○</span>}
      {character.accessory === 'hat' && <span className="character-hat">▰</span>}
    </div>
    <div className={`character-body outfit-${character.outfitStyle} outfit-color-${character.outfitColor}`}>
      <span className="character-collar" /><span className="character-emblem">✦</span><span className="character-arm character-wave" />
      {character.accessory === 'scarf' && <span className="character-scarf" />}
    </div>
  </div>;
}
