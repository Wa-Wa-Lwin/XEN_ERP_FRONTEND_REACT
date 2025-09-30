import React from 'react'
import { Input, Select, SelectItem, Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { Controller, useFieldArray } from 'react-hook-form'
import { Icon } from '@iconify/react'
import { CURRENCIES } from '@pages/shipment/constants/currencies'

interface ParcelsFormProps {
  register: any
  control: any
  errors: any
  watch: any
  setValue: any
  getValues?: any
  onOpenBoxTypeModal?: (parcelIndex: number) => void
  onOpenItemsModal?: (parcelIndex: number, itemIndex: number) => void
}

export const ParcelsForm: React.FC<ParcelsFormProps> = ({
  register,
  control,
  errors,
  watch,
  setValue,
  onOpenBoxTypeModal,
  onOpenItemsModal
}) => {
  const { fields: parcelFields, append: appendParcel, remove: removeParcel } = useFieldArray({
    control,
    name: 'parcels'
  })

  const handleAddParcel = () => {
    appendParcel({
      width: 0,
      height: 0,
      depth: 0,
      dimension_unit: 'cm',
      weight_value: 0,
      weight_unit: 'kg',
      description: '',
      parcel_items: [{
        description: '',
        quantity: 1,
        price_currency: 'THB',
        price_amount: 0,
        item_id: '',
        origin_country: '',
        weight_unit: 'kg',
        weight_value: 0,
        sku: '',
        material_code: '',
        hs_code: ''
      }]
    })
  }

  return (
    <div className="space-y-4">
      {parcelFields.map((parcel, parcelIndex) => (
        <Card key={parcel.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <h4 className="text-md font-medium">Parcel {parcelIndex + 1}</h4>
              {parcelFields.length > 1 && (
                <Button
                  isIconOnly
                  variant="light"
                  color="danger"
                  size="sm"
                  onPress={() => removeParcel(parcelIndex)}
                >
                  <Icon icon="solar:trash-bin-minimalistic-linear" width={16} />
                </Button>
              )}
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            {/* Parcel Dimensions */}
            <div>
              <div className="flex justify-left gap-3 items-center mb-3">
                <h5 className="text-sm font-medium">Dimensions & Weight</h5>
                {onOpenBoxTypeModal && (
                  <Button
                    variant="bordered"
                    size="sm"
                    startContent={<Icon icon="solar:box-linear" width={16} />}
                    onPress={() => onOpenBoxTypeModal(parcelIndex)}
                  >
                    Select Box Type
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Controller
                  name={`parcels.${parcelIndex}.width`}
                  control={control}
                  rules={{
                    required: 'Width is required',
                    min: { value: 0.1, message: 'Must be greater than 0' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Width (cm)"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                      errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                    />
                  )}
                />

                <Controller
                  name={`parcels.${parcelIndex}.height`}
                  control={control}
                  rules={{
                    required: 'Height is required',
                    min: { value: 0.1, message: 'Must be greater than 0' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Height (cm)"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                      errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                    />
                  )}
                />

                <Controller
                  name={`parcels.${parcelIndex}.depth`}
                  control={control}
                  rules={{
                    required: 'Depth is required',
                    min: { value: 0.1, message: 'Must be greater than 0' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Depth (cm)"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.parcels?.[parcelIndex]?.depth}
                      errorMessage={errors.parcels?.[parcelIndex]?.depth?.message}
                    />
                  )}
                />
                <input
                  type="hidden"
                  {...register(`parcels.${parcelIndex}.dimension_unit`)}
                  value="cm"
                /> 
                <Controller
                  name={`parcels.${parcelIndex}.weight_value`}
                  control={control}
                  rules={{
                    required: 'Weight is required',
                    min: { value: 0.01, message: 'Must be greater than 0' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Weight (kg)"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                      errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                    />
                  )}
                />

                <input
                  type="hidden"
                  {...register(`parcels.${parcelIndex}.weight_unit`)}
                  value="kg"
                />

              </div>

              <Controller
                name={`parcels.${parcelIndex}.description`}
                control={control}
                render={({ field }) => (
                  <Input
                    label="Description"
                    placeholder="Brief description of the parcel contents"
                    className="mt-3"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Parcel Items */}
            <div>
              <h5 className="text-sm font-medium mb-3">Items in this Parcel</h5>
              <ParcelItems
                parcelIndex={parcelIndex}
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                onOpenItemsModal={onOpenItemsModal}
              />
            </div>
          </CardBody>
        </Card>
      ))}

      <Button
        variant="bordered"
        onPress={handleAddParcel}
        startContent={<Icon icon="solar:add-circle-linear" width={20} />}
        className="w-full"
      >
        Add Another Parcel
      </Button>
    </div>
  )
}

interface ParcelItemsProps {
  parcelIndex: number
  register: any
  control: any
  errors: any
  watch: any
  setValue: any
  onOpenItemsModal?: (parcelIndex: number, itemIndex: number) => void
}

const ParcelItems: React.FC<ParcelItemsProps> = ({
  parcelIndex,
  register,
  control,
  errors,
  watch: _watch,
  setValue: _setValue,
  onOpenItemsModal
}) => {
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: `parcels.${parcelIndex}.parcel_items`
  })

  const addItem = () => {
    appendItem({
      description: '',
      quantity: 1,
      price_currency: 'THB',
      price_amount: 0,
      item_id: '',
      origin_country: '',
      weight_unit: 'kg',
      weight_value: 0,
      sku: '',
      material_code: '',
      hs_code: ''
    })
  }

  return (
    <div className="space-y-3">
      {itemFields.map((item, itemIndex) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-left gap-3 items-center">
            <span className="text-sm font-medium">Item {itemIndex + 1}</span>
            <div className="flex gap-2">
              {onOpenItemsModal && (
                <Button
                  variant="bordered"
                  size="sm"
                  startContent={<Icon icon="lets-icons:materials" width={14} />}
                  onPress={() => onOpenItemsModal(parcelIndex, itemIndex)}
                >
                  Select Item
                </Button>
              )}
              {itemFields.length > 1 && (
                <Button
                  isIconOnly
                  variant="light"
                  color="danger"
                  size="sm"
                  onPress={() => removeItem(itemIndex)}
                >
                  <Icon icon="solar:trash-bin-minimalistic-linear" width={14} />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Controller
              name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`}
              control={control}
              rules={{ required: 'Item description is required' }}
              render={({ field }) => (
                <Input
                  label="Description"
                  placeholder="Item description"
                  value={field.value || ''}
                  onChange={field.onChange}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description}
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description?.message}
                />
              )}
            />

            <Input
              type="number"
              label="Quantity"
              placeholder="1"
              min="1"
              {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`, {
                required: 'Quantity is required',
                min: { value: 1, message: 'Must be at least 1' }
              })}
              isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity}
              errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity?.message}
            />

            <div className="flex gap-2">
              <Input
                type="number"
                label="Unit Price"
                placeholder="0.00"
                min="0"
                step="0.01"
                {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`, {
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Must be greater than 0' }
                })}
                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount}
                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount?.message}
              />

              <Controller
                name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`}
                control={control}
                render={({ field }) => (
                  <Select
                    label="Currency"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string
                      field.onChange(selectedKey)
                    }}
                    className="min-w-20"
                  >
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.key} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            <Controller
              name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.item_id`}
              control={control}
              render={({ field }) => (
                <Input
                  label="Item ID/SKU"
                  placeholder="Product SKU or ID"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />

            <Input
              label="Origin Country"
              placeholder="Country code (e.g., THA)"
              {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`)}
            />

            <Controller
              name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`}
              control={control}
              rules={{
                required: 'Item weight is required',
                min: { value: 0.01, message: 'Must be greater than 0' }
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  label="Weight (kg)"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={field.value?.toString() || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value}
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value?.message}
                />
              )}
            />

            <input
              type="hidden"
              {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`)}
              value="kg"
            />

            <Controller
              name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`}
              control={control}
              render={({ field }) => (
                <Input
                  label="HS Code"
                  placeholder="Harmonized System Code"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      ))}

      <Button
        variant="bordered"
        size="sm"
        onPress={addItem}
        startContent={<Icon icon="solar:add-circle-linear" width={16} />}
        className="w-full"
      >
        Add Item to Parcel
      </Button>
    </div>
  )
}