import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spinner, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Textarea, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "@context/AuthContext";
import { useNotification } from "@context/NotificationContext";

const ShipmentDetails = () => {
  const { shipmentId } = useParams<{ shipmentId?: string }>();
  const navigate = useNavigate();
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

    const isApprove = action === 'approver_approved';
    const setLoadingState = isApprove ? setIsApproving : setIsRejecting;

    // Check if remark is required for rejection
    if (!isApprove && !remark.trim()) {
      showNotificationError('Remark is required when rejecting a shipment request.', 'Missing Remark');
      return;
    }

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

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.meta?.message) {
          showNotificationError(`Action failed: ${errorData.meta.message}`, 'Action Failed');
        } else {
          showNotificationError('Failed to process approval action. Please try again.', 'Action Failed');
        }
      } else {
        showNotificationError('Failed to process approval action. Please check your connection and try again.', 'Connection Error');
      }
    } finally {
      setLoadingState(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!shipmentId) return;

    try {
      const baseUrl = import.meta.env.VITE_APP_CREATE_LABEL;
      if (!baseUrl) {
        throw new Error("Create Label API URL not configured");
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
        const errorData = error.response?.data;
        const meta = errorData?.$create_label_response_body?.meta;
        const details = meta?.details;

        let msg = errorData?.message || meta?.message || "Unknown error";

        // If validation details exist, append them
        if (Array.isArray(details) && details.length > 0) {
          const formattedDetails = details
            .map((d: any) => `• ${d.path}: ${d.info}`)
            .join("\n");
          msg += `\n\nDetails:\n${formattedDetails}`;
        }

        showNotificationError(`Failed to create label:\n${msg}`, 'Label Creation Failed');
      } else {
        showNotificationError('Failed to create label. Please check your connection.', 'Connection Error');
      }
    }
  };

  const handleDuplicateShipment = () => {
    if (!shipment) return;

    // Prepare shipment data for duplication (excluding rates and sensitive data)
    const duplicateData = {
      // Basic Information
      send_to: shipment.send_to || 'Approver',
      topic: shipment.topic || '',
      other_topic: shipment.other_topic || '',
      sales_person: shipment.sales_person || '',
      po_number: shipment.po_number || '',
      po_date: shipment.po_date || '',
      service_options: shipment.service_options || '',
      urgent_reason: shipment.urgent_reason || '',
      remark: shipment.remark || '',
      due_date: shipment.due_date || '',

      // Ship From Address
      ship_from_company_name: shipment.ship_from?.company_name || '',
      ship_from_contact_name: shipment.ship_from?.contact_name || '',
      ship_from_street1: shipment.ship_from?.street1 || '',
      ship_from_street2: shipment.ship_from?.street2 || '',
      ship_from_street3: shipment.ship_from?.street3 || '',
      ship_from_city: shipment.ship_from?.city || '',
      ship_from_state: shipment.ship_from?.state || '',
      ship_from_postal_code: shipment.ship_from?.postal_code || '',
      ship_from_country: shipment.ship_from?.country || '',
      ship_from_phone: shipment.ship_from?.phone || '',
      ship_from_email: shipment.ship_from?.email || '',

      // Ship To Address
      ship_to_company_name: shipment.ship_to?.company_name || '',
      ship_to_contact_name: shipment.ship_to?.contact_name || '',
      ship_to_street1: shipment.ship_to?.street1 || '',
      ship_to_street2: shipment.ship_to?.street2 || '',
      ship_to_street3: shipment.ship_to?.street3 || '',
      ship_to_city: shipment.ship_to?.city || '',
      ship_to_state: shipment.ship_to?.state || '',
      ship_to_postal_code: shipment.ship_to?.postal_code || '',
      ship_to_country: shipment.ship_to?.country || '',
      ship_to_phone: shipment.ship_to?.phone || '',
      ship_to_email: shipment.ship_to?.email || '',

      // Parcels data (excluding rates)
      parcels: shipment.parcels?.map((parcel: any) => ({
        box_type: parcel.box_type || 'custom',
        box_type_name: parcel.box_type_name || '',
        width: parcel.width || 0,
        height: parcel.height || 0,
        depth: parcel.depth || 0,
        dimension_unit: parcel.dimension_unit || 'cm',
        weight_value: parcel.weight_value || 0,
        net_weight_value: parcel.net_weight_value || 0,
        parcel_weight_value: parcel.parcel_weight_value || 0,
        weight_unit: parcel.weight_unit || 'kg',
        description: parcel.description || '',
        parcel_items: parcel.items?.map((item: any) => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          price_currency: item.price_currency || 'THB',
          price_amount: item.price_amount || 0,
          item_id: item.item_id || '',
          origin_country: item.origin_country || '',
          weight_unit: item.weight_unit || 'kg',
          weight_value: item.weight_value || 0,
          sku: item.sku || '',
          hs_code: item.hs_code || item.hscode || '',
          return_reason: ''
        })) || []
      })) || [],

      // Customs Information
      customs_purpose: shipment.customs_purpose || '',
      customs_terms_of_trade: shipment.customs_terms_of_trade || '',

      // Clear rate and approval data
      rates: [],

      // Pickup Information
      pick_up_status: shipment.pick_up_status || false,
      pick_up_date: shipment.pick_up_date || '',
      pick_up_start_time: shipment.pick_up_start_time || '',
      pick_up_end_time: shipment.pick_up_end_time || '',
      pick_up_instructions: shipment.pick_up_instructions || '',

      // Insurance (optional, can be cleared)
      insurance_enabled: false,
      insurance_insured_value_amount: 0,
      insurance_insured_value_currency: 'THB'
    };

    // Store the duplicate data in sessionStorage
    sessionStorage.setItem('duplicateShipmentData', JSON.stringify(duplicateData));

    // Navigate to shipment form with duplicate parameter
    navigate('/shipment/request-form?duplicate=true');

    success('Shipment data prepared for duplication. Please review and submit the new shipment request.', 'Duplicate Created');
  };

  // const formattedError = shipment.error_msg.replace(/\|/g, '\n|');
  const formattedError = shipment?.error_msg ? shipment.error_msg.replace(/\|/g, '\n|') : "";


  interface DetailRowProps {
    label: string
    value: React.ReactNode | null | undefined
  }

  const DetailRow = ({ label, value }: DetailRowProps) => {
    const isUrl = (str: string) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };

    const renderValue = () => {
      if (value == null) return "N/A";

      const stringValue = String(value);
      if (isUrl(stringValue)) {
        return (
          <>
            <a
              href={stringValue}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              View
            </a>
          </>

        );
      }

      return stringValue;
    };

    return (
      <div className="flex justify-start items-center py-1 text-sm">
        <span className="text-gray-600 font-bold">{label}:</span>
        <span className={`ml-2 ${value == null ? "text-red-500 italic" : "text-gray-800"}`}>
          {renderValue()}
        </span>
      </div>
    );
  }

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
          {(msLoginUser?.email === 'wawa@xenoptics.com' || msLoginUser?.email === 'susu@xenoptics.com' || msLoginUser?.email === 'thinzar@xenoptics.com' ) && (
            <Button
              color="secondary"
              size="sm"
              variant="bordered"
              startContent={<Icon icon="solar:copy-bold" />}
              onPress={handleDuplicateShipment}
            >
              Developer Ony : Duplicate Shipment Request
            </Button>
          )}
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
            {/* <p>
              MS login mail - {msLoginUser?.email} <br />
              shipment.approver_user_mail - {shipment.approver_user_mail}
            </p> */}
          </div>
          {["requestor_requested", "logistic_updated"].includes(shipment.request_status) &&
            msLoginUser?.email.toLowerCase() === shipment.approver_user_mail.toLowerCase() ? (
            <section className="bg-gray-50 rounded-xl border p-4 space-y-3">
              <h2 className="text-base font-semibold">Approval Actions</h2>
              <Textarea
                placeholder="Enter remark (optional for approval, required for rejection)"
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
              <TableColumn>Box Type</TableColumn>
              <TableColumn>Dimensions ({shipment.parcels[0].dimension_unit})</TableColumn>
              <TableColumn>Weight ({shipment.parcels[0].weight_unit})</TableColumn>
              <TableColumn>Items</TableColumn>
            </TableHeader>
            <TableBody>
              {shipment.parcels.map((parcel: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{parcel.description}</TableCell>
                  <TableCell>{parcel.box_type}</TableCell>
                  <TableCell>{parcel.width} × {parcel.height} × {parcel.depth}</TableCell>
                  <TableCell>{parcel.weight_value}</TableCell>
                  <TableCell>
                    {parcel.items?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {parcel.items.map((item: any, i: number) => (
                          <li key={i}>{item.description} – {item.quantity} pcs, {item.weight_value} {item.weight_unit} | HS CODE - {item.hs_code || 'N/A'}, {item.origin_country} </li>
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
