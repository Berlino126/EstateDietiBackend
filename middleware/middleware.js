import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token_access;
  console.log(token);
  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" });
    console.log(payload.id);
    req.userId = payload.id;
    next();
  });
};

export const isRealEstateAgent = (req, res, next) => {
  const token = req.cookies.token_access;
  console.log(token);
  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json("Token non valido");

    // Controllo che l'utente sia giornalista
    if (payload.role !== "agent"){
      if (payload.role !== "agency")
      {
        return res
        .status(403)
        .json("Accesso negato: funzionalità permessa solo agli agenti@ç");
      }

    }

    // Aggiungi i dati dell'utente alla richiesta per usarli nei middleware successivi
    console.log(payload.id);
    req.userId = payload.id;
    next();
  });
};
export const isRealEstateAgency = (req, res, next) => {
    const token = req.cookies.token_access;
    console.log(token);
    if (!token) return res.status(401).json({ message: "Not Authenticated!" });
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) return res.status(403).json("Token non valido");
  
      // Controllo che l'utente sia giornalista
      if (payload.role !== "agency")
        return res
          .status(403)
          .json("Accesso negato: funzionalità permessa solo ai giornalisti");
      // Aggiungi i dati dell'utente alla richiesta per usarli nei middleware successivi
      console.log("Payload:id");
      console.log(payload.id);
      req.userId = payload.id;
      next();
    });
  };
  export const isRealEstateAdmin = (req, res, next) => {
    console.log("AAAA");
    const token = req.cookies.token_access;
    console.log(token);
    if (!token) return res.status(401).json({ message: "Not Authenticated!" });
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) return res.status(403).json("Token non valido");
  
      // Controllo che l'utente sia giornalista
      if (payload.role !== "admin")
        return res
          .status(403)
          .json("Accesso negato: funzionalità permessa solo ai giornalisti");
      // Aggiungi i dati dell'utente alla richiesta per usarli nei middleware successivi
      console.log(payload.id);
      req.userId = payload.id;
      next();
    });
  };