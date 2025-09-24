import DetailRow from './DetailRow';
import type { ShipmentGETData } from './types';

interface AddressInformationProps {
  shipment: ShipmentGETData;
}

const AddressInformation = ({ shipment }: AddressInformationProps) => {
  return (
    <section className="grid md:grid-cols-3 gap-6">
      <div className="space-y-0">
        <h2 className="text-base font-semibold">Ship From</h2>
        <DetailRow label="Company" value={shipment.ship_from?.company_name} />
        <DetailRow label="Address" value={`${shipment.ship_from?.street1}, ${shipment.ship_from?.city}, ${shipment.ship_from?.country}`} />
        <DetailRow label="Contact" value={`${shipment.ship_from?.contact_name} (${shipment.ship_from?.phone})`} />
        <DetailRow label="Email" value={shipment.ship_from?.email} />
      </div>
      <div className="space-y-0">
        <h2 className="text-base font-semibold">Ship To</h2>
        <DetailRow label="Company" value={shipment.ship_to?.company_name} />
        <DetailRow label="Address" value={`${shipment.ship_to?.street1}, ${shipment.ship_to?.city}, ${shipment.ship_to?.country}`} />
        <DetailRow label="Contact" value={`${shipment.ship_to?.contact_name} (${shipment.ship_to?.phone})`} />
        <DetailRow label="Email" value={shipment.ship_to?.email} />
      </div>
    </section>
  );
};

export default AddressInformation;