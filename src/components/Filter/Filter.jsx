import React, { useState } from "react";
import "./Filter.scss";
import DeepSearch from "../deepSearch/DeepSearch";
import { useSearchParams } from "react-router";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const priceOptionsBuy = [
    50000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000,
    500000,
  ]; // Compra
  const priceOptionsRent = [200, 500, 1000, 2000, 3000, 5000]; // Affitta
  const raggioOptions = [5, 10, 25, 50, 100, 200, 500];

  const [query, setQuery] = useState({
    contract: searchParams.get("contract") || "",
    city: searchParams.get("city") || "",
    minPrice: parseInt(searchParams.get("minPrice")) || "",
    maxPrice: parseInt(searchParams.get("maxPrice")) || "",
    radius: parseInt(searchParams.get("radius")) || "",
  });

  const [advancedFilters, setAdvancedFilters] = useState(() => {
    return JSON.parse(localStorage.getItem("advancedFilters")) || {};
  });
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const openDeepSearch = () => {
    setIsDeepSearchOpen(true);
  };

  const closeDeepSearch = () => {
    setIsDeepSearchOpen(false);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setQuery({ ...query, [name]: value });

    if (name === "city" && value.length > 2) {
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
    setQuery((prev) => ({ ...prev, city: city }));
    setSuggestions([]);
  };

  const getCityCoordinates = async (cityName) => {
    if (!cityName) return {};

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${cityName}&countrycodes=IT&format=json&limit=1`
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

  const handleFilter = async (e) => {
    e.preventDefault(); // Previeni l'invio predefinito del form

    if (!query.city) {
      alert("Inserisci una città per procedere con la ricerca.");
      return;
    }

    const coordinates = await getCityCoordinates(query.city);

    setQuery((prev) => ({
      ...prev,
      ...coordinates, // Aggiunge latitude e longitude alla query
    }));

    console.log(query);
    console.log(coordinates);
    setSearchParams({ ...query, ...coordinates, ...advancedFilters });
  };

  const applyFilters = (filters) => {
    setAdvancedFilters(filters);
    localStorage.setItem("advancedFilters", JSON.stringify(filters));
    setSearchParams({ ...query, ...filters }); // Applica i filtri subito
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value ? parseInt(value) : "";

    if (name === "minPrice" && numericValue > query.maxPrice && query.maxPrice !== "") {
      alert("Il prezzo minimo non può essere maggiore del prezzo massimo");
      return;
    }
    if (name === "maxPrice" && numericValue < query.minPrice && query.minPrice !== "") {
      alert("Il prezzo massimo non può essere minore del prezzo minimo");
      return;
    }

    setQuery((prev) => ({ ...prev, [name]: numericValue }));
  };

  const resetFilters = () => {
    setQuery({
      contract: query.contract,
      city: query.city,
      minPrice: "",
      maxPrice: "",
      radius: query.radius,
    });
    setAdvancedFilters({});
    localStorage.removeItem("advancedFilters");
    setSearchParams({ contract: query.contract, city: query.city, radius: query.radius });
  };

  const priceOptions = query.contract === "buy" ? priceOptionsBuy : priceOptionsRent;

  return (
    <div className="filter">
      <div className="title">
        <h1>
          Risultati per <b>{searchParams.get("city")}</b>
        </h1>
      </div>

      <form onSubmit={handleFilter}>
        <div className="top">
          <div className="item">
            <label htmlFor="Città">Posizione</label>
            <div className="city-container">
              <input
                className="posizione"
                type="text"
                id="città"
                name="city"
                placeholder="Posizione Città"
                onChange={handleChange}
                value={query.city}
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
          </div>
        </div>

        <div className="bottom">
          <div className="item">
            <label htmlFor="radius">Raggio di ricerca (km)</label>
            <select
              name="radius"
              id="radius"
              value={query.radius}
              onChange={handleChange}
            >
              <option value="">Dal centro</option>
              {raggioOptions.map((raggio) => (
                <option key={raggio} value={raggio}>
                  {raggio} km
                </option>
              ))}
            </select>
          </div>
          <div className="item">
            <label htmlFor="Contratto">Contratto</label>
            <select
              name="contract"
              id="Contratto"
              onChange={handleChange}
              value={query.contract}
            >
              <option value="">Indeciso?</option>
              <option value="buy">Compra</option>
              <option value="rent">Affitta</option>
            </select>
          </div>
          <div className="item">
            <label htmlFor="PrezzoMin">Prezzo Minimo</label>
            <select
              name="minPrice"
              id="PrezzoMin"
              onChange={handlePriceChange}
              value={query.minPrice}
            >
              <option value="">Seleziona</option>
              {priceOptions.map((price) => (
                <option key={price} value={price}>
                  {price.toLocaleString()}€
                </option>
              ))}
            </select>
          </div>
          <div className="item">
            <label htmlFor="PrezzoMax">Prezzo Massimo</label>
            <select
              name="maxPrice"
              id="PrezzoMax"
              onChange={handlePriceChange}
              value={query.maxPrice}
            >
              <option value="">Seleziona</option>
              {priceOptions.map((price) => (
                <option key={price} value={price}>
                  {price.toLocaleString()}€
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filerButtons">
          <div className="advance">
            <button type="button" onClick={openDeepSearch}>
              Ricerca Avanzata
            </button>
            <button type="button" onClick={resetFilters}>
              Reset Filtri
            </button>
          </div>

          <button type="submit">
            <img src="/search.png" alt="Search" />
          </button>
        </div>
      </form>

      <DeepSearch
        isOpen={isDeepSearchOpen}
        onClose={closeDeepSearch}
        onApplyFilters={applyFilters}
        savedFilters={advancedFilters}
      />
    </div>
  );
}

export default Filter;