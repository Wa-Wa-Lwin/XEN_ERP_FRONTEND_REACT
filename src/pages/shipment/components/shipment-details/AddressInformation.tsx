import DetailRow from './DetailRow';
import type { ShipmentGETData } from './types';

interface AddressInformationProps {
  shipment: ShipmentGETData;
}

const AddressInformation = ({ shipment }: AddressInformationProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2  gap-6">
      <div className="space-y-0 border-r border-gray-200 pr-4">
        <h2 className="text-base font-semibold">Ship From</h2>
        <DetailRow label="Company" value={shipment.ship_from?.company_name} />
        <DetailRow label="Street 1"  value={shipment.ship_from?.street1} />
        <DetailRow label="Street 2"  value={shipment.ship_from?.street2} />
        <DetailRow label="Street 3"  value={shipment.ship_from?.street3} />
        <DetailRow label="City"  value={shipment.ship_from?.city} />
        <DetailRow label="Country"  value={shipment.ship_from?.country} />
        <DetailRow label="State"  value={shipment.ship_from?.state} />
        <DetailRow label="Postal Code"  value={shipment.ship_from?.postal_code} />
        <DetailRow label="TaxID"  value={shipment.ship_from?.tax_id} />
        <DetailRow label="EORI Number"  value={shipment.ship_from?.eori_number} />
        <DetailRow label="Contact" value={`${shipment.ship_from?.contact_name} (${shipment.ship_from?.phone})`} />
        <DetailRow label="Email" value={shipment.ship_from?.email} />
      </div>
      <div className="space-y-0">
        <h2 className="text-base font-semibold">Ship To</h2>
        <DetailRow label="Company" value={shipment.ship_to?.company_name} />
        <DetailRow label="Street 1"  value={shipment.ship_to?.street1} />
        <DetailRow label="Street 2"  value={shipment.ship_to?.street2} />
        <DetailRow label="Street 3"  value={shipment.ship_to?.street3} />
        <DetailRow label="City"  value={shipment.ship_to?.city} />
        <DetailRow label="Country"  value={shipment.ship_to?.country} />
        <DetailRow label="State"  value={shipment.ship_to?.state} />
        <DetailRow label="Postal Code"  value={shipment.ship_to?.postal_code} />
        <DetailRow label="TaxID"  value={shipment.ship_to?.tax_id} />
        <DetailRow label="EORI Number"  value={shipment.ship_to?.eori_number} />
        <DetailRow label="Contact" value={`${shipment.ship_to?.contact_name} (${shipment.ship_to?.phone})`} />
        <DetailRow label="Email" value={shipment.ship_to?.email} />
      </div>
    </section>
  );
};

export default AddressInformation;