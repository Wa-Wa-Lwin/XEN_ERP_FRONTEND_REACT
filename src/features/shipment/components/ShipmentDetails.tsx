import { useParams } from "react-router-dom";

const ShipmentDetails = () => {
   const { shipmentId } = useParams<{ shipmentId?: string }>();
  return (
    <div>
      <h1>ShipmentDetails</h1>
      <span>{shipmentId}</span>
    </div>
  )
}

export default ShipmentDetails