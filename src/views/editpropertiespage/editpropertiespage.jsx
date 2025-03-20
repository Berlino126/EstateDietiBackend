import "./editpropertiespage.scss";
import { AuthContext } from "../../context/AuthContext";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageWidget from "../../components/imageWidget/imageWidget";
import axios from "axios";
import { useLocation } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
function EditProperties() {
  const location = useLocation();
  const property = location.state;
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [images, setImages] = useState(property ? property.images : []);
  const [error, setError] = useState("");
  const [value, setValue] = useState(
    property ? property.propertyDetails.description : ""
  );
  const [checkedDetails, setCheckedDetails] = useState({
    ascensore: property ? property.propertyDetails.elevator : false,
    terrazzo: property ? property.propertyDetails.terrace : false,
    balcone: property ? property.propertyDetails.balcony : false,
    arredamento: property ? property.propertyDetails.furnished : false,
    cantina: property ? property.propertyDetails.cellar : false,
    piscina: property ? property.propertyDetails.pool : false,
    giardino: property ? property.propertyDetails.garden : false,
    garage: property ? property.propertyDetails.garage : false,
    climatizzazione: property
      ? property.propertyDetails.airConditioning
      : false,
  });
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedDetails((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
  console.log(property);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    const propertyData = {
      title: inputs.title,
      price: parseFloat(inputs.price),
      address: inputs.address,
      city: inputs.city,
      rooms: parseInt(inputs.rooms),
      bathroom: parseInt(inputs.bathroom),
      type: inputs.type,
      contract: inputs.contract,
      latitude: parseFloat(inputs.latitude),
      longitude: parseFloat(inputs.longitude),
      images: images,
    }
     const propertyDetails = {
      description: value,
      size: parseInt(inputs.size),
      floor: inputs.piano,
      heatingType: inputs.heating,
      energyClass: inputs.energyClass,
      elevator: inputs.ascensore ? true : false,
      terrace: inputs.terrazzo ? true : false,
      balcony: inputs.balcone ? true : false,
      furnished: inputs.arredamento ? true : false,
      cellar: inputs.cantina ? true : false,
      pool: inputs.piscina ? true : false,
      garden: inputs.giardino ? true : false,
      garage: inputs.garage ? true : false,
      airConditioning: inputs.climatizzazione ? true : false,
    }
    const agentId = currentUser.id;
    try {
      if(!property){
      const res = await apiRequest.post(
        "/property",
        {
          propertyData,
          propertyDetails,
          agentId,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/" + res.data.id);
    } else {
      const res = await apiRequest.put(`/property/${property.id}`, 
        {
          propertyData,
          propertyDetails,
          agentId,
        },
        {
          withCredentials: true,
        }
      );
      
      navigate("/" + res.data.id);
    }
    } catch (error) {
      console.log(error);
      setError(error.message);
      window.alert(error.message);
    }
  };

  return (
    <div className="newPostPage">
      <div className="sideContainer">
        {images.map((image, index) => (
          <img src={image} key={index} alt="" />
        ))}
        <ImageWidget
          uwConfig={{
            multiple: true,
            cloudName: "dqmhaieiz",
            uploadPreset: "DietiEstate25",
            folder: "properties",
          }}
          setState={setImages}
        />
      </div>
      <div className="formContainer">
        <h1>Inserisci un nuovo immobile</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="title">Titolo</label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={property ? property.title : ""}
                required
                minLength={3}
              />
            </div>
            <div className="item">
              <label htmlFor="price">Prezzo(€)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={property ? property.price : ""}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="address">Indirizzo</label>

              <input
                id="address"
                name="address"
                type="text"
                defaultValue={property ? property.address : ""}
                required
                minLength={5}
              />
            </div>
            <div className="item description">
              <label htmlFor="desc">Descrizione</label>
              <ReactQuill
                theme="snow"
                onChange={setValue}
                value={value}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="city">Città</label>
              <input
                id="city"
                name="city"
                type="text"
                defaultValue={property ? property.city : ""}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="rooms">Locali</label>
              <input
                id="rooms"
                name="rooms"
                type="number"
                min={1}
                defaultValue={property ? property.rooms : ""}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="bathroom">Bagni</label>
              <input
                id="bathroom"
                name="bathroom"
                type="number"
                min={1}
                defaultValue={property ? property.bathroom : ""}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="latitude">Latitudine</label>
              <input
                id="latitude"
                name="latitude"
                type="text"
                defaultValue={property ? property.latitude : ""}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="longitude">Longitudine</label>
              <input
                id="longitude"
                name="longitude"
                type="text"
                defaultValue={property ? property.longitude : ""}
                required
              />
            </div>
            <div className="item">
              <label htmlFor="type">Tipologia di edificio</label>
              <select
                name="type"
                defaultValue={property ? property.type : ""}
                required
              >
                <option value="apartment">Appartamento</option>
                <option value="house">Casa</option>
                <option value="condo">Condominio</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="contract">Tipologia di contratto</label>
              <select
                name="contract"
                defaultValue={property ? property.contract : ""}
                required
              >
                <option value="rent">Affitto</option>
                <option value="buy">Compra</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="size">Metratura(sqm)</label>
              <input
                id="size"
                name="size"
                type="number"
                defaultValue={property ? property.propertyDetails.size : ""}
                min="1"
                required
              />
            </div>
            <div className="item">
              <label htmlFor="floor">Piano</label>
              <select
                name="piano"
                defaultValue={property ? property.propertyDetails.floor : ""}
                required
              >
                <option value="terra">Terra</option>
                <option value="intermedio">Intermedio</option>
                <option value="ultimo">Ultimo</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="heating">Tipo di Riscaldamento</label>
              <select
                id="heating"
                name="heating"
                efaultValue={property ? property.propertyDetails.heating : ""}
                required
              >
                <option value="centralizzato">Centralizzato</option>
                <option value="autonomo">Autonomo</option>
                <option value="inverter">Inverter</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="energyClass">Classe Energetica</label>
              <select
                id="energyClass"
                name="energyClass"
                defaultValue={
                  property ? property.propertyDetails.energyClass : ""
                }
                required
              >
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
            <div className="item"></div>
            <div className="dettagli">
              <h2>Dettagli extra</h2>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="ascensore"
                    checked={checkedDetails.ascensore}
                    onChange={handleCheckboxChange}
                  />
                  Ascensore
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="terrazzo"
                    checked={checkedDetails.terrazzo}
                    onChange={handleCheckboxChange}
                  />
                  Terrazzo
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="balcone"
                    checked={checkedDetails.balcone}
                    onChange={handleCheckboxChange}
                  />
                  Balcone
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="arredamento"
                    checked={checkedDetails.arredamento}
                    onChange={handleCheckboxChange}
                  />
                  Arredamento
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="cantina"
                    checked={checkedDetails.cantina}
                    onChange={handleCheckboxChange}
                  />
                  Cantina
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="piscina"
                    checked={checkedDetails.piscina}
                    onChange={handleCheckboxChange}
                  />
                  Piscina
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="giardino"
                    checked={checkedDetails.giardino}
                    onChange={handleCheckboxChange}
                  />
                  Giardino
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="garage"
                    checked={checkedDetails.garage}
                    onChange={handleCheckboxChange}
                  />
                  Garage
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="climatizzazione"
                    checked={checkedDetails.climatizzazione}
                    onChange={handleCheckboxChange}
                  />
                  Climatizzazione
                </label>
              </div>
              <button className="sendButton">Add</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProperties;
