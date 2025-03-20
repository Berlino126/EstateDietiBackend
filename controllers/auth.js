import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Controllo se esiste già un utente con la stessa email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email già in uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role: "user",
      },
    });

    res.status(201).json({ message: "Utente registrato con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nella registrazione" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const age = 1000 * 60 * 60 * 24;
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
      include: {
        agencyUsers: {
          include: {
            agency: true, // Aggiungi l'agenzia associata all'utente
          },
        },
      },
    });

    if (!user) return res.status(401).json({ message: "Credenziali non valide" });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Password non corretta" });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );
    const { passwordHash, ...userInfo } = user;

    // Se l'utente è un 'agency', aggiungi anche i dati dell'agenzia
    let agencyInfo = null;
    if (user.role === "agency" && user.agencyUsers.length > 0) {
      agencyInfo = user.agencyUsers[0].agency; // Aggiungi i dati dell'agenzia
    }

    res
    .cookie("token_access", token, {
      secure: false, // Imposta su true solo se usi HTTPS
      sameSite: "none", // Necessario per cross-origin
      maxAge: age, // Durata del cookie
      domain: '35.181.57.245', // Dominio del backend
      path: '/', // Percorso del cookie
    })
    .status(200)
    .json({ ...userInfo, agencyInfo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Utente non loggato" });
  }
};

export const logout = (req, res) => {
  //console.log("Seconda prova");
  res.clearCookie("token_access", {
    httpOnly: true,
    domain: '35.181.57.245',
    path: '/',
  }).status(200).json("Logout eseguito")
};


export const initAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Controllo se esiste già un utente con la stessa email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email già in uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role: "admin",
      },
    });

    res.status(201).json({ message: "admin registrato con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nella registrazione" });
  }
};