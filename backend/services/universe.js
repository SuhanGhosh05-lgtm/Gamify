import prisma from '../config/prisma.js';
import { interestTaxonomy } from '../config/taxonomy.js';

const hierarchyInclude = {
  villages: {
    orderBy: { createdAt: 'asc' },
    include: {
      wards: {
        orderBy: { createdAt: 'asc' },
        include: {
          houses: { orderBy: { createdAt: 'asc' }, include: { currentQuests: { orderBy: { createdAt: 'asc' } } } },
        },
      },
    },
  },
};

export const universeForUser = (firebaseUid) => prisma.universe.findFirst({
  where: { user: { firebaseUid } }, include: hierarchyInclude,
});

const findTaxonomyInterest = (name) => interestTaxonomy.find((interest) => interest.name === name);
const requiredName = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`);
  return value.trim();
};

export function validateOnboardingSelections(selections) {
  if (!Array.isArray(selections) || !selections.length) throw new Error('Choose at least one interest.');
  const interests = new Set();
  return selections.map((selection) => {
    if (!selection || typeof selection.interest !== 'string' || interests.has(selection.interest)) throw new Error('Interests must be unique and valid.');
    const interest = findTaxonomyInterest(selection.interest);
    if (!interest) throw new Error('An interest is not in the available taxonomy.');
    interests.add(selection.interest);
    if (!Array.isArray(selection.subinterests) || !selection.subinterests.length) throw new Error(`Choose at least one subinterest for ${interest.name}.`);
    const subinterests = new Set();
    return {
      interest: interest.name,
      villageName: requiredName(selection.villageName, `A village name for ${interest.name}`),
      subinterests: selection.subinterests.map((chosenSubinterest) => {
        if (!chosenSubinterest || typeof chosenSubinterest.name !== 'string' || subinterests.has(chosenSubinterest.name)) throw new Error('Subinterests must be unique and valid.');
        const subinterest = interest.subinterests.find((item) => item.name === chosenSubinterest.name);
        if (!subinterest) throw new Error('A subinterest does not belong to its interest.');
        subinterests.add(chosenSubinterest.name);
        if (!Array.isArray(chosenSubinterest.topics) || !chosenSubinterest.topics.length) throw new Error(`Choose at least one topic for ${subinterest.name}.`);
        const topics = new Set();
        chosenSubinterest.topics.forEach((topic) => {
          if (!topic || typeof topic.name !== 'string' || !subinterest.topics.includes(topic.name) || topics.has(topic.name)) throw new Error('A topic does not belong to its subinterest.');
          topics.add(topic.name);
        });
        return {
          name: subinterest.name,
          wardName: requiredName(chosenSubinterest.wardName, `A ward name for ${subinterest.name}`),
          topics: chosenSubinterest.topics.map((topic) => ({ name: topic.name, houseName: requiredName(topic.houseName, `A house name for ${topic.name}`) })),
        };
      }),
    };
  });
}

export async function enterUniverse(firebaseUid) {
  const user = await prisma.user.findUnique({ where: { firebaseUid }, select: { onboardingCompleted: true, characterComplete: true } });
  if (!user) return null;
  if (!user.characterComplete) return { characterRequired: true };
  return user.onboardingCompleted
    ? { onboardingCompleted: true, universe: await universeForUser(firebaseUid) }
    : { onboardingCompleted: false, taxonomy: interestTaxonomy };
}

export async function completeOnboarding(firebaseUid, rawSelections, rawUniverseName) {
  const selections = validateOnboardingSelections(rawSelections);
  const universeName = requiredName(rawUniverseName, 'A universe name');
  const persist = async (tx) => {
    const user = await tx.user.findUnique({ where: { firebaseUid }, select: { id: true, onboardingCompleted: true } });
    if (!user) return null;
    const universe = await tx.universe.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, universeName } });
    if (!user.onboardingCompleted) {
      if (!universe.universeName) await tx.universe.update({ where: { id: universe.id }, data: { universeName } });
      for (const selection of selections) {
        let village = await tx.village.findFirst({ where: { universeId: universe.id, name: selection.interest } });
        if (!village) village = await tx.village.create({ data: { universeId: universe.id, name: selection.interest, villageName: selection.villageName } });
        for (const selectedSubinterest of selection.subinterests) {
          let ward = await tx.ward.findFirst({ where: { villageId: village.id, name: selectedSubinterest.name } });
          if (!ward) ward = await tx.ward.create({ data: { villageId: village.id, name: selectedSubinterest.name, wardName: selectedSubinterest.wardName } });
          for (const topic of selectedSubinterest.topics) {
            const house = await tx.house.findFirst({ where: { wardId: ward.id, name: topic.name } });
            if (!house) await tx.house.create({ data: { wardId: ward.id, name: topic.name, houseName: topic.houseName } });
          }
        }
      }
      await tx.user.update({ where: { id: user.id }, data: { onboardingCompleted: true } });
    }
    return tx.universe.findUnique({ where: { id: universe.id }, include: hierarchyInclude });
  };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { return await prisma.$transaction(persist, { isolationLevel: 'Serializable' }); }
    catch (error) { if (error.code !== 'P2034' || attempt === 2) throw error; }
  }
}

async function ownedUniverse(firebaseUid) {
  return prisma.universe.findFirst({ where: { user: { firebaseUid } }, select: { id: true, userId: true } });
}

const ownership = {
  village: (id, firebaseUid) => ({ id, universe: { user: { firebaseUid } } }),
  ward: (id, firebaseUid) => ({ id, village: { universe: { user: { firebaseUid } } } }),
  house: (id, firebaseUid) => ({ id, ward: { village: { universe: { user: { firebaseUid } } } } }),
  quest: (id, firebaseUid) => ({ id, house: { ward: { village: { universe: { user: { firebaseUid } } } } } }),
};

export async function createEntry(type, parentId, data, firebaseUid) {
  const universe = await ownedUniverse(firebaseUid);
  if (!universe) return null;
  if (type === 'village') return prisma.village.create({ data: { ...data, universeId: universe.id } });

  const parentType = type === 'ward' ? 'village' : type === 'house' ? 'ward' : 'house';
  const parent = await prisma[parentType].findFirst({ where: ownership[parentType](parentId, firebaseUid), select: { id: true } });
  if (!parent) return null;
  return prisma[type].create({ data: { ...data, [`${parentType}Id`]: parent.id } });
}

export async function updateEntry(type, id, data, firebaseUid) {
  const record = await prisma[type].findFirst({ where: ownership[type](id, firebaseUid), select: { id: true } });
  return record ? prisma[type].update({ where: { id }, data }) : null;
}

export async function deleteEntry(type, id, firebaseUid) {
  const record = await prisma[type].findFirst({ where: ownership[type](id, firebaseUid), select: { id: true } });
  if (!record) return false;
  await prisma[type].delete({ where: { id } });
  return true;
}

export async function completeQuest(questId, firebaseUid) {
  const universe = await ownedUniverse(firebaseUid);
  if (!universe) return { status: 'not-found' };

  return prisma.$transaction(async (tx) => {
    const quest = await tx.quest.findFirst({ where: ownership.quest(questId, firebaseUid) });
    if (!quest) return { status: 'not-found' };
    if (quest.completed) return { status: 'already-completed', quest };

    const now = new Date();
    // Guard the transition in the write itself, so concurrent completion requests
    // cannot award XP twice.
    const transition = await tx.quest.updateMany({
      where: { id: quest.id, completed: false },
      data: { completed: true, completedAt: now },
    });
    if (!transition.count) return { status: 'already-completed', quest };
    const completed = { ...quest, completed: true, completedAt: now };
    await tx.progression.update({
      where: { userId: universe.userId },
      data: { totalXp: { increment: quest.xpReward }, totalTasksCompleted: { increment: 1 } },
    });
    await tx.universe.update({ where: { id: universe.id }, data: { questsCompleted: { increment: 1 } } });
    return { status: 'completed', quest: completed };
  });
}
