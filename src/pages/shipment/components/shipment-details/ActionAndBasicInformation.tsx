import { Button, Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import type { ShipmentGETData } from './types';
import { formatDateTime } from './utils';

interface ActionAndBasicInformationProps {
  shipment: ShipmentGETData;
  msLoginUser?: any;
  onDuplicateShipment?: () => void;
}

const ActionAndBasicInformation = ({
  shipment,
  msLoginUser,
  onDuplicateShipment,
}: ActionAndBasicInformationProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit =
    (user?.logisticRole === "1" &&
      shipment.request_status !== "approver_approved" &&
      shipment.request_status !== "approver_rejected") ||
    (shipment.approver_user_mail?.toLowerCase() === msLoginUser?.mail?.toLowerCase() &&
      shipment.request_status !== "approver_approved" &&
      shipment.request_status !== "approver_rejected");

  return (
    <>
      {/* Action Section */}
      <Card className="m-3 p-3 rounded-none shadow-light">
        <div className="flex-1 flex items-center gap-2">
          <Icon icon="solar:box-bold" width={20} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900">Action</h3>
          {canEdit && (
            <Button
              color="primary"
              size="sm"
              variant="bordered"
              startContent={<Icon icon="solar:pen-bold" />}
              onPress={() => navigate(`/shipment/edit/${shipment.shipmentRequestID}`)}
            >
              Edit
            </Button>
          )}
          {(msLoginUser?.email === 'wawa@xenoptics.com' ||
            msLoginUser?.email === 'susu@xenoptics.com' ||
            msLoginUser?.email === 'thinzar@xenoptics.com') &&
            onDuplicateShipment && (
              <Button
                color="secondary"
                size="sm"
                variant="bordered"
                startContent={<Icon icon="solar:copy-bold" />}
                onPress={onDuplicateShipment}
              >
                Developer Only: Duplicate Shipment Request
              </Button>
            )}
        </div>
      </Card>

      {/* Basic Information Section */}
      <Card className="m-3 p-3 rounded-none border-light">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:box-bold" width={20} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              Basic Information ({shipment.request_status.toUpperCase()})
            </h3>
          </div>
          <div
            className="grid gap-2 text-sm"
            style={{
              gridTemplateColumns: 'repeat(8, max-content)',
              justifyContent: 'start',
              alignItems: 'start',
              textAlign: 'left',
            }}
          >
            <div>
              <span className="text-gray-600">Scope: </span>
              <span className="font-medium">
                {shipment.shipment_scope_type
                  ? shipment.shipment_scope_type.toLowerCase() === 'international'
                    ? 'International (Outside Thai)'
                    : shipment.shipment_scope_type.toLowerCase() === 'export'
                      ? 'International (Export)'
                      : shipment.shipment_scope_type.toLowerCase() === 'import'
                        ? 'International (Import)'
                        : shipment.shipment_scope_type.toLowerCase() === 'domestic'
                          ? 'Domestic'
                          : shipment.shipment_scope_type
                  : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">| Topic: </span>
              <span className="font-medium">
                {shipment.topic || '-'} {shipment.topic === 'Others' && `(${shipment.other_topic})`} {shipment.topic === 'For Sales' && `(${shipment.sales_person})`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">| Service: </span>
              <span className="font-medium">
                {
                  shipment.service_options.toLowerCase() === 'normal'
                    ? 'Normal (Cheapest One)'
                    : `Urgent (${shipment.urgent_reason})`
                }
              </span>
            </div>
            {shipment.po_number && (
              <div>
                <span className="text-gray-600"> | PO Number(Date): </span>
                <span className="font-medium">
                  {shipment.po_number || '-'}({shipment.po_date || '-'})
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600"> | Requestor: </span>
              <span className="font-medium">{shipment.created_user_name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600"> | Approver: </span>
              <span className="font-medium">{shipment.approver_user_name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600"> | Created: </span>
              <span className="font-medium">{formatDateTime(shipment.created_date_time) || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600"> | Customs Purpose: </span>
              <span className="font-medium">{shipment.customs_purpose || '-'}</span>
            </div>
             <div>
              <span className="text-gray-600"> | Incoterms: </span>
              <span className="font-medium">{shipment.customs_terms_of_trade || '-'}</span>
            </div>
           
          </div>
        </div>
      </Card>
    </>
  );
};

export default ActionAndBasicInformation;
