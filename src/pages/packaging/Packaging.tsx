import { useState, useEffect } from 'react'
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Card,
    CardBody,
    CardHeader,
    Spinner,
    Chip,
    Pagination
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import packagingService from '@pages/packaging/type/packagingService'
import type { PackagingData } from '@pages/packaging/type/packagingService'

const Packaging = () => {
    const navigate = useNavigate()
    const [packagingData, setPackagingData] = useState<PackagingData[]>([])
    const [filteredData, setFilteredData] = useState<PackagingData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('active')
    const itemsPerPage = 15

    useEffect(() => {
        fetchPackaging()
    }, [])

    const fetchPackaging = async () => {
        setIsLoading(true)
        try {
            const response = await packagingService.getAllPackaging()
            setPackagingData(response.all_Packaging)
            setFilteredData(response.all_active_Packaging)
        } catch (error) {
            console.error('Failed to fetch packaging:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        let baseData = packagingData

        // Apply status filter
        if (filterType === 'active') {
            baseData = packagingData.filter(pkg => pkg.active === '1')
        } else if (filterType === 'inactive') {
            baseData = packagingData.filter(pkg => pkg.active === '0')
        }

        // Apply search filter
        if (searchQuery.trim() === '') {
            setFilteredData(baseData)
        } else {
            const filtered = baseData.filter(pkg =>
                pkg.packageTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pkg.packageType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pkg.packagePurpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (pkg.remark && pkg.remark.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            setFilteredData(filtered)
        }
        setCurrentPage(1)
    }, [searchQuery, packagingData, filterType])

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = filteredData.slice(startIndex, endIndex)

    const formatDimensions = (pkg: PackagingData) => {
        if (pkg.package_length === '0' && pkg.package_width === '0' && pkg.package_height === '0') {
            return 'Custom dimensions'
        }
        return `${pkg.package_length} x ${pkg.package_width} x ${pkg.package_height} ${pkg.package_dimension_unit}`
    }

    const formatWeight = (pkg: PackagingData) => {
        if (pkg.package_weight === '.00' || pkg.package_weight === '0.00') {
            return 'Custom weight'
        }
        return `${pkg.package_weight} ${pkg.package_weight_unit}`
    }

    const handleRowClick = (packageId: string) => {
        navigate(`/packaging/${packageId}`)
    }

    return (
        <div>
            <Card className="w-full">
                <CardHeader className="flex flex-col gap-4 pb-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold">Packaging Management</h1>
                            <p className="text-small text-default-600">
                                {filteredData.length} packaging items found
                            </p>
                        </div>

                        <div className="flex gap-3 items-center">
                            {/* Filter Chips */}
                            <div className="flex gap-2">
                                <Chip
                                    size="sm"
                                    variant={filterType === 'all' ? 'solid' : 'flat'}
                                    color={filterType === 'all' ? 'primary' : 'default'}
                                    className="cursor-pointer"
                                    onClick={() => setFilterType('all')}
                                >
                                    All
                                </Chip>
                                <Chip
                                    size="sm"
                                    variant={filterType === 'active' ? 'solid' : 'flat'}
                                    color={filterType === 'active' ? 'success' : 'default'}
                                    className="cursor-pointer"
                                    onClick={() => setFilterType('active')}
                                >
                                    Active
                                </Chip>
                                <Chip
                                    size="sm"
                                    variant={filterType === 'inactive' ? 'solid' : 'flat'}
                                    color={filterType === 'inactive' ? 'danger' : 'default'}
                                    className="cursor-pointer"
                                    onClick={() => setFilterType('inactive')}
                                >
                                    Inactive
                                </Chip>
                            </div>

                            {/* Search Bar */}
                            <Input
                                placeholder="Search packaging..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                startContent={<Icon icon="solar:magnifer-bold" />}
                                variant="bordered"
                                className="max-w-md"
                                isClearable
                                onClear={() => setSearchQuery('')}
                            />

                            <Chip color="primary" variant="flat">
                                Total: {packagingData.length}
                            </Chip>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="overflow-visible p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" label="Loading packaging..." />
                        </div>
                    ) : (
                        <>
                            <Table
                                aria-label="Packaging table"
                                classNames={{
                                    wrapper: "min-h-[400px]",
                                    table: "min-w-full",
                                }}
                                isStriped
                                selectionMode="single"
                            >
                                <TableHeader>
                                    <TableColumn className="w-16">No.</TableColumn>
                                    <TableColumn className="min-w-[300px]">PACKAGE NAME</TableColumn>
                                    <TableColumn className="min-w-[300px]">REMARK</TableColumn>
                                    <TableColumn className="min-w-[250px]">DIMENSIONS (L x W x H)</TableColumn>
                                    <TableColumn className="w-40">WEIGHT</TableColumn>
                                    <TableColumn className="w-24">STATUS</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No packaging found">
                                    {currentItems.map((pkg, index) => (

                                        <TableRow
                                            key={pkg.packageID}
                                            className="cursor-pointer hover:bg-default-100"
                                            onClick={() => handleRowClick(pkg.packageID)}
                                        >
                                            {/* No */}
                                            <TableCell>
                                                <span className="text-sm font-medium text-default-600">
                                                    {startIndex + index + 1}
                                                </span>
                                            </TableCell>
                                            {/* PACKAGE NAME  */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-primary text-sm">
                                                        {pkg.packageTypeName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* REMARK */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    {pkg.remark && (
                                                        <span className="text-xs text-default-500">
                                                            {pkg.remark}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* DIMENSIONS  */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="solar:ruler-linear" width={16} className="text-default-400" />
                                                    <span className="text-sm text-default-600">
                                                        {formatDimensions(pkg)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* WEIGHT */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="solar:scale-linear" width={16} className="text-default-400" />
                                                    <span className="text-sm text-default-600">
                                                        {formatWeight(pkg)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* STATUS */}
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={pkg.active === '1' ? 'success' : 'danger'}
                                                >
                                                    {pkg.active === '1' ? 'Active' : 'Inactive'}
                                                </Chip>
                                            </TableCell>                                           
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center py-4">
                                    <Pagination
                                        total={totalPages}
                                        page={currentPage}
                                        onChange={setCurrentPage}
                                        showControls
                                        showShadow
                                        color="primary"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}

export default Packaging
