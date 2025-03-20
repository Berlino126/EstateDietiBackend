import './list.scss'
import Build from '../Build/Build'
import {listData} from '../../lib/dummydata'
function List({properties}){
    return (
        <div className="list">
            {properties.map(item=>(
                <Build key = {item.id} item ={item}></Build>
            ))}
        </div>
    )
}
export default List;