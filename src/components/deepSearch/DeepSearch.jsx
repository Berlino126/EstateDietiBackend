import React, { useState, useEffect } from "react";
import "./DeepSearch.scss";

function DeepSearch({ isOpen, onClose, onApplyFilters, savedFilters }) {
  const [filters, setFilters] = useState({
    rooms: "",
    bathroom: "",
    size: "",
    floor: "",
    heating: "",
    energyClass: "",
    terrace: false,
    balcony: false,
    elevator: false,
    furnished: false,
    cellar: false,
    pool: false,
    garden: false,
    garage: false,
    airConditioning: false,
  });
  // Quando la dialog viene aperta o savedFilters cambia, aggiorna lo stato locale
  useEffect(() => {
    if (savedFilters) {
      setFilters({
        rooms: savedFilters.rooms || "",
        bathroom: savedFilters.bathroom || "",
        size: savedFilters.size || "",
        floor: savedFilters.floor || "",
        heating: savedFilters.heating || "",
        energyClass: savedFilters.energyClass || "",
        terrace: savedFilters.terrace || false,
        balcony: savedFilters.balcony || false,
        elevator: savedFilters.elevator || false,
        furnished: savedFilters.furnished || false,
        cellar: savedFilters.cellar || false,
        pool: savedFilters.pool || false,
        garden: savedFilters.garden || false,
        garage: savedFilters.garage || false,
        airConditioning: savedFilters.airConditioning || false,
      });
    }
  }, [savedFilters, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="deep-search-overlay">
      <div className="deep-search-dialog">
        <h2>
          Ricerca Avanzata <b>Immobili</b>
        </h2>
        <div className="input-group">
          <label htmlFor="rooms">Numero di Locali</label>
          <input
            type="number"
            id="rooms"
            name="rooms"
            placeholder="Numero di Locali"
            onChange={handleChange}
            value={filters.rooms}
          />
        </div>

        <div className="input-group">
          <label htmlFor="bathroom">Numero di Bagni</label>
          <input
            type="number"
            id="bathroom"
            name="bathroom"
            placeholder="Numero di Bagni"
            onChange={handleChange}
            value={filters.bathroom}
          />
        </div>

        <div className="input-group">
          <label htmlFor="size">Metratura</label>
          <input
            type="number"
            id="size"
            name="size"
            placeholder="Metratura (m2)"
            onChange={handleChange}
            value={filters.size}
          />
        </div>

        <div className="input-group">
          <label htmlFor="floor">Piano</label>
          <select
            id="floor"
            name="floor"
            onChange={handleChange}
            value={filters.floor}
          >
            <option value="">Seleziona</option>
            <option value="terra">Terra</option>
            <option value="intermedio">Intermedio</option>
            <option value="ultimo">Ultimo</option>
          </select>
        </div>

        <label className="caratteristiche">Altre caratteristiche</label>
        <div className="checkbox-group">
          <label>
            <div className="text">
            <i className="fa fa-sun"></i>
            Terrazza
            </div>

            <input
              type="checkbox"
              name="terrace"
              onChange={handleChange}
              checked={filters.terrace}
            />

          </label>
          <label>
            <div className="text">
            <i className="fa fa-window-maximize"></i>
            Balcone
            </div>

            <input
              type="checkbox"
              name="balcony"
              onChange={handleChange}
              checked={filters.balcony}
            />

          </label>
          <label>
            <div className="text">
            <i className="fa fa-elevator"></i>
            Ascensore
            </div>

            <input
              type="checkbox"
              name="elevator"
              onChange={handleChange}
              checked={filters.elevator}
            />
            
          </label>
          <label>
            <div className="text">
            <i className="fa fa-couch"></i>
            Arredato
            </div>

            <input
              type="checkbox"
              name="furnished"
              onChange={handleChange}
              checked={filters.furnished}
            />
            
          </label>
          <label>
            <div className="text">
            <i className="fa fa-cogs"></i>
            Cantina
            </div>

            <input
              type="checkbox"
              name="cellar"
              onChange={handleChange}
              checked={filters.cellar}
            />
            
          </label>
          <label>
            <div className="text">
            <i className="fa fa-swimming-pool"></i>
            Piscina
            </div>

            <input
              type="checkbox"
              name="pool"
              onChange={handleChange}
              checked={filters.pool}
            />
            
          </label>
          <label>
            <div className="text">
            <i className="fa fa-leaf"></i>
            Giardino
            </div>

            <input
              type="checkbox"
              name="garden"
              onChange={handleChange}
              checked={filters.garden}
            />
            
          </label>
          <label>
            <div className="text">
            <i className="fa fa-car"></i>
            Garage
            </div>

            <input
              type="checkbox"
              name="garage"
              onChange={handleChange}
              checked={filters.garage}
            />
            
          </label>
          <label>
            <div className="text">
            <i className="fa fa-sun"></i>
            Aria Condizionata
            </div>

            <input
              type="checkbox"
              name="airConditioning"
              onChange={handleChange}
              checked={filters.airConditioning}
            />
            
          </label>
        </div>

        <div className="input-group">
          <label htmlFor="heating">Tipo di Riscaldamento</label>
          <select
            id="heating"
            name="heating"
            onChange={handleChange}
            value={filters.heating}
          >
            <option value="">Seleziona</option>
            <option value="centralizzato">Centralizzato</option>
            <option value="autonomo">Autonomo</option>
            <option value="inverter">Inverter</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="energyClass">Classe Energetica</label>
          <select
            id="energyClass"
            name="energyClass"
            onChange={handleChange}
            value={filters.energyClass}
          >
            <option value="">Seleziona</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="G">G</option>
          </select>
        </div>

        <div className="buttons">
          <button type="button" onClick={applyFilters}>
            Applica
          </button>
          <button type="button" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeepSearch;
