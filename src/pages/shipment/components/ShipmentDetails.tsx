import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spinner, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Textarea, Divider, Chip, Input, Select, SelectItem, Autocomplete, AutocompleteItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "@context/AuthContext";
import { useNotification } from "@context/NotificationContext";
import { INCOTERMS, CUSTOM_PURPOSES } from "../constants/form-defaults";
import { COUNTRIES } from "../constants/countries";

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
  const [showAllRates, setShowAllRates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isUpdatingLogistics, setIsUpdatingLogistics] = useState(false);
  const [editCustomsPurpose, setEditCustomsPurpose] = useState("");
  const [editCustomsTermsOfTrade, setEditCustomsTermsOfTrade] = useState("");
  const [editedParcelItems, setEditedParcelItems] = useState<any[]>([]);

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

        const shipmentData = response.data.shipment_request;
        setShipment(shipmentData);

        // Initialize edit state
        setEditCustomsPurpose(shipmentData.customs_purpose || "");
        setEditCustomsTermsOfTrade(shipmentData.customs_terms_of_trade || "");

        // Initialize parcel items for editing
        const allItems: any[] = [];
        shipmentData.parcels?.forEach((parcel: any, parcelIndex: number) => {
          parcel.items?.forEach((item: any, itemIndex: number) => {
            allItems.push({
              ...item,
              parcelIndex,
              itemIndex,
              id: `${parcelIndex}-${itemIndex}`,
              parcelItemID: item.parcelItemID // Ensure we have the required ID
            });
          });
        });
        setEditedParcelItems(allItems);
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

  const handleLogisticsUpdate = async () => {
    if (!shipmentId || !msLoginUser) return;

    try {
      setIsUpdatingLogistics(true);

      const logisticUrl = import.meta.env.VITE_APP_LOGISTIC_EDIT_SHIPMENT_REQUEST;
      if (!logisticUrl) {
        throw new Error("Logistics API URL not configured");
      }

      const apiUrl = `${logisticUrl}${shipmentId}`;

      // Prepare parcels data in the format expected by the backend
      const parcelsData = shipment.parcels?.map((parcel: any) => ({
        parcel_items: parcel.items?.map((originalItem: any) => {
          // Find the edited version of this item
          const editedItem = editedParcelItems.find(
            (edited) => edited.parcelItemID === originalItem.parcelItemID
          );

          return {
            parcelItemID: originalItem.parcelItemID,
            item_id: editedItem?.item_id || originalItem.item_id || '',
            origin_country: editedItem?.origin_country || originalItem.origin_country || '',
            hs_code: editedItem?.hs_code || originalItem.hs_code || ''
          };
        }) || []
      })) || [];

      const payload = {
        send_status: 'logistic_updated',
        login_user_id: user?.userID || 0,
        login_user_name: msLoginUser.name,
        login_user_mail: msLoginUser.email,
        customs_purpose: editCustomsPurpose || shipment.customs_purpose,
        customs_terms_of_trade: editCustomsTermsOfTrade || shipment.customs_terms_of_trade,
        parcels: parcelsData,
        remark: 'Logistics information updated'
      };

      console.log('🔍 Debug Logistics Update:');
      console.log('  - Base URL from env:', logisticUrl);
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

        if (responseData.status === 'success') {
          success('Logistics information updated successfully!', 'Success');
          window.location.reload();
        } else {
          showNotificationError('Failed to update logistics information. Please try again.', 'Update Failed');
        }
      }

    } catch (error) {
      console.error('Error updating logistics information:', error);

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;

        // Log the full error for debugging
        console.error('Full API Error Response:', errorData);

        if (errorData.message && errorData.message.includes('parcel_items')) {
          showNotificationError('Database configuration issue detected. The parcel_items table may not exist or be accessible. Please contact the development team.', 'Database Error');
        } else if (errorData.message) {
          showNotificationError(`Update failed: ${errorData.message}`, 'Update Failed');
        } else if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.values(errorData.errors).flat().join('\n');
          showNotificationError(`Validation failed:\n${errorMessages}`, 'Validation Error');
        } else {
          showNotificationError('Failed to update logistics information. Please try again.', 'Update Failed');
        }
      } else {
        showNotificationError('Failed to update logistics information. Please check your connection and try again.', 'Connection Error');
      }
    } finally {
      setIsUpdatingLogistics(false);
    }
  };

  const handleParcelItemUpdate = (itemId: string, field: string, value: string) => {
    setEditedParcelItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
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

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'requestor_requested':
        return 'WAITING APPROVER';
      case 'send_to_logistic':
        return 'WAITING LOGISTICS';
      case 'logistic_updated':
        return 'WAITING APPROVER';
      case 'approver_approved':
        return 'APPROVED';
      case 'approver_rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  };

  const getDisplayStatusHistory = (status: string) => {
    switch (status) {
      case 'requestor_requested':
        return 'Requested to Approver';
      case 'send_to_logistic':
        return 'Send to Logistic to Review';
      case 'logistic_updated':
        return 'Logistic Updated';
      case 'approver_approved':
        return 'Approved';
      case 'approver_rejected':
        return 'Rejected';
      default:
        return status.toUpperCase();
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${year} ${month} ${day} [${displayHours}:${minutes}${period}]`;
  };

  const getIncotermDisplay = (key: string) => {
    const incoterm = INCOTERMS.find(term => term.key === key);
    return incoterm ? incoterm.value : key;
  };

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
    <div className="mx-auto w-full p-4 space-y-2">

      {/* General Info */}
      <section className="space-y-1">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">General Information</h2>
          <div className="flex gap-2">
            {(msLoginUser?.email === 'wawa@xenoptics.com' || msLoginUser?.email === 'susu@xenoptics.com' || msLoginUser?.email === 'thinzar@xenoptics.com') && (
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
            {/* <DetailRow label="Requestor" value={`${shipment.created_user_name} (${shipment.created_user_mail})`} /> */}
            <DetailRow label="Requestor" value={`${shipment.created_user_name}`} />
            {/* <DetailRow label="Approver" value={`${shipment.approver_user_name} (${shipment.approver_user_mail})`} /> */}
            <DetailRow label="Approver" value={`${shipment.approver_user_name} `} />
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
      {/* Ship From / Ship To */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="space-y-0">
          <h2 className="text-base font-semibold">Ship From</h2>
          <DetailRow label="Company" value={shipment.ship_from?.company_name} />
          <DetailRow label="Address" value={`${shipment.ship_from?.street1}, ${shipment.ship_from?.city}, ${shipment.ship_from?.country}`} />
          <DetailRow label="Contact" value={`${shipment.ship_from?.contact_name} (${shipment.ship_from?.phone})`} />
          <DetailRow label="Email" value={shipment.ship_from?.email} />
        </div>
        <div className="space-y-0">
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
          <div className="flex justify-left gap-6 items-center mb-0">
            <h2 className="text-base font-semibold">Rates</h2>
            {shipment.rates.length > 1 && (
              <Button
                size="sm"
                variant="bordered"
                onPress={() => setShowAllRates(!showAllRates)}
                startContent={<Icon icon={showAllRates ? "solar:eye-closed-bold" : "solar:eye-bold"} />}
              >
                {showAllRates ? "Show Selected Only" : "View All Rates"}
              </Button>
            )}
          </div>
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
              {(showAllRates ? shipment.rates : shipment.rates.filter((rate: any) => rate.chosen == 1))
                .map((rate: any, idx: number) => (
                  <TableRow key={idx} className={rate.chosen == 1 ? "bg-green-50" : ""}>
                    <TableCell>
                      {rate.chosen == 1 ? <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" /> : null}
                    </TableCell>
                    <TableCell>{showAllRates ? shipment.rates.indexOf(rate) + 1 : idx + 1}</TableCell>
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
          <h2 className="text-base font-semibold mb-0">
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
                  <TableCell>{Math.floor(parcel.width)} × {Math.floor(parcel.height)} × {Math.floor(parcel.depth)}</TableCell>
                  <TableCell>{parcel.weight_value}</TableCell>
                  <TableCell>
                    {parcel.items?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {parcel.items.map((item: any, i: number) => (
                          <li key={i}>
                            <strong>SKU:</strong> {item.sku || 'N/A'} | <strong>Description:</strong> {item.description} | <strong>Price:</strong> {parseFloat(item.price_amount)} {item.price_currency} | <strong>Qty:</strong> {item.quantity} pcs | <strong>Weight:</strong> {parseFloat(item.weight_value).toFixed(1)} {item.weight_unit} | <strong>HS CODE:</strong> {item.hs_code || 'N/A'} | <strong>Origin:</strong> {item.origin_country}
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400">No items</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <hr />
        </section>
      )}

       {/* Shipment History  */}
      <section className="space-y-1">
        <div className="flex justify-left gap-6 items-center mb-0">
          <h2 className="text-base font-semibold">Request History</h2>
          <Button
            color="primary"
            size="sm"
            variant="bordered"
            startContent={<Icon icon={showHistory ? "solar:eye-closed-bold" : "solar:history-bold"} />}
            onPress={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "Show History"}
          </Button>
        </div>
        {/* History Section */}
        {showHistory &&
          shipment.shipment_request_histories &&
          shipment.shipment_request_histories.length > 0 && (
            <div>
              {shipment.shipment_request_histories
                .sort((a: any, b: any) => {
                  // Sort by date, with fallback for null dates
                  const dateA = new Date(
                    a.history_record_date_time || a.shipment_request_created_date_time || 0
                  );
                  const dateB = new Date(
                    b.history_record_date_time || b.shipment_request_created_date_time || 0
                  );
                  return dateB.getTime() - dateA.getTime(); // Most recent first
                })
                .map((history: any, idx: number) => (
                  <div key={idx} className="text-sm text-gray-700">
                    <p>
                      {history.user_name} ({history.user_role || 'logistics'})  <Chip
                        size="sm"
                        variant="flat"
                        color={
                          history.status?.includes('approved') ? 'success' :
                            history.status?.includes('rejected') ? 'danger' :
                              history.status?.includes('updated') ? 'warning' : 'primary'
                        }
                      >
                        {getDisplayStatusHistory(history.status)}
                      </Chip>  {formatDateTime(history.history_record_date_time || history.shipment_request_created_date_time)} | <b>Remark: </b> {history.remark || 'N/A'}
                    </p>
                  </div>
                ))}
            </div>
          )}

        <hr />
      </section>

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
      ) : shipment.request_status === "send_to_logistic" ? (
        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-blue-50 rounded-xl border p-4 space-y-4">
            <h2 className="text-base font-semibold">Logistics Information Update</h2>

            {/* Customs Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Customs Purpose"
                placeholder="Select customs purpose"
                selectedKeys={editCustomsPurpose ? [editCustomsPurpose] : []}
                onSelectionChange={(keys) => setEditCustomsPurpose(Array.from(keys)[0] as string)}
                size="sm"
                variant="bordered"
              >
                {CUSTOM_PURPOSES.map((purpose) => (
                  <SelectItem key={purpose.key} value={purpose.key}>
                    {purpose.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Customs Terms of Trade"
                placeholder="Select terms of trade"
                selectedKeys={editCustomsTermsOfTrade ? [editCustomsTermsOfTrade] : []}
                onSelectionChange={(keys) => setEditCustomsTermsOfTrade(Array.from(keys)[0] as string)}
                size="sm"
                variant="bordered"
              >
                {INCOTERMS.map((term) => (
                  <SelectItem key={term.key} value={term.key}>
                    {term.value}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Parcel Items */}
            {editedParcelItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Parcel Items</h3>
                <div className="space-y-2">
                  {editedParcelItems.map((item) => (
                    <div key={item.id} className="grid md:grid-cols-2 gap-2 p-3 rounded border">
                      <div className="text-xs text-gray-600 md:col-span-4">
                        <strong>Description:</strong> {item.description}
                      </div>
                      <Input
                        label="HS Code"
                        value={item.hs_code || ""}
                        onValueChange={(value) => handleParcelItemUpdate(item.id, "hs_code", value)}
                        size="sm"
                        variant="bordered"
                      />
                      <Autocomplete
                        label="Origin Country"
                        placeholder="Search country..."
                        selectedKey={item.origin_country || ""}
                        onSelectionChange={(key) => handleParcelItemUpdate(item.id, "origin_country", key as string)}
                        size="sm"
                        variant="bordered"
                        allowsCustomValue
                      >
                        {COUNTRIES.map((country) => (
                          <AutocompleteItem key={country.key} value={country.key}>
                            {country.value}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                color="primary"
                onPress={handleLogisticsUpdate}
                isLoading={isUpdatingLogistics}
                disabled={isUpdatingLogistics}
                size="sm"
                startContent={<Icon icon="solar:refresh-bold" />}
              >
                {isUpdatingLogistics ? "Updating..." : "Update Logistics Info"}
              </Button>
            </div>
          </section>
        </div>
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
        </div>
      )}

    </div>

  );
};

export default ShipmentDetails;
