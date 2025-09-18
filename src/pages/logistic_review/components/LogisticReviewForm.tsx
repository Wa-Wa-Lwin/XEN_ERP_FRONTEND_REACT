import { useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody, Input, Select, SelectItem, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { ShipmentForReview, LogisticReviewFormData } from '../types/logistic-review.types'
import { INCOTERMS, CUSTOM_PURPOSES } from '@pages/shipment/constants/form-defaults'

interface LogisticReviewFormProps {
  shipmentData: ShipmentForReview
  onSuccess: () => void
  onCancel: () => void
}

interface FormData {
  customs_terms_of_trade: string
  customs_purpose: string
  parcels: Array<{
    parcel_items: Array<{
      hs_code: string
      origin_country: string
      description: string
      quantity: number
    }>
  }>
}

const LogisticReviewForm = ({ shipmentData, onSuccess, onCancel }: LogisticReviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      customs_terms_of_trade: shipmentData.customs_terms_of_trade || '',
      customs_purpose: shipmentData.customs_purpose || '',
      parcels: shipmentData.parcels || []
    }
  })

  const { fields: parcelFields } = useFieldArray({
    control,
    name: 'parcels'
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Prepare update data
      const updateData = {
        shipmentRequestID: shipmentData.shipmentRequestID,
        customs_terms_of_trade: data.customs_terms_of_trade,
        customs_purpose: data.customs_purpose,
        parcels: data.parcels
      }

      // Call API to update shipment
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_BASE_URL}/shipments/${shipmentData.shipmentRequestID}/logistic-review`,
        updateData
      )

      if (response.status === 200) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating shipment:', error)
      if (axios.isAxiosError(error) && error.response?.data?.meta?.message) {
        setSubmitError(error.response.data.meta.message)
      } else {
        setSubmitError('Failed to update shipment. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customs Information */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Customs Information</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="customs_terms_of_trade"
              control={control}
              rules={{ required: 'Customs terms of trade is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={<span>Incoterms <span className="text-red-500">*</span></span>}
                  placeholder="Select Incoterms"
                  errorMessage={errors.customs_terms_of_trade?.message}
                  isInvalid={!!errors.customs_terms_of_trade}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    if (selectedKey) {
                      field.onChange(selectedKey)
                    }
                  }}
                >
                  {INCOTERMS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="customs_purpose"
              control={control}
              rules={{ required: 'Customs purpose is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={<span>Customs Purpose <span className="text-red-500">*</span></span>}
                  placeholder="Select customs purpose"
                  errorMessage={errors.customs_purpose?.message}
                  isInvalid={!!errors.customs_purpose}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    if (selectedKey) {
                      field.onChange(selectedKey)
                    }
                  }}
                >
                  {CUSTOM_PURPOSES.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Parcel Items */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Parcel Items</h3>
          <p className="text-sm text-gray-600">Update HS Code and Origin Country for each item</p>
        </CardHeader>
        <CardBody>
          {parcelFields.length > 0 ? (
            <div className="space-y-4">
              {parcelFields.map((parcel, parcelIndex) => (
                <div key={parcel.id}>
                  <h4 className="font-medium mb-3">Parcel {parcelIndex + 1}</h4>
                  {parcel.parcel_items && parcel.parcel_items.length > 0 ? (
                    <Table aria-label={`Parcel ${parcelIndex + 1} items`}>
                      <TableHeader>
                        <TableColumn>Description</TableColumn>
                        <TableColumn>Quantity</TableColumn>
                        <TableColumn>HS Code</TableColumn>
                        <TableColumn>Origin Country</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {parcel.parcel_items.map((item, itemIndex) => (
                          <TableRow key={itemIndex}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <Input
                                {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`, {
                                  required: 'HS Code is required'
                                })}
                                placeholder="Enter HS Code"
                                size="sm"
                                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code?.message}
                                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`, {
                                  required: 'Origin country is required'
                                })}
                                placeholder="Enter origin country"
                                size="sm"
                                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country?.message}
                                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items in this parcel</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No parcels found for this shipment</p>
          )}
        </CardBody>
      </Card>

      {/* Error Message */}
      {submitError && (
        <Card shadow="sm" className="border-danger">
          <CardBody>
            <div className="flex items-center gap-2 text-danger">
              <Icon icon="solar:danger-triangle-bold" className="w-5 h-5" />
              <p>{submitError}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      <Card shadow="sm">
        <CardBody>
          <div className="flex justify-end gap-3">
            <Button
              variant="bordered"
              onPress={onCancel}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              startContent={!isSubmitting && <Icon icon="solar:check-circle-bold" />}
            >
              {isSubmitting ? 'Updating...' : 'Update Shipment'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default LogisticReviewForm