'use client'
import { Button } from "@/components/ui/button"
import Container from "@/components/ui/Container"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectItem } from "@radix-ui/react-select"
import { ArrowDown, ArrowUp, Search, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"
import data from "@/constants/testimonials.json"

import { useRouter } from "next/navigation"
import CardTestimony from "@/components/testimonials/CardTestimony"

const categories = ["producto", "evento", "cliente", "industria"]

const page = () => {

  const [orderValue, setOrderValue] = useState("")
  const [testimonials, setTestimonials] = useState(data)
  const [filteredCategory, setFilteredCategory] = useState('');
  const [keyword, setKeyword] = useState('');

  const router = useRouter()

  const onSearchChange = (value: string) => {
    setKeyword(value)
  }

  const options = [
    { value: "asc-order", label: "Fecha Asc", icon: ArrowUp },
    { value: "desc-order", label: "Fecha Desc", icon: ArrowDown },
    { value: "asc-rating", label: "Rating Asc", icon: ArrowUp },
    { value: "desc-rating", label: "Rating Desc", icon: ArrowDown },
  ]

 
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((testimony) => {
      const matchesCategory = filteredCategory === '' || testimony.categoria === filteredCategory;
      const matchesSearch  = testimony.contenido.toLowerCase().includes(keyword.toLowerCase()) || testimony.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()));
      return matchesCategory && matchesSearch ;
    });
  }, [filteredCategory, keyword]);

  return (
    <Container>
      <Button onClick={()=>router.push('/testimonials/create')} className="w-38 flex self-end">Crear testimonio</Button>
      <h2 className="text-lg text-secondary font-bold mt-5">Explora testimonios reales</h2>
      <p className="font-light mt-3">Descubrí experiencias auténticas compartidas por nuestra comunidad. Usá el buscador o navegá por las páginas para encontrar los testimonios que mejor reflejen el impacto de nuestros proyectos y servicios.</p>
      <section className="flex flex-col lg:flex-row lg:items-baseline-last lg:justify-between gap-4 mt-4 lg:mt-10">
        <div className="relative mt-8 md:w-1/2 lg:mt-0 lg:w-1/3 w-full">
          <Input
            className="peer ps-8 pe-2"
            placeholder="Buscar testimonio..."
            type="search"
            value={keyword}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
            <SearchIcon size={16} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:w-2/3 gap-3">
          <h3 className="col-span-2 md:col-span-4">Búsqueda por categoría</h3>
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setFilteredCategory(cat)}
              variant={filteredCategory === cat ? "ghost" : "outline"}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>
      <div className="flex flex-col md:flex-row mt-6 w-full md:items-center">
        <div className="grid grid-cols-2 justify-end items-center gap-3 md:order-2 w-full md:w-auto">
          <span className="col-span-1">Ordenar por:</span>
          <Select value={orderValue} onValueChange={setOrderValue}>
            <SelectTrigger className="w-full col-span-1">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value} className="flex items-center gap-1">
                  <Icon size={15} />
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground mt-5 md:mt-0">Mostrando {filteredTestimonials.length} de {testimonials.length} testimonios</span>
      </div>

      {filteredTestimonials.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 my-12">
          {filteredTestimonials.map(testimony => (
           <CardTestimony key={testimony.id} testimony={testimony} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No se encontraron testimonios</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Intente ajustar su búsqueda o eliminar algunos filtros.
          </p>
         {/*  {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters}>
              Borrar filtros
            </Button>
          )} */}
        </div>
      )}

    </Container>
  )
}

export default page
