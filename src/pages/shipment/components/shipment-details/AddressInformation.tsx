import { Card} from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentGETData } from './types';

interface AddressInformationProps {
  shipment: ShipmentGETData;
}

const AddressInformation = ({ shipment }: AddressInformationProps) => {

  return (
    <Card className="m-3 p-3 rounded-none shadow-light">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:map-point-bold" width={20} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900">Addresses</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">From: {shipment.ship_from?.company_name || '-'}</p>
              <p className="text-gray-600">{shipment.ship_from?.country}, {shipment.ship_from?.city}, {shipment.ship_from?.state} , {shipment.ship_from?.postal_code},
                <br />
                {shipment.ship_from?.street1 && (
                  <>
                    <b>St 1 : </b>{shipment.ship_from?.street1},<br />
                  </>
                )}
                {shipment.ship_from?.street2 && (
                  <>
                    <b>St 2 : </b>{shipment.ship_from?.street2},<br />
                  </>
                )}
                {shipment.ship_from?.street3 && (
                  <>
                    <b>St 3 : </b>{shipment.ship_from?.street3},<br />
                  </>
                )}
              </p>
              {/* ✅ Only render this paragraph if tax_id exists */}
              {shipment.ship_from?.tax_id && (
                <p className="text-gray-600"><b>Tax ID : </b>{shipment.ship_from?.tax_id}</p>
              )}
              {shipment.ship_from?.eori_number && (
                <p className="text-gray-600"><b>EORI : </b>{shipment.ship_from?.eori_number}</p>
              )}
              <p className="text-gray-600">
                <b>Contact : </b>{shipment.ship_from?.contact_name}, {shipment.ship_from?.phone}, {shipment.ship_from?.email}.
              </p>
            </div>
            <div>
              <p className="font-medium">To: {shipment.ship_to?.company_name || '-'}</p>
              <p className="text-gray-600">{shipment.ship_to?.country}, {shipment.ship_to?.city}, {shipment.ship_to?.state} , {shipment.ship_to?.postal_code},
                <br />
                {shipment.ship_to?.street1 && (
                  <>
                    <b>St 1 : </b>{shipment.ship_to?.street1},<br />
                  </>
                )}
                {shipment.ship_to?.street2 && (
                  <>
                    <b>St 2 : </b>{shipment.ship_to?.street2},<br />
                  </>
                )}
                {shipment.ship_to?.street3 && (
                  <>
                    <b>St 3 : </b>{shipment.ship_to?.street3},<br />
                  </>
                )}
              </p>
              {shipment.ship_to?.tax_id && (
                <p className="text-gray-600"><b>Tax ID : </b>{shipment.ship_to?.tax_id}</p>
              )}
              {shipment.ship_to?.eori_number && (
                <p className="text-gray-600"><b>EORI : </b>{shipment.ship_to?.eori_number}</p>
              )}
              <p className="text-gray-600">
                <b>Contact : </b>{shipment.ship_to?.contact_name}, {shipment.ship_to?.phone}, {shipment.ship_to?.email}.
              </p>
            </div>
          </div>
        </div>        
      </div>
    </Card>
  );
};

export default AddressInformation;