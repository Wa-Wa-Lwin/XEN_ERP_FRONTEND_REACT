import { Button, Card, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
// import { useNavigate } from 'react-router-dom';
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
    // const navigate = useNavigate();
    // const trackingNumbers = shipment.tracking_numbers
    //     ? shipment.tracking_numbers.split(',').map(id => id.trim()).filter(id => id.length > 0)
    //     : [];

    // const chosenRate = shipment.rates?.find(rate => String(rate.chosen) === "1");
    // const masterTrackingNumber = trackingNumbers.length > 0 ? trackingNumbers[0] : null;

    // Check if the label URL is base64 encoded (for FedEx Domestic Thailand)
    // const isBase64Label = shipment.files_label_url && !shipment.files_label_url.startsWith('http');

    // const handleViewLabel = () => {
    //     if (!shipment.files_label_url) return;

    //     if (isBase64Label) {
    //         // For base64 encoded labels (FedEx Domestic Thailand)
    //         const pdfWindow = window.open("");
    //         pdfWindow?.document.write(
    //             `<iframe width='100%' height='100%' src='data:application/pdf;base64,${shipment.files_label_url}'></iframe>`
    //         );
    //     } else {
    //         // For regular URL labels
    //         window.open(shipment.files_label_url, "_blank");
    //     }
    // };

    const getLabelChipConfig = () => {
        switch (shipment.label_status) {
            case "created":
                return { color: 'success' as const, icon: 'solar:check-circle-bold', text: 'Created' };
            case "failed":
                return { color: 'danger' as const, icon: 'solar:close-circle-bold', text: 'Failed' };
            case "cancelled":
                return { color: 'danger' as const, icon: 'solar:forbidden-circle-bold', text: 'Cancelled' };
            default:
                return { color: 'warning' as const, icon: 'solar:clock-circle-bold', text: 'Pending' };
        }
    };

    // Check if shipping option is grab_pickup or supplier_pickup
    const isGrabPickup = shipment.shipping_options?.toLowerCase() === 'grab_pickup';
    const isSupplierPickup = shipment.shipping_options?.toLowerCase() === 'supplier_pickup';
    const isApproved = shipment.request_status === 'approver_approved';

    const label_created_data = (
        <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="text-gray-600 font-medium">Invoice : </span>
                    <span className="font-semibold text-gray-900">{shipment.invoice_no}</span>
                    <span className="text-gray-600 font-medium"> | </span>
                    <span className="text-gray-600 font-medium"> Date: </span>
                    <span className="font-semibold text-gray-900">{shipment.invoice_date}</span>
                    <span className="text-gray-600 font-medium"> | </span>
                    <span className="text-gray-600 font-medium">Due: </span>
                    <span className="font-semibold text-gray-900">{shipment.invoice_due_date}</span>
                </div>
                {
                    !isGrabPickup && !isSupplierPickup && <>
                        {shipment.label_id &&
                            <div>
                                <span className="text-gray-600 font-medium">Label ID: </span>
                                <span className="font-semibold text-gray-900">{shipment.label_id}</span>
                            </div>
                        }
                        <div>
                            <span className="text-gray-600 font-medium">Tracking Number: </span>
                            <span className="font-semibold text-gray-900">{shipment.tracking_numbers}</span>
                        </div>
                    </>
                }
            </div>
            {/* <div className="flex gap-2 flex-wrap">
                <Button
                    color="primary"
                    size="sm"
                    onPress={() => navigate(`/shipment/invoice/${shipment.shipmentRequestID}`)}
                    startContent={<Icon icon="solar:document-text-bold" width={16} />}
                >
                    View Invoice
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    variant="bordered"
                    onPress={() => navigate(`/shipment/packing-slip/${shipment.shipmentRequestID}`)}
                    startContent={<Icon icon="solar:document-bold" width={16} />}
                >
                    View Packing Slip
                </Button>

                {
                    !isGrabPickup && !isSupplierPickup && <>
                        <Button
                            color="primary"
                            size="sm"
                            onPress={handleViewLabel}
                            startContent={<Icon icon="solar:tag-bold" width={16} />}
                        >
                            View Label
                        </Button>

                        {trackingNumbers.length > 0 && chosenRate?.shipper_account_slug && (
                            <>
                                {trackingNumbers.map((trackingId, index) => (
                                    <Button
                                        key={index}
                                        color="secondary"
                                        size="sm"
                                        variant="bordered"
                                        startContent={<Icon icon="solar:map-point-wave-bold" width={16} />}
                                        onPress={() => {
                                            const trackingUrl = `https://www.aftership.com/track?c=${chosenRate.shipper_account_slug}&t=${trackingId}`;
                                            window.open(trackingUrl, "_blank");
                                        }}
                                    >
                                        Track {trackingNumbers.length > 1 ? `#${index + 1}` : ''}
                                    </Button>
                                ))}
                            </>
                        )}

                        {trackingNumbers.length > 1 && masterTrackingNumber && chosenRate?.shipper_account_slug && (
                            <Button
                                color="primary"
                                size="sm"
                                startContent={<Icon icon="solar:map-point-wave-bold" width={16} />}
                                onPress={() => {
                                    const trackingUrl = `https://www.aftership.com/track?c=${chosenRate.shipper_account_slug}&t=${masterTrackingNumber}`;
                                    window.open(trackingUrl, "_blank");
                                }}
                            >
                                Track Master
                            </Button>
                        )}
                    </>
                }

            </div> */}
        </div>
    );

    const label_failed_data = (
        <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium flex items-start gap-2">
                    <Icon icon="solar:danger-triangle-bold" width={18} className="flex-shrink-0 mt-0.5" />
                    <span><strong>Error Details:</strong> {formattedLabelError} {formattedError}</span>
                </p>
            </div>
            <Button
                color="primary"
                size="sm"
                onPress={onCreateLabel}
                startContent={<Icon icon="solar:refresh-bold" width={16} />}
            >
                Retry Create Label
            </Button>
        </div>
    );



    const labelChipConfig = getLabelChipConfig();

    return (
        <>
            <Card className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-left gap-1 mb-2 pb-3 border-gray-200">
                    <Icon icon="solar:tag-bold" width={22} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-900 text-base">
                        Label & Invoice Information
                    </h3>
                    <Chip
                        color={labelChipConfig.color}
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon={labelChipConfig.icon} width={16} />}
                        className="font-semibold"
                    >
                        {labelChipConfig.text}
                    </Chip>
                </div>
                {
                    isApproved && <>
                        {
                            isGrabPickup || isSupplierPickup ? (
                                <>
                                    {label_created_data}
                                </>
                            ) : (
                                <>
                                    {(shipment.label_status === "created" || shipment.label_status === "cancelled") && label_created_data}
                                    {shipment.label_status === "failed" && label_failed_data}
                                </>
                            )
                        }
                        {/* 
                        {(shipment.label_status === "created" || shipment.label_status === "cancelled") && label_created_data}
                        {shipment.label_status === "failed" && label_failed_data}
                        */}
                    </>
                }
            </Card>
        </>
    );
};

export default LabelAndInvoiceInformation;