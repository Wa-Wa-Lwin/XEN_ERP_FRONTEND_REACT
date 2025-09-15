import { useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react'
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

      <div className="overflow-x-auto">
        <Table 
          aria-label="Parcel items table"
          classNames={{
            wrapper: "min-h-[200px]",
            table: "min-w-[1200px]",
            td: "px-1 py-1",
            th: "px-1 py-2",
          }}
        >
          <TableHeader>
            <TableColumn className="w-12">#</TableColumn>
            <TableColumn className="w-48 min-w-[80px]">DESCRIPTION</TableColumn>
            <TableColumn className="w-36">SKU</TableColumn>
            <TableColumn className="w-24">HS CODE</TableColumn>
            <TableColumn className="w-28">ORIGIN</TableColumn>
            <TableColumn className="w-20">PRICE</TableColumn>
            <TableColumn className="w-28">CURRENCY</TableColumn>
            <TableColumn className="w-20">WEIGHT(kg)</TableColumn>
            <TableColumn className="w-16">QTY</TableColumn>
            <TableColumn className="w-16">ACTION</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No items added yet">
            {itemFields.map((item, itemIndex) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="text-sm font-medium text-default-600">
                    {itemIndex + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`, { required: 'Item description is required' })}
                    placeholder="Enter item description"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`, { required: 'SKU is required' })}
                    placeholder="SKU"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`, { required: 'HS Code is required' })}
                    placeholder="HS Code"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`, { required: 'Origin country is required' })}
                    placeholder="Country"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country}
                    classNames={{
                      trigger: "min-h-unit-8 h-unit-8",
                      value: "text-sm"
                    }}
                  >
                    {COUNTRIES.map((option) => (
                      <SelectItem key={option.key} value={option.value}>
                        {/* {option.value} */}
                        {option.key}
                      </SelectItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`, { required: 'Price is required', min: 0 })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`, { required: 'Currency is required' })}
                    placeholder="THB"
                    variant="flat"
                    size="sm"
                    defaultSelectedKeys={['THB']}
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency}
                    classNames={{
                      trigger: "min-h-unit-8 h-unit-8",
                      value: "text-sm"
                    }}
                  >
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.key} value={currency.value}>
                        {currency.key}
                      </SelectItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`, { required: 'Quantity is required', min: 1 })}
                    type="number"
                    placeholder="1"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  {itemFields.length > 1 && (
                    <Button
                      type="button"
                      color="danger"
                      size="sm"
                      variant="light"
                      isIconOnly
                      onPress={() => removeItem(itemIndex)}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" width={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hidden weight unit field */}
      {itemFields.map((item, itemIndex) => (
        <Select
          key={`weight-unit-${item.id}`}
          {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`, { required: 'Weight unit is required' })}
          defaultSelectedKeys={['kg']}
          className="hidden"
        >
          {WEIGHT_UNITS.map((unit) => (
            <SelectItem key={unit.key} value={unit.value}>
              {unit.label}
            </SelectItem>
          ))}
        </Select>
      ))}
    </div>
  )
}

export default ParcelItems