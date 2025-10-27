import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import DetailRow from './DetailRow';
import type { ShipmentGETData } from './types';

interface AddressInformationProps {
  shipment: ShipmentGETData;
}

const AddressInformation = ({ shipment }: AddressInformationProps) => {
  // European countries that require EORI number
  const europeanCountries = [
    'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA',
    'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD',
    'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE', 'GBR', 'NOR', 'ISL', 'CHE'
  ];

  const isShipFromEuropean = shipment.ship_from?.country && europeanCountries.includes(shipment.ship_from.country);
  const isShipToEuropean = shipment.ship_to?.country && europeanCountries.includes(shipment.ship_to.country);

  return (
    <Card className="m-3">
      <CardBody>
        <div className="flex items-center gap-2 mb-4">
          <Icon icon="solar:map-point-bold" width={24} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900 text-lg">Addresses</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 text-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Ship From</h4>
            <DetailRow label="Company" value={shipment.ship_from?.company_name || '-'} />
            <DetailRow label="Street 1" value={shipment.ship_from?.street1 || '-'} />
            {shipment.ship_from?.street2 && <DetailRow label="Street 2" value={shipment.ship_from.street2} />}
            {shipment.ship_from?.street3 && <DetailRow label="Street 3" value={shipment.ship_from.street3} />}
            <DetailRow label="City" value={shipment.ship_from?.city || '-'} />
            <DetailRow label="Country" value={shipment.ship_from?.country || '-'} />
            <DetailRow label="State" value={shipment.ship_from?.state || '-'} />
            <DetailRow label="Postal Code" value={shipment.ship_from?.postal_code || '-'} />
            <DetailRow label="TaxID" value={shipment.ship_from?.tax_id || '-'} />
            {isShipFromEuropean && <DetailRow label="EORI Number" value={shipment.ship_from?.eori_number || '-'} />}
            <DetailRow label="Contact" value={`${shipment.ship_from?.contact_name} (${shipment.ship_from?.phone || '-'})`} />
            <DetailRow label="Email" value={shipment.ship_from?.email || '-'} />
          </div>
          <div className="space-y-1 text-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Ship To</h4>
            <DetailRow label="Company" value={shipment.ship_to?.company_name || '-'} />
            <DetailRow label="Street 1" value={shipment.ship_to?.street1 || '-'} />
            {shipment.ship_to?.street2 && <DetailRow label="Street 2" value={shipment.ship_to.street2} />}
            {shipment.ship_to?.street3 && <DetailRow label="Street 3" value={shipment.ship_to.street3} />}
            <DetailRow label="City" value={shipment.ship_to?.city || '-'} />
            <DetailRow label="Country" value={shipment.ship_to?.country || '-'} />
            <DetailRow label="State" value={shipment.ship_to?.state || '-'} />
            <DetailRow label="Postal Code" value={shipment.ship_to?.postal_code || '-'} />
            <DetailRow label="TaxID" value={shipment.ship_to?.tax_id || '-'} />
            {isShipToEuropean && <DetailRow label="EORI Number" value={shipment.ship_to?.eori_number || '-'} />}
            <DetailRow label="Contact" value={`${shipment.ship_to?.contact_name} (${shipment.ship_to?.phone || '-'})`} />
            <DetailRow label="Email" value={shipment.ship_to?.email || '-'} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AddressInformation;