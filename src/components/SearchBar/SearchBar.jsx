import { useState } from "react";
import "./stile.scss";
import { useNavigate } from "react-router-dom";

const contract = ["Compra", "Affitta"];

// Opzioni di prezzo per compra e affitta
const priceOptionsBuy = [
  50000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000,
]; // Compra
const priceOptionsRent = [200, 500, 1000, 2000, 3000, 5000]; // Affitta

function SearchBar() {
  const [query, setQuery] = useState({
    contract: "Compra", // Tipo di contratto predefinito
    location: "",
    minPrice: "", // Lasciato vuoto per nessun filtro di prezzo
    maxPrice: "", // Lasciato vuoto per nessun filtro di prezzo
  });

  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const switchType = (val) => {
    setQuery((prev) => ({ ...prev, contract: val }));
  };

  const getCityCoordinates = async (location) => {
    if (!location) return {};

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${location}&countrycodes=IT&format=json&limit=1`
      );
      const data = await res.json();

      if (data.length > 0) {
        return { latitude: data[0].lat, longitude: data[0].lon };
      }
    } catch (error) {
      console.error("Errore nel recupero delle coordinate:", error);
    }

    return {}; // Se la ricerca fallisce, non modifica la query
  };

  const handleSearch = async (event) => {
    event.preventDefault(); // Previeni l'invio predefinito del form

    if (!query.location) {
      alert("Inserisci una città per procedere con la ricerca.");
      return;
    }

    console.log("Città selezionata:", query.location);

    const { latitude, longitude } = await getCityCoordinates(query.location);
    console.log("Coordinate:", latitude, longitude);

    navigate(
      `/list?contract=${query.contract === "Compra" ? "buy" : "rent"}&city=${
        query.location
      }&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}&latitude=${latitude || ""}&longitude=${longitude || ""}`
    );
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setQuery((prev) => ({ ...prev, [name]: value }));

    if (name === "location" && value.length > 2) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${value}&countrycodes=IT&format=json`
        );
        const data = await res.json();

        const cities = [...new Set(data.map((place) => place.name))];

        setSuggestions(cities);
      } catch (error) {
        console.error("Errore nel recupero delle città:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (city) => {
    setQuery((prev) => ({ ...prev, location: city }));
    setSuggestions([]);
  };

  const verifyPrice = (minPrice, maxPrice) => {
    if (minPrice !== "" && maxPrice !== "" && minPrice > maxPrice) {
      alert("Il prezzo minimo non può essere maggiore del prezzo massimo");
      return false;
    }
    if (maxPrice !== "" && minPrice !== "" && maxPrice < minPrice) {
      alert("Il prezzo massimo non può essere minore del prezzo minimo");
      return false;
    }
    return true;
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value ? parseInt(value) : "";

    const updatedQuery = { ...query, [name]: numericValue };

    if (!verifyPrice(updatedQuery.minPrice, updatedQuery.maxPrice)) {
      return;
    }

    setQuery(updatedQuery);
  };

  const priceOptions =
    query.contract === "Compra" ? priceOptionsBuy : priceOptionsRent;

  return (
    <div className="searchBar">
      <div className="type">
        {contract.map((t) => (
          <button
            key={t}
            onClick={() => switchType(t)}
            className={query.contract === t ? "active" : ""}
          >
            {t}
          </button>
        ))}
      </div>
      <form onSubmit={handleSearch}>
        <div className="city-container">
          <input
            type="text"
            name="location"
            placeholder="Città"
            className="cityinput"
            value={query.location}
            onChange={handleChange}
            required
          />
          {suggestions.length > 0 && (
            <ul className="autocomplete-list">
              {suggestions.map((city, index) => (
                <li key={index} onClick={() => handleSelectSuggestion(city)}>
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="price">
          <select
            name="minPrice"
            value={query.minPrice}
            onChange={handlePriceChange}
          >
            <option value="">Prezzo minimo</option>
            {priceOptions.map((price) => (
              <option key={price} value={price}>
                {price.toLocaleString()}€
              </option>
            ))}
          </select>

          <select
            name="maxPrice"
            value={query.maxPrice}
            onChange={handlePriceChange}
          >
            <option value="">Prezzo massimo</option>
            {priceOptions.map((price) => (
              <option key={price} value={price}>
                {price.toLocaleString()}€
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="cerca">
          <img src="/search.png" alt="" />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;