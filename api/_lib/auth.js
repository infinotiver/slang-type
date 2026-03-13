import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const getSecret = () => {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error("JWT_SECRET not set");
    return new TextEncoder().encode(s);
};

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const generateToken = async (payload) =>
    new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(getSecret());

export const verifyToken = async (token) => {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload;
    } catch {
        return null;
    }
};
