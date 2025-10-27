import { Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentFormData, Rate } from '../../types/shipment-form.types';

interface SectionSummaryProps {
  onEdit: () => void;
}

export const BasicInfoSummary = ({ data, onEdit }: { data: ShipmentFormData } & SectionSummaryProps) => {
  return (
    <Card className="m-3">
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
    <Card className="m-3">
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
                  <br />
                  {data.ship_from_street1 && (
                    <>
                      <b>St 1 : </b>{data.ship_from_street1},<br />
                    </>
                  )}
                  {data.ship_from_street2 && (
                    <>
                      <b>St 2 : </b>{data.ship_from_street2},<br />
                    </>
                  )}
                  {data.ship_from_street3 && (
                    <>
                      <b>St 3 : </b>{data.ship_from_street3},<br />
                    </>
                  )}
                </p>
                {/* ✅ Only render this paragraph if tax_id exists */}
                {data.ship_from_tax_id && (
                  <p className="text-gray-600"><b>Tax ID : </b>{data.ship_from_tax_id}</p>
                )}
                {data.ship_from_eori_number && (
                  <p className="text-gray-600"><b>EORI : </b>{data.ship_from_eori_number}</p>
                )}
                <p className="text-gray-600">
                  <b>Contact : </b>{data.ship_from_contact_name}, {data.ship_from_phone}, {data.ship_from_email}.
                </p>
              </div>
              <div>
                <p className="font-medium">To: {data.ship_to_company_name || '-'}</p>
                <p className="text-gray-600">{data.ship_to_country}, {data.ship_to_city}, {data.ship_to_state} , {data.ship_to_postal_code},
                  <br />
                  {data.ship_to_street1 && (
                    <>
                      <b>St 1 : </b>{data.ship_to_street1},<br />
                    </>
                  )}
                  {data.ship_to_street2 && (
                    <>
                      <b>St 2 : </b>{data.ship_to_street2},<br />
                    </>
                  )}
                  {data.ship_to_street3 && (
                    <>
                      <b>St 3 : </b>{data.ship_to_street3},<br />
                    </>
                  )}
                </p>
                {data.ship_to_tax_id && (
                  <p className="text-gray-600"><b>Tax ID : </b>{data.ship_to_tax_id}</p>
                )}
                {data.ship_to_eori_number && (
                  <p className="text-gray-600"><b>EORI : </b>{data.ship_to_eori_number}</p>
                )}
                <p className="text-gray-600">
                  <b>Contact : </b>{data.ship_to_contact_name}, {data.ship_to_phone}, {data.ship_to_email}.
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
    <Card className="m-3">
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
    <Card className="m-3">
      <CardBody>
        <div className="flex-row justify-between items-start">
          <div className="flex justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:box-minimalistic-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Parcels & Items</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
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
          <div className="flex gap-4 text-sm mb-3">
            <div><span className="text-gray-600">Parcels:</span> <span className="font-medium">{totalParcels}</span></div>
            <div><span className="text-gray-600">Items:</span> <span className="font-medium">{totalItems}</span></div>
            <div><span className="text-gray-600">Total Weight:</span> <span className="font-medium">{totalWeight.toFixed(2)} kg</span></div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">Show full details</summary>
            <div className="mt-3">
              {data.parcels?.map((parcel, parcelIndex) => (
                <div key={parcelIndex} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    Parcel #{parcelIndex + 1}
                  </h4>
                  {/* <div className="flex gap-4 text-xs mb-3"> */}
                  <div className="grid gap-2 text-xs mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                      <span className="text-gray-600">Box Type: </span>
                      <span className="font-medium">{parcel.box_type_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Description: </span>
                      <span className="font-medium">{parcel.description || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dimensions: </span>
                      <span className="font-medium">
                        {parcel.width} × {parcel.height} × {parcel.depth} {parcel.dimension_unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Net Weight: </span>
                      <span className="font-medium">{parcel.net_weight_value || 0} {parcel.weight_unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Parcel Weight: </span>
                      <span className="font-medium">{parcel.parcel_weight_value || 0} {parcel.weight_unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Weight: </span>
                      <span className="font-medium">{parcel.weight_value} {parcel.weight_unit}</span>
                    </div>
                  </div>

                  {parcel.parcel_items && parcel.parcel_items.length > 0 && (
                    <div className="mt-2">
                      <h5 className="font-semibold text-xs text-gray-700 mb-2">
                        Items ({parcel.parcel_items.length})
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse border border-gray-300">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-2 py-1 text-left">#</th>
                              <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                              <th className="border border-gray-300 px-2 py-1 text-left">SKU</th>
                              <th className="border border-gray-300 px-2 py-1 text-center">Qty</th>
                              <th className="border border-gray-300 px-2 py-1 text-right">Price</th>
                              <th className="border border-gray-300 px-2 py-1 text-right">Weight</th>
                              <th className="border border-gray-300 px-2 py-1 text-center">Origin</th>
                              <th className="border border-gray-300 px-2 py-1 text-left">HS Code</th>
                              <th className="border border-gray-300 px-2 py-1 text-left">Material Code</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {parcel.parcel_items.map((item, itemIndex) => (
                              <tr key={itemIndex} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-2 py-1 text-gray-600">{itemIndex + 1}</td>
                                <td className="border border-gray-300 px-2 py-1 font-medium">{item.description || '-'}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.sku || '-'}</td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{item.quantity}</td>
                                <td className="border border-gray-300 px-2 py-1 text-right">
                                  {item.price_amount} {item.price_currency}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-right">
                                  {item.weight_value} {item.weight_unit}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-center">{item.origin_country || '-'}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.hs_code || '-'}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.material_code || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {parcel.parcel_items.some(item => item.return_reason) && (
                          <div className="mt-2 text-xs">
                            <p className="font-semibold text-gray-700">Return Reasons:</p>
                            {parcel.parcel_items.map((item, itemIndex) =>
                              item.return_reason && (
                                <p key={itemIndex} className="text-gray-600">
                                  Item #{itemIndex + 1}: {item.return_reason}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>

        </div>
      </CardBody>
    </Card>
  );
};

export const RatesSummary = ({ data, selectedRateId, previouslyChosenRate, onEdit }: { data: ShipmentFormData; selectedRateId: string; previouslyChosenRate?: Rate } & SectionSummaryProps) => {
  const selectedRate = data.rates?.find(r => r.unique_id === selectedRateId);

  return (
    <Card className="m-3">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:dollar-bold" width={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Shipping Rate</h3>
              <Icon icon="solar:check-circle-bold" width={20} className="text-green-600" />
            </div>

            {/* Show Selected Rate (when user recalculates) */}
            {selectedRate && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Rate:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm bg-green-50 p-3 rounded border border-green-200">
                  <div><span className="text-gray-600">Carrier:</span> <span className="font-medium">{selectedRate.shipper_account_slug.toUpperCase() || '-'}</span></div>
                  <div><span className="text-gray-600">Service:</span> <span className="font-medium">{selectedRate.shipper_account_description || '-'}</span></div>
                  <div><span className="text-gray-600">Amount:</span> <span className="font-medium">{selectedRate.total_charge_amount} {selectedRate.total_charge_currency}</span></div>
                  <div><span className="text-gray-600">Transit Time:</span> <span className="font-medium">{selectedRate.transit_time || '-'} days</span></div>
                </div>
              </div>
            )}

            {/* Show Previously Chosen Rate (in edit mode) */}
            {previouslyChosenRate && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Previously Chosen Rate:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm bg-blue-50 p-3 rounded border border-blue-200">
                  <div><span className="text-gray-600">Carrier:</span> <span className="font-medium">{previouslyChosenRate.shipper_account_slug.toUpperCase() || '-'}</span></div>
                  <div><span className="text-gray-600">Service:</span> <span className="font-medium">{previouslyChosenRate.shipper_account_description || '-'}</span></div>
                  <div><span className="text-gray-600">Amount:</span> <span className="font-medium">{previouslyChosenRate.total_charge_amount} {previouslyChosenRate.total_charge_currency}</span></div>
                  <div><span className="text-gray-600">Transit Time:</span> <span className="font-medium">{previouslyChosenRate.transit_time || '-'} days</span></div>
                </div>
              </div>
            )}

            {/* Fallback if no rates are available */}
            {!selectedRate && !previouslyChosenRate && (
              <div className="text-sm text-gray-500">No rate selected</div>
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
