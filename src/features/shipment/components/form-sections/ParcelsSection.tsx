import { useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { DEFAULT_PARCEL } from '../../constants/form-defaults'
import { DIMENSION_UNITS, WEIGHT_UNITS } from '../../constants/form-defaults'
import ParcelItems from './ParcelItems'
import type { FormSectionProps } from '../../types/shipment-form.types'

const ParcelsSection = ({ register, errors, control }: FormSectionProps) => {
  const { fields: parcelFields, append: appendParcel, remove: removeParcel } = useFieldArray({
    control,
    name: 'parcels'
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Parcels and Items</h2>
          <Button
            type="button"
            color="primary"
            size="sm"
            startContent={<Icon icon="solar:add-circle-bold" />}
            onPress={() => appendParcel(DEFAULT_PARCEL)}
          >
            Add Parcel
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {parcelFields.map((parcel, parcelIndex) => (
          <Card key={parcel.id} className="border">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-medium">Parcel {parcelIndex + 1}</h3>
                {parcelFields.length > 1 && (
                  <Button
                    type="button"
                    color="danger"
                    size="sm"
                    variant="light"
                    startContent={<Icon icon="solar:trash-bin-minimalistic-bold" />}
                    onPress={() => removeParcel(parcelIndex)}
                  >
                    Remove Parcel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {/* Parcel Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  {...register(`parcels.${parcelIndex}.box_type`, { required: 'Box type is required' })}
                  label="Box Type"
                  placeholder="Enter box type"
                  errorMessage={errors.parcels?.[parcelIndex]?.box_type?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.box_type}
                />
                <Input
                  {...register(`parcels.${parcelIndex}.box_type_name`, { required: 'Box type name is required' })}
                  label="Box Type Name"
                  placeholder="Enter box type name"
                  errorMessage={errors.parcels?.[parcelIndex]?.box_type_name?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.box_type_name}
                />
                <Input
                  {...register(`parcels.${parcelIndex}.width`, { required: 'Width is required', min: 0 })}
                  type="number"
                  step="0.01"
                  label="Width"
                  placeholder="Enter width"
                  errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                />
                <Input
                  {...register(`parcels.${parcelIndex}.height`, { required: 'Height is required', min: 0 })}
                  type="number"
                  step="0.01"
                  label="Height"
                  placeholder="Enter height"
                  errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                />
                <Input
                  {...register(`parcels.${parcelIndex}.depth`, { required: 'Depth is required', min: 0 })}
                  type="number"
                  step="0.01"
                  label="Depth"
                  placeholder="Enter depth"
                  errorMessage={errors.parcels?.[parcelIndex]?.depth?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.depth}
                />
                <Select
                  {...register(`parcels.${parcelIndex}.dimension_unit`, { required: 'Dimension unit is required' })}
                  label="Dimension Unit"
                  defaultSelectedKeys={['cm']}
                  errorMessage={errors.parcels?.[parcelIndex]?.dimension_unit?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.dimension_unit}
                >
                  {DIMENSION_UNITS.map((unit) => (
                    <SelectItem key={unit.key} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  {...register(`parcels.${parcelIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                  type="number"
                  step="0.01"
                  label="Weight Value"
                  placeholder="Enter weight"
                  errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                />
                <Input
                  {...register(`parcels.${parcelIndex}.net_weight_value`, { required: 'Net weight is required', min: 0 })}
                  type="number"
                  step="0.01"
                  label="Net Weight Value"
                  placeholder="Enter net weight"
                  errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                />
                <Select
                  {...register(`parcels.${parcelIndex}.weight_unit`, { required: 'Weight unit is required' })}
                  label="Weight Unit"
                  defaultSelectedKeys={['kg']}
                  errorMessage={errors.parcels?.[parcelIndex]?.weight_unit?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.weight_unit}
                >
                  {WEIGHT_UNITS.map((unit) => (
                    <SelectItem key={unit.key} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </Select>
                <div className="md:col-span-2">
                  <Textarea
                    {...register(`parcels.${parcelIndex}.description`, { required: 'Description is required' })}
                    label="Parcel Description"
                    placeholder="Enter parcel description"
                    errorMessage={errors.parcels?.[parcelIndex]?.description?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.description}
                  />
                </div>
              </div>

              {/* Parcel Items */}
              <ParcelItems parcelIndex={parcelIndex} control={control} register={register} errors={errors} />
            </CardBody>
          </Card>
        ))}
      </CardBody>
    </Card>
  )
}

export default ParcelsSection