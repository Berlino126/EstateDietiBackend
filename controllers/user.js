import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const addAdmin = async (req, res) => {
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
    console.log(hashedPassword);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role: "admin",
      },
    });
    console.log(newUser);
    res.status(201).json({ message: "Utente registrato con successo" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Utente non registrato " });
  }
};

export const addAgency = async (req, res) => {
  try {
    const { agencyData, gestorData } = req.body;

    // Controlla se esiste già un'agenzia con lo stesso nome o email
    const existingAgency = await prisma.realEstateAgency.findUnique({
      where: { email: agencyData.email },
    });

    if (existingAgency) {
      return res
        .status(400)
        .json({ message: "Agenzia immobiliare già registrata" });
    }

    // Hash della password del gestore
    const hashedPassword = await bcrypt.hash(gestorData.password, 10);

    // Creazione dell'agenzia immobiliare
    const newAgency = await prisma.realEstateAgency.create({
      data: {
        name: agencyData.name,
        address: agencyData.address,
        city: agencyData.city,
        phone: agencyData.phone,
        email: agencyData.email,
        website: agencyData.website,
      },
    });

    // Creazione dell'account del gestore
    const newGestor = await prisma.user.create({
      data: {
        email: gestorData.email,
        username: gestorData.username,
        passwordHash: hashedPassword,
        role: "agency",
        avatar: gestorData.avatar,
      },
    });

    // Associazione del gestore con l'agenzia nella tabella intermedia
    await prisma.agencyUser.create({
      data: {
        agencyId: newAgency.id,
        userId: newGestor.id,
        role: "agency",
      },
    });

    res.status(201).json({
      message: "Agenzia e amministratore creati con successo",
      agency: newAgency,
      gestor: newGestor,
    });
  } catch (err) {
    console.error("Errore nella registrazione:", err);
    res.status(500).json({ message: "Errore nella registrazione" });
  }
};

export const addAgent = async (req, res) => {
  try {
    const agencyUserId = req.userId;  // 🔹 Usa `req.userId` invece di `req.body.agencyUserId`
    const { agentData } = req.body;
    console.log(agentData);
    console.log(agencyUserId);
    // Verifica se l'utente esiste e ha il ruolo "agency"
    const agencyUser = await prisma.user.findUnique({
      where: { id: agencyUserId },
      include: { agencyUsers: true },
    });

    if (!agencyUser) {
      return res.status(404).json({ message: "Utente agenzia non trovato" });
    }

    // Recupera l'agenzia associata all'utente creatore
    const agencyUserRelation = await prisma.agencyUser.findFirst({
      where: { userId: agencyUserId },
      include: { agency: true },
    });

    if (!agencyUserRelation) {
      return res.status(404).json({ message: "Agenzia non trovata" });
    }

    const agencyId = agencyUserRelation.agency.id;

    // Verifica se l'email è già registrata
    const existingUser = await prisma.user.findUnique({
      where: { email: agentData.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email già registrata" });
    }

    // Crittografa la password
    const hashedPassword = await bcrypt.hash(agentData.password, 10);

    // Crea il nuovo agente immobiliare
    const newAgent = await prisma.user.create({
      data: {
        email: agentData.email,
        username: agentData.username,
        passwordHash: hashedPassword,
        role: "agent",
        avatar: agentData.avatar,
      },
    });

    // Associa l'agente all'agenzia
    await prisma.agencyUser.create({
      data: {
        agencyId: agencyId,
        userId: newAgent.id,
        role: "agent",
      },
    });

    res.status(201).json({
      message: "Agente immobiliare creato con successo",
      agent: newAgent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nella creazione dell'agente" });
  }
};


export const getAgents = async (req, res) => {
  try {
    const agencyUserId = req.userId; 
    console.log("AgencID");
    console.log(agencyUserId);
    // Trova l'agenzia collegata a questo utente
    const agencyUserRelation = await prisma.agencyUser.findFirst({
      where: { userId: agencyUserId },
      include: { agency: true },
    });

    if (!agencyUserRelation) {
      return res.status(404).json({ message: "Agenzia non trovata" });
    }

    const agencyId = agencyUserRelation.agency.id;

    // Trova tutti gli agenti associati a questa agenzia
    const agents = await prisma.agencyUser.findMany({
      where: { agencyId: agencyId, role: "agent" },
      include: { user: true },
    });

    res.status(200).json({
      message: "Agenti ottenuti con successo",
      agents: agents.map((a) => ({
        id: a.user.id,
        email: a.user.email,
        username: a.user.username,
        avatar: a.user.avatar,
        createdAt: a.user.createdAt,
      })),
    });
  } catch (err) {
    console.error("Errore nell'ottenimento degli agenti:", err);
    res.status(500).json({ message: "Errore nell'ottenimento degli agenti" });
  }
};

export const getAdmins = async (req, res) => {
  try {
    // Trova tutti gli utenti con ruolo "admin"
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: "Admin ottenuti con successo",
      admins: admins,
    });
  } catch (err) {
    console.error("Errore nell'ottenimento degli admin:", err);
    res.status(500).json({ message: "Errore nell'ottenimento degli admin" });
  }
};

export const getAgencies = async (req, res) => {
  try {
    // Trova tutte le agenzie immobiliari
    const agencies = await prisma.realEstateAgency.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        website: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: "Agenzie ottenute con successo",
      agencies: agencies,
    });
  } catch (err) {
    console.error("Errore nell'ottenimento delle agenzie:", err);
    res.status(500).json({ message: "Errore nell'ottenimento delle agenzie" });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.user.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ message: "Amministratore eliminato con successo" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Errore nella cancellazione dell'amministratore" });
  }
};

