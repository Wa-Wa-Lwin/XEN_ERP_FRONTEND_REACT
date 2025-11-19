import { Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentGETData } from './types';
import { formatDateTime } from './utils';

interface BasicInformationProps {
  shipment: ShipmentGETData;
}

const BasicInformation = ({ shipment }: BasicInformationProps) => {
  return (
    <Card className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-left gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon icon="solar:box-bold" width={22} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900 text-base">
            Basic Information
          </h3>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 text-sm text-gray-700">
        <InfoRow label="Scope" value={
          shipment.shipment_scope_type
            ? shipment.shipment_scope_type.toLowerCase() === 'international'
              ? 'International (Outside Thai)'
              : shipment.shipment_scope_type.toLowerCase() === 'export'
                ? 'International (Export)'
                : shipment.shipment_scope_type.toLowerCase() === 'import'
                  ? 'International (Import)'
                  : shipment.shipment_scope_type.toLowerCase() === 'domestic'
                    ? 'Domestic'
                    : shipment.shipment_scope_type
            : '-'
        } />

        <InfoRow
          label="Topic"
          value={`${shipment.topic || '-'}${
            shipment.topic === 'Others'
              ? ` (${shipment.other_topic})`
              : shipment.topic === 'For Sales'
                ? ` (${shipment.sales_person})`
                : ''
          }`}
        />

        <InfoRow
          label="Service"
          value={(() => {
            switch (shipment.service_options?.toLowerCase()) {
              case 'normal':
                return 'Normal (Cheapest One)';
              case 'urgent':
                return `Urgent (${shipment.urgent_reason})`;
              default:
                return shipment.service_options || 'Unknown';
            }
          })()}
        />

        {shipment.po_number && (
          <InfoRow
            label="PO Number (Date)"
            value={`${shipment.po_number || '-'} (${shipment.po_date || '-'})`}
          />
        )}

        <InfoRow label="Requestor" value={shipment.created_user_name || '-'} />
        <InfoRow label="Approver" value={shipment.approver_user_name || '-'} />
        <InfoRow label="Created" value={formatDateTime(shipment.created_date_time) || '-'} />
        <InfoRow label="Payment Terms" value={shipment?.payment_terms?.replace(/_/g, ' ').toUpperCase() || '-'} />
        <InfoRow label="Shipping Option" value={shipment?.shipping_options?.replace(/_/g, ' ').toUpperCase() || '-'} />

        {shipment?.customize_invoice_url && (
          <div>
            <span className="text-gray-600 font-medium">Custom Invoice: </span>
            <a
              href={`${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${shipment.customize_invoice_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center gap-1"
            >
              <Icon icon="solar:document-text-bold" width={14} />
              View PDF
            </a>
          </div>
        )}

        {shipment?.billing !== '' &&
          shipment?.shipping_options?.toLowerCase() !== 'grab_pickup' &&
          shipment?.shipping_options?.toLowerCase() !== 'supplier_pickup' && (
            <InfoRow label="Billing" value={shipment?.billing?.toUpperCase() || 'Not specified'} />
          )}

        {shipment?.billing?.toLowerCase() === 'recipient' && (
          <InfoRow
            label="Recipient Account No"
            value={shipment?.recipient_shipper_account_number?.toUpperCase() || '-'}
          />
        )}

        {shipment.shipment_scope_type?.toLowerCase() !== 'domestic' && (
          <>
            <InfoRow label="Customs Purpose" value={shipment.customs_purpose || '-'} />
            <InfoRow label="Incoterms" value={shipment.customs_terms_of_trade || '-'} />
          </>
        )}
      </div>
    </Card>
  );
};

// Small reusable component for clean info display
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-1.5">
    <span className="font-medium text-gray-600 min-w-fit whitespace-nowrap">{label}:</span>
    <span className="font-semibold text-gray-900 break-words">{value}</span>
  </div>
);

export default BasicInformation;