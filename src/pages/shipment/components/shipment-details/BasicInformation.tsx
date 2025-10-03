import { Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import DetailRow from './DetailRow';
import type { ShipmentGETData } from './types';
import { formatDateTime, getDisplayStatus, getIncotermDisplay } from './utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

interface BasicInformationProps {
  shipment: ShipmentGETData;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  msLoginUser?: any;
  onDuplicateShipment?: () => void;


  // add these (same as ActionSections)
  showError: boolean;
  setShowError: (show: boolean) => void;
  onCreateLabel: () => void;
  onCreatePickup: () => void;
  formattedError: string;
  formattedLabelError: string;
  formattedPickupError: string;
}

const BasicInformation = ({
  shipment,
  msLoginUser,
  onDuplicateShipment,
  showError,
  setShowError,
  onCreateLabel,
  onCreatePickup,
  formattedError,
  formattedLabelError,
  formattedPickupError

}: BasicInformationProps) => {

  const navigate = useNavigate()
  const { user } = useAuth()

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: '2-digit', // 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  function formatTime(timeString: string) {
    if (!timeString) return "";
    // Take only HH:mm from HH:mm:ss.0000000
    const [hours, minutes] = timeString.split(":");
    return `${parseInt(hours, 10)}:${minutes}`;
  }

  let pickupData = null;

  let pickupDateTime = shipment.pick_up_date
    ? `${formatDate(shipment.pick_up_date)} (${formatTime(shipment.pick_up_start_time)} - ${formatTime(shipment.pick_up_end_time)})`
    : '';


  if (shipment.pick_up_status && shipment.pick_up_created_status === "created_success") {
    pickupData = <>
      <h2 className="text-lg font-semibold mt-1">Pickup Information</h2>
      <DetailRow label="Confirmation  No" value={shipment.pickup_confirmation_numbers} />
      <DetailRow label="Status" value={shipment.pick_up_created_status} />
      <DetailRow label="DateTime" value={pickupDateTime} />
      <DetailRow label="Instruction" value={shipment.pick_up_instructions} />
    </>;
  }
  else if (shipment.pick_up_status && shipment.pick_up_created_status === "created_failed") {
    pickupData = <>
      <h2 className="text-lg font-semibold">Pickup Information</h2>
      <div className="my-1 flex gap-2 items-center">
        <p className="text-red-600 font-semibold">
          ⚠️ Pickup creation failed
        </p>
        <Button
          color="primary"
          size="sm"
          onPress={onCreatePickup}
          className="px-2 py-0 text-[11px] h-auto min-h-0"
        >
          Retry Create Pickup
        </Button>

      </div>
      <DetailRow label="DateTime" value={pickupDateTime} />
      <DetailRow label="Instruction" value={shipment.pick_up_instructions} />
      <Button
        size="sm"
        color="warning"
        onPress={() => setShowError(!showError)}
        className="px-2 py-0 text-[11px] h-auto min-h-0 mb-1"
      >
        {showError ? "Hide Error Details" : "Show Error Details"}
      </Button>
      {showError && (
        <div className="text-gray-800 text-sm break-words whitespace-pre-wrap border p-2 rounded bg-gray-50">

          <b>Details:</b> {formattedPickupError}
        </div>
      )}
    </>;
  } else {
    pickupData = <>
      <h2 className="text-lg font-semibold mt-1">Pickup Information</h2>
      <DetailRow label="DateTime" value={pickupDateTime} />
      <DetailRow label="Instruction" value={shipment.pick_up_instructions} />
    </>;
  }

  let labelData = null;
  // Extract Invoice link (just the URL string)
  // const to_invoice = `${import.meta.env.VITE_APP_BACKEND_BASE_URL}${import.meta.env.VITE_APP_CUSTOMIZE_INVOICE_URL}${shipment.shipmentRequestID}`;
  // const to_packing_slip = `${import.meta.env.VITE_APP_BACKEND_BASE_URL}${import.meta.env.VITE_APP_CUSTOMIZE_PACKING_SLIP_URL}${shipment.shipmentRequestID}`;

  if (shipment.approver_approved_date_time && shipment.label_status === "created") {
    labelData = <>
      <h2 className="text-lg font-semibold">Invoice Information</h2>
      <div className='flex gap-2'>
        <Button
          color="primary"
          size="sm"
          // onPress={() => window.open(to_invoice, "_blank")}
          onPress={() => {
            navigate(`/shipment/invoice/${shipment.shipmentRequestID}`)
          }}
          className="px-2 py-0 text-[11px] h-auto min-h-0"
        >
          View Invoice
        </Button>
        <Button
          color="primary"
          size="sm"
          // onPress={() => window.open(to_packing_slip, "_blank")}
          onPress={() => {
            navigate(`/shipment/packing-slip/${shipment.shipmentRequestID}`)
          }}
          className="px-2 py-0 text-[11px] h-auto min-h-0"
        >
          View Packing Slip
        </Button>
      </div>
      <DetailRow label="No" value={shipment.invoice_no} />
      <DetailRow label="Date" value={shipment.invoice_date} />
      <DetailRow label="Due Date" value={shipment.invoice_due_date} />
      <h2 className="text-lg font-semibold mt-1">Label Information</h2>
      <Button
        color="primary"
        size="sm"
        onPress={() => window.open(shipment.files_label_url, "_blank")}
        className="px-2 py-0 text-[11px] h-auto min-h-0"
      >
        View Label
      </Button>
      <DetailRow label="ID" value={shipment.label_id} />
      {/* <DetailRow label="Status" value={shipment.label_status} /> */}
      <DetailRow label="Tracking Numbers" value={shipment.tracking_numbers} />
      {/* {pickupData} */}
    </>;
  }
  else if (shipment.approver_approved_date_time && shipment.label_status !== "created") {
    labelData = <>
      <h2 className="text-lg font-semibold">Label Information</h2>
      <div className="my-1 flex gap-2 items-center">
        <p className="text-red-600 font-semibold">
          ⚠️ Label creation failed
        </p>
        <Button
          color="primary"
          size="sm"
          onPress={onCreateLabel}
          className="px-2 py-0 text-[11px] h-auto min-h-0"
        >
          Retry Create Label
        </Button>

      </div>
      <Button
        size="sm"
        color="warning"
        onPress={() => setShowError(!showError)}
        className="px-2 py-0 text-[11px] h-auto min-h-0 mb-1"
      >
        {showError ? "Hide Error Details" : "Show Error Details"}
      </Button>
      {showError && (
        <div className="text-gray-800 text-sm break-words whitespace-pre-wrap border p-2 rounded bg-gray-50">

          <b>Details:</b> {formattedLabelError} {formattedError}
        </div>
      )}

      {/* {pickupData} */}
    </>;
  };

  const canEdit =
    (user?.logisticRole === "1" &&
      shipment.request_status !== "approver_approved" &&
      shipment.request_status !== "approver_rejected")
      ||
    (shipment.approver_user_mail?.toLowerCase === msLoginUser?.mail?.toLowerCase() &&
      shipment.request_status !== "approver_approved" &&
      shipment.request_status !== "approver_rejected")
      ||
    (shipment.approver_user_mail?.toLowerCase === msLoginUser?.mail?.toLowerCase() &&
      shipment?.request_status === "approver_approved" &&
      shipment?.label_status !== "created")
      ||
    (user?.logisticRole === "1" &&
      shipment?.request_status === "approver_approved" &&
      shipment?.label_status !== "created")
      ;
   
  return (
    <section className="space-y-1">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">General Information</h2>
        <div className="flex gap-2">

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

            {/* <Button
                color="secondary"
                size="sm"
                variant="bordered"
                startContent={<Icon icon="solar:copy-bold" />}
                onPress={onDuplicateShipment}
              >
                Developer Only: Duplicate Shipment Request
              </Button> */}
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
          <DetailRow label="Created" value={formatDateTime(shipment.created_date_time)} />
          {shipment.approver_rejected_date_time && (
            <DetailRow label="Rejected" value={formatDateTime(shipment.approver_rejected_date_time)} />
          )}
          {shipment.approver_approved_date_time && (
            <DetailRow label="Approved" value={formatDateTime(shipment.approver_approved_date_time)} />
          )}
        </div>

        <div>
          <DetailRow label="Scope" value={shipment.shipment_scope_type?.toUpperCase() ?? ''} />
          <DetailRow label="Service Options" value={shipment.service_options} />
          {shipment.service_options === 'Urgent' && (
            <DetailRow label="Urgent Reason" value={shipment.urgent_reason} />
          )}
          <DetailRow label="Customs Purpose" value={shipment.customs_purpose?.toUpperCase() ?? ''} />
          <DetailRow label="Incoterms" value={getIncotermDisplay(shipment.customs_terms_of_trade)} />
          {pickupData}
        </div>

        <div>
          {labelData}
        </div>
      </div>
      <hr />
    </section>
  );
};

export default BasicInformation;