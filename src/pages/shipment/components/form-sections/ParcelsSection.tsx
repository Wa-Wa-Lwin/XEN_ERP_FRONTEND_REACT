import {useFieldArray, Controller} from 'react-hook-form'
import {useState, useEffect, useCallback} from 'react'
import {Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem} from '@heroui/react'
import {Icon} from '@iconify/react'
import {DEFAULT_PARCEL} from '../../constants/form-defaults'
import {DIMENSION_UNITS, WEIGHT_UNITS} from '../../constants/form-defaults'
import ParcelItems from './ParcelItems'
import type {FormSectionProps} from '../../types/shipment-form.types'
import {PARCEL_BOX_TYPES} from '@pages/shipment/constants/parcel_box_types'

const ParcelsSection = ({register, errors, control, setValue, watch}: FormSectionProps & { watch: any }) => {
    const {fields: parcelFields, append: appendParcel, remove: removeParcel} = useFieldArray({
        control,
        name: 'parcels'
    })

    const [autoFilledParcels, setAutoFilledParcels] = useState<Set<number>>(new Set())
    const [manualEditParcels, setManualEditParcels] = useState<Set<number>>(new Set())

    // Watch all parcel data for weight calculations
    const watchedParcels = watch('parcels')

    // Calculate net weight from all items in a parcel
    const calculateNetWeight = useCallback((parcelIndex: number): number => {
        const parcel = watchedParcels?.[parcelIndex]
        if (!parcel?.parcel_items) {
            return 0
        }

        return parcel.parcel_items.reduce((total: number, item: any) => {
            const weight = parseFloat(item.weight_value) || 0
            const quantity = parseInt(item.quantity) || 0
            return total + (weight * quantity)
        }, 0)
    }, [watchedParcels])

    // Calculate gross weight (parcel weight + net weight)
    const calculateGrossWeight = useCallback((parcelIndex: number): number => {
        const parcelWeight = parseFloat(watchedParcels?.[parcelIndex]?.parcel_weight_value) || 0
        const netWeight = calculateNetWeight(parcelIndex)
        return parcelWeight + netWeight
    }, [watchedParcels, calculateNetWeight])

    // Update weights automatically
    const updateWeights = useCallback((parcelIndex: number) => {
        const netWeight = calculateNetWeight(parcelIndex)
        const grossWeight = calculateGrossWeight(parcelIndex)

        setValue(`parcels.${parcelIndex}.net_weight_value`, netWeight.toFixed(2), {
            shouldValidate: true,
            shouldDirty: true
        })
        setValue(`parcels.${parcelIndex}.weight_value`, grossWeight.toFixed(2), {
            shouldValidate: true,
            shouldDirty: true
        })
    }, [calculateNetWeight, calculateGrossWeight, setValue])

    // Watch for changes in item weights and quantities
    useEffect(() => {
        if (watchedParcels && Array.isArray(watchedParcels)) {
            watchedParcels.forEach((parcel: any, parcelIndex: number) => {
                // Only update if the parcel has items
                if (parcel && parcel.parcel_items && Array.isArray(parcel.parcel_items) && parcel.parcel_items.length > 0) {
                    updateWeights(parcelIndex)
                }
            })
        }
    }, [watchedParcels, updateWeights])

    const handleBoxTypeChange = (parcelIndex: number, selectedBoxTypeId: string) => {
        const selectedBoxType = PARCEL_BOX_TYPES.find(box => box.id.toString() === selectedBoxTypeId)

        console.log('handleBoxTypeChange called with:', {parcelIndex, selectedBoxTypeId, selectedBoxType})

        if (selectedBoxType) {
            // Set form values with shouldValidate and shouldDirty options
            setValue(`parcels.${parcelIndex}.box_type`, selectedBoxType.box_type_name, {shouldValidate: true, shouldDirty: true})
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

            // Trigger weight recalculation after parcel weight is set
            setTimeout(() => updateWeights(parcelIndex), 100)
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
                                    <Controller
                                        name={`parcels.${parcelIndex}.dimension_unit`}
                                        control={control}
                                        rules={{ required: 'Dimension unit is required' }}
                                        defaultValue="cm"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Dimension Unit"
                                                defaultSelectedKeys={['cm']}
                                                errorMessage={errors.parcels?.[parcelIndex]?.dimension_unit?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.dimension_unit}
                                                className="hidden"
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0] as string
                                                    if (selectedKey) {
                                                        field.onChange(selectedKey)
                                                    }
                                                }}
                                            >
                                                {DIMENSION_UNITS.map((unit) => (
                                                    <SelectItem key={unit.key} value={unit.value}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
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
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.net_weight_value`}
                                            control={control}
                                            rules={{ required: 'Net weight is required', min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label="Net Weight (kg)"
                                                    placeholder="Auto-calculated"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                                                    isReadOnly={true}
                                                    className="bg-gray-50"
                                                    endContent={
                                                        <Icon icon="solar:calculator-bold" className="text-gray-400"/>
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.weight_value`}
                                            control={control}
                                            rules={{ required: 'Weight is required', min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label="Gross Weight (kg)"
                                                    placeholder="Auto-calculated"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                                                    isReadOnly={true}
                                                    className="bg-gray-50"
                                                    endContent={
                                                        <Icon icon="solar:calculator-bold" className="text-gray-400"/>
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <Controller
                                        name={`parcels.${parcelIndex}.weight_unit`}
                                        control={control}
                                        rules={{ required: 'Weight unit is required' }}
                                        defaultValue="kg"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label="Weight Unit"
                                                defaultSelectedKeys={['kg']}
                                                errorMessage={errors.parcels?.[parcelIndex]?.weight_unit?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.weight_unit}
                                                className="hidden"
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0] as string
                                                    if (selectedKey) {
                                                        field.onChange(selectedKey)
                                                    }
                                                }}
                                            >
                                                {WEIGHT_UNITS.map((unit) => (
                                                    <SelectItem key={unit.key} value={unit.value}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                            {/* Parcel Items */}
                            <ParcelItems parcelIndex={parcelIndex} control={control} register={register} errors={errors}
                                         setValue={setValue} watch={watch} onWeightChange={() => updateWeights(parcelIndex)}/>
                        </CardBody>
                    </Card>
                ))}
            </CardBody>
        </Card>
    )
}

export default ParcelsSection