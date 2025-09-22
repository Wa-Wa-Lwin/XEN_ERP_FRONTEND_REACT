import { Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import DetailRow from './DetailRow';
import type { ShipmentData } from './types';
import { formatDateTime, getDisplayStatus, getIncotermDisplay } from './utils';

interface BasicInformationProps {
  shipment: ShipmentData;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  msLoginUser?: any;
  onDuplicateShipment?: () => void;
}

const BasicInformation = ({
  shipment,
  showHistory,
  setShowHistory,
  msLoginUser,
  onDuplicateShipment
}: BasicInformationProps) => {
  return (
    <section className="space-y-1">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">General Information</h2>
        <div className="flex gap-2">
          {(msLoginUser?.email === 'wawa@xenoptics.com' ||
            msLoginUser?.email === 'susu@xenoptics.com' ||
            msLoginUser?.email === 'thinzar@xenoptics.com') && onDuplicateShipment && (
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
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-1 text-sm">
        <div>
          <DetailRow label="ID" value={shipment.shipmentRequestID} />
          <Chip
            size="sm"
            color={
              shipment.request_status.includes("approved") ? "success" :
              shipment.request_status.includes("rejected") ? "danger" :
              "warning"
            }
            variant="flat"
          >
            {getDisplayStatus(shipment.request_status)}
          </Chip>
          <DetailRow label="Topic" value={`${shipment.topic} (${shipment.po_number})`} />
          {shipment.topic === 'For Sales' && (
            <DetailRow label="Sales Person" value={shipment.sales_person} />
          )}
          {shipment.topic === 'Others' && (
            <DetailRow label="Other" value={shipment.other_topic} />
          )}
          <DetailRow label="Requestor" value={`${shipment.created_user_name}`} />
          <DetailRow label="Approver" value={`${shipment.approver_user_name}`} />
          {shipment.remark && <DetailRow label="Remark" value={shipment.remark} />}
          <DetailRow label="Request Created Date" value={formatDateTime(shipment.created_date_time)} />
          {shipment.approver_rejected_date_time && (
            <DetailRow label="Rejected Date" value={formatDateTime(shipment.approver_rejected_date_time)} />
          )}
        </div>

        <div>
          <DetailRow label="Shipment Scope Type" value={shipment.shipment_scope_type.toUpperCase()} />
          <DetailRow label="Service Options" value={shipment.service_options} />
          {shipment.service_options === 'Urgent' && (
            <DetailRow label="Urgent Reason" value={shipment.urgent_reason} />
          )}
          <DetailRow label="Customs Purpose" value={shipment.customs_purpose.toUpperCase()} />
          <DetailRow label="Customs Terms of Trade" value={getIncotermDisplay(shipment.customs_terms_of_trade)} />
        </div>

        <div>
          {shipment.approver_approved_date_time && (
            <>
              <DetailRow label="Label ID" value={shipment.label_id} />
              <DetailRow label="Label Status" value={shipment.label_status} />
              <DetailRow label="Label" value={shipment.files_label_url} />
              <DetailRow label="Tracking Numbers" value={shipment.tracking_numbers} />
              <DetailRow label="Pick Up Date" value={shipment.pick_up_date} />
              <DetailRow label="Pick Up Created Status" value={shipment.pick_up_created_status} />
              <DetailRow label="Pickup Confirmation Numbers" value={shipment.pickup_confirmation_numbers} />
              <DetailRow label="Invoice No" value={shipment.invoice_no} />
              <DetailRow label="Invoice" value={shipment.files_invoice_url} />
              <DetailRow label="Invoice Date" value={shipment.invoice_date} />
              <DetailRow label="Invoice Due Date" value={shipment.invoice_due_date} />
              <DetailRow label="Packing Slip" value={shipment.files_packing_slip} />
              <DetailRow label="Approved Date" value={formatDateTime(shipment.approver_approved_date_time)} />
            </>
          )}
        </div>
      </div>
      <hr />
    </section>
  );
};

export default BasicInformation;