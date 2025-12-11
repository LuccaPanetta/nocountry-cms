"use client"

import { useGetPublicStatistics, useGetPublicStatisticsByCategories } from "@/services/use-queries-service/stats-query-service"
import { Card, CardContent } from "../ui/card"
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts"
import TitleSection from "../ui/TitleSection"
import { useCountUp } from "@/hooks/useCountUp"
import { Loader2 } from "lucide-react"
import SummaryCircle from "./summaryCircle"

type MetricsCategoryItem = {
    category: string
    count: number
    views: number
    embeds: number
    hasMultimedia: number
}

type ChartDataItem = {
    type: string
    value: number
}

export function MetricsSummary() {
    const { data: metrics, isLoading } = useGetPublicStatistics()
    const { data: metricsCategory, isLoading: isLoadingMetricsCategory } = useGetPublicStatisticsByCategories()

    const CATEGORY_COLORS: Record<string, string> = {
        producto: "#2B628C",
        evento: "#E57C56",
        industria: "#F7C873",
        cliente: "#1C2233"
    }

    // Datos de los charts
    const chartDataMap: Record<string, ChartDataItem[]> = {
        count: metricsCategory?.map((item: MetricsCategoryItem) => ({ type: item.category, value: item.count })) || [],
        views: metricsCategory?.map((item: MetricsCategoryItem) => ({ type: item.category, value: item.views })) || [],
        embeds: metricsCategory?.map((item: MetricsCategoryItem) => ({ type: item.category, value: item.embeds })) || [],
        hasMultimedia: metricsCategory?.map((item: MetricsCategoryItem) => ({ type: item.category, value: item.hasMultimedia })) || []
    }

    // Cards de resumen (círculos grandes)
    const summaryMetrics = [
        { label: "Testimonios", value: metrics?.totalTestimonials, color: "primary" },
        { label: "Vistas", value: metrics?.totalViews, color: "secondary" },
        { label: "Embeds", value: metrics?.totalEmbeds, color: "accent" },
        { label: "Con multimedia", value: metrics?.testimonialsWithMultimedia, color: "foreground" },
    ]

    // Configuración de los charts
    const chartConfigs = [
        { title: "Total de testimonios", dataKey: "count" },
        { title: "Cantidad de visualizaciones", dataKey: "views" },
        { title: "Total de embeds", dataKey: "embeds" },
        { title: "Contenido multimedia incluído", dataKey: "hasMultimedia" },
    ]

    if (isLoading || isLoadingMetricsCategory) {
        return (
            <div className="w-full p-8 bg-gray-50 flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                    <p className="text-gray-600">Cargando métricas...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="my-8 lg:my-12 ">
                <TitleSection text="Estadísticas generales" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 my-10">
                    {summaryMetrics.map(metric => (
                        <SummaryCircle
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            color={metric.color}
                        />
                    ))}
                </div>
            </div>
            <div className="my-12 lg:my-16 ">
                <TitleSection text="Estadísticas por categoría" />
                <p>Resumen de la actividad por categoría para entender el alcance de los testimonios.</p>

                <div className="w-full grid grid-cols md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 ">

                    {chartConfigs.map(chart => (
                        <Card key={chart.title}>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-3">{chart.title}</h3>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartDataMap[chart.dataKey]}
                                                dataKey="value"
                                                nameKey="type"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {chartDataMap[chart.dataKey].map(entry => (
                                                    <Cell key={entry.type} fill={CATEGORY_COLORS[entry.type]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    )
}
