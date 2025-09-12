import { useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { DEFAULT_PARCEL_ITEM, WEIGHT_UNITS } from '../../constants/form-defaults'
import type { ParcelItemsProps } from '../../types/shipment-form.types'
import { CURRENCIES } from '@features/shipment/constants/currencies'
import { COUNTRIES } from '@features/shipment/constants/countries'

const ParcelItems = ({ parcelIndex, control, register, errors }: ParcelItemsProps) => {
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: `parcels.${parcelIndex}.parcel_items`
  })

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Parcel Items</h4>
        <Button
          type="button"
          color="secondary"
          size="sm"
          variant="bordered"
          startContent={<Icon icon="solar:add-circle-bold" />}
          onPress={() => appendItem(DEFAULT_PARCEL_ITEM)}
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {itemFields.map((item, itemIndex) => (
          <Card key={item.id} className="border-dashed">
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="flex items-center justify-center gap-2">
                  <h5 className="text-md font-medium">{itemIndex + 1}</h5>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`, { required: 'Item description is required' })}
                    label="Item Description"
                    placeholder="Enter item description"
                    rows={2}
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description}
                  />
                </div>
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`, { required: 'SKU is required' })}
                  label="SKU"
                  placeholder="Enter SKU"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku}
                />
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`, { required: 'HS Code is required' })}
                  label="HS Code"
                  placeholder="Enter HS code"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code}
                />
                <Select
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`, { required: 'Origin country is required' })}
                  label="Origin Country"
                  placeholder="Select origin country"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country}
                >
                  {COUNTRIES.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </Select>
                <div className="flex gap-2">
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`, { required: 'Price is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Price Amount"
                    placeholder="0.00"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount}
                  />
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`, { required: 'Currency is required' })}
                    label="Currency"
                    defaultSelectedKeys={['USD']}
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency}
                  >
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.key} value={currency.value}>
                        {currency.key}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Weight(kg)"
                    placeholder="0.00"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value}
                  />
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`, { required: 'Quantity is required', min: 1 })}
                    type="number"
                    label="Quantity"
                    placeholder="Enter quantity"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity}
                  />
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`, { required: 'Weight unit is required' })}
                    label="Unit"
                    defaultSelectedKeys={['kg']}
                    className="hidden"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_unit?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_unit}
                  >
                    {WEIGHT_UNITS.map((unit) => (
                      <SelectItem key={unit.key} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </Select>
                  {itemFields.length > 1 && (
                  <Button
                    type="button"
                    color="danger"
                    size="md"
                    variant="light"
                    isIconOnly
                    onPress={() => removeItem(itemIndex)}
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" />
                  </Button>
                )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ParcelItems