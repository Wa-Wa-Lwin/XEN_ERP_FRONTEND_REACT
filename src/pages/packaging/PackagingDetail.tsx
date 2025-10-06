import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Button,
  Chip,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useAuth } from '@context/AuthContext'
import packagingService from '@pages/packaging/type/packagingService'
import type { PackagingData } from '@pages/packaging/type/packagingService'
import { PackagingFormModal } from './components/PackagingFormModal'

const PackagingDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [packaging, setPackaging] = useState<PackagingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    fetchPackagingDetail()
  }, [id])

  const fetchPackagingDetail = async () => {
    setIsLoading(true)
    try {
      const response = await packagingService.getAllPackaging()
      const found = response.all_Packaging.find(pkg => pkg.packageID === id)
      if (found) {
        setPackaging(found)
      }
    } catch (error) {
      console.error('Failed to fetch packaging detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDimensions = (pkg: PackagingData) => {
    if (pkg.package_length === '0' && pkg.package_width === '0' && pkg.package_height === '0') {
      return 'Custom dimensions'
    }
    return `${pkg.package_length} × ${pkg.package_width} × ${pkg.package_height} ${pkg.package_dimension_unit}`
  }

  const formatWeight = (pkg: PackagingData) => {
    if (pkg.package_weight === '.00' || pkg.package_weight === '0.00') {
      return 'Custom weight'
    }
    return `${pkg.package_weight} ${pkg.package_weight_unit}`
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const handleToggleStatus = async () => {
    if (!packaging) return

    setIsTogglingStatus(true)
    try {
      const newStatus = packaging.active === '1' ? 0 : 1
      await packagingService.inactivePackaging(packaging.packageID, {
        active: newStatus,
        updated_userID: user?.userID || 1,
        updated_user_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'system'
      })
      await fetchPackagingDetail()
    } catch (error) {
      console.error('Failed to toggle status:', error)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Loading packaging details..." />
      </div>
    )
  }

  if (!packaging) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Icon icon="solar:inbox-linear" width={64} className="text-default-300" />
        <p className="text-default-500">Packaging not found</p>
        <Button color="primary" onPress={() => navigate('/local/packaging-list')}>
          Back to Packaging List
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-5">
      {/* Header */}
      <div className="flex justify-left items-center">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">{packaging.packageTypeName}</h1>
            <p className="text-sm text-default-600">Package ID: {packaging.packageID}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          color="default"
          variant="flat"
          startContent={<Icon icon="solar:arrow-left-linear" width={20} />}
          onPress={() => navigate('/local/packaging-list')}
        >
          Back to List
        </Button>
        <div className="flex gap-3">
          <Button
            color={packaging.active === '1' ? 'danger' : 'success'}
            variant="flat"
            startContent={<Icon icon={packaging.active === '1' ? 'solar:close-circle-linear' : 'solar:check-circle-linear'} width={20} />}
            onPress={handleToggleStatus}
            isLoading={isTogglingStatus}
          >
            {packaging.active === '1' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="solar:pen-linear" width={20} />}
            onPress={() => setIsEditModalOpen(true)}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="solar:box-linear" width={24} className="text-primary" />
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table
            hideHeader
            removeWrapper
            aria-label="Basic information"
          >
            <TableHeader>
              <TableColumn>Field</TableColumn>
              <TableColumn>Value</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-default-700 w-1/3">Package Type</TableCell>
                <TableCell>{packaging.packageType}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Package Name</TableCell>
                <TableCell>{packaging.packageTypeName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Purpose</TableCell>
                <TableCell>{packaging.packagePurpose}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Remark</TableCell>
                <TableCell>{packaging.remark || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Status</TableCell>
                <TableCell>
                  <Chip
                    size="lg"
                    variant="flat"
                    color={packaging.active === '1' ? 'success' : 'danger'}
                  >
                    {packaging.active === '1' ? 'Active' : 'Inactive'}
                  </Chip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Dimensions & Weight */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="solar:ruler-linear" width={24} className="text-primary" />
            <h2 className="text-xl font-semibold">Dimensions & Weight</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table
            hideHeader
            removeWrapper
            aria-label="Dimensions and weight"
          >
            <TableHeader>
              <TableColumn>Field</TableColumn>
              <TableColumn>Value</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-default-700 w-1/3">Length</TableCell>
                <TableCell>{packaging.package_length} {packaging.package_dimension_unit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Width</TableCell>
                <TableCell>{packaging.package_width} {packaging.package_dimension_unit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Height</TableCell>
                <TableCell>{packaging.package_height} {packaging.package_dimension_unit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Dimensions (L × W × H)</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:ruler-linear" width={16} className="text-default-400" />
                    <span className="font-medium">{formatDimensions(packaging)}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Weight</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:scale-linear" width={16} className="text-default-400" />
                    <span className="font-medium">{formatWeight(packaging)}</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="solar:history-linear" width={24} className="text-primary" />
            <h2 className="text-xl font-semibold">History Information</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table
            hideHeader
            removeWrapper
            aria-label="Audit information"
          >
            <TableHeader>
              <TableColumn>Field</TableColumn>
              <TableColumn>Value</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-default-700 w-1/3">Created By</TableCell>
                <TableCell>
                  {packaging.created_by_user_name} (ID: {packaging.created_by_user_id})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Created At</TableCell>
                <TableCell>{formatDateTime(packaging.created_at)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Updated By</TableCell>
                <TableCell>
                  {packaging.updated_by_user_name} (ID: {packaging.updated_by_user_id})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-default-700">Updated At</TableCell>
                <TableCell>{formatDateTime(packaging.updated_at)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      {packaging && (
        <PackagingFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchPackagingDetail}
          editData={packaging}
          mode="edit"
        />
      )}
    </div>
  )
}

export default PackagingDetail
