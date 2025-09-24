import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Spinner, Button, Divider } from "@heroui/react";
import axios from "axios";
import { useAuth } from "@context/AuthContext";
import { useNotification } from "@context/NotificationContext";
import {
  BasicInformation,
  AddressInformation,
  RatesSection,
  ParcelsSection,
  RequestHistory,
  ActionSections,
  type ShipmentGETData
} from "./shipment-details";

const ShipmentDetails = () => {
  const { shipmentId } = useParams<{ shipmentId?: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<ShipmentGETData | null>(null);
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

        setEditCustomsPurpose(shipmentData.customs_purpose || "");
        setEditCustomsTermsOfTrade(shipmentData.customs_terms_of_trade || "");

        const allItems: any[] = [];
        shipmentData.parcels?.forEach((parcel: any, parcelIndex: number) => {
          parcel.items?.forEach((item: any, itemIndex: number) => {
            allItems.push({
              ...item,
              parcelIndex,
              itemIndex,
              id: `${parcelIndex}-${itemIndex}`,
              parcelItemID: item.parcelItemID
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

      const response = await axios.put(apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        const responseData = response.data;
        const labelResponse = responseData.create_label_response;
        const hasLabelErrors = labelResponse?.$create_label_response_body?.meta?.details?.length > 0;

        if (responseData.status === 'success') {
          const actionText = isApprove ? 'approved' : 'rejected';

          if (hasLabelErrors || responseData.response_message === 'Label created failed.') {
            const labelErrors = labelResponse?.$create_label_response_body?.meta?.details || [];

            if (labelErrors.length > 0) {
              const errorDetails = labelErrors.map((error: any) => {
                const field = error.path || 'Unknown field';
                const message = error.info || 'Unknown error';
                return `• ${field}: ${message}`;
              }).join('\n');

              const alertMessage = `✅ Shipment ${actionText} successfully!\n\n❌ However, shipping label creation failed:\n\n${errorDetails}\n\n📞 Please contact the logistics team to resolve these label creation issues before the shipment can proceed.`;
              showNotificationError(alertMessage, 'Partial Success');
            } else {
              const labelMessage = responseData.label_message || responseData.response_message || 'Unknown label creation error';
              showNotificationError(`✅ Shipment ${actionText} successfully!\n\n❌ However, shipping label creation failed: ${labelMessage}\n\n📞 Please contact the logistics team.`, 'Partial Success');
            }
          } else {
            success(`Shipment ${actionText} successfully!\n\nShipping label has been created and is ready for use.`, 'Success');
          }
        } else {
          const actionText = isApprove ? 'approved' : 'rejected';
          success(`Shipment ${actionText} successfully!`, 'Success');
        }

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

      const parcelsData = shipment!.parcels?.map((parcel: any) => ({
        parcel_items: parcel.items?.map((originalItem: any) => {
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
        customs_purpose: editCustomsPurpose || shipment!.customs_purpose,
        customs_terms_of_trade: editCustomsTermsOfTrade || shipment!.customs_terms_of_trade,
        parcels: parcelsData,
        remark: 'Logistics information updated'
      };

      const response = await axios.put(apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
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
        console.error('Full API Error Response:', errorData);

        if (errorData.message && errorData.message.includes('parcel_items')) {
          showNotificationError('Database configuration issue detected. The parcel_items table may not exist or be accessible. Please contact the development team.', 'Database Error');
        } else if (errorData.message) {
          showNotificationError(`Update failed: ${errorData.message}`, 'Update Failed');
        } else if (errorData.errors) {
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

    const duplicateData = {
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
      ship_from_company_name: shipment.ship_from_company_name || '',
      ship_from_contact_name: shipment.ship_from_contact_name || '',
      ship_from_street1: shipment.ship_from_street1 || '',
      ship_from_street2: shipment.ship_from_street2 || '',
      ship_from_city: shipment.ship_from_city || '',
      ship_from_state: shipment.ship_from_state || '',
      ship_from_postal_code: shipment.ship_from_postal_code || '',
      ship_from_country: shipment.ship_from_country || '',
      ship_from_phone: shipment.ship_from_phone || '',
      ship_from_email: shipment.ship_from_email || '',
      ship_from_tax_id: shipment.ship_from_tax_id || '',

      // Ship To Address
      ship_to_company_name: shipment.ship_to_company_name || '',
      ship_to_contact_name: shipment.ship_to_contact_name || '',
      ship_to_street1: shipment.ship_to_street1 || '',
      ship_to_street2: shipment.ship_to_street2 || '',
      ship_to_city: shipment.ship_to_city || '',
      ship_to_state: shipment.ship_to_state || '',
      ship_to_postal_code: shipment.ship_to_postal_code || '',
      ship_to_country: shipment.ship_to_country || '',
      ship_to_phone: shipment.ship_to_phone || '',
      ship_to_email: shipment.ship_to_email || '',
      ship_to_tax_id: shipment.ship_to_tax_id || '',


      // Pickup Information
      pick_up_status: shipment.pick_up_status || true,
      pick_up_date: shipment.pick_up_date || '',
      pick_up_start_time: shipment.pick_up_start_time || '',
      pick_up_end_time: shipment.pick_up_end_time || '',
      pick_up_instructions: shipment.pick_up_instructions || '',

      // Parcels data
      parcels: shipment.parcels?.map(parcel => ({
        box_type_name: parcel.box_type_name || '',
        width: parseFloat(String(parcel.width)) || 0,
        height: parseFloat(String(parcel.height)) || 0,
        depth: parseFloat(String(parcel.depth)) || 0,
        dimension_unit: parcel.dimension_unit || 'cm',
        weight_value: parseFloat(String(parcel.weight_value)) || 0,
        weight_unit: parcel.weight_unit || 'kg',
        description: parcel.description || '',
        parcel_items: parcel.items?.map(item => ({
          description: item.description || '',
          quantity: parseInt(String(item.quantity)) || 1,
          price_amount: parseFloat(String(item.price_amount)) || 0,
          price_currency: item.price_currency || 'THB',
          weight_value: parseFloat(String(item.weight_value)) || 0,
          weight_unit: item.weight_unit || 'kg',
          origin_country: item.origin_country || '',
          sku: item.sku || '',
          hs_code: item.hs_code || '',
          item_id: item.item_id || ''
        })) || []
      })) || [],

      customs_purpose: shipment.customs_purpose || '',
      customs_terms_of_trade: shipment.customs_terms_of_trade || '',
      rates: [],
    };

    sessionStorage.setItem('duplicateShipmentData', JSON.stringify(duplicateData));
    navigate('/shipment/request-form?duplicate=true');
    success('Shipment data prepared for duplication. Please review and submit the new shipment request.', 'Duplicate Created');
  };

  const formattedError = shipment?.error_msg ? shipment.error_msg.replace(/\|/g, '\n|') : "";

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
      <BasicInformation
        shipment={shipment}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        msLoginUser={msLoginUser}
        onDuplicateShipment={handleDuplicateShipment}
      />

      <AddressInformation shipment={shipment} />

      <Divider />

      <RatesSection
        shipment={shipment}
        showAllRates={showAllRates}
        setShowAllRates={setShowAllRates}
      />

      <ParcelsSection shipment={shipment} />

      <RequestHistory
        shipment={shipment}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />

      <ActionSections
        shipment={shipment}
        msLoginUser={msLoginUser}
        remark={remark}
        setRemark={setRemark}
        isApproving={isApproving}
        isRejecting={isRejecting}
        onApprovalAction={handleApprovalAction}
        editCustomsPurpose={editCustomsPurpose}
        setEditCustomsPurpose={setEditCustomsPurpose}
        editCustomsTermsOfTrade={editCustomsTermsOfTrade}
        setEditCustomsTermsOfTrade={setEditCustomsTermsOfTrade}
        editedParcelItems={editedParcelItems}
        onParcelItemUpdate={handleParcelItemUpdate}
        isUpdatingLogistics={isUpdatingLogistics}
        onLogisticsUpdate={handleLogisticsUpdate}
        showError={showError}
        setShowError={setShowError}
        onCreateLabel={handleCreateLabel}
        formattedError={formattedError}
      />
    </div>
  );
};

export default ShipmentDetails;