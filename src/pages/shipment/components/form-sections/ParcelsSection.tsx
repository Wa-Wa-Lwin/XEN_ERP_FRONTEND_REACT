import {useFieldArray, Controller} from 'react-hook-form'
import {useState} from 'react'
import {Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem} from '@heroui/react'
import {Icon} from '@iconify/react'
import {DEFAULT_PARCEL} from '../../constants/form-defaults'
import {DIMENSION_UNITS, WEIGHT_UNITS} from '../../constants/form-defaults'
import ParcelItems from './ParcelItems'
import type {FormSectionProps} from '../../types/shipment-form.types'
import {PARCEL_BOX_TYPES} from '@pages/shipment/constants/parcel_box_types'

const ParcelsSection = ({register, errors, control, setValue}: FormSectionProps) => {
    const {fields: parcelFields, append: appendParcel, remove: removeParcel} = useFieldArray({
        control,
        name: 'parcels'
    })

    const [autoFilledParcels, setAutoFilledParcels] = useState<Set<number>>(new Set())
    const [manualEditParcels, setManualEditParcels] = useState<Set<number>>(new Set())

    const handleBoxTypeChange = (parcelIndex: number, selectedBoxTypeId: string) => {
        const selectedBoxType = PARCEL_BOX_TYPES.find(box => box.id.toString() === selectedBoxTypeId)

        console.log('handleBoxTypeChange called with:', {parcelIndex, selectedBoxTypeId, selectedBoxType})

        if (selectedBoxType) {
            // Set form values with shouldValidate and shouldDirty options
            setValue(`parcels.${parcelIndex}.box_type`, selectedBoxType.id, {shouldValidate: true, shouldDirty: true})
            setValue(`parcels.${parcelIndex}.box_type_name`, selectedBoxType.box_type_name, {
                shouldValidate: true,
                shouldDirty: true
            })
            setValue(`parcels.${parcelIndex}.width`, selectedBoxType.width, {shouldValidate: true, shouldDirty: true})
            setValue(`parcels.${parcelIndex}.height`, selectedBoxType.height, {shouldValidate: true, shouldDirty: true})
            setValue(`parcels.${parcelIndex}.depth`, selectedBoxType.depth, {shouldValidate: true, shouldDirty: true})
            setValue(`parcels.${parcelIndex}.dimension_unit`, selectedBoxType.dimension_unit, {
                shouldValidate: true,
                shouldDirty: true
            })
            setValue(`parcels.${parcelIndex}.parcel_weight_value`, selectedBoxType.parcel_weight, {
                shouldValidate: true,
                shouldDirty: true
            })
            setValue(`parcels.${parcelIndex}.weight_unit`, selectedBoxType.weight_unit, {
                shouldValidate: true,
                shouldDirty: true
            })

            console.log("selectedBoxType.width ", selectedBoxType.width)
            console.log('Form values set for parcel:', parcelIndex)

            // Mark this parcel as auto-filled
            setAutoFilledParcels(prev => new Set(prev).add(parcelIndex))
            // Remove from manual edit if it was there
            setManualEditParcels(prev => {
                const updated = new Set(prev)
                updated.delete(parcelIndex)
                return updated
            })
        } else {
            console.log('No box type found for ID:', selectedBoxTypeId)
        }
    }

    const handleToggleManualEdit = (parcelIndex: number) => {
        setManualEditParcels(prev => {
            const updated = new Set(prev)
            if (updated.has(parcelIndex)) {
                updated.delete(parcelIndex)
            } else {
                updated.add(parcelIndex)
            }
            return updated
        })
    }

    const isAutoFilled = (parcelIndex: number) => {
        return autoFilledParcels.has(parcelIndex) && !manualEditParcels.has(parcelIndex)
    }

    const handleRemoveParcel = (parcelIndex: number) => {
        removeParcel(parcelIndex)
        // Clean up state for removed parcel
        // @ts-expect-error - no type
        setAutoFilledParcels(prev => {
            const updated = new Set()
            prev.forEach(index => {
                if (index < parcelIndex) {
                    updated.add(index)
                } else if (index > parcelIndex) {
                    updated.add(index - 1)
                }
            })
            return updated
        })
        // @ts-expect-error - no type
        setManualEditParcels(prev => {
            const updated = new Set()
            prev.forEach(index => {
                if (index < parcelIndex) {
                    updated.add(index)
                } else if (index > parcelIndex) {
                    updated.add(index - 1)
                }
            })
            return updated
        })
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
                        startContent={<Icon icon="solar:add-circle-bold"/>}
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
                                        startContent={<Icon icon="solar:trash-bin-minimalistic-bold"/>}
                                        onPress={() => handleRemoveParcel(parcelIndex)}
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
                                    <div className="space-y-2">
                                        <Controller
                                            name={`parcels.${parcelIndex}.box_type_name`}
                                            control={control}
                                            rules={{required: 'Box type is required'}}
                                            render={({field}) => (
                                                <Select
                                                    {...field}
                                                    label="Box Type"
                                                    placeholder="Select box type"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.box_type_name?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.box_type_name}
                                                    onSelectionChange={(keys) => {
                                                        const selectedKey = Array.from(keys)[0] as string
                                                        if (selectedKey) {
                                                            const selectedBoxType = PARCEL_BOX_TYPES.find(box => box.id.toString() === selectedKey)
                                                            if (selectedBoxType) {
                                                                field.onChange(selectedBoxType.box_type_name)
                                                                handleBoxTypeChange(parcelIndex, selectedKey)
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {PARCEL_BOX_TYPES.map((boxType) => (
                                                        <SelectItem key={boxType.id} value={boxType.id.toString()}>
                                                            {boxType.box_type_name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                        {isAutoFilled(parcelIndex) && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                                startContent={<Icon icon="solar:pen-bold"/>}
                                                onPress={() => handleToggleManualEdit(parcelIndex)}
                                                className="w-full"
                                            >
                                                Edit Dimensions Manually
                                            </Button>
                                        )}
                                        {manualEditParcels.has(parcelIndex) && autoFilledParcels.has(parcelIndex) && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="light"
                                                color="warning"
                                                startContent={<Icon icon="solar:lock-keyhole-minimalistic-bold"/>}
                                                onPress={() => handleToggleManualEdit(parcelIndex)}
                                                className="w-full"
                                            >
                                                Lock Auto-filled Values
                                            </Button>
                                        )}
                                    </div>
                                    <Textarea
                                        {...register(`parcels.${parcelIndex}.description`, {required: 'Description is required'})}
                                        label="Parcel Description"
                                        placeholder="Enter parcel description"
                                        errorMessage={errors.parcels?.[parcelIndex]?.description?.message}
                                        isInvalid={!!errors.parcels?.[parcelIndex]?.description}
                                        // className="h-12"
                                        minRows={1}
                                    />
                                </div>

                                {/* Dimensions Row */}
                                <div className="grid grid-cols-1 md:grid-cols-6 sm:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.width`}
                                            control={control}
                                            rules={{ required: 'Width is required', min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label="Width (cm)"
                                                    placeholder="Enter width"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                  className="text-gray-400"/>
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.height`}
                                            control={control}
                                            rules={{ required: 'Height is required', min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label="Height (cm)"
                                                    placeholder="Enter height"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                  className="text-gray-400"/>
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.depth`}
                                            control={control}
                                            rules={{ required: 'Depth is required', min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label="Depth (cm)"
                                                    placeholder="Enter depth"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.depth?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.depth}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                  className="text-gray-400"/>
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <Select
                                        {...register(`parcels.${parcelIndex}.dimension_unit`, {required: 'Dimension unit is required'})}
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
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.parcel_weight_value`}
                                            control={control}
                                            rules={{ required: 'Parcel weight is required', min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label="Parcel Weight (kg)"
                                                    placeholder="Enter parcel weight"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_weight_value?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_weight_value}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                  className="text-gray-400"/>
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <Input
                                        {...register(`parcels.${parcelIndex}.net_weight_value`, {
                                            required: 'Net weight is required',
                                            min: 0
                                        })}
                                        type="number"
                                        step="0.01"
                                        label="Net Weight (kg)"
                                        placeholder="Enter net weight"
                                        errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                                        isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                                    />
                                    <Input
                                        {...register(`parcels.${parcelIndex}.weight_value`, {
                                            required: 'Weight is required',
                                            min: 0
                                        })}
                                        type="number"
                                        step="0.01"
                                        label="Gross Weight (kg)"
                                        placeholder="Enter weight"
                                        errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                                        isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                                    />
                                    <Select
                                        {...register(`parcels.${parcelIndex}.weight_unit`, {required: 'Weight unit is required'})}
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
                            <ParcelItems parcelIndex={parcelIndex} control={control} register={register} errors={errors}
                                         setValue={setValue}/>
                        </CardBody>
                    </Card>
                ))}
            </CardBody>
        </Card>
    )
}

export default ParcelsSection