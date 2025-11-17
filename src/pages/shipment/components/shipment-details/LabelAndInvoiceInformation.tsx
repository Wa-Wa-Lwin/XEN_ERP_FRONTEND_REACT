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

    // Check if shipping option is grab_pickup or supplier_pickup
    const isGrabPickup = shipment.shipping_options?.toLowerCase() === 'grab_pickup';
    const isSupplierPickup = shipment.shipping_options?.toLowerCase() === 'supplier_pickup';
    const isApproved = shipment.request_status === 'approver_approved';

    // Get status text and color for grab/supplier pickup
    const getGrabSupplierStatus = () => {
        return isApproved ? 'Success' : 'Pending';
    };

    const getGrabSupplierColor = () => {
        return isApproved ? 'text-green-600' : 'text-yellow-600';
    };

    return (
        <>
            {
                isGrabPickup || isSupplierPickup ?
                    <>
                        <Card shadow="none">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon
                                    icon="solar:calendar-bold"
                                    width={24}
                                    className={getGrabSupplierColor()}
                                />
                                <h3 className={`font-semibold ${getGrabSupplierColor()}`}>
                                    Invoice & Packing Slip Information ({getGrabSupplierStatus()})
                                </h3>
                            </div>
                            {
                                isApproved ?
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
// import { Button, Card, Chip } from '@heroui/react';
// import { Icon } from '@iconify/react';
// import { useNavigate } from 'react-router-dom';
// import type { ShipmentGETData } from './types';

// interface LabelAndInvoiceInformationProps {
//     shipment: ShipmentGETData;
//     showError: boolean;
//     setShowError: (show: boolean) => void;
//     onCreateLabel: () => void;
//     formattedError: string;
//     formattedLabelError: string;
// }

// const LabelAndInvoiceInformation = ({
//     shipment,
//     onCreateLabel,
//     formattedError,
//     formattedLabelError
// }: LabelAndInvoiceInformationProps) => {
//     const navigate = useNavigate();
//     const trackingNumbers = shipment.tracking_numbers
//         ? shipment.tracking_numbers.split(',').map(id => id.trim()).filter(id => id.length > 0)
//         : [];

//     const chosenRate = shipment.rates?.find(rate => String(rate.chosen) === "1");
//     const masterTrackingNumber = trackingNumbers.length > 0 ? trackingNumbers[0] : null;

//     const getLabelChipConfig = () => {
//         switch (shipment.label_status) {
//             case "created":
//                 return { color: 'success' as const, icon: 'solar:check-circle-bold', text: 'Created' };
//             case "failed":
//                 return { color: 'danger' as const, icon: 'solar:close-circle-bold', text: 'Failed' };
//             case "cancelled":
//                 return { color: 'danger' as const, icon: 'solar:forbidden-circle-bold', text: 'Cancelled' };
//             default:
//                 return { color: 'warning' as const, icon: 'solar:clock-circle-bold', text: 'Pending' };
//         }
//     };

//     const invoice_and_packing_data = (
//         <div className="space-y-3">
//             <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
//                 <div>
//                     <span className="font-medium text-gray-600">Invoice No: </span>
//                     <span className="font-semibold text-gray-900">{shipment.invoice_no}</span>
//                 </div>
//                 <div>
//                     <span className="font-medium text-gray-600">Invoice Date: </span>
//                     <span className="font-semibold text-gray-900">{shipment.invoice_date}</span>
//                 </div>
//                 <div>
//                     <span className="font-medium text-gray-600">Due Date: </span>
//                     <span className="font-semibold text-gray-900">{shipment.invoice_due_date}</span>
//                 </div>
//             </div>
//             <div className="flex gap-2">
//                 <Button
//                     color="primary"
//                     size="sm"
//                     onPress={() => navigate(`/shipment/invoice/${shipment.shipmentRequestID}`)}
//                     startContent={<Icon icon="solar:document-text-bold" width={16} />}
//                 >
//                     View Invoice
//                 </Button>
//                 <Button
//                     color="primary"
//                     size="sm"
//                     variant="bordered"
//                     onPress={() => navigate(`/shipment/packing-slip/${shipment.shipmentRequestID}`)}
//                     startContent={<Icon icon="solar:document-bold" width={16} />}
//                 >
//                     View Packing Slip
//                 </Button>
//             </div>
//         </div>
//     );

//     const label_created_data = (
//         <div className="space-y-4">
//             {invoice_and_packing_data}

//             <div className="border-t border-gray-200 pt-3 space-y-3">
//                 <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
//                     <div>
//                         <span className="font-medium text-gray-600">Label ID: </span>
//                         <span className="font-semibold text-gray-900">{shipment.label_id}</span>
//                     </div>
//                     <div>
//                         <span className="font-medium text-gray-600">Tracking Number: </span>
//                         <span className="font-semibold text-gray-900">{shipment.tracking_numbers}</span>
//                     </div>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                     <Button
//                         color="primary"
//                         size="sm"
//                         onPress={() => window.open(shipment.files_label_url, "_blank")}
//                         startContent={<Icon icon="solar:tag-bold" width={16} />}
//                     >
//                         View Label
//                     </Button>

//                     {/* Track buttons for each tracking number */}
//                     {trackingNumbers.length > 0 && chosenRate?.shipper_account_slug && (
//                         <>
//                             {trackingNumbers.map((trackingId, index) => (
//                                 <Button
//                                     key={index}
//                                     color="secondary"
//                                     size="sm"
//                                     variant="bordered"
//                                     startContent={<Icon icon="solar:map-point-wave-bold" width={16} />}
//                                     onPress={() => {
//                                         const trackingUrl = `https://www.aftership.com/track?c=${chosenRate.shipper_account_slug}&t=${trackingId}`;
//                                         window.open(trackingUrl, "_blank");
//                                     }}
//                                 >
//                                     Track {trackingNumbers.length > 1 ? `#${index + 1}` : ''}
//                                 </Button>
//                             ))}
//                         </>
//                     )}

//                     {trackingNumbers.length > 1 && masterTrackingNumber && chosenRate?.shipper_account_slug && (
//                         <Button
//                             color="primary"
//                             size="sm"
//                             startContent={<Icon icon="solar:map-point-wave-bold" width={16} />}
//                             onPress={() => {
//                                 const trackingUrl = `https://www.aftership.com/track?c=${chosenRate.shipper_account_slug}&t=${masterTrackingNumber}`;
//                                 window.open(trackingUrl, "_blank");
//                             }}
//                         >
//                             Track Master
//                         </Button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );

//     const label_failed_data = (
//         <div className="space-y-3">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                 <p className="text-red-700 text-sm font-medium flex items-start gap-2">
//                     <Icon icon="solar:danger-triangle-bold" width={18} className="flex-shrink-0 mt-0.5" />
//                     <span><strong>Error Details:</strong> {formattedLabelError} {formattedError}</span>
//                 </p>
//             </div>
//             <Button
//                 color="primary"
//                 size="sm"
//                 onPress={onCreateLabel}
//                 startContent={<Icon icon="solar:refresh-bold" width={16} />}
//             >
//                 Retry Create Label
//             </Button>
//         </div>
//     );

//     const labelChipConfig = getLabelChipConfig();

//     return (
//         <>
//             {shipment.service_options === 'Grab' || shipment.service_options === 'Supplier Pickup' ? (
//                 <Card className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
//                         <Icon icon="solar:document-text-bold" width={22} className="text-blue-600" />
//                         <h3 className="font-semibold text-blue-900 text-base">
//                             Invoice & Packing Slip Information
//                         </h3>
//                     </div>

//                     {shipment.approver_approved_date_time !== null ? (
//                         invoice_and_packing_data
//                     ) : (
//                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                             <p className="text-yellow-700 text-sm flex items-start gap-2">
//                                 <Icon icon="solar:clock-circle-bold" width={18} className="flex-shrink-0 mt-0.5" />
//                                 <span>
//                                     The shipment is pending approval. The information and documents will be available once approved.
//                                 </span>
//                             </p>
//                         </div>
//                     )}
//                 </Card>
//             ) : (
//                 <Card className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
//                         <div className="flex items-center gap-2">
//                             <Icon icon="solar:tag-bold" width={22} className="text-blue-600" />
//                             <h3 className="font-semibold text-blue-900 text-base">
//                                 Label & Invoice Information
//                             </h3>
//                         </div>
//                         <Chip
//                             color={labelChipConfig.color}
//                             variant="flat"
//                             size="sm"
//                             startContent={<Icon icon={labelChipConfig.icon} width={16} />}
//                             className="font-semibold"
//                         >
//                             {labelChipConfig.text}
//                         </Chip>
//                     </div>

//                     {(shipment.label_status === "created" || shipment.label_status === "cancelled") && label_created_data}
//                     {shipment.label_status === "failed" && label_failed_data}
//                 </Card>
//             )}
//         </>
//     );
// };

// export default LabelAndInvoiceInformation;
