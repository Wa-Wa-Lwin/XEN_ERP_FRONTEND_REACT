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
import axios from 'axios'

interface MaterialData {
  material_code: string;
  description: string;
  type_name: string;
  part_revision: string;
  supplier_name: string;
  sku: string;
  part_no: string;
}

const Items = () => {
  const [materials, setMaterials] = useState<MaterialData[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(import.meta.env.VITE_APP_GET_PARCEL_ITEMS)
        if (response.data?.ret === 0 && response.data?.data) {
          setMaterials(response.data.data)
          setFilteredMaterials(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch materials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materials)
    } else {
      const filtered = materials.filter(material =>
        material.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.part_no.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMaterials(filtered)
    }
    setCurrentPage(1) // Reset to first page when searching
  }, [searchQuery, materials])

  // Pagination calculations
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredMaterials.slice(startIndex, endIndex)

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'assets':
        return 'primary'
      case 'it supplies':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div>
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Items & Materials</h1>
              <p className="text-small text-default-600">
                {filteredMaterials.length} items found
              </p>
            </div>
            {/* Search Bar */}
            <Input
                placeholder="Search materials by any field..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Icon icon="solar:magnifer-bold" />}
                variant="bordered"
                className="max-w-md"
                isClearable
                onClear={() => setSearchQuery('')}
            />
            <Chip color="primary" variant="flat">
              Total: {materials.length}
            </Chip>
          </div>
        </CardHeader>

        <CardBody className="overflow-visible p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" label="Loading materials..." />
            </div>
          ) : (
            <>
              <Table 
                aria-label="Materials table"
                classNames={{
                  wrapper: "min-h-[400px]",
                  table: "min-w-full",
                }}
                isStriped
                selectionMode="single"
              >
                <TableHeader>
                  <TableColumn className="w-16">No.</TableColumn>
                  <TableColumn className="w-48">MATERIAL CODE</TableColumn>
                  <TableColumn className="min-w-[300px]">DESCRIPTION</TableColumn>
                  <TableColumn className="w-32">TYPE</TableColumn>
                  <TableColumn className="min-w-[200px]">SKU</TableColumn>
                  <TableColumn className="min-w-[200px]">PART NO</TableColumn>
                  <TableColumn className="min-w-[250px]">SUPPLIER</TableColumn>
                  <TableColumn className="w-24">REVISION</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No materials found">
                  {currentItems.map((material, index) => (
                    <TableRow key={material.material_code}>
                      <TableCell>
                        <span className="text-sm font-medium text-default-600">
                          {startIndex + index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-primary text-sm">
                            {material.material_code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-md">
                          <span className="text-sm font-medium text-foreground truncate">
                            {material.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          variant="flat"
                          color={getTypeColor(material.type_name)}
                        >
                          {material.type_name}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {material.sku}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {material.part_no}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600 truncate max-w-[200px]">
                          {material.supplier_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-500">
                          {material.part_revision}
                        </span>
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

export default Items
