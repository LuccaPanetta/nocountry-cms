'use client'
import { Button } from "@/components/ui/button"
import Container from "@/components/ui/Container"
import { Input } from "@/components/ui/input"
import { ArrowDown, ArrowUp, Loader2, Search, SearchIcon, X } from "lucide-react"
import CardTestimony from "@/components/testimonials/CardTestimony"
import { useState, useMemo, useEffect } from "react"
import { usePaginatedTestimonials } from "@/hooks/usePaginationTestimonials"
import { PublicTestimonyResType } from "@/types/testimony-type"
import { CustomPagination } from "@/components/ui/CustomPagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetCategories } from "@/services/use-queries-service/categories-query-service"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/userStore"


const TestimonialsPage = () => {

  const [filteredCategory, setFilteredCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [orderValue, setOrderValue] = useState("desc-order")
  const router = useRouter();

  const { token } = useUserStore()

  //Order
  const options = [
    { value: "asc-order", label: "Fecha Asc", icon: ArrowUp },
    { value: "desc-order", label: "Fecha Desc", icon: ArrowDown },
    { value: "asc-views", label: "Visualizaciones Asc", icon: ArrowUp },
    { value: "desc-views", label: "Visualizaciones Desc", icon: ArrowDown },]


  const { page, totalPages, testimonials, pageSize, total, onPageChange, isLoading } =
    usePaginatedTestimonials({
      keyword,
      filteredCategory,
      orderValue,
    });

  // Cálculo rango visible
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const { data: categories } = useGetCategories();
  const categoryNames = categories?.map(cat => cat.name) || [];
  const hasActiveFilters = filteredCategory !== '' || keyword !== '';


  const searchedTestimonials = useMemo(() => {
    if (!keyword) return testimonials

    const lower = keyword.toLowerCase()

    return testimonials.filter((t: PublicTestimonyResType) => {
      return (
        t.content.toLowerCase().includes(lower) ||
        t.title.toLowerCase().includes(lower) ||
        t.author.toLowerCase().includes(lower) ||
        t.company.toLowerCase().includes(lower) ||
        t.multimedia?.type?.toLowerCase().includes(lower) ||
        t.tags.some(tag => tag.toLowerCase().includes(lower))
      )
    })
  }, [testimonials, keyword])

  const orderedTestimonials = useMemo(() => {
    if (!orderValue) return searchedTestimonials

    return [...searchedTestimonials].sort((a, b) => {
      switch (orderValue) {
        case "asc-order": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "desc-order": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "asc-views": return (a.engagement.views || 0) - (b.engagement.views || 0)
        case "desc-views": return (b.engagement.views || 0) - (a.engagement.views || 0)
        default:
          return 0
      }
    })
  }, [searchedTestimonials, orderValue])

  const clearAllFilters = () => {
    setFilteredCategory('');
    setKeyword('');
    onPageChange(1);
  };

  // Resetea página si cambia categoría, keyword o el orden
  useEffect(() => {
    onPageChange(1)
  }, [filteredCategory, keyword, orderValue])

  useEffect(() => {
  }, [orderValue])

  const handleCreatePermission = () => {
    if (!token) {
      return router.push('/login')
    }
    return router.push('/testimonials/create')
  }

   if (isLoading) {
    return (
      <div className="w-full p-8 bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Cargando testimonios...</p>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <Button
        className="w-1/2 md:w-1/4 lg:w-1/6 ml-auto"
        onClick={handleCreatePermission}
      >
        Crear testimonio
      </Button>

      <h2 className="text-lg text-secondary font-bold mt-5">Explora testimonios reales</h2>
      <p className="font-light mt-3">
        Descubrí experiencias auténticas compartidas por nuestra comunidad.
      </p>

      <section className="flex flex-col lg:flex-row lg:items-baseline-last lg:justify-between gap-4 mt-4 lg:mt-10">
        <div className="relative mt-8 md:w-1/2 lg:mt-0 lg:w-1/3 w-full">
          <Input
            className="peer ps-8 pe-2"
            placeholder="Buscar testimonio..."
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="text-muted-foreground/80 absolute inset-y-0 start-0 flex items-center ps-2">
            <SearchIcon size={16} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:w-2/3 gap-3">
          <h3 className="col-span-2 md:col-span-4">Búsqueda por categoría</h3>
          {categoryNames.map((cat) => (
            <Button
              key={cat}
              onClick={() => {
                console.log("Click en categoría:", cat)
                setFilteredCategory(cat)
              }}
              variant={filteredCategory === cat ? "ghost" : "outline"}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {hasActiveFilters && (
        <Button
          variant={"link"}
          className="mt-5 w-1/2 mx-auto lg:self-end lg:w-1/6 "
          onClick={clearAllFilters}
        >
          <X /> Borrar filtros
        </Button>
      )}

      <div className="flex flex-col md:flex-row mt-6 w-full md:items-center md:justify-between">
        <div className="grid grid-cols-2 justify-end items-center gap-3 md:order-2 w-full md:w-auto">
          <span className="col-span-1 md:text-end">Ordenar por:</span>
          <Select value={orderValue} onValueChange={(v) => {
            console.log("change:", v)
            setOrderValue(v)
          }}>
            <SelectTrigger className="w-full col-span-1 md:w-38 lg:w-50">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent> {options.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value} className="flex items-center gap-1">
                <Icon size={15} />
                {label}
              </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        {total > 0 && (
          <span className="text-sm text-muted-foreground mt-5">
            Mostrando {from}–{to} de {total} testimonios
          </span>
        )}
      </div>

      {!isLoading && searchedTestimonials.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 my-12">
          {orderedTestimonials.map((testimonial: PublicTestimonyResType) => (
            <CardTestimony key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            No se encontraron testimonios
          </h3>
        </div>
      )}

      {totalPages > 1 && (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </Container>
  )
}

export default TestimonialsPage
