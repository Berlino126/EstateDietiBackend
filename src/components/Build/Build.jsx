import { Link } from "react-router";
import "./Build.scss";
function Build({ item }) {
  console.log(item);
  return (
    <div className="build">
      <Link to={`/${item.id}`}className="imgContainer">
      <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
      <p className="prezzo">€{item.price}</p>
        <h2 className="title"><Link to={`/${item.id}`}>{item.title}</Link></h2>

        <p className="indirizzo">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <div className="bottom">
          <div className="caratteristiche">
          <div className="caratteristica">
          <i className="fa fa-bed"></i>
            <span>{item.rooms}</span>
          </div>
          <div className="caratteristica">
          <i className="fa fa-bath"></i>
            <span>{item.bathroom}</span>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default Build;
