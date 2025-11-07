import { Button, Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import type { ShipmentGETData } from './types';

interface LabelAndInvoiceInformationProps {
    shipment: ShipmentGETData;
    showError: boolean;
    setShowError: (show: boolean) => void;
    onCreateLabel: () => void;
    formattedError: string;
    formattedLabelError: string;
}

const LabelAndInvoiceInformation = ({
    shipment,
    onCreateLabel,
    formattedError,
    formattedLabelError
}: LabelAndInvoiceInformationProps) => {
    const navigate = useNavigate();
    const trackingNumbers = shipment.tracking_numbers
        ? shipment.tracking_numbers.split(',').map(id => id.trim()).filter(id => id.length > 0)
        : [];

    const chosenRate = shipment.rates?.find(rate => String(rate.chosen) === "1");
    const masterTrackingNumber = trackingNumbers.length > 0 ? trackingNumbers[0] : null;

    const getLabelColor = () => {
        switch (shipment.label_status) {
            case "created":
                return "text-green-600";
            case "failed":
            case "cancelled":
                return "text-red-600";
            default:
                return "text-yellow-600"; // pending or any other status
        }
    };

    const getLabelText = () => {
        switch (shipment.label_status) {
            case "created":
                return "Success";
            case "failed":
                return "Failed";
            case "cancelled":
                return "Cancelled";
            default:
                return "Pending";
        }
    };

    const invoice_and_packing_data = <>
        <div className="grid gap-2 text-sm mb-3" style={{
            gridTemplateColumns: 'repeat(8, max-content)',
            justifyContent: 'start',
            alignItems: 'start',
            textAlign: 'left',
        }}>
            <div>
                <span className="text-gray-600">Invoice No: </span>
                <span className="font-medium">{shipment.invoice_no}</span>
            </div>
            <div>
                <span className="text-gray-600"> | Invoice Date: </span>
                <span className="font-medium">{shipment.invoice_date}</span>
            </div>
            <div>
                <span className="text-gray-600"> | Invoice Due Date: </span>
                <span className="font-medium">{shipment.invoice_due_date}</span>
            </div>
            <div className="flex justify-left gap-1 items-center">
                <Button
                    color="primary"
                    size="sm"
                    onPress={() => navigate(`/shipment/invoice/${shipment.shipmentRequestID}`)}
                    className="px-2 py-0 text-[11px] h-auto min-h-0"
                >
                    View Invoice
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    onPress={() => navigate(`/shipment/packing-slip/${shipment.shipmentRequestID}`)}
                    className="px-2 py-0 text-[11px] h-auto min-h-0"
                >
                    View Packing Slip
                </Button>
            </div>
        </div>
    </>;

    const label_created_data = <>
        {invoice_and_packing_data}

        <div className="grid gap-2 text-sm mb-3" style={{
            gridTemplateColumns: 'repeat(8, max-content)',
            justifyContent: 'start',
            alignItems: 'start',
            textAlign: 'left',
        }}>
            <div>
                <span className="text-gray-600">Label ID: </span>
                <span className="font-medium">{shipment.label_id}</span>
            </div>
            <div>
                <Button
                    color="primary"
                    size="sm"
                    onPress={() => window.open(shipment.files_label_url, "_blank")}
                    className="px-2 py-0 text-[11px] h-auto min-h-0"
                >
                    View Label
                </Button>
            </div>
            <div>
                <span className="text-gray-600"> | Tracking Number: </span>
                <span className="font-medium">{shipment.tracking_numbers}</span>
            </div>
            <div>
                {/* Track buttons for each tracking number */}
                {trackingNumbers.length > 0 && chosenRate?.shipper_account_slug && (
                    <>
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
                    </>
                )}
            </div>
            <div>
                {trackingNumbers.length > 1 && masterTrackingNumber && (
                    <>
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
            </div>
        </div>
    </>;

    const label_failed_data = <>
        <div>
            <Button
                color="primary"
                size="sm"
                onPress={onCreateLabel}
                className="px-2 py-1 text-[12px] h-auto min-h-0"
            >
                Retry Create Label
            </Button>
            <p className="text-red-600 text-xs font-semibold bg-red-50 p-2 rounded">
                <b>Details:</b> {formattedLabelError} {formattedError}
            </p>
        </div>
    </>;

    return (
        <>
            {
                shipment.service_options === 'Grab' || shipment.service_options === 'Supplier Pickup' ?
                    <>
                        <Card shadow="none">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon
                                    icon="solar:calendar-bold"
                                    width={24}
                                    className="text-blue-500"
                                />
                                <h3 className='font-semibold'>
                                    Invoice & Packing Slip Information
                                </h3>
                            </div>
                            {
                                shipment.approver_approved_date_time !== null ?
                                    <>
                                        {invoice_and_packing_data}
                                    </>
                                    :
                                    <>
                                        <p className="text-yellow-600 text-sm font-semibold bg-yellow-50 p-2 rounded">
                                            The shipment is pending approval. The information and documents will be available once approved.
                                        </p>
                                    </>
                            }
                        </Card>
                    </>
                    :
                    <>
                        <Card shadow="none">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon
                                    icon="solar:calendar-bold"
                                    width={24}
                                    className={getLabelColor()}
                                />

                                <h3 className={`font-semibold ${getLabelColor()}`}>
                                    Label & Invoice Information ({getLabelText()})
                                </h3>
                            </div>
                            {
                                (shipment.label_status === "created" || shipment.label_status === "cancelled") &&
                                <>
                                    {label_created_data}
                                </>
                            }
                            {
                                shipment.label_status === "failed" &&
                                <>
                                    {label_failed_data}
                                </>
                            }
                        </Card>
                    </>
            }

        </>
    );
};

export default LabelAndInvoiceInformation;
