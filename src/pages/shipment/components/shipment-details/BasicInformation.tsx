import { Button, Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import DetailRow from './DetailRow';
import type { ShipmentGETData } from './types';
import { formatDateTime } from './utils';
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
  onChangePickupDateTime?: () => void;
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
  onChangePickupDateTime,
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

  let pickupDateTime = shipment.pick_up_date
    ? `${formatDate(shipment.pick_up_date)} (${formatTime(shipment.pick_up_start_time)} - ${formatTime(shipment.pick_up_end_time)})`
    : '';

  // Check if carrier is DHL eCommerce Asia
  const chosenRate = shipment.rates?.find(rate => String(rate.chosen) === "1");

  const isDHLeCommerceAsia = chosenRate?.shipper_account_description === 'DHL eCommerce Asia';
  // const isDHL_Express_Worldwide = chosenRate?.service_name === 'DHL Express Worldwide';

  let labelData = null;

  if (shipment.approver_approved_date_time && (shipment.label_status === "created" || shipment.label_status === "cancelled")) {
    // Parse tracking numbers (comma-separated)
    const trackingNumbers = shipment.tracking_numbers
      ? shipment.tracking_numbers.split(',').map(id => id.trim()).filter(id => id.length > 0)
      : [];

    // Master tracking number is the first one
    const masterTrackingNumber = trackingNumbers.length > 0 ? trackingNumbers[0] : null;

    labelData = <>
      <h2
        className={`text-lg font-semibold mt-1 ${shipment.label_status === "cancelled"
          ? "text-red-600"
          : shipment.label_status === "created"
            ? "text-green-600"
            : "text-gray-700"
          }`}
      >
        Label Information ({shipment.label_status})
      </h2>
      <Button
        color="primary"
        size="sm"
        onPress={() => window.open(shipment.files_label_url, "_blank")}
        className="px-2 py-0 text-[11px] h-auto min-h-0"
      >
        View Label
      </Button>
      <DetailRow label="ID" value={shipment.label_id} />

      {/* Master Tracking Number - only show if there are multiple tracking numbers */}
      {trackingNumbers.length > 1 && masterTrackingNumber && (
        <>
          <DetailRow label="Master Tracking Number" value={masterTrackingNumber} />
          {chosenRate?.shipper_account_slug && (
            <Button
              color="primary"
              size="sm"
              variant="solid"
              startContent={<Icon icon="solar:map-point-wave-bold" />}
              onPress={() => {
                const trackingUrl = `https://www.aftership.com/track?c=${chosenRate.shipper_account_slug}&t=${masterTrackingNumber}`;
                window.open(trackingUrl, "_blank");
              }}
              className="px-2 py-0 text-[11px] h-auto min-h-0 mb-2"
            >
              Track Master
            </Button>
          )}
        </>
      )}

      {/* Tracking Numbers */}
      <DetailRow label="Tracking Numbers" value={shipment.tracking_numbers} />

      {/* Track buttons for each tracking number */}
      {trackingNumbers.length > 0 && chosenRate?.shipper_account_slug && (
        <div className="flex flex-wrap gap-2 mt-2">
          {trackingNumbers.map((trackingId, index) => (
            <Button
              key={index}
              color="secondary"
              size="sm"
              variant="bordered"
              startContent={<Icon icon="solar:map-point-wave-bold" />}
              onPress={() => {
                const trackingUrl = `https://www.aftership.com/track?c=${chosenRate.shipper_account_slug}&t=${trackingId}`;
                window.open(trackingUrl, "_blank");
              }}
              className="px-2 py-0 text-[11px] h-auto min-h-0"
            >
              Track {trackingNumbers.length > 1 ? `#${index + 1}` : ''}
            </Button>
          ))}
        </div>
      )}
    </>;
  }
  else if (shipment.approver_approved_date_time && shipment.label_status !== "created" && shipment.label_status !== "cancelled") {
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
    ;

  return (
    <>
      <Card className="m-3 p-3  rounded-none">
        <div className="flex-1">
          <div className="flex items-center gap-2">
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
      </Card>

      {/* Basic Information  */}
      <Card className="m-3 p-3 rounded-none">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:box-bold" width={20} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900">Basic Information ({shipment.request_status.toUpperCase()})</h3>
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
            {
              shipment.po_number !== "" &&
              <>
                <div>
                  <span className="text-gray-600"> | PO Number(Date): </span>
                  <span className="font-medium">
                    {shipment.po_number || '-'}({shipment.po_date || '-'})
                  </span>
                </div>
              </>
            }
            <div>
              <span className="text-gray-600"> | Requestor: </span>
              <span className="font-medium">
                {shipment.created_user_name || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600"> | Approver: </span>
              <span className="font-medium">
                {shipment.approver_user_name || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600"> | Created: </span>
              <span className="font-medium">
                {formatDateTime(shipment.created_date_time) || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600"> | Created: </span>
              <span className="font-medium">
                {formatDateTime(shipment.created_date_time) || '-'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Pickup Information Card */}
      <Card className="m-3 p-3 rounded-none">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="solar:calendar-bold" width={24} className={
            shipment.pick_up_created_status === "created_success"
              ? "text-green-600"
              : shipment.pick_up_created_status === "created_failed"
                ? "text-red-600"
                : "text-blue-600"
          } />
          <h3 className={`font-semibold ${shipment.pick_up_created_status === "created_success"
            ? "text-green-600"
            : shipment.pick_up_created_status === "created_failed"
              ? "text-red-600"
              : "text-blue-600"
            }`}>
            Pickup Information ({shipment.pick_up_created_status === "created_success" ? "Success" : shipment.pick_up_created_status === "created_failed" ? "Failed" : "Pending"})
          </h3>
        </div>
        <div
          className="grid gap-2 text-sm mb-3"
          style={{
            gridTemplateColumns: 'repeat(8, fit-content(300px))',
            justifyContent: 'start',
            alignItems: 'start',
            textAlign: 'left',
          }}
        >
          <div>
            <span className="text-gray-600">Date(Time): </span>
            <span className="font-medium">
              {pickupDateTime}
            </span>
          </div>
          {shipment.pick_up_instructions !== "" &&
            <>
              <div>
                <span className="text-gray-600">| Instruction: </span>
                <span className="font-medium">
                  {shipment.pick_up_instructions || '-'}
                </span>
              </div>
            </>
          }
          {/* created_success  */}
          {(shipment.pick_up_created_status === "created_success" && shipment.pickup_confirmation_numbers !== "" && !isDHLeCommerceAsia) &&
            <>
              <div>
                <span className="text-gray-600"> | Confirmation No: </span>
                <span className="font-medium">
                  {shipment.pickup_confirmation_numbers}
                </span>
              </div>
            </>}
          {(
            shipment.pick_up_status &&
            shipment.request_status !== "approver_approved" &&
            shipment.request_status !== "approver_rejected" &&
            new Date(shipment.pick_up_date) < new Date() &&
            !isDHLeCommerceAsia
          ) && <>
              <Button
                color="warning"
                size="sm"
                onPress={onChangePickupDateTime}
              >
                Change Pickup DateTime
              </Button>
            </>}
          {shipment.pick_up_created_status === "created_failed" &&
            <>
              {shipment.request_status === "approver_approved" ? (
                <Button
                  color="primary"
                  size="sm"
                  onPress={onChangePickupDateTime}
                >
                  Change Pickup Date Time and Retry
                </Button>
              ) : (
                <>
                  <Button
                    color="warning"
                    size="sm"
                    onPress={onChangePickupDateTime}
                  >
                    Change Pickup DateTime
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    onPress={onCreatePickup}
                  >
                    Retry Create Pickup
                  </Button>
                </>
              )}
            </>}
        </div>
        <p className="text-xs">
          {isDHLeCommerceAsia && (
            <p className="text-blue-600 font-semibold bg-blue-50 p-2 rounded">
              📞 Please call DHL eCommerce Asia customer service to arrange pickup for this package.
              📇 Contact Logistic Team for futher information.
            </p>
          )}
          {
            shipment.pick_up_created_status === "created_failed" && !isDHLeCommerceAsia &&
            <>
              <p className="text-red-600 font-semibold bg-yellow-50 p-2 rounded break-words max-w-full whitespace-normal">
                ⚠️ Error Detail: {formattedPickupError}
              </p>
            </>
          }
        </p>
      </Card>

      {/* Label & Invoice Information */}
      <Card className="m-3 p-3 rounded-none">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="solar:calendar-bold" width={24} className={
            shipment.pick_up_created_status === "created_success"
              ? "text-green-600"
              : shipment.pick_up_created_status === "created_failed"
                ? "text-red-600"
                : "text-blue-600"
          } />
          <h3 className={`font-semibold ${shipment.label_status === "success"
            ? "text-green-600"
            : shipment.pick_up_created_status === "failed"
              ? "text-red-600"
              : "text-yellow-600"
            }`}>
            Label & Invoice Information ({shipment.label_status === "success" ? "Success" : shipment.label_status === "failed" ? "Failed" : "Pending"})
          </h3>
        </div>
        <div
          className="grid gap-2 text-sm mb-3"
          style={{
            gridTemplateColumns: 'repeat(8, max-content)',
            justifyContent: 'start',
            alignItems: 'start',
            textAlign: 'left',
          }}
        >
          <div>
            <span className="text-gray-600">Invoice No: </span>
            <span className="font-medium">
              {shipment.invoice_no}
            </span>
          </div>
          <div>
            <span className="text-gray-600"> | Invoice Date: </span>
            <span className="font-medium">
              {shipment.invoice_date}
            </span>
          </div>
          <div>
            <span className="text-gray-600"> | Invoice Due Date: </span>
            <span className="font-medium">
              {shipment.invoice_due_date}
            </span>
          </div>
          <div>
            <span className="text-gray-600"> | View Invoice: </span>
            <span className="font-medium">
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
            </span>
          </div>

          <div>
            <span className="text-gray-600">Invoice No: </span>
            <span className="font-medium">
              {shipment.invoice_no}
            </span>
          </div>
          {shipment.pick_up_instructions !== "" &&
            <>
              <div>
                <span className="text-gray-600">| Instruction: </span>
                <span className="font-medium">
                  {shipment.pick_up_instructions || '-'}
                </span>
              </div>
            </>
          }
        </div>
      </Card>
    </>
  );
};

export default BasicInformation;