export const deleteAgency = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Trova tutti gli ID degli utenti associati all'agenzia
    const agencyUsers = await prisma.agencyUser.findMany({
      where: { agencyId: id },
      select: { userId: true },
    });

    const userIds = agencyUsers.map((au) => au.userId);

    // Elimina le proprietà associate all'agenzia
    await prisma.property.deleteMany({
      where: { agencyId: id },
    });

    // Elimina i collegamenti tra utenti e l'agenzia
    await prisma.agencyUser.deleteMany({
      where: { agencyId: id },
    });

    // Elimina l'agenzia
    await prisma.realEstateAgency.delete({
      where: { id },
    });

    // Elimina gli utenti che erano associati all'agenzia **solo se non hanno altre relazioni**
    for (const userId of userIds) {
      const hasOtherRelations = await prisma.agencyUser.findFirst({
        where: { userId },
      });

      if (!hasOtherRelations) {
        await prisma.user.delete({
          where: { id: userId },
        });
      }
    }

    return res.status(200).json({ message: "Agenzia e utenti eliminati con successo" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore nella cancellazione dell'agenzia" });
  }
};


export const deleteAgent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Elimina prima gli immobili associati all'agente
    await prisma.property.deleteMany({
      where: { agentId: id },
    });

    // Rimuove i collegamenti tra l'agente e le agenzie
    await prisma.agencyUser.deleteMany({
      where: { userId: id },
    });

    // Elimina infine l'agente dal database
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Agente eliminato con successo" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore nella cancellazione dell'agente" });
  }
};

export const updateAgencyProfile = async (req, res) => {
  const { avatar } = req.body;
  console.log(avatar);
  const userId = req.userId;
  try {
    // Retrieve the agency associated with the user
    const agencyUser = await prisma.agencyUser.findFirst({
      where: { userId: userId },
      include: { agency: true },
    });

    // If no agency or agency user is found, return an error
    if (!agencyUser || !agencyUser.agency) {
      return res.status(404).json({ message: "Agency not found for this user" });
    }

    const agencyId = agencyUser.agency.id; // Get the agency ID from the associated agency

    // Update the avatar of the agency in the database
    const updatedAgency = await prisma.realEstateAgency.update({
      where: { id: agencyId }, // Use the agency ID
      data: { avatar: avatar }, // Set the new avatar URL
    });

    // Respond with the updated agency details
    res.status(200).json(updatedAgency);
  } catch (err) {
    console.error("Error updating agency:", err);
    res.status(500).json({ message: "Error updating agency profile" });
  }
};
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.userId; // Verifica che req.userId venga passato correttamente

  try {

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "La vecchia password è errata." });
    }

 
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    res.json({ success: true, message: "Password aggiornata con successo!" });

  } catch (error) {
    console.error(error); // Log per capire l'errore esatto
    return res.status(500).json({ message: "Errore interno del server.", error: error.message });
  }
};

export const saveProperty = async (req, res) => {
  const propertyId = req.body.propertyId;
  const userId = req.userId; 

  try {
    // Verifica se la proprietà è già salvata dall'utente
    const savedProperty = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    if (savedProperty) {
      // Se la proprietà è già salvata, la rimuovi (annullamento del salvataggio)
      await prisma.savedProperty.delete({
        where: {
          id: savedProperty.id,
        },
      });

      return res.status(200).json({ message: "Salvataggio immobile annullato." });
    } else {
      // Se la proprietà non è salvata, la salvi
      await prisma.savedProperty.create({
        data: {
          userId: userId,
          propertyId: propertyId,
        },
      });

      return res.status(200).json({ message: "Immobile salvato con successo." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore interno del server.", error: error.message });
  }
};


export const getSavedProperties = async (req, res) => {

  const userId = req.userId; 
  console.log("USer");
  console.log(userId);
  
  try {

    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Recupera le proprietà salvate con paginazione
    const savedProperties = await prisma.savedProperty.findMany({
      where: { userId },
      skip: (page - 1) * pageSize, // Salta gli elementi in base alla pagina corrente
      take: pageSize, // Limita il numero di risultati per pagina
      include: {
        property: true
      },
    });

    // Restituisci le proprietà salvate
    return res.status(200).json({ savedProperties: savedProperties.map(saved => saved.property) });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore nel recupero delle proprietà salvate" });
  }
};

export const getUploadedProperties = async (req, res) => {
  const userId = req.userId; 
  console.log(userId);
  console.log("AAA");
  
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Recupera le proprietà caricate dall'agente con paginazione
    const uploadedProperties = await prisma.property.findMany({
      where: { agentId: userId },
      skip: (page - 1) * pageSize, // Salta gli elementi in base alla pagina corrente
      take: pageSize, // Limita il numero di risultati per pagina
    });

    return res.status(200).json({ uploadedProperties });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore nel recupero delle proprietà caricate" });
  }
};
