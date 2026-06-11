import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.utils';
import type { LoginInput, ChangePasswordInput, UpdateProfileInput } from './auth.schema';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export async function loginService(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Uniform timing — always compare even if user not found (prevent timing attacks)
  const dummyHash = '$2b$12$invalidhashfortimingattackprevention1234567890abcdef';
  const passwordMatch = await bcrypt.compare(
    input.password,
    user?.passwordHash ?? dummyHash
  );

  if (!user || !passwordMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Generate tokens
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const rawRefreshToken = generateRefreshToken();
  const hashedToken = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshService(rawRefreshToken: string) {
  const hashedToken = hashToken(rawRefreshToken);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    if (tokenRecord) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    }
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const { user } = tokenRecord;

  // Rotate refresh token — delete old, create new
  const newRawToken = generateRefreshToken();
  const newHashedToken = hashToken(newRawToken);

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: tokenRecord.id } }),
    prisma.refreshToken.create({
      data: {
        token: newHashedToken,
        userId: user.id,
        expiresAt: newExpiresAt,
      },
    }),
  ]);

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { accessToken, refreshToken: newRawToken };
}

export async function logoutService(rawRefreshToken: string) {
  const hashedToken = hashToken(rawRefreshToken);
  await prisma.refreshToken.deleteMany({ where: { token: hashedToken } });
}

export async function changePasswordService(
  userId: string,
  input: ChangePasswordInput
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const match = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!match) {
    throw new Error('WRONG_CURRENT_PASSWORD');
  }

  const newHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

  // Update password AND invalidate all refresh tokens (security best practice)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
}

export async function updateProfileService(
  userId: string,
  input: UpdateProfileInput
) {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== userId) {
      throw new Error('EMAIL_TAKEN');
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.email && { email: input.email }),
    },
    select: { id: true, name: true, email: true, role: true },
  });
}
