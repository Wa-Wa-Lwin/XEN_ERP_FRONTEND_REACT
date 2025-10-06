import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useAuth } from '@context/AuthContext'
import packagingService from '@pages/packaging/type/packagingService'
import type { PackagingData, CreatePackagingPayload } from '@pages/packaging/type/packagingService'

interface PackagingFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: PackagingData | null
  mode: 'create' | 'edit'
}

const PACKAGE_TYPES = [
  'HARD BOX - BLACK',
  'HARD BOX - GREEN',
  'PALLET (With cardboard box)',
  'WOODEN BOX (Old version)',
  'WOODEN BOX (New version)',
  'CARDBOARD BOX'
]

const PACKAGE_PURPOSES = [
  'XSOS (DEMONSTRATION)',
  'CSOS (DEMONSTRATION)',
  'MMU (DEMONSTRATION)',
  'IT & EQUIPMENT',
  'XSOS (For Sales)',
  'CHASSIS',
  'PARTS AND OTHER'
]

const DIMENSION_UNITS = ['cm', 'm', 'in']
const WEIGHT_UNITS = ['kg', 'g', 'lb']

export const PackagingFormModal: React.FC<PackagingFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
  mode
}) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    packageType: '',
    packagePurpose: '',
    package_length: '',
    package_width: '',
    package_height: '',
    package_dimension_unit: 'cm',
    package_weight: '',
    package_weight_unit: 'kg',
    remark: ''
  })

  useEffect(() => {
    if (editData && mode === 'edit') {
      setFormData({
        packageType: editData.packageType,
        packagePurpose: editData.packagePurpose,
        package_length: editData.package_length,
        package_width: editData.package_width,
        package_height: editData.package_height,
        package_dimension_unit: editData.package_dimension_unit,
        package_weight: editData.package_weight,
        package_weight_unit: editData.package_weight_unit,
        remark: editData.remark || ''
      })
    } else {
      setFormData({
        packageType: '',
        packagePurpose: '',
        package_length: '',
        package_width: '',
        package_height: '',
        package_dimension_unit: 'cm',
        package_weight: '',
        package_weight_unit: 'kg',
        remark: ''
      })
    }
    setErrors({})
  }, [editData, mode, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.packageType) newErrors.packageType = 'Package type is required'
    if (!formData.packagePurpose) newErrors.packagePurpose = 'Package purpose is required'
    if (!formData.package_length || parseFloat(formData.package_length) < 0) {
      newErrors.package_length = 'Valid length is required'
    }
    if (!formData.package_width || parseFloat(formData.package_width) < 0) {
      newErrors.package_width = 'Valid width is required'
    }
    if (!formData.package_height || parseFloat(formData.package_height) < 0) {
      newErrors.package_height = 'Valid height is required'
    }
    if (!formData.package_weight || parseFloat(formData.package_weight) < 0) {
      newErrors.package_weight = 'Valid weight is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload: CreatePackagingPayload = {
        packageType: formData.packageType,
        packageTypeName: `${formData.packageType} ${formData.packagePurpose}`,
        packagePurpose: formData.packagePurpose,
        package_length: parseFloat(formData.package_length),
        package_width: parseFloat(formData.package_width),
        package_height: parseFloat(formData.package_height),
        package_dimension_unit: formData.package_dimension_unit,
        package_weight: parseFloat(formData.package_weight),
        package_weight_unit: formData.package_weight_unit,
        remark: formData.remark,
        user_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'system',
        user_id: user?.userID || 1
      }

      if (mode === 'edit' && editData) {
        await packagingService.updatePackaging(editData.packageID, payload)
      } else {
        await packagingService.createPackaging(payload)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to save packaging:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="solar:box-linear" width={24} className="text-primary" />
          {mode === 'edit' ? 'Edit Packaging' : 'Create New Packaging'}
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Package Type */}
            <Select
              label="Package Type"
              placeholder="Select package type"
              selectedKeys={formData.packageType ? [formData.packageType] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                setFormData({ ...formData, packageType: value })
                setErrors({ ...errors, packageType: '' })
              }}
              isInvalid={!!errors.packageType}
              errorMessage={errors.packageType}
              isRequired
            >
              {PACKAGE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>

            {/* Package Purpose */}
            <Select
              label="Package Purpose"
              placeholder="Select package purpose"
              selectedKeys={formData.packagePurpose ? [formData.packagePurpose] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                setFormData({ ...formData, packagePurpose: value })
                setErrors({ ...errors, packagePurpose: '' })
              }}
              isInvalid={!!errors.packagePurpose}
              errorMessage={errors.packagePurpose}
              isRequired
            >
              {PACKAGE_PURPOSES.map((purpose) => (
                <SelectItem key={purpose} value={purpose}>
                  {purpose}
                </SelectItem>
              ))}
            </Select>

            {/* Dimensions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Dimensions</label>
              <div className="grid grid-cols-4 gap-3">
                <Input
                  type="number"
                  label="Length"
                  placeholder="0"
                  value={formData.package_length}
                  onValueChange={(value) => {
                    setFormData({ ...formData, package_length: value })
                    setErrors({ ...errors, package_length: '' })
                  }}
                  isInvalid={!!errors.package_length}
                  errorMessage={errors.package_length}
                  isRequired
                />
                <Input
                  type="number"
                  label="Width"
                  placeholder="0"
                  value={formData.package_width}
                  onValueChange={(value) => {
                    setFormData({ ...formData, package_width: value })
                    setErrors({ ...errors, package_width: '' })
                  }}
                  isInvalid={!!errors.package_width}
                  errorMessage={errors.package_width}
                  isRequired
                />
                <Input
                  type="number"
                  label="Height"
                  placeholder="0"
                  value={formData.package_height}
                  onValueChange={(value) => {
                    setFormData({ ...formData, package_height: value })
                    setErrors({ ...errors, package_height: '' })
                  }}
                  isInvalid={!!errors.package_height}
                  errorMessage={errors.package_height}
                  isRequired
                />
                <Select
                  label="Unit"
                  selectedKeys={[formData.package_dimension_unit]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    setFormData({ ...formData, package_dimension_unit: value })
                  }}
                >
                  {DIMENSION_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Weight */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Weight"
                placeholder="0"
                value={formData.package_weight}
                onValueChange={(value) => {
                  setFormData({ ...formData, package_weight: value })
                  setErrors({ ...errors, package_weight: '' })
                }}
                isInvalid={!!errors.package_weight}
                errorMessage={errors.package_weight}
                isRequired
              />
              <Select
                label="Weight Unit"
                selectedKeys={[formData.package_weight_unit]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFormData({ ...formData, package_weight_unit: value })
                }}
              >
                {WEIGHT_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Remark */}
            <Textarea
              label="Remark"
              placeholder="Enter any additional notes..."
              value={formData.remark}
              onValueChange={(value) => setFormData({ ...formData, remark: value })}
              minRows={3}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            startContent={!isLoading && <Icon icon="solar:check-circle-linear" width={20} />}
          >
            {mode === 'edit' ? 'Update' : 'Create'} Packaging
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
