import prisma from '../config/prisma.js';

const gameDataInclude = {
  progression: true,
  universe: true,
};

export function findUserByFirebaseUid(firebaseUid) {
  return prisma.user.findUnique({ where: { firebaseUid }, include: gameDataInclude });
}

export async function createUserWithInitialData(firebaseUser) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || null,
        displayName: firebaseUser.name || firebaseUser.displayName || null,
        photoUrl: firebaseUser.picture || firebaseUser.photoURL || null,
        lastLoginAt: now,
        lastActivityAt: now,
        progression: { create: {} },
        universe: { create: {} },
      },
      include: gameDataInclude,
    });
    return user;
  });
}

export async function registerUser(firebaseUser) {
  const existingUser = await findUserByFirebaseUid(firebaseUser.uid);
  if (existingUser) return { status: 'already-registered', data: existingUser };
  try {
    return { status: 'created', data: await createUserWithInitialData(firebaseUser) };
  } catch (error) {
    // A parallel registration can race past the first lookup.
    if (error.code === 'P2002') return { status: 'already-registered', data: await findUserByFirebaseUid(firebaseUser.uid) };
    throw error;
  }
}

export async function loginUser(firebaseUser) {
  const existingUser = await findUserByFirebaseUid(firebaseUser.uid);
  if (!existingUser) return { status: 'not-found', data: null };
  const data = await prisma.user.update({
    where: { firebaseUid: firebaseUser.uid },
    data: { lastLoginAt: new Date(), lastActivityAt: new Date() },
    include: gameDataInclude,
  });
  return { status: 'found', data };
}

export function getUserWithGameData(firebaseUid) {
  return findUserByFirebaseUid(firebaseUid);
}
