import prisma from '../config/prisma.js';

export const characterOptions = {
  gender: ['male', 'female'],
  skinColor: ['light', 'medium', 'deep'],
  hairStyle: ['short', 'long', 'curly'],
  hairColor: ['brown', 'black', 'blonde', 'red'],
  outfitStyle: ['casual', 'adventurer', 'scholar'],
  outfitColor: ['blue', 'green', 'purple', 'red'],
  accessory: ['none', 'glasses', 'hat', 'scarf'],
};

function characterData(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) throw new Error('Character name is required.');
  const data = { name };
  for (const [field, options] of Object.entries(characterOptions)) {
    if (!options.includes(input[field])) throw new Error(`Choose a valid ${field}.`);
    data[field] = input[field];
  }
  return data;
}

export function getCharacterStatus(firebaseUid) {
  return prisma.user.findUnique({
    where: { firebaseUid },
    select: { characterComplete: true, character: true },
  });
}

export async function saveCharacter(firebaseUid, input) {
  const data = characterData(input);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { firebaseUid }, select: { id: true } });
    if (!user) return null;
    const character = await tx.character.upsert({
      where: { userId: user.id }, update: data, create: { userId: user.id, ...data },
    });
    await tx.user.update({ where: { id: user.id }, data: { characterComplete: true } });
    return { characterComplete: true, character };
  });
}
