import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Divider } from '@heroui/react';
import type { ShipmentGETData } from './types';

interface ParcelsSectionProps {
  shipment: ShipmentGETData;
}

const ParcelsSection = ({ shipment }: ParcelsSectionProps) => {
  if (!shipment.parcels?.length) {
    return null;
  }

  return (
    <>
      <section>
        <h2 className="text-base font-semibold mb-0">
          Parcels ({shipment.parcels.length})
        </h2>
        <Table shadow="none" aria-label="Parcels Table">
          <TableHeader>
            <TableColumn>No.</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Box Type</TableColumn>
            <TableColumn>Dimensions LWH ({shipment.parcels[0].dimension_unit})</TableColumn>
            <TableColumn>Weight ({shipment.parcels[0].weight_unit})</TableColumn>
            <TableColumn>Items</TableColumn>
          </TableHeader>
          <TableBody>
            {shipment.parcels.map((parcel: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{parcel.description}</TableCell>
                <TableCell>{parcel.box_type_name || 'N/A'}</TableCell>
                <TableCell>{Math.floor(parseFloat(parcel.depth) || 0)} × {Math.floor(parseFloat(parcel.height) || 0)} × {Math.floor(parseFloat(parcel.width) || 0)}</TableCell>
                <TableCell>{parseFloat(parcel.weight_value) || 0}</TableCell>
                <TableCell>
                  {parcel.items?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {parcel.items.map((item: any, i: number) => (
                        <li key={i}>
                          <strong>Mat Code:</strong> {item.material_code || 'N/A'} | <strong>SKU:</strong> {item.sku || 'N/A'} | <strong>Description:</strong> {item.description} | <strong>Price:</strong> {parseFloat(item.price_amount) || 0} {item.price_currency} | <strong>Qty:</strong> {parseInt(item.quantity) || 1} pcs | <strong>Weight:</strong> {(parseFloat(item.weight_value) || 0).toFixed(5)} {item.weight_unit} | <strong>HS CODE:</strong> {item.hs_code || 'N/A'} | <strong>Origin:</strong> {item.origin_country}
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-gray-400">No items</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <hr />
      </section>
      <Divider />
    </>
  );
};

export default ParcelsSection;