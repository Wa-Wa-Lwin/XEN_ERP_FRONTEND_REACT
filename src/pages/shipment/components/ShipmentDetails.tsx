import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardBody, Spinner, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "@context/AuthContext";

const ShipmentDetails = () => {
  const { shipmentId } = useParams<{ shipmentId?: string }>();
  const [shipment, setShipment] = useState<any | null>(null); // using any for now until types are aligned
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { msLoginUser } = useAuth();

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!shipmentId) {
          throw new Error("Invalid shipment ID");
        }

        const baseUrl = import.meta.env.VITE_APP_GET_SHIPMENT_REQUEST_BY_ID;
        if (!baseUrl) {
          throw new Error("API URL for Shipment Details not configured");
        }

        const apiUrl = `${baseUrl}${shipmentId}`;
        const response = await axios.get(apiUrl);

        // ✅ unwrap shipment_request
        setShipment(response.data.shipment_request);
      } catch (err) {
        console.error("Error fetching shipment details:", err);
        setError(err instanceof Error ? err.message : "Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-danger">Error: {error}</p>
        <Link to="/shipment">
          <Button color="primary">Back to Shipments</Button>
        </Link>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <p>No details found for shipment ID {shipmentId}</p>
        <Link to="/shipment">
          <Button color="primary">Back to Shipments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-4">

      {/* General Info */}
      <Card className="mb-2">
        <CardBody>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">General Information</h2>
              <p><strong>ID:</strong> {shipment.shipmentRequestID}</p>
              <p><strong>Topic:</strong> {shipment.topic} ({shipment.po_number})</p>
              <p><strong>Status:</strong> {shipment.request_status}</p>
              <p><strong>Requestor:</strong> {shipment.created_user_name} ({shipment.created_user_mail})</p>
              <p><strong>Approver:</strong> {shipment.approver_user_name} ({shipment.approver_user_mail})</p>
              <p><strong>Remark:</strong> {shipment.remark}</p>
            </div>

            {/* Approve / Reject buttons */}
            {["requestor_requested", "logistic_updated"].includes(shipment.request_status) &&
              shipment.approver_user_mail == msLoginUser?.email && (
                <div className="flex flex-row gap-2 ml-4">
                  {/* <Button color="success" size="sm" onPress={() => handleApprove(shipment.shipmentRequestID)}> */}
                  <Button color="success" size="md">
                    Approve
                  </Button>
                  {/* <Button color="danger" size="sm" onPress={() => handleReject(shipment.shipmentRequestID)}> */}
                  <Button color="danger" size="md">
                    Reject
                  </Button>
                </div>
              )}
          </div>
        </CardBody>
      </Card>

      {/* Ship From / Ship To */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold">Ship From</h2>
            <p><strong>Company:</strong> {shipment.ship_from?.company_name}</p>
            <p><strong>Address:</strong> {shipment.ship_from?.street1}, {shipment.ship_from?.city}, {shipment.ship_from?.country}</p>
            <p><strong>Contact:</strong> {shipment.ship_from?.contact_name} ({shipment.ship_from?.phone})</p>
            <p>{shipment.ship_from?.email}</p>

          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold">Ship To</h2>
            <p><strong>Company:</strong> {shipment.ship_to?.company_name}</p>
            <p><strong>Address:</strong> {shipment.ship_to?.street1}, {shipment.ship_to?.city}, {shipment.ship_to?.country}</p>
            <p><strong>Contact:</strong> {shipment.ship_to?.contact_name} ({shipment.ship_to?.phone})</p>
            <p>{shipment.ship_to?.email}</p>
          </CardBody>
        </Card>
      </div>

      {/* Rates */}
      {shipment.rates && shipment.rates.length > 0 && (
        <Card className="mt-2">
          <CardBody className="m-0">
            <h2 className="text-lg font-semibold">Rates</h2>
            <Table
              aria-label="Rates Table"
              shadow="none"
              className="min-w-full m-0 p-0"
            >
              <TableHeader>
                <TableColumn>No.</TableColumn>
                <TableColumn>Carrier</TableColumn>
                <TableColumn>Service</TableColumn>
                <TableColumn>Transit Time</TableColumn>
                <TableColumn>Cost</TableColumn>
                <TableColumn>Chosen</TableColumn>
              </TableHeader>

              <TableBody emptyContent="No rates available">
                {shipment.rates.map((rate: any, idx: number) => (
                  <TableRow
                    key={idx}
                    className={rate.chosen == true ? "bg-green-50" : ""}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{rate.shipper_account_description}</TableCell>
                    <TableCell>{rate.service_name}</TableCell>
                    <TableCell>{rate.transit_time} days</TableCell>
                    <TableCell>
                      {rate.total_charge_amount} {rate.total_charge_currency}
                    </TableCell>
                    <TableCell>
                      {rate.chosen == 1 && (
                        <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Parcels */}
      {shipment.parcels && shipment.parcels.length > 0 && (
        <Card className="mt-2">
          <CardBody className="m-0">
            <h2 className="text-lg font-semibold">Parcels ({shipment.parcels.length})</h2>
            <Table
              aria-label="Parcels Table"
              shadow="none"
              className="min-w-full"
            >
              <TableHeader>
                <TableColumn>No.</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>
                  Dimensions ({shipment.parcels[0].dimension_unit})
                </TableColumn>
                <TableColumn>
                  Weight ({shipment.parcels[0].weight_unit})
                </TableColumn>
                <TableColumn>Items</TableColumn>
              </TableHeader>

              <TableBody emptyContent="No parcels available">
                {shipment.parcels.map((parcel: any, idx: number) => (
                  <TableRow key={idx} className="border-b border-gray-300">
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{parcel.description}</TableCell>
                    <TableCell>
                      {parcel.width} × {parcel.height} × {parcel.depth}
                    </TableCell>
                    <TableCell>{parcel.weight_value}</TableCell>
                    <TableCell>
                      {parcel.items && parcel.items.length > 0 ? (
                        <ol className="list-decimal list-inside space-y-1">
                          {parcel.items.map((item: any, i: number) => (
                            <li key={i}>
                              {item.description} – {item.quantity} pcs,{" "}
                              {item.weight_value} {item.weight_unit}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <span className="text-gray-400">No items</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

    </div>
  );
};

export default ShipmentDetails;
