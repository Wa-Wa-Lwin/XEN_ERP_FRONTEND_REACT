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
                    View File
                  </a>
                </b>&nbsp;
              </div>
            )}
            {
              shipment?.billing !== "" && shipment?.service_options?.toLowerCase() !== "grab" && shipment?.service_options?.toLowerCase() !== "supplier pickup" && (
                <div className="inline-flex items-center">
                  |&nbsp; Billing:&nbsp; <b>{shipment?.billing?.toUpperCase() || 'SHIPPER'}</b>&nbsp;
                </div>
              )
            }

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
// import { Card, Chip } from '@heroui/react';
// import { Icon } from '@iconify/react';
// import type { ShipmentGETData } from './types';
// import { formatDateTime } from './utils';

// interface BasicInformationProps {
//   shipment: ShipmentGETData;
// }

// const getStatusConfig = (status: string) => {
//   const statusLower = status.toLowerCase();

//   if (statusLower.includes('approved')) {
//     return { color: 'success' as const, icon: 'solar:check-circle-bold' };
//   }
//   if (statusLower.includes('rejected') || statusLower.includes('cancel')) {
//     return { color: 'danger' as const, icon: 'solar:close-circle-bold' };
//   }
//   if (statusLower.includes('pending') || statusLower.includes('waiting')) {
//     return { color: 'warning' as const, icon: 'solar:clock-circle-bold' };
//   }
//   if (statusLower.includes('draft')) {
//     return { color: 'default' as const, icon: 'solar:document-bold' };
//   }
//   return { color: 'primary' as const, icon: 'solar:info-circle-bold' };
// };

// const BasicInformation = ({ shipment }: BasicInformationProps) => {
//   const statusConfig = getStatusConfig(shipment.request_status);

//   return (
//     <Card className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
//       {/* Header */}
//       <div className="flex items-center justify-left gap-3 mb-4 pb-3 border-b border-gray-200">
//         <div className="flex items-center gap-2">
//           <Icon icon="solar:box-bold" width={22} className="text-blue-600" />
//           <h3 className="font-semibold text-blue-900 text-base">
//             Basic Information
//           </h3>
//         </div>
//         <Chip
//           color={statusConfig.color}
//           variant="flat"
//           size="sm"
//           startContent={<Icon icon={statusConfig.icon} width={16} />}
//           className="font-semibold"
//         >
//           {shipment.request_status.toUpperCase().replace(/_/g, ' ')}
//         </Chip>
//       </div>

//       {/* Details Grid */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 text-sm text-gray-700">
//         <InfoRow label="Scope" value={
//           shipment.shipment_scope_type
//             ? shipment.shipment_scope_type.toLowerCase() === 'international'
//               ? 'International (Outside Thai)'
//               : shipment.shipment_scope_type.toLowerCase() === 'export'
//                 ? 'International (Export)'
//                 : shipment.shipment_scope_type.toLowerCase() === 'import'
//                   ? 'International (Import)'
//                   : shipment.shipment_scope_type.toLowerCase() === 'domestic'
//                     ? 'Domestic'
//                     : shipment.shipment_scope_type
//             : '-'
//         } />

//         <InfoRow
//           label="Topic"
//           value={`${shipment.topic || '-'}${
//             shipment.topic === 'Others'
//               ? ` (${shipment.other_topic})`
//               : shipment.topic === 'For Sales'
//                 ? ` (${shipment.sales_person})`
//                 : ''
//           }`}
//         />

//         <InfoRow
//           label="Service"
//           value={(() => {
//             switch (shipment.service_options?.toLowerCase()) {
//               case 'normal':
//                 return 'Normal (Cheapest One)';
//               case 'urgent':
//                 return `Urgent (${shipment.urgent_reason})`;
//               default:
//                 return shipment.service_options || 'Unknown';
//             }
//           })()}
//         />

//         {shipment.po_number && (
//           <InfoRow
//             label="PO Number (Date)"
//             value={`${shipment.po_number || '-'} (${shipment.po_date || '-'})`}
//           />
//         )}

//         <InfoRow label="Requestor" value={shipment.created_user_name || '-'} />
//         <InfoRow label="Approver" value={shipment.approver_user_name || '-'} />
//         <InfoRow label="Created" value={formatDateTime(shipment.created_date_time) || '-'} />
//         <InfoRow label="Payment Terms" value={shipment?.payment_terms?.replace(/_/g, ' ').toUpperCase() || '-'} />

//         {shipment?.customize_invoice_url && (
//           <div>
//             <span className="text-gray-600 font-medium">Custom Invoice: </span>
//             <a
//               href={`${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${shipment.customize_invoice_url}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center gap-1"
//             >
//               <Icon icon="solar:document-text-bold" width={14} />
//               View PDF
//             </a>
//           </div>
//         )}

//         {shipment?.billing !== '' &&
//           shipment?.service_options?.toLowerCase() !== 'grab' &&
//           shipment?.service_options?.toLowerCase() !== 'supplier pickup' && (
//             <InfoRow label="Billing" value={shipment?.billing?.toUpperCase() || 'SHIPPER'} />
//           )}

//         {shipment?.billing?.toLowerCase() === 'recipient' && (
//           <InfoRow
//             label="Recipient Account No"
//             value={shipment?.recipient_shipper_account_number?.toUpperCase() || '-'}
//           />
//         )}

//         {shipment.shipment_scope_type?.toLowerCase() !== 'domestic' && (
//           <>
//             <InfoRow label="Customs Purpose" value={shipment.customs_purpose || '-'} />
//             <InfoRow label="Incoterms" value={shipment.customs_terms_of_trade || '-'} />
//           </>
//         )}
//       </div>
//     </Card>
//   );
// };

// // Small reusable component for clean info display
// const InfoRow = ({ label, value }: { label: string; value: string }) => (
//   <div className="flex gap-1.5">
//     <span className="font-medium text-gray-600 min-w-fit whitespace-nowrap">{label}:</span>
//     <span className="font-semibold text-gray-900 break-words">{value}</span>
//   </div>
// );

// export default BasicInformation;
