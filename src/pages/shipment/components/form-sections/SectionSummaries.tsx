import { Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentFormData } from '../../types/shipment-form.types';

interface SectionSummaryProps {
  onEdit: () => void;
}

export const BasicInfoSummary = ({ data, onEdit }: { data: ShipmentFormData } & SectionSummaryProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:box-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Basic Information</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
            </div>
            <div className="grid grid-cols gap-x-4 gap-y-1 text-sm">
              <div>
                <span className="text-gray-600">Scope: </span>
                <span className="font-medium">
                  {data.shipment_scope_type
                    ? data.shipment_scope_type.toLowerCase() === 'international'
                      ? 'International (Outside Thai)'
                      : data.shipment_scope_type.toLowerCase() === 'export'
                        ? 'International (Export)'
                        : data.shipment_scope_type.toLowerCase() === 'import'
                          ? 'International (Import)'
                          : data.shipment_scope_type.toLowerCase() === 'domestic'
                            ? 'Domestic'
                            : data.shipment_scope_type
                    : '-'}
                </span>

                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">Topic: </span>
                <span className="font-medium">
                  {data.topic || '-'} {data.topic === 'Others' && `(${data.other_topic})`} {data.topic === 'For Sales' && `(${data.sales_person})`}
                </span>
                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">Service: </span> 
                <span className="font-medium">
                  {
                    data.service_options.toLowerCase() === 'normal'    
                    ? 'Normal (Cheapest One)'                  
                    : 'Urgent (Choose Carrier Manually)'
                  }

                </span>
                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">PO Number: </span> <span className="font-medium">{data.po_number || '-'}</span>
                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">PO Date: </span> <span className="font-medium">{data.po_date || '-'}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Icon icon="solar:pen-linear" width={16} />}
            onPress={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const AddressesSummary = ({ data, onEdit }: { data: ShipmentFormData } & SectionSummaryProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:map-point-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Addresses</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">From: {data.ship_from_company_name || '-'}</p>
                <p className="text-gray-600">{data.ship_from_country}, {data.ship_from_city}, {data.ship_from_state} , {data.ship_from_postal_code},
                  {data.ship_from_street1 && `${data.ship_from_street1} ,`}
                  {data.ship_from_street2 && `${data.ship_from_street2} ,`}
                  {data.ship_from_street3 && `${data.ship_from_street3} ,`}
                </p>
                {/* ✅ Only render this paragraph if tax_id exists */}
                {data.ship_from_tax_id && (
                  <p className="text-gray-600">{data.ship_from_tax_id}</p>
                )}
                <p className="text-gray-600">
                  {data.ship_from_contact_name}, {data.ship_from_phone}, {data.ship_from_email}.
                </p>
              </div>
              <div>
                <p className="font-medium">To: {data.ship_to_company_name || '-'}</p>
                <p className="text-gray-600">{data.ship_to_country}, {data.ship_to_city}, {data.ship_to_state} , {data.ship_to_postal_code},
                  {data.ship_to_street1 && `${data.ship_to_street1} ,`}
                  {data.ship_to_street2 && `${data.ship_to_street2} ,`}
                  {data.ship_to_street3 && `${data.ship_to_street3} ,`}
                </p>
                {/* ✅ Only render this paragraph if tax_id exists */}
                {data.ship_to_tax_id && (
                  <p className="text-gray-600">{data.ship_to_tax_id}</p>
                )}
                <p className="text-gray-600">
                  {data.ship_to_contact_name}, {data.ship_to_phone}, {data.ship_to_email}.
                </p>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Icon icon="solar:pen-linear" width={16} />}
            onPress={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const PickupInfoSummary = ({ data, onEdit }: { data: ShipmentFormData } & SectionSummaryProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:calendar-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Pickup Information</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
            </div>
            <div className="grid grid-cols gap-x-4 gap-y-1 text-sm">
              <div>
                <span className="text-gray-600">Pickup Date: </span>
                <span className="font-medium">{data.pick_up_date ? new Date(data.pick_up_date).toLocaleDateString() : '-'}</span>
                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">Pickup Time: </span>
                <span className="font-medium">({data.pick_up_start_time} - {data.pick_up_end_time})</span>
                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">Expected Delivery Date: </span>
                <span className="font-medium">{data.due_date ? new Date(data.due_date).toLocaleDateString() : '-'}</span>
                <span className="text-gray-600"> | </span>
                <span className="text-gray-600">Instruction: </span>
                <span className="font-medium">{data.pick_up_instructions || ' - '}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Icon icon="solar:pen-linear" width={16} />}
            onPress={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const ParcelsSummary = ({ data, onEdit }: { data: ShipmentFormData } & SectionSummaryProps) => {
  const totalParcels = data.parcels?.length || 0;
  const totalItems = data.parcels?.reduce((sum, p) => sum + (p.parcel_items?.length || 0), 0) || 0;
  const totalWeight = data.parcels?.reduce((sum, p) => sum + (parseFloat(String(p.weight_value)) || 0), 0) || 0;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:box-minimalistic-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Parcels & Items</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              <div><span className="text-gray-600">Parcels:</span> <span className="font-medium">{totalParcels}</span></div>
              <div><span className="text-gray-600">Items:</span> <span className="font-medium">{totalItems}</span></div>
              <div><span className="text-gray-600">Total Weight:</span> <span className="font-medium">{totalWeight.toFixed(2)} kg</span></div>
            </div>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Icon icon="solar:pen-linear" width={16} />}
            onPress={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const RatesSummary = ({ data, selectedRateId, onEdit }: { data: ShipmentFormData; selectedRateId: string } & SectionSummaryProps) => {
  const selectedRate = data.rates?.find(r => r.unique_id === selectedRateId);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:dollar-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Shipping Rate</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
            </div>
            {selectedRate && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                <div><span className="text-gray-600">Carrier:</span> <span className="font-medium">{selectedRate.shipper_account_slug.toUpperCase() || '-'}</span></div>
                <div><span className="text-gray-600">Service:</span> <span className="font-medium">{selectedRate.shipper_account_description || '-'}</span></div>
                <div><span className="text-gray-600">Amount:</span> <span className="font-medium">{selectedRate.total_charge_amount} {selectedRate.charge_weight_value}</span></div>
                <div><span className="text-gray-600">Delivery:</span> <span className="font-medium">{selectedRate.delivery_date || '-'} days</span></div>
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Icon icon="solar:pen-linear" width={16} />}
            onPress={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
