import { Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentGETData } from './types';
import { formatDateTime } from './utils';

interface BasicInformationProps {
  shipment: ShipmentGETData;
}

const BasicInformation = ({ shipment }: BasicInformationProps) => {
  return (
    <Card shadow="none">
      {/* <Card className="p-3 rounded-none border-light"> */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="solar:box-bold" width={20} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900">
            Basic Information ({shipment.request_status.toUpperCase()})
          </h3>
        </div>

        <div className="grid grid-cols gap-2 text-sm">
          <div>
            <div className="inline-flex items-center">
              Scope:&nbsp; <b>
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
              </b>&nbsp;
            </div>

            <div className="inline-flex items-center">|&nbsp; Topic:&nbsp; <b>
              {shipment.topic || '-'} {shipment.topic === 'Others' && `(${shipment.other_topic})`} {shipment.topic === 'For Sales' && `(${shipment.sales_person})`}
            </b>
              &nbsp;
            </div>

            <div className="inline-flex items-center">
              |&nbsp; Service:&nbsp; <b>
                {
                  (() => {
                    switch (shipment.service_options?.toLowerCase()) {
                      case 'normal':
                        return 'Normal (Cheapest One)';
                      case 'urgent':
                        return `Urgent (${shipment.urgent_reason})`;
                      default:
                        return shipment.service_options || 'Unknown';
                    }
                  })()
                }
              </b>&nbsp;
            </div>

            {shipment.po_number && (
              <div className="inline-flex items-center">|&nbsp; PO Number(Date):&nbsp; <b>
                {shipment.po_number || '-'}({shipment.po_date || '-'} )
              </b>
              </div>
            )}

            <div className="inline-flex items-center">
              |&nbsp; Requestor:&nbsp; <b> {shipment.created_user_name || '-'}</b>&nbsp;
            </div>

            <div className="inline-flex items-center">
              |&nbsp; Approver:&nbsp; <b>{shipment.approver_user_name || '-'}</b>&nbsp;
            </div>

            <div className="inline-flex items-center">
              |&nbsp; Created:&nbsp; <b>{formatDateTime(shipment.created_date_time) || '-'}</b>&nbsp;
            </div>

            <div className="inline-flex items-center">
              |&nbsp; Payment Terms:&nbsp; <b>{shipment?.payment_terms?.replace(/_/g, ' ').toUpperCase() || '-'}</b>&nbsp;
            </div>

            {shipment?.customize_invoice_url && (
              <div className="inline-flex items-center">
                |&nbsp; Custom Invoice:&nbsp;
                <b>
                  <a
                    href={`${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${shipment.customize_invoice_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    Download PDF
                  </a>
                </b>&nbsp;
              </div>
            )}

            <div className="inline-flex items-center">
              |&nbsp; Billing:&nbsp; <b>{shipment?.billing?.toUpperCase() || 'SHIPPER'}</b>&nbsp;
            </div>

            {shipment?.billing?.toLowerCase() === "recipient" && (
              <div className="inline-flex items-center">
                |&nbsp; Recipient Shipper Account No:&nbsp; <b>{shipment?.recipient_shipper_account_number?.toUpperCase() || '-'}</b>&nbsp;
              </div>
            )}

            {/* Only show customs fields for non-domestic shipments */}
            {shipment.shipment_scope_type?.toLowerCase() !== 'domestic' && (
              <>
                <div className="inline-flex items-center">
                  |&nbsp; Customs Purpose:&nbsp; <b>{shipment.customs_purpose || '-'}</b>&nbsp;
                </div>
                <div className="inline-flex items-center">
                  |&nbsp; Incoterms:&nbsp; <b>{shipment.customs_terms_of_trade || '-'}</b>&nbsp;
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BasicInformation;
