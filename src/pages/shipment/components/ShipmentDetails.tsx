import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Textarea, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "@context/AuthContext";
import { useNotification } from "@context/NotificationContext";

const ShipmentDetails = () => {
  const { shipmentId } = useParams<{ shipmentId?: string }>();
  const [shipment, setShipment] = useState<any | null>(null); // using any for now until types are aligned
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showError, setShowError] = useState(false);

  const { user, msLoginUser } = useAuth();
  const { success, error: showNotificationError } = useNotification();

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!shipmentId) {
          throw new Error("Invalid shipment ID");
        }

        const baseUrl = import.meta.env.VITE_APP_GET_SHIPMENT_REQUEST_BY_ID;
        if (!baseUrl) {
          throw new Error("API URL for Shipment Details not configured");
        }

        const apiUrl = `${baseUrl}${shipmentId}`;
        const response = await axios.get(apiUrl);

        setShipment(response.data.shipment_request);
      } catch (err) {
        console.error("Error fetching shipment details:", err);
        setError(err instanceof Error ? err.message : "Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId]);

  const handleApprovalAction = async (action: 'approver_approved' | 'approver_rejected') => {
    if (!msLoginUser || !shipmentId) {
      showNotificationError('Missing user information or shipment ID', 'Authentication Error');
      return;
    }

    // Additional validation checks
    if (!shipment) {
      showNotificationError('Shipment data not loaded. Please refresh the page and try again.', 'Data Error');
      return;
    }

    if (shipment.request_status === 'approver_approved') {
      showNotificationError('This shipment has already been approved.', 'Already Processed');
      return;
    }

    if (shipment.request_status === 'approver_rejected') {
      showNotificationError('This shipment has already been rejected.', 'Already Processed');
      return;
    }

    if (!['requestor_requested', 'logistic_updated'].includes(shipment.request_status)) {
      showNotificationError(
        `This shipment cannot be ${action === 'approver_approved' ? 'approved' : 'rejected'} in its current status: ${shipment.request_status}`,
        'Invalid Status'
      );
      return;
    }

    // Check if user has permission
    if (msLoginUser.email.toLowerCase() !== shipment.approver_user_mail?.toLowerCase()) {
      showNotificationError(
        'You are not authorized to approve this shipment. Only the assigned approver can take this action.',
        'Permission Denied'
      );
      return;
    }

    // Check if rejection requires a remark
    const isApprove = action === 'approver_approved';
    if (!isApprove && (!remark || remark.trim().length === 0)) {
      showNotificationError(
        'Please provide a remark explaining the reason for rejection.',
        'Remark Required'
      );
      return;
    }

    const setLoadingState = isApprove ? setIsApproving : setIsRejecting;

    try {
      setLoadingState(true);

      const approvalUrl = import.meta.env.VITE_APP_APPROVAL_SHIPMENT_REQUEST;
      if (!approvalUrl) {
        throw new Error("Approval API URL not configured");
      }

      const apiUrl = `${approvalUrl}${shipmentId}`;

      const payload = {
        login_user_id: user?.userID || 0,
        login_user_name: msLoginUser.name,
        login_user_mail: msLoginUser.email,
        remark: remark.trim() || (isApprove ? "Approved" : "Rejected"),
        send_status: action
      };

      console.log('🔍 Debug Approval API:');
      console.log('  - Base URL from env:', approvalUrl);
      console.log('  - Shipment ID:', shipmentId);
      console.log('  - Final API URL:', apiUrl);
      console.log('  - Payload:', payload);

      const response = await axios.put(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        const responseData = response.data;

        // Check for label creation failures in the response
        const labelResponse = responseData.create_label_response;
        const hasLabelErrors = labelResponse?.$create_label_response_body?.meta?.details?.length > 0;

        if (responseData.status === 'success') {
          const actionText = isApprove ? 'approved' : 'rejected';

          // Check if label creation failed
          if (hasLabelErrors || responseData.response_message === 'Label created failed.') {
            // Parse detailed label creation errors
            const labelErrors = labelResponse?.$create_label_response_body?.meta?.details || [];

            if (labelErrors.length > 0) {
              // Format detailed error messages
              const errorDetails = labelErrors.map((error: any) => {
                const field = error.path || 'Unknown field';
                const message = error.info || 'Unknown error';
                return `• ${field}: ${message}`;
              }).join('\n');

              const alertMessage = `✅ Shipment ${actionText} successfully!\n\n❌ However, shipping label creation failed:\n\n${errorDetails}\n\n📞 Please contact the logistics team to resolve these label creation issues before the shipment can proceed.`;

              showNotificationError(alertMessage, 'Partial Success');
            } else {
              // Fallback if no detailed errors but label creation failed
              const labelMessage = responseData.label_message || responseData.response_message || 'Unknown label creation error';
              showNotificationError(`✅ Shipment ${actionText} successfully!\n\n❌ However, shipping label creation failed: ${labelMessage}\n\n📞 Please contact the logistics team.`, 'Partial Success');
            }
          } else {
            // Pure success - both approval and label creation worked
            success(`Shipment ${actionText} successfully!\n\nShipping label has been created and is ready for use.`, 'Success');
          }
        } else {
          // Handle non-success status but still show action completion
          const actionText = isApprove ? 'approved' : 'rejected';
          success(`Shipment ${actionText} successfully!`, 'Success');
        }

        // Refresh shipment data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during approval action:', error);
      const actionText = isApprove ? 'approval' : 'rejection';

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        // Handle specific HTTP status codes
        switch (status) {
          case 400:
            showNotificationError(
              `Invalid ${actionText} request. Please check the shipment details and try again.`,
              `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Failed`
            );
            break;
          case 401:
            showNotificationError(
              `Authentication required. Please log in again to ${isApprove ? 'approve' : 'reject'} this shipment.`,
              'Authentication Error'
            );
            break;
          case 403:
            showNotificationError(
              `You don't have permission to ${isApprove ? 'approve' : 'reject'} this shipment. Please contact your administrator.`,
              'Permission Denied'
            );
            break;
          case 404:
            showNotificationError(
              `Shipment not found. The shipment may have been deleted or moved.`,
              'Shipment Not Found'
            );
            break;
          case 409:
            showNotificationError(
              `This shipment has already been processed. Please refresh the page to see the current status.`,
              'Conflict Error'
            );
            break;
          case 422:
            if (errorData?.meta?.details && Array.isArray(errorData.meta.details)) {
              const errorMessages = errorData.meta.details.map((detail: any) =>
                `• ${detail.path}: ${detail.info}`
              ).join('\n');
              showNotificationError(
                `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} failed due to validation errors:\n\n${errorMessages}`,
                'Validation Error'
              );
            } else {
              showNotificationError(
                `Invalid data provided for ${actionText}. Please check the form and try again.`,
                'Validation Error'
              );
            }
            break;
          case 500:
            showNotificationError(
              `Server error occurred while processing ${actionText}. Please try again in a few moments or contact support.`,
              'Server Error'
            );
            break;
          case 502:
          case 503:
          case 504:
            showNotificationError(
              `Service temporarily unavailable. Please try the ${actionText} again in a few moments.`,
              'Service Unavailable'
            );
            break;
          default:
            // Handle custom error messages from API
            if (errorData?.meta?.message) {
              showNotificationError(
                `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} failed: ${errorData.meta.message}`,
                `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Error`
              );
            } else {
              showNotificationError(
                `Failed to process ${actionText}. Please try again or contact support if the problem persists.`,
                `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Failed`
              );
            }
        }
      } else if (error instanceof Error) {
        // Handle network errors or other JavaScript errors
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          showNotificationError(
            `Network connection failed. Please check your internet connection and try the ${actionText} again.`,
            'Connection Error'
          );
        } else {
          showNotificationError(
            `Unexpected error during ${actionText}: ${error.message}`,
            `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Error`
          );
        }
      } else {
        // Handle unknown errors
        showNotificationError(
          `An unexpected error occurred during ${actionText}. Please refresh the page and try again.`,
          'Unknown Error'
        );
      }
    } finally {
      setLoadingState(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!shipmentId) {
      showNotificationError('Shipment ID is missing. Please refresh the page and try again.', 'Data Error');
      return;
    }

    // Validate shipment status
    if (!shipment) {
      showNotificationError('Shipment data not loaded. Please refresh the page and try again.', 'Data Error');
      return;
    }

    if (shipment.request_status !== 'approver_approved') {
      showNotificationError('Labels can only be created for approved shipments.', 'Invalid Status');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_APP_CREATE_LABEL;
      if (!baseUrl) {
        showNotificationError('Label creation service is not configured. Please contact support.', 'Configuration Error');
        return;
      }

      const apiUrl = `${baseUrl}${shipmentId}`;
      console.log("🔍 Debug Create Label:");
      console.log("  - Base URL from env:", baseUrl);
      console.log("  - Shipment ID:", shipmentId);
      console.log("  - Final API URL:", apiUrl);

      const response = await axios.post(apiUrl, null, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        success('Label created successfully!', 'Success');
        window.location.reload();
      } else {
        showNotificationError(`Failed to create label (HTTP ${response.status}).`, 'Label Creation Failed');
      }
    } catch (error) {
      console.error("Error creating label:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const meta = errorData?.$create_label_response_body?.meta;
        const details = meta?.details;

        // Handle specific HTTP status codes for label creation
        switch (status) {
          case 400:
            let msg = errorData?.message || meta?.message || "Invalid label creation request";

            // If validation details exist, append them
            if (Array.isArray(details) && details.length > 0) {
              const formattedDetails = details
                .map((d: any) => `• ${d.path}: ${d.info}`)
                .join("\n");
              msg += `\n\nValidation Errors:\n${formattedDetails}`;
            }

            showNotificationError(
              `Label creation failed due to invalid data:\n\n${msg}`,
              'Invalid Request'
            );
            break;
          case 401:
            showNotificationError(
              'Authentication required to create labels. Please log in again.',
              'Authentication Error'
            );
            break;
          case 403:
            showNotificationError(
              'You don\'t have permission to create labels for this shipment.',
              'Permission Denied'
            );
            break;
          case 404:
            showNotificationError(
              'Shipment not found. The shipment may have been deleted or moved.',
              'Shipment Not Found'
            );
            break;
          case 409:
            showNotificationError(
              'A label has already been created for this shipment.',
              'Label Already Exists'
            );
            break;
          case 422:
            let validationMsg = errorData?.message || meta?.message || "Validation failed";

            if (Array.isArray(details) && details.length > 0) {
              const formattedDetails = details
                .map((d: any) => `• ${d.path}: ${d.info}`)
                .join("\n");
              validationMsg += `\n\nDetails:\n${formattedDetails}`;
            }

            showNotificationError(
              `Label creation failed validation:\n\n${validationMsg}`,
              'Validation Error'
            );
            break;
          case 500:
            showNotificationError(
              'Server error occurred while creating the label. Please try again in a few moments.',
              'Server Error'
            );
            break;
          case 502:
          case 503:
          case 504:
            showNotificationError(
              'Label creation service is temporarily unavailable. Please try again later.',
              'Service Unavailable'
            );
            break;
          default:
            let defaultMsg = errorData?.message || meta?.message || "Unknown error occurred";

            if (Array.isArray(details) && details.length > 0) {
              const formattedDetails = details
                .map((d: any) => `• ${d.path}: ${d.info}`)
                .join("\n");
              defaultMsg += `\n\nDetails:\n${formattedDetails}`;
            }

            showNotificationError(
              `Failed to create label:\n\n${defaultMsg}`,
              'Label Creation Failed'
            );
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          showNotificationError(
            'Network connection failed. Please check your internet connection and try again.',
            'Connection Error'
          );
        } else {
          showNotificationError(
            `Unexpected error during label creation: ${error.message}`,
            'Label Creation Error'
          );
        }
      } else {
        showNotificationError(
          'An unexpected error occurred while creating the label. Please try again.',
          'Unknown Error'
        );
      }
    }
  };

  // const formattedError = shipment.error_msg.replace(/\|/g, '\n|');
  const formattedError = shipment?.error_msg ? shipment.error_msg.replace(/\|/g, '\n|') : "";


  interface DetailRowProps {
    label: string
    value: React.ReactNode | null | undefined
  }

  const DetailRow = ({ label, value }: DetailRowProps) => (
    <div className="flex justify-start py-1 text-sm">
      <span className="text-gray-600 font-bold">{label}:</span>
      <span className={`ml-2 ${value == null ? "text-red-500 italic" : "text-gray-800"}`}>
        {value == null ? "N/A" : value}
      </span>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-danger">Error: {error}</p>
        <Link to="/shipment">
          <Button color="primary">Back to Shipments</Button>
        </Link>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <p>No details found for shipment ID {shipmentId}</p>
        <Link to="/shipment">
          <Button color="primary">Back to Shipments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-4 space-y-8">

      {/* General Info */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">General Information</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-1 text-sm">
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
              {shipment.request_status}
            </Chip>
            <DetailRow label="Topic" value={`${shipment.topic} (${shipment.po_number})`} />
            <DetailRow label="Sales Person" value={`${shipment.sales_person} `} />
            <DetailRow label="Requestor" value={`${shipment.created_user_name} (${shipment.created_user_mail})`} />
            <DetailRow label="Approver" value={`${shipment.approver_user_name} (${shipment.approver_user_mail})`} />
            <DetailRow label="Remark" value={shipment.remark} />
            <DetailRow label="Customs Purpose" value={shipment.customs_purpose} />
            <DetailRow label="Incoterms" value={shipment.customs_terms_of_trade} />
          </div>
          {["requestor_requested", "logistic_updated"].includes(shipment.request_status) &&
            msLoginUser?.email === shipment.approver_user_mail ? (
            <section className="bg-gray-50 rounded-xl border p-4 space-y-3">
              <h2 className="text-base font-semibold">Approval Actions</h2>
              <Textarea
                placeholder="Enter remark (optional)"
                value={remark}
                onValueChange={setRemark}
                size="sm"
                variant="bordered"
              />
              <div className="flex gap-2">
                <Button
                  color="success"
                  onPress={() => handleApprovalAction("approver_approved")}
                  isLoading={isApproving}
                  disabled={isApproving || isRejecting}
                  size="sm"
                  startContent={<Icon icon="solar:check-circle-bold" />}
                >
                  {isApproving ? "Approving..." : "Approve"}
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleApprovalAction("approver_rejected")}
                  isLoading={isRejecting}
                  disabled={isApproving || isRejecting}
                  size="sm"
                  startContent={<Icon icon="solar:close-circle-bold" />}
                >
                  {isRejecting ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </section>
          ) : (
            <div>
              {shipment.label_status === "failed" && (
                <div className="mb-3">
                  <p className="text-red-600 font-semibold mb-2">
                    ⚠️ Label creation failed 
                    {/* <br /> */}
                    <Button
                    size="sm"
                    color="warning"
                    onPress={() => setShowError(!showError)}
                    className="ml-2"
                  >
                    {showError ? "Hide Error Details" : "Show Error Details"}
                  </Button>
                  </p>
                  

                  {showError && (
                    <div className="text-gray-800 text-sm break-words whitespace-pre-wrap border p-2 rounded bg-gray-50">
                      <b>Details:</b> {formattedError}
                    </div>
                  )}

                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleCreateLabel}
                    startContent={<Icon icon="solar:refresh-bold" />}
                  >
                    Retry Create Label
                  </Button>
                </div>
              )}

              <DetailRow label="Label" value={shipment.files_label_url} />
              <DetailRow label="Invoice No" value={shipment.invoice_no} />
              <DetailRow label="Invoice Date" value={shipment.invoice_date} />
              <DetailRow label="Invoice Due Date" value={shipment.invoice_due_date} />
              <DetailRow label="Invoice" value={shipment.files_invoice_url} />
              <DetailRow label="Packing Slip" value={shipment.files_packing_slip} />
            </div>
          )}


        </div>
      </section>
      {/* Ship From / Ship To */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Ship From</h2>
          <DetailRow label="Company" value={shipment.ship_from?.company_name} />
          <DetailRow label="Address" value={`${shipment.ship_from?.street1}, ${shipment.ship_from?.city}, ${shipment.ship_from?.country}`} />
          <DetailRow label="Contact" value={`${shipment.ship_from?.contact_name} (${shipment.ship_from?.phone})`} />
          <DetailRow label="Email" value={shipment.ship_from?.email} />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Ship To</h2>
          <DetailRow label="Company" value={shipment.ship_to?.company_name} />
          <DetailRow label="Address" value={`${shipment.ship_to?.street1}, ${shipment.ship_to?.city}, ${shipment.ship_to?.country}`} />
          <DetailRow label="Contact" value={`${shipment.ship_to?.contact_name} (${shipment.ship_to?.phone})`} />
          <DetailRow label="Email" value={shipment.ship_to?.email} />
        </div>
      </section>

      <Divider />

      {/* Rates */}
      {shipment.rates?.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">Rates</h2>
          <Table shadow="none" aria-label="Rates Table">
            <TableHeader>
              <TableColumn>Chosen</TableColumn>
              <TableColumn>No.</TableColumn>
              <TableColumn>Carrier</TableColumn>
              <TableColumn>Service</TableColumn>
              <TableColumn>Transit Time</TableColumn>
              <TableColumn>Cost</TableColumn>
            </TableHeader>
            <TableBody>
              {shipment.rates.map((rate: any, idx: number) => (
                <TableRow key={idx} className={rate.chosen == 1 ? "bg-green-50" : ""}>
                  <TableCell>
                    {rate.chosen == 1 ? <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" /> : null}
                  </TableCell>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{rate.shipper_account_description}</TableCell>
                  <TableCell>{rate.service_name}</TableCell>
                  <TableCell>{rate.transit_time} days</TableCell>
                  <TableCell>{rate.total_charge_amount} {rate.total_charge_currency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      <Divider />

      {/* Parcels */}
      {shipment.parcels?.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">
            Parcels ({shipment.parcels.length})
          </h2>
          <Table shadow="none" aria-label="Parcels Table">
            <TableHeader>
              <TableColumn>No.</TableColumn>
              <TableColumn>Description</TableColumn>
              <TableColumn>Dimensions ({shipment.parcels[0].dimension_unit})</TableColumn>
              <TableColumn>Weight ({shipment.parcels[0].weight_unit})</TableColumn>
              <TableColumn>Items</TableColumn>
            </TableHeader>
            <TableBody>
              {shipment.parcels.map((parcel: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{parcel.description}</TableCell>
                  <TableCell>{parcel.width} × {parcel.height} × {parcel.depth}</TableCell>
                  <TableCell>{parcel.weight_value}</TableCell>
                  <TableCell>
                    {parcel.items?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {parcel.items.map((item: any, i: number) => (
                          <li key={i}>{item.description} – {item.quantity} pcs, {item.weight_value} {item.weight_unit} | HS CODE - {item.hscode || 'N/A'}, {item.origin_country} </li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400">No items</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

    </div>

  );
};

export default ShipmentDetails;
