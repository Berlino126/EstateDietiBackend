import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
const getBoundingCoordinates = (lat, lon, radius) => {
  const earthRadius = 6371; // Raggio della Terra in km
  const latDiff = (radius / earthRadius) * (180 / Math.PI);
  const lonDiff = (radius / earthRadius) * (180 / Math.PI) / Math.cos(lat * (Math.PI / 180));

  return {
    minLat: lat - latDiff,
    maxLat: lat + latDiff,
    minLon: lon - lonDiff,
    maxLon: lon + lonDiff,
  };
};
export const getProperties = async (req, res) => {
  const query = req.query;
  const page = parseInt(query.page) || 1; // Numero di pagina
  const limit = 10; // Numero di immobili per pagina
  const skip = (page - 1) * limit; // Offset per la query

  try {
    // Mappa delle classi energetiche
    const energyClasses = ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"];

    // Filtro per classe energetica (prende le classi migliori o uguali)
    let energyClassFilter = {};
    if (query.energyClass && energyClasses.includes(query.energyClass)) {
      energyClassFilter = { in: energyClasses.slice(0, energyClasses.indexOf(query.energyClass) + 1) };
    }

    // Determina il contratto (buy/rent)
    let contratto;
    if (query.contract === "buy") contratto = "buy";
    else if (query.contract === "rent") contratto = "rent";

    // Se latitudine, longitudine e raggio sono presenti, calcola i limiti geografici
    let locationFilter = {};
    if (query.latitude && query.longitude && query.radius) {
      const lat = parseFloat(query.latitude);
      const lon = parseFloat(query.longitude);
      const radius = parseFloat(query.radius);

      if (!isNaN(lat) && !isNaN(lon) && !isNaN(radius)) {
        const bounds = getBoundingCoordinates(lat, lon, radius);
        locationFilter = {
          latitude: { gte: bounds.minLat, lte: bounds.maxLat },
          longitude: { gte: bounds.minLon, lte: bounds.maxLon },
        };
      }
    }

    // Costruzione del filtro principale
    const filters = {
      ...(query.city && { city: query.city }),
      ...(contratto && { contract: contratto }),
      ...(query.minPrice && { price: { gte: parseInt(query.minPrice) } }),
      ...(query.maxPrice && { price: { lte: parseInt(query.maxPrice) } }),
      ...(query.rooms && { rooms: { gte: parseInt(query.rooms) } }),
      ...(query.bathroom && { bathroom: { gte: parseInt(query.bathroom) } }),
      ...(query.size && { propertyDetails: { size: { gte: parseInt(query.size) } } }),
      ...(query.floor && { propertyDetails: { floor: { gte: parseInt(query.floor) } } }),
      ...(query.heating && { propertyDetails: { heatingType: query.heating } }),
      ...(query.energyClass && { propertyDetails: { energyClass: energyClassFilter } }),
      ...locationFilter,
    };

    // Parametri booleani
    const booleanFilters = [
      "terrace",
      "balcony",
      "elevator",
      "furnished",
      "cellar",
      "pool",
      "garden",
      "garage",
      "airConditioning",
    ];
    booleanFilters.forEach((filter) => {
      if (query[filter] === "true") {
        filters.propertyDetails = {
          ...filters.propertyDetails,
          [filter]: true,
        };
      }
    });

    // Query al database con ordinamento per data di creazione (dal più recente)
    const properties = await prisma.property.findMany({
      where: filters,
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc", // Ordina dal più recente al più vecchio
      },
    });

    res.status(200).json(properties);
  } catch (err) {
    console.error("Errore durante il recupero degli immobili:", err);
    res.status(500).json({ message: "Non sono riuscito ad ottenere gli immobili" });
  }
};
export const getProperty = async (req, res) => {

  const id = parseInt(req.params.id, 10);
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyDetails: true,
        agency: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    let userId;
    const token = req.cookies.token_access; 
    if (!token){
      userId = null
    } else{

        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
          if (err){
            userId = null;
          } else{
            userId = payload.id
          }
        });
    }

    const saved = await prisma.savedProperty.findUnique({
      where:{
        userId_propertyId: {
          userId,
          propertyId: id,
        },
      }
    })

    res.status(200).json({...property, isSaved: saved ? true : false});
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Non sono riuscito ad ottenere l'immobile" });
  }
};
export const addProperty = async (req, res) => {
  console.log(req.body);
  const { agentId, propertyData, propertyDetails } = req.body;
  console.log(agentId);
  
  try {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: {
        agencyUsers: {
          select: {
            agencyId: true, // Recupera l'ID dell'agenzia associata all'agente
          },
        },
      },
    });
    const agencyId = agent.agencyUsers[0].agencyId;
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        agentId: agentId,
        agencyId: agencyId,
        propertyDetails: {
          create: propertyDetails,
        },
      },
    });
    res.status(200).json(newProperty);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Non sono riuscito ad aggiungere l'immobile" });
  }
};

export const updateProperty = async (req, res) => {
  //console.log(req.body);
  const id = parseInt(req.params.id, 10);  
  const {agentId, propertyData, propertyDetails} = req.body;
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyDetails: true,  // Includiamo anche i dettagli dell'immobile
      },
    });
    if (!property) {
      return res.status(404).json({ message: "Immobile non trovato" });
    }
    if (property.agentId !== agentId) {
      return res.status(403).json({ message: "Non autorizzato alla cancellazione" });
    }
    if (propertyDetails) {
      await prisma.propertyDetail.update({
        where: { propertyId: id },
        data: propertyDetails,
      });
    }
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: propertyData,
    });

    res.status(200).json(updatedProperty);

  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Non sono riuscito ad modificare l'immobile" });
  }
};
export const deleteProperty = async (req, res) => {
  const id = parseInt(req.params.id, 10);  // Otteniamo l'ID dell'immobile da cancellare
  const tokenUserId = req.userId;  // L'ID dell'utente che sta facendo la richiesta
  
  try {
    // Verifica se l'immobile esiste
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyDetails: true,  // Includiamo anche i dettagli dell'immobile
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Immobile non trovato" });
    }

    // Verifica se l'utente ha i permessi per eliminare l'immobile (deve essere l'agente)
    if (property.agentId !== tokenUserId) {
      return res.status(403).json({ message: "Non autorizzato alla cancellazione" });
    }

    // Se ci sono dettagli associati all'immobile, cancelliamoli prima di eliminare l'immobile
    if (property.propertyDetails) {
      await prisma.propertyDetail.delete({
        where: { propertyId: id },
      });
    }

    // Elimina l'immobile
    await prisma.property.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Immobile eliminato con successo" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Errore nella cancellazione dell'immobile" });
  }
};

