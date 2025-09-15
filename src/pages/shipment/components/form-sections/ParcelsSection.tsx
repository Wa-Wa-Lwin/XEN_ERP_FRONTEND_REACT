import { useFieldArray } from 'react-hook-form'
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { DEFAULT_PARCEL } from '../../constants/form-defaults'
import { DIMENSION_UNITS, WEIGHT_UNITS } from '../../constants/form-defaults'
import ParcelItems from './ParcelItems'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { PARCEL_BOX_TYPES } from '@pages/shipment/constants/parcel_box_types'

const ParcelsSection = ({ register, errors, control, setValue }: FormSectionProps) => {
  const { fields: parcelFields, append: appendParcel, remove: removeParcel } = useFieldArray({
    control,
    name: 'parcels'
  })

  const handleBoxTypeChange = (parcelIndex: number, selectedBoxTypeId: string) => {
    const selectedBoxType = PARCEL_BOX_TYPES.find(box => box.id.toString() === selectedBoxTypeId)

    if (selectedBoxType) {
      setValue(`parcels.${parcelIndex}.box_type`, selectedBoxType.id)
      setValue(`parcels.${parcelIndex}.box_type_name`, selectedBoxType.box_type_name)
      setValue(`parcels.${parcelIndex}.width`, selectedBoxType.width)
      setValue(`parcels.${parcelIndex}.height`, selectedBoxType.height)
      setValue(`parcels.${parcelIndex}.depth`, selectedBoxType.depth)
      setValue(`parcels.${parcelIndex}.dimension_unit`, selectedBoxType.dimension_unit)
      setValue(`parcels.${parcelIndex}.parcel_weight_value`, selectedBoxType.parcel_weight)
      setValue(`parcels.${parcelIndex}.weight_unit`, selectedBoxType.weight_unit)
    }
  }

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
              <div className="space-y-4 mb-6">
                
                {/* Box Type and Description Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    {...register(`parcels.${parcelIndex}.box_type_name`, { required: 'Box type is required' })}
                    label="Box Type"
                    placeholder="Select box type"
                    errorMessage={errors.parcels?.[parcelIndex]?.box_type_name?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.box_type_name}
                    onChange={(e) => handleBoxTypeChange(parcelIndex, e.target.value)}
                  >
                    {PARCEL_BOX_TYPES.map((boxType) => (
                      <SelectItem key={boxType.id} value={boxType.id.toString()}>
                        {boxType.box_type_name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    {...register(`parcels.${parcelIndex}.description`, { required: 'Description is required' })}
                    label="Parcel Description"
                    placeholder="Enter parcel description"
                    errorMessage={errors.parcels?.[parcelIndex]?.description?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.description}
                  />
                </div>

                {/* Dimensions Row */}
                <div className="grid grid-cols-1 md:grid-cols-6 sm:grid-cols-3 gap-4">
                  <Input
                    {...register(`parcels.${parcelIndex}.width`, { required: 'Width is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Width (cm)"
                    placeholder="Enter width"
                    errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                  />
                  <Input
                    {...register(`parcels.${parcelIndex}.height`, { required: 'Height is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Height (cm)"
                    placeholder="Enter height"
                    errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                  />
                  <Input
                    {...register(`parcels.${parcelIndex}.depth`, { required: 'Depth is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Depth (cm)"
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
                    className="hidden"
                  >
                    {DIMENSION_UNITS.map((unit) => (
                      <SelectItem key={unit.key} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </Select>                
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_weight_value`, { required: 'Parcel weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Parcel Weight (kg)"
                    placeholder="Enter parcel weight"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_weight_value}
                  />
                  <Input
                    {...register(`parcels.${parcelIndex}.net_weight_value`, { required: 'Net weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Net Weight (kg)"
                    placeholder="Enter net weight"
                    errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                  />
                  <Input
                    {...register(`parcels.${parcelIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Gross Weight (kg)"
                    placeholder="Enter weight"
                    errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                  />
                  <Select
                    {...register(`parcels.${parcelIndex}.weight_unit`, { required: 'Weight unit is required' })}
                    label="Weight Unit"
                    defaultSelectedKeys={['kg']}
                    errorMessage={errors.parcels?.[parcelIndex]?.weight_unit?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.weight_unit}
                    className="hidden"
                  >
                    {WEIGHT_UNITS.map((unit) => (
                      <SelectItem key={unit.key} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
              {/* Parcel Items */}
              <ParcelItems parcelIndex={parcelIndex} control={control} register={register} errors={errors} setValue={setValue} />
            </CardBody>
          </Card>
        ))}
      </CardBody>
    </Card>
  )
}

export default ParcelsSection