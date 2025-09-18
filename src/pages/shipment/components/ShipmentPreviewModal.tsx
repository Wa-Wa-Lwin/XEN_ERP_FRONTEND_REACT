import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ShipmentFormData } from '../types/shipment-form.types'

interface ShipmentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  formData: ShipmentFormData
  isSubmitting: boolean
  selectedRateId?: string
}

const ShipmentPreviewModal = ({ isOpen, onClose, onConfirm, formData, isSubmitting, selectedRateId }: ShipmentPreviewModalProps) => {
  // Find the selected rate from formData.rates
  const selectedRate = formData.rates?.find(rate => rate.shipper_account_id === selectedRateId)
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Preview Shipment Request</h2>
          <p className="text-sm text-gray-600">Please review all details before submitting</p>
        </ModalHeader>

        <ModalBody className="space-y-1">
          {/* Basic Information */}
          <p>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <b>Topic - </b> {formData.topic || 'Not specified'} <br />
            <b>PO Number - </b> {formData.po_number || 'Not specified'} <br />
            <b>Due Date - </b> {formData.due_date || 'Not specified'} <br />
            <b>Sales Person - </b> {formData.sales_person || 'Not specified'} <br />
            <b>Remark - </b> {formData.remark || 'Not specified'} <br />
          </p>

          {/* Ship From Address */}
          <p>
            <h3 className="text-lg font-medium">Ship From Address</h3>
            <b>Company - </b> {formData.ship_from_company_name || 'Not specified'} <br />
            <b>Address - </b> {[
              formData.ship_from_street1,
              formData.ship_from_street2,
              formData.ship_from_street3,
              formData.ship_from_city,
              formData.ship_from_state,
              formData.ship_from_postal_code,
              formData.ship_from_country
            ].filter(Boolean).join(', ') || 'Not specified'} <br />  
            <b>Contact - </b> {formData.ship_from_contact_name || 'Not specified'} <br />            
            <b>Phone - </b> {formData.ship_from_phone || 'Not specified'} <br />
            <b>Email - </b> {formData.ship_from_email || 'Not specified'}          
          </p>

          {/* Ship To Address */}
          <p>
            <h3 className="text-lg font-medium">Ship To Address</h3>
            <b>Company - </b> {formData.ship_to_company_name || 'Not specified'} <br />
            <b>Address - </b> {[
              formData.ship_to_street1,
              formData.ship_to_street2,
              formData.ship_to_street3,
              formData.ship_to_city,
              formData.ship_to_state,
              formData.ship_to_postal_code,
              formData.ship_to_country
            ].filter(Boolean).join(', ') || 'Not specified'} <br />            
            <b>Contact - </b> {formData.ship_to_contact_name || 'Not specified'} <br />  
            <b>Phone - </b> {formData.ship_to_phone || 'Not specified'} <br />          
            <b>Email - </b> {formData.ship_to_email || 'Not specified'}             
          </p>

          {/* Pickup Information */}
          {formData.pick_up_status && (
            <p>
              <h3 className="text-lg font-medium">Pickup Information</h3>
              <b>Pickup Date - </b> {formData.pick_up_date || 'Not specified'} [{formData.pick_up_start_time || 'Not specified'} - {formData.pick_up_end_time || 'Not specified'}]
              <br />
              <b>Instructions - </b> {formData.pick_up_instructions || 'Not specified'}
            </p>
          )}

          {/* Insurance Information */}
          {formData.insurance_enabled && (
            <p>
              <h3 className="text-lg font-medium">Insurance Information</h3>
              <b>Insured Value - </b>
              {formData.insurance_insured_value_amount} {formData.insurance_insured_value_currency}
            </p>
          )}

          {/* Parcels */}
          <p>
            <h3 className="text-lg font-medium">
              Parcels ({formData.parcels?.length || 0})
            </h3>
            {formData.parcels?.map((parcel, index) => (
              <div key={index} className="ml-4 mt-2">
                <b>Parcel {index + 1}</b> <br />
                <b>Box Type - </b> {parcel.box_type_name || 'Not specified'} <br />
                <b>Dimensions - </b> {parcel.width} × {parcel.height} × {parcel.depth} {parcel.dimension_unit} <br />
                <b>Weight - </b> {parcel.parcel_weight_value} {parcel.weight_unit} <br />
                {parcel.description && (
                  <>
                    <b>Description - </b> {parcel.description} <br />
                  </>
                )}
                {parcel.parcel_items?.length > 0 && (
                  <div className="ml-4 mt-1">
                    <b>Items ({parcel.parcel_items.length})</b><br />
                    {parcel.parcel_items.map((item, itemIndex) => (
                      <div key={itemIndex} className="ml-2">
                        • {item.description} — Qty: {item.quantity}, Price: {item.price_amount} {item.price_currency}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )) || <span>No parcels added</span>}
          </p>

          {/* Selected Shipping Rate */}
          {selectedRate && (
            <p>
              <h3 className="text-lg font-medium text-green-600">
                <Icon icon="solar:check-circle-bold" className="inline mr-2" />
                Selected Shipping Rate
              </h3>
              <div className="ml-4 mt-2 p-4 border-2 border-green-300 bg-green-50 rounded-lg">
                <b>{selectedRate.service_name}</b> <br />
                <b>Shipper - </b> {selectedRate.shipper_account_description} <br />
                <b>Service Type - </b> {selectedRate.service_type} <br />
                <b>Total Charge - </b> {selectedRate.total_charge_amount} {selectedRate.total_charge_currency} <br />
                <b>Transit Time - </b> {selectedRate.transit_time} <br />
                {selectedRate.delivery_date && (
                  <>
                    <b>Delivery Date - </b> {selectedRate.delivery_date} <br />
                  </>
                )}
                {selectedRate.charge_weight_value && (
                  <>
                    <b>Charge Weight - </b> {selectedRate.charge_weight_value} {selectedRate.charge_weight_unit} <br />
                  </>
                )}
              </div>
            </p>
          )}

          {/* DONT DELETE YET */}
          {/* All Available Rates */}
          {/* {formData.rates && formData.rates.length > 0 && (
            <p>
              <h3 className="text-lg font-medium">
                Available Shipping Rates ({formData.rates.length})
              </h3>
              {formData.rates.map((rate, index) => (
                <div key={index} className={`ml-4 mt-2 p-3 border rounded-lg ${rate.shipper_account_id === selectedRateId ? 'border-green-400 bg-green-50' : ''}`}>
                  {rate.shipper_account_id === selectedRateId && (
                    <div className="text-green-600 text-sm font-medium mb-2">
                      <Icon icon="solar:check-circle-bold" className="inline mr-1" />
                      SELECTED
                    </div>
                  )}
                  <b>{rate.service_name}</b> <br />
                  <b>Shipper - </b> {rate.shipper_account_description} <br />
                  <b>Service Type - </b> {rate.service_type} <br />
                  <b>Total Charge - </b> {rate.total_charge_amount} {rate.total_charge_currency} <br />
                  <b>Transit Time - </b> {rate.transit_time} <br />
                  {rate.delivery_date && (
                    <>
                      <b>Delivery Date - </b> {rate.delivery_date} <br />
                    </>
                  )}
                  {rate.charge_weight_value && (
                    <>
                      <b>Charge Weight - </b> {rate.charge_weight_value} {rate.charge_weight_unit} <br />
                    </>
                  )}
                  {rate.error_message && (
                    <div className="text-red-600">
                      <b>Error - </b> {rate.error_message}
                    </div>
                  )}
                  {rate.info_message && (
                    <div className="text-blue-600">
                      <b>Info - </b> {rate.info_message}
                    </div>
                  )}
                </div>
              ))}
            </p>
          )} */}
        </ModalBody>


        <ModalFooter>
          <Button
            variant="bordered"
            onPress={onClose}
            startContent={<Icon icon="solar:pen-bold" />}
          >
            Edit Details
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            startContent={!isSubmitting && <Icon icon="solar:check-circle-bold" />}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShipmentPreviewModal