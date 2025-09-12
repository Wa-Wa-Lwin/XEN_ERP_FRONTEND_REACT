import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardHeader, CardBody, Divider } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ShipmentFormData } from '../types/shipment-form.types'

interface ShipmentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  formData: ShipmentFormData
  isSubmitting: boolean
}

const ShipmentPreviewModal = ({ isOpen, onClose, onConfirm, formData, isSubmitting }: ShipmentPreviewModalProps) => {
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
        
        <ModalBody className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Basic Information</h3>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Topic</p>
                <p className="text-sm">{formData.topic || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">PO Number</p>
                <p className="text-sm">{formData.po_number || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-sm">{formData.due_date || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Person</p>
                <p className="text-sm">{formData.sales_person || 'Not specified'}</p>
              </div>
              {formData.remark && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Remark</p>
                  <p className="text-sm">{formData.remark}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Ship From Address */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Ship From Address</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Name</p>
                  <p className="text-sm">{formData.ship_from_contact_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p className="text-sm">{formData.ship_from_company_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-sm">{formData.ship_from_phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm">{formData.ship_from_email || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-sm">
                  {[
                    formData.ship_from_street1,
                    formData.ship_from_street2,
                    formData.ship_from_street3,
                    formData.ship_from_city,
                    formData.ship_from_state,
                    formData.ship_from_postal_code,
                    formData.ship_from_country
                  ].filter(Boolean).join(', ') || 'Not specified'}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Ship To Address */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Ship To Address</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact Name</p>
                  <p className="text-sm">{formData.ship_to_contact_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p className="text-sm">{formData.ship_to_company_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-sm">{formData.ship_to_phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm">{formData.ship_to_email || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-sm">
                  {[
                    formData.ship_to_street1,
                    formData.ship_to_street2,
                    formData.ship_to_street3,
                    formData.ship_to_city,
                    formData.ship_to_state,
                    formData.ship_to_postal_code,
                    formData.ship_to_country
                  ].filter(Boolean).join(', ') || 'Not specified'}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Pickup Information */}
          {formData.pick_up_status && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Pickup Information</h3>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pickup Date</p>
                  <p className="text-sm">{formData.pick_up_date || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Start Time</p>
                  <p className="text-sm">{formData.pick_up_start_time || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">End Time</p>
                  <p className="text-sm">{formData.pick_up_end_time || 'Not specified'}</p>
                </div>
                {formData.pick_up_instructions && (
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-gray-600">Instructions</p>
                    <p className="text-sm">{formData.pick_up_instructions}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Insurance Information */}
          {formData.insurance_enabled && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Insurance Information</h3>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Insured Value</p>
                  <p className="text-sm">
                    {formData.insurance_insured_value_amount} {formData.insurance_insured_value_currency}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Parcels */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Parcels ({formData.parcels?.length || 0})</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {formData.parcels?.map((parcel, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="text-md font-medium mb-3">Parcel {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Box Type</p>
                      <p className="text-sm">{parcel.box_type_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dimensions</p>
                      <p className="text-sm">
                        {parcel.width} × {parcel.height} × {parcel.depth} {parcel.dimension_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weight</p>
                      <p className="text-sm">
                        Parcel: {parcel.parcel_weight_value} {parcel.weight_unit}<br/>
                        Net: {parcel.net_weight_value} {parcel.weight_unit}<br/>
                        Gross: {parcel.weight_value} {parcel.weight_unit}
                      </p>
                    </div>
                    {parcel.description && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-sm">{parcel.description}</p>
                      </div>
                    )}
                    {parcel.parcel_items && parcel.parcel_items.length > 0 && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm font-medium text-gray-600 mb-2">Items ({parcel.parcel_items.length})</p>
                        <div className="space-y-2">
                          {parcel.parcel_items.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-gray-50 rounded p-2">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="font-medium">Description:</span> {item.description}
                                </div>
                                <div>
                                  <span className="font-medium">Qty:</span> {item.quantity}
                                </div>
                                <div>
                                  <span className="font-medium">Price:</span> {item.price_amount} {item.price_currency}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )) || <p className="text-sm text-gray-600">No parcels added</p>}
            </CardBody>
          </Card>
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